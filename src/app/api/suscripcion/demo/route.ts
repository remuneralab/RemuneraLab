import { NextResponse } from "next/server";
import { COOKIE_SUSCRIPCION, VALOR_SUSCRIPCION, DIAS_SUSCRIPCION } from "@/lib/suscripcion";

// "Pago" simulado: activa el acceso demo. Reemplazar por la pasarela real (webhook) más adelante.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SUSCRIPCION, VALOR_SUSCRIPCION, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS_SUSCRIPCION * 24 * 60 * 60,
  });
  return res;
}

// Cancelar la suscripción demo
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_SUSCRIPCION);
  return res;
}
