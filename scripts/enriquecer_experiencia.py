"""
Enriquece registros_avisos con experiencia_anios.
Paso 1 — Extracción regex: visita cada URL y extrae el campo estructurado de Computrabajo.
Paso 2 — Imputación k-NN:  para los que quedaron NULL, busca vecinos con mismo ciuo4
          y salario similar (±20%, amplía a ±30% si hay pocos vecinos) y asigna la mediana.
          Los imputados quedan marcados con exp_imputada = true.

Uso:
  python scripts/enriquecer_experiencia.py             # paso 1 + paso 2
  python scripts/enriquecer_experiencia.py --dry-run   # sin actualizar DB
  python scripts/enriquecer_experiencia.py --limit 50  # limita registros del paso 1
  python scripts/enriquecer_experiencia.py --solo-knn  # solo paso 2 (sin scraping)

SQL requerido (correr en Supabase SQL Editor antes de ejecutar):
  ALTER TABLE registros_avisos ADD COLUMN IF NOT EXISTS experiencia_anios smallint;
  ALTER TABLE registros_avisos ADD COLUMN IF NOT EXISTS exp_imputada boolean DEFAULT false;
"""

import sys, re, time, warnings
sys.stdout.reconfigure(encoding="utf-8")
warnings.filterwarnings("ignore")

import requests
from bs4 import BeautifulSoup
from supabase import create_client

SUPABASE_URL = "https://fdogahabyuauglkfhzkj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"

DRY_RUN  = "--dry-run" in sys.argv
SOLO_KNN = "--solo-knn" in sys.argv
LIMIT    = int(next((sys.argv[i+1] for i, a in enumerate(sys.argv) if a == "--limit"), 9999))
DELAY    = 1.2  # segundos entre requests

# ── Extracción de experiencia ──────────────────────────────────────────────────
# Computrabajo publica un campo estructurado en cada aviso:
# "Universitaria / I.P. / C.F.T.  3 años de experiencia  Palabras clave: ..."
# "I.P. / C.F.T.  Menos de 1 año de experiencia  Palabras clave: ..."
# Usamos ese bloque porque es generado por Computrabajo, no texto libre del empleador.

# Patrón 1: bloque estructurado de Computrabajo (antes de "Palabras clave")
PAT_STRUCT = re.compile(
    r"(?:Universitaria|I\.P\.|C\.F\.T\.|Bachillerato|Ense[ñn]anza)[^\n]{0,60}"
    r"(?:Menos de (\d+)|Entre \d+ a (\d+)|(\d+))\s+a[ñn]os?\s+de\s+experiencia"
    r"[^\n]{0,60}Palabras clave",
    re.IGNORECASE | re.DOTALL,
)

# Patrón 2: "Menos de 1 año de experiencia" standalone (antes de Palabras clave)
PAT_MENOS = re.compile(
    r"Menos de (\d+)\s+a[ñn]os?\s+de\s+experiencia[^\n]{0,60}Palabras clave",
    re.IGNORECASE,
)

# Patrón 3: sección de requisitos explícita — ej. "Experiencia: 2 años"
PAT_REQ = re.compile(
    r"Experiencia\s*:\s*(?:Entre\s+\d+\s+a\s+)?(\d+)\s+a[ñn]os?",
    re.IGNORECASE,
)

# Patrón 4: "X años de experiencia en [cargo/área]" en la sección de requisitos
# Limitado a valores razonables (1–20) para evitar "30 años de mercado"
PAT_CUERPO = re.compile(
    r"(?:m[ií]nimo|m[ií]nima|al menos|requiere?|excluyente)[^.]{0,60}"
    r"(\d+)\s+a[ñn]os?\s+de\s+experiencia",
    re.IGNORECASE,
)


def extraer_experiencia(html: str) -> int | None:
    """Retorna años de experiencia requeridos, o None si no se puede determinar."""
    text = BeautifulSoup(html, "html.parser").get_text(" ", strip=True)

    # Prioridad 1: campo estructurado de Computrabajo
    m = PAT_STRUCT.search(text)
    if m:
        # Captura: grupo 1=Menos de X, grupo 2=Entre N a X, grupo 3=X años exactos
        valor = int(m.group(1) or m.group(2) or m.group(3))
        return max(0, valor - 1) if m.group(1) else valor  # "Menos de 1" → 0

    # Prioridad 2: "Menos de X año" antes de Palabras clave
    m = PAT_MENOS.search(text)
    if m:
        return max(0, int(m.group(1)) - 1)

    # Prioridad 3: sección de requisitos explícita
    m = PAT_REQ.search(text)
    if m:
        v = int(m.group(1))
        return v if 0 <= v <= 25 else None

    # Prioridad 4: cuerpo con calificador fuerte (mínimo / al menos / excluyente)
    m = PAT_CUERPO.search(text)
    if m:
        v = int(m.group(1))
        return v if 0 <= v <= 20 else None

    return None


# ── Imputación k-NN ───────────────────────────────────────────────────────────
def imputar_por_vecinos(sb, dry_run: bool, min_vecinos: int = 5) -> None:
    """
    Segunda pasada: para registros con salario pero sin experiencia extraída,
    busca vecinos con mismo ciuo4 y salario similar y asigna la mediana.
    Tolerancia: intenta ±20%, amplía a ±30% si no alcanza min_vecinos.
    """
    # Cargar todos los registros que SÍ tienen experiencia (conjunto de referencia)
    ref_raw = sb.table("registros_avisos") \
                .select("ciuo4, salario_mid, experiencia_anios") \
                .gt("salario_mid", 0) \
                .not_.is_("experiencia_anios", "null") \
                .execute().data

    # Cargar registros a imputar
    nulos = sb.table("registros_avisos") \
              .select("id, cargo_original, ciuo4, salario_mid") \
              .gt("salario_mid", 0) \
              .is_("experiencia_anios", "null") \
              .execute().data

    print(f"\n{'[DRY RUN] ' if dry_run else ''}Imputación k-NN")
    print(f"  Referencia: {len(ref_raw)} registros con experiencia conocida")
    print(f"  Candidatos: {len(nulos)} registros sin experiencia\n")

    imputados = sin_vecinos = 0

    for row in nulos:
        ciuo4 = row["ciuo4"]
        sal   = row["salario_mid"]
        rid   = row["id"]

        if not ciuo4 or not sal:
            sin_vecinos += 1
            continue

        exp_vecinos: list[int] = []
        tolerancia_usada = 0.0

        for tolerancia in [0.20, 0.30]:
            exp_vecinos = [
                r["experiencia_anios"] for r in ref_raw
                if r["ciuo4"] == ciuo4
                and r["salario_mid"] is not None
                and abs(r["salario_mid"] - sal) / sal <= tolerancia
            ]
            tolerancia_usada = tolerancia
            if len(exp_vecinos) >= min_vecinos:
                break

        if len(exp_vecinos) >= min_vecinos:
            mediana = sorted(exp_vecinos)[len(exp_vecinos) // 2]
            tol_str = f"±{int(tolerancia_usada*100)}%"
            print(f"  {row['cargo_original'][:38]:38} sal={sal:>9,}  n={len(exp_vecinos):>3} ({tol_str}) → {mediana} años")
            imputados += 1
            if not dry_run:
                sb.table("registros_avisos").update({
                    "experiencia_anios": mediana,
                    "exp_imputada":      True,
                }).eq("id", rid).execute()
        else:
            sin_vecinos += 1

    print(f"\n  Imputados:           {imputados}")
    print(f"  Sin vecinos suf.:    {sin_vecinos}  (quedan NULL)")
    if dry_run:
        print("  [DRY RUN — nada actualizado]")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    if SOLO_KNN:
        imputar_por_vecinos(sb, DRY_RUN)
        return

    # ── Paso 1: extracción regex vía scraping ─────────────────────────────────
    res = sb.table("registros_avisos") \
            .select("id, url_aviso, cargo_original, salario_mid, ciuo4") \
            .gt("salario_mid", 0) \
            .is_("experiencia_anios", "null") \
            .limit(LIMIT) \
            .execute()

    registros = res.data
    total = len(registros)
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Paso 1 — Extracción regex: {total} registros\n")

    session = requests.Session()
    session.verify = False
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-CL,es;q=0.9",
    })

    ok = sin_dato = errores = 0

    for i, row in enumerate(registros, 1):
        url   = row["url_aviso"]
        cargo = row["cargo_original"]
        rid   = row["id"]

        try:
            r = session.get(url, timeout=12)
            if r.status_code != 200:
                errores += 1
                print(f"  [{i}/{total}] HTTP {r.status_code} — {cargo[:35]}")
                time.sleep(DELAY)
                continue

            exp = extraer_experiencia(r.text)

            if exp is not None:
                ok += 1
                print(f"  [{i}/{total}] {cargo[:40]:40} → {exp} años")
                if not DRY_RUN:
                    sb.table("registros_avisos").update({"experiencia_anios": exp}).eq("id", rid).execute()
            else:
                sin_dato += 1
                print(f"  [{i}/{total}] {cargo[:40]:40} → (no encontrado)")

        except Exception as e:
            errores += 1
            print(f"  [{i}/{total}] ERROR {type(e).__name__}: {str(e)[:50]}")

        time.sleep(DELAY)

    print(f"\n{'='*50}")
    print(f"Paso 1 — Procesados:      {total}")
    print(f"         Con experiencia: {ok}  ({100*ok//max(total,1)}%)")
    print(f"         Sin dato:        {sin_dato}")
    print(f"         Errores HTTP:    {errores}")
    if DRY_RUN:
        print("         [DRY RUN — nada actualizado]")

    # ── Paso 2: imputación k-NN para los que quedaron NULL ────────────────────
    imputar_por_vecinos(sb, DRY_RUN)


if __name__ == "__main__":
    main()
