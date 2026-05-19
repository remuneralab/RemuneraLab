import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type CargoCsv = { cargo: string; region: string };

const STOPWORDS = new Set([
  "de", "en", "la", "el", "los", "las", "y", "o", "del", "al",
  "e", "a", "por", "para", "con", "un", "una", "le", "lo", "su",
  "se", "que", "del", "es", "son",
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

function matchScore(avisoTitle: string, kws: string[]): number {
  const t = normalize(avisoTitle);
  return kws.filter(k => t.includes(k)).length;
}

export async function POST(req: Request) {
  const { cargos, sector: _sector }: { cargos: CargoCsv[]; sector: string } = await req.json();

  const now    = Date.now();
  const DAY    = 86_400_000;
  const cut90  = new Date(now - 90  * DAY).toISOString();
  const cut180 = new Date(now - 180 * DAY).toISOString();

  // One broad query — presión de mercado es transversal a sectores
  const { data: avisos, error } = await supabase
    .from("registros_avisos")
    .select("cargo_original, created_at")
    .gte("created_at", cut180)
    .not("cargo_original", "is", null)
    .limit(12000);

  if (error || !avisos) {
    return NextResponse.json({ results: [], meta: null }, { status: 500 });
  }

  const avisos90   = avisos.filter(a => a.created_at >= cut90);
  const avisosPrev = avisos.filter(a => a.created_at <  cut90);

  const results = cargos.map(({ cargo, region }) => {
    const kws = keywords(cargo);
    if (kws.length === 0) {
      return { cargo, region, count_90d: 0, count_prev: 0, delta_pct: null, presion: null as null };
    }

    // threshold=1: basta con un keyword — los cargos especializados usan términos
    // ocupacionales que no aparecen en el DB, así que el anchor es el rol genérico
    // (técnico, supervisor, analista, etc.) que sí está presente en avisos.
    const threshold = 1;

    const count_90d  = avisos90.filter(a   => matchScore(a.cargo_original ?? "", kws) >= threshold).length;
    const count_prev = avisosPrev.filter(a => matchScore(a.cargo_original ?? "", kws) >= threshold).length;

    const delta_pct: number | null = count_prev > 0
      ? Math.round(((count_90d - count_prev) / count_prev) * 100)
      : null;

    const presion: "alta" | "media" | "baja" =
      count_90d >= 20 ? "alta" :
      count_90d >= 5  ? "media" : "baja";

    return { cargo, region, count_90d, count_prev, delta_pct, presion };
  });

  return NextResponse.json({
    results,
    meta: {
      total_avisos_90d:  avisos90.length,
      total_avisos_prev: avisosPrev.length,
      period_from:       cut180.slice(0, 10),
      period_mid:        cut90.slice(0,  10),
      period_to:         new Date(now).toISOString().slice(0, 10),
    },
  });
}
