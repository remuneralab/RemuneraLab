export const runtime = 'edge';

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type EsiRow = {
  ingreso_mensual: number;
  factor_expansion: number | null;
  ano_encuesta: number | null;
  region: string | null;
  categoria_ocupacion: string | null;
};

type Weighted = { v: number; w: number };

const YEAR_NOW = new Date().getFullYear();
const ESI_FLOOR = 100_000;
const ESI_CEIL  = 10_000_000;

function decayFactor(ano: number | null): number {
  return Math.exp(-0.2 * Math.max(0, YEAR_NOW - (ano ?? 2024)));
}

function weightedAt(sorted: Weighted[], p: number, totalW: number): number {
  const target = (p / 100) * totalW;
  let cum = 0;
  for (const { v, w } of sorted) {
    cum += w;
    if (cum >= target) return v;
  }
  return sorted[sorted.length - 1]?.v ?? 0;
}

function computeStats(rows: EsiRow[]) {
  if (rows.length === 0) return null;
  const weighted: Weighted[] = rows.map((r) => ({
    v: r.ingreso_mensual,
    w: (r.factor_expansion ?? 1) * decayFactor(r.ano_encuesta),
  }));
  const sorted = [...weighted].sort((a, b) => a.v - b.v);
  const totalW = sorted.reduce((s, r) => s + r.w, 0);
  return {
    p25: Math.round(weightedAt(sorted, 25, totalW)),
    p50: Math.round(weightedAt(sorted, 50, totalW)),
    p75: Math.round(weightedAt(sorted, 75, totalW)),
    n:   rows.length,
  };
}

// Industria values in registros_esi per sector
const SECTOR_INDUSTRIAS: Record<string, string[]> = {
  salud:      ["Salud"],
  finanzas:   ["Finanzas", "Finanzas y Seguros"],
  mineria:    ["Minería"],
  turismo:    ["Turismo"],
  tecnologia: [],  // sin categoría propia en ESI — se usa CIUO 25xx/35xx
};

// CIUO-2 prefix for sectors where industry doesn't map cleanly
const SECTOR_CIUO2: Record<string, number[]> = {
  tecnologia: [25, 35],  // TIC professionals + TIC technicians
};

export type DashboardB2BResponse = {
  sector: string;
  p25: number;
  p50: number;
  p75: number;
  n_esi: number;
  confianza: "alta" | "media" | "baja";
  por_tipo: {
    publico:   { p50: number; n: number } | null;
    privado:   { p50: number; n: number } | null;
    independiente: { p50: number; n: number } | null;
  };
  por_region: Array<{ region: string; p50: number; n: number }>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector")?.toLowerCase() ?? "";

  const industrias = SECTOR_INDUSTRIAS[sector];
  const ciuo2Groups = SECTOR_CIUO2[sector];

  if (industrias === undefined) {
    return NextResponse.json({ error: "Sector no reconocido" }, { status: 400 });
  }

  let rows: EsiRow[] = [];

  // Query por industria (todos los sectores excepto tecnología)
  if (industrias.length > 0) {
    for (const ind of industrias) {
      let query = supabase
        .from("registros_esi")
        .select("ingreso_mensual, factor_expansion, ano_encuesta, region, categoria_ocupacion")
        .eq("industria", ind)
        .gte("ingreso_mensual", ESI_FLOOR)
        .lte("ingreso_mensual", ESI_CEIL)
        .limit(10000);

      const { data, error } = await query;
      if (!error && data) rows = rows.concat(data as EsiRow[]);
    }
  }

  // Query por CIUO-2 para tecnología
  if (ciuo2Groups && ciuo2Groups.length > 0) {
    for (const ciuo2 of ciuo2Groups) {
      const { data, error } = await supabase
        .from("registros_esi")
        .select("ingreso_mensual, factor_expansion, ano_encuesta, region, categoria_ocupacion")
        .gte("ciuo4", ciuo2 * 100)
        .lte("ciuo4", ciuo2 * 100 + 99)
        .gte("ingreso_mensual", ESI_FLOOR)
        .lte("ingreso_mensual", ESI_CEIL)
        .limit(10000);
      if (!error && data) rows = rows.concat(data as EsiRow[]);
    }
  }

  const global = computeStats(rows);
  if (!global) {
    return NextResponse.json({ error: "Sin datos suficientes para este sector" }, { status: 404 });
  }

  // Breakdown por tipo de empleo
  const tipos = ["asalariado_publico", "asalariado_privado", "independiente"] as const;
  const porTipo: DashboardB2BResponse["por_tipo"] = {
    publico: null, privado: null, independiente: null,
  };
  for (const tipo of tipos) {
    const subRows = rows.filter((r) => r.categoria_ocupacion === tipo);
    const stats = computeStats(subRows);
    if (stats && stats.n >= 10) {
      const key = tipo === "asalariado_publico" ? "publico"
        : tipo === "asalariado_privado" ? "privado" : "independiente";
      porTipo[key] = { p50: stats.p50, n: stats.n };
    }
  }

  // Breakdown por región (solo si hay suficientes datos)
  const regionMap = new Map<string, EsiRow[]>();
  for (const r of rows) {
    if (!r.region) continue;
    if (!regionMap.has(r.region)) regionMap.set(r.region, []);
    regionMap.get(r.region)!.push(r);
  }
  const porRegion: DashboardB2BResponse["por_region"] = [];
  for (const [region, rRows] of regionMap.entries()) {
    const stats = computeStats(rRows);
    if (stats && stats.n >= 10) {
      porRegion.push({ region, p50: stats.p50, n: stats.n });
    }
  }
  porRegion.sort((a, b) => b.n - a.n);

  const confianza: DashboardB2BResponse["confianza"] =
    global.n >= 500 ? "alta" : global.n >= 100 ? "media" : "baja";

  const response: DashboardB2BResponse = {
    sector,
    p25: global.p25,
    p50: global.p50,
    p75: global.p75,
    n_esi: global.n,
    confianza,
    por_tipo: porTipo,
    por_region: porRegion,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
  });
}
