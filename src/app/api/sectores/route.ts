export const runtime = 'edge';

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const INDUSTRIAS = [
  "Tecnología",
  "Salud",
  "Finanzas y Seguros",
  "Construcción",
  "Minería",
  "Educación",
  "Retail / Comercio",
  "Manufactura / Industria",
  "Transporte y Logística",
  "Servicios",
  "Agricultura",
  "Gastronomía / Restaurantes",
];

export async function GET() {
  // Count per industry using head queries (no row data transferred)
  const results = await Promise.all(
    INDUSTRIAS.map(async (industria) => {
      const { count } = await supabase
        .from("registros_avisos")
        .select("*", { count: "exact", head: true })
        .eq("industria", industria);
      return { sector: industria, count: count ?? 0 };
    })
  );

  const top = results
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const total = results.reduce((s, r) => s + r.count, 0);

  return NextResponse.json({ sectores: top, total });
}
