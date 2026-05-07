import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// [min, max] en CLP bruto mensual
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

const TAMANOS = [
  "Startup (1–50 empleados)",
  "Pyme (51–200 empleados)",
  "Empresa grande (201–1.000 empleados)",
  "Corporación (más de 1.000 empleados)",
];
function t(i: number) { return TAMANOS[i % 4]; }

const base = [
  // ── Tecnología – Metropolitana ─────────────────────────────
  { cargo: "Desarrollador Junior",    industria: "Tecnología",  anios: 1,  region: "Metropolitana",  sueldo: 750000,  ti: 0 },
  { cargo: "Desarrollador Junior",    industria: "Tecnología",  anios: 1,  region: "Metropolitana",  sueldo: 820000,  ti: 1 },
  { cargo: "Desarrollador Junior",    industria: "Tecnología",  anios: 2,  region: "Metropolitana",  sueldo: 950000,  ti: 0 },
  { cargo: "Desarrollador",           industria: "Tecnología",  anios: 3,  region: "Metropolitana",  sueldo: 1300000, ti: 1 },
  { cargo: "Desarrollador",           industria: "Tecnología",  anios: 3,  region: "Metropolitana",  sueldo: 1450000, ti: 2 },
  { cargo: "Desarrollador",           industria: "Tecnología",  anios: 4,  region: "Metropolitana",  sueldo: 1600000, ti: 3 },
  { cargo: "Desarrollador",           industria: "Tecnología",  anios: 5,  region: "Metropolitana",  sueldo: 1900000, ti: 0 },
  { cargo: "Desarrollador Senior",    industria: "Tecnología",  anios: 5,  region: "Metropolitana",  sueldo: 2200000, ti: 1 },
  { cargo: "Desarrollador Senior",    industria: "Tecnología",  anios: 6,  region: "Metropolitana",  sueldo: 2600000, ti: 2 },
  { cargo: "Desarrollador Senior",    industria: "Tecnología",  anios: 7,  region: "Metropolitana",  sueldo: 3000000, ti: 3 },
  { cargo: "Desarrollador Senior",    industria: "Tecnología",  anios: 8,  region: "Metropolitana",  sueldo: 3200000, ti: 0 },
  { cargo: "Tech Lead",               industria: "Tecnología",  anios: 9,  region: "Metropolitana",  sueldo: 3500000, ti: 2 },
  { cargo: "Tech Lead",               industria: "Tecnología",  anios: 11, region: "Metropolitana",  sueldo: 4200000, ti: 3 },
  { cargo: "Gerente de Tecnología",   industria: "Tecnología",  anios: 14, region: "Metropolitana",  sueldo: 5500000, ti: 3 },
  // ── Tecnología – otras regiones ───────────────────────────
  { cargo: "Desarrollador",           industria: "Tecnología",  anios: 3,  region: "Valparaíso",     sueldo: 1150000, ti: 1 },
  { cargo: "Desarrollador Senior",    industria: "Tecnología",  anios: 6,  region: "Valparaíso",     sueldo: 2000000, ti: 2 },
  { cargo: "Desarrollador",           industria: "Tecnología",  anios: 4,  region: "Biobío",         sueldo: 1250000, ti: 0 },
  { cargo: "Desarrollador Senior",    industria: "Tecnología",  anios: 7,  region: "Biobío",         sueldo: 1900000, ti: 1 },

  // ── Finanzas – Metropolitana ───────────────────────────────
  { cargo: "Analista Financiero",     industria: "Finanzas",    anios: 1,  region: "Metropolitana",  sueldo: 950000,  ti: 1 },
  { cargo: "Analista Financiero",     industria: "Finanzas",    anios: 2,  region: "Metropolitana",  sueldo: 1100000, ti: 2 },
  { cargo: "Analista Financiero",     industria: "Finanzas",    anios: 3,  region: "Metropolitana",  sueldo: 1400000, ti: 3 },
  { cargo: "Analista Senior",         industria: "Finanzas",    anios: 5,  region: "Metropolitana",  sueldo: 2100000, ti: 2 },
  { cargo: "Analista Senior",         industria: "Finanzas",    anios: 6,  region: "Metropolitana",  sueldo: 2400000, ti: 3 },
  { cargo: "Jefe de Área",            industria: "Finanzas",    anios: 8,  region: "Metropolitana",  sueldo: 2900000, ti: 3 },
  { cargo: "Gerente Financiero",      industria: "Finanzas",    anios: 13, region: "Metropolitana",  sueldo: 4800000, ti: 3 },

  // ── Salud – Metropolitana ──────────────────────────────────
  { cargo: "Enfermero",               industria: "Salud",       anios: 1,  region: "Metropolitana",  sueldo: 850000,  ti: 2 },
  { cargo: "Enfermero",               industria: "Salud",       anios: 3,  region: "Metropolitana",  sueldo: 1000000, ti: 3 },
  { cargo: "Médico General",          industria: "Salud",       anios: 3,  region: "Metropolitana",  sueldo: 2200000, ti: 2 },
  { cargo: "Médico General",          industria: "Salud",       anios: 5,  region: "Metropolitana",  sueldo: 2700000, ti: 3 },
  { cargo: "Médico Especialista",     industria: "Salud",       anios: 8,  region: "Metropolitana",  sueldo: 4500000, ti: 3 },
  { cargo: "Kinesiólogo",             industria: "Salud",       anios: 2,  region: "Biobío",         sueldo: 900000,  ti: 1 },
  { cargo: "Kinesiólogo",             industria: "Salud",       anios: 4,  region: "Metropolitana",  sueldo: 1200000, ti: 2 },

  // ── Retail – Metropolitana ─────────────────────────────────
  { cargo: "Vendedor",                industria: "Retail",      anios: 0,  region: "Metropolitana",  sueldo: 430000,  ti: 2 },
  { cargo: "Vendedor",                industria: "Retail",      anios: 1,  region: "Metropolitana",  sueldo: 480000,  ti: 3 },
  { cargo: "Vendedor",                industria: "Retail",      anios: 2,  region: "Metropolitana",  sueldo: 530000,  ti: 2 },
  { cargo: "Supervisor",              industria: "Retail",      anios: 4,  region: "Metropolitana",  sueldo: 750000,  ti: 3 },
  { cargo: "Jefe de Tienda",          industria: "Retail",      anios: 7,  region: "Metropolitana",  sueldo: 1100000, ti: 3 },
  { cargo: "Jefe de Tienda",          industria: "Retail",      anios: 9,  region: "Valparaíso",     sueldo: 1050000, ti: 2 },

  // ── Educación ─────────────────────────────────────────────
  { cargo: "Profesor",                industria: "Educación",   anios: 2,  region: "Metropolitana",  sueldo: 750000,  ti: 2 },
  { cargo: "Profesor",                industria: "Educación",   anios: 5,  region: "Metropolitana",  sueldo: 950000,  ti: 2 },
  { cargo: "Profesor",                industria: "Educación",   anios: 10, region: "Metropolitana",  sueldo: 1200000, ti: 2 },
  { cargo: "Director",                industria: "Educación",   anios: 12, region: "Metropolitana",  sueldo: 2000000, ti: 2 },

  // ── Manufactura ───────────────────────────────────────────
  { cargo: "Operador de Planta",      industria: "Manufactura", anios: 1,  region: "Biobío",         sueldo: 550000,  ti: 2 },
  { cargo: "Operador de Planta",      industria: "Manufactura", anios: 3,  region: "Biobío",         sueldo: 680000,  ti: 3 },
  { cargo: "Supervisor de Planta",    industria: "Manufactura", anios: 6,  region: "Biobío",         sueldo: 1100000, ti: 3 },
  { cargo: "Ingeniero de Procesos",   industria: "Manufactura", anios: 4,  region: "Metropolitana",  sueldo: 1700000, ti: 3 },

  // ── Servicios ─────────────────────────────────────────────
  { cargo: "Administrativo",          industria: "Servicios",   anios: 1,  region: "Metropolitana",  sueldo: 600000,  ti: 1 },
  { cargo: "Administrativo",          industria: "Servicios",   anios: 3,  region: "Metropolitana",  sueldo: 750000,  ti: 2 },
  { cargo: "Jefe Administrativo",     industria: "Servicios",   anios: 7,  region: "Metropolitana",  sueldo: 1300000, ti: 3 },
];

const datos = base.map(({ cargo, industria, anios, region, sueldo, ti }) => {
  const [salario_min, salario_max] = rango(sueldo);
  return {
    cargo,
    industria,
    anios_experiencia: anios,
    region,
    tamano_empresa: t(ti),
    salario_min,
    salario_max,
  };
});

async function seed() {
  console.log(`Insertando ${datos.length} registros en registros_salariales...`);
  const { error } = await supabase.from("registros_salariales").insert(datos);
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log(`✓ ${datos.length} registros insertados correctamente.`);
}

seed();
