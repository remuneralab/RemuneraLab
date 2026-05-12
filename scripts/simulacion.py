"""
Simulación de 1.000 registros en RemuneraLab.
Categorías: normal, sueldo_minimo, mentiroso, extremo, mala_combo, cargo_raro, edge.
Llama a /api/benchmark para combos únicos (deduplicado) y reporta hallazgos.
"""
import random, json, time, sys, math
from urllib import request as urllib_request
from urllib.parse import urlencode
from collections import defaultdict

random.seed(42)
BASE = "http://localhost:3000"

# ── Datos del formulario ──────────────────────────────────────────────────────
INDUSTRIAS_LABEL_VALUE = {
    "Tecnología": "Tecnología",
    "Retail / Comercio": "Retail / Comercio",
    "Finanzas": "Finanzas y Seguros",
    "Seguros": "Finanzas y Seguros",
    "Salud": "Salud",
    "Educación": "Educación",
    "Manufactura / Industria": "Manufactura / Industria",
    "Minería": "Minería",
    "Construcción": "Construcción",
    "Transporte y Logística": "Transporte y Logística",
    "Agricultura": "Agricultura",
    "Sector Público": "Gobierno / Sector Público",
    "Servicios": "Servicios",
    "Otro": "Otro",
}
INDUSTRIAS = list(INDUSTRIAS_LABEL_VALUE.values())

REGIONES = [
    "Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo",
    "Valparaíso","Metropolitana","O'Higgins","Maule","Ñuble","Biobío",
    "La Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes",
]

RANGOS = [
    (0, 500_000),
    (500_000, 800_000),
    (800_000, 1_200_000),
    (1_200_000, 1_800_000),
    (1_800_000, 2_500_000),
    (2_500_000, 4_000_000),
    (4_000_000, 6_000_000),
    (6_000_000, 9_000_000),
    (9_000_000, 14_000_000),
    (14_000_000, 25_000_000),
]

def mid(r): return (r[0] + r[1]) // 2

# Cargos realistas por industria
CARGOS_POR_INDUSTRIA = {
    "Tecnología": ["Desarrollador Full Stack","Ingeniero de Software","Data Scientist",
                   "DevOps Engineer","Product Manager","UX Designer","QA Engineer","CTO"],
    "Finanzas y Seguros": ["Analista Financiero","Contador","Tesorero","Gerente de Riesgos",
                           "Ingeniero en Negocios Internacionales","Corredor de Bolsa",
                           "Actuario","Controller"],
    "Salud": ["Médico General","Enfermera","Kinesiólogo","Nutricionista",
              "Psicólogo Clínico","Técnico Paramédico","Director Médico"],
    "Educación": ["Profesor de Matemáticas","Director de Colegio","Psicopedagogo",
                  "Orientador","Asistente de Educación","Docente Universitario"],
    "Minería": ["Ingeniero de Minas","Geólogo","Operador de Maquinaria Pesada",
                "Jefe de Turno","Metalurgista","Técnico Electromecánico"],
    "Construcción": ["Arquitecto","Ingeniero Civil","Maestro Mayor","Jefe de Obra",
                     "Inspector Técnico","Topógrafo"],
    "Manufactura / Industria": ["Operario de Planta","Técnico de Mantención","Supervisor de Producción",
                                 "Ingeniero Industrial","Jefe de Calidad"],
    "Retail / Comercio": ["Vendedor","Jefe de Tienda","Gerente Comercial",
                           "Analista de Marketing","Cajero","Visual Merchandiser"],
    "Gobierno / Sector Público": ["Funcionario Público","Abogado Municipal","Inspector",
                                   "Asistente Social","Analista de Políticas Públicas"],
    "Transporte y Logística": ["Chofer","Despachador","Jefe de Bodega",
                                "Analista de Supply Chain","Piloto Comercial"],
    "Agricultura": ["Agrónomo","Técnico Agrícola","Administrador de Fundo","Jornalero"],
    "Servicios": ["Recepcionista","Cocinero","Gerente de Operaciones","Técnico en Refrigeración"],
    "Otro": ["Emprendedor","Freelancer","Consultor Independiente"],
}

# Cargos raros / malos
CARGOS_RAROS = [
    "jefe supremo","###ERROR###","undefined","NULL","Astronauta","Mago profesional",
    "Influencer","CEO de mi empresa","a","El mejor del mundo",
    "Ing Negocios Int con mención en comercio exterior y finanzas internacionales",
]

# Malas combinaciones (cargo que no calza con industria)
MALAS_COMBOS = [
    ("Médico Cirujano",          "Tecnología"),
    ("Piloto Comercial",         "Finanzas y Seguros"),
    ("Minero subterráneo",       "Educación"),
    ("Sommelier",                "Manufactura / Industria"),
    ("Pastor evangélico",        "Minería"),
    ("Ingeniero de Minas",       "Salud"),
    ("Desarrollador Full Stack", "Agricultura"),
    ("Contador",                 "Minería"),
    ("Kinesiólogo",              "Tecnología"),
]

# ── Generador de perfiles ─────────────────────────────────────────────────────
perfiles = []

def agregar(cargo, industria, anios, region, rango_idx, categoria, nota=""):
    perfiles.append({
        "cargo": cargo,
        "industria": industria,
        "anios": anios,
        "region": region,
        "salario_min": RANGOS[rango_idx][0],
        "salario_max": RANGOS[rango_idx][1],
        "salario_mid": mid(RANGOS[rango_idx]),
        "categoria": categoria,
        "nota": nota,
    })

# 1. NORMALES (400) — cargo coherente con industria, experiencia y sueldo razonables
for _ in range(400):
    ind = random.choice(INDUSTRIAS)
    cargos = CARGOS_POR_INDUSTRIA.get(ind, CARGOS_POR_INDUSTRIA["Servicios"])
    cargo  = random.choice(cargos)
    anios  = random.randint(0, 20)
    region = random.choice(REGIONES)
    # Sueldo correlacionado con experiencia
    if anios <= 2:    ri = random.randint(0, 3)   # $0–$1.8M
    elif anios <= 7:  ri = random.randint(1, 5)   # $500k–$4M
    elif anios <= 14: ri = random.randint(2, 7)   # $800k–$9M
    else:             ri = random.randint(3, 8)   # $1.2M–$14M
    agregar(cargo, ind, anios, region, ri, "normal")

# 2. SUELDO MÍNIMO (100) — todo tipo de cargos con rango <$500k
for _ in range(100):
    ind    = random.choice(INDUSTRIAS)
    cargos = CARGOS_POR_INDUSTRIA.get(ind, CARGOS_POR_INDUSTRIA["Servicios"])
    cargo  = random.choice(cargos)
    anios  = random.randint(0, 15)
    region = random.choice(REGIONES)
    agregar(cargo, ind, anios, region, 0, "sueldo_minimo",
            "Declara <$500k — puede ser real o error")

# 3. MENTIROSOS (100) — sueldo desproporcionado para el cargo/experiencia
MENTIRAS = [
    ("Practicante",           1,  9, "Junior declara $14M"),
    ("Auxiliar de Aseo",      0,  9, "Sin experiencia declara $14M"),
    ("Estudiante en práctica",0,  8, "Práctica declara $9M–$14M"),
    ("Cajero",                2,  9, "Cajero 2 años declara $14M"),
    ("Vendedor",              1,  8, "Vendedor junior declara $9M"),
    ("Operario de Planta",    0,  9, "Operario sin experiencia declara $14M"),
    ("Recepcionista",         1,  9, "Recepcionista junior declara $14M"),
    ("Asistente Administrativo", 2, 8, "Asistente declara $9M"),
]
for _ in range(100):
    m = random.choice(MENTIRAS)
    ind = random.choice(INDUSTRIAS)
    region = random.choice(REGIONES)
    agregar(m[0], ind, m[1], region, m[2], "mentiroso", m[3])

# 4. EXTREMOS — salarios y experiencia en los límites del sistema
for _ in range(50):
    ind    = random.choice(INDUSTRIAS)
    cargos = CARGOS_POR_INDUSTRIA.get(ind, CARGOS_POR_INDUSTRIA["Servicios"])
    cargo  = random.choice(cargos)
    region = random.choice(REGIONES)
    agregar(cargo, ind, 20, region, 9, "extremo_alto",    "Max experiencia + Max sueldo")
for _ in range(50):
    ind    = random.choice(INDUSTRIAS)
    cargos = CARGOS_POR_INDUSTRIA.get(ind, CARGOS_POR_INDUSTRIA["Servicios"])
    cargo  = random.choice(cargos)
    region = random.choice(REGIONES)
    agregar(cargo, ind, 0,  region, 0, "extremo_bajo",    "0 años + Sueldo mínimo")

# 5. MALAS COMBINACIONES (90)
for _ in range(90):
    combo  = random.choice(MALAS_COMBOS)
    region = random.choice(REGIONES)
    anios  = random.randint(0, 20)
    ri     = random.randint(0, 9)
    agregar(combo[0], combo[1], anios, region, ri, "mala_combo",
            f"{combo[0]} en {combo[1]}")

# 6. CARGOS RAROS (110) — texto extraño, muy largo, vacío implícito, etc.
for _ in range(110):
    cargo  = random.choice(CARGOS_RAROS)
    ind    = random.choice(INDUSTRIAS)
    region = random.choice(REGIONES)
    anios  = random.randint(0, 20)
    ri     = random.randint(0, 9)
    agregar(cargo, ind, anios, region, ri, "cargo_raro", cargo)

# 7. EDGE CASES (100) — regiones extremas, 0 años + alto sueldo, etc.
REGIONES_EXTREMAS = ["Aysén","Magallanes","Arica y Parinacota","Atacama"]
for _ in range(50):
    ind    = random.choice(INDUSTRIAS)
    cargos = CARGOS_POR_INDUSTRIA.get(ind, CARGOS_POR_INDUSTRIA["Servicios"])
    cargo  = random.choice(cargos)
    region = random.choice(REGIONES_EXTREMAS)
    anios  = random.randint(0, 20)
    ri     = random.randint(0, 9)
    agregar(cargo, ind, anios, region, ri, "region_extrema",
            f"Región {region} — poca data ESI")
for _ in range(50):
    ind    = random.choice(INDUSTRIAS)
    cargos = CARGOS_POR_INDUSTRIA.get(ind, CARGOS_POR_INDUSTRIA["Servicios"])
    cargo  = random.choice(cargos)
    region = random.choice(REGIONES)
    anios  = 0
    ri     = random.randint(5, 9)   # sueldo alto con 0 años de exp
    agregar(cargo, ind, anios, region, ri, "edge_0exp_alto",
            "0 años de exp + sueldo ≥$2.5M")

print(f"✓ {len(perfiles)} perfiles generados")
cat_counts = defaultdict(int)
for p in perfiles:
    cat_counts[p["categoria"]] += 1
for k, v in sorted(cat_counts.items()):
    print(f"  {k:25s} {v:4d}")

# ── Deduplicar y llamar al benchmark ─────────────────────────────────────────
# Clave: (cargo, industria, anios, region) — salario_mid va aparte para percentil
seen = {}
for p in perfiles:
    key = (p["cargo"], p["industria"], p["anios"], p["region"])
    if key not in seen:
        seen[key] = p

combos_unicos = list(seen.values())
print(f"\n✓ {len(combos_unicos)} combinaciones únicas → llamadas al benchmark")

# Muestreo representativo por categoría (máx 25 por categoría = ~150 llamadas total)
por_categoria = defaultdict(list)
for p in combos_unicos:
    por_categoria[p["categoria"]].append(p)

muestra = []
MAX_POR_CAT = 25
for cat, items in por_categoria.items():
    seleccionados = random.sample(items, min(MAX_POR_CAT, len(items)))
    muestra.extend(seleccionados)

print(f"✓ Muestra para benchmark: {len(muestra)} perfiles")

def llamar_benchmark(p):
    params = {
        "cargo": p["cargo"],
        "industria": p["industria"],
        "anios_experiencia": p["anios"],
        "region": p["region"],
        "salario_min": p["salario_min"],
        "salario_max": p["salario_max"],
    }
    url = f"{BASE}/api/benchmark?" + urlencode(params)
    try:
        req = urllib_request.Request(url, headers={"Accept": "application/json"})
        with urllib_request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e)}

# Llamadas con progress
resultados = []
errores = 0
print(f"\nEjecutando benchmark para {len(muestra)} perfiles...")
for i, p in enumerate(muestra):
    r = llamar_benchmark(p)
    if "error" in r:
        errores += 1
        r["p50"] = None
        r["percentil_usuario"] = None
        r["confianza"] = "error"
        r["n_esi"] = 0
        r["n"] = 0
    resultados.append({**p, "resultado": r})
    if (i + 1) % 20 == 0:
        print(f"  {i+1}/{len(muestra)} completados...")
    time.sleep(0.05)  # throttle suave

print(f"  {len(muestra)}/{len(muestra)} completados.")

# ── Análisis ──────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("RESULTADOS DE SIMULACIÓN — RemuneraLab")
print("="*70)

def stats_percentil(vals):
    v = [x for x in vals if x is not None]
    if not v: return "sin datos"
    return f"min={min(v)} med={sorted(v)[len(v)//2]} max={max(v)} (n={len(v)})"

def stats_p50(vals):
    v = [x for x in vals if x is not None]
    if not v: return "sin datos"
    avg = sum(v) // len(v)
    return f"min=${min(v):,.0f} prom=${avg:,.0f} max=${max(v):,.0f} (n={len(v)})"

categorias_res = defaultdict(list)
for r in resultados:
    categorias_res[r["categoria"]].append(r)

for cat, items in sorted(categorias_res.items()):
    pcts   = [r["resultado"].get("percentil_usuario") for r in items]
    p50s   = [r["resultado"].get("p50") for r in items]
    conf   = [r["resultado"].get("confianza","?") for r in items]
    n_esi  = [r["resultado"].get("n_esi", 0) for r in items]
    n_reales = [r["resultado"].get("n", 0) for r in items]
    errores_cat = sum(1 for r in items if "error" in r["resultado"])

    print(f"\n── {cat.upper()} ({len(items)} muestras) {'⚠ '+str(errores_cat)+' errores' if errores_cat else ''}")
    print(f"   Percentil usuario : {stats_percentil(pcts)}")
    print(f"   P50 benchmark     : {stats_p50(p50s)}")
    conf_dist = defaultdict(int)
    for c in conf: conf_dist[c] += 1
    print(f"   Confianza         : {dict(conf_dist)}")
    avg_esi = sum(n_esi)//len(n_esi) if n_esi else 0
    print(f"   Registros ESI avg : {avg_esi}")

    # Casos llamativos
    llamativos = []
    for r in items:
        res = r["resultado"]
        pct = res.get("percentil_usuario")
        p50 = res.get("p50")
        sal = r["salario_mid"]
        if pct is not None and pct >= 95:
            llamativos.append(f"   ⚡ percentil {pct} → {r['cargo']} ({r['anios']}a) ${sal:,.0f}")
        elif pct is not None and pct <= 5 and sal > 2_000_000:
            llamativos.append(f"   ⚠ percentil {pct} pese a ${sal:,.0f} → {r['cargo']} ({r['anios']}a, {r['industria']})")
        if p50 and sal < 500_000 and pct and pct > 40:
            llamativos.append(f"   ⚠ sueldo_min en percentil {pct} → {r['cargo']} ({r['industria']})")
    for l in llamativos[:5]:
        print(l)

# ── Resumen de anomalías globales ──────────────────────────────────────────────
print("\n" + "="*70)
print("ANOMALÍAS DETECTADAS")
print("="*70)

# Mentirosos: ¿qué percentil salen?
mentirosos = [r for r in resultados if r["categoria"] == "mentiroso"]
pcts_mentirosos = [r["resultado"].get("percentil_usuario") for r in mentirosos if r["resultado"].get("percentil_usuario") is not None]
if pcts_mentirosos:
    alto = sum(1 for p in pcts_mentirosos if p >= 90)
    print(f"\n[MENTIROSOS] {alto}/{len(pcts_mentirosos)} quedan en percentil ≥90 (sistema no detecta la mentira)")
    print(f"  → Rango de percentiles: {min(pcts_mentirosos)}–{max(pcts_mentirosos)}")

# Sueldo mínimo en percentil alto
min_wage_alto = [r for r in resultados
                 if r["categoria"] == "sueldo_minimo"
                 and (r["resultado"].get("percentil_usuario") or 0) > 50]
if min_wage_alto:
    print(f"\n[SUELDO MÍNIMO INFLADO] {len(min_wage_alto)} casos donde <$500k sale en percentil >50")
    for r in min_wage_alto[:3]:
        print(f"  → {r['cargo']} | {r['industria']} | {r['anios']}a | percentil {r['resultado'].get('percentil_usuario')}")

# Casos con p50 > 3M para 0 años de experiencia
p50_inflados = [r for r in resultados
                if r["anios"] <= 1
                and (r["resultado"].get("p50") or 0) > 3_000_000]
if p50_inflados:
    print(f"\n[P50 INFLADO EN JUNIORS] {len(p50_inflados)} casos con ≤1 año de exp y P50 >$3M")
    for r in p50_inflados[:5]:
        print(f"  → {r['cargo']} | {r['industria']} | P50=${r['resultado'].get('p50'):,.0f} | n_esi={r['resultado'].get('n_esi')}")

# Confianza baja pero percentil mostrado igual
baja_confianza = [r for r in resultados if r["resultado"].get("confianza") == "baja"]
print(f"\n[BAJA CONFIANZA] {len(baja_confianza)}/{len(resultados)} perfiles con confianza='baja'")
print(f"  → El sistema muestra percentil igual, sin advertencia visible al usuario")

# Regiones extremas: ¿cuántos terminan en fallback nacional?
reg_ext = [r for r in resultados if r["categoria"] == "region_extrema"]
n_esi_reg = [r["resultado"].get("n_esi", 0) for r in reg_ext]
if n_esi_reg:
    sin_datos = sum(1 for n in n_esi_reg if n == 0)
    print(f"\n[REGIONES EXTREMAS] {sin_datos}/{len(reg_ext)} sin datos ESI regionales → usan fallback nacional")

print("\n" + "="*70)
print(f"Total perfiles: {len(perfiles)} | Benchmark ejecutado: {len(muestra)} | Errores HTTP: {errores}")
print("="*70)
