import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isPublicDomain, extractDomain } from "@/lib/b2b-auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const body = await req.json();
  const {
    user_id, email, nombre_contacto, cargo_contacto,
    razon_social, rut_empresa, tamano_empresa, sector,
  } = body as Record<string, string>;

  if (!user_id || !email || !nombre_contacto || !razon_social || !tamano_empresa || !sector) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // TODO: restaurar validación de dominio corporativo antes de producción
  // if (isPublicDomain(email)) {
  //   return NextResponse.json({ error: "Email corporativo requerido" }, { status: 400 });
  // }

  // Idempotente: si ya existe, no duplicar
  const { data: existing } = await supabaseAdmin
    .from("empresas_b2b")
    .select("id")
    .eq("user_id", user_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabaseAdmin.from("empresas_b2b").insert({
    user_id,
    email_corporativo: email,
    dominio:           extractDomain(email),
    nombre_contacto,
    cargo_contacto:    cargo_contacto ?? "",
    razon_social,
    rut_empresa:       rut_empresa || null,
    tamano_empresa,
    sector,
    estado:            "pendiente_email",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
