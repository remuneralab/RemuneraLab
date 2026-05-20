"""
Scraping BNE (Bolsa Nacional de Empleo) — gastronomía.
Fuente: https://www.bne.cl
API:    GET https://www.bne.cl/data/ofertas/buscarListas

Obtiene avisos de empleo para keywords gastronómicos, extrae salario
de cada página de oferta, mapea cargo→CIUO4 via clasificador SABE,
y hace upsert en public.registros_avisos con fuente="BNE".

Uso:
  python scripts/scraping_bne.py                  # descarga + inserta
  python scripts/scraping_bne.py --dry-run        # muestra sin insertar (no raspa salarios)
  python scripts/scraping_bne.py --max-pages 3    # limita paginación por keyword
"""

import sys, os, re, time, hashlib, unicodedata
from datetime import datetime, timezone
from html import unescape
sys.stdout.reconfigure(encoding="utf-8")

import requests
from bs4 import BeautifulSoup
from supabase import create_client

# ── Configuración ──────────────────────────────────────────────────────────────
SUPABASE_URL = "https://fdogahabyuauglkfhzkj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"

BASE_URL    = "https://www.bne.cl"
API_OFERTAS = f"{BASE_URL}/data/ofertas/buscarListas"

DRY_RUN   = "--dry-run" in sys.argv
MAX_PAGES = next(
    (int(sys.argv[i + 1]) for i, a in enumerate(sys.argv) if a == "--max-pages"),
    99,
)
DELAY_SEG = 1.5
REG_ITEMS = 20   # resultados por página (máx BNE)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept":     "application/json, text/javascript, */*; q=0.01",
    "Referer":    "https://www.bne.cl/ofertas",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# ── Mapeo keyword → CIUO4 ─────────────────────────────────────────────────────
# CIUO-08.CL a 4 dígitos (gastronomía y oficios afines)
KEYWORD_CIUO: dict[str, int] = {
    "garzon":           5131,
    "garzón":           5131,
    "bartender":        5131,
    "barman":           5131,
    "barwoman":         5131,
    "sommelier":        5131,
    "maitre":           5131,
    "maître":           5131,
    "host":             5131,
    "hostess":          5131,
    "barista":          5131,
    "jefe de salon":    5131,
    "jefe salon":       5131,
    "supervisor salon": 5131,
    "cocinero":         5120,
    "chef":             5120,
    "chef de cuisine":  5120,
    "chef ejecutivo":   5120,
    "sous chef":        5120,
    "ayudante cocina":  5120,
    "auxiliar cocina":  5120,
    "asistente cocina": 5120,
    "prep cook":        5120,
    "pastelero":        7512,
    "repostero":        7512,
    "panadero":         7512,
    "aseo":             9112,
    "limpieza":         9112,
    "auxiliar aseo":    9112,
    "cajero":           5220,
    "recepcionista":    4222,
    "delivery":         9333,
    "repartidor":       9333,
    "despachador":      9333,
}

KEYWORDS_BUSQUEDA = [
    "garzon",
    "cocinero",
    "bartender",
    "chef",
    "ayudante cocina",
    "barista",
    "maitre",
    "pastelero",
    "aseo restaurante",
    "cajero restaurant",
]

# Normalización de nombres de región BNE → estándar RemuneraLab
REGION_MAP: dict[str, str] = {
    "region metropolitana":       "Metropolitana",
    "metropolitana":              "Metropolitana",
    "metro":                      "Metropolitana",
    "region de valparaiso":       "Valparaíso",
    "valparaiso":                 "Valparaíso",
    "region del biobio":          "Biobío",
    "biobio":                     "Biobío",
    "region de la araucania":     "La Araucanía",
    "araucania":                  "La Araucanía",
    "region de los lagos":        "Los Lagos",
    "los lagos":                  "Los Lagos",
    "region de los rios":         "Los Ríos",
    "los rios":                   "Los Ríos",
    "region del maule":           "Maule",
    "maule":                      "Maule",
    "region de coquimbo":         "Coquimbo",
    "coquimbo":                   "Coquimbo",
    "region de antofagasta":      "Antofagasta",
    "antofagasta":                "Antofagasta",
    "region de atacama":          "Atacama",
    "atacama":                    "Atacama",
    "region de tarapaca":         "Tarapacá",
    "tarapaca":                   "Tarapacá",
    "region de arica y parinacota": "Arica y Parinacota",
    "arica":                      "Arica y Parinacota",
    "region de o'higgins":        "O'Higgins",
    "ohiggins":                   "O'Higgins",
    "region de aysen":            "Aysén",
    "aysen":                      "Aysén",
    "region de magallanes":       "Magallanes",
    "magallanes":                 "Magallanes",
    "region de nuble":            "Ñuble",
    "nuble":                      "Ñuble",
}


# ── Helpers ───────────────────────────────────────────────────────────────────
def normalizar(texto: str) -> str:
    texto = texto.lower().strip()
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", texto)


def inferir_ciuo(titulo: str) -> int | None:
    t = normalizar(titulo)
    for kw, ciuo in KEYWORD_CIUO.items():
        if normalizar(kw) == t:
            return ciuo
    for kw, ciuo in KEYWORD_CIUO.items():
        if normalizar(kw) in t:
            return ciuo
    return None


def normalizar_region(raw: str) -> str:
    n = normalizar(raw)
    for k, v in REGION_MAP.items():
        if k in n:
            return v
    return raw.strip().title() if raw.strip() else "Nacional"


def parse_salario(texto: str) -> int | None:
    """
    Convierte strings tipo "539.000 – 700.000" o "$600.000" a entero CLP.
    Retorna la media si hay rango, o el valor único.
    """
    nums = re.findall(r"\d{1,3}(?:\.\d{3})+", texto)
    if not nums:
        return None
    vals = [int(n.replace(".", "")) for n in nums if 200_000 <= int(n.replace(".", "")) <= 10_000_000]
    if not vals:
        return None
    return sum(vals) // len(vals)


# ── Extracción de salario desde página de oferta ───────────────────────────────
def extraer_salario(codigo: str) -> int | None:
    url = f"{BASE_URL}/oferta/{codigo}"
    try:
        r = requests.get(url, headers={**HEADERS, "Accept": "text/html"}, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "html.parser")

        # Prioridad 1: div.col-sm-3 (campo de renta en layout BNE)
        for div in soup.find_all("div", class_=re.compile(r"col-sm-3", re.I)):
            text = div.get_text(" ", strip=True)
            if re.search(r"\d{3}\.\d{3}", text):
                sal = parse_salario(text)
                if sal:
                    return sal

        # Prioridad 2: cualquier elemento con etiqueta "renta" o "sueldo"
        for el in soup.find_all(string=re.compile(r"renta|sueldo|salario|remuneraci", re.I)):
            parent = el.find_parent()
            if parent:
                nxt = parent.find_next_sibling()
                if nxt:
                    sal = parse_salario(nxt.get_text())
                    if sal:
                        return sal

        # Prioridad 3: buscar patrón de rango en texto completo
        texto_completo = soup.get_text()
        m = re.search(
            r"\$?\s*(\d{1,3}(?:\.\d{3})+)\s*(?:–|-|a|hasta)\s*\$?\s*(\d{1,3}(?:\.\d{3})+)",
            texto_completo,
        )
        if m:
            a, b = int(m.group(1).replace(".", "")), int(m.group(2).replace(".", ""))
            if 200_000 <= a <= 10_000_000 and 200_000 <= b <= 10_000_000:
                return (a + b) // 2

    except Exception as e:
        print(f"    ⚠ salario {codigo}: {e}")
    return None


# ── Fetch API BNE ──────────────────────────────────────────────────────────────
def fetch_pagina(keyword: str, pagina: int) -> dict:
    params = {
        "mostrar":              "empleo",
        "textoLibre":           keyword,
        "numPaginaRecuperar":   pagina,
        "numResultadosPorPagina": REG_ITEMS,
        "clasificarYPaginar":   True,
    }
    r = SESSION.get(API_OFERTAS, params=params, timeout=20)
    r.raise_for_status()
    return r.json()


def extraer_items(data: dict) -> list[dict]:
    return data.get("paginaOfertas", {}).get("resultados", [])


def extraer_total(data: dict) -> int:
    po = data.get("paginaOfertas", {})
    return int(po.get("numResultadosTotal", 0) or 0)


# ── Scraping por keyword ───────────────────────────────────────────────────────
def scrape_keyword(keyword: str, max_pags: int) -> list[dict]:
    registros: list[dict] = []
    now_iso = datetime.now(timezone.utc).isoformat()
    print(f"\n  Keyword: '{keyword}'")

    for pag in range(1, max_pags + 1):
        try:
            data = fetch_pagina(keyword, pag)
        except Exception as e:
            print(f"    ✗ pag {pag}: {e}")
            break

        items = extraer_items(data)
        if not items:
            print(f"    Pag {pag}: vacía (fin)")
            break

        print(f"    Pag {pag}: {len(items)} avisos", end="", flush=True)
        time.sleep(DELAY_SEG)

        con_salario = 0
        for item in items:
            codigo = str(item.get("codigo") or "").strip()
            if not codigo:
                continue

            titulo     = unescape(str(item.get("titulo") or "")).strip()
            descripcion = unescape(str(item.get("descripcion") or ""))
            region_raw  = str(item.get("region") or "")
            fecha_raw   = str(item.get("fecha") or "")
            modalidad   = str(item.get("tipoOferta") or "")

            ciuo4    = inferir_ciuo(titulo)
            region   = normalizar_region(region_raw)
            hash_sem = hashlib.md5(f"bne-{codigo}-{fecha_raw}".encode()).hexdigest()[:16]

            salario_mid = None
            if not DRY_RUN:
                # 1. Intentar extraer salario del texto de descripción (más rápido)
                salario_mid = parse_salario(descripcion)
                # 2. Si no hay, buscar en la página individual
                if not salario_mid:
                    salario_mid = extraer_salario(codigo)
                    time.sleep(DELAY_SEG)
                if salario_mid:
                    con_salario += 1

            registros.append({
                "cargo_original":          titulo,
                "ciuo4":                   ciuo4,
                "industria":               "Gastronomía / Restaurantes",
                "region":                  region,
                "salario_mid":             salario_mid,
                "url_aviso":               f"{BASE_URL}/oferta/{codigo}",
                "modalidad":               modalidad or None,
                "experiencia_anios":       None,
                "fecha_publicacion_texto": fecha_raw,
                "fuente":                  "BNE",
                "hash_semantico":          hash_sem,
                "last_seen_at":            now_iso,
            })

        print(f" | salarios: {con_salario} | acum: {len(registros)}")

        total = extraer_total(data)
        if total and len(registros) >= total:
            print(f"    Total declarado alcanzado ({total})")
            break

    return registros


# ── Upsert Supabase ────────────────────────────────────────────────────────────
def upsert_avisos(registros: list[dict]):
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Dedup en memoria por hash_semantico
    vistos: set[str] = set()
    unicos: list[dict] = []
    for r in registros:
        h = r["hash_semantico"]
        if h not in vistos:
            vistos.add(h)
            unicos.append(r)

    print(f"\nUnicos tras dedup: {len(unicos)} (descartados: {len(registros) - len(unicos)})")

    BATCH = 100
    total = 0
    for i in range(0, len(unicos), BATCH):
        batch = unicos[i : i + BATCH]
        sb.table("registros_avisos").upsert(
            batch, on_conflict="url_aviso"
        ).execute()
        total += len(batch)
        print(f"  Upsert {total}/{len(unicos)}")

    print(f"  ✓ {total} avisos BNE en registros_avisos")


# ── Main ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== Scraping BNE — Gastronomía ===")
    print(f"Modo: {'DRY-RUN (sin salarios ni DB)' if DRY_RUN else 'PRODUCCIÓN'}")
    print(f"Max páginas por keyword: {MAX_PAGES}\n")

    # Establecer sesión con cookies antes de consultar la API
    SESSION.get(f"{BASE_URL}/ofertas", timeout=15)

    todos: list[dict] = []
    for kw in KEYWORDS_BUSQUEDA:
        parcial = scrape_keyword(kw, MAX_PAGES)
        todos.extend(parcial)

    print(f"\nTotal bruto acumulado: {len(todos)} avisos")
    con_ciuo = sum(1 for r in todos if r["ciuo4"] is not None)
    con_sal  = sum(1 for r in todos if r["salario_mid"] is not None)
    print(f"  Con CIUO mapeado: {con_ciuo} ({con_ciuo/max(len(todos),1)*100:.0f}%)")
    print(f"  Con salario:      {con_sal} ({con_sal/max(len(todos),1)*100:.0f}%)")

    if DRY_RUN:
        print("\nEjemplos (primeros 8):")
        for r in todos[:8]:
            print(
                f"  {r['cargo_original'][:35]:<35}"
                f" ciuo={str(r['ciuo4']):<5}"
                f" region={r['region']:<20}"
                f" sal={r['salario_mid']}"
            )
        print("\n[DRY-RUN] Fin. No se insertó nada.")
    else:
        upsert_avisos(todos)

    print("\nDone.")
