import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error, count } = await supabase
    .from("salarios")
    .select("industria, sueldo_mensual", { count: "exact" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ total: count, muestra: data?.slice(0, 5) });
}
