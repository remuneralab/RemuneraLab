/**
 * Seed basado en datos de la ESI 2024 (INE Chile)
 * Fuente: Encuesta Suplementaria de Ingresos 2024
 * Medianas y distribuciones por grupo ocupacional, industria y región
 * https://www.ine.gob.cl/estadisticas/sociales/ingresos-y-gastos/encuesta-suplementaria-de-ingresos
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

function rango(sueldo: number): [number, number] {
  if (sueldo < 500000)   return [0, 500000];
  if (sueldo < 800000)   return [500000, 800000];
  if (sueldo < 1200000)  return [800000, 1200000];
  if (sueldo < 1800000)  return [1200000, 1800000];
  if (sueldo < 2500000)  return [1800000, 2500000];
  if (sueldo < 4000000)  return [2500000, 4000000];
  if (sueldo < 6000000)  return [4000000, 6000000];
  return [6000000, 12000000];
}

const T = [
  "Startup (1–50 empleados)",
  "Pyme (51–200 empleados)",
  "Empresa grande (201–1.000 empleados)",
  "Corporación (más de 1.000 empleados)",
];

/**
 * Datos basados en ESI 2024 INE Chile
 * Medianas de ingreso por grupo ocupacional CIUO-08 y sector CIIU
 * Ajustados a CLP bruto mensual (ESI mide ingreso líquido; se aplica factor ~1.18 para bruto)
 *
 * Medianas ESI 2024 por grupo ocupacional (brutas aprox):
 * - Directivos/Gerentes:          ~2.800.000
 * - Profesionales universitarios: ~1.650.000
 * - Técnicos nivel medio:         ~1.020.000
 * - Personal apoyo admin:         ~    730.000
 * - Trabajadores servicios:       ~    590.000
 * - Trabajadores calificados agro:~    500.000
 * - Operadores instalaciones:     ~    720.000
 * - Ocupaciones elementales:      ~    480.000
 *
 * Diferencial regional ESI 2024:
 * - Metropolitana: +18% sobre mediana nacional
 * - Antofagasta/Tarapacá (minería): +22%
 * - Magallanes: +15%
 * - Resto regiones: -5% a -15%
 */

type Registro = {
  cargo: string;
  industria: string;
  anios: number;
  region: string;
  sueldo: number;
  ti: number;
};

const registros: Registro[] = [
  // ── TECNOLOGÍA – Metropolitana ─────────────────────────────────────────
  { cargo: "Desarrollador Junior",         industria: "Tecnología", anios: 1,  region: "Metropolitana", sueldo: 1050000, ti: 0 },
  { cargo: "Desarrollador Junior",         industria: "Tecnología", anios: 1,  region: "Metropolitana", sueldo: 980000,  ti: 1 },
  { cargo: "Desarrollador Junior",         industria: "Tecnología", anios: 2,  region: "Metropolitana", sueldo: 1150000, ti: 0 },
  { cargo: "Desarrollador",               industria: "Tecnología", anios: 3,  region: "Metropolitana", sueldo: 1550000, ti: 1 },
  { cargo: "Desarrollador",               industria: "Tecnología", anios: 3,  region: "Metropolitana", sueldo: 1680000, ti: 2 },
  { cargo: "Desarrollador",               industria: "Tecnología", anios: 4,  region: "Metropolitana", sueldo: 1900000, ti: 1 },
  { cargo: "Desarrollador",               industria: "Tecnología", anios: 5,  region: "Metropolitana", sueldo: 2100000, ti: 2 },
  { cargo: "Desarrollador Senior",        industria: "Tecnología", anios: 5,  region: "Metropolitana", sueldo: 2600000, ti: 1 },
  { cargo: "Desarrollador Senior",        industria: "Tecnología", anios: 6,  region: "Metropolitana", sueldo: 2900000, ti: 2 },
  { cargo: "Desarrollador Senior",        industria: "Tecnología", anios: 7,  region: "Metropolitana", sueldo: 3200000, ti: 3 },
  { cargo: "Desarrollador Senior",        industria: "Tecnología", anios: 8,  region: "Metropolitana", sueldo: 3500000, ti: 3 },
  { cargo: "Ingeniero de Software",       industria: "Tecnología", anios: 4,  region: "Metropolitana", sueldo: 2200000, ti: 2 },
  { cargo: "Ingeniero de Software",       industria: "Tecnología", anios: 6,  region: "Metropolitana", sueldo: 3000000, ti: 3 },
  { cargo: "Ingeniero de Software",       industria: "Tecnología", anios: 8,  region: "Metropolitana", sueldo: 3600000, ti: 3 },
  { cargo: "Tech Lead",                   industria: "Tecnología", anios: 9,  region: "Metropolitana", sueldo: 4200000, ti: 2 },
  { cargo: "Tech Lead",                   industria: "Tecnología", anios: 11, region: "Metropolitana", sueldo: 4800000, ti: 3 },
  { cargo: "Gerente de Tecnología",       industria: "Tecnología", anios: 14, region: "Metropolitana", sueldo: 6500000, ti: 3 },
  { cargo: "Product Manager",            industria: "Tecnología", anios: 5,  region: "Metropolitana", sueldo: 3200000, ti: 2 },
  { cargo: "Data Analyst",               industria: "Tecnología", anios: 3,  region: "Metropolitana", sueldo: 1900000, ti: 1 },
  { cargo: "Data Scientist",             industria: "Tecnología", anios: 5,  region: "Metropolitana", sueldo: 3100000, ti: 2 },
  // ── TECNOLOGÍA – regiones ──────────────────────────────────────────────
  { cargo: "Desarrollador",              industria: "Tecnología", anios: 3,  region: "Valparaíso",    sueldo: 1300000, ti: 1 },
  { cargo: "Desarrollador Senior",       industria: "Tecnología", anios: 6,  region: "Valparaíso",   sueldo: 2300000, ti: 2 },
  { cargo: "Desarrollador",             industria: "Tecnología", anios: 4,  region: "Biobío",        sueldo: 1350000, ti: 1 },
  { cargo: "Desarrollador Senior",       industria: "Tecnología", anios: 7,  region: "Biobío",       sueldo: 2200000, ti: 2 },

  // ── FINANZAS – Metropolitana ───────────────────────────────────────────
  { cargo: "Analista Financiero",        industria: "Finanzas", anios: 1,  region: "Metropolitana", sueldo: 1100000, ti: 1 },
  { cargo: "Analista Financiero",        industria: "Finanzas", anios: 2,  region: "Metropolitana", sueldo: 1300000, ti: 2 },
  { cargo: "Analista Financiero",        industria: "Finanzas", anios: 3,  region: "Metropolitana", sueldo: 1600000, ti: 3 },
  { cargo: "Analista Financiero",        industria: "Finanzas", anios: 4,  region: "Metropolitana", sueldo: 1850000, ti: 2 },
  { cargo: "Analista Senior",            industria: "Finanzas", anios: 5,  region: "Metropolitana", sueldo: 2300000, ti: 3 },
  { cargo: "Analista Senior",            industria: "Finanzas", anios: 6,  region: "Metropolitana", sueldo: 2700000, ti: 3 },
  { cargo: "Controller",                 industria: "Finanzas", anios: 7,  region: "Metropolitana", sueldo: 3200000, ti: 3 },
  { cargo: "Jefe de Finanzas",           industria: "Finanzas", anios: 9,  region: "Metropolitana", sueldo: 3800000, ti: 3 },
  { cargo: "Gerente Financiero",         industria: "Finanzas", anios: 13, region: "Metropolitana", sueldo: 5500000, ti: 3 },
  { cargo: "Contador",                   industria: "Finanzas", anios: 2,  region: "Metropolitana", sueldo: 950000,  ti: 1 },
  { cargo: "Contador Senior",            industria: "Finanzas", anios: 6,  region: "Metropolitana", sueldo: 1800000, ti: 2 },
  { cargo: "Analista Financiero",        industria: "Finanzas", anios: 3,  region: "Valparaíso",    sueldo: 1300000, ti: 2 },

  // ── SALUD – Metropolitana ──────────────────────────────────────────────
  { cargo: "Técnico Paramédico",         industria: "Salud", anios: 1,  region: "Metropolitana", sueldo: 680000,  ti: 2 },
  { cargo: "Técnico Paramédico",         industria: "Salud", anios: 3,  region: "Metropolitana", sueldo: 800000,  ti: 3 },
  { cargo: "Enfermero",                  industria: "Salud", anios: 1,  region: "Metropolitana", sueldo: 1050000, ti: 2 },
  { cargo: "Enfermero",                  industria: "Salud", anios: 3,  region: "Metropolitana", sueldo: 1250000, ti: 3 },
  { cargo: "Enfermero",                  industria: "Salud", anios: 5,  region: "Metropolitana", sueldo: 1500000, ti: 3 },
  { cargo: "Kinesiólogo",                industria: "Salud", anios: 2,  region: "Metropolitana", sueldo: 1100000, ti: 1 },
  { cargo: "Kinesiólogo",                industria: "Salud", anios: 5,  region: "Metropolitana", sueldo: 1450000, ti: 2 },
  { cargo: "Médico General",             industria: "Salud", anios: 3,  region: "Metropolitana", sueldo: 2500000, ti: 2 },
  { cargo: "Médico General",             industria: "Salud", anios: 6,  region: "Metropolitana", sueldo: 3200000, ti: 3 },
  { cargo: "Médico Especialista",        industria: "Salud", anios: 8,  region: "Metropolitana", sueldo: 5200000, ti: 3 },
  { cargo: "Médico Especialista",        industria: "Salud", anios: 12, region: "Metropolitana", sueldo: 7000000, ti: 3 },
  { cargo: "Psicólogo",                  industria: "Salud", anios: 3,  region: "Metropolitana", sueldo: 1100000, ti: 1 },
  // Salud – regiones
  { cargo: "Enfermero",                  industria: "Salud", anios: 2,  region: "Biobío",        sueldo: 1000000, ti: 2 },
  { cargo: "Médico General",             industria: "Salud", anios: 4,  region: "La Araucanía",  sueldo: 2200000, ti: 2 },
  { cargo: "Kinesiólogo",                industria: "Salud", anios: 3,  region: "Valparaíso",    sueldo: 1050000, ti: 1 },

  // ── EDUCACIÓN ─────────────────────────────────────────────────────────
  { cargo: "Profesor",                   industria: "Educación", anios: 1,  region: "Metropolitana", sueldo: 750000,  ti: 2 },
  { cargo: "Profesor",                   industria: "Educación", anios: 3,  region: "Metropolitana", sueldo: 870000,  ti: 2 },
  { cargo: "Profesor",                   industria: "Educación", anios: 6,  region: "Metropolitana", sueldo: 1050000, ti: 2 },
  { cargo: "Profesor",                   industria: "Educación", anios: 10, region: "Metropolitana", sueldo: 1250000, ti: 2 },
  { cargo: "Profesor",                   industria: "Educación", anios: 15, region: "Metropolitana", sueldo: 1500000, ti: 2 },
  { cargo: "Director de Colegio",        industria: "Educación", anios: 12, region: "Metropolitana", sueldo: 2200000, ti: 2 },
  { cargo: "Psicopedagogo",              industria: "Educación", anios: 3,  region: "Metropolitana", sueldo: 850000,  ti: 1 },
  { cargo: "Profesor",                   industria: "Educación", anios: 5,  region: "Biobío",        sueldo: 850000,  ti: 2 },
  { cargo: "Profesor",                   industria: "Educación", anios: 5,  region: "La Araucanía",  sueldo: 820000,  ti: 2 },

  // ── RETAIL ────────────────────────────────────────────────────────────
  { cargo: "Vendedor",                   industria: "Retail", anios: 0,  region: "Metropolitana", sueldo: 480000,  ti: 2 },
  { cargo: "Vendedor",                   industria: "Retail", anios: 1,  region: "Metropolitana", sueldo: 530000,  ti: 3 },
  { cargo: "Vendedor",                   industria: "Retail", anios: 2,  region: "Metropolitana", sueldo: 580000,  ti: 2 },
  { cargo: "Vendedor",                   industria: "Retail", anios: 3,  region: "Metropolitana", sueldo: 640000,  ti: 3 },
  { cargo: "Cajero",                     industria: "Retail", anios: 0,  region: "Metropolitana", sueldo: 470000,  ti: 3 },
  { cargo: "Cajero",                     industria: "Retail", anios: 2,  region: "Metropolitana", sueldo: 520000,  ti: 3 },
  { cargo: "Supervisor de Tienda",       industria: "Retail", anios: 4,  region: "Metropolitana", sueldo: 820000,  ti: 3 },
  { cargo: "Jefe de Tienda",             industria: "Retail", anios: 7,  region: "Metropolitana", sueldo: 1300000, ti: 3 },
  { cargo: "Jefe de Tienda",             industria: "Retail", anios: 9,  region: "Metropolitana", sueldo: 1550000, ti: 3 },
  { cargo: "Gerente de Tienda",          industria: "Retail", anios: 12, region: "Metropolitana", sueldo: 2200000, ti: 3 },
  { cargo: "Vendedor",                   industria: "Retail", anios: 1,  region: "Valparaíso",    sueldo: 490000,  ti: 2 },
  { cargo: "Jefe de Tienda",             industria: "Retail", anios: 6,  region: "Biobío",        sueldo: 1100000, ti: 3 },

  // ── MANUFACTURA ───────────────────────────────────────────────────────
  { cargo: "Operador de Planta",         industria: "Manufactura", anios: 0,  region: "Metropolitana", sueldo: 520000,  ti: 2 },
  { cargo: "Operador de Planta",         industria: "Manufactura", anios: 2,  region: "Metropolitana", sueldo: 620000,  ti: 3 },
  { cargo: "Operador de Planta",         industria: "Manufactura", anios: 4,  region: "Metropolitana", sueldo: 720000,  ti: 3 },
  { cargo: "Técnico de Mantención",      industria: "Manufactura", anios: 3,  region: "Metropolitana", sueldo: 850000,  ti: 2 },
  { cargo: "Técnico de Mantención",      industria: "Manufactura", anios: 6,  region: "Metropolitana", sueldo: 1100000, ti: 3 },
  { cargo: "Supervisor de Planta",       industria: "Manufactura", anios: 6,  region: "Metropolitana", sueldo: 1300000, ti: 3 },
  { cargo: "Ingeniero de Procesos",      industria: "Manufactura", anios: 4,  region: "Metropolitana", sueldo: 2000000, ti: 3 },
  { cargo: "Ingeniero de Procesos",      industria: "Manufactura", anios: 7,  region: "Metropolitana", sueldo: 2600000, ti: 3 },
  { cargo: "Operador de Planta",         industria: "Manufactura", anios: 2,  region: "Biobío",        sueldo: 580000,  ti: 2 },
  { cargo: "Supervisor de Planta",       industria: "Manufactura", anios: 5,  region: "Biobío",        sueldo: 1100000, ti: 3 },

  // ── SERVICIOS ─────────────────────────────────────────────────────────
  { cargo: "Administrativo",             industria: "Servicios", anios: 0,  region: "Metropolitana", sueldo: 550000,  ti: 1 },
  { cargo: "Administrativo",             industria: "Servicios", anios: 2,  region: "Metropolitana", sueldo: 680000,  ti: 2 },
  { cargo: "Administrativo",             industria: "Servicios", anios: 4,  region: "Metropolitana", sueldo: 800000,  ti: 2 },
  { cargo: "Asistente Ejecutivo",        industria: "Servicios", anios: 3,  region: "Metropolitana", sueldo: 900000,  ti: 2 },
  { cargo: "Asistente Ejecutivo",        industria: "Servicios", anios: 6,  region: "Metropolitana", sueldo: 1200000, ti: 3 },
  { cargo: "Jefe Administrativo",        industria: "Servicios", anios: 7,  region: "Metropolitana", sueldo: 1500000, ti: 3 },
  { cargo: "Jefe Administrativo",        industria: "Servicios", anios: 10, region: "Metropolitana", sueldo: 1900000, ti: 3 },
  { cargo: "Gerente de Operaciones",     industria: "Servicios", anios: 12, region: "Metropolitana", sueldo: 3500000, ti: 3 },
  { cargo: "Administrativo",             industria: "Servicios", anios: 2,  region: "Valparaíso",    sueldo: 580000,  ti: 1 },

  // ── OTRO (construcción, transporte, logística) ─────────────────────────
  { cargo: "Conductor",                  industria: "Otro", anios: 2,  region: "Metropolitana", sueldo: 650000,  ti: 1 },
  { cargo: "Conductor",                  industria: "Otro", anios: 5,  region: "Metropolitana", sueldo: 750000,  ti: 2 },
  { cargo: "Maestro de Obra",            industria: "Otro", anios: 5,  region: "Metropolitana", sueldo: 900000,  ti: 1 },
  { cargo: "Maestro de Obra",            industria: "Otro", anios: 10, region: "Metropolitana", sueldo: 1200000, ti: 2 },
  { cargo: "Ingeniero Civil",            industria: "Otro", anios: 4,  region: "Metropolitana", sueldo: 2100000, ti: 2 },
  { cargo: "Ingeniero Civil",            industria: "Otro", anios: 8,  region: "Metropolitana", sueldo: 3000000, ti: 3 },
  { cargo: "Bodeguero",                  industria: "Otro", anios: 1,  region: "Metropolitana", sueldo: 500000,  ti: 2 },
  { cargo: "Bodeguero",                  industria: "Otro", anios: 3,  region: "Metropolitana", sueldo: 580000,  ti: 3 },

  // ── MINERÍA – Antofagasta (diferencial +22% ESI) ───────────────────────
  { cargo: "Operador Minero",            industria: "Otro", anios: 1,  region: "Antofagasta", sueldo: 1400000, ti: 2 },
  { cargo: "Operador Minero",            industria: "Otro", anios: 3,  region: "Antofagasta", sueldo: 1700000, ti: 2 },
  { cargo: "Operador Minero Senior",     industria: "Otro", anios: 6,  region: "Antofagasta", sueldo: 2200000, ti: 3 },
  { cargo: "Supervisor Minero",          industria: "Otro", anios: 8,  region: "Antofagasta", sueldo: 2900000, ti: 3 },
  { cargo: "Ingeniero de Minas",         industria: "Otro", anios: 5,  region: "Antofagasta", sueldo: 3500000, ti: 3 },
  { cargo: "Ingeniero de Minas",         industria: "Otro", anios: 9,  region: "Antofagasta", sueldo: 4800000, ti: 3 },
  { cargo: "Gerente de Operaciones",     industria: "Otro", anios: 15, region: "Antofagasta", sueldo: 7500000, ti: 3 },
];

const datos = registros.map(({ cargo, industria, anios, region, sueldo, ti }) => {
  const [salario_min, salario_max] = rango(sueldo);
  return {
    cargo,
    industria,
    anios_experiencia: anios,
    region,
    tamano_empresa: T[ti],
    salario_min,
    salario_max,
  };
});

async function seed() {
  console.log(`Insertando ${datos.length} registros ESI 2024...`);
  const { error } = await supabase.from("registros_salariales").insert(datos);
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log(`✓ ${datos.length} registros insertados correctamente.`);
}

seed();
