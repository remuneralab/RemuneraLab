// Fuente: INE · Encuesta Mensual de Remuneraciones y Costos Laborales (EMRCL)
// Período de referencia: marzo 2026
// Dato: variación nominal en 12 meses del Índice de Remuneraciones (IR)

export const EMRCL_PERIODO = "marzo 2026";

const RAMA_VAR12: Record<string, number> = {
  B: 6.96, // Minería
  C: 5.11, // Manufactura / Industria
  D: 3.39, // Electricidad y gas
  E: 7.40, // Agua y gestión de residuos
  F: 6.36, // Construcción
  G: 4.89, // Retail / Comercio
  H: 6.20, // Transporte y logística
  I: 6.77, // Alojamiento y gastronomía
  J: 7.11, // Tecnología e información
  K: 4.64, // Finanzas y seguros
  L: 7.04, // Inmobiliarias
  M: 5.73, // Actividades profesionales
  N: 6.08, // Servicios administrativos
  O: 3.10, // Sector público
  P: 4.10, // Educación
  Q: 3.14, // Salud
  R: 7.37, // Arte y recreación
};

const NTRAB_VAR12: Record<string, number> = {
  ENTSIZE1: 6.05,
  ENTSIZE2: 5.88,
  ENTSIZE3: 4.46,
};

const CIUO_VAR12: Record<string, number> = {
  CIUO_1: 5.24,
  CIUO_2: 4.24,
  CIUO_3: 5.45,
  CIUO_4: 5.38,
  CIUO_5A: 5.33,
  CIUO_5B: 5.41,
  CIUO_7: 5.51,
  CIUO_8: 6.40,
  CIUO_9: 6.47,
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
  M: 5.34, // Hombres
  F: 4.64, // Mujeres
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
