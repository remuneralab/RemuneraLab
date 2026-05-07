import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const datos = [
  // Tecnología – Metropolitana
  { cargo: "Desarrollador Junior", industria: "Tecnología", anios_experiencia: 1, region: "Metropolitana", sueldo_mensual: 800000 },
  { cargo: "Desarrollador Junior", industria: "Tecnología", anios_experiencia: 2, region: "Metropolitana", sueldo_mensual: 950000 },
  { cargo: "Desarrollador", industria: "Tecnología", anios_experiencia: 3, region: "Metropolitana", sueldo_mensual: 1300000 },
  { cargo: "Desarrollador", industria: "Tecnología", anios_experiencia: 4, region: "Metropolitana", sueldo_mensual: 1500000 },
  { cargo: "Desarrollador", industria: "Tecnología", anios_experiencia: 5, region: "Metropolitana", sueldo_mensual: 1800000 },
  { cargo: "Desarrollador Senior", industria: "Tecnología", anios_experiencia: 6, region: "Metropolitana", sueldo_mensual: 2200000 },
  { cargo: "Desarrollador Senior", industria: "Tecnología", anios_experiencia: 8, region: "Metropolitana", sueldo_mensual: 2600000 },
  { cargo: "Tech Lead", industria: "Tecnología", anios_experiencia: 10, region: "Metropolitana", sueldo_mensual: 3200000 },
  { cargo: "Tech Lead", industria: "Tecnología", anios_experiencia: 12, region: "Metropolitana", sueldo_mensual: 3800000 },
  { cargo: "Gerente de Tecnología", industria: "Tecnología", anios_experiencia: 15, region: "Metropolitana", sueldo_mensual: 5000000 },
  // Tecnología – otras regiones
  { cargo: "Desarrollador", industria: "Tecnología", anios_experiencia: 3, region: "Valparaíso", sueldo_mensual: 1100000 },
  { cargo: "Desarrollador Senior", industria: "Tecnología", anios_experiencia: 7, region: "Biobío", sueldo_mensual: 1900000 },

  // Banca y Finanzas – Metropolitana
  { cargo: "Analista", industria: "Banca y Finanzas", anios_experiencia: 1, region: "Metropolitana", sueldo_mensual: 900000 },
  { cargo: "Analista", industria: "Banca y Finanzas", anios_experiencia: 3, region: "Metropolitana", sueldo_mensual: 1400000 },
  { cargo: "Analista Senior", industria: "Banca y Finanzas", anios_experiencia: 5, region: "Metropolitana", sueldo_mensual: 2000000 },
  { cargo: "Jefe de Área", industria: "Banca y Finanzas", anios_experiencia: 8, region: "Metropolitana", sueldo_mensual: 2800000 },
  { cargo: "Gerente", industria: "Banca y Finanzas", anios_experiencia: 14, region: "Metropolitana", sueldo_mensual: 4500000 },

  // Retail
  { cargo: "Vendedor", industria: "Retail", anios_experiencia: 1, region: "Metropolitana", sueldo_mensual: 450000 },
  { cargo: "Vendedor", industria: "Retail", anios_experiencia: 3, region: "Metropolitana", sueldo_mensual: 550000 },
  { cargo: "Supervisor", industria: "Retail", anios_experiencia: 5, region: "Metropolitana", sueldo_mensual: 800000 },
  { cargo: "Jefe de Tienda", industria: "Retail", anios_experiencia: 8, region: "Metropolitana", sueldo_mensual: 1200000 },
  { cargo: "Jefe de Tienda", industria: "Retail", anios_experiencia: 10, region: "Valparaíso", sueldo_mensual: 1100000 },

  // Salud
  { cargo: "Enfermero/a", industria: "Salud", anios_experiencia: 2, region: "Metropolitana", sueldo_mensual: 950000 },
  { cargo: "Médico General", industria: "Salud", anios_experiencia: 5, region: "Metropolitana", sueldo_mensual: 2500000 },
  { cargo: "Médico Especialista", industria: "Salud", anios_experiencia: 10, region: "Metropolitana", sueldo_mensual: 4000000 },
  { cargo: "Kinesiólogo", industria: "Salud", anios_experiencia: 3, region: "Biobío", sueldo_mensual: 900000 },

  // Minería
  { cargo: "Operador", industria: "Minería", anios_experiencia: 2, region: "Antofagasta", sueldo_mensual: 1200000 },
  { cargo: "Operador Senior", industria: "Minería", anios_experiencia: 6, region: "Antofagasta", sueldo_mensual: 1800000 },
  { cargo: "Supervisor", industria: "Minería", anios_experiencia: 8, region: "Antofagasta", sueldo_mensual: 2500000 },
  { cargo: "Ingeniero de Minas", industria: "Minería", anios_experiencia: 5, region: "Antofagasta", sueldo_mensual: 3000000 },
  { cargo: "Gerente de Operaciones", industria: "Minería", anios_experiencia: 15, region: "Antofagasta", sueldo_mensual: 6000000 },
];

async function seed() {
  console.log(`Insertando ${datos.length} registros...`);
  const { error } = await supabase.from("salarios").insert(datos);
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log(`✓ ${datos.length} registros insertados correctamente.`);
}

seed();
