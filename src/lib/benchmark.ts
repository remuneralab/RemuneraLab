import { supabase } from "@/lib/supabase";
import { clasificarCargo } from "@/lib/ciuo08";

function midpoint(min: number, max: number) {
  return Math.round((min + max) / 2);
}

function at(sorted: number[], p: number) {
  return sorted[Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1)];
}

// Shrinkage constant: cuando n_real es 0, el resultado es 100% ESI.
// Con n_real = K, el resultado es 50/50. Con n_real >> K, domina el dato real.
const K = 30;
const ESI_MIN = 30;

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

  let esiData: { ingreso_mensual: number }[] | null = null;

  // Nivel 1: ciuo4 exacto + región
  if (ciuo4) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual")
      .eq("ciuo4", ciuo4)
      .eq("region", region);
    if (!error && (data?.length ?? 0) >= ESI_MIN) esiData = data;
  }

  // Nivel 2: ciuo4 exacto, nivel nacional
  if (!esiData && ciuo4) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual")
      .eq("ciuo4", ciuo4);
    if (!error && (data?.length ?? 0) >= ESI_MIN) esiData = data;
  }

  // Nivel 3: grupo CIUO-2 dígitos (e.g. 22xx = profesionales de salud) + región
  if (!esiData && ciuo2) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual")
      .gte("ciuo4", ciuo2 * 100)
      .lte("ciuo4", ciuo2 * 100 + 99)
      .eq("region", region);
    if (!error && (data?.length ?? 0) >= ESI_MIN) esiData = data;
  }

  // Nivel 4: grupo CIUO-2 dígitos, nivel nacional
  if (!esiData && ciuo2) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual")
      .gte("ciuo4", ciuo2 * 100)
      .lte("ciuo4", ciuo2 * 100 + 99);
    if (!error && (data?.length ?? 0) >= ESI_MIN) esiData = data;
  }

  // Nivel 5: fallback por industria + región (comportamiento anterior)
  if (!esiData) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual")
      .eq("industria", industria)
      .eq("region", region);
    if (!error && (data?.length ?? 0) >= ESI_MIN) esiData = data;
  }

  // Nivel 6: fallback por industria nacional
  if (!esiData) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual")
      .eq("industria", industria);
    if (!error) esiData = data ?? [];
  }

  if (!esiData) esiData = [];

  // ── 3. Arrays de salarios ────────────────────────────────────────────────
  const userRecords = userData ?? [];
  const esiRecords = esiData ?? [];
  const n = userRecords.length;
  const n_esi = esiRecords.length;

  const userMids = userRecords.map((r) => midpoint(r.salario_min, r.salario_max));
  const esiMids = esiRecords.map((r) => r.ingreso_mensual as number);

  const userSorted = [...userMids].sort((a, b) => a - b);
  const esiSorted = [...esiMids].sort((a, b) => a - b);

  // ── 4. Percentiles por fuente ───────────────────────────────────────────
  const uP25 = n > 0 ? at(userSorted, 25) : null;
  const uP50 = n > 0 ? at(userSorted, 50) : null;
  const uP75 = n > 0 ? at(userSorted, 75) : null;
  const uProm = n > 0 ? Math.round(userMids.reduce((a, b) => a + b, 0) / n) : null;

  const eP25 = n_esi > 0 ? at(esiSorted, 25) : null;
  const eP50 = n_esi > 0 ? at(esiSorted, 50) : null;
  const eP75 = n_esi > 0 ? at(esiSorted, 75) : null;
  const eProm = n_esi > 0 ? Math.round(esiMids.reduce((a, b) => a + b, 0) / n_esi) : null;

  // ── 5. Blend por shrinkage ──────────────────────────────────────────────
  // w_user → 0 cuando n=0; → 1 cuando n >> K
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
        ? (esiMids.filter((v) => v < salario_mid).length / n_esi) * 100
        : null;

    const raw = blend(rank_user, rank_esi);
    if (raw != null) percentil_usuario = Math.min(99, Math.max(1, Math.round(raw)));
  }

  // ── 7. Confianza (basada en contribuciones reales solamente) ────────────
  const confianza: "alta" | "media" | "baja" =
    n >= 15 ? "alta" : n >= 5 ? "media" : "baja";

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
  };
}
