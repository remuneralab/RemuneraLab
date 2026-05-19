export const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.es", "yahoo.cl",
  "hotmail.com", "hotmail.cl", "hotmail.es", "outlook.com", "outlook.cl",
  "live.com", "live.cl", "msn.com", "icloud.com", "me.com", "mac.com",
  "aol.com", "protonmail.com", "proton.me", "tutanota.com",
  "mailinator.com", "guerrillamail.com", "temp-mail.org", "throwam.com",
  "fakeinbox.com", "yopmail.com", "sharklasers.com",
]);

export function isPublicDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return PUBLIC_EMAIL_DOMAINS.has(domain);
}

export function extractDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export const SECTORES = [
  "Tecnología / TI",
  "Salud",
  "Finanzas y Seguros",
  "Forestal / Celulosa",
  "Minería",
  "Turismo y Hotelería",
  "Manufactura / Industria",
  "Comercio y Retail",
  "Educación",
  "Construcción",
  "Agroindustria",
  "Servicios Profesionales",
  "Otro",
] as const;

export type Sector = (typeof SECTORES)[number];

export const TAMANOS = [
  "10–50 empleados",
  "50–200 empleados",
  "200–500 empleados",
  "500–2000 empleados",
  "2000+ empleados",
] as const;

export type Tamano = (typeof TAMANOS)[number];

// Identificadores de versión de cada documento legal (actualizar al modificar el contenido)
export const LEGAL_HASHES = {
  terminos:   "v1-2026-05-terminos",
  nda:        "v1-2026-05-nda",
  privacidad: "v1-2026-05-privacidad",
} as const;

export type LegalDoc = keyof typeof LEGAL_HASHES;

export type EmpresaEstado =
  | "pendiente_email"
  | "pendiente_legal"
  | "activo"
  | "expirado"
  | "cancelado";

export interface EmpresaB2B {
  id: string;
  user_id: string;
  razon_social: string;
  rut_empresa: string | null;
  sector: string;
  tamano_empresa: string;
  nombre_contacto: string;
  cargo_contacto: string;
  email_corporativo: string;
  dominio: string;
  estado: EmpresaEstado;
  fecha_inicio_demo: string | null;
  fecha_fin_demo: string | null;
  created_at: string;
}
