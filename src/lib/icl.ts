// Fuente: INE · Encuesta Mensual de Remuneraciones y Costos Laborales (EMRCL)
// Dataset: DF_ICL2023_RAMA — Índice de Costo Laboral nominal (base 2023=100)
// Período de referencia: marzo 2026

export const ICL_PERIODO = "marzo 2026";

// Variación en 12 meses del Índice de Costo Laboral por sector
const ICL_RAMA_VAR12: Record<string, number> = {
  B: 7.13, // Minería
  C: 6.05, // Manufactura / Industria
  D: 4.05, // Electricidad y gas
  E: 8.53, // Agua y gestión de residuos
  F: 7.05, // Construcción
  G: 5.78, // Retail / Comercio
  H: 6.93, // Transporte y logística
  I: 7.89, // Alojamiento y gastronomía
  J: 7.73, // Tecnología e información
  K: 5.43, // Finanzas y seguros
  L: 7.54, // Inmobiliarias
  M: 6.95, // Actividades profesionales
  N: 6.98, // Servicios administrativos
  O: 4.15, // Sector público
  P: 5.17, // Educación
  Q: 4.53, // Salud
  R: 8.80, // Arte y recreación
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
