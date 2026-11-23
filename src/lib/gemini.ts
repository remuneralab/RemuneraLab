import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Se prueban en orden: si uno está saturado (503), no existe o tarda demasiado, se pasa al siguiente.
const MODELOS = [
  ...(process.env.GEMINI_MODEL_LIQUIDACION ? [process.env.GEMINI_MODEL_LIQUIDACION] : []),
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-3.5-flash",
];
const TIMEOUT_MS = 15_000;

async function generar(partes: Part[], json: boolean, temperature: number, etiqueta: string): Promise<string> {
  let ultimo: unknown;
  for (const nombre of MODELOS) {
    try {
      const model = genAI.getGenerativeModel(
        { model: nombre, generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}) } },
        { timeout: TIMEOUT_MS },
      );
      const result = await model.generateContent(partes);
      return result.response.text();
    } catch (err) {
      ultimo = err;
      console.error(`${etiqueta} [${nombre}]:`, err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }
  throw ultimo;
}

export async function generarJSON<T>(partes: Part[], etiqueta = "gemini"): Promise<T> {
  return JSON.parse(await generar(partes, true, 0, etiqueta)) as T;
}

export async function generarTexto(partes: Part[], etiqueta = "gemini"): Promise<string> {
  return (await generar(partes, false, 0.2, etiqueta)).trim();
}
