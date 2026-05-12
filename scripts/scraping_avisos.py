"""
Scraper de avisos laborales — Computrabajo Chile.
Extrae cargo, región, salario (cuando disponible) y sube a tabla registros_avisos.

Uso:
  python scripts/scraping_avisos.py               # corre completo
  python scripts/scraping_avisos.py --dry-run      # sin insertar en DB
  python scripts/scraping_avisos.py --max-pages 2  # limita páginas por búsqueda
  python scripts/scraping_avisos.py --create-table # imprime SQL para crear la tabla

SQL para crear la tabla en Supabase (copiar al SQL Editor):
  CREATE TABLE IF NOT EXISTS registros_avisos (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    fuente                text NOT NULL DEFAULT 'Computrabajo',
    cargo_original        text NOT NULL,
    ciuo4                 smallint,
    industria             text,
    region                text,
    salario_min           integer,
    salario_max           integer,
    salario_mid           integer,
    modalidad             text,
    url_aviso             text UNIQUE,
    fecha_publicacion_texto text,
    hash_semantico        text UNIQUE,
    vacantes_count        smallint DEFAULT 1,
    ano_scraping          smallint DEFAULT EXTRACT(YEAR FROM NOW())::smallint,
    created_at            timestamptz DEFAULT now()
  );

  -- Migraciones si la tabla ya existe:
  ALTER TABLE registros_avisos ADD COLUMN IF NOT EXISTS hash_semantico text;
  ALTER TABLE registros_avisos ADD COLUMN IF NOT EXISTS vacantes_count smallint DEFAULT 1;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_hash_semantico ON registros_avisos(hash_semantico)
    WHERE hash_semantico IS NOT NULL;
"""

import sys, time, re, warnings, unicodedata, hashlib
from datetime import datetime
sys.stdout.reconfigure(encoding="utf-8")
warnings.filterwarnings("ignore")

import requests
from bs4 import BeautifulSoup
from supabase import create_client

# ── Configuración ─────────────────────────────────────────────────────────────
SUPABASE_URL = "https://fdogahabyuauglkfhzkj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"
BATCH_SIZE  = 100
DRY_RUN     = "--dry-run" in sys.argv
MAX_PAGES   = int(next((sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == "--max-pages"), 3))
DELAY_SEG   = 1.5  # segundos entre requests al portal

if "--create-table" in sys.argv:
    print(__doc__)
    sys.exit(0)

# ── Búsquedas: (slug-en-URL, ciuo4, industria) ───────────────────────────────
BUSQUEDAS = [
    # Tecnología
    ("ingeniero-de-software",       2512, "Tecnología"),
    ("desarrollador-web",           2513, "Tecnología"),
    ("data-scientist",              2519, "Tecnología"),
    ("analista-de-datos",           2519, "Tecnología"),
    ("devops",                      2522, "Tecnología"),
    ("product-manager",             2529, "Tecnología"),
    ("ciberseguridad",              2523, "Tecnología"),
    # Salud
    ("medico",                      2211, "Salud"),
    ("enfermero",                   2221, "Salud"),
    ("kinesiologo",                 2264, "Salud"),
    ("nutricionista",               2265, "Salud"),
    ("tecnico-en-enfermeria",       3221, "Salud"),
    ("psicologo",                   2720, "Salud"),
    # Finanzas
    ("contador",                    2411, "Finanzas y Seguros"),
    ("analista-financiero",         2412, "Finanzas y Seguros"),
    ("analista-de-credito",         2413, "Finanzas y Seguros"),
    # Construcción
    ("ingeniero-civil",             2142, "Construcción"),
    ("arquitecto",                  2161, "Construcción"),
    ("prevencionista-de-riesgos",   3257, "Construcción"),
    # Minería
    ("ingeniero-de-minas",          2146, "Minería"),
    ("geologo",                     2146, "Minería"),
    # Educación
    ("profesor",                    2330, "Educación"),
    ("educadora-de-parvulos",       2341, "Educación"),
    # Retail / Comercio
    ("vendedor",                    5221, "Retail / Comercio"),
    ("ejecutivo-de-ventas",         3311, "Retail / Comercio"),
    ("cajero",                      5230, "Retail / Comercio"),
    # Manufactura
    ("operario",                    8211, "Manufactura / Industria"),
    ("tecnico-industrial",          3115, "Manufactura / Industria"),
    ("ingeniero-industrial",        2141, "Manufactura / Industria"),
    # Transporte y Logística
    ("conductor",                   8331, "Transporte y Logística"),
    ("chofer",                      8331, "Transporte y Logística"),
    # Servicios / otros profesionales
    ("abogado",                     2611, "Servicios"),
    ("recursos-humanos",            2423, "Servicios"),
    ("administrador-de-empresas",   2421, "Servicios"),
    ("diseñador-grafico",           2166, "Servicios"),
    # Agricultura
    ("ingeniero-agronomo",          2132, "Agricultura"),
]

# ── Mapeo región Computrabajo → nombre estándar ───────────────────────────────
REGION_MAP = {
    "metropolitana":  "Metropolitana",
    "valparaíso":     "Valparaíso",
    "valparaiso":     "Valparaíso",
    "biobío":         "Biobío",
    "biobio":         "Biobío",
    "araucanía":      "La Araucanía",
    "araucania":      "La Araucanía",
    "los lagos":      "Los Lagos",
    "los ríos":       "Los Ríos",
    "los rios":       "Los Ríos",
    "maule":          "Maule",
    "o'higgins":      "O'Higgins",
    "ohiggins":       "O'Higgins",
    "antofagasta":    "Antofagasta",
    "atacama":        "Atacama",
    "coquimbo":       "Coquimbo",
    "tarapacá":       "Tarapacá",
    "tarapaca":       "Tarapacá",
    "arica":          "Arica y Parinacota",
    "ñuble":          "Ñuble",
    "nuble":          "Ñuble",
    "aysén":          "Aysén",
    "aysen":          "Aysén",
    "magallanes":     "Magallanes",
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def normalizar_region(texto: str) -> str | None:
    t = texto.lower()
    for clave, region in REGION_MAP.items():
        if clave in t:
            return region
    return None

def parsear_salario(texto: str) -> tuple[int | None, int | None]:
    """'$ 1.000.000,00' → (1000000, 1000000) | '$ 800.000 - $ 1.200.000' → (800000, 1200000)"""
    numeros = re.findall(r"\$\s*([\d\.]+)(?:,\d+)?", texto)
    if not numeros:
        return None, None
    vals = [int(n.replace(".", "")) for n in numeros]
    if len(vals) >= 2:
        return min(vals), max(vals)
    return vals[0], vals[0]

def normalizar_modalidad(texto: str) -> str:
    t = texto.lower()
    if "presencial y remoto" in t or "híbrido" in t or "hibrido" in t:
        return "híbrido"
    if "remoto" in t or "teletrabajo" in t:
        return "remoto"
    return "presencial"

# ── Hash semántico ────────────────────────────────────────────────────────────
def _norm(texto: str) -> str:
    """Normaliza texto para comparación: minúsculas, sin tildes, sin sufijos legales."""
    t = unicodedata.normalize("NFKD", texto.lower()).encode("ascii", "ignore").decode()
    t = re.sub(r"\b(s\.?a\.?|spa|ltda\.?|eirl|srl|inc)\b", "", t)
    return " ".join(re.sub(r"[^a-z0-9 ]", "", t).split())

def calcular_hash_semantico(cargo: str, ciuo4: int, salario_mid: int | None, region: str | None) -> str:
    """
    Identidad del aviso: cargo + ciuo4 + salario (redondeado a $50k) + región + mes de scraping.
    Dos portales que publican el mismo puesto en el mismo mes → mismo hash.
    """
    ventana  = datetime.now().strftime("%Y-%m")
    sal_str  = str(round(salario_mid / 50_000) * 50_000) if salario_mid else "sin-salario"
    clave    = f"{_norm(cargo)}|{ciuo4}|{sal_str}|{_norm(region or '')}|{ventana}"
    return hashlib.md5(clave.encode()).hexdigest()

# ── Scraping ─────────────────────────────────────────────────────────────────
def scrape_pagina(session: requests.Session, slug: str, pagina: int) -> list[dict]:
    url = f"https://cl.computrabajo.com/empleos-de-{slug}?p={pagina}"
    try:
        r = session.get(url, timeout=15)
    except Exception as e:
        print(f"  ERROR request: {e}")
        return []

    if r.status_code != 200:
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    cards = soup.find_all("article", class_=lambda c: c and "box_offer" in c)

    resultados = []
    for card in cards:
        # Cargo
        title_tag = card.select_one("h2 a.js-o-link")
        if not title_tag:
            continue
        cargo = title_tag.get_text(strip=True)

        # URL del aviso (para deduplicación)
        href = title_tag.get("href", "")
        url_aviso = "https://cl.computrabajo.com" + href if href.startswith("/") else href
        url_aviso = url_aviso.split("#")[0]  # quita fragmento de tracking

        # Región
        loc_tag = card.select_one("p.fs16.fc_base.mt5 span.mr10")
        region = normalizar_region(loc_tag.get_text(strip=True)) if loc_tag else None

        # Salario
        salary_icon = card.find("span", class_="icon i_salary")
        sal_min = sal_max = None
        if salary_icon and salary_icon.parent:
            sal_min, sal_max = parsear_salario(salary_icon.parent.get_text(strip=True))

        # Modalidad
        modal_icon = card.find("span", class_="icon i_home_office")
        modalidad = normalizar_modalidad(modal_icon.parent.get_text(strip=True)) if modal_icon and modal_icon.parent else "presencial"

        # Fecha publicación (texto)
        fecha_tag = card.find("p", class_="fs13 fc_aux mt15")
        fecha_texto = fecha_tag.get_text(strip=True) if fecha_tag else None

        resultados.append({
            "cargo":        cargo,
            "url_aviso":    url_aviso,
            "region":       region,
            "sal_min":      sal_min,
            "sal_max":      sal_max,
            "modalidad":    modalidad,
            "fecha_texto":  fecha_texto,
        })

    return resultados

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Iniciando scraper — {len(BUSQUEDAS)} búsquedas × máx {MAX_PAGES} páginas\n")

    session = requests.Session()
    session.verify = False
    session.headers.update({
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-CL,es;q=0.9",
    })

    sb = None if DRY_RUN else create_client(SUPABASE_URL, SUPABASE_KEY)

    total_insertados = 0
    total_con_salario = 0
    total_dedup = 0
    batch: list[dict] = []
    # hash_semantico → registro; permite acumular vacantes_count en la misma corrida
    hashes_vistos: dict[str, dict] = {}
    # URLs vistas: guardia secundaria para el mismo aviso en distintas búsquedas
    urls_vistos: set[str] = set()

    for slug, ciuo4, industria in BUSQUEDAS:
        print(f"→ {slug} (CIUO {ciuo4} | {industria})")
        avisos_busqueda = 0

        for pagina in range(1, MAX_PAGES + 1):
            resultados = scrape_pagina(session, slug, pagina)
            if not resultados:
                break

            for r in resultados:
                if r["sal_min"] and r["sal_min"] < 50_000:
                    continue  # valor irreal (probablemente por hora o semanal)

                sal_mid = round((r["sal_min"] + r["sal_max"]) / 2) if r["sal_min"] else None
                hash_sem = calcular_hash_semantico(r["cargo"], ciuo4, sal_mid, r["region"])

                if hash_sem in hashes_vistos:
                    # Mismo puesto ya visto en esta corrida → sumar vacante
                    hashes_vistos[hash_sem]["vacantes_count"] += 1
                    total_dedup += 1
                    continue

                if r["url_aviso"] in urls_vistos:
                    # Misma URL en búsqueda distinta (distinto ciuo4 asignado) → saltar
                    total_dedup += 1
                    continue

                urls_vistos.add(r["url_aviso"])

                if r["sal_min"]:
                    total_con_salario += 1

                registro = {
                    "fuente":                  "Computrabajo",
                    "cargo_original":          r["cargo"],
                    "ciuo4":                   ciuo4,
                    "industria":               industria,
                    "region":                  r["region"],
                    "salario_min":             r["sal_min"],
                    "salario_max":             r["sal_max"],
                    "salario_mid":             sal_mid,
                    "modalidad":               r["modalidad"],
                    "url_aviso":               r["url_aviso"],
                    "fecha_publicacion_texto":  r["fecha_texto"],
                    "hash_semantico":           hash_sem,
                    "vacantes_count":           1,
                }
                hashes_vistos[hash_sem] = registro
                batch.append(registro)
                avisos_busqueda += 1

                if not DRY_RUN and len(batch) >= BATCH_SIZE:
                    sb.table("registros_avisos").upsert(batch, on_conflict="url_aviso").execute()
                    total_insertados += len(batch)
                    print(f"  ✓ Batch de {len(batch)} registros insertado")
                    batch.clear()

            time.sleep(DELAY_SEG)

        print(f"  {avisos_busqueda} avisos únicos scrapeados\n")

    # Flush batch final (con vacantes_count ya acumulado)
    if not DRY_RUN and batch:
        sb.table("registros_avisos").upsert(batch, on_conflict="url_aviso").execute()
        total_insertados += len(batch)
        print(f"  ✓ Batch final de {len(batch)} registros insertado")

    total_scrapeados = len(hashes_vistos)
    print(f"\n{'='*50}")
    print(f"Avisos scrapeados (bruto):  {total_scrapeados + total_dedup}")
    print(f"Duplicados fusionados:      {total_dedup}")
    print(f"Avisos únicos (por hash):   {total_scrapeados}")
    print(f"Con salario explícito:      {total_con_salario} ({100*total_con_salario//max(total_scrapeados,1)}%)")
    multi = sum(1 for r in hashes_vistos.values() if r["vacantes_count"] > 1)
    if multi:
        print(f"Con múltiples vacantes:     {multi} avisos")
    if not DRY_RUN:
        print(f"Registros en DB:            {total_insertados}")
    print(f"{'[DRY RUN — nada insertado]' if DRY_RUN else 'Scraping completado.'}")

if __name__ == "__main__":
    main()
