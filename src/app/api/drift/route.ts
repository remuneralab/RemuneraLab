import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type CargoCsv = {
  cargo: string;
  region: string;
  salario_min: number;
  salario_max: number;
};

const STOPWORDS = new Set([
  "de", "en", "la", "el", "los", "las", "y", "o", "del", "al",
  "e", "a", "por", "para", "con", "un", "una", "le", "lo", "su",
  "se", "que", "es", "son",
]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s]/g, "");
}

function keywords(cargo: string): string[] {
  return normalize(cargo)
    .split(/\s+/)
    .filter(w => w.length >= 4 && !STOPWORDS.has(w));
}

function matchScore(title: string, kws: string[]): number {
  const t = normalize(title);
  return kws.filter(k => t.includes(k)).length;
}

function median(values: number[]): number | null {
  if (values.length < 3) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export async function POST(req: Request) {
  const { cargos }: { cargos: CargoCsv[]; sector: string } = await req.json();

  const now    = Date.now();
  const DAY    = 86_400_000;
  const cut90  = new Date(now - 90  * DAY).toISOString();
  const cut180 = new Date(now - 180 * DAY).toISOString();

  // Avisos con datos de salario — único insumo del drift
  const { data: avisos, error } = await supabase
    .from("registros_avisos")
    .select("cargo_original, salario_mid, created_at")
    .gte("created_at", cut180)
    .not("cargo_original", "is", null)
    .gt("salario_mid", 0)
    .limit(12000);

  if (error || !avisos) {
    return NextResponse.json({ results: [], meta: null }, { status: 500 });
  }

  const avisos90   = avisos.filter(a => a.created_at >= cut90);
  const avisosPrev = avisos.filter(a => a.created_at <  cut90);

  const results = cargos.map(({ cargo, region, salario_min, salario_max }) => {
    const kws = keywords(cargo);
    if (kws.length === 0) {
      return { cargo, region, mediana_90d: null, mediana_prev: null, drift_pct: null, n_90d: 0, n_prev: 0, tendencia: null as null };
    }

    const threshold = 1;

    const matched90   = avisos90.filter(a   => matchScore(a.cargo_original ?? "", kws) >= threshold);
    const matchedPrev = avisosPrev.filter(a => matchScore(a.cargo_original ?? "", kws) >= threshold);

    const mediana_90d  = median(matched90.map(a   => a.salario_mid as number));
    const mediana_prev = median(matchedPrev.map(a => a.salario_mid as number));

    const drift_pct: number | null =
      mediana_90d !== null && mediana_prev !== null
        ? Math.round(((mediana_90d - mediana_prev) / mediana_prev) * 100)
        : null;

    const tendencia: "alza" | "estable" | "baja" | null =
      drift_pct === null ? null :
      drift_pct >=  3   ? "alza"   :
      drift_pct <= -3   ? "baja"   : "estable";

    // Midpoint de la empresa para comparar vs mediana de mercado
    const empresa_mid = Math.round((salario_min + salario_max) / 2);
    const vs_mediana: number | null = mediana_90d
      ? Math.round(((empresa_mid - mediana_90d) / mediana_90d) * 100)
      : null;

    return {
      cargo, region,
      mediana_90d, mediana_prev,
      drift_pct, tendencia,
      empresa_mid, vs_mediana,
      n_90d:  matched90.length,
      n_prev: matchedPrev.length,
    };
  });

  return NextResponse.json({
    results,
    meta: {
      total_con_salario_90d:   avisos90.length,
      total_con_salario_prev:  avisosPrev.length,
      period_from: cut180.slice(0, 10),
      period_mid:  cut90.slice(0,  10),
      period_to:   new Date(now).toISOString().slice(0, 10),
    },
  });
}
