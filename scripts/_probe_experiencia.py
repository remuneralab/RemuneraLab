import sys, warnings, re
sys.stdout.reconfigure(encoding="utf-8")
warnings.filterwarnings("ignore")
import requests
from bs4 import BeautifulSoup
from supabase import create_client

SUPABASE_URL = "https://fdogahabyuauglkfhzkj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"

sb = create_client(SUPABASE_URL, SUPABASE_KEY)
res = sb.table("registros_avisos").select("url_aviso, cargo_original, salario_mid, region").gt("salario_mid", 0).limit(8).execute()

s = requests.Session()
s.verify = False
s.headers.update({"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36", "Accept-Language": "es-CL,es;q=0.9"})

PAT_EXP = re.compile(
    r"(\d+)\s*(?:a[ñn]os?\s+de\s+experiencia|a[ñn]os?\s+de\s+exp\.?|years?\s+of\s+exp)",
    re.IGNORECASE
)
PAT_EXP2 = re.compile(
    r"experiencia\s*(?:m[ií]nima|requerida|de)?\s*(?:de)?\s*(\d+)\s*a[ñn]os?",
    re.IGNORECASE
)
PAT_EXP3 = re.compile(r"experiencia\s*:\s*(\d+)", re.IGNORECASE)

for row in res.data:
    url = row["url_aviso"]
    cargo = row["cargo_original"]
    salario = row["salario_mid"]
    print(f"\n{'='*60}")
    print(f"Cargo: {cargo}  |  Salario mid: ${salario:,}  |  Región: {row['region']}")
    print(f"URL: {url[-70:]}")
    try:
        r = s.get(url, timeout=12)
        soup = BeautifulSoup(r.text, "html.parser")
        text = soup.get_text(" ", strip=True)

        # Buscar contexto alrededor de "experiencia"
        exp_ctx = re.findall(r".{0,40}experiencia.{0,60}", text, re.IGNORECASE)
        print(f"Contextos 'experiencia': {exp_ctx[:4]}")

        # Intentar los patrones
        for pat in [PAT_EXP, PAT_EXP2, PAT_EXP3]:
            m = pat.search(text)
            if m:
                print(f"  -> EXTRAÍDO: {m.group(1)} años")
                break
        else:
            print("  -> No encontrado con patrones")

        # Ver si hay sección estructurada de requisitos
        req_tags = soup.find_all(class_=re.compile(r"requi|requirement|detail", re.I))
        if req_tags:
            print(f"  Sección requisitos: {req_tags[0].get_text(' ', strip=True)[:150]}")

    except Exception as e:
        print(f"  ERROR: {e}")
