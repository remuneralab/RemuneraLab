export const runtime = 'edge';

import { NextResponse } from "next/server";
import { calcularBenchmark } from "@/lib/benchmark";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cargo = searchParams.get("cargo") ?? "";
  const industria = searchParams.get("industria") ?? "";
  const anios = parseInt(searchParams.get("anios_experiencia") ?? "0");
  const region = searchParams.get("region") ?? "";
  const salario_min = searchParams.get("salario_min");
  const salario_max = searchParams.get("salario_max");

  const salario_mid =
    salario_min && salario_max
      ? Math.round((parseInt(salario_min) + parseInt(salario_max)) / 2)
      : undefined;

  try {
    const resultado = await calcularBenchmark(cargo, industria, anios, region, salario_mid);
    return NextResponse.json(resultado);
  } catch {
    return NextResponse.json({ error: "Error al calcular benchmark" }, { status: 500 });
  }
}
