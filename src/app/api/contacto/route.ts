export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, mensaje, url_origen } = await req.json();

    if (!mensaje?.trim()) {
      return NextResponse.json({ error: "mensaje requerido" }, { status: 400 });
    }

    const { error } = await supabase.from("mensajes_contacto").insert({
      email: email || null,
      mensaje: mensaje.trim(),
      url_origen: url_origen || null,
    });

    if (error) {
      console.error("contacto:", error.message);
      return NextResponse.json({ error: "error interno" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
