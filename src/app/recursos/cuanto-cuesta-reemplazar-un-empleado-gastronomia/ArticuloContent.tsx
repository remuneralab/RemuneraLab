"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

const fmtCLP = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  return `$${Math.round(n / 1_000)}k`;
};

// ── Data ────────────────────────────────────────────────────────────────────

type Componente = { nombre: string; valor: number; desc: string; fuente: string; color: string };
type Cargo = { nombre: string; sueldo: number; total: number; componentes: Componente[] };

const C = ["#041635", "#835500", "#ba1a1a", "#2a7d4f", "#4f5e81", "#6b7280"] as const;

const CARGOS: Cargo[] = [
  {
    nombre: "Ayudante de Cocina", sueldo: 500_000, total: 622_000,
    componentes: [
      { nombre: "Aviso laboral",           valor: 52_000,  color: C[0], desc: "Publicación 30 días en Trabajando.cl o Computrabajo",                             fuente: "Tarifas Trabajando.cl mayo 2026"              },
      { nombre: "Selección y entrevistas", valor: 48_000,  color: C[1], desc: "~6 horas del jefe de cocina revisando CVs, llamadas y entrevistas",               fuente: "SHRM Cost-Per-Hire Standard ANSI/SHRM-09001-2012" },
      { nombre: "Documentación y alta",    valor: 22_000,  color: C[2], desc: "Contrato, registro DT, alta en AFP y previsión de salud",                         fuente: "Estimación interna (2–3 hrs administrativas)"  },
      { nombre: "Días con puesto vacante", valor: 155_000, color: C[3], desc: "~7 días laborales sin cubrir la posición, pérdida de capacidad operativa",         fuente: "Proporción dotación × sueldo diario"          },
      { nombre: "Curva de aprendizaje",    valor: 285_000, color: C[4], desc: "5 semanas operando al ~65% — la brecha del 35% tiene un costo acumulado real",     fuente: "O'Connell & Kung (2007), Industrial Management" },
      { nombre: "Tiempo del trainer",      valor: 60_000,  color: C[5], desc: "~10 horas del empleado más antiguo enseñando procesos al nuevo",                   fuente: "SENCE/OTIC estándares gastronomía"            },
    ],
  },
  {
    nombre: "Garzón/a Senior", sueldo: 620_000, total: 757_000,
    componentes: [
      { nombre: "Aviso laboral",           valor: 52_000,  color: C[0], desc: "Publicación 30 días en Trabajando.cl o Computrabajo",                             fuente: "Tarifas Trabajando.cl mayo 2026"               },
      { nombre: "Selección y entrevistas", valor: 55_000,  color: C[1], desc: "~7 horas — mayor filtro por experiencia, presentación y manejo de mesa",          fuente: "SHRM Cost-Per-Hire Standard ANSI/SHRM-09001-2012" },
      { nombre: "Documentación y alta",    valor: 22_000,  color: C[2], desc: "Contrato, registro DT, alta en AFP y previsión de salud",                         fuente: "Estimación interna"                            },
      { nombre: "Días con puesto vacante", valor: 192_000, color: C[3], desc: "~7 días — impacto directo y visible en el servicio de sala",                      fuente: "Proporción dotación × sueldo diario"           },
      { nombre: "Curva de aprendizaje",    valor: 370_000, color: C[4], desc: "6 semanas al 65% — carta, maridajes, clientes frecuentes y protocolo de la casa", fuente: "O'Connell & Kung (2007), Industrial Management" },
      { nombre: "Tiempo del trainer",      valor: 66_000,  color: C[5], desc: "~11 horas de otro garzón senior acompañando al nuevo",                            fuente: "SENCE/OTIC estándares gastronomía"             },
    ],
  },
  {
    nombre: "Bartender", sueldo: 680_000, total: 805_000,
    componentes: [
      { nombre: "Aviso laboral",           valor: 55_000,  color: C[0], desc: "Aviso destacado — perfil más escaso en el mercado gastronómico",                        fuente: "Tarifas Trabajando.cl mayo 2026"               },
      { nombre: "Selección y entrevistas", valor: 62_000,  color: C[1], desc: "~8 horas — incluye prueba práctica de preparación de tragos de la carta",              fuente: "SHRM Cost-Per-Hire Standard ANSI/SHRM-09001-2012" },
      { nombre: "Documentación y alta",    valor: 22_000,  color: C[2], desc: "Contrato, registro DT, alta en AFP y previsión de salud",                              fuente: "Estimación interna"                            },
      { nombre: "Días con puesto vacante", valor: 211_000, color: C[3], desc: "~7 días — el bar opera parcialmente o con soporte de garzones",                        fuente: "Proporción dotación × sueldo diario"           },
      { nombre: "Curva de aprendizaje",    valor: 390_000, color: C[4], desc: "6–7 semanas al 65% — recetas, técnica, gestión del inventario del bar",                fuente: "O'Connell & Kung (2007), Industrial Management" },
      { nombre: "Tiempo del trainer",      valor: 65_000,  color: C[5], desc: "~11 horas del bartender más antiguo acompañando al nuevo",                             fuente: "SENCE/OTIC estándares gastronomía"             },
    ],
  },
  {
    nombre: "Auxiliar de Limpieza", sueldo: 450_000, total: 380_000,
    componentes: [
      { nombre: "Aviso laboral",           valor: 40_000,  color: C[0], desc: "Aviso básico 30 días en un portal",                                                    fuente: "Tarifas Trabajando.cl mayo 2026"               },
      { nombre: "Selección y entrevistas", valor: 28_000,  color: C[1], desc: "~4 horas — proceso más ágil dado el perfil del cargo",                                 fuente: "SHRM Cost-Per-Hire Standard ANSI/SHRM-09001-2012" },
      { nombre: "Documentación y alta",    valor: 18_000,  color: C[2], desc: "Contrato, registro DT, alta en AFP y previsión de salud",                              fuente: "Estimación interna"                            },
      { nombre: "Días con puesto vacante", valor: 95_000,  color: C[3], desc: "~5 días — se puede cubrir parcialmente con otras personas del equipo",                 fuente: "Proporción dotación × sueldo diario"           },
      { nombre: "Curva de aprendizaje",    valor: 155_000, color: C[4], desc: "3 semanas al 70% — rutinas de limpieza y protocolo sanitario del local",               fuente: "O'Connell & Kung (2007), Industrial Management" },
      { nombre: "Tiempo del trainer",      valor: 44_000,  color: C[5], desc: "~8 horas de inducción básica por parte de otro auxiliar",                              fuente: "SENCE/OTIC estándares gastronomía"             },
    ],
  },
  {
    nombre: "Encargado de Bodega", sueldo: 570_000, total: 640_000,
    componentes: [
      { nombre: "Aviso laboral",           valor: 50_000,  color: C[0], desc: "Publicación 30 días en Trabajando.cl o Computrabajo",                                  fuente: "Tarifas Trabajando.cl mayo 2026"               },
      { nombre: "Selección y entrevistas", valor: 52_000,  color: C[1], desc: "~7 horas — revisión de experiencia en inventario, proveedores y control de merma",    fuente: "SHRM Cost-Per-Hire Standard ANSI/SHRM-09001-2012" },
      { nombre: "Documentación y alta",    valor: 22_000,  color: C[2], desc: "Contrato, registro DT, alta en AFP y previsión de salud",                              fuente: "Estimación interna"                            },
      { nombre: "Días con puesto vacante", valor: 168_000, color: C[3], desc: "~7 días — riesgo de descontrol de stock y pedidos descoordinados",                    fuente: "Proporción dotación × sueldo diario"           },
      { nombre: "Curva de aprendizaje",    valor: 295_000, color: C[4], desc: "5–6 semanas al 65% — sistema de inventario, proveedores y control de merma",           fuente: "O'Connell & Kung (2007), Industrial Management" },
      { nombre: "Tiempo del trainer",      valor: 53_000,  color: C[5], desc: "~9 horas de traspaso de conocimiento, procesos y accesos al sistema",                  fuente: "SENCE/OTIC estándares gastronomía"             },
    ],
  },
];

// ── Slider helpers ─────────────────────────────────────────────────────────

function calcMultiplicador(meses: number): number {
  const pts: [number, number][] = [[1,0.70],[3,0.85],[6,1.00],[12,1.12],[18,1.20],[24,1.27],[36,1.35]];
  if (meses <= 1) return 0.70;
  if (meses >= 36) return 1.35;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (meses >= x0 && meses <= x1)
      return y0 + ((meses - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 1.0;
}

function describeMeses(m: number): string {
  if (m <= 2)  return "Todavía está en período de inducción — no acumuló mucho conocimiento específico del local.";
  if (m <= 5)  return "Ya aprendió los procesos básicos, pero aún no tiene dominio completo del cargo.";
  if (m <= 11) return "Conoce el lugar, los proveedores y los procesos. Reemplazarlo tarda más que el promedio.";
  if (m <= 17) return "Con más de un año, sabe cómo funciona todo y los clientes frecuentes lo conocen.";
  if (m <= 23) return "Persona consolidada. Su salida genera un vacío real de conocimiento operativo.";
  return "Más de dos años en el cargo. Su salida puede afectar proveedores, cultura y memoria del local.";
}

function costoP1(c: Cargo, m: number): number {
  const [aviso, sel, docs, vacante, aprend, trainer] = c.componentes.map(x => x.valor);
  const fracCurva   = Math.min(m / 1.25, 1);
  const fracTrainer = Math.min(m / 0.75, 1);
  return Math.round(aviso + sel + docs + vacante + fracCurva * aprend + fracTrainer * trainer);
}

function costoP2(c: Cargo): number {
  const [aviso, sel, docs, vacante, aprend, trainer] = c.componentes.map(x => x.valor);
  return Math.round((aviso + sel + docs) * 0.70 + vacante + aprend + trainer);
}

function fmtMeses(m: number): string {
  if (m < 12) return `${m} meses`;
  const a = m / 12;
  return `${a % 1 === 0 ? a : a.toFixed(1)} ${m >= 24 ? "años" : "año"}`;
}

// ── Metodología expandible por componente ─────────────────────────────────

type MetItem    = { label: string; valor: string | ((c: Cargo) => string) };
type MetSection = { argumento: string; items: MetItem[]; fuentes: string[] };

const rv = (v: string | ((c: Cargo) => string), c: Cargo) =>
  typeof v === "function" ? v(c) : v;

const METODOLOGIA: MetSection[] = [
  {
    argumento: "Para cargos operativos el plan básico alcanza. Si la 1ª ronda falla y hay que republicar o destacar el aviso, el costo sube al rango superior.",
    fuentes: ["Trabajando.cl — tarifas públicas mayo 2026", "Computrabajo Chile — tarifas públicas mayo 2026"],
    items: [
      { label: "Trabajando.cl plan básico 30 días", valor: "$29.990" },
      { label: "Computrabajo alternativo o 2ª ronda", valor: "$22.000–$35.000" },
      { label: "Total",                              valor: (c) => fmtCLP(c.componentes[0].valor) },
    ],
  },
  {
    argumento: "¿Cuántas horas dedicó alguien del local la última vez que contrató para este cargo? Ese tiempo tiene precio — y es tiempo que no estuvo en operaciones.",
    fuentes: ["SHRM Cost-Per-Hire Standard ANSI/SHRM-09001-2012", "LinkedIn Talent Solutions — Time to Fill operativo 2023"],
    items: [
      { label: "Revisión CVs (30–50 postulantes × 3 min)", valor: "1.5–2.5 h" },
      { label: "Pre-entrevistas telefónicas (6–10 × 15 min)",  valor: "1.5–2.5 h" },
      { label: "Entrevistas presenciales (2–4 × 35 min)",       valor: "1.2–2.5 h" },
      { label: "Verificación referencias + decisión",           valor: "0.5–1 h" },
      { label: "Total",  valor: (c) => `~${Math.round(c.componentes[1].valor / 8_000)} h × $8.000/h = ${fmtCLP(c.componentes[1].valor)}` },
    ],
  },
  {
    argumento: "Son trámites rutinarios pero cada uno consume tiempo real. Se repiten íntegramente con cada contratación nueva.",
    fuentes: ["Dirección del Trabajo — registro contrato laboral", "Previred — alta empleado AFP + salud", "CCAF Chile — alta caja compensación"],
    items: [
      { label: "Redacción contrato (45–60 min × $8k/h)",    valor: "$6.000–$8.000" },
      { label: "Alta Previred — AFP + salud (35–45 min)",   valor: "$4.700–$6.000" },
      { label: "Alta Caja de Compensación (25 min)",        valor: "$3.300" },
      { label: "Ingreso nómina + entrega EPP (60 min)",     valor: "$8.000" },
      { label: "Total ~2.5–3 h × $8.000/h",                valor: (c) => fmtCLP(c.componentes[2].valor) },
    ],
  },
  {
    argumento: "Cada día sin el puesto cubierto el local opera corto. Ese costo lo absorbe el equipo en sobre-carga o el cliente en calidad reducida.",
    fuentes: ["Buk Latam — Índice de rotación gastronomía Chile 2023", "INE Encuesta Laboral sectorial gastronomía"],
    items: [
      { label: "Sueldo diario del cargo (sueldo ÷ 22 días laborales)", valor: (c) => `${fmtCLP(Math.round(c.sueldo / 22))}/día` },
      { label: "Días promedio puesto vacante — gastronomía Valparaíso", valor: (c) => `${Math.round(c.componentes[3].valor / Math.round(c.sueldo / 22))} días` },
      { label: "Total", valor: (c) => fmtCLP(c.componentes[3].valor) },
    ],
  },
  {
    argumento: "El nuevo no sabe dónde están las cosas, los tiempos del equipo ni los procesos de la casa. Esas semanas al 65% de rendimiento tienen un costo concreto que nadie registra en el libro de caja.",
    fuentes: [
      "O'Connell & Kung (2007) — The Cost of Employee Turnover, Industrial Management 49(1)",
      "SENCE/OTIC Gastronomía Chile — 120–180h horas para competencia básica Ayudante Cocina",
      "Manpower Chile 2023 — 65% empleadores gastronomía reportan 4–8 semanas hasta trabajo autónomo",
    ],
    items: [
      { label: "Sueldo semanal del cargo",            valor: (c) => `${fmtCLP(Math.round(c.sueldo / 4.33))}/sem` },
      { label: "Semanas hasta rendimiento pleno",     valor: (c) => `${c.nombre === "Bartender" ? "6–7" : c.nombre === "Auxiliar de Limpieza" ? "3–4" : "5–6"} semanas` },
      { label: "Déficit de productividad estimado",   valor: (c) => `${c.nombre === "Garzón/a Senior" ? "41" : c.nombre === "Auxiliar de Limpieza" ? "31" : "35"}%` },
      { label: "Fórmula: semanas × sueldo/sem × déficit", valor: (c) => {
          const sem  = c.nombre === "Bartender" ? 6.5 : c.nombre === "Auxiliar de Limpieza" ? 3.5 : 5;
          const pct  = c.nombre === "Garzón/a Senior" ? 0.41 : c.nombre === "Auxiliar de Limpieza" ? 0.31 : 0.35;
          const base = Math.round(c.sueldo / 4.33) * sem * pct;
          return `${fmtCLP(Math.round(base))} base + overhead operacional`;
        }
      },
      { label: "Total estimado (incluye overhead)",  valor: (c) => fmtCLP(c.componentes[4].valor) },
    ],
  },
  {
    argumento: "¿El empleado más antiguo del área es igual de rápido cuando también tiene que enseñarle al nuevo? Ese 20% de tiempo perdido tiene un precio que nunca aparece en una boleta.",
    fuentes: ["SENCE/OTIC Gastronomía Chile — estándar horas capacitación en sala y cocina"],
    items: [
      { label: "Semana 1 — instrucción activa",           valor: "40–50% del tiempo del trainer" },
      { label: "Semana 2 — supervisión y correcciones",   valor: "15–20% del tiempo del trainer" },
      { label: "Promedio 2 semanas",                      valor: "~20% del tiempo" },
      { label: "Trainer: el más antiguo del área (sueldo proporcional)", valor: (c) => `~20% × 2 semanas × ${fmtCLP(Math.round(c.sueldo * 1.4 / 4.33))}/sem = ${fmtCLP(c.componentes[5].valor)}` },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function ArticuloContent() {
  const [cargoIdx,     setCargoIdx]     = useState(0);
  const [meses,        setMeses]        = useState(8);
  const [aumento,      setAumento]      = useState(30_000);
  const [numRot,       setNumRot]       = useState<1 | 2>(1);
  const [mesesP1,      setMesesP1]      = useState(3);
  const [expandedComp, setExpandedComp] = useState<number | null>(null);

  const cargo      = CARGOS[cargoIdx];
  const mult       = calcMultiplicador(meses);
  const costoAjust = Math.round(cargo.total * mult);
  const costo1     = costoP1(cargo, mesesP1);
  const costo2     = costoP2(cargo);
  const totalRot   = numRot === 1 ? cargo.total : costo1 + costo2;

  return (
    <div style={{ background: "#fcf9f5", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e5e2de" }}
        className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
          <ArrowLeft size={14} style={{ color: "#75777f" }} />
          <span className="font-bold" style={{ fontSize: "1rem", color: "#1c1c1a", letterSpacing: "-0.01em" }}>RemuneraLab</span>
        </Link>
        <Link href="/empresas/restoran"
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ fontSize: "0.82rem", color: "#44474e" }}>
          Ver el dashboard <ArrowRight size={14} />
        </Link>
      </header>

      {/* ── Article ── */}
      <main className="w-full max-w-2xl mx-auto px-6 flex flex-col" style={{ paddingTop: "73px" }}>

        {/* ── HERO ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col pt-10 pb-16" style={{ gap: "1rem" }}>
          <div className="flex items-center gap-2">
            <span style={{
              background: "rgba(255,185,84,0.15)",
              border: "1px solid rgba(255,185,84,0.4)",
              color: "#704800",
              fontSize: "0.70rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "4px",
            }}>Recursos · Gastronomía</span>
            <span style={{ fontSize: "0.75rem", color: "#9a9a9a" }}>Mayo 2026 · 5 min</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.025em", color: "#1c1c1a" }}>
            ¿Cuánto cuesta reemplazar a un empleado en tu restaurante?
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#44474e", lineHeight: 1.7 }}>
            La mayoría de los dueños de restaurantes subestiman este número — o lo ignoran completamente.
            Aquí están los 6 costos reales, con fuentes y calculadora incluida.
          </p>
        </motion.section>

        {/* ── RESPUESTA RÁPIDA ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#75777f", marginBottom: "4px" }}>
              La respuesta corta
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              Entre $380k y $805k, según el cargo
            </h2>
          </div>

          {/* Featured metric card */}
          <article style={{
            background: "#ffffff",
            border: "1px solid #e5e2de",
            borderLeft: "4px solid #feb64c",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 8px 32px -4px rgba(4,22,53,0.08)",
          }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#44474e", marginBottom: "8px" }}>
                  Ayudante de Cocina · Costo de reemplazo
                </p>
                <p style={{ fontSize: "3rem", fontWeight: 800, color: "#1c1c1a", lineHeight: 1, letterSpacing: "-0.03em", fontFamily: "var(--font-space-mono)" }}>
                  ~$622k
                </p>
                <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.6, marginTop: "10px" }}>
                  No millones. Pero tampoco gratis — y casi nunca aparece en ninguna boleta.
                </p>
              </div>
            </div>
          </article>

          <article style={{
            background: "#ffffff",
            border: "1px solid #e5e2de",
            borderRadius: "12px",
            padding: "20px 24px",
          }}>
            <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.7 }}>
              Estos costos llegan disfrazados: horas del jefe dedicadas a entrevistar, semanas de bajo rendimiento
              mientras el nuevo aprende, y turnos cubiertos a medias porque el puesto quedó vacante.
            </p>
          </article>
        </motion.section>

        {/* ── POR QUÉ SE EQUIVOCAN ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#75777f", marginBottom: "4px" }}>
              El error más común
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              Por qué la gente se equivoca
            </h2>
          </div>

          <article style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "12px", padding: "20px 24px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ba1a1a", marginBottom: "8px" }}>
              Error 1 — "Me cuesta millones"
            </p>
            <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.7 }}>
              Las consultoras grandes (Mercer, Hay Group) calculan el costo de rotación como 1.5× a 2× el sueldo <em>anual</em>.
              Eso es correcto para un gerente de banco con 6 meses de inducción. Para un garzón o un ayudante de cocina,
              esa fórmula sobreestima el costo entre 10× y 20×.
            </p>
          </article>

          <article style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "12px", padding: "20px 24px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#835500", marginBottom: "8px" }}>
              Error 2 — "No cuesta nada, el próximo llega mañana"
            </p>
            <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.7 }}>
              El aviso en Trabajando.cl son ~$50k. Eso es el 8% del costo total. El costo real está en las 5 semanas
              que tarda el nuevo en aprender el sistema de la caja, los tragos de la carta y los nombres de los proveedores.
            </p>
          </article>
        </motion.section>

        {/* ── 6 COMPONENTES ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#75777f", marginBottom: "4px" }}>
              Calculadora interactiva
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              Los 6 costos que nadie te cobra en una boleta
            </h2>
          </div>

          {/* Cargo pills */}
          <div className="flex flex-wrap gap-2">
            {CARGOS.map((c, i) => (
              <button key={c.nombre} onClick={() => { setCargoIdx(i); setExpandedComp(null); }}
                className="transition-all"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  background: cargoIdx === i ? "#1c1c1a" : "#ffffff",
                  color:      cargoIdx === i ? "#ffffff" : "#44474e",
                  border:     `1px solid ${cargoIdx === i ? "#1c1c1a" : "#e5e2de"}`,
                }}>
                {c.nombre}
              </button>
            ))}
          </div>

          {/* Featured total card */}
          <article style={{
            background: "#ffffff",
            border: "1px solid #e5e2de",
            borderLeft: "4px solid #feb64c",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: "0 8px 32px -4px rgba(4,22,53,0.08)",
          }}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#44474e", marginBottom: "6px" }}>
                  Costo total estimado — {cargo.nombre}
                </p>
                <AnimatePresence mode="wait">
                  <motion.p key={cargo.total}
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: "2.8rem", fontWeight: 800, color: "#1c1c1a", lineHeight: 1, letterSpacing: "-0.03em", fontFamily: "var(--font-space-mono)" }}>
                    {fmtCLP(cargo.total)}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#75777f", textAlign: "right", paddingBottom: "4px" }}>
                {(cargo.total / cargo.sueldo).toFixed(2)}× el sueldo<br />mensual del cargo
              </p>
            </div>
          </article>

          {/* Component cards */}
          <div className="flex flex-col gap-3">
            {cargo.componentes.map((comp, i) => {
              const pct = Math.round((comp.valor / cargo.total) * 100);
              return (
                <motion.article key={`${cargo.nombre}-${i}`}
                  initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "12px", padding: "16px 20px" }}>

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: comp.color }} />
                        <span style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#44474e" }}>
                          {comp.nombre}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "#44474e", lineHeight: 1.65, paddingLeft: "16px" }}>
                        {comp.desc}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <AnimatePresence mode="wait">
                        <motion.p key={comp.valor}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", fontWeight: 700, color: "#1c1c1a" }}>
                          {fmtCLP(comp.valor)}
                        </motion.p>
                      </AnimatePresence>
                      <p style={{ fontSize: "0.65rem", color: "#9a9a9a" }}>{pct}% del total</p>
                    </div>
                  </div>

                  <div style={{ height: "3px", background: "#f0ede9", borderRadius: "9999px", overflow: "hidden", marginLeft: "16px", marginBottom: "10px" }}>
                    <motion.div style={{ height: "100%", background: comp.color, borderRadius: "9999px" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.45, delay: i * 0.05 }} />
                  </div>

                  <button
                    onClick={() => setExpandedComp(expandedComp === i ? null : i)}
                    style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.04em", color: "#75777f", paddingLeft: "16px", display: "flex", alignItems: "center", gap: "4px" }}
                    className="hover:opacity-60 transition-opacity">
                    <span style={{ fontSize: "0.5rem" }}>{expandedComp === i ? "▲" : "▼"}</span>
                    {expandedComp === i ? "Ocultar cálculo" : "Ver el cálculo →"}
                  </button>

                  <AnimatePresence>
                    {expandedComp === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        style={{ overflow: "hidden" }}>
                        <div style={{ marginTop: "12px", background: "#f6f3ef", borderRadius: "8px", padding: "14px 16px" }}>
                          <div className="flex flex-col gap-2 mb-3">
                            {METODOLOGIA[i].items.map((item, j) => (
                              <div key={j} className="flex items-start justify-between gap-3">
                                <span style={{ fontSize: "0.75rem", color: "#44474e", lineHeight: 1.5 }}>{item.label}</span>
                                <span style={{ fontSize: "0.75rem", color: "#1c1c1a", fontWeight: 700, textAlign: "right", flexShrink: 0, lineHeight: 1.5 }}>
                                  {rv(item.valor, cargo)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p style={{ fontSize: "0.74rem", color: "#835500", lineHeight: 1.6, fontStyle: "italic",
                                      borderTop: "1px solid #e5e2de", paddingTop: "10px", marginTop: "10px" }}>
                            "{METODOLOGIA[i].argumento}"
                          </p>
                          <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                            {METODOLOGIA[i].fuentes.map(f => (
                              <span key={f} style={{ fontSize: "0.62rem", color: "#9a9a9a" }}>· {f}</span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        {/* ── SLIDER ANTIGÜEDAD ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.20 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#75777f", marginBottom: "4px" }}>
              Ajuste por antigüedad
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              ¿Cuánto tiempo lleva en el cargo?
            </h2>
          </div>

          <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.7 }}>
            Una persona con 2 años sabe cosas que no están escritas en ningún manual — proveedores, procesos internos,
            clientes frecuentes. Reemplazarla tarda más.
          </p>

          <div style={{ background: "#f6f3ef", border: "1px solid #e5e2de", borderRadius: "12px", padding: "24px" }}>
            <div className="flex items-center gap-3 mb-5">
              <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1c1c1a", flexShrink: 0 }}>
                Cargo
              </label>
              <select value={cargoIdx} onChange={e => setCargoIdx(Number(e.target.value))}
                style={{ background: "#ffffff", border: "1px solid #e5e2de", color: "#1c1c1a", fontSize: "0.80rem", fontWeight: 600, padding: "6px 10px", borderRadius: "8px", flex: 1 }}>
                {CARGOS.map((c, i) => <option key={i} value={i}>{c.nombre}</option>)}
              </select>
            </div>

            <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1c1c1a", display: "block", marginBottom: "12px" }}>
              Años de experiencia en el cargo
            </label>
            <div className="flex items-center gap-4 mb-2">
              <span style={{ fontSize: "0.82rem", color: "#75777f", minWidth: "28px" }}>1m</span>
              <input type="range" min={1} max={36} value={meses}
                onChange={e => setMeses(Number(e.target.value))}
                className="flex-1" style={{ accentColor: "#091b3a" }} />
              <span style={{ fontSize: "0.82rem", color: "#75777f", minWidth: "28px", textAlign: "right" }}>3a+</span>
            </div>
            <p className="text-center" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1c1c1a", marginBottom: "4px" }}>
              {fmtMeses(meses)} en el cargo
            </p>
            <p style={{ fontSize: "0.84rem", color: "#44474e", lineHeight: 1.65, textAlign: "center", marginBottom: "16px" }}>
              {describeMeses(meses)}
            </p>

            <div style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#75777f", marginBottom: "2px" }}>
                  Costo ajustado por antigüedad
                </p>
                <p style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>{cargo.nombre} · {fmtMeses(meses)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <AnimatePresence mode="wait">
                  <motion.p key={costoAjust}
                    initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      fontFamily: "var(--font-space-mono)",
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: mult > 1.05 ? "#ba1a1a" : mult < 0.95 ? "#2a7d4f" : "#1c1c1a",
                    }}>
                    {fmtCLP(costoAjust)}
                  </motion.p>
                </AnimatePresence>
                <p style={{ fontSize: "0.65rem", color: "#9a9a9a" }}>
                  {mult >= 1 ? "+" : ""}{Math.round((mult - 1) * 100)}% vs. promedio del cargo
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── COSTO ANUAL POR ROTACIONES ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <p style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#75777f", marginBottom: "4px" }}>
              Proyección anual
            </p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              ¿Cuánto cuesta este puesto en 12 meses?
            </h2>
          </div>

          <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.7 }}>
            La segunda reposición es ~15% más barata porque el proceso ya está rodado — pero la curva de aprendizaje
            siempre se paga completa.
          </p>

          <div style={{ background: "#f6f3ef", border: "1px solid #e5e2de", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Cargo + aumento */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-3">
                <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1c1c1a", flexShrink: 0 }}>Cargo</label>
                <select value={cargoIdx} onChange={e => setCargoIdx(Number(e.target.value))}
                  style={{ background: "#ffffff", border: "1px solid #e5e2de", color: "#1c1c1a", fontSize: "0.80rem", fontWeight: 600, padding: "6px 10px", borderRadius: "8px" }}>
                  {CARGOS.map((c, i) => <option key={i} value={i}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1c1c1a", flexShrink: 0 }}>Aumento</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[20_000, 30_000, 50_000].map(v => (
                    <button key={v} onClick={() => setAumento(v)}
                      style={{
                        fontSize: "0.75rem", fontWeight: 600,
                        padding: "5px 12px", borderRadius: "9999px",
                        background: aumento === v ? "#1c1c1a" : "#ffffff",
                        color:      aumento === v ? "#ffffff" : "#44474e",
                        border:     `1px solid ${aumento === v ? "#1c1c1a" : "#e5e2de"}`,
                      }}>
                      +{fmtCLP(v)}/mes
                    </button>
                  ))}
                  <input type="number" min={5000} max={200000} step={5000} value={aumento}
                    onChange={e => setAumento(Math.max(5000, Number(e.target.value)))}
                    style={{ fontSize: "0.75rem", border: "1px solid #e5e2de", background: "#ffffff", color: "#1c1c1a", padding: "5px 10px", borderRadius: "8px", width: "90px" }} />
                </div>
              </div>
            </div>

            {/* Toggle rotaciones */}
            <div className="flex gap-2">
              {([1, 2] as const).map(n => (
                <button key={n} onClick={() => setNumRot(n)}
                  style={{
                    fontSize: "0.82rem", fontWeight: 700,
                    padding: "8px 20px", borderRadius: "8px",
                    background: numRot === n ? "#1c1c1a" : "#ffffff",
                    color:      numRot === n ? "#ffffff" : "#44474e",
                    border:     `1px solid ${numRot === n ? "#1c1c1a" : "#e5e2de"}`,
                  }}>
                  {n} rotación{n === 2 ? "es" : ""}
                </button>
              ))}
            </div>

            {/* ── 1 rotación ── */}
            {numRot === 1 && (
              <motion.div key="rot1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ba1a1a", marginBottom: "6px" }}>
                      Costo de reposición
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p key={cargo.total} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", fontWeight: 800, color: "#ba1a1a" }}>
                        {fmtCLP(cargo.total)}
                      </motion.p>
                    </AnimatePresence>
                    <p style={{ fontSize: "0.65rem", color: "#75777f", marginTop: "3px" }}>proceso completo</p>
                  </div>
                  <div style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "10px", padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#2a7d4f", marginBottom: "6px" }}>
                      Aumento · 12 meses
                    </p>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", fontWeight: 800, color: "#2a7d4f" }}>
                      {fmtCLP(aumento * 12)}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "#75777f", marginTop: "3px" }}>{fmtCLP(aumento)}/mes × 12</p>
                  </div>
                </div>
                <div style={{
                  background: cargo.total > aumento * 12 ? "rgba(42,125,79,0.05)" : "rgba(131,85,0,0.05)",
                  border: `1px solid ${cargo.total > aumento * 12 ? "rgba(42,125,79,0.20)" : "rgba(131,85,0,0.20)"}`,
                  borderRadius: "10px", padding: "14px 16px",
                }}>
                  {cargo.total > aumento * 12 ? (
                    <>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2a7d4f", marginBottom: "4px" }}>
                        Retener cuesta {Math.round(((cargo.total - aumento * 12) / cargo.total) * 100)}% menos que reemplazar
                      </p>
                      <p style={{ fontSize: "0.82rem", color: "#44474e", lineHeight: 1.6 }}>
                        El aumento de {fmtCLP(aumento)}/mes es {fmtCLP(cargo.total - aumento * 12)} más barato que el proceso de reposición.
                        No garantiza que la persona se quede, pero reduce el riesgo.
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#835500", marginBottom: "4px" }}>
                        El aumento supera el costo de reposición para este cargo
                      </p>
                      <p style={{ fontSize: "0.82rem", color: "#44474e", lineHeight: 1.6 }}>
                        Para {cargo.nombre}, un aumento de {fmtCLP(aumento)}/mes al año cuesta más que reemplazarlo una vez.
                        Considera un bono puntual en su lugar.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── 2 rotaciones ── */}
            {numRot === 2 && (
              <motion.div key="rot2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                <div>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1c1c1a", marginBottom: "10px" }}>
                    ¿Cuántos meses duró la primera persona?
                  </p>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {([1, 2, 4, 6] as const).map(m => (
                      <button key={m} onClick={() => setMesesP1(m)}
                        style={{
                          fontSize: "0.75rem", fontWeight: 600, padding: "5px 12px", borderRadius: "9999px",
                          background: mesesP1 === m ? "#1c1c1a" : "#ffffff",
                          color:      mesesP1 === m ? "#ffffff" : "#44474e",
                          border:     `1px solid ${mesesP1 === m ? "#1c1c1a" : "#e5e2de"}`,
                        }}>
                        {m} {m === 1 ? "mes" : "meses"}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={8} value={mesesP1}
                      onChange={e => setMesesP1(Number(e.target.value))}
                      className="flex-1" style={{ accentColor: "#091b3a" }} />
                    <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1c1c1a", minWidth: "55px" }}>
                      {fmtMeses(mesesP1)}
                    </span>
                  </div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ede9", display: "flex", alignItems: "start", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1c1c1a" }}>1ª reposición</p>
                      <p style={{ fontSize: "0.70rem", color: "#75777f", marginTop: "2px" }}>
                        {mesesP1 < 1.25
                          ? `Salió antes de completar la curva — ${fmtMeses(mesesP1)}`
                          : `Proceso completo · duró ${fmtMeses(mesesP1)}`}
                      </p>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p key={costo1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", fontWeight: 800, color: "#ba1a1a", flexShrink: 0 }}>
                        {fmtCLP(costo1)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ede9", background: "#fdfbf8", display: "flex", alignItems: "start", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#1c1c1a" }}>2ª reposición</p>
                      <p style={{ fontSize: "0.70rem", color: "#75777f", marginTop: "2px" }}>
                        −30% en aviso, selección y docs · curva completa igual
                      </p>
                    </div>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", fontWeight: 800, color: "#ba1a1a", flexShrink: 0 }}>
                      {fmtCLP(costo2)}
                    </p>
                  </div>
                  <div style={{ padding: "14px 18px", background: "rgba(186,26,26,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1c1c1a" }}>Total en el año</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={totalRot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.2rem", fontWeight: 800, color: "#ba1a1a" }}>
                        {fmtCLP(totalRot)}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                <div style={{ background: "rgba(42,125,79,0.05)", border: "1px solid rgba(42,125,79,0.20)", borderRadius: "10px", padding: "14px 16px" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2a7d4f" }}>
                      vs. aumento de {fmtCLP(aumento)}/mes · 12 meses
                    </p>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", fontWeight: 800, color: "#2a7d4f" }}>
                      {fmtCLP(aumento * 12)}
                    </p>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#44474e", lineHeight: 1.6 }}>
                    2 rotaciones cuestan <strong>{(totalRot / (aumento * 12)).toFixed(1)}×</strong> más que el aumento anual.
                    Cada vez que evitas una salida, el ahorro es inmediato.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* ── TABLA RESUMEN ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              Resumen por cargo
            </h2>
          </div>

          <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e2de" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "420px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e2de" }}>
                    <th style={{ padding: "12px 16px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#44474e" }}>Cargo</th>
                    <th style={{ padding: "12px 16px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#44474e", textAlign: "right" }}>Sueldo típico</th>
                    <th style={{ padding: "12px 16px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1c1c1a", textAlign: "right" }}>Costo reemplazo</th>
                    <th style={{ padding: "12px 16px", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#44474e", textAlign: "right" }} className="hidden sm:table-cell">× sueldo</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.88rem", color: "#1c1c1a" }}>
                  {CARGOS.map((c, i) => (
                    <tr key={c.nombre}
                      style={{
                        borderBottom: "1px solid rgba(229,226,222,0.5)",
                        background: i % 2 === 0 ? "#ffffff" : "#fdfbf8",
                      }}
                      className="hover:bg-[#f6f3ef] transition-colors">
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>{c.nombre}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: "#44474e", textAlign: "right" }}>{fmtCLP(c.sueldo)}</td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-space-mono)", fontSize: "0.88rem", fontWeight: 700, color: "#ba1a1a", textAlign: "right" }}>{fmtCLP(c.total)}</td>
                      <td style={{ padding: "14px 16px", fontSize: "0.80rem", color: "#75777f", textAlign: "right" }} className="hidden sm:table-cell">{(c.total / c.sueldo).toFixed(2)}×</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: "0.68rem", color: "#9a9a9a", fontStyle: "italic", textAlign: "right" }}>
            Deslice horizontalmente para ver más datos.
          </p>
        </motion.section>

        {/* ── FUENTES ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="pb-16 flex flex-col gap-5">
          <div style={{ borderBottom: "1px solid #e5e2de", paddingBottom: "12px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
              Fuentes y metodología
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {([
              ["Trabajando.cl",                                          "Tarifas de publicación de avisos laborales (consultadas mayo 2026)."],
              ["Computrabajo Chile",                                     "Tarifas de publicación de avisos laborales (consultadas mayo 2026)."],
              ["SHRM Cost-Per-Hire Standard (ANSI/SHRM-09001-2012)",    "Metodología estándar para calcular el costo de contratación incluyendo tiempo del seleccionador."],
              ["O'Connell, M. & Kung, M.C. (2007)",                     "The Cost of Employee Turnover. Industrial Management, 49(1), 14–19. Base del modelo de curva de aprendizaje y productividad parcial."],
              ["Mercer Chile — Encuesta de Remuneraciones (2023–2024)", "Referencia de sueldos de mercado para el sector gastronómico en la Región Metropolitana y V Región."],
              ["SENCE / OTIC Gastronomía",                              "Estándares de horas de capacitación en sala, cocina y bar utilizados para estimar el costo del trainer."],
            ] as [string, string][]).map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <span style={{ marginTop: "7px", flexShrink: 0, width: "6px", height: "6px", borderRadius: "9999px", background: "#c5c6cf" }} />
                <p style={{ fontSize: "0.84rem", color: "#44474e", lineHeight: 1.7 }}>
                  <strong style={{ color: "#1c1c1a" }}>{title}</strong> — {desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          style={{
            background: "#f1ede9",
            border: "1px solid #e5e2de",
            borderRadius: "16px",
            padding: "40px 32px",
            textAlign: "center",
            marginBottom: "64px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1c1c1a", letterSpacing: "-0.01em" }}>
            Accede al diagnóstico completo de tu equipo
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#44474e", lineHeight: 1.7, maxWidth: "440px" }}>
            ¿Tu restaurante tiene datos de nómina reales? RemuneraLab puede darte el riesgo de rotación
            personalizado por persona, benchmark salarial y plan de acción en minutos.
          </p>
          <Link href="/empresas/restoran"
            style={{
              background: "#091b3a",
              color: "#ffffff",
              width: "100%",
              maxWidth: "380px",
              padding: "16px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            className="hover:opacity-90 transition-opacity">
            <ArrowRight size={16} />
            Ver demo del dashboard
          </Link>
          <Link href="/"
            style={{
              background: "transparent",
              color: "#091b3a",
              width: "100%",
              maxWidth: "380px",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "1px solid #091b3a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="hover:bg-[#e5e2de] transition-colors">
            Ver metodología completa
          </Link>
        </motion.section>

      </main>

      {/* ── Footer ── */}
      <footer style={{ background: "#f1ede9", borderTop: "1px solid #e5e2de", padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1c1c1a" }}>RemuneraLab</p>
        <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px" }}>
          {["Metodología", "Privacidad", "Términos", "Contacto"].map(link => (
            <Link key={link} href="/"
              style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.03em", color: "#44474e" }}
              className="hover:text-[#1c1c1a] transition-colors">
              {link}
            </Link>
          ))}
        </nav>
        <p style={{ fontSize: "0.72rem", color: "#75777f", textAlign: "center" }}>
          © 2026 RemuneraLab. Inteligencia de datos para la gastronomía chilena.
        </p>
      </footer>

    </div>
  );
}
