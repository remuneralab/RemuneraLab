import { supabase } from "@/lib/supabase";
import { clasificarCargo } from "@/lib/ciuo08";

function midpoint(min: number, max: number) {
  return Math.round((min + max) / 2);
}

function at(sorted: number[], p: number) {
  return sorted[Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1)];
}

type Weighted = { v: number; w: number };

// Percentil ponderado por factor_expansion — cada fila ESI representa w personas
function weightedAt(sorted: Weighted[], p: number, totalWeight: number): number {
  const target = (p / 100) * totalWeight;
  let cum = 0;
  for (const { v, w } of sorted) {
    cum += w;
    if (cum >= target) return v;
  }
  return sorted[sorted.length - 1].v;
}

function weightedMean(records: Weighted[]): number {
  const sumW = records.reduce((a, r) => a + r.w, 0);
  const sumVW = records.reduce((a, r) => a + r.v * r.w, 0);
  return Math.round(sumVW / sumW);
}

const ESI_MIN = 30;

function calcularK(n_esi: number): number {
  if (n_esi >= 200) return 40;
  if (n_esi >= 100) return 30;
  if (n_esi >= 50)  return 15;
  return 10;
}
const ESI_FLOOR = 100_000;
const ESI_CEIL  = 10_000_000;

const YEAR_NOW = new Date().getFullYear();
// Dato de 1 año pesa 82%, de 2 años 67%, de 3 años 55%. Sin efecto si todos son del mismo año.
function decayFactor(ano: number): number {
  return Math.exp(-0.2 * Math.max(0, YEAR_NOW - ano));
}

// Edad típica de inicio de carrera por grupo CIUO-2 dígitos.
// Determina cuándo una persona de ese grupo entra al mercado laboral por primera vez.
function edadInicio(ciuo2: number | null): number {
  if (!ciuo2) return 22;
  if (ciuo2 === 22) return 30; // profesionales de salud: medicina + internado
  if (Math.floor(ciuo2 / 10) === 2) return 25; // otros profesionales: ingenieros, abogados, profesores
  if (Math.floor(ciuo2 / 10) === 1) return 28; // directivos: requieren experiencia previa
  if (Math.floor(ciuo2 / 10) === 3) return 22; // técnicos
  return 20;                                    // administrativos, servicios, oficios
}

// ESI/CASEN no captura años de experiencia — se usa edad como proxy.
// El rango se centra en (edad_inicio + anios_experiencia) con buffer de ±4 años.
function edadProxy(anios: number, ciuo2: number | null): { min: number; max: number } {
  const inicio = edadInicio(ciuo2);
  const buffer = 4;
  return {
    min: Math.max(18, inicio + anios - buffer),
    max: Math.min(65, inicio + anios + buffer),
  };
}

const CIUO2_NOMBRE: Record<number, string> = {
  11: "Directores y gerentes generales",
  12: "Gerentes de servicios especializados",
  13: "Gerentes de área y producción",
  14: "Gerentes de comercio y servicios",
  21: "Ingenieros y científicos",
  22: "Profesionales de salud",
  23: "Docentes",
  24: "Profesionales de negocios y administración",
  25: "Profesionales TIC",
  26: "Profesionales legales, sociales y culturales",
  31: "Técnicos de ciencias e ingeniería",
  32: "Técnicos de salud",
  33: "Técnicos de negocios y administración",
  35: "Técnicos TIC",
  41: "Personal de apoyo administrativo",
  42: "Personal de atención al cliente",
  51: "Trabajadores de servicios personales",
  52: "Vendedores",
  61: "Trabajadores agrícolas calificados",
  71: "Artesanos de construcción y oficios",
  72: "Artesanos industriales",
  81: "Operadores de maquinaria fija",
  83: "Conductores y operadores de transporte",
  91: "Trabajadores domésticos y de limpieza",
  93: "Trabajadores de industria y construcción no calificados",
};

export interface BenchmarkResult {
  n: number;
  n_esi: number;
  promedio: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  percentil_usuario: number | null;
  confianza: "alta" | "media" | "baja";
  expanded: boolean;
  fuentes: { remuneralab: number; esi: number };
  fuente_descripcion: string;
}

export async function calcularBenchmark(
  cargo: string,
  industria: string,
  anios_experiencia: number,
  region: string,
  salario_mid?: number
): Promise<BenchmarkResult> {
  // ── 1. Contribuciones reales (registros_salariales) ─────────────────────
  let { data: userData, error: userErr } = await supabase
    .from("registros_salariales")
    .select("salario_min, salario_max")
    .ilike("cargo", `%${cargo}%`)
    .eq("industria", industria)
    .gte("anios_experiencia", anios_experiencia - 2)
    .lte("anios_experiencia", anios_experiencia + 2)
    .eq("region", region);

  if (userErr) throw new Error("Error al consultar registros");

  let expanded = false;
  if ((userData?.length ?? 0) < 5) {
    const { data: wider, error: e2 } = await supabase
      .from("registros_salariales")
      .select("salario_min, salario_max")
      .ilike("cargo", `%${cargo}%`)
      .eq("industria", industria)
      .gte("anios_experiencia", anios_experiencia - 2)
      .lte("anios_experiencia", anios_experiencia + 2);
    if (!e2 && wider) { userData = wider; expanded = true; }
  }

  // ── 2. Datos ESI (registros_esi) — cascada por CIUO ────────────────────
  // Clasificar el cargo a CIUO-08 para filtrar por ocupación, no solo industria
  const ciuoMatch = clasificarCargo(cargo);
  const ciuo4 = ciuoMatch ? parseInt(ciuoMatch.codigo) : null;
  const ciuo2 = ciuo4 ? Math.floor(ciuo4 / 100) : null;
  const edad = edadProxy(anios_experiencia, ciuo2);

  let esiData: { ingreso_mensual: number; factor_expansion: number | null; ano_encuesta: number | null }[] | null = null;
  let fuente_descripcion = `${industria} · datos generales`;

  // Nivel 1: ciuo4 exacto + región + edad
  if (ciuo4) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .eq("ciuo4", ciuo4)
      .eq("region", region)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      esiData = data;
      fuente_descripcion = `${ciuoMatch!.grupo} · ${region}`;
    }
  }

  // Nivel 2: ciuo4 exacto, nacional + edad
  if (!esiData && ciuo4) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .eq("ciuo4", ciuo4)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      esiData = data;
      fuente_descripcion = `${ciuoMatch!.grupo} · nacional`;
    }
  }

  // Nivel 3: grupo CIUO-2 dígitos + región + edad
  if (!esiData && ciuo2) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .gte("ciuo4", ciuo2 * 100)
      .lte("ciuo4", ciuo2 * 100 + 99)
      .eq("region", region)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      esiData = data;
      fuente_descripcion = `${CIUO2_NOMBRE[ciuo2] ?? `Grupo CIUO ${ciuo2}xx`} · ${region}`;
    }
  }

  // Nivel 4: grupo CIUO-2 dígitos, nacional + edad
  if (!esiData && ciuo2) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .gte("ciuo4", ciuo2 * 100)
      .lte("ciuo4", ciuo2 * 100 + 99)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      esiData = data;
      fuente_descripcion = `${CIUO2_NOMBRE[ciuo2] ?? `Grupo CIUO ${ciuo2}xx`} · nacional`;
    }
  }

  // Nivel 5: fallback por industria + región + edad
  if (!esiData) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .eq("industria", industria)
      .eq("region", region)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      esiData = data;
      fuente_descripcion = `${industria} · ${region} (por sector)`;
    }
  }

  // Nivel 6: fallback por industria nacional + edad
  if (!esiData) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .eq("industria", industria)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      esiData = data;
      fuente_descripcion = `${industria} · nacional (por sector)`;
    }
  }

  // Nivel 7: fallback final sin filtro edad
  if (!esiData) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion, ano_encuesta")
      .eq("industria", industria)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error) {
      esiData = data ?? [];
      fuente_descripcion = `${industria} · nacional`;
    }
  }

  if (!esiData) esiData = [];

  // ── 3. Arrays de salarios ────────────────────────────────────────────────
  const userRecords = userData ?? [];
  const esiRecords = esiData ?? [];
  const n = userRecords.length;
  const n_esi = esiRecords.length;

  const userMids = userRecords.map((r) => midpoint(r.salario_min, r.salario_max));
  const userSorted = [...userMids].sort((a, b) => a - b);

  // Cada fila ESI ponderada por factor_expansion × decay temporal
  const esiWeighted: Weighted[] = esiRecords.map((r) => ({
    v: r.ingreso_mensual,
    w: (r.factor_expansion ?? 1) * decayFactor(r.ano_encuesta ?? 2024),
  }));
  const esiSortedW = [...esiWeighted].sort((a, b) => a.v - b.v);
  const esiTotalW = esiSortedW.reduce((a, r) => a + r.w, 0);

  // ── 4. Percentiles por fuente ───────────────────────────────────────────
  const uP25 = n > 0 ? at(userSorted, 25) : null;
  const uP50 = n > 0 ? at(userSorted, 50) : null;
  const uP75 = n > 0 ? at(userSorted, 75) : null;
  const uProm = n > 0 ? Math.round(userMids.reduce((a, b) => a + b, 0) / n) : null;

  const eP25 = n_esi > 0 ? weightedAt(esiSortedW, 25, esiTotalW) : null;
  const eP50 = n_esi > 0 ? weightedAt(esiSortedW, 50, esiTotalW) : null;
  const eP75 = n_esi > 0 ? weightedAt(esiSortedW, 75, esiTotalW) : null;
  const eProm = n_esi > 0 ? weightedMean(esiWeighted) : null;

  // ── 5. Blend por shrinkage ──────────────────────────────────────────────
  // K crece con n_esi: prior robusto cede menos ante pocos datos de usuario
  const K = calcularK(n_esi);
  const w_user = n / (n + K);
  const w_esi = K / (n + K);

  const blend = (u: number | null, e: number | null): number | null => {
    if (u != null && e != null) return Math.round(w_user * u + w_esi * e);
    return u ?? e ?? null;
  };

  const p25 = blend(uP25, eP25);
  const p50 = blend(uP50, eP50);
  const p75 = blend(uP75, eP75);
  const promedio = blend(uProm, eProm);

  // ── 6. Percentil del usuario ────────────────────────────────────────────
  let percentil_usuario: number | null = null;
  if (salario_mid != null) {
    const rank_user =
      n > 0
        ? ((userMids.filter((v) => v < salario_mid).length +
            0.5 * userMids.filter((v) => v === salario_mid).length) /
            n) *
          100
        : null;

    const rank_esi =
      n_esi > 0
        ? (esiWeighted.filter((r) => r.v < salario_mid).reduce((a, r) => a + r.w, 0) /
            esiTotalW) *
          100
        : null;

    const raw = blend(rank_user, rank_esi);
    if (raw != null) percentil_usuario = Math.min(99, Math.max(1, Math.round(raw)));
  }

  // ── 7. Confianza — combina datos propios (calidad) y ESI (volumen) ──────
  const confianza: "alta" | "media" | "baja" =
    n >= 15 || (n >= 3 && n_esi >= 100) ? "alta"
    : n >= 5  || n_esi >= 30            ? "media"
    : "baja";

  return {
    n,
    n_esi,
    promedio,
    p25,
    p50,
    p75,
    percentil_usuario,
    confianza,
    expanded,
    fuentes: { remuneralab: n, esi: n_esi },
    fuente_descripcion,
  };
}
