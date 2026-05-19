"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  ArrowLeft, ArrowRight, TrendingUp, AlertTriangle,
  Users, CheckCircle2, Zap, HardHat,
  MapPin, ChevronRight, CircleDollarSign, Scale,
} from "lucide-react";
import TabNav from "../TabNav";
import CasoPracticoMineria from "./CasoPracticoMineria";
import CumplimientoLegalMineria from "./CumplimientoLegalMineria";

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

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}
function fmtAxis(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;
}

function riskColor(score: number) {
  if (score >= 70) return { bar: "bg-red-500",    badge: "bg-red-100 text-red-700",       label: "Crítico"  };
  if (score >= 55) return { bar: "bg-orange-400", badge: "bg-orange-100 text-orange-700", label: "Alto"     };
  return              { bar: "bg-yellow-400",  badge: "bg-yellow-100 text-yellow-700",  label: "Moderado" };
}

function premiumColor(pct: number) {
  if (pct >= 30) return "#0F7B6C";
  if (pct >= 15) return "#f59e0b";
  if (pct >= 0)  return "#376476";
  return "#ef4444";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI = [
  { label: "Salario mediano sectorial", valor: "$2.850.000",  sub: "más alto de Chile — ESI 2024",         icon: TrendingUp,      color: "text-white"      },
  { label: "Premio Antofagasta",        valor: "+42%",        sub: "vs. mediana nacional por cargo",        icon: MapPin,          color: "text-amber-500"  },
  { label: "Riesgo rotación operad.",   valor: "74/100",      sub: "Crítico — Operadores Eq. Pesado",       icon: AlertTriangle,   color: "text-red-500"    },
  { label: "Costo reposición operad.",  valor: "$12.000.000", sub: "por evento incl. certificaciones",      icon: CircleDollarSign,color: "text-orange-500" },
];

const institucionalData = [
  { cargo: "Super./Gerente", codelco: 8_200_000, privada: 9_600_000, contratista: 6_800_000 },
  { cargo: "Ing./Geólogo",   codelco: 5_100_000, privada: 6_300_000, contratista: 4_600_000 },
  { cargo: "Capataz/Sup.",   codelco: 3_700_000, privada: 4_100_000, contratista: 3_100_000 },
  { cargo: "Op. Eq. Pesado", codelco: 3_200_000, privada: 3_650_000, contratista: 2_750_000 },
  { cargo: "Tec. Mantención",codelco: 2_900_000, privada: 3_200_000, contratista: 2_400_000 },
];

// Salario Operador Eq. Pesado por región. Base nacional: $2.570.000
const territorialData = [
  { region: "Antofagasta",   sueldo: 3_648_000, premium: 42 },
  { region: "Tarapacá",      sueldo: 3_470_000, premium: 35 },
  { region: "Atacama",       sueldo: 3_213_000, premium: 25 },
  { region: "Coquimbo",      sueldo: 3_033_000, premium: 18 },
  { region: "Metropolitana", sueldo: 2_801_000, premium:  9 },
  { region: "Otras",         sueldo: 2_364_000, premium: -8 },
];

const rotacionData = [
  { cargo: "Op. Eq. Pesado",      riesgo: 74, motivo: "Contratistas ofrecen +$400.000 y bono de zona" },
  { cargo: "Técnico Eléctrico",   riesgo: 68, motivo: "Sector energías renovables compite activamente" },
  { cargo: "Ing. de Proceso",     riesgo: 61, motivo: "Mercado LATAM activo: Perú, Colombia, México" },
  { cargo: "Tec. de Mantención",  riesgo: 57, motivo: "Agotamiento por turnos 7×7 y aislamiento" },
  { cargo: "Capataz/Supervisor",  riesgo: 49, motivo: "Costo de cambio alto, comp. total competitiva" },
  { cargo: "Ing. Metalurgista",   riesgo: 43, motivo: "Pool reducido pero alta estabilidad en faenas" },
];

const IMPACTO_TOTAL = [
  { label: "Ahorro proyectado",         valor: "$365.520.000", sub: "con plan completo a 12 meses",           color: "text-[#06D6A0]" },
  { label: "Reducción de rotación",     valor: "22% → 9%",    sub: "meta del plan de retención",              color: "text-red-500"   },
  { label: "Costo evitado por evento",  valor: "$12.000.000", sub: "por rotación de operador evitada",        color: "text-amber-500" },
];

const FASES = [
  { label: "Urgente",    plazo: "0 – 90 días",   dotColor: "bg-red-500",   lineColor: "border-red-500/30",    badgeClass: "bg-red-500 text-white"         },
  { label: "Corto plazo",plazo: "3 – 12 meses",  dotColor: "bg-amber-500", lineColor: "border-amber-500/30",  badgeClass: "bg-amber-500 text-white"       },
  { label: "Estratégico",plazo: "12 – 24 meses", dotColor: "bg-[#00B4D8]", lineColor: "border-[#00B4D8]/30",  badgeClass: "bg-[#00B4D8]/20 text-[#00B4D8]"},
];

const recomendaciones = [
  {
    fase: 0, num: "01",
    titulo: "Formalizar y publicar la prima de zona y turno",
    desc: "Muchas faenas pagan bonos de zona de forma informal o variable. Documentar y comunicar la estructura de prima de zona y turno reduce en un 30% las salidas motivadas por percepción de inequidad — sin aumentar el gasto total.",
    costo: "Sin costo adicional",
    evita: "30% salidas por opacidad",
    ganancia: "Estabilidad laboral +30%",
    icon: Zap,
  },
  {
    fase: 0, num: "02",
    titulo: "Publicar bandas salariales por cargo y régimen",
    desc: "El 74% de operadores en faenas desconoce su banda y si está en el rango correcto para su turno y experiencia. La transparencia es la palanca más barata de retención: cuando la gente sabe que está bien pagada, deja de buscar.",
    costo: "Sin costo directo",
    evita: "$300.000.000 en rotación operad.",
    ganancia: "Retención +23% operadores",
    icon: CheckCircle2,
  },
  {
    fase: 1, num: "03",
    titulo: "Bono de permanencia con cliff a 18 meses",
    desc: "Un bono diferido equivalente a 1 mes de sueldo, pagado al cumplir 18 meses continuos, reduce la fuga en técnicos eléctricos y de mantención hasta un 38%. El costo es predecible y el impacto en retención es inmediato a los 3 meses de anunciarlo.",
    costo: "$8.640.000/año plan bono",
    evita: "38% rotaciones en técnicos",
    ganancia: "$149.400.000 ahorro/año",
    icon: TrendingUp,
  },
  {
    fase: 1, num: "04",
    titulo: "Flexibilizar régimen de turno para roles críticos",
    desc: "El turno 7×7 en faena remota es el factor de agotamiento más citado en entrevistas de salida. Ofrecer modalidad 4×3 o 5×5 para técnicos especializados sin flexibilidad horaria reduce el burn-out y la rotación en cascada que genera.",
    costo: "Restructura de planning turno",
    evita: "Burn-out → rotación en cascada",
    ganancia: "Satisfacción turno +28%",
    icon: Users,
  },
  {
    fase: 2, num: "05",
    titulo: "Programa de certificación propio reconocido por SERNAGEOMIN",
    desc: "Si la empresa emite sus propias certificaciones de equipos con aval regulatorio, el onboarding baja de 6 semanas a 2, y la certificación se convierte en un activo de retención: el trabajador no quiere perderla al cambiar de faena.",
    costo: "$15.000.000 inversión formación",
    evita: "6 semanas vacante → 2 semanas",
    ganancia: "Fidelización por certificación",
    icon: HardHat,
  },
];

// ─── Tooltips ─────────────────────────────────────────────────────────────────

const tooltipStyle = {
  background: "#0D2240",
  border: "1px solid rgba(0,180,216,0.2)",
  borderRadius: "10px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  fontSize: "12px",
};

function TooltipInst({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const names: Record<string, string> = {
    codelco: "Codelco", privada: "Minería privada", contratista: "Contratistas",
  };
  return (
    <div style={tooltipStyle} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-white/45">{names[p.name] ?? p.name}:</span>
          <span className="font-bold text-white">{fmtCLP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function TooltipTerritorial({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = territorialData.find((d) => d.region === label);
  return (
    <div style={tooltipStyle} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-2">{label}</p>
      <p className="text-white">{fmtCLP(payload[0].value)}</p>
      {item && (
        <p className={`font-bold mt-1 ${item.premium >= 0 ? "text-[#06D6A0]" : "text-red-500"}`}>
          {item.premium >= 0 ? "+" : ""}{item.premium}% vs. base nacional
        </p>
      )}
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

export default function AnalisisMineriaPage() {
  const scrolled = useScrolled();
  const [sectorData, setSectorData] = useState<SectorData | null>(null);
  const [b2bLoaded, setB2bLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard-b2b?sector=mineria")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setSectorData(d); setB2bLoaded(true); })
      .catch(() => setB2bLoaded(true));
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-x-hidden">

      {/* Glows */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[700px] h-[700px] rounded-full" style={{ background: "radial-gradient(circle,rgba(0,180,216,0.13) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,rgba(46,196,182,0.09) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,180,216,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.04) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/12" style={{ background: "rgba(13,34,64,0.88)", backdropFilter: "blur(14px)" }}>
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a href="/" className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors" style={{ fontSize: "1.4rem" }}>RemuneraLab</a>
          <nav className="flex items-center gap-3">
            <TabNav active="mineria" />
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
              <a href="/empresas" className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors mb-6">
                <ArrowLeft size={13} /> Volver a vista general
              </a>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E }}
                className="text-[#00B4D8] uppercase tracking-[0.3em] mb-6"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}
              >
                Análisis sectorial · Minería · ESI 2024 INE Chile
              </motion.p>
              <div className="border-l-2 border-[#00B4D8] pl-6 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Diagnóstico salarial — Sector Minería Chile
                </h1>
              </div>
              <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
                El sector mejor pagado de Chile tiene también uno de los mayores costos de rotación.
                Análisis de diferenciales Codelco/privada/contratistas, premio territorial Antofagasta,
                riesgo de retención y caso práctico en pesos chilenos.
              </p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KPI.map((k, i) => {
                const antofagasta = sectorData?.por_region.find(r => r.region === "Antofagasta");
                const isMediana = i === 0;
                const isPremio  = i === 1;
                const premioPct = antofagasta && sectorData
                  ? Math.round((antofagasta.p50 - sectorData.p50) / sectorData.p50 * 100)
                  : null;
                const isReal = (isMediana && b2bLoaded && !!sectorData) || (isPremio && premioPct != null);
                const showSkeleton = (isMediana || isPremio) && !b2bLoaded;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="rounded-xl border border-white/10 bg-white/4 p-6">
                    <k.icon size={18} className={`${k.color} mb-3`} />

                    {showSkeleton ? (
                      <div className="h-7 w-28 bg-white/10 rounded-lg animate-pulse mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        {isMediana && sectorData ? fmtKPI(sectorData.p50)
                          : isPremio && premioPct != null ? `+${premioPct}%`
                          : k.valor}
                      </p>
                    )}

                    <p className="text-[11px] text-white/45 mt-1 leading-tight">{k.label}</p>

                    {showSkeleton ? (
                      <div className="h-2.5 w-36 bg-white/8 rounded animate-pulse mt-1.5" />
                    ) : (
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {isMediana && sectorData ? `ESI/CASEN INE 2024 · n=${sectorData.n_esi.toLocaleString("es-CL")}`
                          : isPremio && premioPct != null ? "Antofagasta vs. mediana nacional · ESI 2024"
                          : k.sub}
                      </p>
                    )}

                    {isReal && (
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
                <div className="grid grid-cols-3 gap-px bg-white/8 rounded-lg overflow-hidden mb-3">
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
                {sectorData.por_region.length > 0 && (
                  <div className="pt-3 border-t border-white/8">
                    <p className="text-[10px] text-white/35 uppercase tracking-wider mb-2">Mediana P50 por región</p>
                    <div className="flex flex-wrap gap-2">
                      {sectorData.por_region.slice(0, 5).map((r) => (
                        <div key={r.region} className="flex items-center gap-1.5 bg-white/5 rounded px-2.5 py-1">
                          <span className="text-[10px] text-white/45">{r.region}</span>
                          <span className="text-[10px] font-bold text-white">{fmtKPI(r.p50)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>

        {/* ── 1b. Urgency banner Ley 20.123 ── */}
        <div className="bg-[#00B4D8]/10 border-y border-[#00B4D8]/20 py-3 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale size={15} className="shrink-0 text-[#00B4D8]" />
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Ley 20.123: tu empresa responde solidariamente por deudas laborales de todos tus contratistas
              </p>
            </div>
            <a href="#cumplimiento" className="text-[11px] font-bold underline underline-offset-2 shrink-0 hover:opacity-80 transition-opacity text-[#00B4D8]">
              Ver diagnóstico de cumplimiento →
            </a>
          </div>
        </div>

        {/* ── 2. Codelco vs Privada vs Contratistas ── */}
        <section className="py-20 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-[#00B4D8] uppercase tracking-[0.3em] mb-2 block" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Estructura de mercado</span>
                <h2 className="text-2xl font-bold text-white mb-4">Codelco vs. Privada vs. Contratistas</h2>
                <p className="text-sm text-white/45 leading-relaxed mb-6">
                  La minería privada paga entre <strong className="text-white">$500.000 y $1.400.000 más</strong> que Codelco según cargo.
                  Los contratistas pagan entre <strong className="text-white">$350.000 y $2.800.000 menos</strong> que la privada.
                  Esta escalera genera una movilidad ascendente constante: contratista → Codelco → privada.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Privada vs Codelco",         valor: "+$700.000 prom./mes",  color: "text-[#06D6A0]" },
                    { label: "Contratista vs Privada",      valor: "–$1.100.000 prom./mes",color: "text-red-500"   },
                    { label: "Brecha en Op. Eq. Pesado",   valor: "+$900.000 priv./contr.",color: "text-amber-600" },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl border border-white/10 bg-white/4 p-3 flex justify-between items-center gap-3">
                      <span className="text-xs text-white/45">{r.label}</span>
                      <span className={`text-xs font-bold shrink-0 ${r.color}`}>{r.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/4 p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                  {[
                    { key: "codelco",     label: "Codelco",          color: "#376476" },
                    { key: "privada",     label: "Minería privada",   color: "#00B4D8" },
                    { key: "contratista", label: "Contratistas",      color: "#f59e0b" },
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
                      <Bar dataKey="codelco"     fill="#376476" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="privada"     fill="#00B4D8" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="contratista" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Diferencial territorial ── */}
        <section className="py-20 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-[#00B4D8] uppercase tracking-[0.3em] mb-2 block" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Premio territorial</span>
                <h2 className="text-2xl font-bold text-white mb-4">El factor Antofagasta</h2>
                <p className="text-sm text-white/45 leading-relaxed mb-6">
                  El salario de un Operador de Equipos Pesados en Antofagasta es un
                  <strong className="text-white"> 42% mayor</strong> que la mediana nacional del mismo
                  cargo. Esta prima refleja el costo de vida en zona minera, el aislamiento de faena
                  y la competencia directa entre operaciones en el mismo radio de 200 km.
                </p>
                <div className="space-y-3">
                  {[
                    { region: "Antofagasta", pct: 42, color: "bg-emerald-500" },
                    { region: "Tarapacá",    pct: 35, color: "bg-emerald-400" },
                    { region: "Atacama",     pct: 25, color: "bg-amber-400"   },
                    { region: "Coquimbo",    pct: 18, color: "bg-amber-300"   },
                    { region: "Otras",       pct: -8, color: "bg-red-300"     },
                  ].map((r) => (
                    <div key={r.region} className="flex items-center gap-3 text-xs">
                      <span className="w-28 text-white/45 shrink-0">{r.region}</span>
                      <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${Math.max(Math.min((r.pct + 8) * 2, 100), 4)}%` }} />
                      </div>
                      <span className={`font-bold w-10 text-right ${r.pct >= 0 ? "text-[#06D6A0]" : "text-red-500"}`}>
                        {r.pct >= 0 ? "+" : ""}{r.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-white/45 mt-4 leading-relaxed bg-white/6 rounded-xl p-3">
                  Referencia: Operador de Equipos Pesados. Base nacional: <strong className="text-white">$2.570.000</strong>.
                  Fuente: ESI 2024 INE + contribuciones benchmark.
                </p>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/4 p-6">
                <p className="text-[#00B4D8] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Salario por región</p>
                <h3 className="text-base font-bold text-white mb-5">Op. Eq. Pesado — salario bruto mensual CLP</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={territorialData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }}
                        tickFormatter={(v: number) => fmtAxis(v)} width={58} domain={[1_800_000, 4_000_000]} />
                      <Tooltip content={<TooltipTerritorial />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="sueldo" radius={[6, 6, 0, 0]}>
                        {territorialData.map((d, i) => (
                          <Cell key={i} fill={premiumColor(d.premium)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-white/45 pt-3 border-t border-white/8">
                  {[
                    { color: "bg-emerald-600", label: "+30% o más" },
                    { color: "bg-amber-400",   label: "+10% a +30%" },
                    { color: "bg-[#376476]",   label: "0% a +10%" },
                    { color: "bg-red-400",     label: "Bajo base" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Riesgo de rotación ── */}
        <section className="py-20 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
              <span className="text-[#00B4D8] uppercase tracking-[0.3em] mb-2 block" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Retención de talento</span>
              <h2 className="text-2xl font-bold text-white">Riesgo de rotación por cargo</h2>
              <p className="text-sm text-white/45 mt-2 max-w-xl">
                Score compuesto por brecha salarial vs P50, régimen de turno, oferta del mercado
                y motivos declarados en entrevistas de egreso del sector.
              </p>
            </div>
            <div className="space-y-3">
              {rotacionData.map((r, i) => {
                const rc = riskColor(r.riesgo);
                return (
                  <motion.div key={r.cargo} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-white/10 bg-white/4 px-5 py-4 flex items-center gap-5">
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

        {/* ── 5. Cumplimiento legal ── */}
        <div id="cumplimiento">
          <CumplimientoLegalMineria />
        </div>

        {/* ── 6. Caso práctico ── */}
        <CasoPracticoMineria />

        {/* ── 7. Plan de acción ── */}
        <section className="py-24 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6">

            <div className="mb-12">
              <span className="text-[#00B4D8] uppercase tracking-[0.3em] mb-3 block" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Plan de acción</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Lo que debes hacer, en qué orden,
                <br className="hidden sm:block" />
                {" "}y cuánto vale cada decisión.
              </h2>
              <p className="text-white/45 max-w-2xl text-sm leading-relaxed">
                Cinco palancas ordenadas por urgencia y retorno. Cada una incluye el costo
                de actuar y el costo de no actuar — en pesos chilenos.
              </p>
            </div>

            {/* Resumen de impacto */}
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="grid sm:grid-cols-3 mb-16 rounded-2xl border border-white/10 overflow-hidden">
              {IMPACTO_TOTAL.map((k, i) => (
                <div key={i} className={`p-7 text-center bg-white/4 ${i < 2 ? "border-b sm:border-b-0 sm:border-r border-white/8" : ""}`}>
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
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${fase.dotColor}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 ${fase.badgeClass}`}>
                        {fase.label}
                      </span>
                      <span className="text-sm text-white/45 shrink-0">{fase.plazo}</span>
                      <div className={`flex-1 border-t ${fase.lineColor}`} />
                    </div>

                    <div className={`grid gap-5 pl-6 ${items.length === 1 ? "lg:grid-cols-2" : "md:grid-cols-2"}`}>
                      {items.map((rec, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                          className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-5"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-5xl font-black text-white/10 leading-none shrink-0 select-none mt-0.5">{rec.num}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <rec.icon size={14} className="text-[#00B4D8] shrink-0" />
                                <h3 className="text-sm font-bold text-white leading-snug">{rec.titulo}</h3>
                              </div>
                              <p className="text-xs text-white/45 leading-relaxed">{rec.desc}</p>
                            </div>
                          </div>
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

                      {items.length === 1 && (
                        <div className="rounded-xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <HardHat size={20} className="text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">¿Tu faena tiene un perfil diferente?</p>
                            <p className="text-xs text-white/45 max-w-[220px] mx-auto leading-relaxed">
                              El plan se personaliza con la dotación, régimen de turno y región de tu operación específica.
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

        {/* ── 8. CTA Final ── */}
        <section id="cta" className="border-t border-white/8 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[#00B4D8] uppercase tracking-[0.3em] mb-8" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>
                Análisis sectorial · Minería Chile 2024
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                Cada operador que se va<br />cuesta $12.000.000 traerlo de vuelta.
              </h2>
              <p className="text-white/45 text-sm mt-6 max-w-md leading-relaxed">
                Una faena de tamaño medio pierde hasta{" "}
                <strong className="text-white">$664.320.000 al año</strong> en costos de rotación.
                El ahorro proyectado supera los <strong className="text-white">$365.000.000</strong> con un ROI de 3.2x.
              </p>
            </motion.div>
            <motion.a
              href="/empresas#contacto"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E, delay: 0.1 }}
              className="inline-flex items-center gap-2 text-[#0D2240] text-sm font-semibold px-6 py-3 rounded shrink-0"
              style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)" }}
            >
              Solicitar diagnóstico gratuito <ArrowRight size={15} />
            </motion.a>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/8 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif italic text-white mb-1" style={{ fontSize: "1rem" }}>RemuneraLab</p>
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
