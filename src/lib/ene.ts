// Fuente: INE · Encuesta Nacional de Empleo (ENE)
// Período: Ene–Mar 2026 (trimestre móvil)
// Fuente secundaria: Termómetro Laboral Nacional, Observatorio Laboral SENCE
// Tasa = desocupados / fuerza de trabajo × 100

export const ENE_PERIODO = "Ene–Mar 2026";

export const TASA_NACIONAL   = 8.9;
export const TASA_HOMBRES    = 8.1;
export const TASA_MUJERES    = 10.0;

const TASA_POR_REGION: Record<string, number> = {
  "Arica y Parinacota": 7.7,
  "Tarapacá":           8.7,
  "Antofagasta":        7.2,
  "Atacama":            8.1,
  "Coquimbo":           8.1,
  "Valparaíso":         9.8,
  "Metropolitana":      9.6,
  "O'Higgins":          7.5,
  "Maule":              8.5,
  "Ñuble":              8.4,
  "Biobío":             10.0,
  "La Araucanía":       7.8,
  "Los Ríos":           8.1,
  "Los Lagos":          6.6,
  "Aysén":              4.8,
  "Magallanes":         6.6,
};

export function getTasaRegion(region: string): number | null {
  return TASA_POR_REGION[region] ?? null;
}
