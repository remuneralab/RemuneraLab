import { supabase } from "@/lib/supabase";

function midpoint(min: number, max: number) {
  return Math.round((min + max) / 2);
}

function at(sorted: number[], p: number) {
  return sorted[Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1)];
}

export interface BenchmarkResult {
  n: number;
  promedio: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  percentil_usuario: number | null;
  confianza: "alta" | "media" | "baja";
  expanded: boolean;
}

export async function calcularBenchmark(
  cargo: string,
  industria: string,
  anios_experiencia: number,
  region: string,
  salario_mid?: number
): Promise<BenchmarkResult> {
  let { data, error } = await supabase
    .from("registros_salariales")
    .select("salario_min, salario_max")
    .ilike("cargo", `%${cargo}%`)
    .eq("industria", industria)
    .gte("anios_experiencia", anios_experiencia - 2)
    .lte("anios_experiencia", anios_experiencia + 2)
    .eq("region", region);

  if (error) throw new Error("Error al consultar datos");

  let expanded = false;

  if ((data?.length ?? 0) < 5) {
    const { data: data2, error: error2 } = await supabase
      .from("registros_salariales")
      .select("salario_min, salario_max")
      .ilike("cargo", `%${cargo}%`)
      .eq("industria", industria)
      .gte("anios_experiencia", anios_experiencia - 2)
      .lte("anios_experiencia", anios_experiencia + 2);

    if (!error2 && data2) {
      data = data2;
      expanded = true;
    }
  }

  const registros = data ?? [];
  const n = registros.length;

  if (n === 0) {
    return {
      n: 0,
      promedio: null,
      p25: null,
      p50: null,
      p75: null,
      percentil_usuario: null,
      confianza: "baja",
      expanded,
    };
  }

  const midpoints = registros.map((r) => midpoint(r.salario_min, r.salario_max));
  const sorted = [...midpoints].sort((a, b) => a - b);

  const p25 = at(sorted, 25);
  const p50 = at(sorted, 50);
  const p75 = at(sorted, 75);
  const promedio = Math.round(midpoints.reduce((a, b) => a + b, 0) / n);

  let percentil_usuario: number | null = null;
  if (salario_mid != null) {
    const menores = midpoints.filter((v) => v < salario_mid).length;
    const iguales = midpoints.filter((v) => v === salario_mid).length;
    percentil_usuario = Math.min(
      99,
      Math.max(1, Math.round(((menores + 0.5 * iguales) / n) * 100))
    );
  }

  const confianza: "alta" | "media" | "baja" =
    n >= 15 ? "alta" : n >= 5 ? "media" : "baja";

  return { n, promedio, p25, p50, p75, percentil_usuario, confianza, expanded };
}
