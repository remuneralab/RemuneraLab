import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("registros_avisos")
    .select("industria");

  if (error || !data) return NextResponse.json([]);

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.industria) counts[row.industria] = (counts[row.industria] || 0) + 1;
  }

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([sector, count]) => ({ sector, count }));

  return NextResponse.json(top);
}
