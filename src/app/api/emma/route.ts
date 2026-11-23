import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SUSCRIPCION, tieneSuscripcion } from "@/lib/suscripcion";
import { LEYES, type Hallazgo, type NivelCaso, type ContextoCaso } from "@/lib/liquidacion";
import { generarTexto } from "@/lib/gemini";

export const maxDuration = 60;

type Modo = "inicio" | "mas" | "pregunta";
interface Turno { pregunta: string; respuesta: string }
interface Cuerpo {
  modo: Modo;
  pregunta?: string;
  nivel: NivelCaso;
  contexto: ContextoCaso;
  hallazgos: Hallazgo[];
  diferencia_total: number;
  cotizaciones_faltantes?: number;
  datos?: Record<string, string | number | null>;
  historial: Turno[];
}

const NIVELES: NivelCaso[] = ["sin_problemas", "leve", "corregible", "grave"];
const MAX_PREGUNTA = 500;

// Línea de acción obligatoria según la gravedad. Emma nunca escala antes de tiempo.
// Base de conocimiento verificada (Código del Trabajo) para consultas fuera de la liquidación.
// Emma solo puede usar estas reglas y artículos; no debe calcular montos nuevos.
const CONOCIMIENTO = `VACACIONES (FERIADO ANUAL):
- Art. 67: con más de un año de servicio, 15 días hábiles de feriado al año con remuneración íntegra.
- Art. 69: el sábado se considera inhábil para el feriado (se cuentan de lunes a viernes, sin festivos).
- Art. 68: feriado progresivo: con 10 años de trabajo (con uno o más empleadores; de empleadores anteriores se consideran máximo 10 años) se suma 1 día hábil por cada 3 nuevos años trabajados.
- Art. 70: el feriado es continuo, pero lo que exceda de 10 días hábiles puede fraccionarse de común acuerdo.
- Art. 71: remuneración íntegra durante el feriado = el sueldo, si la remuneración es fija; si tiene partes variables, el promedio de lo ganado en los últimos 3 meses trabajados.
- Art. 73: el feriado no puede compensarse en dinero mientras dura el contrato. Solo al terminar el contrato se paga en dinero el feriado pendiente o proporcional (eso se calcula en el finiquito).
- Cómo responder: mientras el contrato está vigente NO hay un pago extra por vacaciones; el trabajador sigue recibiendo su remuneración íntegra (con sueldo fijo, su sueldo mensual habitual). Si el usuario tiene sueldo base fijo, puedes decir que durante sus vacaciones recibe su sueldo normal (usa el sueldo base de los datos leídos, sin calcular nada más). Si pregunta por el pago al terminar el contrato, explica que es el feriado proporcional del finiquito y que depende de su fecha de ingreso y salida.`;

const RUTA: Record<NivelCaso, string> = {
  sin_problemas: "La liquidación está correcta. Felicita brevemente y sugiere guardar sus liquidaciones. No sugieras acciones.",
  leve: "Hay puntos a revisar, no errores confirmados. El paso es preguntar y aclarar con su jefatura o RR.HH. PROHIBIDO sugerir la Inspección del Trabajo o un abogado.",
  corregible: "Hay errores que se pueden corregir conversando. El paso es pedir la corrección por escrito (un correo basta) a su jefatura o RR.HH. PROHIBIDO sugerir la Inspección del Trabajo o un abogado. Solo si el usuario pregunta qué hacer si no lo corrigen, explica que si el error se repite o el empleador se niega, puede ir a la Inspección del Trabajo o a un abogado laboral.",
  grave: "El caso es grave porque el problema se repite mes a mes o el empleador se negó a corregirlo. Ya no basta con conversar: recomienda acudir a la Inspección del Trabajo o derivar directamente a un abogado laboral (primera consulta gratis en RemuneraLab).",
};

// Formato de cada tipo de respuesta: texto plano con saltos de línea, ordenado y sin markdown.
const FORMATO: Record<Modo, string> = {
  inicio: `Máximo 70 palabras. Formato:
1) Una oración con lo esencial.
2) Bloque de resumen (solo si hay diferencias en dinero), de mayor a menor:
Cálculo:
• Concepto: lo que corresponde − lo que se pagó = diferencia
Total: $X
3) Una oración con el siguiente paso.`,
  mas: `Máximo 140 palabras. NO repitas el resumen anterior. Explica paso a paso CÓMO se llega a cada diferencia, usando las cifras intermedias que aparecen en el detalle de cada hallazgo (por ejemplo valor hora, recargo, horas, porcentaje, monto mínimo). Formato, un bloque por error, de mayor a menor impacto:
Concepto (norma):
1. primer paso con su cifra
2. segundo paso con su cifra
3. resultado: diferencia $X
Termina con una oración sobre qué pedir o hacer.`,
  pregunta: `Máximo 130 palabras. Responde SOLO lo que se preguntó: incluye únicamente los conceptos relacionados con la pregunta. Si involucra montos de su liquidación, responde SIEMPRE con este formato, una línea por paso:
Concepto (norma):
1. paso con su fórmula y cifra
2. paso con su fórmula y cifra
3. resultado
Y una oración final breve. Si no es un tema laboral chileno, dilo amablemente y ofrece ayuda con su liquidación.`,
};

function prompt(c: Cuerpo) {
  const contexto = [
    c.contexto.reiterado === true && "el usuario indica que el error se ha repetido en meses anteriores",
    c.contexto.reiterado === false && "el usuario indica que es la primera vez",
    c.contexto.negativa === true && "el usuario indica que pidió la corrección y su empleador se negó",
  ].filter(Boolean).join("; ") || "sin información adicional";

  const hallazgos = c.hallazgos
    .filter((h) => h.tipo !== "ok")
    .map((h) => `- [${h.tipo}] ${h.titulo}: ${h.detalle}${h.diferencia ? ` | ${h.diferencia_tipo === "cotizacion" ? `Falta en ${h.codigo === "afp" ? "su AFP" : "su salud"} (no es dinero en mano)` : "Dinero que deberían pagarle"}: $${Math.round(h.diferencia).toLocaleString("es-CL")}` : ""} (norma: ${LEYES[h.codigo]?.norma ?? "s/i"})`)
    .join("\n") || "- Sin errores ni advertencias.";

  const historial = c.historial.slice(-4)
    .map((t) => `Usuario: ${t.pregunta}\nEmma: ${t.respuesta}`).join("\n\n") || "(sin conversación previa)";

  const peticion = c.modo === "inicio" ? "Explícale al usuario el resultado de su liquidación."
    : c.modo === "mas" ? "El usuario pidió saber más sobre su caso."
    : `Pregunta del usuario: "${c.pregunta}"`;

  return `Eres Emma, la asistente IA laboral de RemuneraLab (Chile). Hablas cercano y claro, tuteando, en español de Chile, sin tecnicismos innecesarios.

Datos leídos de la liquidación: ${JSON.stringify(c.datos ?? {})}

Revisión de la liquidación del usuario (ya verificada por el sistema; las cifras están calculadas y son correctas):
${hallazgos}
Dinero que deberían pagarle al trabajador: ${c.diferencia_total > 0 ? "$" + c.diferencia_total.toLocaleString("es-CL") : "no aplica"}
Cotizaciones faltantes (van a sus fondos, NO es dinero en mano): ${["afp", "salud"].map((cod) => {
    const d = c.hallazgos.find((h) => h.codigo === cod && h.tipo === "error" && h.diferencia_tipo === "cotizacion")?.diferencia;
    return d ? `${cod === "afp" ? "AFP" : "Salud"} $${Math.round(d).toLocaleString("es-CL")}` : null;
  }).filter(Boolean).join("; ") || "no aplica"}
Contexto: ${contexto}
Gravedad: ${c.nivel}

Línea de acción OBLIGATORIA (aplica a los errores de la liquidación): ${RUTA[c.nivel]}

Base de conocimiento verificada (úsala para preguntas sobre estos temas):
${CONOCIMIENTO}

Conversación previa:
${historial}

${peticion}

Reglas:
- ${FORMATO[c.modo]}
- Sin markdown (nada de asteriscos ni #), sin emojis, sin saludos.
- Tono cercano y prudente: habla de "posibles errores" o "diferencias a tu favor que deberían pagarte"; nunca acuses al empleador de abuso ni de mala fe.
- NUNCA sumes el dinero que deberían pagarle con las cotizaciones faltantes ni digas que "pierde" el total: son dos cosas distintas. En el bloque de cálculo usa dos totales separados: "Te deberían pagar: $X" y "Falta en tu AFP: $Y" y/o "Falta en tu salud: $Z" (por separado, nunca "AFP/salud") (omite el que no aplique).
- Cuando expliques un cálculo, copia la fórmula completa que trae el detalle del hallazgo (por ejemplo, cómo se obtiene el valor hora).
- NO hagas cálculos nuevos ni multipliques/dividas cifras por tu cuenta: usa solo las cifras que aparecen arriba. No inventes montos ni datos. Si citas una norma, usa SOLO las indicadas arriba (hallazgos o base de conocimiento); nunca inventes artículos.
- Si la pregunta es sobre un tema laboral que no está en la base de conocimiento, responde en términos generales, sin cifras ni números de artículo, y sugiere confirmarlo en dt.gob.cl.
- Si la pregunta es sobre otro tema (como vacaciones), responde ese tema y no repitas los errores de la liquidación ni la línea de acción.
- No incluyas teléfonos ni enlaces (la página ya los muestra).
- Escribe los montos con números y formato chileno (ej: $95.583), nunca en palabras.
- Termina con una afirmación. PROHIBIDO terminar con una pregunta: la página ya ofrece botones para seguir consultando.`;
}

export async function POST(req: NextRequest) {
  if (!tieneSuscripcion(req.cookies.get(COOKIE_SUSCRIPCION)?.value)) {
    return NextResponse.json({ error: "Necesitas una suscripción activa." }, { status: 401 });
  }

  let c: Cuerpo;
  try { c = await req.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }

  if (!["inicio", "mas", "pregunta"].includes(c.modo) || !NIVELES.includes(c.nivel) || !Array.isArray(c.hallazgos)) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  if (c.modo === "pregunta" && !c.pregunta?.trim()) {
    return NextResponse.json({ error: "Escribe tu consulta." }, { status: 400 });
  }
  c.pregunta = c.pregunta?.slice(0, MAX_PREGUNTA);
  c.historial = Array.isArray(c.historial) ? c.historial.slice(-4) : [];
  c.hallazgos = c.hallazgos.slice(0, 20);
  c.datos = c.datos && typeof c.datos === "object" ? c.datos : {};
  c.contexto = c.contexto ?? { reiterado: null, negativa: null };

  try {
    const respuesta = await generarTexto([{ text: prompt(c) }], "emma");
    return NextResponse.json({ respuesta });
  } catch {
    return NextResponse.json({ error: "Emma no está disponible en este momento. Intenta de nuevo en unos segundos." }, { status: 502 });
  }
}
