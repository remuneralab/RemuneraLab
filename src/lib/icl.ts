// Fuente: INE · Encuesta Mensual de Remuneraciones y Costos Laborales (EMRCL)
// Dataset: DF_ICL2023_RAMA — Índice de Costo Laboral nominal (base 2023=100)
// Período de referencia: septiembre 2026 (provisional; publicado nov 2026)

export const ICL_PERIODO = "septiembre 2026";

// Variación en 12 meses del Índice de Costo Laboral por sector
const ICL_RAMA_VAR12: Record<string, number> = {
  B: 10.52, // Minería
  C: 10.68, // Manufactura / Industria
  D: 9.17, // Electricidad y gas
  E: 10.44, // Agua y gestión de residuos
  F: 8.48, // Construcción
  G: 8.07, // Retail / Comercio
  H: 10.37, // Transporte y logística
  I: 10.88, // Alojamiento y gastronomía
  J: 10.09, // Tecnología e información
  K: 6.65, // Finanzas y seguros
  L: 11.31, // Inmobiliarias
  M: 11.25, // Actividades profesionales
  N: 9.54, // Servicios administrativos
  O: 5.52, // Sector público
  P: 5.43, // Educación
  Q: 6.16, // Salud
  R: 8.31, // Arte y recreación
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
};

export function getCostoLaboral(industria: string): number | null {
  const rama = INDUSTRIA_A_RAMA[industria];
  return rama ? (ICL_RAMA_VAR12[rama] ?? null) : null;
}
