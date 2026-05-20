export const runtime = 'edge';

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sector = searchParams.get("sector");
  const page   = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

  const region     = searchParams.get("region");
  const conRegion  = searchParams.get("conRegion") === "1";
  const cargo      = searchParams.get("cargo")?.trim();

  let query = supabase
    .from("registros_avisos")
    .select("id, cargo_original, industria, region, salario_mid, url_aviso, modalidad, fecha_publicacion_texto, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

  if (sector && sector !== "Todos") {
    query = query.eq("industria", sector);
  }
  if (region && region !== "Todas") {
    query = query.eq("region", region);
  } else if (conRegion) {
    query = query.not("region", "is", null);
  }
  if (cargo) {
    query = query.ilike("cargo_original", `%${cargo}%`);
  }

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ ofertas: [], total: 0 }, { status: 500 });

  return NextResponse.json({ ofertas: data ?? [], total: count ?? 0, page_size: PAGE_SIZE });
}
