"""
Mapeo retroactivo de CIUO para los 113 registros_salariales sin ciuo_codigo.

Uso:
  python scripts/fix_ciuo_retroactivo.py           # aplica los cambios
  python scripts/fix_ciuo_retroactivo.py --dry-run # muestra qué actualizaría
"""

import sys
from supabase import create_client

SUPABASE_URL = "https://fdogahabyuauglkfhzkj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkb2dhaGFieXVhdWdsa2ZoemtqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE1MTYzNSwiZXhwIjoyMDkzNzI3NjM1fQ.qewn_gGCdjBAaJ-PEy0FQKZkdgQ28VyUp3SxcQfl1sk"

DRY_RUN = "--dry-run" in sys.argv

# Mapeo cargo (texto exacto del DB) → CIUO-08
# Clave: texto tal como aparece en la columna cargo (case-insensitive en el filtro)
CIUO_MAP: dict[str, list[str]] = {
    "1211": ["Jefe de finanzas"],
    "1219": ["Gerente de operaciones", "Jefe de Operaciones", "Subgerente"],
    "1221": ["Jefe de ventas", "Jefe de sucursal/ventas", "Director de marketing"],
    "1223": ["Director de ingeniería"],
    "1420": ["Jefe de tienda"],
    "2142": ["Ingeniero civil"],
    "2143": ["Ingeniero en medioambiente"],
    "2144": [
        "Ingeniero mecánico", "Ingeniero senior mecánico",
        "Ingeniero de mantenimiento", "Ingeniero de automatización",
        "Ingeniero automatización", "Ingeniero bms",
    ],
    "2149": ["Ingeniero en prevención de riesgos", "Asesor en prevención de riesgos"],
    "2153": ["Ingeniero de redes"],
    "2161": ["Arquitecto"],
    "2166": ["Diseñador gráfico", "Jefa de diseño"],
    "2262": ["Director técnico Químico Farmacéutico"],
    "2330": ["Utp"],
    "2341": ["Educador de párvulos"],
    "2411": ["Profesional de Apoto Encargada de Gestion de riesgos y auditoria EAR"],
    "2413": ["Analista de control de gestión"],
    "2421": [
        "Jefe de proyectos", "Líder de proyectos",
        "Analista de gestión", "Administrador de Contrato",
        "Coordinación general", "Coordinadora de programas",
        "Coordinador de proyecto", "Coordinadora de monitoreo y evaluación",
        "Coordinador monitoreo y evaluación",
        "Ingeniero comercial", "Ingeniero en negocios internacionales",
    ],
    "2423": ["Coordinador de gestion de personas y desarrollo organizacional"],
    "2511": ["Consultor senior SAP"],
    "2512": [
        "Programador", "Ingeniero de software",
        "Ingeniero civil computación", "Informático",
    ],
    "2519": ["Ingeniero en análisis de datos"],
    "2522": ["Técnico de infraestructura cloud"],
    "2523": ["Ingeniero seguridad de la información"],
    "2622": ["Jefe de Biblioteca"],
    "2720": ["Psicólogo", "Psicóloga clínica  comunitaria"],
    "3112": ["Jefe de obras", "Jefe de obra", "Jefe de Conservación Vial"],
    "3113": ["Técnico electricista"],
    "3114": ["Técnico electrónico"],
    "3115": ["Técnico mecánico", "Técnico en mantención"],
    "3122": ["Jefe de camara frigorifica"],
    "3212": ["Laboratorista dental"],
    "3240": ["técnico veterinario"],
    "3257": ["Prevencionista de riesgos"],
    "3311": [
        "Ejecutivo de cuentas", "Ejecutivo banca empresas",
        "Encargada Área de Cobranzas Seguros Vida y Salud",
    ],
    "3313": ["Técnico en contabilidad"],
    "3322": ["Vendedor técnico"],
    "3324": ["Analisa de inventarios", "encargado de distribucion"],
    "3333": ["Analista senior atracción talento"],
    "3339": ["Inspector de contenedores", "Asistente de administración de empresas"],
    "3412": ["Educadora de trato directo"],
    "3433": ["Jefe de cobranzas"],
    "3511": ["Técnico On site"],
    "4110": ["Administración", "Asistente de Biblioteca", "Asistente administrativo"],
    "4120": ["Secretaria", "Secretaria académica", "Asistente Ejecutivo Bilingüe"],
    "4222": ["Recepcionista"],
    "4225": ["Operador de call center"],
    "4311": ["Asistente Contable", "Administrativo contable"],
    "4321": ["Bodeguero", "Controlador de inventario"],
    "5152": ["Conserje"],
    "5223": ["Vendedor"],
    "5230": ["Cajera de un local de sencillito y juegos de azar"],
    "5311": ["Asistente furgón escolar", "Asistente de furgón escolar"],
    "5414": ["Guardia"],
    "7231": ["Técnico mecánico automotriz", "Desabollador"],
    "7411": ["Maestro mayor eléctrico"],
    "8131": ["Operador de planta industrial", "Operador de sala de control"],
    "8160": ["Operario de producción"],
    "8322": ["Chofer"],
    "9112": ["Asesora del hogar"],
    "9613": ["Lavador de vehículos part time", "Encargado de maestranza"],
}


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    total_updated = 0
    total_expected = sum(len(v) for v in CIUO_MAP.values())

    print(f"{'[DRY RUN] ' if DRY_RUN else ''}Mapeando {total_expected} cargo texts -> CIUO...\n")

    for ciuo, cargos in CIUO_MAP.items():
        ciuo_count = 0
        for cargo in cargos:
            # Verifica cuántos registros matchean antes de actualizar
            check = (
                sb.table("registros_salariales")
                .select("id", count="exact")
                .is_("ciuo_codigo", "null")
                .ilike("cargo", cargo)
                .execute()
            )
            n = check.count or 0
            if n == 0:
                continue

            if not DRY_RUN:
                sb.table("registros_salariales").update(
                    {"ciuo_codigo": ciuo}
                ).is_("ciuo_codigo", "null").ilike("cargo", cargo).execute()

            print(f"  {'[skip] ' if DRY_RUN else ''}{ciuo} <- '{cargo}' ({n} registro{'s' if n > 1 else ''})")
            ciuo_count += n

        if ciuo_count:
            total_updated += ciuo_count

    print(f"\n{'Actualizados' if not DRY_RUN else 'Actualizarían'}: {total_updated} registros")

    # Verificación final
    if not DRY_RUN:
        remaining = (
            sb.table("registros_salariales")
            .select("id", count="exact")
            .is_("ciuo_codigo", "null")
            .not_.eq("ip_address", "::1")
            .not_.is_("ip_address", "null")
            .execute()
        )
        print(f"Sin CIUO restantes (IP válida): {remaining.count}")


if __name__ == "__main__":
    main()
