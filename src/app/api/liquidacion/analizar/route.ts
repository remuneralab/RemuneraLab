import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SUSCRIPCION, tieneSuscripcion } from "@/lib/suscripcion";
import { revisarLiquidacion, nivelCaso, type Extraccion } from "@/lib/liquidacion";
import { generarJSON } from "@/lib/gemini";

export const maxDuration = 60;

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
    x = await generarJSON<Extraccion>([{ inlineData: { mimeType: archivo.type, data: base64 } }, { text: PROMPT_EXTRACCION }], "liquidacion/extraccion");
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
      es_liquidacion: x.es_liquidacion, legible: x.legible, datos, hallazgos: [],
      nivel: "sin_problemas", diferencia_total: 0, cotizaciones_faltantes: 0,
      resumen: x.notas?.[0] ?? "El archivo no parece ser una liquidación de sueldo legible. Prueba con un PDF o una foto más nítida.",
    } });
  }

  // 2. Verificaciones deterministas
  const hallazgos = revisarLiquidacion(x);
  const nErrores  = hallazgos.filter((h) => h.tipo === "error").length;
  const nAdv      = hallazgos.filter((h) => h.tipo === "advertencia").length;
  const { nivel, diferencia_total, cotizaciones_faltantes } = nivelCaso(hallazgos);
  const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

  const resumen = nErrores
    ? `Encontramos ${plural(nErrores, "posible error", "posibles errores")}${nAdv ? ` y ${plural(nAdv, "punto", "puntos")} a revisar` : ""} en tu liquidación.`
    : nAdv ? `No encontramos errores de cálculo, pero hay ${plural(nAdv, "punto", "puntos")} a revisar.`
    : "Tu liquidación no presenta problemas en los puntos revisados.";

  // La explicación la entrega Emma (/api/emma) cuando el usuario la pide.
  return NextResponse.json({ analisis: {
    es_liquidacion: true, legible: true, resumen, datos, hallazgos, nivel, diferencia_total, cotizaciones_faltantes,
  } });
}
