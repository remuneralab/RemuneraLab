"""
Scraper de avisos laborales — Trabajando.cl
Estrategia: sitemap-ofertas.xml → filtro por keywords en slug → fetch páginas individuales.

Uso:
  python scripts/scraping_trabajando.py               # corre completo
  python scripts/scraping_trabajando.py --dry-run      # sin insertar en DB
  python scripts/scraping_trabajando.py --max-pages 50 # limita páginas a fetchear
"""

import sys, time, re, warnings, unicodedata, hashlib
from datetime import datetime
from xml.etree import ElementTree
sys.stdout.reconfigure(encoding="utf-8")
warnings.filterwarnings("ignore")

import requests
from bs4 import BeautifulSoup
from supabase import create_client

# ── Configuración ─────────────────────────────────────────────────────────────
SUPABASE_URL  = "https://fdogahabyuauglkfhzkj.supabase.co"
SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"
SITEMAP_URL   = "https://www.trabajando.cl/sitemap-ofertas.xml"
BATCH_SIZE    = 50
DRY_RUN       = "--dry-run" in sys.argv
MAX_PAGES     = int(next((sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == "--max-pages"), 300))
DELAY_SEG     = 1.5

# ── Keywords → (ciuo4, industria) ────────────────────────────────────────────
# Cada entrada: (lista de tokens que deben aparecer en el slug, ciuo4, industria)
KEYWORD_CIUO: list[tuple[list[str], int, str]] = [
    # Tecnología
    (["software"],                    2512, "Tecnología"),
    (["desarrollador"],               2513, "Tecnología"),
    (["programador"],                 2513, "Tecnología"),
    (["frontend"],                    2513, "Tecnología"),
    (["backend"],                     2512, "Tecnología"),
    (["fullstack"],                   2512, "Tecnología"),
    (["data", "scientist"],           2519, "Tecnología"),
    (["analista", "dato"],            2519, "Tecnología"),
    (["devops"],                      2522, "Tecnología"),
    (["ciberseguridad"],              2523, "Tecnología"),
    (["seguridad", "informatica"],    2523, "Tecnología"),
    (["product", "manager"],          2529, "Tecnología"),
    (["scrum", "master"],             2529, "Tecnología"),
    # Salud
    (["medico"],                      2211, "Salud"),
    (["enfermero"],                   2221, "Salud"),
    (["enfermera"],                   2221, "Salud"),
    (["kinesiologo"],                 2264, "Salud"),
    (["kinesiolog"],                  2264, "Salud"),
    (["nutricionista"],               2265, "Salud"),
    (["tecnico", "enfermeria"],       3221, "Salud"),
    (["psicologo"],                   2720, "Salud"),
    (["psicolog"],                    2720, "Salud"),
    # Finanzas
    (["contador"],                    2411, "Finanzas y Seguros"),
    (["contabilidad"],                2411, "Finanzas y Seguros"),
    (["analista", "financiero"],      2412, "Finanzas y Seguros"),
    (["analista", "credito"],         2413, "Finanzas y Seguros"),
    (["analista", "riesgo"],          2413, "Finanzas y Seguros"),
    # Construcción
    (["ingeniero", "civil"],          2142, "Construcción"),
    (["arquitecto"],                  2161, "Construcción"),
    (["prevencionista"],              3257, "Construcción"),
    (["prevencion", "riesgo"],        3257, "Construcción"),
    # Minería
    (["ingeniero", "mina"],           2146, "Minería"),
    (["geologo"],                     2146, "Minería"),
    (["geolog"],                      2146, "Minería"),
    # Educación
    (["profesor"],                    2330, "Educación"),
    (["docente"],                     2330, "Educación"),
    (["educadora", "parvulo"],        2341, "Educación"),
    (["educador", "parvulo"],         2341, "Educación"),
    # Retail / Comercio
    (["vendedor"],                    5221, "Retail / Comercio"),
    (["ejecutivo", "venta"],          3311, "Retail / Comercio"),
    (["cajero"],                      5230, "Retail / Comercio"),
    # Manufactura
    (["operario"],                    8211, "Manufactura / Industria"),
    (["tecnico", "industrial"],       3115, "Manufactura / Industria"),
    (["ingeniero", "industrial"],     2141, "Manufactura / Industria"),
    # Transporte y Logística
    (["conductor"],                   8331, "Transporte y Logística"),
    (["chofer"],                      8331, "Transporte y Logística"),
    # Servicios
    (["abogado"],                     2611, "Servicios"),
    (["recursos", "humanos"],         2423, "Servicios"),
    (["administrador", "empresa"],    2421, "Servicios"),
    (["disenador", "grafico"],        2166, "Servicios"),
    (["disenador", "grafico"],        2166, "Servicios"),
    # Agricultura
    (["ingeniero", "agronomo"],       2132, "Agricultura"),
    (["agronomo"],                    2132, "Agricultura"),
]

# ── Mapeo región Trabajando → nombre estándar ─────────────────────────────────
REGION_MAP = {
    "metropolitana":   "Metropolitana",
    "valparaiso":      "Valparaíso",
    "valparaíso":      "Valparaíso",
    "biobio":          "Biobío",
    "biobío":          "Biobío",
    "araucania":       "La Araucanía",
    "araucanía":       "La Araucanía",
    "los lagos":       "Los Lagos",
    "los rios":        "Los Ríos",
    "los ríos":        "Los Ríos",
    "maule":           "Maule",
    "ohiggins":        "O'Higgins",
    "o'higgins":       "O'Higgins",
    "antofagasta":     "Antofagasta",
    "atacama":         "Atacama",
    "coquimbo":        "Coquimbo",
    "tarapaca":        "Tarapacá",
    "tarapacá":        "Tarapacá",
    "arica":           "Arica y Parinacota",
    "nuble":           "Ñuble",
    "ñuble":           "Ñuble",
    "aysen":           "Aysén",
    "aysén":           "Aysén",
    "magallanes":      "Magallanes",
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def _norm(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto.lower()).encode("ascii", "ignore").decode()
    t = re.sub(r"\b(s\.?a\.?|spa|ltda\.?|eirl|srl|inc)\b", "", t)
    return " ".join(re.sub(r"[^a-z0-9 ]", "", t).split())

def slug_de_url(url: str) -> str:
    """Extrae el slug del aviso: '6070956-analista-de-datos' → 'analista de datos'."""
    parte = url.rstrip("/").split("/")[-1]
    parte = re.sub(r"^\d+-", "", parte)          # quita ID numérico inicial
    return parte.replace("-", " ")

def match_ciuo(url: str) -> tuple[int, str] | None:
    slug = _norm(slug_de_url(url))
    tokens = slug.split()
    for keywords, ciuo4, industria in KEYWORD_CIUO:
        if all(kw in slug for kw in keywords):
            return ciuo4, industria
    return None

def normalizar_region(texto: str) -> str | None:
    t = texto.lower()
    for clave, region in REGION_MAP.items():
        if clave in t:
            return region
    return None

def parsear_salario(texto: str) -> tuple[int | None, int | None]:
    numeros = re.findall(r"\$\s*([\d\.]+)(?:,\d+)?", texto)
    if not numeros:
        return None, None
    vals = [int(n.replace(".", "")) for n in numeros if int(n.replace(".", "")) > 50_000]
    if not vals:
        return None, None
    return min(vals), max(vals)

def normalizar_modalidad(texto: str) -> str:
    t = texto.lower()
    if "mixta" in t or "hibrido" in t or "híbrido" in t or "teletrabajo" in t and "presencial" in t:
        return "híbrido"
    if "teletrabajo" in t or "remoto" in t:
        return "remoto"
    return "presencial"

def calcular_hash_semantico(cargo: str, ciuo4: int, salario_mid: int | None, region: str | None) -> str:
    ventana = datetime.now().strftime("%Y-%m")
    sal_str = str(round(salario_mid / 50_000) * 50_000) if salario_mid else "sin-salario"
    clave   = f"{_norm(cargo)}|{ciuo4}|{sal_str}|{_norm(region or '')}|{ventana}"
    return hashlib.md5(clave.encode()).hexdigest()

# ── Sitemap ───────────────────────────────────────────────────────────────────
def fetch_sitemap_urls(session: requests.Session) -> list[str]:
    try:
        r = session.get(SITEMAP_URL, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"ERROR fetching sitemap: {e}")
        return []
    root = ElementTree.fromstring(r.content)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]

# ── Parser de página individual ───────────────────────────────────────────────
def fetch_aviso(session: requests.Session, url: str, ciuo4: int, industria: str) -> dict | None:
    try:
        r = session.get(url, timeout=15)
    except Exception as e:
        print(f"  ERROR {url}: {e}")
        return None
    if r.status_code != 200:
        return None

    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text(" ", strip=True)

    # Título: buscar h1, h2 con texto razonable
    cargo = ""
    for tag in ["h1", "h2"]:
        el = soup.find(tag)
        if el:
            t = el.get_text(strip=True)
            if len(t) > 5 and len(t) < 150:
                cargo = t
                break
    if not cargo:
        return None

    # Región: buscar en todo el texto
    region = None
    for frase in re.findall(r"[A-Za-záéíóúÁÉÍÓÚñÑ ,]+(?:de Santiago|del Maule|de Los Lagos|de Valparaíso|de Antofagasta|de Coquimbo|de Atacama|de Tarapacá|de Aysén|de Magallanes|de la Araucanía|del Biobío|de Los Ríos|de Ñuble|de Arica)", text):
        region = normalizar_region(frase)
        if region:
            break
    if not region:
        # Fallback: buscar palabras clave de región
        region = normalizar_region(text)

    # Salario
    sal_min, sal_max = parsear_salario(text)
    sal_mid = round((sal_min + sal_max) / 2) if sal_min else None

    # Modalidad: buscar patrones de teletrabajo/presencial
    modalidad = "presencial"
    for patron in ["mixta", "teletrabajo", "remoto", "híbrido", "hibrido"]:
        if patron in text.lower():
            modalidad = normalizar_modalidad(text)
            break

    # Fecha publicación: "Publicada ayer", "Hace X días", etc.
    fecha_texto = None
    m = re.search(r"(Publicad[ao]\s+\w+|Hace\s+\d+\s+d[ií]as?)", text, re.IGNORECASE)
    if m:
        fecha_texto = m.group(0)

    hash_sem = calcular_hash_semantico(cargo, ciuo4, sal_mid, region)

    return {
        "fuente":                  "Trabajando.cl",
        "cargo_original":          cargo,
        "ciuo4":                   ciuo4,
        "industria":               industria,
        "region":                  region,
        "salario_min":             sal_min,
        "salario_max":             sal_max,
        "salario_mid":             sal_mid,
        "modalidad":               modalidad,
        "url_aviso":               url.split("?")[0],
        "fecha_publicacion_texto": fecha_texto,
        "hash_semantico":          hash_sem,
        "vacantes_count":          1,
        "last_seen_at":            datetime.now().isoformat(),
    }

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Iniciando scraper Trabajando.cl — máx {MAX_PAGES} páginas\n")

    session = requests.Session()
    session.verify = False
    session.headers.update({
        "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-CL,es;q=0.9",
    })

    sb = None if DRY_RUN else create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Sitemap
    print("Descargando sitemap...")
    todas_urls = fetch_sitemap_urls(session)
    print(f"  {len(todas_urls)} URLs en sitemap\n")

    # 2. Filtrar por keywords
    candidatas: list[tuple[str, int, str]] = []
    for url in todas_urls:
        resultado = match_ciuo(url)
        if resultado:
            candidatas.append((url, resultado[0], resultado[1]))

    print(f"URLs que matchean keywords: {len(candidatas)}")
    candidatas = candidatas[:MAX_PAGES]
    print(f"A fetchear (máx {MAX_PAGES}):  {len(candidatas)}\n")

    # 3. Fetch y parse
    total_upserted    = 0
    total_con_salario = 0
    total_sin_region  = 0
    total_error       = 0
    hashes_vistos: dict[str, dict] = {}
    batch: list[dict] = []

    for i, (url, ciuo4, industria) in enumerate(candidatas, 1):
        aviso = fetch_aviso(session, url, ciuo4, industria)
        time.sleep(DELAY_SEG)

        if not aviso:
            total_error += 1
            continue

        if aviso["hash_semantico"] in hashes_vistos:
            hashes_vistos[aviso["hash_semantico"]]["vacantes_count"] += 1
            continue

        hashes_vistos[aviso["hash_semantico"]] = aviso

        if aviso["salario_mid"]:
            total_con_salario += 1
        if not aviso["region"]:
            total_sin_region += 1

        batch.append(aviso)

        if not DRY_RUN and len(batch) >= BATCH_SIZE:
            sb.table("registros_avisos").upsert(batch, on_conflict="url_aviso").execute()
            total_upserted += len(batch)
            print(f"  ✓ Batch de {len(batch)} upserted ({i}/{len(candidatas)} procesados)")
            batch.clear()

    if not DRY_RUN and batch:
        sb.table("registros_avisos").upsert(batch, on_conflict="url_aviso").execute()
        total_upserted += len(batch)
        print(f"  ✓ Batch final de {len(batch)} upserted")

    total = len(hashes_vistos)
    print(f"\n{'='*50}")
    print(f"URLs en sitemap:          {len(todas_urls)}")
    print(f"Matchearon keywords:      {len(candidatas)}")
    print(f"Errores de fetch:         {total_error}")
    print(f"Avisos únicos parseados:  {total}")
    print(f"Con salario explícito:    {total_con_salario} ({100*total_con_salario//max(total,1)}%)")
    print(f"Sin región detectada:     {total_sin_region}")
    if not DRY_RUN:
        print(f"Upserts enviados a DB:    {total_upserted}")
    print(f"{'[DRY RUN — nada insertado]' if DRY_RUN else 'Scraping completado.'}")

if __name__ == "__main__":
    main()
