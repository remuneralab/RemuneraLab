import { supabase } from "@/lib/supabase";
import { clasificarCargo } from "@/lib/ciuo08";
import { matchTrabajandoPrior } from "@/lib/priors_trabajando";

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

const ESI_MIN    = 30;
const AVISO_MIN  = 5;
// Cada aviso equivale al 20% de un registro ESI — son ofertas, no salarios negociados.
const AVISO_WEIGHT = 0.2;

function calcularK(n_esi: number): number {
  if (n_esi >= 200) return 40;
  if (n_esi >= 100) return 30;
  if (n_esi >= 50)  return 15;
  return 10;
}
// Solo incluye trabajadores con ingresos ≥ sueldo mínimo legal.
// Excluye sector informal/jornada parcial que arrastraría el p50 por debajo del mínimo.
const ESI_FLOOR = 539_000; // Ley N° 21.751, vigente 1 enero 2026
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
  n_aviso: number;
  n_trab: number;
  promedio: number | null;
  p10: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
  percentil_usuario: number | null;
  confianza: "alta" | "media" | "baja";
  expanded: boolean;
  fuentes: { remuneralab: number; esi: number; avisos: number; trabajando: number };
  fuente_descripcion: string;
  // 1-2: cargo exacto (ciuo4), 3-4: grupo ocupacional (ciuo2), 5-7: sector (industria)
  nivel_cascada: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  grupo_usado: string | null; // nombre legible del grupo/sector que entregó los datos
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
  let nivel_cascada: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 7;
  let grupo_usado: string | null = null;

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
      nivel_cascada = 1;
      grupo_usado = ciuoMatch!.grupo;
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
      nivel_cascada = 2;
      grupo_usado = ciuoMatch!.grupo;
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
      nivel_cascada = 3;
      grupo_usado = CIUO2_NOMBRE[ciuo2] ?? null;
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
      nivel_cascada = 4;
      grupo_usado = CIUO2_NOMBRE[ciuo2] ?? null;
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
      nivel_cascada = 5;
      grupo_usado = industria;
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
      nivel_cascada = 6;
      grupo_usado = industria;
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
      nivel_cascada = 7;
      grupo_usado = industria;
    }
  }

  if (!esiData) esiData = [];

  // ── 2b. Avisos scrapeados (registros_avisos) — corrección temporal ──────
  // Cascada: CIUO exacto + región → CIUO exacto nacional → industria + región
  // Experiencia: preferir avisos con experiencia_anios dentro de ±2 años del usuario.
  // Si no hay suficientes con match de experiencia, incluir también los que tienen NULL.
  type AvisoRow = { salario_mid: number; experiencia_anios: number | null };
  let avisosData: { salario_mid: number }[] | null = null;

  function filtrarPorExp(rows: AvisoRow[]): { salario_mid: number }[] {
    const match  = rows.filter(r => r.experiencia_anios != null &&
      Math.abs(r.experiencia_anios - anios_experiencia) <= 2);
    const unknown = rows.filter(r => r.experiencia_anios == null);
    if (match.length >= AVISO_MIN) return match;
    return [...match, ...unknown];
  }

  if (ciuo4) {
    const { data, error } = await supabase
      .from("registros_avisos")
      .select("salario_mid, experiencia_anios")
      .eq("ciuo4", ciuo4)
      .eq("region", region)
      .not("salario_mid", "is", null);
    if (!error && data) {
      const filtered = filtrarPorExp(data);
      if (filtered.length >= AVISO_MIN) avisosData = filtered;
    }
  }

  if (!avisosData && ciuo4) {
    const { data, error } = await supabase
      .from("registros_avisos")
      .select("salario_mid, experiencia_anios")
      .eq("ciuo4", ciuo4)
      .not("salario_mid", "is", null);
    if (!error && data) {
      const filtered = filtrarPorExp(data);
      if (filtered.length >= AVISO_MIN) avisosData = filtered;
    }
  }

  if (!avisosData) {
    const { data, error } = await supabase
      .from("registros_avisos")
      .select("salario_mid, experiencia_anios")
      .eq("industria", industria)
      .eq("region", region)
      .not("salario_mid", "is", null);
    if (!error && data) {
      const filtered = filtrarPorExp(data);
      if (filtered.length >= AVISO_MIN) avisosData = filtered;
    }
  }

  avisosData = avisosData ?? [];

  // ── 2c. Prior nacional Trabajando.cl ────────────────────────────────────
  // Medianas por cargo con grandes muestras nacionales.
  // Sin desglose regional ni de experiencia — ancla el prior cuando ESI/avisos son escasos.
  const trabPrior = matchTrabajandoPrior(cargo);
  const TRAB_EQUIV = 50;

  // ── 3. Arrays de salarios ────────────────────────────────────────────────
  const userRecords = userData ?? [];
  const esiRecords  = esiData ?? [];
  const n     = userRecords.length;
  const n_esi = esiRecords.length;
  const n_aviso = avisosData.length;

  const userMids = userRecords.map((r) => midpoint(r.salario_min, r.salario_max));
  const userSorted = [...userMids].sort((a, b) => a - b);

  // Cada fila ESI ponderada por factor_expansion × decay temporal
  const esiWeighted: Weighted[] = esiRecords.map((r) => ({
    v: r.ingreso_mensual,
    w: (r.factor_expansion ?? 1) * decayFactor(r.ano_encuesta ?? 2024),
  }));
  const esiSortedW = [...esiWeighted].sort((a, b) => a.v - b.v);
  const esiTotalW  = esiSortedW.reduce((a, r) => a + r.w, 0);

  // Avisos: sin factor de expansión (cada registro = 1 aviso)
  const avisoSorted = [...avisosData.map(r => r.salario_mid)].sort((a, b) => a - b);

  // ── 4. Percentiles por fuente ───────────────────────────────────────────
  const uP25  = n > 0     ? at(userSorted, 25)                    : null;
  const uP50  = n > 0     ? at(userSorted, 50)                    : null;
  const uP75  = n > 0     ? at(userSorted, 75)                    : null;
  const uProm = n > 0     ? Math.round(userMids.reduce((a,b) => a+b, 0) / n) : null;

  const eP10  = n_esi > 0 ? weightedAt(esiSortedW, 10, esiTotalW) : null;
  const eP25  = n_esi > 0 ? weightedAt(esiSortedW, 25, esiTotalW) : null;
  const eP50  = n_esi > 0 ? weightedAt(esiSortedW, 50, esiTotalW) : null;
  const eP75  = n_esi > 0 ? weightedAt(esiSortedW, 75, esiTotalW) : null;
  const eP90  = n_esi > 0 ? weightedAt(esiSortedW, 90, esiTotalW) : null;
  const eProm = n_esi > 0 ? weightedMean(esiWeighted)              : null;

  const aP10  = n_aviso > 0 ? at(avisoSorted, 10)                  : null;
  const aP25  = n_aviso > 0 ? at(avisoSorted, 25)                  : null;
  const aP50  = n_aviso > 0 ? at(avisoSorted, 50)                  : null;
  const aP75  = n_aviso > 0 ? at(avisoSorted, 75)                  : null;
  const aP90  = n_aviso > 0 ? at(avisoSorted, 90)                  : null;
  const aProm = n_aviso > 0 ? Math.round(avisoSorted.reduce((a,b)=>a+b,0)/n_aviso) : null;

  // ── 5. Prior blended (ESI + avisos + Trabajando.cl) ────────────────────
  const n_aviso_equiv = n_aviso * AVISO_WEIGHT;
  const n_trab_equiv  = trabPrior ? TRAB_EQUIV : 0;

  const tP50 = trabPrior?.p50 ?? null;
  const tP10 = trabPrior ? Math.round(trabPrior.p50 * 0.58) : null;
  const tP25 = trabPrior ? Math.round(trabPrior.p50 * 0.78) : null;
  const tP75 = trabPrior ? Math.round(trabPrior.p50 * 1.30) : null;
  const tP90 = trabPrior ? Math.round(trabPrior.p50 * 1.65) : null;

  const blendPrior = (e: number | null, a: number | null, t: number | null): number | null => {
    const parts: { v: number; w: number }[] = [];
    if (e != null && n_esi > 0)        parts.push({ v: e, w: n_esi });
    if (a != null && n_aviso_equiv > 0) parts.push({ v: a, w: n_aviso_equiv });
    if (t != null && n_trab_equiv > 0)  parts.push({ v: t, w: n_trab_equiv });
    if (parts.length === 0) return null;
    const wTotal = parts.reduce((s, p) => s + p.w, 0);
    if (wTotal === 0) return null;
    return Math.round(parts.reduce((s, p) => s + p.v * p.w, 0) / wTotal);
  };

  const priorP10  = blendPrior(eP10,  aP10,  tP10);
  const priorP25  = blendPrior(eP25,  aP25,  tP25);
  const priorP50  = blendPrior(eP50,  aP50,  tP50);
  const priorP75  = blendPrior(eP75,  aP75,  tP75);
  const priorP90  = blendPrior(eP90,  aP90,  tP90);
  const priorProm = blendPrior(eProm, aProm, tP50);

  // ── 6. Shrinkage usuario ↔ prior ───────────────────────────────────────
  const effectivePriorN = Math.max(n_esi, Math.round(n_aviso_equiv), n_trab_equiv);
  const K       = calcularK(effectivePriorN);
  const w_user  = n / (n + K);
  const w_prior = K / (n + K);

  const blend = (u: number | null, prior: number | null): number | null => {
    if (u != null && prior != null) return Math.round(w_user * u + w_prior * prior);
    return u ?? prior ?? null;
  };

  const uP10    = n > 0 ? at(userSorted, 10) : null;
  const uP90    = n > 0 ? at(userSorted, 90) : null;
  const p10     = blend(uP10,  priorP10);
  const p25     = blend(uP25,  priorP25);
  const p50     = blend(uP50,  priorP50);
  const p75     = blend(uP75,  priorP75);
  const p90     = blend(uP90,  priorP90);
  const promedio = blend(uProm, priorProm);

  if (n_aviso > 0) {
    fuente_descripcion += ` + ${n_aviso} avisos actuales`;
  }
  if (trabPrior) {
    fuente_descripcion += ` · prior Trabajando.cl`;
  }

  // ── 7. Percentil del usuario ────────────────────────────────────────────
  let percentil_usuario: number | null = null;
  if (salario_mid != null) {
    const rank_user =
      n > 0
        ? ((userMids.filter((v) => v < salario_mid).length +
            0.5 * userMids.filter((v) => v === salario_mid).length) / n) * 100
        : null;

    const rank_esi =
      n_esi > 0
        ? (esiWeighted.filter((r) => r.v < salario_mid).reduce((a, r) => a + r.w, 0) / esiTotalW) * 100
        : null;

    const rank_aviso =
      n_aviso > 0
        ? (avisoSorted.filter((v) => v < salario_mid).length / n_aviso) * 100
        : null;

    // Interpolación lineal entre p25/p50/p75 de Trabajando.cl
    const rank_trab =
      tP25 != null && tP50 != null && tP75 != null
        ? salario_mid <= tP25
          ? Math.max(1, Math.round((salario_mid / tP25) * 25))
          : salario_mid <= tP50
          ? Math.round(25 + ((salario_mid - tP25) / (tP50 - tP25)) * 25)
          : salario_mid <= tP75
          ? Math.round(50 + ((salario_mid - tP50) / (tP75 - tP50)) * 25)
          : Math.min(99, Math.round(75 + ((salario_mid - tP75) / tP75) * 12))
        : null;

    const rank_prior = blendPrior(rank_esi, rank_aviso, rank_trab);
    const raw = blend(rank_user, rank_prior);
    if (raw != null) percentil_usuario = Math.min(99, Math.max(1, Math.round(raw)));
  }

  // ── 8. Confianza ────────────────────────────────────────────────────────
  const confianza: "alta" | "media" | "baja" =
    n >= 15 || (n >= 3 && (n_esi >= 100 || n_aviso >= 30)) ? "alta"
    : n >= 5  || n_esi >= 30 || n_aviso >= 10 || !!trabPrior ? "media"
    : "baja";

  return {
    n,
    n_esi,
    n_aviso,
    n_trab: trabPrior ? TRAB_EQUIV : 0,
    promedio,
    p10,
    p25,
    p50,
    p75,
    p90,
    percentil_usuario,
    confianza,
    expanded,
    fuentes: { remuneralab: n, esi: n_esi, avisos: n_aviso, trabajando: trabPrior ? TRAB_EQUIV : 0 },
    fuente_descripcion,
    nivel_cascada,
    grupo_usado,
  };
}
