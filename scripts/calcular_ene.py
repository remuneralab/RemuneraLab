import csv, os, sys
sys.stdout.reconfigure(encoding="utf-8")

def leer_csv(path):
    datos = {}
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            area   = row.get("AREA_REF","").strip()
            sexo   = row.get("SEXO","").strip()
            periodo= row.get("TIME_PERIOD","").strip()
            val    = row.get("OBS_VALUE","").strip()
            if val and area and sexo and periodo:
                try:
                    datos[(area, sexo, periodo)] = float(val)
                except ValueError:
                    pass
    return datos

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "ene")
des = leer_csv(os.path.join(DATA_DIR, "DF_DES_SEXO.csv"))
fdt = leer_csv(os.path.join(DATA_DIR, "DF_FDT_SEXO.csv"))

periodos_nac = sorted(set(p for (a,s,p) in des if a=="_T"), reverse=True)
print("Periodos nacionales (ultimos 5):", periodos_nac[:5])

PERIODO_ENE = None
for p in periodos_nac:
    des_m = des.get(("_T","M",p))
    des_f = des.get(("_T","F",p))
    fdt_m = fdt.get(("_T","M",p))
    fdt_f = fdt.get(("_T","F",p))
    if all(v is not None for v in [des_m,des_f,fdt_m,fdt_f]):
        print(f"\nPeriodo mas reciente completo: {p}")
        print(f"  Hombres: {des_m:,.0f} / {fdt_m:,.0f} = {des_m/fdt_m*100:.1f}%")
        print(f"  Mujeres: {des_f:,.0f} / {fdt_f:,.0f} = {des_f/fdt_f*100:.1f}%")
        des_t = des.get(("_T","_T",p), des_m + des_f)
        fdt_t = fdt.get(("_T","_T",p), fdt_m + fdt_f)
        print(f"  Total:   {des_t:,.0f} / {fdt_t:,.0f} = {des_t/fdt_t*100:.1f}%")
        PERIODO_ENE = p
        break

# Codigos oficiales de region INE (AREA_REF): no siguen el orden norte-sur
REGIONES = {
  "15":"Arica y Parinacota","01":"Tarapacá","02":"Antofagasta",
  "03":"Atacama","04":"Coquimbo","05":"Valparaíso",
  "13":"Metropolitana","06":"O'Higgins","07":"Maule",
  "16":"Ñuble","08":"Biobío","09":"La Araucanía",
  "14":"Los Ríos","10":"Los Lagos","11":"Aysén","12":"Magallanes",
}

areas_des = sorted(set(a for (a,s,p) in des if a!="_T"))
print(f"\nAreas en DES: {areas_des[:20]}")

print("\n=== TASAS POR REGION ===")
for codigo, nombre in REGIONES.items():
    for code in [codigo, str(int(codigo))]:
        d  = des.get((code,"_T",PERIODO_ENE))
        ft = fdt.get((code,"_T",PERIODO_ENE))
        if d and ft:
            print(f"  {codigo}  {nombre}: {d/ft*100:.1f}%")
            break
    else:
        # Try sexo-total manually
        d_m  = des.get((codigo,"M",PERIODO_ENE)); d_f  = des.get((codigo,"F",PERIODO_ENE))
        ft_m = fdt.get((codigo,"M",PERIODO_ENE)); ft_f = fdt.get((codigo,"F",PERIODO_ENE))
        if d_m and d_f and ft_m and ft_f:
            d_t = d_m + d_f; ft_t = ft_m + ft_f
            print(f"  {codigo}  {nombre}: {d_t/ft_t*100:.1f}% (calculado)")
        else:
            print(f"  {codigo}  {nombre}: sin datos")

print("\n=== TASAS NACIONALES POR SEXO ===")
for p in periodos_nac[:6]:
    des_m = des.get(("_T","M",p)); des_f = des.get(("_T","F",p))
    fdt_m = fdt.get(("_T","M",p)); fdt_f = fdt.get(("_T","F",p))
    if des_m and des_f and fdt_m and fdt_f:
        print(f"  {p}  H:{des_m/fdt_m*100:.1f}%  M:{des_f/fdt_f*100:.1f}%")
