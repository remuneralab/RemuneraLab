// Revisión determinista de liquidaciones de sueldo (Chile).
// La IA solo extrae los datos; todas las cuentas y reglas legales se verifican aquí.

export type TipoItem = "haber_imponible" | "haber_no_imponible" | "descuento_legal" | "descuento_otro";
export type Categoria =
  | "sueldo_base" | "gratificacion" | "horas_extra" | "otro_haber"
  | "afp" | "salud" | "cesantia" | "impuesto" | "otro_descuento";

export interface ItemLiquidacion {
  nombre: string;
  monto: number;
  tipo: TipoItem;
  categoria: Categoria;
  horas?: number | null;      // solo horas extra
  porcentaje?: number | null; // si el documento indica una tasa
}

export interface Extraccion {
  es_liquidacion: boolean;
  legible: boolean;
  periodo: string | null;
  empleador: string | null;
  cargo: string | null;
  tipo_contrato: "indefinido" | "plazo_fijo" | "obra" | null;
  jornada_horas_semanales: number | null;
  sistema_salud: "fonasa" | "isapre" | null;
  items: ItemLiquidacion[];
  total_imponible: number | null;
  total_haberes: number | null;
  total_descuentos: number | null;
  liquido_a_pagar: number | null;
  notas: string[]; // observaciones cualitativas del documento
}

export type CodigoHallazgo =
  | "aritmetica" | "minimo" | "afp" | "salud" | "cesantia" | "horas_extra" | "gratificacion" | "descuentos";

export interface Hallazgo {
  tipo: "error" | "advertencia" | "ok";
  codigo: CodigoHallazgo;
  titulo: string;
  detalle: string;
  diferencia?: number; // pesos en contra del trabajador, cuando se puede estimar
  // "pago": dinero que deberían pagarle al trabajador. "cotizacion": falta en su AFP/salud (no es dinero en mano).
  diferencia_tipo?: "pago" | "cotizacion";
}

export interface ReferenciaLegal { norma: string; texto: string }

// Referencias verificadas en fuentes oficiales (dt.gob.cl, suseso.gob.cl, leychile.cl). Resumen, no texto literal.
export const LEYES: Record<CodigoHallazgo, ReferenciaLegal> = {
  aritmetica:    { norma: "Código del Trabajo, art. 54",
                   texto: "Junto con el pago, el empleador debe entregar un comprobante con el monto pagado, cómo se calculó y los descuentos efectuados." },
  minimo:        { norma: "Código del Trabajo, art. 44",
                   texto: "El sueldo mensual no puede ser inferior al ingreso mínimo mensual. Con jornada parcial, se calcula en proporción a las horas." },
  afp:           { norma: "DL 3.500, art. 17",
                   texto: "El trabajador dependiente cotiza el 10% de su remuneración imponible para su pensión, más la comisión de su AFP." },
  salud:         { norma: "DL 3.500, art. 84",
                   texto: "Se cotiza el 7% de la remuneración imponible para salud, en Fonasa o en la Isapre elegida." },
  cesantia:      { norma: "Ley 19.728, art. 5",
                   texto: "Con contrato indefinido el trabajador aporta 0,6% y el empleador 2,4%. Con contrato a plazo fijo u obra, el empleador paga el 3% completo." },
  horas_extra:   { norma: "Código del Trabajo, art. 32",
                   texto: "Las horas extraordinarias se pagan con un recargo mínimo de 50% sobre el sueldo convenido, junto con las remuneraciones del mismo período." },
  gratificacion: { norma: "Código del Trabajo, arts. 47 y 50",
                   texto: "Las empresas con utilidades deben gratificar. Si se usa el art. 50, se paga el 25% de lo devengado en el año, con tope de 4,75 ingresos mínimos." },
  descuentos:    { norma: "Código del Trabajo, art. 58",
                   texto: "El empleador solo puede descontar lo que exige la ley o lo que el trabajador autorizó por escrito." },
};

export type NivelCaso = "sin_problemas" | "leve" | "corregible" | "grave";

// Contexto que el documento no muestra y que responde el trabajador
export interface ContextoCaso {
  reiterado: boolean | null; // ¿el error se ha repetido en meses anteriores?
  negativa:  boolean | null; // ¿pidió la corrección y el empleador se negó?
}

// Nivel según el documento: errores → corregible; solo puntos a revisar → leve.
export function nivelCaso(h: Hallazgo[]): { nivel: NivelCaso; diferencia_total: number; cotizaciones_faltantes: number } {
  const errores = h.filter((x) => x.tipo === "error");
  const sumar = (t: "pago" | "cotizacion") =>
    Math.round(errores.filter((x) => (x.diferencia_tipo ?? "pago") === t).reduce((s, x) => s + (x.diferencia ?? 0), 0));
  const diferencia_total = sumar("pago");
  const cotizaciones_faltantes = sumar("cotizacion");
  if (errores.length) return { nivel: "corregible", diferencia_total, cotizaciones_faltantes };
  if (h.some((x) => x.tipo === "advertencia")) return { nivel: "leve", diferencia_total, cotizaciones_faltantes };
  return { nivel: "sin_problemas", diferencia_total, cotizaciones_faltantes };
}

// Un problema reiterado o la negativa del empleador a corregirlo hacen el caso grave.
export function gravedadFinal(base: NivelCaso, c: ContextoCaso): NivelCaso {
  if (base === "sin_problemas") return base;
  return c.reiterado || c.negativa ? "grave" : base;
}

// Referencias (mismas que usa el resto de RemuneraLab). Verificar vigencia periódicamente.
export const SUELDO_MINIMO_REF = 539_000;  // jornada 42 h
export const JORNADA_COMPLETA  = 42;
const TOPE_IMPONIBLE_APROX     = 3_300_000; // sobre esto puede aplicar el tope imponible: no se exigen tasas exactas
const TOLERANCIA               = 100;       // pesos, por redondeos

const clp = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");
const pct = (n: number) => (n * 100).toLocaleString("es-CL", { maximumFractionDigits: 2 }) + "%";

function suma(items: ItemLiquidacion[], pred: (i: ItemLiquidacion) => boolean) {
  return items.filter(pred).reduce((s, i) => s + (Number(i.monto) || 0), 0);
}

export function revisarLiquidacion(x: Extraccion): Hallazgo[] {
  const h: Hallazgo[] = [];
  const items = x.items ?? [];
  const jornada = x.jornada_horas_semanales && x.jornada_horas_semanales > 0 ? x.jornada_horas_semanales : JORNADA_COMPLETA;

  const imponibleItems = suma(items, (i) => i.tipo === "haber_imponible");
  const noImponible    = suma(items, (i) => i.tipo === "haber_no_imponible");
  const descuentos     = suma(items, (i) => i.tipo === "descuento_legal" || i.tipo === "descuento_otro");
  const imponible      = x.total_imponible ?? imponibleItems;
  const haberes        = x.total_haberes ?? imponibleItems + noImponible;
  const totDesc        = x.total_descuentos ?? descuentos;
  const sueldoBase     = suma(items, (i) => i.categoria === "sueldo_base");

  // ── 1. Aritmética ───────────────────────────────────────────────────────
  const errAritm: string[] = [];
  if (x.total_imponible != null && Math.abs(x.total_imponible - imponibleItems) > TOLERANCIA)
    errAritm.push(`los haberes imponibles suman ${clp(imponibleItems)}, pero el total imponible dice ${clp(x.total_imponible)}`);
  if (x.total_haberes != null && Math.abs(x.total_haberes - (imponibleItems + noImponible)) > TOLERANCIA)
    errAritm.push(`los haberes suman ${clp(imponibleItems + noImponible)}, pero el total de haberes dice ${clp(x.total_haberes)}`);
  if (x.total_descuentos != null && Math.abs(x.total_descuentos - descuentos) > TOLERANCIA)
    errAritm.push(`los descuentos suman ${clp(descuentos)}, pero el total de descuentos dice ${clp(x.total_descuentos)}`);
  if (x.liquido_a_pagar != null) {
    const esperado = haberes - totDesc;
    if (Math.abs(x.liquido_a_pagar - esperado) > TOLERANCIA) {
      const dif = x.liquido_a_pagar - esperado;
      errAritm.push(`el líquido debería ser ${clp(haberes)} − ${clp(totDesc)} = ${clp(esperado)}, pero dice ${clp(x.liquido_a_pagar)} (${dif > 0 ? "+" : "−"}${clp(Math.abs(dif))})`);
    }
  }
  // Solo cuenta como diferencia en contra si el líquido declarado es MENOR al que corresponde
  const difLiquido = x.liquido_a_pagar != null ? Math.max(0, (haberes - totDesc) - x.liquido_a_pagar) : 0;
  h.push(errAritm.length
    ? { tipo: "error", codigo: "aritmetica", titulo: "Los totales no cuadran", detalle: `Posible error de cálculo: ${errAritm.join("; ")}.`, diferencia: difLiquido }
    : { tipo: "ok", codigo: "aritmetica", titulo: "Los totales cuadran", detalle: "Las sumas de haberes, descuentos y el líquido a pagar son consistentes." });

  // ── 2. Ingreso mínimo ───────────────────────────────────────────────────
  if (sueldoBase > 0) {
    const minimo = Math.round(SUELDO_MINIMO_REF * jornada / JORNADA_COMPLETA);
    h.push(sueldoBase < minimo
      ? { tipo: "error", codigo: "minimo", titulo: "Sueldo base bajo el ingreso mínimo",
          detalle: `El sueldo base (${clp(sueldoBase)}) es menor al mínimo de referencia para ${jornada} h semanales (${clp(minimo)}). Verifica el valor vigente del ingreso mínimo.`, diferencia: minimo - sueldoBase }
      : { tipo: "ok", codigo: "minimo", titulo: "Sueldo base sobre el mínimo",
          detalle: `El sueldo base (${clp(sueldoBase)}) supera el mínimo de referencia para ${jornada} h semanales (${clp(minimo)}).` });
  }

  const bajoTope = imponible > 0 && imponible < TOPE_IMPONIBLE_APROX;

  // ── 3. AFP ──────────────────────────────────────────────────────────────
  const afp = suma(items, (i) => i.categoria === "afp");
  if (imponible > 0) {
    if (afp === 0) {
      h.push({ tipo: "advertencia", codigo: "afp", titulo: "No aparece el descuento de AFP",
        detalle: "No se encontró la cotización previsional. Si no estás pensionado ni exento, el empleador debe descontar y pagar tu AFP." });
    } else if (bajoTope) {
      const tasa = afp / imponible;
      if (tasa < 0.0995) h.push({ tipo: "error", codigo: "afp", titulo: "Cotización AFP menor a lo legal",
        detalle: `Se descuenta ${clp(afp)} (${pct(tasa)} del imponible). Lo obligatorio es 10% más la comisión de tu AFP: 10% × ${clp(imponible)} = ${clp(imponible * 0.10)} como mínimo. Faltarían ${clp(imponible * 0.10 - afp)} en tu fondo de pensiones; no es dinero que recibes en mano, pero afecta tu pensión.`, diferencia: imponible * 0.10 - afp, diferencia_tipo: "cotizacion" });
      else if (tasa > 0.125) h.push({ tipo: "advertencia", codigo: "afp", titulo: "Descuento AFP más alto de lo habitual",
        detalle: `Se descuenta ${clp(afp)} (${pct(tasa)} del imponible). Lo normal es 10% más una comisión de entre 0,5% y 1,5%. Revisa si incluye ahorro voluntario (APV) o cuenta 2.` });
      else h.push({ tipo: "ok", codigo: "afp", titulo: "Cotización AFP correcta", detalle: `${clp(afp)} equivale al ${pct(tasa)} del imponible (10% + comisión).` });
    }
  }

  // ── 4. Salud ────────────────────────────────────────────────────────────
  const salud = suma(items, (i) => i.categoria === "salud");
  if (imponible > 0) {
    if (salud === 0) {
      h.push({ tipo: "advertencia", codigo: "salud", titulo: "No aparece el descuento de salud",
        detalle: "No se encontró la cotización de salud (7% Fonasa o plan Isapre). Es obligatoria." });
    } else if (bajoTope) {
      const tasa = salud / imponible;
      if (tasa < 0.0695) h.push({ tipo: "error", codigo: "salud", titulo: "Cotización de salud menor al 7%",
        detalle: `Se descuenta ${clp(salud)} (${pct(tasa)} del imponible). El mínimo legal es 7% × ${clp(imponible)} = ${clp(imponible * 0.07)}. Faltarían ${clp(imponible * 0.07 - salud)} en tu cotización de salud.`, diferencia: imponible * 0.07 - salud, diferencia_tipo: "cotizacion" });
      else if (x.sistema_salud === "fonasa" && tasa > 0.0705) h.push({ tipo: "advertencia", codigo: "salud", titulo: "Descuento Fonasa sobre el 7%",
        detalle: `Se descuenta ${clp(salud)} (${pct(tasa)}). En Fonasa la cotización es exactamente 7% (${clp(imponible * 0.07)}).` });
      else h.push({ tipo: "ok", codigo: "salud", titulo: "Cotización de salud correcta", detalle: `${clp(salud)} equivale al ${pct(tasa)} del imponible.` });
    }
  }

  // ── 5. Seguro de cesantía ──────────────────────────────────────────────
  const ces = suma(items, (i) => i.categoria === "cesantia");
  if (imponible > 0 && bajoTope && x.tipo_contrato) {
    if (x.tipo_contrato === "indefinido") {
      const esperado = imponible * 0.006;
      if (ces === 0) h.push({ tipo: "advertencia", codigo: "cesantia", titulo: "No aparece el seguro de cesantía",
        detalle: `Con contrato indefinido corresponde descontar 0,6% del imponible (${clp(esperado)}). Verifica que tu empleador lo esté pagando a la AFC.` });
      else if (Math.abs(ces - esperado) > Math.max(TOLERANCIA, esperado * 0.05)) h.push({ tipo: "advertencia", codigo: "cesantia", titulo: "Seguro de cesantía distinto al 0,6%",
        detalle: `Se descuenta ${clp(ces)}; con contrato indefinido debería ser cerca de ${clp(esperado)}.` });
      else h.push({ tipo: "ok", codigo: "cesantia", titulo: "Seguro de cesantía correcto", detalle: `${clp(ces)} corresponde al 0,6% del imponible.` });
    } else if (ces > TOLERANCIA) {
      h.push({ tipo: "error", codigo: "cesantia", titulo: "Descuento de cesantía indebido",
        detalle: `Con contrato a plazo fijo u obra el trabajador no paga seguro de cesantía (lo paga íntegro el empleador), pero se descuentan ${clp(ces)}.`, diferencia: ces });
    }
  }

  // ── 6. Horas extra ──────────────────────────────────────────────────────
  if (sueldoBase > 0) {
    // Valor hora ordinaria para sueldo mensual (fórmula de la Dirección del Trabajo):
    // sueldo / 30 × 28 / (horas semanales × 4)   — 28 días = 4 semanas de jornada
    const valorHora   = sueldoBase / 30 * 28 / (jornada * 4);
    const minimoExtra = valorHora * 1.5;
    for (const it of items.filter((i) => i.categoria === "horas_extra" && i.horas && i.horas > 0)) {
      const pagadoHora = it.monto / it.horas!;
      if (pagadoHora < minimoExtra * 0.97) {
        h.push({ tipo: "error", codigo: "horas_extra", titulo: "Horas extra pagadas bajo lo legal",
          detalle: `Se pagan ${it.horas} h extra a ${clp(pagadoHora)} la hora (${clp(it.monto)}). Valor hora ordinaria = sueldo base ${clp(sueldoBase)} ÷ 30 × 28 ÷ (${jornada} h semanales × 4 semanas) = ${clp(valorHora)}. Con el recargo legal de 50%: ${clp(valorHora)} × 1,5 = ${clp(minimoExtra)} por hora extra. Por ${it.horas} h: ${clp(minimoExtra)} × ${it.horas} = ${clp(minimoExtra * it.horas!)}. Diferencia: ${clp(minimoExtra * it.horas!)} − ${clp(it.monto)} = ${clp(minimoExtra * it.horas! - it.monto)}.`, diferencia: minimoExtra * it.horas! - it.monto, diferencia_tipo: "pago" });
      } else {
        h.push({ tipo: "ok", codigo: "horas_extra", titulo: "Horas extra con recargo legal", detalle: `${it.horas} h a ${clp(pagadoHora)} la hora cumplen el recargo mínimo de 50%.` });
      }
    }
  }

  // ── 7. Gratificación ────────────────────────────────────────────────────
  const grat = suma(items, (i) => i.categoria === "gratificacion");
  if (sueldoBase > 0) {
    const tope = SUELDO_MINIMO_REF * 4.75 / 12;
    const esperada = Math.min(sueldoBase * 0.25, tope);
    if (grat === 0) h.push({ tipo: "advertencia", codigo: "gratificacion", titulo: "No aparece gratificación mensual",
      detalle: `No se ve gratificación. Puede ser legal si tu empresa la paga anualmente (art. 47) o no tiene utilidades, pero si es la modalidad mensual (art. 50) corresponderían cerca de ${clp(esperada)} al mes (25% del sueldo, con tope de ${clp(tope)}). Revisa tu contrato.` });
    else if (grat < esperada * 0.97) h.push({ tipo: "advertencia", codigo: "gratificacion", titulo: "Gratificación menor a la del art. 50",
      detalle: `Se paga ${clp(grat)}; con la modalidad mensual del art. 50 corresponderían cerca de ${clp(esperada)}. Revisa qué modalidad indica tu contrato.` });
    else h.push({ tipo: "ok", codigo: "gratificacion", titulo: "Gratificación presente", detalle: `Se paga gratificación de ${clp(grat)}.` });
  }

  // ── 8. Descuentos no legales ────────────────────────────────────────────
  const otros = items.filter((i) => i.tipo === "descuento_otro");
  if (otros.length) {
    h.push({ tipo: "advertencia", codigo: "descuentos", titulo: "Descuentos que requieren tu autorización",
      detalle: `${otros.map((o) => `${o.nombre} (${clp(o.monto)})`).join(", ")}. Los descuentos que no son legales (anticipos, préstamos, otros) deben estar autorizados por escrito por ti.` });
  }

  return h;
}
