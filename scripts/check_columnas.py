import requests, sys, warnings
warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")

URL = "https://fdogahabyuauglkfhzkj.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

columnas = ["hash_semantico", "vacantes_count", "experiencia_anios", "salario_mid", "ciuo4"]

print("Estado columnas en registros_avisos:")
faltantes = []
for col in columnas:
    r = requests.get(
        f"{URL}/rest/v1/registros_avisos",
        params={"select": col, "limit": "1"},
        headers=H,
        verify=False
    )
    if r.status_code == 200:
        print(f"  {col:<22} OK")
    else:
        try:
            msg = r.json().get("message", r.text[:60])
        except Exception:
            msg = r.text[:60]
        print(f"  {col:<22} FALTA  -> {msg[:70]}")
        faltantes.append(col)

if faltantes:
    print("\nSQL de migración necesario:")
    print("-" * 60)
    if "hash_semantico" in faltantes:
        print("ALTER TABLE registros_avisos ADD COLUMN IF NOT EXISTS hash_semantico text;")
    if "vacantes_count" in faltantes:
        print("ALTER TABLE registros_avisos ADD COLUMN IF NOT EXISTS vacantes_count smallint DEFAULT 1;")
    if "hash_semantico" in faltantes:
        print("CREATE UNIQUE INDEX IF NOT EXISTS idx_hash_semantico")
        print("  ON registros_avisos(hash_semantico)")
        print("  WHERE hash_semantico IS NOT NULL;")
    print("-" * 60)
else:
    print("\nTodas las columnas existen.")
