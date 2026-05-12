import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calcularBenchmark } from "@/lib/benchmark";

export async function POST(request: Request) {
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

  // Validación anti-datos-aberrantes: rechaza si salario_mid > 4× P75 del benchmark ESI
  // (solo cuando hay suficientes registros ESI para hacer la comparación confiable)
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
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el registro" }, { status: 500 });
  }

  // Store CIUO code if provided — requires column ciuo_codigo TEXT in registros_salariales
  if (ciuo_codigo && data?.id) {
    await supabase
      .from("registros_salariales")
      .update({ ciuo_codigo })
      .eq("id", data.id);
  }

  return NextResponse.json({ id: data.id });
}
