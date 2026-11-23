import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Se prueban en orden: si uno está saturado o no existe, se pasa al siguiente.
const MODELOS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

export async function POST(req: NextRequest) {
  const { cargo, industria, anios_experiencia, region, salario_mid, percentil, p25, p50, p75, n, confianza } = await req.json();

  const prompt = `Mercado laboral Chile. Responde en 2 oraciones, sin markdown.
Cargo: ${cargo}, ${industria}, ${anios_experiencia} años, ${region}.
Salario: $${salario_mid.toLocaleString("es-CL")} CLP. Percentil ${percentil}. P50: $${p50?.toLocaleString("es-CL")}. P75: $${p75?.toLocaleString("es-CL")}. Confianza: ${confianza}.`;

  let ultimo: unknown;
  for (const nombre of MODELOS) {
    try {
      const model = genAI.getGenerativeModel({ model: nombre }, { timeout: 12_000 });
      const result = await model.generateContent(prompt);
      return NextResponse.json({ interpretacion: result.response.text() });
    } catch (err) {
      ultimo = err;
      console.error(`Gemini error [${nombre}]:`, err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }
  return NextResponse.json({ error: String(ultimo) }, { status: 500 });
}
