import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("registros_avisos")
    .select("industria, region");

  if (error || !data) return NextResponse.json({ sectores: [], regiones: [] });

  const sectorCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};

  for (const row of data) {
    if (row.industria) sectorCounts[row.industria] = (sectorCounts[row.industria] || 0) + 1;
    if (row.region)    regionCounts[row.region]    = (regionCounts[row.region]    || 0) + 1;
  }

  const sectores = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, count]) => ({ nombre, count }));

  const regiones = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, count]) => ({ nombre, count }));

  return NextResponse.json({ sectores, regiones });
}
