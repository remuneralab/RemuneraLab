"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Mail, CheckCircle2,
  AlertTriangle, TrendingDown, ShieldAlert,
  Shield, Scale, FileCheck,
  ChevronDown, PlayCircle,
  Activity, Minus, Plus,
} from "lucide-react";
import TabNav from "./TabNav";

const E = [0.16, 1, 0.3, 1] as const;

const C = {
  abismo:   "#0A0F1E",
  nocturno: "#1C2438",
  acero:    "#2E3A52",
  electric: "#00C2FF",
  teal:     "#00E5C4",
  amber:    "#F5A623",
  red:      "#FF4D5A",
};

function fmtCLP(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

const METRICAS = [
  { num: "104K+", label: "Registros salariales",  sub: "ESI + CASEN + avisos"    },
  { num: "8",     label: "Sectores cubiertos",    sub: "Por industria"            },
  { num: "8.4x",  label: "ROI promedio",          sub: "Casos documentados"       },
  { num: "16",    label: "Regiones de Chile",     sub: "Cobertura nacional"       },
];

const LOGOS = [
  "Clínica Santa Elena",
  "Corredora Pacífico Sur",
  "Sol. Digitales Pacífico",
  "Minera Atacama Norte",
  "Hotel Boutique Andino",
];

const PROBLEMAS = [
  {
    icon: TrendingDown,
    title: "Renuncias que no viste venir",
    desc: "Sin inteligencia salarial, los cargos críticos acumulan brecha silenciosa con el mercado hasta que el colaborador ya tiene oferta.",
    tag: "RIESGO DE ROTACIÓN",
    tagColor: C.amber,
  },
  {
    icon: ShieldAlert,
    title: "Compliance reactivo",
    desc: "La Ley Karin, Ley de Transparencia Salarial y normas sectoriales exigen datos auditables. Sin sistema, la empresa responde después del hecho.",
    tag: "EXPOSICIÓN LEGAL",
    tagColor: C.red,
  },
  {
    icon: AlertTriangle,
    title: "Decisiones sin datos de mercado",
    desc: "Bandas salariales fijadas hace años sin validación generan costos de retención que se acumulan antes de que el CFO los detecte.",
    tag: "PRESUPUESTO",
    tagColor: C.amber,
  },
];

const TRUST_BADGES = [
  {
    icon: Shield,
    title: "Datos 100% anónimos",
    desc: "Ningún registro es identificable. El algoritmo trabaja sobre distribuciones estadísticas, nunca sobre perfiles nominados.",
    tag: "PRIVACIDAD",
    color: C.teal,
  },
  {
    icon: Scale,
    title: "Fuentes oficiales INE / MIDESO",
    desc: "El benchmark usa ESI (INE) y CASEN (MIDESO) — las mismas fuentes del Ministerio del Trabajo, con representatividad nacional.",
    tag: "FUENTES OFICIALES",
    color: C.electric,
  },
  {
    icon: FileCheck,
    title: "Compatible con Ley Karin y Transparencia Salarial",
    desc: "Los reportes respaldan auditorías de equidad salarial según los marcos legales vigentes en Chile. Documentación auditable.",
    tag: "COMPLIANCE",
    color: C.amber,
  },
];

const FAQS = [
  {
    q: "¿De dónde vienen los datos del benchmark?",
    a: "Combinamos tres fuentes: Encuesta Suplementaria de Ingresos (ESI) del INE, CASEN del MIDESO y avisos laborales del mercado chileno. Los datos ESI/CASEN tienen representatividad estadística nacional con factor de expansión aplicado — 104.284 registros en total.",
  },
  {
    q: "¿Qué tan precisos son los benchmarks por cargo?",
    a: "La precisión depende del volumen de datos para ese cargo específico. Cada consulta incluye un indicador de confianza (Alta / Media / Baja). Cargos transversales en sectores con muchos registros tienen confianza Alta desde el primer análisis.",
  },
  {
    q: "¿Cuánto tiempo toma el primer análisis?",
    a: "El primer reporte ejecutivo puede estar listo en 48 a 72 horas desde que compartes la lista de cargos. No hay integración técnica ni instalación requerida — el análisis llega como reporte o dashboard compartido.",
  },
  {
    q: "¿Cómo se protege la información de mi empresa?",
    a: "Los cargos que compartes para el análisis no se almacenan en bases de datos públicas ni se usan para entrenar modelos de terceros. Tu empresa nunca es la fuente del benchmark — el análisis se realiza sobre nuestros datos de mercado.",
  },
  {
    q: "¿Cuánto cuesta el servicio?",
    a: "La demo inicial y el análisis preliminar son sin costo. Los planes de acceso continuo dependen del tamaño de la empresa y los sectores requeridos. Lo conversamos en la demo — sin presión.",
  },
];

const SALARIOS = [
  { label: "$800K — Técnico / Administrativo", value: 800_000   },
  { label: "$1.2M — Profesional junior",        value: 1_200_000 },
  { label: "$2M — Profesional senior",           value: 2_000_000 },
  { label: "$3M — Jefatura / Coordinación",     value: 3_000_000 },
  { label: "$5M — Gerencia media",              value: 5_000_000 },
];

const PASOS = [
  {
    num: "01",
    title: "Comparte tus cargos críticos",
    desc: "Indícanos los roles que quieres analizar: cargo, industria, región y experiencia típica.",
  },
  {
    num: "02",
    title: "Recibe inteligencia lista para decidir",
    desc: "Te entregamos un reporte ejecutivo con posicionamiento de mercado, alertas de riesgo y proyección salarial por cargo.",
  },
  {
    num: "03",
    title: "Actúa antes de que el mercado te sorprenda",
    desc: "Usa los datos para ajustar bandas, prevenir rotación y respaldar cada decisión salarial con evidencia auditable.",
  },
];

const fieldClass =
  "w-full px-4 py-3.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:border-[#00C2FF] focus:bg-white/8 transition-all text-sm";
const labelClass = "block mb-2 uppercase tracking-[0.18em] text-white/40";

export default function EmpresasPage() {
  const [form,    setForm]    = useState({ nombre: "", empresa: "", email: "", cargo: "" });
  const [enviado, setEnviado] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [calcCargos,  setCalcCargos]  = useState(5);
  const [calcSalario, setCalcSalario] = useState(2_000_000);
  const [calcGap,     setCalcGap]     = useState(20);
  const [includeBono, setIncludeBono] = useState(false);

  const costoRotacionTotal    = calcCargos * calcSalario * 12 * 1.5;
  const referenciaSHRM        = costoRotacionTotal * 0.08;
  const ajusteMensualPorCargo = calcSalario * (calcGap / 100);
  const ajusteMensualTotal    = ajusteMensualPorCargo * calcCargos;
  const ajusteAnualTotal      = ajusteMensualTotal * 12;
  const bonoPermanencia       = includeBono ? calcSalario * calcCargos : 0;
  const costoRetencionTotal   = ajusteAnualTotal + bonoPermanencia;
  const ahorroPotencial       = costoRotacionTotal - costoRetencionTotal;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[RemuneraLab Enterprise] Solicitud de demo — ${form.empresa}`);
    const body    = encodeURIComponent(
      `Nombre: ${form.nombre}\nEmpresa: ${form.empresa}\nCargo: ${form.cargo}\nEmail: ${form.email}`
    );
    window.location.href = `mailto:andreschile111@gmail.com?subject=${subject}&body=${body}`;
    setEnviado(true);
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: C.abismo }}>

      {/* Glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-[800px] h-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,194,255,0.07) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-20 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,229,196,0.05) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/6"
        style={{ background: "rgba(10,15,30,0.90)", backdropFilter: "blur(16px)" }}>
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a href="/" className="font-serif-display italic text-white hover:text-[#00C2FF] transition-colors"
            style={{ fontSize: "1.4rem" }}>
            RemuneraLab
          </a>
          <nav className="flex items-center gap-3">
            <TabNav active="general" />
            <a href="/empresas/login"
              className="hover:text-white/60 transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
              Iniciar sesión
            </a>
            <a href="/empresas/registro"
              className="inline-flex items-center gap-1.5 font-semibold border border-[#00C2FF]/40 text-[#00C2FF] px-4 py-1.5 rounded hover:bg-[#00C2FF]/10 transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
              Solicitar demo
            </a>
          </nav>
        </div>
      </header>

      <main className="relative flex-grow pt-16">

        {/* ── HERO ── */}
        <section className="relative min-h-[92vh] flex items-center border-b border-white/6 overflow-hidden">
          <div className="absolute top-12 right-12 w-28 h-28 pointer-events-none"
            style={{ borderTop: "1px solid rgba(0,194,255,0.3)", borderRight: "1px solid rgba(0,194,255,0.3)" }} />
          <div className="absolute bottom-12 left-12 w-16 h-16 pointer-events-none"
            style={{ borderBottom: "1px solid rgba(0,194,255,0.15)", borderLeft: "1px solid rgba(0,194,255,0.15)" }} />

          <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 lg:gap-24 items-center w-full">
            <div className="flex flex-col gap-8">

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: E }}
                className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.teal }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.teal }} />
                </span>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  RemuneraLab Enterprise · Workforce Intelligence Platform
                </span>
              </motion.div>

              <div className="flex flex-col gap-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: E, delay: 0.08 }}
                  className="text-5xl sm:text-6xl font-bold text-white leading-[1.0] tracking-tight"
                  style={{ fontFamily: "var(--font-dm-serif)" }}>
                  Anticipa.<br />
                  <em style={{ color: C.electric, fontStyle: "normal" }}>No reacciones.</em>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: E, delay: 0.18 }}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: C.teal, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Del ruido del mercado al dato que decide.
                </motion.p>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: E, delay: 0.22 }}
                className="text-white/45 leading-relaxed max-w-sm"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem" }}>
                Inteligencia laboral para CHRO, CFO y directorio. Datos del mercado
                chileno condensados en alertas accionables — antes de que el talento
                clave decida irse.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E, delay: 0.28 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a href="/empresas/registro"
                  className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded hover:opacity-90 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, #2EC4B6)`,
                    color: C.abismo, fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem",
                    boxShadow: "0 0 32px rgba(0,229,196,0.22)",
                  }}>
                  Solicitar demo gratuita <ArrowRight size={15} />
                </a>
                <a href="/empresas/casos"
                  className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded border border-white/12 text-white/55 hover:text-white/80 hover:border-white/20 transition-all"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem" }}>
                  Ver casos de ROI
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: E, delay: 0.35 }}
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.22)" }}>
                Sin compromiso · 104K+ registros chilenos reales · Respuesta en 24h
              </motion.p>
            </div>

            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E, delay: 0.15 }}
              className="rounded-xl p-6 sm:p-8 relative"
              style={{ background: C.nocturno, border: "1px solid rgba(0,194,255,0.15)", backdropFilter: "blur(8px)" }}>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: C.electric, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
                    Análisis ejecutivo — ejemplo
                  </p>
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    Industria Tecnología · Santiago
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={13} style={{ color: C.teal }} />
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: C.teal, letterSpacing: "0.1em" }}>LIVE</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { cargo: "Dev Backend",     pct: 72, color: C.teal,    status: "ÓPTIMO"  },
                  { cargo: "Product Manager", pct: 45, color: C.amber,   status: "ALERTA"  },
                  { cargo: "UX Designer",     pct: 28, color: C.red,     status: "RIESGO"  },
                ].map((row) => (
                  <div key={row.cargo} className="flex items-center gap-3">
                    <span className="shrink-0" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", width: "118px" }}>
                      {row.cargo}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
                    </div>
                    <span className="shrink-0 text-right tabular-nums"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: row.color, width: "40px" }}>
                      P{row.pct}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded text-center"
                      style={{
                        fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.08em",
                        background: `${row.color}18`, color: row.color, border: `1px solid ${row.color}30`, width: "56px",
                      }}>
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg p-3 mb-5 flex items-start gap-3"
                style={{ background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.18)" }}>
                <AlertTriangle size={13} style={{ color: C.amber, flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: C.amber, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
                    Alerta temprana · UX Designer
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: "1.5" }}>
                    Brecha del 28% bajo mercado. Riesgo de rotación: alto en próximos 60 días.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {[
                  { label: "En riesgo", n: "1", color: C.red   },
                  { label: "Alerta",    n: "1", color: C.amber  },
                  { label: "Óptimo",    n: "1", color: C.teal   },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: s.color }}>{s.n}</p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TRUST BAND ── */}
        <section className="border-b border-white/6" style={{ background: "rgba(28,36,56,0.5)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/6">
              {METRICAS.map((m, i) => (
                <div key={i} className="flex flex-col items-center py-8 px-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold tabular-nums text-white" style={{ fontFamily: "var(--font-space-mono)" }}>{m.num}</p>
                  <p className="mt-1" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>{m.label}</p>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", marginTop: "4px" }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOGOS / SOCIAL PROOF ── */}
        <section className="py-12 border-b border-white/6">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center mb-8"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Empresas que trabajan con datos de RemuneraLab
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {LOGOS.map((name) => (
                <div key={name}
                  className="px-5 py-2.5 rounded-lg border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", fontWeight: 500, color: "rgba(255,255,255,0.35)", letterSpacing: "0.01em" }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ── */}
        <section className="py-24 border-b border-white/6">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-12">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.amber, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                El costo oculto de no tener datos
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Sin inteligencia laboral,<br />
                <span style={{ color: C.amber }}>el mercado te sorprende.</span>
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-4">
              {PROBLEMAS.map((p, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, ease: E, delay: i * 0.08 }}
                  className="rounded-xl p-6 flex flex-col gap-4"
                  style={{ background: C.nocturno, border: "1px solid rgba(245,166,35,0.1)" }}>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${p.tagColor}12`, border: `1px solid ${p.tagColor}25` }}>
                      <p.icon size={16} style={{ color: p.tagColor }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.15em", padding: "3px 8px", borderRadius: "3px", background: `${p.tagColor}12`, color: p.tagColor, border: `1px solid ${p.tagColor}25` }}>
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem" }}>{p.title}</h3>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: "1.65" }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DEMO PREVIEW / VIDEO ── */}
        <section className="py-24 border-b border-white/6" style={{ background: "rgba(28,36,56,0.25)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-12">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.electric, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                Plataforma en acción
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Cómo un CHRO detectó 3 cargos<br />
                <span style={{ color: C.electric }}>en riesgo antes de las renuncias.</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.55, ease: E, delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(0,194,255,0.15)" }}>

              {/* Simulated dashboard expanded */}
              <div className="p-8 sm:p-12" style={{ background: C.nocturno }}>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Cargos analizados",   val: "47",   unit: "roles",      color: C.electric },
                    { label: "Alertas activas",      val: "8",    unit: "cargos",     color: C.amber    },
                    { label: "Costo rotación evit.", val: "$42M", unit: "estimado",   color: C.teal     },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl p-5"
                      style={{ background: `${kpi.color}08`, border: `1px solid ${kpi.color}18` }}>
                      <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: kpi.color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                        {kpi.label}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: kpi.color }}>{kpi.val}</span>
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>{kpi.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { cargo: "Enfermera Jefe UCI",   sector: "Salud",      delta: "−31%", risk: 92, color: C.red   },
                    { cargo: "Analista de Riesgos",  sector: "Finanzas",   delta: "−22%", risk: 74, color: C.amber  },
                    { cargo: "Jefe de Turno Mina",   sector: "Minería",    delta: "−18%", risk: 61, color: C.amber  },
                    { cargo: "Frontend Developer",   sector: "Tecnología", delta: "−12%", risk: 43, color: C.teal   },
                  ].map((row) => (
                    <div key={row.cargo} className="rounded-lg p-4 flex items-center gap-4"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white truncate" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem" }}>{row.cargo}</p>
                          <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{row.sector}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${row.risk}%`, background: row.color }} />
                          </div>
                          <span className="tabular-nums shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: row.color }}>{row.risk}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.7rem", color: row.color, fontWeight: 700 }}>{row.delta}</p>
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>vs mercado</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA overlay bottom */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 sm:px-12 py-6"
                style={{ background: "rgba(10,15,30,0.95)", borderTop: "1px solid rgba(0,194,255,0.12)" }}>
                <div className="flex items-center gap-3">
                  <PlayCircle size={20} style={{ color: C.electric }} />
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.6)" }}>
                    Demo personalizada disponible para tu empresa
                  </span>
                </div>
                <a href="/empresas/registro"
                  className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded whitespace-nowrap hover:opacity-90 transition-opacity shrink-0"
                  style={{ background: `linear-gradient(135deg, ${C.teal}, #2EC4B6)`, color: C.abismo, fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                  Ver mi análisis <ArrowRight size={13} />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CALCULADORA ROI ── */}
        <section className="py-24 border-b border-white/6">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-12">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.teal, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                Calculadora de impacto
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-dm-sans)" }}>
                ¿Cuánto te cuesta<br />
                <span style={{ color: C.teal }}>rotar un cargo clave?</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E, delay: 0.08 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(0,229,196,0.15)" }}>

              <div className="grid md:grid-cols-2">

                {/* ── PANEL IZQUIERDO: Inputs ── */}
                <div className="p-8 sm:p-10 flex flex-col gap-7" style={{ background: C.nocturno }}>

                  {/* Cargos */}
                  <div>
                    <label style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>
                      Cargos en riesgo estimados
                    </label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setCalcCargos(Math.max(1, calcCargos - 1))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
                        <Minus size={14} />
                      </button>
                      <span className="text-4xl font-bold tabular-nums text-white w-16 text-center"
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        {calcCargos}
                      </span>
                      <button onClick={() => setCalcCargos(Math.min(50, calcCargos + 1))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Salario */}
                  <div>
                    <label style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
                      Salario mensual promedio
                    </label>
                    <select value={calcSalario} onChange={(e) => setCalcSalario(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg text-white text-sm border border-white/10 bg-white/5 focus:outline-none focus:border-[#00C2FF] transition-all"
                      style={{ fontFamily: "var(--font-dm-sans)" }}>
                      {SALARIOS.map((s) => (
                        <option key={s.value} value={s.value} style={{ background: C.nocturno }}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brecha de mercado */}
                  <div>
                    <label style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
                      Brecha salarial estimada
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 15, 20, 25].map((g) => (
                        <button key={g} onClick={() => setCalcGap(g)}
                          className="py-2.5 rounded-lg font-bold transition-all"
                          style={{
                            fontFamily: "var(--font-space-mono)", fontSize: "0.78rem",
                            background: calcGap === g ? "rgba(0,229,196,0.15)" : "rgba(255,255,255,0.04)",
                            color: calcGap === g ? C.teal : "rgba(255,255,255,0.35)",
                            border: calcGap === g ? "1px solid rgba(0,229,196,0.3)" : "1px solid rgba(255,255,255,0.08)",
                          }}>
                          {g}%
                        </button>
                      ))}
                    </div>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.68rem", color: "rgba(255,255,255,0.22)", marginTop: "8px" }}>
                      % que los cargos están por debajo del mercado
                    </p>
                  </div>

                  {/* Desglose ajuste preventivo */}
                  <div className="rounded-xl p-4 flex flex-col gap-2.5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "4px" }}>
                      Desglose del ajuste preventivo (por cargo)
                    </p>
                    {[
                      { label: "Salario mensual",                          value: fmtCLP(calcSalario),                        note: "base" },
                      { label: `× brecha ${calcGap}%`,                    value: `${fmtCLP(ajusteMensualPorCargo)}/mes`,      note: "ajuste mensual por cargo" },
                      { label: `× ${calcCargos} cargo${calcCargos !== 1 ? "s" : ""}`, value: `${fmtCLP(ajusteMensualTotal)}/mes`, note: "ajuste mensual total" },
                      { label: "× 12 meses",                               value: fmtCLP(ajusteAnualTotal),                   note: "ajuste anual total" },
                    ].map((row, i) => (
                      <div key={i} className={`flex items-start justify-between gap-3 ${i > 0 ? "pt-2 border-t" : ""}`}
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: i === 3 ? C.teal : "rgba(255,255,255,0.4)", fontWeight: i === 3 ? 700 : 400 }}>
                            {row.label}
                          </p>
                          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", marginTop: "1px" }}>
                            {row.note}
                          </p>
                        </div>
                        <span className="tabular-nums shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.68rem", fontWeight: i === 3 ? 700 : 400, color: i === 3 ? C.teal : "rgba(255,255,255,0.55)" }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Toggle bono permanencia */}
                  <button onClick={() => setIncludeBono(!includeBono)}
                    className="flex items-center gap-4 p-4 rounded-xl w-full text-left transition-all"
                    style={{
                      background: includeBono ? "rgba(0,229,196,0.06)" : "rgba(255,255,255,0.03)",
                      border: includeBono ? "1px solid rgba(0,229,196,0.2)" : "1px solid rgba(255,255,255,0.07)",
                    }}>
                    <div className="relative w-10 h-5 rounded-full shrink-0 transition-all"
                      style={{ background: includeBono ? C.teal : "rgba(255,255,255,0.15)" }}>
                      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                        style={{ left: includeBono ? "calc(100% - 18px)" : "2px" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", fontWeight: 600, color: includeBono ? C.teal : "rgba(255,255,255,0.5)" }}>
                        Incluir bono de permanencia <span style={{ fontWeight: 400, fontSize: "0.72rem" }}>(opcional)</span>
                      </p>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                        1 mes de sueldo por cargo · {fmtCLP(bonoPermanencia > 0 ? bonoPermanencia : calcSalario * calcCargos)} único
                      </p>
                    </div>
                  </button>
                </div>

                {/* ── PANEL DERECHO: Resultados ── */}
                <div className="p-8 sm:p-10 flex flex-col gap-5"
                  style={{ background: "rgba(0,229,196,0.04)", borderLeft: "1px solid rgba(0,229,196,0.12)" }}>

                  {/* MÉTRICA PRINCIPAL: ajuste mensual */}
                  <div>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: C.teal, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Ajuste salarial mensual
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: C.teal }}>
                      {fmtCLP(ajusteMensualTotal)}<span style={{ fontSize: "1.2rem", opacity: 0.6 }}>/mes</span>
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: "6px", lineHeight: "1.5" }}>
                      Corrección preventiva de mercado para {calcCargos} cargo{calcCargos !== 1 ? "s" : ""} con brecha del {calcGap}%
                    </p>
                  </div>

                  <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

                  {/* Desglose inversión */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>
                        Ajuste anual total
                      </p>
                      <p className="tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
                        {fmtCLP(ajusteAnualTotal)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between"
                      style={{ opacity: includeBono ? 1 : 0.35 }}>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: includeBono ? C.amber : "rgba(255,255,255,0.3)" }}>
                        + Bono permanencia {!includeBono && <span style={{ fontSize: "0.68rem" }}>(inactivo)</span>}
                      </p>
                      <p className="tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.9rem", color: includeBono ? C.amber : "rgba(255,255,255,0.3)" }}>
                        {fmtCLP(calcSalario * calcCargos)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
                        Total inversión retención
                      </p>
                      <p className="tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", color: "rgba(255,255,255,0.85)" }}>
                        {fmtCLP(costoRetencionTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

                  {/* Costo si no actúas */}
                  <div className="rounded-xl p-4"
                    style={{ background: "rgba(255,77,90,0.07)", border: "1px solid rgba(255,77,90,0.15)" }}>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: C.red, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Si no actúas — costo de rotación
                    </p>
                    <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: C.red }}>
                      {fmtCLP(costoRotacionTotal)}
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem", color: "rgba(255,77,90,0.55)", marginTop: "4px" }}>
                      Separación + vacante + reclutamiento + onboarding + pérdida productividad (1.5× salario anual · SHRM)
                    </p>
                  </div>

                  {/* Ahorro potencial */}
                  <div className="rounded-xl p-4"
                    style={{ background: "rgba(0,229,196,0.08)", border: "1px solid rgba(0,229,196,0.2)" }}>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: C.teal, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
                      Ahorro potencial
                    </p>
                    <p className="text-3xl font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: C.teal }}>
                      {fmtCLP(ahorroPotencial)}
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem", color: "rgba(0,229,196,0.5)", marginTop: "4px", lineHeight: "1.5" }}>
                      {fmtCLP(costoRotacionTotal)} rotación − {fmtCLP(costoRetencionTotal)} retención
                    </p>
                  </div>

                  {/* Callout preventivo */}
                  <div className="rounded-xl p-4"
                    style={{ background: "rgba(0,194,255,0.05)", border: "1px solid rgba(0,194,255,0.12)" }}>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: "1.65" }}>
                      Un sueldo justo aplicado <strong style={{ color: C.electric }}>antes</strong> de que el mercado lo fuerce mejora el compromiso, la productividad y reduce el riesgo de salida — sin necesidad de crisis.
                    </p>
                  </div>

                  {/* Referencia SHRM */}
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.18)", lineHeight: "1.5" }}>
                    Referencia modelo SHRM (8% costo rotación): {fmtCLP(referenciaSHRM)} — estimación conservadora sin desglose por brecha real.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TRUST / COMPLIANCE ── */}
        <section className="py-24 border-b border-white/6" style={{ background: "rgba(28,36,56,0.25)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-12">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.electric, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                Confianza y cumplimiento
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Datos auditables.<br />
                <span style={{ color: C.electric }}>Metodología que se defiende sola.</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4">
              {TRUST_BADGES.map((b, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.45, ease: E, delay: i * 0.08 }}
                  className="rounded-xl p-7 flex flex-col gap-4 relative overflow-hidden"
                  style={{ background: C.nocturno, border: `1px solid rgba(255,255,255,0.07)` }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, ${b.color}, transparent)` }} />
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${b.color}12`, border: `1px solid ${b.color}25` }}>
                      <b.icon size={16} style={{ color: b.color }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.15em", padding: "3px 8px", borderRadius: "3px", background: `${b.color}12`, color: b.color, border: `1px solid ${b.color}25` }}>
                      {b.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem" }}>{b.title}</h3>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", lineHeight: "1.65" }}>{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section className="py-24 border-b border-white/6">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-4">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.electric, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                Proceso
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-dm-sans)" }}>
                De los datos del mercado<br />
                <span style={{ color: C.electric }}>a la decisión ejecutiva.</span>
              </h2>
            </motion.div>

            <div className="mt-12">
              {PASOS.map((p, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease: E, delay: i * 0.1 }}
                  className="flex items-start gap-8 sm:gap-14 py-10 border-t group"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="leading-none select-none tabular-nums w-16 sm:w-20 shrink-0 pt-1"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "3.5rem", fontWeight: 700, color: "rgba(0,194,255,0.12)" }}>
                    {p.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white mb-2" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.15rem" }}>{p.title}</h4>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", lineHeight: "1.65" }}>{p.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-white/15 mt-2 shrink-0 transition-all group-hover:text-[#00C2FF] group-hover:translate-x-1" />
                </motion.div>
              ))}
              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 border-b border-white/6" style={{ background: "rgba(28,36,56,0.2)" }}>
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-12">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.electric, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                Preguntas frecuentes
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Todo lo que necesitas saber<br />
                <span style={{ color: C.electric }}>antes de agendar.</span>
              </h2>
            </motion.div>

            <div className="flex flex-col">
              {FAQS.map((faq, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.35, ease: E, delay: i * 0.05 }}
                  className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <button
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left group">
                    <span className="font-semibold text-white/80 group-hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: faqOpen === i ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: E }}
                      className="shrink-0">
                      <ChevronDown size={16} style={{ color: faqOpen === i ? C.electric : "rgba(255,255,255,0.3)" }} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {faqOpen === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: E }}
                        style={{ overflow: "hidden" }}>
                        <p className="pb-6" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", lineHeight: "1.7" }}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }} />
            </div>
          </div>
        </section>

        {/* ── CTA BRIDGE ── */}
        <section className="py-20 border-b border-white/6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, ease: E }}>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.electric, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "24px" }}>
                Inteligencia laboral · Chile
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg"
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                Cada decisión salarial<br />debería tener datos detrás.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, ease: E, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-4 shrink-0">
              <a href="/empresas/registro"
                className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded hover:opacity-90 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${C.teal}, #2EC4B6)`, color: C.abismo, fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", boxShadow: "0 0 28px rgba(0,229,196,0.2)" }}>
                Solicitar demo gratuita <ArrowRight size={15} />
              </a>
              <a href="/empresas/casos"
                className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded border border-white/12 text-white/55 hover:text-white/80 hover:border-white/20 transition-all"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem" }}>
                Ver casos reales
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── FORMULARIO ── */}
        <section id="contacto" className="py-24 px-6 border-b border-white/6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }} className="mb-10">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: C.electric, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
                Contacto Enterprise
              </p>
              <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Agenda tu demo ejecutiva
              </h2>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.45)" }}>
                Cuéntanos tu empresa y te entregamos un análisis preliminar de mercado
                para tus cargos clave — sin costo, sin compromiso.
              </p>
            </motion.div>

            {enviado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-12 text-center"
                style={{ border: "1px solid rgba(0,229,196,0.2)", background: "rgba(0,229,196,0.04)" }}>
                <CheckCircle2 size={48} style={{ color: C.teal }} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  Solicitud recibida
                </h3>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
                  Te contactamos en menos de 24h para coordinar tu demo.
                </p>
                <a href="/" className="inline-block mt-6 hover:underline"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.electric }}>
                  Volver al inicio
                </a>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}
                className="rounded-xl p-8 flex flex-col gap-5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: C.nocturno, backdropFilter: "blur(8px)" }}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className={labelClass} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>Nombre</label>
                    <input type="text" required placeholder="Tu nombre"
                      value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>Empresa</label>
                    <input type="text" required placeholder="Nombre de tu empresa"
                      value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className={fieldClass} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col">
                    <label className={labelClass} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>Tu cargo</label>
                    <input type="text" required placeholder="Ej: CHRO, CFO, Gerente RRHH"
                      value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                      className={fieldClass} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>Email corporativo</label>
                    <input type="email" required placeholder="tu@empresa.cl"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={fieldClass} />
                  </div>
                </div>
                <button type="submit"
                  className="inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity mt-2"
                  style={{ background: `linear-gradient(135deg, ${C.teal}, #2EC4B6)`, color: C.abismo, fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", boxShadow: "0 0 28px rgba(0,229,196,0.2)" }}>
                  <Mail size={16} /> Solicitar demo ejecutiva
                </button>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
                  Sin compromiso · Respondemos en menos de 24 horas
                </p>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-10 px-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif-display italic text-white mb-1" style={{ fontSize: "1.2rem" }}>RemuneraLab</p>
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Enterprise · Workforce Intelligence Platform · Chile
            </p>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="hover:text-white/60 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
              Para trabajadores
            </a>
            <a href="/formulario" className="hover:text-white/60 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>
              Contribuir datos
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
