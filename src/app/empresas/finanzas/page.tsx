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
  Building2, ChevronRight, CheckCircle2, Award, Zap, Scale, LayoutDashboard,
} from "lucide-react";
import TabNav from "../TabNav";
import CasoPracticoFinanzas from "./CasoPracticoFinanzas";
import LeyTransparencia from "./LeyTransparencia";
import CasoRealFinanzas from "./CasoRealFinanzas";

const E = [0.16, 1, 0.3, 1] as const;

type InnerTab = "resumen" | "analisis" | "caso";

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
  if (score >= 65) return { bar: "bg-red-500",    badge: "bg-red-900/20 text-red-400",       label: "Alto"     };
  if (score >= 50) return { bar: "bg-orange-400", badge: "bg-orange-900/20 text-orange-400", label: "Moderado" };
  return              { bar: "bg-yellow-400",  badge: "bg-yellow-900/20 text-yellow-400",  label: "Bajo"     };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI = [
  { label: "Salario mediano sectorial", valor: "$2.450.000",  sub: "bruto mensual Chile 2024",      icon: TrendingUp,    color: "text-white"       },
  { label: "Cargos analizados",         valor: "10",          sub: "roles del sector financiero",   icon: Users,         color: "text-[#00B4D8]"   },
  { label: "Riesgo rotación promedio",  valor: "52 / 100",    sub: "nivel Moderado · mercado nac.", icon: AlertTriangle, color: "text-amber-500"   },
  { label: "Brecha de género total",    valor: "–31%",        sub: "comp. total incl. variable",    icon: Building2,     color: "text-red-500"     },
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
  { label: "Ahorro proyectado",      valor: "$140.400.000", sub: "con plan completo a 12 meses",       color: "text-[#06D6A0]" },
  { label: "Reducción riesgo legal", valor: "–80%",         sub: "al cerrar brecha de género",         color: "text-red-500"   },
  { label: "Mejora score ley",       valor: "40 → 75 pts",  sub: "antes de la fiscalización 2025–26",  color: "text-white"     },
];

const FASES = [
  { label: "Urgente",    plazo: "0 – 90 días",    dotColor: "bg-red-500",   lineColor: "border-white/10",  badgeClass: "bg-red-500 text-white"       },
  { label: "Corto plazo",plazo: "3 – 12 meses",   dotColor: "bg-amber-500", lineColor: "border-white/10",  badgeClass: "bg-amber-500 text-white"     },
  { label: "Estratégico",plazo: "12 – 24 meses",  dotColor: "bg-[#00B4D8]", lineColor: "border-white/10",  badgeClass: "bg-[#00B4D8] text-[#0D2240]" },
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
    <div style={{ background: "#0D2240", border: "1px solid rgba(0,180,216,0.2)", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", fontSize: "12px" }} className="p-3">
      <p className="font-bold mb-2" style={{ color: "#00B4D8" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span style={{ color: "rgba(255,255,255,0.45)" }}>{names[p.name] ?? p.name}:</span>
          <span className="font-bold text-white">{fmtCLP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SectorData = {
  p25: number; p50: number; p75: number; n_esi: number;
  confianza: "alta" | "media" | "baja";
  por_tipo: {
    publico:       { p50: number; n: number } | null;
    privado:       { p50: number; n: number } | null;
    independiente: { p50: number; n: number } | null;
  };
  por_region: Array<{ region: string; p50: number; n: number }>;
};

function fmtKPI(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalisisFinanzasPage() {
  const scrolled = useScrolled();
  const [innerTab, setInnerTab] = useState<InnerTab>("resumen");
  const [sectorData, setSectorData] = useState<SectorData | null>(null);
  const [b2bLoaded, setB2bLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard-b2b?sector=finanzas")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setSectorData(d); setB2bLoaded(true); })
      .catch(() => setB2bLoaded(true));
  }, []);

  function switchTab(tab: InnerTab) {
    setInnerTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-x-hidden">

      {/* Fixed glows */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle,rgba(0,180,216,0.13) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(46,196,182,0.09) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,180,216,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.04) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.12]" style={{ background: "rgba(13,34,64,0.88)", backdropFilter: "blur(14px)" }}>
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a href="/" style={{ fontSize: "1.4rem" }} className="font-serif italic text-white hover:text-[#00B4D8] transition-colors">RemuneraLab</a>
          <nav className="flex items-center gap-3">
            <TabNav active="finanzas" />
            <a href="#cta"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] border border-[#00B4D8]/40 px-4 py-2 rounded hover:bg-[#00B4D8]/10 transition-all duration-200 whitespace-nowrap">
              Solicitar demo
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">

        {/* ── 1. Hero ── */}
        <section className="pt-14 pb-16 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <button onClick={() => switchTab("resumen")} className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors mb-6">
                <ArrowLeft size={13} /> Panel principal
              </button>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00B4D8] mb-6"
              >
                Análisis sectorial · Finanzas · ESI 2024 INE Chile
              </motion.p>
              <div className="border-l-2 border-[#00B4D8] pl-6 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Diagnóstico salarial — Sector Finanzas Chile
                </h1>
              </div>
              <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
                Análisis de riesgo de rotación, brecha de género, caso práctico de costos reales
                y preparación para la Ley de Transparencia Salarial. Todo en pesos chilenos.
              </p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KPI.map((k, i) => {
                const isMediana = i === 0;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
                    <k.icon size={18} className={`${k.color} mb-3`} />

                    {isMediana && !b2bLoaded ? (
                      <div className="h-7 w-28 bg-white/10 rounded-lg animate-pulse mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {isMediana && sectorData ? fmtKPI(sectorData.p50) : k.valor}
                      </p>
                    )}

                    <p className="text-[11px] text-white/45 mt-1 leading-tight">{k.label}</p>

                    {isMediana && !b2bLoaded ? (
                      <div className="h-2.5 w-36 bg-white/8 rounded animate-pulse mt-1.5" />
                    ) : (
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {isMediana && sectorData
                          ? `ESI/CASEN INE 2024 · n=${sectorData.n_esi.toLocaleString("es-CL")}`
                          : k.sub}
                      </p>
                    )}

                    {isMediana && b2bLoaded && sectorData && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#06D6A0] bg-[#06D6A0]/10 px-2 py-0.5 rounded-full">
                        <span className="w-1 h-1 rounded-full bg-[#06D6A0]" /> dato real
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {!b2bLoaded ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/4 p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                  <div className="h-2.5 w-52 bg-white/10 rounded" />
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/8 rounded-lg overflow-hidden">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="p-4 text-center bg-[#0D2240]">
                      <div className="h-2 w-16 bg-white/10 rounded mx-auto mb-3" />
                      <div className="h-5 w-24 bg-white/15 rounded mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ) : sectorData && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="mt-4 rounded-xl border border-[#06D6A0]/20 bg-[#06D6A0]/4 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#06D6A0]">
                      Distribución real — ESI/CASEN INE 2024
                    </span>
                  </div>
                  <span className="text-[10px] text-white/25">{sectorData.n_esi.toLocaleString("es-CL")} personas</span>
                </div>
                <div className="grid grid-cols-3 gap-px bg-white/8 rounded-lg overflow-hidden">
                  {([
                    { label: "Percentil 25", v: sectorData.p25, dim: true },
                    { label: "Mediana (P50)", v: sectorData.p50, dim: false },
                    { label: "Percentil 75", v: sectorData.p75, dim: true },
                  ] as const).map(({ label, v, dim }) => (
                    <div key={label} className={`p-4 text-center ${dim ? "bg-[#0D2240]" : "bg-[#06D6A0]/8"}`}>
                      <p className={`text-[10px] mb-1 uppercase tracking-wider ${dim ? "text-white/35" : "text-[#06D6A0]"}`}>{label}</p>
                      <p className={`text-base font-bold ${dim ? "text-white/60" : "text-white"}`}>{fmtKPI(v)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── 2. Marco Regulatorio (Ley Transparencia + Género) ── */}
        <div className="bg-[#00B4D8]/10 border-y border-[#00B4D8]/20 py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale size={18} className="text-[#00B4D8] shrink-0" />
              <p className="text-sm font-semibold text-white">
                Chile avanza hacia la obligatoriedad de transparencia salarial y reporte de brecha de género en 2025–2026.
              </p>
            </div>
            <span className="shrink-0 text-xs font-bold bg-white/10 border border-white/20 px-3 py-1.5 rounded-full whitespace-nowrap text-white">
              Score de tu empresa: 40/100 →
            </span>
          </div>
        </div>

        {/* ── Inner tab bar ── */}
        <div className="sticky top-16 z-30 border-b border-white/8" style={{ background: "rgba(13,34,64,0.95)", backdropFilter: "blur(14px)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 py-1">
              <button
                onClick={() => switchTab("resumen")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                  innerTab === "resumen"
                    ? "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30"
                    : "text-white/40 border-white/10 hover:text-white"
                }`}
              >
                <LayoutDashboard size={11} /> Panel principal
              </button>
              <button
                onClick={() => switchTab("analisis")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                  innerTab === "analisis"
                    ? "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30"
                    : "text-white/40 border-white/10 hover:text-white"
                }`}
              >
                Análisis del sector
              </button>
              <button
                onClick={() => switchTab("caso")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                  innerTab === "caso"
                    ? "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30"
                    : "text-white/40 border-white/10 hover:text-white"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Caso real aplicado
              </button>
            </div>
          </div>
        </div>

        {innerTab === "resumen" && (<>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8">
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#00B4D8", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "10px" }}>
              Panel principal · Sector Finanzas · Chile 2024
            </p>
            <h2 className="text-2xl font-bold text-white mb-2">Diagnóstico salarial — Sector Finanzas Chile</h2>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
              Resumen ejecutivo · 4 indicadores clave del sector
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {([
              {
                color: "#F97316", shadow: "rgba(249,115,22,0.18)",
                icon: AlertTriangle,
                badge: "Costo rotación",
                metric: "$61.2M",
                metricSub: "por rotación de un Trader",
                title: "Rotación en mesas de dinero",
                desc: "El cargo de mayor riesgo del sector. Cada salida voluntaria de un Trader supera los $61 millones en costos directos e indirectos.",
                bullets: ["Riesgo rotación Trader: 71/100", "3 eventos anuales = $183.6M en riesgo", "Ahorro proyectado: $140.4M con plan"],
                cta: "Ver análisis de rotación",
                tab: "analisis" as InnerTab,
              },
              {
                color: "#00B4D8", shadow: "rgba(0,180,216,0.18)",
                icon: BarChart3,
                badge: "Bandas salariales",
                metric: "10",
                metricSub: "cargos analizados",
                title: "Brechas entre banca y fintech",
                desc: "Las fintech pagan hasta $700.000 más por cargo que la banca tradicional. Sin benchmarking, la pérdida de talento es silenciosa.",
                bullets: ["Salario mediano sectorial: $2.450.000", "Riesgo rotación promedio: 52/100", "Trader: fintech paga $700K más"],
                cta: "Ver benchmark salarial",
                tab: "analisis" as InnerTab,
              },
              {
                color: "#2EC4B6", shadow: "rgba(46,196,182,0.18)",
                icon: Building2,
                badge: "Brecha de género",
                metric: "−31%",
                metricSub: "en compensación total",
                title: "Mayor exposición legal del sector",
                desc: "Una brecha del 31% en compensación total es el principal vector de litigación bajo la Ley 20.348 y Ley 21.719.",
                bullets: ["Focalizada en bonos de Traders y Gerentes", "Plan de nivelación 18 meses", "Riesgo legal reducción 80%"],
                cta: "Ver caso real aplicado",
                tab: "caso" as InnerTab,
              },
              {
                color: "#A78BFA", shadow: "rgba(167,139,250,0.18)",
                icon: Scale,
                badge: "Cumplimiento legal",
                metric: "40/100",
                metricSub: "score actual de tu empresa",
                title: "Ley de Transparencia Salarial",
                desc: "La Ley 21.719 exige publicar bandas salariales y auditar brechas. Solo el 31% del equipo conoce su banda hoy.",
                bullets: ["Multa por cargo no comunicado: $3.9M", "Meta score: 40 → 75 puntos", "Fiscalización prevista 2025–2026"],
                cta: "Ver cumplimiento legal",
                tab: "caso" as InnerTab,
              },
            ] as const).map((card, i) => (
              <motion.div
                key={card.badge}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.42 }}
                onClick={() => switchTab(card.tab)}
                className="relative rounded-2xl p-6 cursor-pointer group overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                whileHover={{ scale: 1.015, boxShadow: `0 0 32px ${card.shadow}` }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: card.color }} />
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${card.shadow} 0%, transparent 65%)` }} />

                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}30`, fontFamily: "var(--font-space-mono)" }}>
                    <card.icon size={11} /> {card.badge}
                  </span>
                  <ArrowRight size={15} style={{ color: card.color, opacity: 0.6, marginTop: "2px" }} className="group-hover:translate-x-1 transition-transform" />
                </div>

                <p className="text-4xl font-bold tabular-nums mb-0.5" style={{ color: card.color, fontFamily: "var(--font-space-mono)" }}>{card.metric}</p>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginBottom: "12px", fontFamily: "var(--font-space-mono)" }}>{card.metricSub}</p>

                <h3 className="text-base font-bold text-white mb-1.5">{card.title}</h3>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, marginBottom: "16px" }}>{card.desc}</p>

                <ul className="space-y-1.5 mb-5">
                  {card.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>
                      <span style={{ color: card.color, marginTop: "2px", flexShrink: 0 }}>›</span> {b}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-1.5" style={{ fontSize: "0.74rem", color: card.color, fontWeight: 600 }}>
                  {card.cta} <ChevronRight size={13} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </>)}

        {innerTab === "analisis" && <>
        <LeyTransparencia />

        {/* ── 3. Riesgo de rotación ── */}
        <section className="py-20 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
              <span className="text-[#00B4D8] uppercase tracking-[0.3em] text-[0.62rem] font-bold mb-2 block" style={{ fontFamily: "Space Mono, monospace" }}>Retención de talento</span>
              <h2 className="text-2xl font-bold text-white">Riesgo de rotación por cargo</h2>
              <p className="text-sm text-white/45 mt-2 max-w-xl">
                Score compuesto por brecha salarial vs P50, conocimiento de banda y motivos declarados de salida en el sector.
              </p>
            </div>
            <div className="space-y-3">
              {rotacionData.map((r, i) => {
                const rc = riskColor(r.riesgo);
                return (
                  <motion.div key={r.cargo} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 flex items-center gap-5">
                    <span className="text-sm font-bold text-white w-44 shrink-0">{r.cargo}</span>
                    <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
                      <div className={`h-full ${rc.bar} rounded-full`} style={{ width: `${r.riesgo}%` }} />
                    </div>
                    <span className="text-sm font-bold text-white w-14 text-right shrink-0">{r.riesgo}/100</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full w-20 text-center shrink-0 ${rc.badge}`}>{rc.label}</span>
                    <p className="text-xs text-white/45 hidden lg:block flex-1">{r.motivo}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. Caso práctico ── */}
        <CasoPracticoFinanzas />

        {/* ── 5. Diferencial institucional ── */}
        <section className="py-20 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-[#00B4D8] uppercase tracking-[0.3em] text-[0.62rem] font-bold mb-2 block" style={{ fontFamily: "Space Mono, monospace" }}>Contexto de mercado</span>
                <h2 className="text-2xl font-bold text-white mb-4">Banca tradicional vs Fintech vs Banco Estado</h2>
                <p className="text-sm text-white/45 leading-relaxed mb-6">
                  Las fintech pagan entre <strong className="text-white">$700.000 y $1.300.000 más</strong> en roles analíticos.
                  Banco Estado opera entre <strong className="text-white">$900.000 y $1.500.000 menos</strong> para los mismos cargos.
                  La brecha se cierra solo en back office operativo.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Fintech vs Banca tradicional", valor: "+$1.000.000 promedio/mes", color: "text-[#06D6A0]" },
                    { label: "Banco Estado vs Privado",      valor: "–$1.200.000 promedio/mes", color: "text-red-500"   },
                    { label: "Brecha en back office",        valor: "–$50.000 (casi nula)",     color: "text-amber-500" },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex justify-between items-center gap-3">
                      <span className="text-xs text-white/45">{r.label}</span>
                      <span className={`text-xs font-bold shrink-0 ${r.color}`}>{r.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                  {[
                    { key: "tradicional", label: "Banca tradicional", color: "#376476" },
                    { key: "fintech",     label: "Fintech",           color: "#00B4D8" },
                    { key: "estado",      label: "Banco Estado",      color: "#0F7B6C" },
                  ].map((l) => (
                    <div key={l.key} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: l.color }} />
                      <span className="text-white/45">{l.label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={institucionalData} barCategoryGap="28%" barGap={3} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="cargo" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} tickFormatter={(v: number) => fmtAxis(v)} width={58} />
                      <Tooltip content={<TooltipInst />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="tradicional" fill="#376476" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="fintech"     fill="#00B4D8" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="estado"      fill="#0F7B6C" radius={[4, 4, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Recomendaciones ── */}
        <section className="py-24 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="mb-12">
              <span className="text-[#00B4D8] uppercase tracking-[0.3em] text-[0.62rem] font-bold mb-3 block" style={{ fontFamily: "Space Mono, monospace" }}>Plan de acción</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Lo que debes hacer, en qué orden,
                <br className="hidden sm:block" />
                {" "}y cuánto vale cada decisión.
              </h2>
              <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
                Cinco palancas ordenadas por urgencia y retorno financiero. Cada una incluye
                el costo de actuar y el costo de no actuar — en pesos chilenos.
              </p>
            </div>

            {/* Resumen de impacto */}
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="grid sm:grid-cols-3 mb-16 rounded-2xl border border-white/10 overflow-hidden">
              {IMPACTO_TOTAL.map((k, i) => (
                <div key={i} className={`p-7 text-center bg-white/[0.04] ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-white/8" : ""}`}>
                  <p className={`text-3xl font-bold ${k.color} mb-1`}>{k.valor}</p>
                  <p className="text-sm font-semibold text-white">{k.label}</p>
                  <p className="text-xs text-white/45 mt-0.5">{k.sub}</p>
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
                      <span className="text-sm text-white/45 shrink-0">{fase.plazo}</span>
                      <div className={`flex-1 border-t ${fase.lineColor}`} />
                    </div>

                    {/* Cards */}
                    <div className={`grid gap-5 pl-6 ${items.length === 1 ? "lg:grid-cols-2" : "md:grid-cols-2"}`}>
                      {items.map((rec, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-6 flex flex-col gap-5"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-5xl font-black text-white/[0.08] leading-none shrink-0 select-none mt-0.5">{rec.num}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <rec.icon size={14} className="text-[#00B4D8] shrink-0" />
                                <h3 className="text-sm font-bold text-white leading-snug">{rec.titulo}</h3>
                              </div>
                              <p className="text-xs text-white/45 leading-relaxed">{rec.desc}</p>
                            </div>
                          </div>

                          {/* Desglose financiero */}
                          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/8">
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-white/45 uppercase tracking-wider mb-1.5">Costo</p>
                              <p className="text-xs font-bold text-white leading-snug">{rec.costo}</p>
                            </div>
                            <div className="text-center border-x border-white/8">
                              <p className="text-[10px] font-bold text-white/45 uppercase tracking-wider mb-1.5">Evita</p>
                              <p className="text-xs font-bold text-red-500 leading-snug">{rec.evita}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-white/45 uppercase tracking-wider mb-1.5">Ganancia</p>
                              <p className="text-xs font-bold text-[#06D6A0] leading-snug">{rec.ganancia}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Filler card cuando la fase tiene un solo ítem */}
                      {items.length === 1 && (
                        <div className="border border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/6 flex items-center justify-center">
                            <Zap size={20} className="text-[#00B4D8]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">¿Tu empresa tiene necesidades específicas?</p>
                            <p className="text-xs text-white/45 max-w-[220px] mx-auto leading-relaxed">
                              El plan de acción completo se personaliza con los datos reales de tu organización.
                            </p>
                          </div>
                          <a href="#cta" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B4D8] hover:underline">
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
        <section id="cta" className="border-t border-white/8 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00B4D8] mb-8">
                Ley de Transparencia Salarial · Chile 2025–2026
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                No esperes a que la ley te obligue.<br />Las que actúan primero ganan.
              </h2>
              <p className="text-white/45 text-sm mt-6 max-w-md leading-relaxed">
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
              className="inline-flex items-center gap-2 text-[#0D2240] text-sm font-semibold px-6 py-3 rounded shrink-0 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)", boxShadow: "0 0 24px rgba(6,214,160,0.25)" }}
            >
              Solicitar diagnóstico gratuito <ArrowRight size={15} />
            </motion.a>
          </div>
        </section>
        </>}
        {innerTab === "caso" && <CasoRealFinanzas />}

      </main>

      <footer className="border-t border-white/8 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif italic text-white mb-1" style={{ fontSize: "1.1rem" }}>RemuneraLab</p>
            <p className="text-xs text-white/30">Inteligencia salarial para Chile. Tus datos son anónimos y nunca se venderán.</p>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-xs text-white/30 hover:text-white transition-colors">Para trabajadores</a>
            <a href="/empresas" className="text-xs text-white/30 hover:text-white transition-colors">Vista general</a>
            <a href="/empresas/salud" className="text-xs text-white/30 hover:text-white transition-colors">Salud</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
