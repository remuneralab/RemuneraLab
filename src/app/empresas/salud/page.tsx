"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CasoPractico from "./CasoPractico";
import CumplimientoLegalSalud from "./CumplimientoLegalSalud";
import CasoRealSalud from "./CasoRealSalud";
import TabNav from "../TabNav";
import {
  ArrowLeft, ArrowRight, TrendingUp, AlertTriangle,
  Users, Award, CheckCircle2, Zap, Heart,
  Building2, ChevronRight, Scale,
} from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

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

function fmt(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}M` : `$${n}k`;
}

function riskColor(score: number) {
  if (score >= 70) return { bar: "bg-red-500",    badge: "bg-red-100 text-red-700",       label: "Crítico"  };
  if (score >= 55) return { bar: "bg-orange-400", badge: "bg-orange-100 text-orange-700", label: "Alto"     };
  return              { bar: "bg-yellow-400",  badge: "bg-yellow-100 text-yellow-700",  label: "Moderado" };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI = [
  { label: "Salario mediano sectorial", valor: "$1.850.000", sub: "bruto mensual Chile 2024",      icon: TrendingUp,    color: "text-primary"    },
  { label: "Cargos analizados",         valor: "10",          sub: "roles del sector salud",        icon: Users,         color: "text-secondary"  },
  { label: "Riesgo rotación",           valor: "68/100",      sub: "nivel Alto · mercado nacional", icon: AlertTriangle, color: "text-orange-500" },
  { label: "Brecha público/privado",    valor: "+28%",        sub: "sector privado sobre público",  icon: Building2,     color: "text-emerald-600"},
];

const pubPrivData = [
  { cargo: "Médico",      publico: 3200, privado: 4800 },
  { cargo: "Enfermera",   publico: 1450, privado: 1750 },
  { cargo: "Kinesiólogo", publico: 1250, privado: 1550 },
  { cargo: "Psicólogo",   publico: 1100, privado: 1350 },
  { cargo: "TENS",        publico:  720, privado:  780 },
];

const rotacionData = [
  { cargo: "TENS",           riesgo: 82, motivo: "Sueldo bajo P35, alta carga asistencial" },
  { cargo: "Aux. Enfermería",riesgo: 78, motivo: "Sin banda salarial conocida, rotación sistémica" },
  { cargo: "Psicólogo/a",    riesgo: 71, motivo: "Sector privado y consultoría compiten activamente" },
  { cargo: "Enfermera/o",    riesgo: 65, motivo: "Oferta laboral extranjera (España, EEUU)" },
  { cargo: "Nutricionista",  riesgo: 58, motivo: "Mercado de consultoría independiente más atractivo" },
  { cargo: "Kinesiólogo/a",  riesgo: 54, motivo: "Clínicas privadas compiten con diferencial >20%" },
];

const IMPACTO_TOTAL = [
  { label: "Ahorro proyectado",      valor: "$263.400.000", sub: "con plan completo a 12 meses",  color: "text-emerald-600" },
  { label: "Reducción de rotación",  valor: "27% → 11%",    sub: "meta de rotación controlada",   color: "text-red-500"     },
  { label: "ROI del plan retención", valor: "4.2x",         sub: "por cada peso invertido",       color: "text-primary"     },
];

const FASES = [
  { label: "Urgente",    plazo: "0 – 90 días",   dotColor: "bg-red-500",   lineColor: "border-red-200",    badgeClass: "bg-red-500 text-white"      },
  { label: "Corto plazo",plazo: "3 – 12 meses",  dotColor: "bg-amber-500", lineColor: "border-amber-200",  badgeClass: "bg-amber-500 text-white"    },
  { label: "Estratégico",plazo: "12 – 24 meses", dotColor: "bg-primary",   lineColor: "border-primary/30", badgeClass: "bg-primary text-on-primary" },
];

const recomendaciones = [
  {
    fase: 0, num: "01",
    titulo: "Publicar bandas salariales internamente",
    desc: "El 81% de TENS y auxiliares no conoce su banda. La opacidad salarial es la causa raíz: cuando un trabajador no sabe si está bien pagado, cualquier oferta externa parece mejor. Publicar las bandas cuesta cero y reduce rotación evitable en 23%.",
    costo: "Sin costo directo",
    evita: "Rotación por opacidad salarial",
    ganancia: "Retención +23% TENS/Aux",
    icon: Award,
  },
  {
    fase: 0, num: "02",
    titulo: "Ajustar sueldos TENS y Auxiliares al P50",
    desc: "El 40% de estos cargos está bajo P35 — ese es el principal detonante de salida inmediata. El ajuste promedio requerido es +$150.000/mes por persona. Con 9 rotaciones TENS evitadas, la inversión se recupera en menos de 4 meses.",
    costo: "+$150.000/mes por persona",
    evita: "$40.500.000 rotación TENS/año",
    ganancia: "Riesgo rotación –31%",
    icon: TrendingUp,
  },
  {
    fase: 1, num: "03",
    titulo: "Implementar plan de carrera visible",
    desc: "El 18% de las salidas se declara por falta de crecimiento profesional. Establecer escalas de cargo con criterios de ascenso claros y publicados elimina esta causa sin requerir presupuesto adicional significativo.",
    costo: "Horas de gestión interna",
    evita: "18% de salidas evitables",
    ganancia: "Retención +18%",
    icon: CheckCircle2,
  },
  {
    fase: 1, num: "04",
    titulo: "Diferencial de bienestar para sector público",
    desc: "Donde el privado paga +28% en promedio, los establecimientos públicos pueden competir con beneficios no monetarios: turnos flexibles, seguro complementario de salud y días adicionales de vacaciones.",
    costo: "Beneficios no monetarios",
    evita: "Fuga talento público → privado",
    ganancia: "Satisfacción laboral +26%",
    icon: Heart,
  },
  {
    fase: 2, num: "05",
    titulo: "Contratos mixtos para médicos especialistas",
    desc: "La brecha público/privado supera el 50% en especialidades. Los contratos con componente de honorarios permiten retener especialistas en el sector público sin eliminar el servicio. Históricamente reduce la fuga médica hasta un 40%.",
    costo: "Rediseño estructura contractual",
    evita: "$164.160.000 rotación médicos",
    ganancia: "Retención médicos +40%",
    icon: Zap,
  },
];

// ─── Tooltip público/privado ──────────────────────────────────────────────────

function TooltipPP({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const pub  = payload.find((p) => p.name === "publico");
  const priv = payload.find((p) => p.name === "privado");
  const brecha = pub && priv ? Math.round(((priv.value - pub.value) / pub.value) * 100) : 0;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-on-surface-variant">{p.name === "publico" ? "Público" : "Privado"}:</span>
          <span className="font-bold">{fmt(p.value)}</span>
        </div>
      ))}
      {brecha > 0 && (
        <p className="text-emerald-600 font-bold mt-1 pt-1 border-t border-outline-variant/30">
          Privado +{brecha}% sobre público
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type InnerTab = "analisis" | "caso";

export default function AnalisisSaludPage() {
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
            <TabNav active="salud" />
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
                Análisis sectorial · Salud · ESI 2024 INE Chile
              </motion.p>
              <div className="border-l-2 border-primary pl-6 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                  Diagnóstico salarial — Sector Salud Chile
                </h1>
              </div>
              <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
                Análisis de riesgo de rotación, brechas público/privado, caso práctico de costos reales
                y palancas de retención para los principales cargos del sistema de salud chileno.
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

        {/* ── 1b. Urgency banner Ley Karin ── */}
        <div className="bg-primary text-on-primary py-3 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale size={15} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Ley Karin (21.643) en vigor desde agosto 2024 — el sector salud es de fiscalización prioritaria por la DT
              </p>
            </div>
            <a href="#cumplimiento" className="text-[11px] font-bold underline underline-offset-2 shrink-0 hover:opacity-80 transition-opacity">
              Ver diagnóstico de cumplimiento →
            </a>
          </div>
        </div>

        {/* ── Tab switcher interno ── */}
        <div className="sticky top-16 z-30 bg-white border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 py-2">
              <button
                onClick={() => switchTab("analisis")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  innerTab === "analisis"
                    ? "bg-surface-container text-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                }`}
              >
                Análisis del sector
              </button>
              <button
                onClick={() => switchTab("caso")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  innerTab === "caso"
                    ? "bg-red-50 text-red-700 font-semibold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  innerTab === "caso" ? "bg-red-500" : "bg-on-surface-variant/40"
                }`} />
                Caso real aplicado
              </button>
            </div>
          </div>
        </div>

        {/* ── Contenido condicional ── */}
        {innerTab === "caso" && <CasoRealSalud />}

        {innerTab === "analisis" && <>

        {/* ── 2. Sector público vs. privado ── */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">Brecha sectorial</span>
                <h2 className="text-2xl font-bold text-primary mb-4">Sector público vs. privado</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  La brecha promedio es de <strong className="text-primary">+28%</strong> a favor del sector
                  privado. El mayor diferencial se concentra en médicos (+50%), donde la fuga de talento
                  desde el sistema público es estructural.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Médico",      pct: 50, color: "bg-red-400"     },
                    { label: "Enfermera",   pct: 21, color: "bg-orange-400"  },
                    { label: "Kinesiólogo", pct: 24, color: "bg-yellow-400"  },
                    { label: "Psicólogo",   pct: 23, color: "bg-yellow-400"  },
                    { label: "TENS",        pct:  8, color: "bg-emerald-400" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3 text-xs">
                      <span className="w-24 text-on-surface-variant shrink-0">{r.label}</span>
                      <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${Math.min(r.pct * 1.8, 100)}%` }} />
                      </div>
                      <span className="font-bold text-primary w-10 text-right">+{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 border border-outline-variant/30 bg-white rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-secondary inline-block" /> Público</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Privado</div>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pubPrivData} barCategoryGap="30%" barGap={4} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                      <XAxis dataKey="cargo" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} tickFormatter={(v: number) => fmt(v)} width={55} />
                      <Tooltip content={<TooltipPP />} cursor={{ fill: "#efedf0", opacity: 0.5 }} />
                      <Bar dataKey="publico"  name="publico"  fill="#376476" radius={[4, 4, 0, 0]} barSize={22} />
                      <Bar dataKey="privado"  name="privado"  fill="#00152a" radius={[4, 4, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Riesgo de rotación ── */}
        <section className="py-20 bg-white">
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
                    <span className="text-sm font-bold text-primary w-36 shrink-0">{r.cargo}</span>
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

        {/* ── 4. Cumplimiento legal ── */}
        <div id="cumplimiento">
          <CumplimientoLegalSalud />
        </div>

        {/* ── 5. Caso práctico ── */}
        <CasoPractico />

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
                Cinco palancas ordenadas por urgencia y retorno. Cada una incluye el costo
                de actuar y el costo de no actuar.
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
                            <Heart size={20} className="text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary mb-1">¿Tu organización tiene necesidades específicas?</p>
                            <p className="text-xs text-on-surface-variant max-w-[220px] mx-auto leading-relaxed">
                              El plan de acción se personaliza con la dotación y los datos reales de tu clínica u hospital.
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

        {/* ── 6. CTA Final ── */}
        <section id="cta" className="bg-primary py-24 sm:py-32">

          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-container mb-8">
                Análisis sectorial · Salud Chile 2024
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                Cada rotación evitada es una cama<br />que sigue funcionando.
              </h2>
              <p className="text-on-primary-container text-sm mt-6 max-w-md leading-relaxed">
                Tu clínica puede estar perdiendo hasta{" "}
                <strong className="text-white">$415.380.000 al año</strong> en costos de rotación.
                Con un plan enfocado, el ahorro proyectado supera los{" "}
                <strong className="text-white">$263.000.000</strong> con un ROI de 4.2x.
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
            <a href="/empresas/finanzas" className="text-xs text-on-primary-container hover:text-white transition-colors">Finanzas</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
