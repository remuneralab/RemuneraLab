/**
 * Priors nacionales de Trabajando.cl — medianas salariales por cargo con grandes muestras.
 * Son nacionales (sin región) y sin desglose de experiencia.
 * Fuente: trabajando.cl/informes-de-sueldo/{slug} — scrapeado 2026-05-12.
 * Cada entrada se trata como TRAB_EQUIV registros ESI en el blend del benchmark.
 */

export interface TrabajandoPrior {
  slug: string;
  p50: number;
  p25: number;
  p75: number;
  n: number;
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// [slug, mediana, n_muestras, keywords_normalizadas]
const RAW: [string, number, number, string[]][] = [
  ["data-scientist",            1_400_000,  1_770, ["data scientist", "data science", "cientifico de datos", "scientist"]],
  ["prevencionista-riesgos",    1_400_000, 27_071, ["prevencionista", "prevencion de riesgos", "seguridad laboral", "hseq", "salud ocupacional"]],
  ["tecnico-enfermeria-tens",     650_000, 36_948, ["tens", "tecnico en enfermeria", "tecnico enfermeria", "auxiliar de enfermeria", "auxiliar enfermeria"]],
  ["ejecutivo-comercial-ventas",1_000_000, 44_205, ["ejecutivo comercial", "ejecutivo de ventas", "ejecutivo de negocios"]],
  ["ejecutivo-atencion-cliente",  700_000, 18_026, ["ejecutivo de atencion", "atencion al cliente", "ejecutivo call center"]],
  ["analista-financiero",       1_300_000,  6_666, ["analista financiero", "analista de finanzas", "finanzas corporativas"]],
  ["analista-contable",         1_100_000, 19_544, ["analista contable", "analista de contabilidad", "jefe de contabilidad"]],
  ["analista-control-gestion",  1_300_000, 23_224, ["control de gestion", "analista de gestion", "analista control"]],
  ["analista-credito",          1_145_000,  1_434, ["analista de credito", "analista credito", "riesgo de credito"]],
  ["ingeniero-civil",           1_500_000,  2_828, ["ingeniero civil", "ingenieria civil"]],
  ["ingeniero-industrial",      1_450_000,  1_307, ["ingeniero industrial", "ingenieria industrial"]],
  ["arquitecto",                1_300_000,  2_727, ["arquitecto", "arquitecta"]],
  ["geologo",                   1_500_000,    757, ["geologo", "geologa"]],
  ["medico",                      700_000,  6_698, ["medico", "medicina general", "medica general", "medico general"]],
  ["enfermera",                 1_200_000, 72_069, ["enfermera", "enfermero", "enfermeria"]],
  ["kinesiologo",                 900_000,  3_517, ["kinesiologo", "kinesiologia", "kinesiterapeuta"]],
  ["nutricionista",               900_000,  1_921, ["nutricionista", "nutricion"]],
  ["psicologo",                 1_000_000, 13_180, ["psicologo", "psicologa", "psicologia"]],
  ["matrona",                   1_075_000,  3_558, ["matrona", "matron"]],
  ["contador",                  1_310_000,  3_431, ["contador", "contadora"]],
  ["auditor",                   1_400_000,  3_534, ["auditor", "auditora", "auditoria", "auditoria interna"]],
  ["educadora-parvulos",          950_000,    459, ["parvulos", "parvularia", "educadora de parvulos", "jardin infantil"]],
  ["asesor-comercial-vendedor",   600_000, 50_847, ["asesor comercial", "vendedor", "vendedora"]],
  ["cajero",                      600_000, 20_514, ["cajero", "cajera"]],
  ["bodeguero",                   680_000, 24_575, ["bodeguero", "bodeguera", "almacenero", "operador de bodega"]],
  ["tecnico-mecanico",          1_000_000, 18_734, ["tecnico mecanico", "mecanico", "mecanica industrial"]],
  ["tecnico-industrial",          950_000,    825, ["tecnico industrial"]],
  ["abogado",                   1_300_000, 15_843, ["abogado", "abogada"]],
  ["administrador-de-empresas",   930_000,    893, ["administrador de empresas", "administracion de empresas"]],
  ["asistente-administrativo",    700_000, 23_302, ["asistente administrativo", "asistente administrativa", "auxiliar administrativo"]],
];

export const PRIORS_TRABAJANDO: (TrabajandoPrior & { keywords: string[] })[] = RAW.map(
  ([slug, med, n, kw]) => ({
    slug,
    p50: med,
    p25: Math.round(med * 0.78),
    p75: Math.round(med * 1.30),
    n,
    keywords: kw,
  })
);

export function matchTrabajandoPrior(cargo: string): TrabajandoPrior | null {
  const c = norm(cargo);
  for (const prior of PRIORS_TRABAJANDO) {
    for (const kw of prior.keywords) {
      if (c.includes(kw)) return prior;
    }
  }
  return null;
}
