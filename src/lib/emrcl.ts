// Fuente: INE · Encuesta Mensual de Remuneraciones y Costos Laborales (EMRCL)
// Período de referencia: septiembre 2026 (provisional; publicado nov 2026)
// Dato: variación nominal en 12 meses del Índice de Remuneraciones (IR)

export const EMRCL_PERIODO = "septiembre 2026";

const RAMA_VAR12: Record<string, number> = {
  B: 9.41, // Minería
  C: 9.66, // Manufactura / Industria
  D: 8.28, // Electricidad y gas
  E: 9.85, // Agua y gestión de residuos
  F: 8.19, // Construcción
  G: 7.64, // Retail / Comercio
  H: 9.17, // Transporte y logística
  I: 9.87, // Alojamiento y gastronomía
  J: 9.51, // Tecnología e información
  K: 6.20, // Finanzas y seguros
  L: 10.68, // Inmobiliarias
  M: 10.70, // Actividades profesionales
  N: 9.32, // Servicios administrativos
  O: 4.81, // Sector público
  P: 4.81, // Educación
  Q: 5.59, // Salud
  R: 7.73, // Arte y recreación
};

const NTRAB_VAR12: Record<string, number> = {
  ENTSIZE1: 8.56,
  ENTSIZE2: 8.41,
  ENTSIZE3: 7.21,
};

const CIUO_VAR12: Record<string, number> = {
  CIUO_1: 9.10,
  CIUO_2: 6.62,
  CIUO_3: 7.79,
  CIUO_4: 8.46,
  CIUO_5A: 8.03,
  CIUO_5B: 5.34,
  CIUO_7: 9.30,
  CIUO_8: 8.62,
  CIUO_9: 9.01,
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

const TAMANO_A_ENTSIZE: Record<string, string> = {
  "Microempresa (1–9 empleados)":      "ENTSIZE1",
  "Pequeña empresa (10–49 empleados)": "ENTSIZE1",
  "Mediana empresa (50–199 empleados)":"ENTSIZE2",
  "Gran empresa (200+ empleados)":     "ENTSIZE3",
};

const TAMANO_LABEL: Record<string, string> = {
  ENTSIZE1: "empresas pequeñas",
  ENTSIZE2: "empresas medianas",
  ENTSIZE3: "empresas grandes",
};

const SEXO_VAR12: Record<string, number> = {
  M: 8.22, // Hombres
  F: 6.92, // Mujeres
};

export function getTendenciaSexo(sexo: "M" | "F"): number {
  return SEXO_VAR12[sexo];
}

const CIUO_A_GRUPO: Record<string, string> = {
  "1": "CIUO_1",
  "2": "CIUO_2",
  "3": "CIUO_3",
  "4": "CIUO_4",
  "5": "CIUO_5A",
  "7": "CIUO_7",
  "8": "CIUO_8",
  "9": "CIUO_9",
};

export function getTendenciaSector(industria: string): number | null {
  const rama = INDUSTRIA_A_RAMA[industria];
  return rama ? (RAMA_VAR12[rama] ?? null) : null;
}

export function getTendenciaTamano(tamano: string): { var12: number; label: string } | null {
  const entsize = TAMANO_A_ENTSIZE[tamano];
  if (!entsize) return null;
  const var12 = NTRAB_VAR12[entsize];
  if (var12 === undefined) return null;
  return { var12, label: TAMANO_LABEL[entsize] };
}

export function getTendenciaCIUO(ciuo_codigo: string | null): number | null {
  if (!ciuo_codigo) return null;
  const grupo = CIUO_A_GRUPO[ciuo_codigo[0]];
  return grupo ? (CIUO_VAR12[grupo] ?? null) : null;
}
