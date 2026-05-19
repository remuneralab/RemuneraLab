// Fuente: INE · Encuesta Nacional de Empleo (ENE)
// Período: enero 2026 (trimestre móvil Oct–Dic 2025 / Ene 2026)
// Tasa = desocupados / fuerza de trabajo × 100
// Datasets: DF_DES_SEXO + DF_FDT_SEXO

export const ENE_PERIODO = "enero 2026";

export const TASA_NACIONAL   = 8.9;
export const TASA_HOMBRES    = 8.1;
export const TASA_MUJERES    = 10.0;

const TASA_POR_REGION: Record<string, number> = {
  "Arica y Parinacota": 8.7,
  "Tarapacá":           7.2,
  "Antofagasta":        8.1,
  "Atacama":            8.1,
  "Coquimbo":           9.8,
  "Valparaíso":         7.5,
  "Metropolitana":      8.5,
  "O'Higgins":          10.0,
  "Maule":              7.8,
  "Ñuble":              6.6,
  "Biobío":             4.8,
  "La Araucanía":       6.6,
  "Los Ríos":           9.6,
  "Los Lagos":          8.1,
  "Aysén":              7.7,
  "Magallanes":         8.4,
};

export function getTasaRegion(region: string): number | null {
  return TASA_POR_REGION[region] ?? null;
}
