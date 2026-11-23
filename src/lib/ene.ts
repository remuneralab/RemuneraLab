// Fuente: INE · Encuesta Nacional de Empleo (ENE)
// Período: Jul–Sep 2026 (trimestre móvil; publicado oct 2026)
// Fuente secundaria: Termómetro Laboral Nacional, Observatorio Laboral SENCE
// Tasa = desocupados / fuerza de trabajo × 100

export const ENE_PERIODO = "Jul–Sep 2026";

export const TASA_NACIONAL   = 9.8;
export const TASA_HOMBRES    = 9.3;
export const TASA_MUJERES    = 10.5;

const TASA_POR_REGION: Record<string, number> = {
  "Arica y Parinacota": 7.8,
  "Tarapacá":           8.5,
  "Antofagasta":        6.7,
  "Atacama":            8.8,
  "Coquimbo":           9.0,
  "Valparaíso":         9.9,
  "Metropolitana":      10.4,
  "O'Higgins":          10.9,
  "Maule":              9.7,
  "Ñuble":              11.8,
  "Biobío":             10.5,
  "La Araucanía":       9.4,
  "Los Ríos":           9.8,
  "Los Lagos":          7.7,
  "Aysén":              4.0,
  "Magallanes":         6.4,
};

export function getTasaRegion(region: string): number | null {
  return TASA_POR_REGION[region] ?? null;
}
