"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle, Bell, CheckCircle2, ChevronRight,
  Clock, ExternalLink, Info, MapPin,
  Scale, TrendingDown, Users,
} from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

// ─── CountUp ─────────────────────────────────────────────────────────────────

function CountUp({ to, duration = 1400, prefix = "", suffix = "" }: {
  to: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const inView = useRef(false);
  const elRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !inView.current) {
        inView.current = true;
        const t0 = performance.now();
        const decimals = to % 1 !== 0 ? 1 : 0;
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const ease = 1 - (1 - p) ** 3;
          if (el) el.textContent = prefix + (ease * to).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration, prefix, suffix]);
  return <span ref={elRef}>{prefix}0{suffix}</span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CLINICA = {
  nombre:    "Clínica Santa Elena",
  ciudad:    "Santiago, Región Metropolitana",
  empleados: 280,
  tipo:      "Clínica privada · Sector oriente de Santiago",
};

type GapLevel = "CRÍTICO" | "ALTO" | "MODERADO";

const ROLES: {
  cargo: string; cargo_corto: string; cantidad: number;
  actual: number; mercado: number;
  gap: number; nivel: GapLevel;
  fuente: string;
}[] = [
  {
    cargo: "TENS · UCI y curaciones avanzadas",
    cargo_corto: "TENS UCI",
    cantidad: 18, actual: 680_000, mercado: 865_000,
    gap: 21, nivel: "CRÍTICO",
    fuente: "ClinicalWork 2024 + Michael Page",
  },
  {
    cargo: "Auxiliar de Enfermería",
    cargo_corto: "Aux. Enfermería",
    cantidad: 24, actual: 620_000, mercado: 750_000,
    gap: 17, nivel: "CRÍTICO",
    fuente: "Hays Chile 2025 + ESI 2023",
  },
  {
    cargo: "Enfermera/o",
    cargo_corto: "Enfermera/o",
    cantidad: 32, actual: 1_100_000, mercado: 1_350_000,
    gap: 19, nivel: "ALTO",
    fuente: "Michael Page 2024 + CASEN 2022",
  },
  {
    cargo: "Técnico en Radiología",
    cargo_corto: "Técnico Radiología",
    cantidad: 8, actual: 720_000, mercado: 890_000,
    gap: 19, nivel: "ALTO",
    fuente: "ClinicalWork 2024",
  },
  {
    cargo: "Kinesiólogo/a",
    cargo_corto: "Kinesiólogo/a",
    cantidad: 12, actual: 980_000, mercado: 1_200_000,
    gap: 18, nivel: "ALTO",
    fuente: "Hays Chile 2025 + Michael Page",
  },
];

const TIMELINE = [
  {
    mes: "Enero 2024",
    evento: "Primera renuncia: TENS con 3 años en UCI migra a clínica del sector oriente. RRHH registra \"motivo personal\" y abre proceso de reemplazo urgente.",
    impacto: "Señal no visible con los datos disponibles",
    color: "bg-orange-400",
  },
  {
    mes: "Febrero 2024",
    evento: "Segunda y tercera renuncia simultánea. RRHH diagnostica \"estrés por turno nocturno\". No investiga compensación. Los dos reemplazos contratados tienen menos de 1 año de experiencia.",
    impacto: "$9.520.000 en primeros costos de reposición",
    color: "bg-red-400",
  },
  {
    mes: "Abril 2024",
    evento: "Cuarta y quinta renuncia. La UCI opera con dotación mínima durante 6 semanas. Se registran demoras en protocolos por falta de experiencia del personal nuevo.",
    impacto: "$9.520.000 adicionales · riesgo operacional activo",
    color: "bg-red-500",
  },
  {
    mes: "Junio 2024",
    evento: "Sexta y séptima renuncia. En el exit interview declaran: \"en la clínica de al lado pagan $780.000\". Es la primera vez que RRHH escucha este argumento directamente.",
    impacto: "$9.520.000 · la causa real aparece por primera vez",
    color: "bg-red-600",
  },
  {
    mes: "Julio – Agosto 2024",
    evento: "Renuncias 8 a 11. El 1 de agosto entra en vigencia la Ley Karin (21.643). La clínica no tiene protocolo de prevención de acoso registrado ante la Dirección del Trabajo.",
    impacto: "$19.040.000 en reposición · exposición legal activada",
    color: "bg-red-700",
  },
  {
    mes: "Septiembre 2024",
    evento: "Un TENS que renunció presenta denuncia ante la DT por condiciones de trabajo hostiles. Sin protocolo Ley Karin registrado, la multa es inmediata: 10 UTM por trabajador afectado, más honorarios legales.",
    impacto: "$8.000.000 en multas y costos legales",
    color: "bg-red-800",
  },
];

const FUENTES = [
  {
    nombre: "ESI 2023 — Encuesta Suplementaria de Ingresos",
    uso: "Percentiles salariales por ocupación CIUO, región y tamaño de empresa. Base principal para benchmarks de Auxiliar de Enfermería y personal técnico.",
    url: "https://www.ine.gob.cl/estadisticas/sociales/ingresos-y-gastos/encuesta-suplementaria-de-ingresos",
    organismo: "INE — Instituto Nacional de Estadísticas",
  },
  {
    nombre: "CASEN 2022 — Encuesta de Caracterización Socioeconómica",
    uso: "Ingresos del trabajo por rama de actividad económica y calificación ocupacional. Complementa ESI para cargos con menor representación muestral.",
    url: "https://observatorio.ministeriodesarrollosocial.gob.cl/encuesta-casen",
    organismo: "Ministerio de Desarrollo Social",
  },
  {
    nombre: "Estudio de Remuneración 2024–2025 — Michael Page Chile",
    uso: "Rangos salariales actualizados para TENS, Enfermeras/os, Kinesiólogos y Técnicos en Radiología en Santiago privado.",
    url: "https://www.michaelpage.cl/estudios-y-tendencias/estudio-de-remuneracion-2024-2025-1-MP-095",
    organismo: "Michael Page Chile",
  },
  {
    nombre: "Guía Laboral Chile 2025 — Hays Recruitment",
    uso: "Benchmarks de compensación para sector salud y parámetros de retención de talento clínico especializado.",
    url: "https://www.hays.cl/guia-laboral",
    organismo: "Hays Chile",
  },
  {
    nombre: "ClinicalWork — Ofertas laborales sector salud",
    uso: "Precios de mercado publicados para TENS con experiencia en UCI en Santiago 2023–2024. Permite contrastar oferta real vs sueldo interno.",
    url: "https://clinicalwork.cl",
    organismo: "ClinicalWork Chile",
  },
  {
    nombre: "Ley N° 21.643 — Ley Karin",
    uso: "Obligaciones del empleador, protocolos de prevención y sanciones: multa base 10 UTM por trabajador afectado ante incumplimiento.",
    url: "https://www.mintrab.gob.cl/ley-karin/",
    organismo: "Ministerio del Trabajo y Previsión Social",
  },
  {
    nombre: "Normativa Ley Karin — Dirección del Trabajo",
    uso: "Interpretación oficial, obligaciones específicas y proceso de fiscalización bajo Ley 21.643.",
    url: "https://www.dt.gob.cl/portal/1626/w3-propertyvalue-179028.html",
    organismo: "Dirección del Trabajo",
  },
];

// ─── Poder adquisitivo ────────────────────────────────────────────────────────

const PREV_PCT = 17.5; // AFP ~10,5% promedio + FONASA 7% (cotización mínima)

const CANASTA = [
  { label: "Vivienda",          monto: 250_000, desc: "Arriendo pieza compartida, sector accesible de Santiago" },
  { label: "Alimentación",      monto: 150_000, desc: "Mercado mensual + almuerzo laboral ocasional" },
  { label: "Transporte",        monto: 70_000,  desc: "Tarjeta Bip! mensual + traslados ocasionales" },
  { label: "Servicios básicos", monto: 50_000,  desc: "Agua, luz, gas e internet (prorrateados en arriendo)" },
  { label: "Salud y copagos",   monto: 35_000,  desc: "Copagos FONASA, dental básico y medicamentos" },
  { label: "Vestuario y aseo",  monto: 40_000,  desc: "Ropa básica y artículos de higiene personal" },
  { label: "Imprevistos",       monto: 45_000,  desc: "Reserva mínima para emergencias o gastos inesperados" },
];
const CANASTA_TOTAL = CANASTA.reduce((s, c) => s + c.monto, 0); // $640.000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

function gapBadge(nivel: GapLevel) {
  if (nivel === "CRÍTICO") return "bg-red-900/20 text-red-400 border border-red-500/20";
  if (nivel === "ALTO")    return "bg-orange-900/20 text-orange-400 border border-orange-500/20";
  return                          "bg-yellow-900/20 text-yellow-400 border border-yellow-500/20";
}

const CIERRE_OPTS = [25, 50, 75, 100];

// ─── IBL helpers ─────────────────────────────────────────────────────────────

const COMPLIANCE_BASE  = 30;  // AFP ok · Sin Ley Karin · Sin verificación jornada
const COMPLIANCE_KARIN = 80;  // +50 al registrar protocolo Ley Karin ante DT

function iblLabel(s: number): { label: string; color: string } {
  if (s >= 85) return { label: "ÓPTIMO",      color: "#06D6A0" };
  if (s >= 70) return { label: "ACEPTABLE",   color: "#2EC4B6" };
  if (s >= 50) return { label: "DETERIORADO", color: "#F5A623" };
  return              { label: "CRÍTICO",     color: "#FF4D5A" };
}

function calcIBL(
  actual: number, mercado: number, nivel: GapLevel,
  compliance: number, salSim?: number
): { ibl: number; E: number; P: number; L: number; R: number } {
  const sal = salSim ?? actual;
  const gap = Math.max(0, (mercado - sal) / mercado * 100);
  const liq = sal * (1 - PREV_PCT / 100);
  const E   = Math.round(Math.max(0, Math.min(100, 100 - gap)));
  const P   = Math.round(Math.min(100, liq / CANASTA_TOTAL * 100));
  const L   = compliance;
  let   R   = 100;
  if (gap >= 20) R -= 30; else if (gap >= 10) R -= 15;
  if (nivel === "CRÍTICO") R -= 20; else if (nivel === "ALTO") R -= 10;
  R = Math.max(0, R);
  const ibl = Math.round((E * 0.40 + P * 0.25 + L * 0.20 + R * 0.15) * 10) / 10;
  return { ibl, E, P, L, R };
}

function factorDesc(f: "E" | "P" | "L" | "R", score: number): string {
  if (f === "E") {
    if (score >= 90) return "Sueldo dentro del rango competitivo. Riesgo de salida bajo.";
    if (score >= 75) return "Sueldo moderadamente bajo el mercado. Riesgo creciente si competidores ajustan bandas.";
    return "Sueldo significativamente bajo el mercado. Alta exposición a ofertas externas.";
  }
  if (f === "P") {
    if (score >= 100) return "El sueldo líquido cubre la canasta básica con excedente. Estabilidad financiera posible.";
    if (score >= 90)  return "Sueldo líquido cubre casi la canasta básica. Escaso margen para imprevistos o ahorro.";
    return "Sueldo líquido no cubre la canasta básica digna. Alta probabilidad de estrés financiero activo.";
  }
  if (f === "L") {
    if (score >= 80) return "Protocolos obligatorios registrados. Riesgo legal bajo.";
    if (score >= 50) return "Cumplimiento parcial. Existen brechas legales con riesgo de sanciones.";
    return "Sin protocolo Ley Karin registrado. Riesgo de multa desde el primer día de una denuncia.";
  }
  if (score >= 80) return "Alta probabilidad de retención en los próximos 12 meses.";
  if (score >= 65) return "Probabilidad moderada. El trabajador puede estar evaluando alternativas.";
  return "Alta probabilidad de rotación. El mercado ofrece condiciones significativamente mejores.";
}

function IBLRing({ score, size = 88 }: { score: number; size?: number }) {
  const { color } = iblLabel(score);
  const sw = 7, r = (size - sw) / 2, c = size / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${fill.toFixed(1)} ${circ.toFixed(1)}`}
        strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dasharray 0.7s ease, stroke 0.4s ease" }} />
      <text x={c} y={c} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={Math.round(size * 0.22)} fontWeight="bold"
        fontFamily="var(--font-dm-sans)">
        {score}
      </text>
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CasoRealSalud() {

  const [selRoles, setSelRoles] = useState<boolean[]>(ROLES.map(() => true));
  const [cierre, setCierre] = useState<number[]>(ROLES.map(() => 75));
  const [showMetodologia, setShowMetodologia] = useState(false);
  const [paIdx, setPaIdx] = useState(0);
  const [iblIdx, setIblIdx] = useState(0);
  const [simAjuste, setSimAjuste] = useState(false);
  const [simKarin, setSimKarin] = useState(false);

  function toggleRole(i: number) {
    setSelRoles(prev => prev.map((v, idx) => idx === i ? !v : v));
  }
  function setCierreFor(i: number, pct: number) {
    setCierre(prev => prev.map((v, idx) => idx === i ? pct : v));
  }

  const calcData = ROLES.map((r, i) => {
    const gapMonto     = r.mercado - r.actual;
    const ajustePers   = Math.round(gapMonto * cierre[i] / 100);
    const costoMensual = ajustePers * r.cantidad;
    const costoAnual   = costoMensual * 12;
    const costoRep     = r.actual * 7 * r.cantidad;
    return { gapMonto, ajustePers, costoMensual, costoAnual, costoRep };
  });

  const totalMensual  = ROLES.reduce((s, _, i) => selRoles[i] ? s + calcData[i].costoMensual : s, 0);
  const totalAnual    = totalMensual * 12;
  const totalRep      = ROLES.reduce((s, _, i) => selRoles[i] ? s + calcData[i].costoRep : s, 0);
  const ahorro        = totalRep - totalAnual;
  const roiCalc       = totalAnual > 0 ? (totalRep / totalAnual).toFixed(1) : "—";

  const cargosSelec   = selRoles.filter(Boolean).length;
  const personasSelec = ROLES.reduce((s, r, i) => selRoles[i] ? s + r.cantidad : s, 0);

  return (
    <div>

      {/* ── 1. Perfil empresa ───────────────────────────────────────────── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <div className="border-l-2 border-[#00B4D8] pl-6 mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-2"
              style={{ fontFamily: "var(--font-space-mono)" }}>
              Análisis aplicado · Empresa representativa del sector
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              {CLINICA.nombre}
            </h2>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/45">
              <span className="flex items-center gap-1.5"><MapPin size={12} />{CLINICA.ciudad}</span>
              <span className="flex items-center gap-1.5"><Users size={12} />{CLINICA.empleados} empleados</span>
              <span className="flex items-center gap-1.5"><Scale size={12} />{CLINICA.tipo}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { valor: "11",   label: "TENS que renunciaron",  sub: "en 8 meses · misma causa raíz",   color: "text-red-400" },
              { valor: "−21%", label: "Bajo el mercado P50",   sub: "cargo más crítico · TENS UCI",     color: "text-red-400" },
              { valor: "$60M", label: "Pérdida total estimada", sub: "reposición + multas · 2024",      color: "text-red-400" },
            ].map((k, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: E }}
                className="border border-white/10 bg-white/4 rounded-lg p-5 text-center">
                <div className={`text-3xl font-bold mb-1 ${k.color}`}>{k.valor}</div>
                <div className="text-sm font-medium text-white">{k.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{k.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Callout: el problema de fondo ───────────────────────────── */}
      <div className="border-b border-white/8 bg-white/3">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="border border-[#00B4D8]/20 bg-[#00B4D8]/5 rounded-xl p-6 flex gap-5">
            <Info size={20} className="text-[#00B4D8] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-2">
                ¿Por qué nadie lo vio antes?
              </p>
              <p className="text-sm text-white/60 leading-relaxed mb-3">
                La clínica no estaba pagando mal — estaba pagando igual que siempre. El problema es que{" "}
                <strong className="text-white">el mercado salarial del sector salud en Santiago subió un 18–22% entre 2022 y 2024</strong>,
                impulsado por la expansión de nuevas clínicas privadas en el sector oriente, y{" "}
                <strong className="text-white">esa información no llega de forma accesible a las áreas de RRHH</strong> de empresas de este tamaño.
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                No es una falla de gestión. Es una brecha de información. Las grandes consultoras (Mercer, Korn Ferry)
                publican estudios de remuneración anuales a partir de{" "}
                <strong className="text-white">$3–8 millones</strong> y están dirigidos a empresas de más de 500 empleados.
                RemuneraLab cruza las mismas fuentes de datos — ESI, CASEN, avisos activos, guías sectoriales —
                y las hace accesibles en tiempo real.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 3. Mapa salarial vs mercado ────────────────────────────────── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-2">
            <h3 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              Posición salarial por cargo vs mercado
            </h3>
          </motion.div>

          <button
            onClick={() => setShowMetodologia(v => !v)}
            className="flex items-center gap-1.5 text-xs text-[#00B4D8] mb-6 hover:text-[#00B4D8]/80 transition-colors">
            <Info size={12} />
            {showMetodologia ? "Ocultar metodología" : "¿Cómo se calculan estos números?"}
          </button>

          <AnimatePresence>
            {showMetodologia && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: E }}
                className="overflow-hidden mb-6">
                <div className="border border-[#00B4D8]/20 bg-[#00B4D8]/5 rounded-xl p-5 text-sm text-white/60 leading-relaxed space-y-2">
                  <p>
                    <strong className="text-white">Mercado P50</strong> es la mediana del mercado: la mitad de los trabajadores con ese cargo y experiencia gana más, la otra mitad gana menos.
                    Es el punto de equilibrio más usado en benchmarks salariales.
                  </p>
                  <p>
                    <strong className="text-white">Fuentes cruzadas:</strong> ESI 2023 (INE, ~130.000 encuestados), CASEN 2022, Michael Page Salary Survey 2024–2025, Hays Salary Guide 2025 y avisos publicados en ClinicalWork con salario visible.
                    Para cada cargo se tomó el percentil 50 dentro del rango de experiencia correspondiente, acotado a la Región Metropolitana y sector privado.
                  </p>
                  <p>
                    <strong className="text-white">El gap %</strong> se calcula como <code className="text-[#00B4D8]">(mercado − actual) / mercado × 100</code>.
                    Indica qué tan por debajo del referente de mercado está el sueldo actual.
                  </p>
                  <p className="text-white/40 text-xs">
                    Estos valores son estimaciones de referencia. La posición real varía según experiencia, jornada y beneficios no remunerativos de cada empresa.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_100px] gap-x-4 px-4 mb-2">
            {["Cargo", "Sueldo actual", "Mercado P50", "Brecha", "Nivel"].map((h) => (
              <span key={h} className="text-xs font-semibold uppercase tracking-wider text-white/40"
                style={{ fontFamily: "var(--font-space-mono)" }}>{h}</span>
            ))}
          </div>

          <div className="space-y-2">
            {ROLES.map((r, i) => (
              <motion.div key={r.cargo}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: E }}
                viewport={{ once: true }}
                className="border border-white/10 bg-white/4 rounded-lg px-4 py-3">
                {/* Desktop */}
                <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_100px] gap-x-4 items-center">
                  <div>
                    <span className="text-sm font-medium text-white">{r.cargo}</span>
                    <span className="ml-2 text-xs text-white/40">× {r.cantidad} personas</span>
                  </div>
                  <span className="font-mono text-sm text-white">{fmtCLP(r.actual)}</span>
                  <div>
                    <span className="font-mono text-sm text-[#06D6A0]">{fmtCLP(r.mercado)}</span>
                    <p className="text-xs text-white/30 mt-0.5">{r.fuente}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-red-400">−{r.gap}%</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${gapBadge(r.nivel)}`}>
                    {r.nivel}
                  </span>
                </div>
                {/* Mobile */}
                <div className="sm:hidden">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-white">
                      {r.cargo} <span className="text-white/40">× {r.cantidad}</span>
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${gapBadge(r.nivel)}`}>
                      {r.nivel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-white/45">Actual: <span className="font-mono font-semibold text-white">{fmtCLP(r.actual)}</span></span>
                    <span className="text-white/45">P50: <span className="font-mono font-semibold text-[#06D6A0]">{fmtCLP(r.mercado)}</span></span>
                    <span className="font-mono font-semibold text-red-400">−{r.gap}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Poder adquisitivo ────────────────────────────────────────── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8">
            <h3 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              ¿Qué significa ese sueldo en la vida real?
            </h3>
            <p className="text-sm text-white/50 max-w-2xl">
              La brecha salarial no es solo un número de mercado — es la diferencia entre poder vivir con
              dignidad en Santiago o no. Esto es lo que alcanza (o no alcanza) el sueldo líquido de cada cargo.
            </p>
          </motion.div>

          {/* Selector de cargo */}
          <div className="flex flex-wrap gap-2 mb-8">
            {ROLES.map((r, i) => (
              <button
                key={i}
                onClick={() => setPaIdx(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  paIdx === i
                    ? "bg-[#00B4D8] text-[#0D2240] font-semibold"
                    : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/80"
                }`}
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                {r.cargo_corto}
              </button>
            ))}
          </div>

          {(() => {
            const r = ROLES[paIdx];
            const descActual   = Math.round(r.actual  * PREV_PCT / 100);
            const liqActual    = r.actual  - descActual;
            const balActual    = liqActual - CANASTA_TOTAL;
            const pctActual    = Math.round(liqActual / CANASTA_TOTAL * 100);

            const descMerc     = Math.round(r.mercado * PREV_PCT / 100);
            const liqMerc      = r.mercado - descMerc;
            const balMerc      = liqMerc   - CANASTA_TOTAL;
            const pctMerc      = Math.round(liqMerc   / CANASTA_TOTAL * 100);

            return (
              <motion.div
                key={paIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: E }}>

                {/* Comparativa actual vs mercado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                  {/* Panel actual */}
                  <div className={`rounded-xl border p-5 ${
                    balActual < 0
                      ? "border-red-500/25 bg-red-900/8"
                      : "border-white/10 bg-white/4"
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        Sueldo actual
                      </span>
                    </div>

                    {/* Desglose bruto → líquido */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/45">Sueldo bruto</span>
                        <span className="font-mono text-sm font-semibold text-white">{fmtCLP(r.actual)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/45">AFP ~10,5% + FONASA 7%</span>
                        <span className="font-mono text-sm text-red-400/80">− {fmtCLP(descActual)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/8">
                        <span className="text-xs font-semibold text-white">Sueldo líquido estimado</span>
                        <span className="font-mono text-base font-bold text-white">{fmtCLP(liqActual)}</span>
                      </div>
                    </div>

                    {/* Barra de cobertura */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/40 mb-1.5">
                        <span>Cobertura de la canasta básica</span>
                        <span className={`font-semibold ${pctActual >= 100 ? "text-[#06D6A0]" : "text-red-400"}`}>
                          {pctActual}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/8 rounded-full overflow-hidden relative">
                        <motion.div
                          className={`h-full rounded-full ${pctActual >= 100 ? "bg-[#06D6A0]" : "bg-red-400"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pctActual, 100)}%` }}
                          transition={{ duration: 0.8, ease: E }}
                        />
                        {/* Línea de referencia 100% */}
                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/20" />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs text-white/25 mt-0.5">← canasta mínima</span>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className={`rounded-lg px-4 py-3 text-center ${
                      balActual < 0
                        ? "bg-red-900/20 border border-red-500/20"
                        : "bg-emerald-900/15 border border-emerald-500/20"
                    }`}>
                      <p className="text-xs text-white/45 mb-0.5">
                        {balActual < 0 ? "Déficit mensual" : "Excedente mensual"}
                      </p>
                      <p className={`font-mono text-xl font-bold ${balActual < 0 ? "text-red-400" : "text-[#06D6A0]"}`}>
                        {balActual < 0 ? "−" : "+"}{fmtCLP(Math.abs(balActual))}
                      </p>
                      {balActual < 0 && (
                        <p className="text-xs text-white/35 mt-1.5 leading-relaxed">
                          Para cubrir sus gastos básicos, este trabajador
                          necesita {fmtCLP(Math.abs(balActual))} más al mes de lo que recibe — o trabaja horas extra,
                          o se endeuda, o se va.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Panel mercado */}
                  <div className={`rounded-xl border p-5 ${
                    balMerc >= 0
                      ? "border-emerald-500/25 bg-emerald-900/8"
                      : "border-white/10 bg-white/4"
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-[#06D6A0]" />
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        Con sueldo de mercado P50
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/45">Sueldo bruto</span>
                        <span className="font-mono text-sm font-semibold text-[#06D6A0]">{fmtCLP(r.mercado)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/45">AFP ~10,5% + FONASA 7%</span>
                        <span className="font-mono text-sm text-red-400/80">− {fmtCLP(descMerc)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/8">
                        <span className="text-xs font-semibold text-white">Sueldo líquido estimado</span>
                        <span className="font-mono text-base font-bold text-white">{fmtCLP(liqMerc)}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/40 mb-1.5">
                        <span>Cobertura de la canasta básica</span>
                        <span className={`font-semibold ${pctMerc >= 100 ? "text-[#06D6A0]" : "text-red-400"}`}>
                          {pctMerc}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/8 rounded-full overflow-hidden relative">
                        <motion.div
                          className={`h-full rounded-full ${pctMerc >= 100 ? "bg-[#06D6A0]" : "bg-red-400"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pctMerc, 100)}%` }}
                          transition={{ duration: 0.8, ease: E }}
                        />
                        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/20" />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-xs text-white/25 mt-0.5">← canasta mínima</span>
                      </div>
                    </div>

                    <div className={`rounded-lg px-4 py-3 text-center ${
                      balMerc >= 0
                        ? "bg-emerald-900/15 border border-emerald-500/20"
                        : "bg-red-900/20 border border-red-500/20"
                    }`}>
                      <p className="text-xs text-white/45 mb-0.5">
                        {balMerc >= 0 ? "Excedente mensual" : "Déficit mensual"}
                      </p>
                      <p className={`font-mono text-xl font-bold ${balMerc >= 0 ? "text-[#06D6A0]" : "text-red-400"}`}>
                        {balMerc >= 0 ? "+" : "−"}{fmtCLP(Math.abs(balMerc))}
                      </p>
                      {balMerc >= 0 && (
                        <p className="text-xs text-white/35 mt-1.5 leading-relaxed">
                          Con el sueldo de mercado, el trabajador cubre sus gastos básicos
                          y le quedan {fmtCLP(balMerc)} al mes para ahorro, formación o imprevistos.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Callout insight */}
                {balActual < 0 && balMerc >= 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mb-8 border border-[#00B4D8]/20 bg-[#00B4D8]/5 rounded-xl p-4 flex gap-3 items-start">
                    <Info size={15} className="text-[#00B4D8] shrink-0 mt-0.5" />
                    <p className="text-sm text-white/60 leading-relaxed">
                      Con el sueldo actual, <strong className="text-white">{r.cargo_corto} no llega a fin de mes en Santiago</strong> sin
                      endeudarse o trabajar horas extra. Con el sueldo de mercado P50, puede cubrir sus gastos básicos y mantener
                      un excedente mínimo de seguridad.{" "}
                      <strong className="text-white">El ajuste salarial no es un beneficio extra — es devolver poder adquisitivo real.</strong>
                    </p>
                  </motion.div>
                )}

              </motion.div>
            );
          })()}

          {/* Desglose canasta básica digna */}
          <div className="border border-white/8 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-white/4 border-b border-white/8 flex items-center justify-between">
              <p className="text-xs font-semibold text-white uppercase tracking-wider"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                Canasta básica digna · Santiago · Persona sola · 2024
              </p>
              <span className="font-mono text-sm font-bold text-white">{fmtCLP(CANASTA_TOTAL)}/mes</span>
            </div>
            <div className="divide-y divide-white/6">
              {CANASTA.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white">{item.label}</span>
                    <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-semibold text-white/70">{fmtCLP(item.monto)}</span>
                    <p className="text-xs text-white/30">
                      {Math.round(item.monto / CANASTA_TOTAL * 100)}% del total
                    </p>
                  </div>
                  <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00B4D8]/50 rounded-full"
                      style={{ width: `${Math.round(item.monto / CANASTA_TOTAL * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-white/3 border-t border-white/8">
              <p className="text-xs text-white/30 leading-relaxed">
                <strong className="text-white/50">Metodología:</strong> Estimación conservadora basada en valores de mercado reales para Santiago 2024.
                Canasta básica de Fundación Sol («Salario Mínimo Ético», encuesta 2024) y datos de arriendo de Portal Inmobiliario y GoPlaceIt.
                No incluye entretenimiento, restaurantes ni educación post-básica. Descuentos previsionales calculados con AFP promedio 10,5%
                + FONASA 7% (no considera Impuesto de Segunda Categoría ya que los sueldos analizados están bajo el primer tramo exento ~$960.000).
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── IBL: Índice de Bienestar Laboral ─────────────────────────────── */}
      {(() => {
        const compliance = simKarin ? COMPLIANCE_KARIN : COMPLIANCE_BASE;
        const allData = ROLES.map(r => {
          const salSim = simAjuste ? r.actual + Math.round((r.mercado - r.actual) * 0.75) : undefined;
          return calcIBL(r.actual, r.mercado, r.nivel, compliance, salSim);
        });
        const totalPersonas = ROLES.reduce((s, r) => s + r.cantidad, 0);
        const iblBase = Math.round(
          ROLES.reduce((s, r, i) => s + calcIBL(r.actual, r.mercado, r.nivel, COMPLIANCE_BASE).ibl * r.cantidad, 0)
          / totalPersonas * 10) / 10;
        const iblSim  = Math.round(
          ROLES.reduce((s, r, i) => s + allData[i].ibl * r.cantidad, 0)
          / totalPersonas * 10) / 10;
        const hasSim  = simAjuste || simKarin;
        const sel     = ROLES[iblIdx];
        const selData = allData[iblIdx];
        const selLbl  = iblLabel(selData.ibl);

        return (
          <div className="border-b border-white/8">
            <div className="max-w-7xl mx-auto px-6 py-12">

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: E }} viewport={{ once: true }}
                className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ fontFamily: "var(--font-space-mono)", color: "#00B4D8" }}>
                  Índice de Bienestar Laboral · IBL
                </p>
                <h3 className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Diagnóstico integral por cargo
                </h3>
                <p className="text-sm text-white/50 max-w-2xl leading-relaxed">
                  El IBL combina cuatro factores que determinan el bienestar real de un trabajador en su cargo.
                  Un sueldo alto puede tener bajo IBL si hay riesgo legal o estrés financiero. Un IBL bajo predice
                  rotación con más precisión que el gap salarial aislado.
                </p>
              </motion.div>

              {/* Fórmula visible */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E }} viewport={{ once: true }}
                className="mb-10 border border-white/10 bg-white/4 rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  Fórmula IBL
                </p>
                <div className="flex flex-wrap gap-3 items-center font-mono text-sm">
                  <span className="text-white font-bold">IBL =</span>
                  {[
                    { key: "E", label: "Equidad salarial",   w: 40, color: "#00B4D8" },
                    { key: "P", label: "Poder adquisitivo",  w: 25, color: "#06D6A0" },
                    { key: "L", label: "Cumplimiento legal", w: 20, color: "#F5A623" },
                    { key: "R", label: "Retención esperada", w: 15, color: "#a78bfa" },
                  ].map((f, fi) => (
                    <span key={f.key} className="flex items-center gap-1.5">
                      {fi > 0 && <span className="text-white/30">+</span>}
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}>
                        {f.key} × {f.w}%
                      </span>
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: "E", desc: "Gap vs mercado P50. A mayor brecha, menor score.", color: "#00B4D8" },
                    { key: "P", desc: "Sueldo líquido vs canasta básica digna Santiago.", color: "#06D6A0" },
                    { key: "L", desc: "Protocolo Ley Karin, AFP al día, jornada máxima.", color: "#F5A623" },
                    { key: "R", desc: "Probabilidad estimada de permanencia 12 meses.", color: "#a78bfa" },
                  ].map(f => (
                    <div key={f.key} className="rounded-lg p-3"
                      style={{ background: `${f.color}08`, border: `1px solid ${f.color}20` }}>
                      <p className="text-xs font-bold mb-1" style={{ color: f.color }}>{f.key}</p>
                      <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Overview empresa + Simulador */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

                {/* IBL empresa */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: E }} viewport={{ once: true }}
                  className="border border-white/10 bg-white/4 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    IBL Global — Clínica Santa Elena
                  </p>
                  <div className="flex items-center gap-5">
                    <IBLRing score={hasSim ? iblSim : iblBase} size={100} />
                    <div>
                      <p className="text-2xl font-bold text-white mb-0.5">
                        {hasSim ? iblSim : iblBase}
                        <span className="text-sm font-normal text-white/40"> / 100</span>
                      </p>
                      <p className="text-sm font-semibold mb-1"
                        style={{ color: iblLabel(hasSim ? iblSim : iblBase).color }}>
                        {iblLabel(hasSim ? iblSim : iblBase).label}
                      </p>
                      <p className="text-xs text-white/35">{totalPersonas} personas · 5 cargos</p>
                      {hasSim && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-xs text-white/40">Base:</span>
                          <span className="font-mono text-xs text-white/60">{iblBase}</span>
                          <span className="text-xs font-bold text-[#06D6A0]">
                            → {iblSim} (+{(iblSim - iblBase).toFixed(1)} pts)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-xs text-white/30 leading-relaxed">
                      Score ponderado por cantidad de personas en cada cargo.
                      Un IBL ≥ 85 indica condiciones óptimas de bienestar y retención.
                    </p>
                  </div>
                </motion.div>

                {/* Simulador */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08, ease: E }} viewport={{ once: true }}
                  className="border border-[#00B4D8]/20 bg-[#00B4D8]/5 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#00B4D8] mb-1"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    Simulador de mejoras
                  </p>
                  <p className="text-xs text-white/45 mb-5">
                    Activa estas acciones para ver el impacto en el IBL en tiempo real.
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        active: simAjuste, toggle: () => setSimAjuste(v => !v),
                        label: "Ajuste salarial preventivo",
                        desc: "Cierre del 75% de la brecha vs mercado P50 en todos los cargos críticos.",
                        impact: `+${(ROLES.reduce((s,r) => {
                          const b = calcIBL(r.actual,r.mercado,r.nivel,COMPLIANCE_BASE);
                          const a = calcIBL(r.actual,r.mercado,r.nivel,COMPLIANCE_BASE, r.actual+Math.round((r.mercado-r.actual)*0.75));
                          return s + (a.ibl - b.ibl) * r.cantidad;
                        }, 0) / totalPersonas).toFixed(1)} pts IBL promedio`,
                        color: "#06D6A0",
                      },
                      {
                        active: simKarin, toggle: () => setSimKarin(v => !v),
                        label: "Protocolo Ley Karin registrado",
                        desc: "Implementación del protocolo de prevención ante la Dirección del Trabajo.",
                        impact: "+20 pts en factor L (cumplimiento legal) para todos los cargos.",
                        color: "#F5A623",
                      },
                    ].map((sim, si) => (
                      <button key={si} onClick={sim.toggle}
                        className={`w-full text-left rounded-xl p-4 border transition-all ${
                          sim.active
                            ? "border-white/20 bg-white/8"
                            : "border-white/8 bg-white/3 hover:bg-white/5"
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            sim.active ? "border-transparent" : "border-white/25"
                          }`}
                            style={sim.active ? { background: sim.color } : {}}>
                            {sim.active && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="#0D2240" strokeWidth="1.8"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white mb-0.5">{sim.label}</p>
                            <p className="text-xs text-white/40 leading-relaxed mb-2">{sim.desc}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: `${sim.color}15`, color: sim.color }}>
                              {sim.impact}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Cards por cargo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {ROLES.map((r, i) => {
                  const d   = allData[i];
                  const lbl = iblLabel(d.ibl);
                  const isActive = iblIdx === i;
                  const baseIbl = calcIBL(r.actual, r.mercado, r.nivel, COMPLIANCE_BASE).ibl;
                  const delta   = hasSim ? d.ibl - baseIbl : 0;
                  return (
                    <motion.button key={i}
                      initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: E }}
                      viewport={{ once: true }}
                      onClick={() => setIblIdx(i)}
                      className={`rounded-xl border p-4 text-center transition-all flex flex-col items-center gap-2 ${
                        isActive
                          ? "border-[#00B4D8]/40 bg-[#00B4D8]/8"
                          : "border-white/10 bg-white/4 hover:bg-white/7 hover:border-white/20"
                      }`}>
                      <IBLRing score={d.ibl} size={72} />
                      <p className="text-xs font-semibold text-white leading-tight">{r.cargo_corto}</p>
                      <p className="text-xs font-bold" style={{ color: lbl.color }}>{lbl.label}</p>
                      <p className="text-xs text-white/35">{r.cantidad} personas</p>
                      {hasSim && delta !== 0 && (
                        <span className="text-xs font-bold text-[#06D6A0]">
                          +{delta.toFixed(1)} pts
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Desglose de factores — cargo seleccionado */}
              <AnimatePresence mode="wait">
                <motion.div key={`${iblIdx}-${simAjuste}-${simKarin}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: E }}
                  className="border border-white/10 bg-white/4 rounded-xl overflow-hidden">

                  {/* Header */}
                  <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-white">{sel.cargo}</p>
                      <p className="text-xs text-white/40">{sel.cantidad} personas · {sel.fuente}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <IBLRing score={selData.ibl} size={60} />
                      <div className="text-right">
                        <p className="font-mono text-2xl font-bold text-white">{selData.ibl}</p>
                        <p className="text-xs font-bold" style={{ color: selLbl.color }}>{selLbl.label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Factores */}
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {([
                      { key: "E" as const, label: "E — Equidad salarial",   w: 40, color: "#00B4D8", score: selData.E },
                      { key: "P" as const, label: "P — Poder adquisitivo",  w: 25, color: "#06D6A0", score: selData.P },
                      { key: "L" as const, label: "L — Cumplimiento legal", w: 20, color: "#F5A623", score: selData.L },
                      { key: "R" as const, label: "R — Retención esperada", w: 15, color: "#a78bfa", score: selData.R },
                    ] as const).map(f => (
                      <div key={f.key}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{f.label}</span>
                            <span className="text-xs text-white/25 font-mono">peso {f.w}%</span>
                          </div>
                          <span className="font-mono text-sm font-bold" style={{ color: f.color }}>
                            {f.score}/100
                          </span>
                        </div>
                        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden mb-2">
                          <motion.div className="h-full rounded-full"
                            style={{ background: f.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${f.score}%` }}
                            transition={{ duration: 0.7, ease: E }}
                          />
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed">
                          {factorDesc(f.key, f.score)}
                        </p>
                        {/* Contribución al IBL */}
                        <p className="text-xs text-white/25 mt-1 font-mono">
                          Aporta {(f.score * f.w / 100).toFixed(1)} pts al IBL total
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Insight contextual */}
                  <div className="px-6 pb-6">
                    <div className="bg-white/4 border border-white/8 rounded-lg p-4">
                      <p className="text-xs font-semibold text-white mb-1">Lectura del IBL para este cargo</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {selData.ibl >= 85
                          ? `Con IBL ${selData.ibl}, ${sel.cargo_corto} está en condiciones óptimas. Riesgo de rotación bajo si se mantienen las condiciones actuales.`
                          : selData.ibl >= 70
                          ? `Con IBL ${selData.ibl}, ${sel.cargo_corto} está en zona aceptable pero con factores de riesgo activos. Una o dos variables deterioradas más llevarían el cargo a zona crítica.`
                          : `Con IBL ${selData.ibl}, ${sel.cargo_corto} está en zona de deterioro. Los factores combinados generan condiciones que empujan al trabajador hacia otras opciones laborales — no necesariamente por una sola causa, sino por la acumulación de presiones.`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Nota metodológica */}
              <div className="mt-6 px-4 py-3 rounded-lg border border-white/8 bg-white/3">
                <p className="text-xs text-white/30 leading-relaxed">
                  <strong className="text-white/50">Metodología IBL:</strong> E se calcula como 100 − gap% (mercado−actual)/mercado.
                  P como min(100, líquido/canasta×100). L basado en checklist de obligaciones legales laborales.
                  R estimado con penalizaciones según magnitud del gap y presión de mercado por cargo.
                  Score ponderado: E×40% + P×25% + L×20% + R×15%.
                  Los pesos son conservadores y fueron calibrados para que un cargo en mercado con cumplimiento legal completo alcance IBL 87–92 (no 100), reflejando que siempre existe algún grado de incertidumbre laboral.
                </p>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── 5b. Calculadora por cargo ───────────────────────────────────── */}
      <div className="border-b border-white/8 bg-white/3">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-2">
            <h3 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              ¿Cuánto cuesta cerrar la brecha?
            </h3>
            <p className="text-sm text-white/50 max-w-2xl">
              Selecciona los cargos que quieres analizar y define qué porcentaje de la brecha cerrarías en este momento.
              Los números se ajustan en tiempo real.
            </p>
          </motion.div>

          <div className="mt-4 mb-8 p-4 bg-white/4 border border-white/10 rounded-lg flex gap-3 items-start">
            <Info size={14} className="text-white/40 shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">
              <strong className="text-white">Costo de reposición:</strong> estimado en{" "}
              <strong className="text-white">7 meses de sueldo por persona</strong> — incluye
              reclutamiento (1–2 meses), inducción clínica (2–3 meses) y pérdida de productividad del equipo
              mientras el nuevo integrante alcanza el ritmo normal. Cifra conservadora basada en literatura SHRM
              ajustada a salud especializada en Chile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

            {/* Cards por cargo */}
            <div className="lg:col-span-3 space-y-3">
              {ROLES.map((r, i) => {
                const d = calcData[i];
                const isOn = selRoles[i];
                return (
                  <motion.div key={r.cargo}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06, ease: E }}
                    viewport={{ once: true }}
                    className={`rounded-xl border transition-all duration-200 ${
                      isOn
                        ? "border-white/15 bg-white/5"
                        : "border-white/6 bg-white/2 opacity-50"
                    }`}>

                    {/* Header de cargo */}
                    <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleRole(i)}
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isOn ? "bg-[#00B4D8] border-[#00B4D8]" : "border-white/20 bg-transparent"
                          }`}>
                          {isOn && <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#0D2240" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>}
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{r.cargo}</p>
                          <p className="text-xs text-white/40">{r.cantidad} personas · brecha {r.gap}% bajo P50</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${gapBadge(r.nivel)}`}>
                        {r.nivel}
                      </span>
                    </div>

                    <AnimatePresence>
                      {isOn && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: E }}
                          className="overflow-hidden">
                          <div className="px-4 pb-4 border-t border-white/8 pt-3 space-y-3">

                            {/* Desglose numérico */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-xs text-white/40 mb-0.5">Sueldo actual</p>
                                <p className="text-xs font-mono font-semibold text-white">{fmtCLP(r.actual)}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-xs text-white/40 mb-0.5">P50 mercado</p>
                                <p className="text-xs font-mono font-semibold text-[#06D6A0]">{fmtCLP(r.mercado)}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-xs text-white/40 mb-0.5">Brecha / persona</p>
                                <p className="text-xs font-mono font-semibold text-red-400">+{fmtCLP(d.gapMonto)}</p>
                              </div>
                            </div>

                            {/* Selector % cierre */}
                            <div>
                              <p className="text-xs text-white/45 mb-2">
                                ¿Qué parte de la brecha cerrarías ahora?
                              </p>
                              <div className="flex gap-2">
                                {CIERRE_OPTS.map(pct => (
                                  <button
                                    key={pct}
                                    onClick={() => setCierreFor(i, pct)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      cierre[i] === pct
                                        ? "bg-[#00B4D8] text-[#0D2240]"
                                        : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/80"
                                    }`}>
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Resultado del ajuste */}
                            <div className="flex items-center justify-between bg-[#00B4D8]/8 border border-[#00B4D8]/20 rounded-lg px-3 py-2.5 gap-3">
                              <div>
                                <p className="text-xs text-white/45">Ajuste por persona</p>
                                <p className="font-mono text-sm font-bold text-[#00B4D8]">+{fmtCLP(d.ajustePers)}/mes</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-white/45">Costo total del cargo</p>
                                <p className="font-mono text-sm font-bold text-white">{fmtCLP(d.costoMensual)}/mes</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-white/45">vs reponer a 1 persona</p>
                                <p className="font-mono text-sm font-semibold text-red-400">{fmtCLP(r.actual * 7)}</p>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Panel resumen */}
            <div className="lg:col-span-2 sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: E }}
                viewport={{ once: true }}
                className="border border-white/15 bg-white/5 rounded-xl p-5 space-y-4">

                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    Resumen de inversión
                  </p>
                  <span className="text-xs text-white/40">
                    {cargosSelec} cargos · {personasSelec} personas
                  </span>
                </div>

                {/* Métrica principal */}
                <div className="text-center py-3 border-b border-white/8">
                  <p className="text-xs text-white/45 mb-1">Inversión mensual en retención</p>
                  <p className="text-4xl font-bold text-[#00B4D8]">{fmtShort(totalMensual)}</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    = {fmtShort(totalAnual)} al año
                  </p>
                </div>

                {/* vs costo de perder gente */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Costo de reposición (si se van)</span>
                    <span className="font-mono text-sm font-semibold text-red-400">{fmtShort(totalRep)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Inversión en retención (anual)</span>
                    <span className="font-mono text-sm font-semibold text-[#00B4D8]">{fmtShort(totalAnual)}</span>
                  </div>
                  <div className="border-t border-white/8 pt-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">Diferencia a favor de retener</span>
                    <span className={`font-mono text-sm font-bold ${ahorro > 0 ? "text-[#06D6A0]" : "text-red-400"}`}>
                      {ahorro > 0 ? "+" : ""}{fmtShort(ahorro)}
                    </span>
                  </div>
                </div>

                {/* ROI pill */}
                {totalAnual > 0 && ahorro > 0 && (
                  <div className="bg-emerald-900/15 border border-emerald-500/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-white/45 mb-0.5">Por cada peso invertido en retención</p>
                    <p className="text-2xl font-bold text-[#06D6A0]">{roiCalc}×</p>
                    <p className="text-xs text-white/30">retorno vs dejar que se vayan</p>
                  </div>
                )}

                {/* Nota */}
                <p className="text-xs text-white/30 leading-relaxed border-t border-white/8 pt-3">
                  Este cálculo asume que el ajuste salarial es suficiente para retener al 100% del personal del cargo.
                  En la práctica, la efectividad varía. La lógica sigue siendo válida incluso si retiene a un 50% de los casos.
                </p>

              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Alertas simuladas ────────────────────────────────────────── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8">
            <h3 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              Las alertas que habrían llegado
            </h3>
            <p className="text-sm text-white/50 max-w-2xl">
              Simulación de lo que RemuneraLab habría generado automáticamente. Ambas señales estaban
              disponibles con meses de anticipación — solo faltaba la plataforma que las detectara.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Alerta salarial */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: E }}
              viewport={{ once: true }}
              className="border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-white" />
                  <span className="text-sm font-semibold text-white">RemuneraLab · Alerta salarial</span>
                </div>
                <span className="text-xs text-white/70">Miér, 11 oct 2023 · 08:52</span>
              </div>
              <div className="bg-white/4 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-400"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    Desalineamiento salarial crítico detectado
                  </span>
                </div>
                <p className="text-base font-bold text-white">TENS · UCI y curaciones avanzadas</p>
                <p className="text-sm text-white/45 mb-5">{CLINICA.nombre} · Santiago</p>
                <div className="mb-5 p-4 bg-white/8 rounded-lg space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-2"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    Posición en el mercado
                  </p>
                  {[
                    { label: "Enero 2023", pct: 48, color: "bg-[#06D6A0]", text: "text-[#06D6A0]", tag: "Percentil 48" },
                    { label: "Octubre 2023 — hoy", pct: 31, color: "bg-red-400", text: "text-red-400", tag: "Percentil 31" },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs text-white/45 mb-1">
                        <span>{row.label}</span>
                        <span className={`font-semibold ${row.text}`}>{row.tag}</span>
                      </div>
                      <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-white/45 pt-1 flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-red-400" />
                    Las clínicas del sector oriente subieron sus bandas un 22% en 2023. La banda de la clínica no se movió.
                  </p>
                </div>
                <p className="text-sm text-white/50 mb-4 leading-relaxed">
                  Hay <strong className="text-white">3 clínicas competidoras en un radio de 8 km</strong> reclutando
                  TENS especializados con ofertas entre <strong className="text-white">$780.000 y $950.000</strong>.
                </p>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Ver análisis completo <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-white/40">Recordar en 30 días</button>
                </div>
              </div>
            </motion.div>

            {/* Alerta Ley Karin */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: E }}
              viewport={{ once: true }}
              className="border border-white/10 rounded-xl overflow-hidden">
              <div className="bg-amber-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={14} className="text-white" />
                  <span className="text-sm font-semibold text-white">RemuneraLab · Alerta legal</span>
                </div>
                <span className="text-xs text-white/70">Mar, 9 abr 2024 · 10:17</span>
              </div>
              <div className="bg-white/4 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-400"
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    Riesgo de incumplimiento legal detectado
                  </span>
                </div>
                <p className="text-base font-bold text-white">Ley Karin (21.643)</p>
                <p className="text-sm text-white/45 mb-5">
                  Entra en vigencia el 1 de agosto de 2024 · <strong className="text-white">113 días</strong>
                </p>
                <div className="mb-5 p-4 bg-amber-900/15 border border-amber-500/20 rounded-lg space-y-3">
                  {[
                    { icon: <AlertTriangle size={13} className="text-red-400 shrink-0" />, label: "Protocolo DT registrado", val: "No encontrado", col: "text-red-400" },
                    { icon: <Users size={13} className="text-amber-400 shrink-0" />,        label: "Trabajadores expuestos",  val: "280 personas",  col: "text-amber-400" },
                    { icon: <Scale size={13} className="text-red-400 shrink-0" />,          label: "Exposición máx. estimada", val: "~$184.800.000", col: "text-red-400" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">{row.icon}<span className="text-xs text-white/45">{row.label}</span></div>
                      <span className={`text-xs font-semibold ${row.col}`}>{row.val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/50 mb-4 leading-relaxed">
                  Con <strong className="text-white">280 empleados y sin protocolo registrado</strong>,
                  cualquier denuncia activa la multa máxima desde el primer día de vigencia.
                  El protocolo se puede implementar en 48 horas — el riesgo legal no espera.
                </p>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Generar protocolo guiado <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-white/40">Ver guía completa</button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ── 6. Timeline ─────────────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-white/3">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8">
            <h3 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              Lo que ocurrió antes de tener los datos
            </h3>
            <p className="text-sm text-white/50">
              8 meses de pérdidas que empezaron con una señal de mercado que no había forma de ver
              con las herramientas disponibles para clínicas de este tamaño.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[7px] sm:left-[11px] top-2 bottom-2 w-px bg-white/10" />
            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: E }}
                  viewport={{ once: true }}
                  className="flex gap-4 sm:gap-6">
                  <div className="shrink-0 pt-1">
                    <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full ${item.color} ring-2 ring-[#0D2240]`} />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={11} className="text-white/40" />
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">{item.mes}</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed mb-1.5">{item.evento}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-900/12 px-2 py-0.5 rounded">
                      <AlertTriangle size={10} /> {item.impacto}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. El costo de saber vs no saber ────────────────────────────── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8">
            <h3 className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              El costo de actuar a tiempo vs reaccionar tarde
            </h3>
            <p className="text-sm text-white/50">Actuar en octubre 2023 vs reaccionar en septiembre 2024.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Sin RL */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="border border-red-500/25 bg-white/4 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm font-semibold text-white">Sin los datos del mercado</span>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { label: "11 reposiciones TENS (7 meses sueldo c/u, conservador)", monto: "$52.360.000" },
                  { label: "Multa DT Ley Karin + honorarios legales",                monto: "$8.000.000"  },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-3">
                    <span className="text-xs text-white/45 leading-relaxed">{item.label}</span>
                    <span className="text-xs font-mono font-semibold text-white whitespace-nowrap">{item.monto}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 pt-4 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Total estimado</span>
                <div className="text-2xl font-bold text-red-400">
                  $<CountUp to={60} />M
                </div>
              </div>
            </motion.div>

            {/* Con RL */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: E }}
              viewport={{ once: true }}
              className="border border-emerald-500/25 bg-emerald-900/12 rounded-lg p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-[#06D6A0]" />
                <span className="text-sm font-semibold text-white">Con alerta oportuna</span>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { label: "Ajuste 8 TENS at-risk × $80.000/mes × 12 meses (75% de cierre de brecha)", monto: "$7.680.000/año" },
                  { label: "Suscripción RemuneraLab plan Growth (anual)",                               monto: "$2.268.000/año" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-3">
                    <span className="text-xs text-white/45 leading-relaxed">{item.label}</span>
                    <span className="text-xs font-mono font-semibold text-[#06D6A0] whitespace-nowrap">{item.monto}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto space-y-2">
                {[
                  "Alerta salarial en octubre 2023 → ajuste preventivo antes de la primera renuncia.",
                  "Alerta legal en abril 2024 → protocolo Ley Karin implementado antes de agosto.",
                  "Estimación conservadora: si se retiene el 80% del personal, se evita el 80% del costo.",
                ].map((txt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#06D6A0] shrink-0 mt-0.5" />
                    <span className="text-xs text-white/45">{txt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ROI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: E }}
            viewport={{ once: true }}
            className="bg-[#00B4D8]/8 border border-[#00B4D8]/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-1"
                style={{ fontFamily: "var(--font-space-mono)" }}>
                Retorno sobre la inversión estimado
              </p>
              <p className="text-sm text-white/50 max-w-sm">
                $60M en costos evitables contra $9.9M en retención preventiva + suscripción.
                Incluso asumiendo 50% de efectividad, el ROI es positivo.
              </p>
            </div>
            <div className="text-6xl font-bold text-[#06D6A0] shrink-0">
              <CountUp to={6} duration={900} />x
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 8. Metodología y fuentes ────────────────────────────────────── */}
      <div>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-6">
            <h3 className="text-lg font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              Metodología y fuentes
            </h3>
            <p className="text-sm text-white/50 max-w-2xl">
              <strong className="text-white">La empresa es representativa, no real</strong> — construida a partir de
              datos estadísticos de clínicas privadas de 200–350 empleados en el sector oriente de Santiago.
              Los montos, benchmarks, leyes y estadísticas son reales y verificables en las fuentes a continuación.
            </p>
          </motion.div>

          <div className="space-y-3">
            {FUENTES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: E }}
                viewport={{ once: true }}
                className="border border-white/10 rounded-lg p-4 bg-white/4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{f.nombre}</p>
                    <p className="text-xs text-white/45 leading-relaxed">{f.uso}</p>
                    <p className="text-xs text-white/25 mt-0.5">{f.organismo}</p>
                  </div>
                  <a href={f.url} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 text-[#00B4D8]/60 hover:text-[#00B4D8] transition-colors mt-0.5"
                    aria-label="Ver fuente">
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-xs font-mono text-white/20 mt-1.5 truncate">{f.url}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA final */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mt-10 border border-white/10 rounded-xl p-6 bg-white/4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-base font-bold text-white mb-1">¿Tu clínica u hospital tiene brechas similares?</p>
              <p className="text-sm text-white/50">
                Un diagnóstico inicial toma menos de 20 minutos y no requiere datos de planilla — solo cargo, región y tamaño de empresa.
              </p>
            </div>
            <a href="/empresas#contacto"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)", color: "#0D2240" }}>
              Solicitar diagnóstico <ChevronRight size={14} />
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
