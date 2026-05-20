export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { clasificarCargo } from "@/lib/ciuo08";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const ESI_MIN  = 20;
const ESI_FLOOR = 539_000;
const ESI_CEIL  = 10_000_000;

const REGIONES = [
  "Metropolitana",
  "Antofagasta",
  "Valparaíso",
  "Biobío",
  "La Araucanía",
  "O'Higgins",
  "Tarapacá",
  "Coquimbo",
  "Maule",
  "Los Lagos",
  "Ñuble",
  "Atacama",
];

type Weighted = { v: number; w: number };

function weightedAt(sorted: Weighted[], p: number, totalW: number): number {
  const target = (p / 100) * totalW;
  let cum = 0;
  for (const { v, w } of sorted) {
    cum += w;
    if (cum >= target) return v;
  }
  return sorted[sorted.length - 1].v;
}

function edadProxy(anios: number, ciuo2: number | null): { min: number; max: number } {
  let inicio = 22;
  if (ciuo2 === 22) inicio = 30;
  else if (ciuo2 && Math.floor(ciuo2 / 10) === 2) inicio = 25;
  else if (ciuo2 && Math.floor(ciuo2 / 10) === 1) inicio = 28;
  else if (ciuo2 && Math.floor(ciuo2 / 10) === 3) inicio = 22;
  else inicio = 20;
  return {
    min: Math.max(18, inicio + anios - 2),
    max: Math.min(65, inicio + anios + 2),
  };
}

async function p50Regional(
  ciuo4: number | null,
  ciuo2: number | null,
  industria: string,
  region: string,
  edad: { min: number; max: number },
): Promise<{ p50: number; n: number } | null> {
  // Try ciuo4 + región
  if (ciuo4) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion")
      .eq("ciuo4", ciuo4)
      .eq("region", region)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      return calcP50(data!);
    }
  }

  // Try ciuo2 + región
  if (ciuo2) {
    const { data, error } = await supabase
      .from("registros_esi")
      .select("ingreso_mensual, factor_expansion")
      .gte("ciuo4", ciuo2 * 100)
      .lte("ciuo4", ciuo2 * 100 + 99)
      .eq("region", region)
      .gte("edad", edad.min)
      .lte("edad", edad.max)
      .gte("ingreso_mensual", ESI_FLOOR)
      .lte("ingreso_mensual", ESI_CEIL);
    if (!error && (data?.length ?? 0) >= ESI_MIN) {
      return calcP50(data!);
    }
  }

  // Try industria + región
  const { data, error } = await supabase
    .from("registros_esi")
    .select("ingreso_mensual, factor_expansion")
    .eq("industria", industria)
    .eq("region", region)
    .gte("edad", edad.min)
    .lte("edad", edad.max)
    .gte("ingreso_mensual", ESI_FLOOR)
    .lte("ingreso_mensual", ESI_CEIL);
  if (!error && (data?.length ?? 0) >= ESI_MIN) {
    return calcP50(data!);
  }

  return null;
}

function calcP50(rows: { ingreso_mensual: number; factor_expansion: number | null }[]): { p50: number; n: number } {
  const weighted: Weighted[] = rows.map(r => ({ v: r.ingreso_mensual, w: r.factor_expansion ?? 1 }));
  const sorted = [...weighted].sort((a, b) => a.v - b.v);
  const total  = sorted.reduce((s, r) => s + r.w, 0);
  return { p50: Math.round(weightedAt(sorted, 50, total)), n: rows.length };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cargo     = searchParams.get("cargo")     ?? "";
  const industria = searchParams.get("industria") ?? "";
  const anios     = parseInt(searchParams.get("anios_experiencia") ?? "3");

  const ciuoMatch = clasificarCargo(cargo);
  const ciuo4 = ciuoMatch ? parseInt(ciuoMatch.codigo) : null;
  const ciuo2 = ciuo4 ? Math.floor(ciuo4 / 100) : null;
  const edad  = edadProxy(anios, ciuo2);

  const results = await Promise.all(
    REGIONES.map(async (region) => {
      try {
        const r = await p50Regional(ciuo4, ciuo2, industria, region, edad);
        return r ? { region, p50: r.p50, n: r.n } : null;
      } catch {
        return null;
      }
    }),
  );

  const sorted = (results.filter(Boolean) as { region: string; p50: number; n: number }[])
    .sort((a, b) => b.p50 - a.p50);

  return NextResponse.json({ regiones: sorted });
}
