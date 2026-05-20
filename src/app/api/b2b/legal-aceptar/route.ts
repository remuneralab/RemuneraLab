export const runtime = 'edge';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LEGAL_HASHES } from "@/lib/b2b-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id } = body as { user_id: string };

  if (!user_id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "";

  const { data: empresa, error: empErr } = await supabaseAdmin
    .from("empresas_b2b")
    .select("id, estado")
    .eq("user_id", user_id)
    .single();

  if (empErr || !empresa) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }

  if (empresa.estado === "activo") {
    return NextResponse.json({ ok: true }); // ya aceptó
  }

  const logs = (["terminos", "nda", "privacidad"] as const).map((doc) => ({
    empresa_id:    empresa.id,
    user_id,
    documento:     doc,
    version_hash:  LEGAL_HASHES[doc],
    ip_address:    ip,
    user_agent:    userAgent,
  }));

  const { error: logErr } = await supabaseAdmin.from("logs_legal_b2b").insert(logs);
  if (logErr) {
    return NextResponse.json({ error: logErr.message }, { status: 500 });
  }

  const fechaInicio = new Date();
  const fechaFin    = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + 60);

  const { error: updErr } = await supabaseAdmin
    .from("empresas_b2b")
    .update({
      estado:            "activo",
      fecha_inicio_demo: fechaInicio.toISOString(),
      fecha_fin_demo:    fechaFin.toISOString(),
    })
    .eq("id", empresa.id);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
