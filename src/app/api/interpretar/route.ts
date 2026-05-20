export const runtime = 'edge';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { cargo, industria, anios_experiencia, region, salario_mid, percentil, p25, p50, p75, n, confianza } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const prompt = `Mercado laboral Chile. Responde en 2 oraciones, sin markdown.
Cargo: ${cargo}, ${industria}, ${anios_experiencia} años, ${region}.
Salario: $${salario_mid.toLocaleString("es-CL")} CLP. Percentil ${percentil}. P50: $${p50?.toLocaleString("es-CL")}. P75: $${p75?.toLocaleString("es-CL")}. Confianza: ${confianza}.`;

  try {
    const result = await model.generateContent(prompt);
    const interpretacion = result.response.text();
    return NextResponse.json({ interpretacion });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
