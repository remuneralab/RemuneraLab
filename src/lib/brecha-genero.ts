// Fuente: INE · Encuesta Suplementaria de Ingresos (ESI)
// Dataset: DF_BGYMEDIOOCU_CIUO + DF_BGYMEDIOOCU_RAMA
// Período de referencia: 2024 (anual)
// Indicador: brecha en ingreso mediano (% que ganan menos las mujeres respecto a los hombres)
// Valores negativos = mujeres ganan menos; positivos = mujeres ganan más

export const BRECHA_PERIODO = "2024";

// Brecha por grupo ocupacional CIUO
const BRECHA_CIUO: Record<string, number> = {
  CIUO_1: -22.7, // Directivos y gerentes
  CIUO_2: -26.6, // Profesionales universitarios
  CIUO_3: -31.9, // Técnicos de nivel medio
  CIUO_4: -10.6, // Trabajadores administrativos
  CIUO_5: -30.0, // Trabajadores de servicios y ventas
  CIUO_6: -29.3, // Trabajadores agropecuarios
  CIUO_7: -47.5, // Artesanos y trabajadores de oficio
  CIUO_8: -3.3,  // Operadores de maquinaria y conductores
  CIUO_9: -22.0, // Trabajadores de apoyo
};

// Brecha por sector económico (RAMA CIIU4)
const BRECHA_RAMA: Record<string, number> = {
  A: -16.0, // Agricultura
  B: -2.4,  // Minería
  C: -35.4, // Manufactura / Industria
  E: -29.4, // Agua y gestión de residuos
  F: 9.9,   // Construcción (mujeres ganan más — muestra pequeña)
  G: -36.9, // Retail / Comercio
  H: -9.4,  // Transporte y logística
  I: -11.7, // Alojamiento y gastronomía
  J: -26.3, // Tecnología e información
  K: -35.6, // Finanzas y seguros
  L: -23.4, // Inmobiliarias
  M: -32.6, // Actividades profesionales
  N: -42.4, // Servicios administrativos
  O: -1.2,  // Sector público
  P: -30.5, // Educación
  Q: -40.6, // Salud
  R: -16.3, // Arte y recreación
  S: -20.5, // Otros servicios
};

const INDUSTRIA_A_RAMA: Record<string, string> = {
  "Tecnología":              "J",
  "Retail / Comercio":       "G",
  "Finanzas y Seguros":      "K",
  "Salud":                   "Q",
  "Educación":               "P",
  "Manufactura / Industria": "C",
  "Minería":                 "B",
  "Construcción":            "F",
  "Transporte y Logística":  "H",
  "Gobierno / Sector Público": "O",
  "Agricultura":             "A",
};

const CIUO_A_GRUPO: Record<string, string> = {
  "1": "CIUO_1",
  "2": "CIUO_2",
  "3": "CIUO_3",
  "4": "CIUO_4",
  "5": "CIUO_5",
  "6": "CIUO_6",
  "7": "CIUO_7",
  "8": "CIUO_8",
  "9": "CIUO_9",
};

export function getBrechaCiuo(ciuo_codigo: string | null): number | null {
  if (!ciuo_codigo) return null;
  const grupo = CIUO_A_GRUPO[ciuo_codigo[0]];
  return grupo ? (BRECHA_CIUO[grupo] ?? null) : null;
}

export function getBrechaRama(industria: string): number | null {
  const rama = INDUSTRIA_A_RAMA[industria];
  return rama ? (BRECHA_RAMA[rama] ?? null) : null;
}
