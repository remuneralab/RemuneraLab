import { NextResponse } from "next/server";
import { clasificarCargo } from "@/lib/ciuo08";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cargo = searchParams.get("cargo") ?? "";
  const result = clasificarCargo(cargo);
  return NextResponse.json({ cargo, result });
}
