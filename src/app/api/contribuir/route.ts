import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calcularBenchmark } from "@/lib/benchmark";

const MAX_PERFILES_POR_IP = 3;
const VENTANA_HORAS       = 24;

function normalizarCargo(c: string): string {
  return c.trim().toLowerCase().replace(/\s+/g, " ");
}

const DEV_BYPASS_IPS = new Set(
  (process.env.DEV_BYPASS_IP ?? "").split(",").map(s => s.trim()).filter(Boolean)
);

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const skipLimits =
    process.env.NODE_ENV === "development" ||
    (ip !== null && DEV_BYPASS_IPS.has(ip));

  const body = await request.json();
  const {
    cargo,
    industria,
    anios_experiencia,
    region,
    tamano_empresa,
    salario_min,
    salario_max,
    ciuo_codigo,
    sexo,
  } = body;

  if (
    !cargo ||
    !industria ||
    anios_experiencia == null ||
    !region ||
    !tamano_empresa ||
    salario_min == null ||
    salario_max == null
  ) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  // Validación anti-datos-aberrantes
  const salario_mid = Math.round((salario_min + salario_max) / 2);
  try {
    const ref = await calcularBenchmark(cargo, industria, anios_experiencia, region);
    if (ref.p75 && ref.n_esi >= 10 && salario_mid > ref.p75 * 4) {
      return NextResponse.json(
        { error: "El rango salarial ingresado está fuera del rango esperado para este perfil. Verifica que hayas seleccionado el rango correcto." },
        { status: 422 }
      );
    }
  } catch {
    // Si el benchmark falla, no bloqueamos el registro
  }

  // ── Deduplicación por perfil ─────────────────────────────────────────────
  if (ip && !skipLimits) {
    const { data: existente } = await supabase
      .from("registros_salariales")
      .select("id, cargo")
      .eq("ip_address", ip)
      .eq("industria", industria)
      .eq("anios_experiencia", parseInt(anios_experiencia))
      .eq("region", region)
      .eq("tamano_empresa", tamano_empresa)
      .limit(5);

    if (existente && existente.length > 0) {
      const match = existente.find(
        (r) => normalizarCargo(r.cargo) === normalizarCargo(cargo)
      );
      if (match) {
        await supabase
          .from("registros_salariales")
          .update({
            cargo: cargo.trim(),
            salario_min,
            salario_max,
            ...(ciuo_codigo ? { ciuo_codigo } : {}),
          })
          .eq("id", match.id);
        return NextResponse.json({ id: match.id });
      }
    }
  }

  // ── Rate limiting por perfiles distintos ─────────────────────────────────
  if (ip && !skipLimits) {
    const desde24h = new Date(Date.now() - VENTANA_HORAS * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("registros_salariales")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("fecha_registro", desde24h);

    if ((count ?? 0) >= MAX_PERFILES_POR_IP) {
      return NextResponse.json(
        { error: "Ya registraste el máximo de respuestas permitidas por hoy. Vuelve mañana." },
        { status: 429 }
      );
    }
  }

  // ── Inserción ────────────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from("registros_salariales")
    .insert({
      cargo: cargo.trim(),
      industria,
      anios_experiencia: parseInt(anios_experiencia),
      region,
      tamano_empresa,
      salario_min,
      salario_max,
      ...(ip ? { ip_address: ip } : {}),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }

  const extras: Record<string, string> = {};
  if (ciuo_codigo) extras.ciuo_codigo = ciuo_codigo;
  if (sexo && ["M","F","O"].includes(sexo)) extras.sexo = sexo;

  if (Object.keys(extras).length > 0 && data?.id) {
    await supabase
      .from("registros_salariales")
      .update(extras)
      .eq("id", data.id);
  }

  return NextResponse.json({ id: data.id });
}
