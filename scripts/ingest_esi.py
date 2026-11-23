"""
Transforma el CSV oficial de personas de la ESI (INE) al formato de la tabla registros_esi.

Uso:  python -I scripts/ingest_esi.py <esi_AAAA_personas.csv> <anio> <salida.json>

Criterios (Manual de usuario ESI 2025, INE):
- Población: ocupados de referencia (ocup_ref == 1).
- Ingreso: ing_t_p (ingreso del trabajo principal, líquido). Se excluyen ingresos <= 0.
- Factor de expansión: fact_cal_esi.
- Rama: b14_rev4cl_caenes (secciones CAENES Rev.4 A–U codificadas 1–21).
- Industria se guarda con los mismos valores que envía el formulario (src/app/formulario).
"""
import csv, json, sys

REGIONES = {
    "15": "Arica y Parinacota", "1": "Tarapacá", "2": "Antofagasta", "3": "Atacama", "4": "Coquimbo",
    "5": "Valparaíso", "13": "Metropolitana", "6": "O'Higgins", "7": "Maule", "16": "Ñuble",
    "8": "Biobío", "9": "La Araucanía", "14": "Los Ríos", "10": "Los Lagos", "11": "Aysén", "12": "Magallanes",
}
# CAENES Rev.4 (secciones A–U = códigos 1–21) -> valores de industria del formulario
INDUSTRIA = {
    "1": "Agricultura",              # A Agricultura, ganadería, silvicultura y pesca
    "2": "Minería",                  # B Explotación de minas y canteras
    "3": "Manufactura / Industria",  # C Industrias manufactureras
    "4": "Otro",                     # D Electricidad, gas y vapor
    "5": "Otro",                     # E Agua y gestión de desechos
    "6": "Construcción",             # F Construcción
    "7": "Retail / Comercio",        # G Comercio
    "8": "Transporte y Logística",   # H Transporte y almacenamiento
    "9": "Turismo",                  # I Alojamiento y servicio de comidas
    "10": "Tecnología",              # J Información y comunicaciones
    "11": "Finanzas y Seguros",      # K Actividades financieras y de seguros
    "12": "Servicios",               # L Actividades inmobiliarias
    "13": "Servicios",               # M Actividades profesionales, científicas y técnicas
    "14": "Servicios",               # N Actividades de servicios administrativos y de apoyo
    "15": "Gobierno / Sector Público",  # O Administración pública y defensa
    "16": "Educación",               # P Enseñanza
    "17": "Salud",                   # Q Salud humana y asistencia social
    "18": "Servicios",               # R Artes, entretenimiento y recreativas
    "19": "Servicios",               # S Otras actividades de servicios
    "20": "Otro",                    # T Hogares como empleadores
    "21": "Otro",                    # U Organizaciones extraterritoriales
}
# categoria_ocupacion (ENE): 1 empleador, 2 cuenta propia, 3 asalariado privado, 4 asalariado público,
# 5-6 servicio doméstico, 7 familiar no remunerado
CATEGORIA = {"1": "empleador", "2": "independiente", "3": "asalariado_privado", "4": "asalariado_publico"}

def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None

def transformar(path, anio):
    out = []
    with open(path, encoding="utf-8", errors="replace") as f:
        for r in csv.DictReader(f):
            if r.get("ocup_ref") != "1": continue
            ing, fac, edad = num(r.get("ing_t_p")), num(r.get("fact_cal_esi")), num(r.get("edad"))
            if not ing or ing <= 0 or not fac or edad is None: continue
            out.append({
                "fuente": "ESI", "cargo": None, "ciuo4": None,
                "industria": INDUSTRIA.get(r.get("b14_rev4cl_caenes")),
                "region": REGIONES[r["region"]],
                "sexo": int(r["sexo"]), "edad": int(edad),
                "ingreso_mensual": round(ing),
                "categoria_ocupacion": CATEGORIA.get(r.get("categoria_ocupacion"), "otro"),
                "factor_expansion": fac, "ano_encuesta": anio,
            })
    return out

if __name__ == "__main__":
    filas = transformar(sys.argv[1], int(sys.argv[2]))
    json.dump(filas, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False)
    print(f"{len(filas)} filas -> {sys.argv[3]}")
