import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SUSCRIPCION, tieneSuscripcion } from "@/lib/suscripcion";
import { revisarLiquidacion, nivelCaso, type Extraccion, type Hallazgo, type NivelCaso } from "@/lib/liquidacion";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Se prueban en orden: si uno está saturado (503), no existe o tarda demasiado, se pasa al siguiente.
const MODELOS = [
  ...(process.env.GEMINI_MODEL_LIQUIDACION ? [process.env.GEMINI_MODEL_LIQUIDACION] : []),
  "gemini-flash-lite-latest", // rápido; basta porque solo extrae y redacta (las cuentas las hace el código)
  "gemini-flash-latest",
  "gemini-3.5-flash",
];
const TIMEOUT_MS = 15_000;

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_BYTES = 8 * 1024 * 1024;

// Paso 1: la IA SOLO transcribe y clasifica. No calcula ni opina sobre legalidad.
const PROMPT_EXTRACCION = `Transcribe la liquidación de sueldo chilena adjunta. Responde SOLO con JSON válido, con esta forma:
{
  "es_liquidacion": boolean,
  "legible": boolean,
  "periodo": string | null,
  "empleador": string | null,
  "cargo": string | null,
  "tipo_contrato": "indefinido" | "plazo_fijo" | "obra" | null,
  "jornada_horas_semanales": number | null,
  "sistema_salud": "fonasa" | "isapre" | null,
  "items": [ { "nombre": string, "monto": number,
               "tipo": "haber_imponible" | "haber_no_imponible" | "descuento_legal" | "descuento_otro",
               "categoria": "sueldo_base" | "gratificacion" | "horas_extra" | "otro_haber" | "afp" | "salud" | "cesantia" | "impuesto" | "otro_descuento",
               "horas": number | null, "porcentaje": number | null } ],
  "total_imponible": number | null,
  "total_haberes": number | null,
  "total_descuentos": number | null,
  "liquido_a_pagar": number | null,
  "notas": string[]
}
Reglas:
- Copia los montos EXACTAMENTE como aparecen en el documento (enteros en pesos, sin puntos). No los corrijas ni recalcules aunque parezcan incorrectos.
- Los totales también se copian tal cual aparecen; si el documento no muestra un total, usa null.
- Una línea por cada ítem del documento. No incluyas las filas de totales dentro de "items".
- descuento_legal = AFP, salud, seguro de cesantía, impuesto único. descuento_otro = anticipos, préstamos, cuotas, otros.
- Colación, movilización, viáticos y asignaciones similares son haber_no_imponible salvo que el documento diga otra cosa.
- "horas": cantidad de horas solo para horas extra, si aparece. "porcentaje": tasa indicada en el documento (p. ej. 7 para 7%), si aparece.
- "notas": observaciones breves sobre el documento (p. ej. ítems ilegibles). Sin opiniones legales.
- No incluyas RUT ni datos personales del trabajador.
- Si no es una liquidación o no se puede leer, marca es_liquidacion/legible en false y deja items vacío.`;

// Paso 3: la IA redacta a partir de hallazgos YA verificados por código.
function promptAsesoria(x: Extraccion, h: Hallazgo[], nivel: NivelCaso) {
  const ruta = nivel === "grave"
    ? "El caso es GRAVE: recomienda consultar a un abogado laboral, y como alternativa la Inspección del Trabajo."
    : "El caso es CORREGIBLE: recomienda primero conversar con la jefatura o RR.HH. y pedir la corrección por escrito; si no se corrige, acudir a la Inspección del Trabajo. NO menciones abogados.";
  return `Eres asesor laboral en Chile. Estos son los hallazgos, ya verificados, de la revisión de una liquidación de sueldo
(período ${x.periodo ?? "s/i"}, cargo ${x.cargo ?? "s/i"}, contrato ${x.tipo_contrato ?? "s/i"}):
${JSON.stringify(h, null, 1)}

Responde SOLO con JSON: { "resumen": string, "asesoria": string }
- "resumen": 1-2 oraciones con el estado general de la liquidación.
- "asesoria": 3-4 oraciones en español de Chile, cercanas y prácticas: qué significan los errores y advertencias, priorizando los que afectan dinero. ${ruta}
- No cites artículos ni leyes (se muestran aparte). No incluyas teléfonos ni enlaces.
- No uses las palabras "grave" ni "corregible" ni repitas estas instrucciones. Habla directo al trabajador.
- Para montos pagados de menos, di "te estarían pagando menos" o "dinero que podrían deberte"; nunca "a tu favor".
- Básate SOLO en los hallazgos. No inventes cifras ni agregues problemas nuevos. Lenguaje prudente ("posible error").`;
}

async function generarJSON<T>(partes: Part[]): Promise<T> {
  let ultimo: unknown;
  for (const nombre of MODELOS) {
    try {
      const model = genAI.getGenerativeModel(
        { model: nombre, generationConfig: { responseMimeType: "application/json", temperature: 0 } },
        { timeout: TIMEOUT_MS },
      );
      const result = await model.generateContent(partes);
      return JSON.parse(result.response.text()) as T;
    } catch (err) {
      ultimo = err;
      console.error(`liquidacion/analizar [${nombre}]:`, err instanceof Error ? err.message.slice(0, 200) : err);
    }
  }
  throw ultimo;
}

export async function POST(req: NextRequest) {
  if (!tieneSuscripcion(req.cookies.get(COOKIE_SUSCRIPCION)?.value)) {
    return NextResponse.json({ error: "Necesitas una suscripción activa." }, { status: 401 });
  }

  let archivo: File | null = null;
  try {
    const f = (await req.formData()).get("archivo");
    archivo = f instanceof File ? f : null;
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo." }, { status: 400 });
  }
  if (!archivo) return NextResponse.json({ error: "Adjunta tu liquidación." }, { status: 400 });
  if (!TIPOS_PERMITIDOS.includes(archivo.type))
    return NextResponse.json({ error: "Formato no soportado. Usa PDF, JPG, PNG o WEBP." }, { status: 415 });
  if (archivo.size > MAX_BYTES)
    return NextResponse.json({ error: "El archivo supera los 8 MB." }, { status: 413 });

  const base64 = Buffer.from(await archivo.arrayBuffer()).toString("base64");

  // 1. Extracción
  let x: Extraccion;
  try {
    x = await generarJSON<Extraccion>([{ inlineData: { mimeType: archivo.type, data: base64 } }, { text: PROMPT_EXTRACCION }]);
  } catch {
    return NextResponse.json({ error: "No pudimos leer el documento. Intenta de nuevo en unos minutos." }, { status: 502 });
  }

  const datos = {
    periodo: x.periodo, empleador: x.empleador, cargo: x.cargo, tipo_contrato: x.tipo_contrato,
    sueldo_base: x.items?.filter((i) => i.categoria === "sueldo_base").reduce((s, i) => s + i.monto, 0) || null,
    total_haberes: x.total_haberes, total_imponible: x.total_imponible,
    total_descuentos: x.total_descuentos, liquido_a_pagar: x.liquido_a_pagar,
  };

  if (!x.es_liquidacion || !x.legible) {
    return NextResponse.json({ analisis: {
      es_liquidacion: x.es_liquidacion, legible: x.legible, datos, hallazgos: [], asesoria: "", recomienda_abogado: false,
      nivel: "sin_problemas", diferencia_total: 0,
      resumen: x.notas?.[0] ?? "El archivo no parece ser una liquidación de sueldo legible. Prueba con un PDF o una foto más nítida.",
    } });
  }

  // 2. Verificaciones deterministas
  const hallazgos = revisarLiquidacion(x);
  const nErrores  = hallazgos.filter((h) => h.tipo === "error").length;
  const nAdv      = hallazgos.filter((h) => h.tipo === "advertencia").length;
  const { nivel, diferencia_total } = nivelCaso(hallazgos);
  const grave = nivel === "grave";

  // 3. Redacción (si falla, se usa un texto base)
  let resumen  = nErrores
    ? `Encontramos ${nErrores} posible${nErrores > 1 ? "s" : ""} error${nErrores > 1 ? "es" : ""} y ${nAdv} punto${nAdv !== 1 ? "s" : ""} a revisar en tu liquidación.`
    : nAdv ? `No encontramos errores de cálculo, pero hay ${nAdv} punto${nAdv !== 1 ? "s" : ""} a revisar.` : "Tu liquidación no presenta problemas en los puntos revisados.";
  let asesoria = grave
    ? "Los errores encontrados afectan tu sueldo o tus cotizaciones. Guarda tus liquidaciones y te recomendamos consultar a un abogado laboral; también puedes acudir a la Inspección del Trabajo."
    : nErrores
    ? "Conversa con tu jefatura o RR.HH. y pide por escrito que corrijan los puntos marcados como posible error. Si no se corrigen, puedes consultar gratis en la Inspección del Trabajo."
    : "Guarda tus liquidaciones y revisa tu contrato para confirmar los puntos marcados. Ante cualquier duda, puedes consultar en la Dirección del Trabajo.";
  try {
    const r = await generarJSON<{ resumen: string; asesoria: string }>([{ text: promptAsesoria(x, hallazgos, nivel) }]);
    if (r.resumen) resumen = r.resumen;
    if (r.asesoria) asesoria = r.asesoria;
  } catch { /* se mantiene el texto base */ }

  return NextResponse.json({ analisis: {
    es_liquidacion: true, legible: true, resumen, datos, hallazgos, asesoria,
    recomienda_abogado: nivel === "grave", nivel, diferencia_total,
  } });
}
