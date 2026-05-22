import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function enviarEmail(params: {
  mensaje: string;
  email?: string | null;
  url_origen?: string | null;
  cargo?: string | null;
  industria?: string | null;
  region?: string | null;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const esSi  = params.mensaje.startsWith("[RATING: SÍ]");
  const esNo  = params.mensaje.startsWith("[RATING: NO]");
  const asunto = esSi
    ? "👍 RemuneraLab — Feedback positivo"
    : esNo
    ? "👎 RemuneraLab — Feedback negativo"
    : "💬 RemuneraLab — Nuevo comentario";

  const contexto = [
    params.cargo     && `Cargo: ${params.cargo}`,
    params.industria && `Industria: ${params.industria}`,
    params.region    && `Región: ${params.region}`,
    params.url_origen && `URL: ${params.url_origen}`,
    params.email     && `Email usuario: ${params.email}`,
  ].filter(Boolean).join("\n");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RemuneraLab <onboarding@resend.dev>",
      to:   ["remuneralab@gmail.com"],
      subject: asunto,
      text: `${params.mensaje}\n\n---\n${contexto}`,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, mensaje, url_origen, cargo, industria, region } = await req.json();

    if (!mensaje?.trim()) {
      return NextResponse.json({ error: "mensaje requerido" }, { status: 400 });
    }

    const { error } = await supabase.from("mensajes_contacto").insert({
      email:      email || null,
      mensaje:    mensaje.trim(),
      url_origen: url_origen || null,
      cargo:      cargo    || null,
      industria:  industria || null,
      region:     region   || null,
    });

    if (error) {
      console.error("contacto:", error.message);
      return NextResponse.json({ error: "error interno" }, { status: 500 });
    }

    // fire-and-forget — no bloquea la respuesta al usuario
    enviarEmail({ mensaje: mensaje.trim(), email, url_origen, cargo, industria, region })
      .catch(console.error);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
