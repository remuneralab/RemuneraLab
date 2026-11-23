// Fuente: INE · Encuesta Suplementaria de Ingresos (ESI)
// Dataset: DF_BGYMEDIOOCU_CIUO + DF_BGYMEDIOOCU_RAMA
// Período de referencia: 2025 (anual; ESI 2025)
// Se excluyen estimaciones marcadas "no fiables" (OBS_STATUS=X) por el INE: D, U, SC
// Indicador: brecha en ingreso mediano (% que ganan menos las mujeres respecto a los hombres)
// Valores negativos = mujeres ganan menos; positivos = mujeres ganan más

export const BRECHA_PERIODO = "2025";

// Brecha por grupo ocupacional CIUO
const BRECHA_CIUO: Record<string, number> = {
  CIUO_1: -27.3, // Directivos y gerentes
  CIUO_2: -24.0, // Profesionales universitarios
  CIUO_3: -27.9, // Técnicos de nivel medio
  CIUO_4: -5.9, // Trabajadores administrativos
  CIUO_5: -28.9, // Trabajadores de servicios y ventas
  CIUO_6: -34.1, // Trabajadores agropecuarios
  CIUO_7: -51.8, // Artesanos y trabajadores de oficio
  CIUO_8: -12.1,  // Operadores de maquinaria y conductores
  CIUO_9: -17.1, // Trabajadores de apoyo
};

// Brecha por sector económico (RAMA CIIU4)
const BRECHA_RAMA: Record<string, number> = {
  A: -20.7, // Agricultura
  B: -4.8,  // Minería
  C: -37.3, // Manufactura / Industria
  E: -3.8, // Agua y gestión de residuos
  F: 25.2,   // Construcción (mujeres ganan más — muestra pequeña)
  G: -33.3, // Retail / Comercio
  H: -13.8,  // Transporte y logística
  I: -22.9, // Alojamiento y gastronomía
  J: -13.3, // Tecnología e información
  K: -29.1, // Finanzas y seguros
  L: -6.1, // Inmobiliarias
  M: -28.1, // Actividades profesionales
  N: -25.8, // Servicios administrativos
  O: -3.1,  // Sector público
  P: -20.2, // Educación
  Q: -34.1, // Salud
  R: -28.0, // Arte y recreación
  S: -21.6, // Otros servicios
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
