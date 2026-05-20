import sys, warnings, re, time
sys.stdout.reconfigure(encoding="utf-8")
warnings.filterwarnings("ignore")
import requests
from bs4 import BeautifulSoup

s = requests.Session()
s.verify = False
s.headers.update({"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36"})

PAT     = re.compile(r"Sueldo promedio \$([\d.]+) Mensuales \$([\d.]+) \$([\d.]+)")
MUESTRAS = re.compile(r"aproximadamente ([\d.,]+) muestras")

SLUGS = [
    # Tech
    "ingeniero-software", "programador", "desarrollador", "data-scientist", "devops",
    "analista-de-sistemas", "soporte-tecnico",
    # Salud
    "medico", "enfermera", "kinesiologo", "nutricionista", "psicologo",
    "farmaceutico", "tens", "tecnico-enfermeria-tens", "matrona",
    # Finanzas
    "contador", "analista-financiero", "analista-contable", "auditor",
    "ejecutivo-bancario", "analista-credito",
    # Construcción
    "ingeniero-civil", "arquitecto", "prevencionista-riesgos",
    "maestro-mayor", "inspector-obras",
    # Minería
    "ingeniero-minas", "geologo",
    # Educación
    "profesor", "educadora-parvulos", "docente",
    # Retail / Ventas
    "vendedor", "cajero", "asesor-comercial-vendedor", "ejecutivo-comercial-ventas",
    "ejecutivo-atencion-cliente",
    # Manufactura / Logística
    "bodeguero", "operario", "tecnico-mecanico", "tecnico-industrial",
    # Transporte
    "conductor", "chofer",
    # Servicios
    "abogado", "administrador-de-empresas", "recursos-humanos",
    "asistente-administrativo", "analista-control-gestion",
    "ingeniero-industrial", "ingeniero-comercial",
]

results = []
for slug in SLUGS:
    r = s.get("https://www.trabajando.cl/informes-de-sueldo/" + slug, timeout=8)
    if r.status_code != 200:
        print(f"  {r.status_code}  {slug}")
        time.sleep(0.4)
        continue
    text = BeautifulSoup(r.text, "html.parser").get_text(" ", strip=True)
    m = PAT.search(text)
    n = MUESTRAS.search(text)
    if m:
        muestras = n.group(1).replace(".", "").replace(",", "") if n else "?"
        results.append((slug, m.group(1), m.group(2), m.group(3), muestras))
        print(f"  OK  {slug:<40} med={m.group(1):>10}  rango:{m.group(2)}-{m.group(3)}  n={muestras}")
    else:
        print(f"  200 {slug} (sin datos)")
    time.sleep(0.4)

print(f"\nTotal con datos: {len(results)}/{len(SLUGS)}")
