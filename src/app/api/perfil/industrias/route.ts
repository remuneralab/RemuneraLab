export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { calcularBenchmark } from "@/lib/benchmark";

const INDUSTRIAS = [
  "Tecnología",
  "Finanzas y Seguros",
  "Minería",
  "Salud",
  "Manufactura / Industria",
  "Retail / Comercio",
  "Construcción",
  "Educación",
  "Transporte y Logística",
  "Gobierno / Sector Público",
  "Servicios",
  "Agricultura",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cargo = searchParams.get("cargo") ?? "";
  const region = searchParams.get("region") ?? "";
  const anios = parseInt(searchParams.get("anios_experiencia") ?? "3");

  const results = await Promise.all(
    INDUSTRIAS.map(async (industria) => {
      try {
        const b = await calcularBenchmark(cargo, industria, anios, region, undefined);
        return { industria, p50: b.p50 ?? null, n: b.n ?? 0 };
      } catch {
        return { industria, p50: null, n: 0 };
      }
    }),
  );

  const sorted = results
    .filter((r) => r.p50 !== null && r.n >= 3)
    .sort((a, b) => (b.p50 ?? 0) - (a.p50 ?? 0));

  return NextResponse.json({ industrias: sorted });
}
