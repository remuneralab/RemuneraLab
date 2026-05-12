"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft, ArrowRight, TrendingUp, AlertTriangle,
  Users, BarChart3,
  Building2, ChevronRight, CheckCircle2, Award, Zap, Scale,
} from "lucide-react";
import TabNav from "../TabNav";
import CasoPracticoFinanzas from "./CasoPracticoFinanzas";
import LeyTransparencia from "./LeyTransparencia";
import CasoRealFinanzas from "./CasoRealFinanzas";

const E = [0.16, 1, 0.3, 1] as const;

type InnerTab = "analisis" | "caso";

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}
function fmtAxis(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;
}

function riskColor(score: number) {
  if (score >= 65) return { bar: "bg-red-500",    badge: "bg-red-100 text-red-700",       label: "Alto"     };
  if (score >= 50) return { bar: "bg-orange-400", badge: "bg-orange-100 text-orange-700", label: "Moderado" };
  return              { bar: "bg-yellow-400",  badge: "bg-yellow-100 text-yellow-700",  label: "Bajo"     };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI = [
  { label: "Salario mediano sectorial", valor: "$2.450.000",  sub: "bruto mensual Chile 2024",      icon: TrendingUp,    color: "text-primary"   },
  { label: "Cargos analizados",         valor: "10",          sub: "roles del sector financiero",   icon: Users,         color: "text-secondary" },
  { label: "Riesgo rotación promedio",  valor: "52 / 100",    sub: "nivel Moderado · mercado nac.", icon: AlertTriangle, color: "text-amber-500" },
  { label: "Brecha de género total",    valor: "–31%",        sub: "comp. total incl. variable",    icon: Building2,     color: "text-red-500"   },
];

const institucionalData = [
  { cargo: "Gerente",      tradicional: 6_800_000, fintech: 7_800_000, estado: 5_400_000 },
  { cargo: "Analista Sr.", tradicional: 3_400_000, fintech: 4_100_000, estado: 2_900_000 },
  { cargo: "Ej. Comerc.",  tradicional: 2_100_000, fintech: 2_500_000, estado: 1_800_000 },
  { cargo: "Analista Jr.", tradicional: 1_800_000, fintech: 2_200_000, estado: 1_500_000 },
  { cargo: "Back Office",  tradicional: 1_350_000, fintech: 1_300_000, estado: 1_200_000 },
];

const rotacionData = [
  { cargo: "Trader / Mesa Dinero",  riesgo: 71, motivo: "Headhunting activo, brechas de bono sistemáticas" },
  { cargo: "Ejecutivo Comercial",   riesgo: 66, motivo: "Alta movilidad entre bancos y hacia fintech" },
  { cargo: "Analista Inversiones",  riesgo: 62, motivo: "Fintech paga $700.000 más, startup equity atractivo" },
  { cargo: "Analista Financiero",   riesgo: 54, motivo: "Múltiples ofertas activas; mercado muy competitivo" },
  { cargo: "Analista de Riesgo",    riesgo: 49, motivo: "Demanda alta, pool de talento escaso en Chile" },
  { cargo: "Gerente Finanzas",      riesgo: 46, motivo: "Alto costo de cambio, comp. total competitiva" },
  { cargo: "Contador/a Sr.",        riesgo: 35, motivo: "Mayor estabilidad, menor volatilidad de mercado" },
];

const IMPACTO_TOTAL = [
  { label: "Ahorro proyectado",      valor: "$140.400.000", sub: "con plan completo a 12 meses",       color: "text-emerald-600" },
  { label: "Reducción riesgo legal", valor: "–80%",         sub: "al cerrar brecha de género",         color: "text-red-500"     },
  { label: "Mejora score ley",       valor: "40 → 75 pts",  sub: "antes de la fiscalización 2025–26",  color: "text-primary"     },
];

const FASES = [
  { label: "Urgente",    plazo: "0 – 90 días",    dotColor: "bg-red-500",   lineColor: "border-red-200",      badgeClass: "bg-red-500 text-white"       },
  { label: "Corto plazo",plazo: "3 – 12 meses",   dotColor: "bg-amber-500", lineColor: "border-amber-200",    badgeClass: "bg-amber-500 text-white"     },
  { label: "Estratégico",plazo: "12 – 24 meses",  dotColor: "bg-primary",   lineColor: "border-primary/30",   badgeClass: "bg-primary text-on-primary"  },
];

const recomendaciones = [
  {
    fase: 0, num: "01",
    titulo: "Formalizar criterios de compensación variable",
    desc: "Los bonos discrecionales son el principal vector de litigación por brecha de género y el primer ítem que fiscalizará la Dirección del Trabajo. Documentar criterios objetivos elimina este riesgo a costo cero.",
    costo: "$0 costo directo",
    evita: "$47.000.000 en multas",
    ganancia: "+20 pts score ley",
    icon: Zap,
  },
  {
    fase: 0, num: "02",
    titulo: "Plan de nivelación brecha de género en 18 meses",
    desc: "La brecha del 31% en compensación total es la mayor exposición legal del sector. Focalizar en bonos de traders y gerentes cierra el 80% del gap. La inversión representa menos del 40% del riesgo de multas.",
    costo: "$18.000.000/año",
    evita: "$47.000.000 en multas",
    ganancia: "Riesgo legal –80%",
    icon: Award,
  },
  {
    fase: 1, num: "03",
    titulo: "Publicar bandas salariales antes de la ley",
    desc: "Solo el 31% del equipo conoce su banda. Publicarlas de forma proactiva convierte el cumplimiento en ventaja de marca empleadora. El costo de comunicación interna es mínimo comparado con la multa por cargo no comunicado.",
    costo: "< $500.000 comunicación",
    evita: "$3.900.000 por cargo",
    ganancia: "+15 pts score ley",
    icon: CheckCircle2,
  },
  {
    fase: 1, num: "04",
    titulo: "Plan de retención diferenciado para traders",
    desc: "La rotación en mesa de dinero tiene el costo de reposición más alto del sector: $61.200.000 por evento. Un bono diferido con cliff a 2 años reduce la fuga hasta un 45%, ahorrando ~$122.400.000 anuales.",
    costo: "$8.000.000/año plan bono",
    evita: "$183.600.000 (3 eventos)",
    ganancia: "$122.400.000 ahorro/año",
    icon: TrendingUp,
  },
  {
    fase: 2, num: "05",
    titulo: "Posicionarse como líder en transparencia salarial",
    desc: "Los bancos que publiquen rangos voluntariamente antes de la ley generarán ventaja competitiva en atracción de talento femenino y joven. Evidencia europea: –18% en costo de reclutamiento en 24 meses.",
    costo: "Inversión en comunicación",
    evita: "Fuga de talento femenino",
    ganancia: "Marca empleadora +32%",
    icon: Building2,
  },
];

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function TooltipInst({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const names: Record<string, string> = { tradicional: "Banca tradicional", fintech: "Fintech", estado: "Banco Estado" };
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-on-surface-variant">{names[p.name] ?? p.name}:</span>
          <span className="font-bold">{fmtCLP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalisisFinanzasPage() {
  const scrolled = useScrolled();
  const [innerTab, setInnerTab] = useState<InnerTab>("analisis");
  function switchTab(tab: InnerTab) {
    setInnerTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-outline-variant/30"
          : "bg-white border-b border-outline-variant/10"
      }`}>
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a href="/" className="text-xs font-bold tracking-[0.12em] uppercase text-primary">RemuneraLab</a>
          <nav className="flex items-center gap-3">
            <TabNav active="finanzas" />
            <a href="#cta"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-all duration-200 whitespace-nowrap">
              Solicitar demo
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">

        {/* ── 1. Hero ── */}
        <section className="pt-14 pb-16 border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <a href="/empresas" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors mb-6">
                <ArrowLeft size={13} /> Volver a vista general
              </a>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-6"
              >
                Análisis sectorial · Finanzas · ESI 2024 INE Chile
              </motion.p>
              <div className="border-l-2 border-primary pl-6 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                  Diagnóstico salarial — Sector Finanzas Chile
                </h1>
              </div>
              <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
                Análisis de riesgo de rotación, brecha de género, caso práctico de costos reales
                y preparación para la Ley de Transparencia Salarial. Todo en pesos chilenos.
              </p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KPI.map((k, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="border border-outline-variant/30 bg-white rounded-lg p-5">
                  <k.icon size={18} className={`${k.color} mb-3`} />
                  <p className="text-2xl font-bold text-primary">{k.valor}</p>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-tight">{k.label}</p>
                  <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{k.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Marco Regulatorio (Ley Transparencia + Género) ── */}
        <div className="bg-primary text-on-primary py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale size={18} className="text-secondary-container shrink-0" />
              <p className="text-sm font-semibold">
                Chile avanza hacia la obligatoriedad de transparencia salarial y reporte de brecha de género en 2025–2026.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold bg-white/15 border border-white/20 px-3 py-1.5 rounded-full whitespace-nowrap">
              Score de tu empresa: 40/100 →
            </span>
          </div>
        </div>

        {/* ── Inner tab bar ── */}
        <div className="sticky top-16 z-30 bg-white border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 py-1">
              <button
                onClick={() => switchTab("analisis")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  innerTab === "analisis"
                    ? "bg-surface-container text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Análisis del sector
              </button>
              <button
                onClick={() => switchTab("caso")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  innerTab === "caso"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Caso real aplicado
              </button>
            </div>
          </div>
        </div>

        {innerTab === "analisis" && <>
        <LeyTransparencia />

        {/* ── 3. Riesgo de rotación ── */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">Retención de talento</span>
              <h2 className="text-2xl font-bold text-primary">Riesgo de rotación por cargo</h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
                Score compuesto por brecha salarial vs P50, conocimiento de banda y motivos declarados de salida en el sector.
              </p>
            </div>
            <div className="space-y-3">
              {rotacionData.map((r, i) => {
                const rc = riskColor(r.riesgo);
                return (
                  <motion.div key={r.cargo} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="border border-outline-variant/20 bg-white rounded-lg px-5 py-4 flex items-center gap-5">
                    <span className="text-sm font-bold text-primary w-44 shrink-0">{r.cargo}</span>
                    <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${rc.bar} rounded-full`} style={{ width: `${r.riesgo}%` }} />
                    </div>
                    <span className="text-sm font-bold text-primary w-14 text-right shrink-0">{r.riesgo}/100</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full w-20 text-center shrink-0 ${rc.badge}`}>{rc.label}</span>
                    <p className="text-xs text-on-surface-variant hidden lg:block flex-1">{r.motivo}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. Caso práctico ── */}
        <CasoPracticoFinanzas />

        {/* ── 5. Diferencial institucional ── */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">Contexto de mercado</span>
                <h2 className="text-2xl font-bold text-primary mb-4">Banca tradicional vs Fintech vs Banco Estado</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Las fintech pagan entre <strong className="text-primary">$700.000 y $1.300.000 más</strong> en roles analíticos.
                  Banco Estado opera entre <strong className="text-primary">$900.000 y $1.500.000 menos</strong> para los mismos cargos.
                  La brecha se cierra solo en back office operativo.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Fintech vs Banca tradicional", valor: "+$1.000.000 promedio/mes", color: "text-emerald-600" },
                    { label: "Banco Estado vs Privado",      valor: "–$1.200.000 promedio/mes", color: "text-red-500"    },
                    { label: "Brecha en back office",        valor: "–$50.000 (casi nula)",     color: "text-amber-500"  },
                  ].map((r) => (
                    <div key={r.label} className="border border-outline-variant/20 bg-white rounded-lg p-3 flex justify-between items-center gap-3">
                      <span className="text-xs text-on-surface-variant">{r.label}</span>
                      <span className={`text-xs font-bold shrink-0 ${r.color}`}>{r.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 border border-outline-variant/30 bg-white rounded-lg p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                  {[
                    { key: "tradicional", label: "Banca tradicional", color: "#376476" },
                    { key: "fintech",     label: "Fintech",           color: "#00152a" },
                    { key: "estado",      label: "Banco Estado",      color: "#0F7B6C" },
                  ].map((l) => (
                    <div key={l.key} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: l.color }} />
                      <span className="text-on-surface-variant">{l.label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={institucionalData} barCategoryGap="28%" barGap={3} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                      <XAxis dataKey="cargo" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} tickFormatter={(v: number) => fmtAxis(v)} width={58} />
                      <Tooltip content={<TooltipInst />} cursor={{ fill: "#efedf0", opacity: 0.5 }} />
                      <Bar dataKey="tradicional" fill="#376476" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="fintech"     fill="#00152a" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="estado"      fill="#0F7B6C" radius={[4, 4, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Recomendaciones ── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="mb-12">
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-3 block">Plan de acción</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4 leading-tight">
                Lo que debes hacer, en qué orden,
                <br className="hidden sm:block" />
                {" "}y cuánto vale cada decisión.
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
                Cinco palancas ordenadas por urgencia y retorno financiero. Cada una incluye
                el costo de actuar y el costo de no actuar — en pesos chilenos.
              </p>
            </div>

            {/* Resumen de impacto */}
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="grid sm:grid-cols-3 mb-16 rounded-2xl border border-outline-variant/30 overflow-hidden">
              {IMPACTO_TOTAL.map((k, i) => (
                <div key={i} className={`p-7 text-center bg-surface-container/30 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-outline-variant/20" : ""}`}>
                  <p className={`text-3xl font-bold ${k.color} mb-1`}>{k.valor}</p>
                  <p className="text-sm font-semibold text-on-surface">{k.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{k.sub}</p>
                </div>
              ))}
            </motion.div>

            {/* Fases */}
            <div className="space-y-14">
              {FASES.map((fase, fi) => {
                const items = recomendaciones.filter((r) => r.fase === fi);
                return (
                  <div key={fi}>
                    {/* Encabezado de fase */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${fase.dotColor}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 ${fase.badgeClass}`}>
                        {fase.label}
                      </span>
                      <span className="text-sm text-on-surface-variant shrink-0">{fase.plazo}</span>
                      <div className={`flex-1 border-t ${fase.lineColor}`} />
                    </div>

                    {/* Cards */}
                    <div className={`grid gap-5 pl-6 ${items.length === 1 ? "lg:grid-cols-2" : "md:grid-cols-2"}`}>
                      {items.map((rec, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                          className="border border-outline-variant/20 bg-white rounded-lg p-6 flex flex-col gap-5"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-5xl font-black text-outline-variant/25 leading-none shrink-0 select-none mt-0.5">{rec.num}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <rec.icon size={14} className="text-secondary shrink-0" />
                                <h3 className="text-sm font-bold text-primary leading-snug">{rec.titulo}</h3>
                              </div>
                              <p className="text-xs text-on-surface-variant leading-relaxed">{rec.desc}</p>
                            </div>
                          </div>

                          {/* Desglose financiero */}
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-outline-variant/20">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Costo</p>
                              <p className="text-xs font-bold text-on-surface leading-snug">{rec.costo}</p>
                            </div>
                            <div className="text-center border-x border-outline-variant/20">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Evita</p>
                              <p className="text-xs font-bold text-red-500 leading-snug">{rec.evita}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Ganancia</p>
                              <p className="text-xs font-bold text-emerald-600 leading-snug">{rec.ganancia}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Filler card cuando la fase tiene un solo ítem */}
                      {items.length === 1 && (
                        <div className="border border-dashed border-outline-variant/30 rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                            <Zap size={20} className="text-secondary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary mb-1">¿Tu empresa tiene necesidades específicas?</p>
                            <p className="text-xs text-on-surface-variant max-w-[220px] mx-auto leading-relaxed">
                              El plan de acción completo se personaliza con los datos reales de tu organización.
                            </p>
                          </div>
                          <a href="#cta" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                            Solicitar diagnóstico personalizado <ChevronRight size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 7. CTA Final ── */}
        <section id="cta" className="bg-primary py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-container mb-8">
                Ley de Transparencia Salarial · Chile 2025–2026
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                No esperes a que la ley te obligue.<br />Las que actúan primero ganan.
              </h2>
              <p className="text-on-primary-container text-sm mt-6 max-w-md leading-relaxed">
                Tu empresa tiene hoy un score de <strong className="text-white">40/100</strong>.
                Las que lleguen a 80+ antes de la fiscalización evitan multas de hasta{" "}
                <strong className="text-white">$3.900.000 por cargo</strong>.
              </p>
            </motion.div>
            <motion.a
              href="/empresas#contacto"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white text-primary text-sm font-semibold px-6 py-3 rounded hover:bg-surface transition-colors shrink-0"
            >
              Solicitar diagnóstico gratuito <ArrowRight size={15} />
            </motion.a>
          </div>
        </section>
        </>}
        {innerTab === "caso" && <CasoRealFinanzas />}

      </main>

      <footer className="bg-primary border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white mb-1">RemuneraLab</p>
            <p className="text-xs text-on-primary-container">Inteligencia salarial para Chile. Tus datos son anónimos y nunca se venderán.</p>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-xs text-on-primary-container hover:text-white transition-colors">Para trabajadores</a>
            <a href="/empresas" className="text-xs text-on-primary-container hover:text-white transition-colors">Vista general</a>
            <a href="/empresas/salud" className="text-xs text-on-primary-container hover:text-white transition-colors">Salud</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
