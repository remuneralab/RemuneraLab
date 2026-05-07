import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  return NextResponse.json({ id: data.id });
}
