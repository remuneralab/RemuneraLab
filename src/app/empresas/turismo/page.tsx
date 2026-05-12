"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  ArrowLeft, ArrowRight, TrendingUp, TrendingDown, AlertTriangle,
  Users, CheckCircle2, Zap, Globe,
  ChevronRight, CircleDollarSign, Scale, Award,
} from "lucide-react";
import TabNav from "../TabNav";
import CasoPracticoTurismo from "./CasoPracticoTurismo";
import CumplimientoLegalTurismo from "./CumplimientoLegalTurismo";

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
  if (pct >= 10) return "#f59e0b";
  if (pct >= 0)  return "#376476";
  return "#ef4444";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI = [
  { label: "Salario mediano sectorial",  valor: "$680.000",    sub: "sector con menor sueldo de Chile",      icon: TrendingUp,      color: "text-primary"    },
  { label: "Rotación anual",             valor: "52%",         sub: "más alta del mercado laboral chileno",   icon: TrendingDown,    color: "text-red-500"    },
  { label: "Aumento dotación peak",      valor: "+65%",        sub: "diciembre–marzo y julio–agosto",         icon: AlertTriangle,   color: "text-amber-500"  },
  { label: "Costo reposición garzon",    valor: "$1.850.000",  sub: "por rotación incl. capacitación estándar",icon: CircleDollarSign,color: "text-orange-500" },
];

const institucionalData = [
  { cargo: "Recepcionista",  cadena: 820_000,  boutique: 700_000,  independiente: 560_000  },
  { cargo: "J. Recepción",   cadena: 1_800_000,boutique: 1_380_000,independiente: 1_080_000},
  { cargo: "Cam. de Piso",   cadena: 620_000,  boutique: 560_000,  independiente: 480_000  },
  { cargo: "Bartender",      cadena: 920_000,  boutique: 760_000,  independiente: 610_000  },
  { cargo: "Chef Ejecutivo", cadena: 3_200_000,boutique: 2_050_000,independiente: 1_580_000},
];

// Salario Recepcionista por destino. Base nacional: $680.000
const destinoData = [
  { region: "Isla de Pascua", sueldo: 1_122_000, premium: 65 },
  { region: "Patagonia",      sueldo:   938_400,  premium: 38 },
  { region: "San Pedro Atac.",sueldo:   870_400,  premium: 28 },
  { region: "Viña / Valpo",   sueldo:   775_200,  premium: 14 },
  { region: "Santiago",       sueldo:   734_400,  premium:  8 },
  { region: "Resto Chile",    sueldo:   625_600,  premium: -8 },
];

const rotacionData = [
  { cargo: "Camarera de piso",     riesgo: 89, motivo: "Trabajo más duro, menor sueldo y sin carrera visible" },
  { cargo: "Garzon / Bartender",   riesgo: 81, motivo: "Alta liquidez laboral — oferta inmediata en grupos gastronómicos" },
  { cargo: "Recepcionista",        riesgo: 67, motivo: "Salto a cadenas internacionales con +40% de sueldo" },
  { cargo: "Chef de partida",      riesgo: 63, motivo: "Constante poaching entre restaurantes y hoteles" },
  { cargo: "Supervisor de piso",   riesgo: 48, motivo: "Mayor pago pero alta carga en temporada alta" },
  { cargo: "Jefe de Recepción",    riesgo: 36, motivo: "Compensación competitiva y estabilidad relativa" },
];

const IMPACTO_TOTAL = [
  { label: "Ahorro proyectado",      valor: "$69.460.000",  sub: "con plan completo a 12 meses",    color: "text-emerald-600" },
  { label: "Reducción de rotación",  valor: "52% → 22%",   sub: "meta del plan de retención",       color: "text-red-500"     },
  { label: "ROI del plan",           valor: "2.8x",         sub: "por cada peso invertido en RRHH", color: "text-primary"     },
];

const FASES = [
  { label: "Urgente",    plazo: "0 – 90 días",   dotColor: "bg-red-500",   lineColor: "border-red-200",    badgeClass: "bg-red-500 text-white"      },
  { label: "Corto plazo",plazo: "3 – 12 meses",  dotColor: "bg-amber-500", lineColor: "border-amber-200",  badgeClass: "bg-amber-500 text-white"    },
  { label: "Estratégico",plazo: "12 – 24 meses", dotColor: "bg-primary",   lineColor: "border-primary/30", badgeClass: "bg-primary text-on-primary" },
];

const recomendaciones = [
  {
    fase: 0, num: "01",
    titulo: "Formalizar la distribución de propinas (Ley 20.803)",
    desc: "El 72% de los establecimientos sigue distribuyendo propinas de forma informal. Formalizarlas a través de la liquidación no solo elimina el riesgo legal retroactivo — también aumenta la retención porque el trabajador ve el monto exacto mensual. Un garzon que ve '$187.000 propinas' en su liquidación percibe mejor su remuneración total sin que suba el costo fijo del negocio.",
    costo: "Cambio en sistema de liquidación",
    evita: "Deuda retroactiva DT hasta 5 años",
    ganancia: "Retención +19% garzones",
    icon: Scale,
  },
  {
    fase: 0, num: "02",
    titulo: "Publicar bandas salariales por cargo y tipo de contrato",
    desc: "El 84% del personal operativo no sabe si está bien pagado. La opacidad es la causa del 68% de las renuncias: cuando no sabes si te pagan bien, cualquier oferta externa parece mejor. Publicar las bandas — diferenciando turno diurno/nocturno y temporada propia vs. contrato fijo — cuesta cero y tiene efecto inmediato en la intención de búsqueda de empleo.",
    costo: "Sin costo directo",
    evita: "68% de renuncias por opacidad",
    ganancia: "Satisfacción laboral +24%",
    icon: Award,
  },
  {
    fase: 1, num: "03",
    titulo: "Bono de permanencia estacional (cliff a 12 meses)",
    desc: "Un bono diferido de 1 mes de sueldo pagado al cumplir 12 meses continuos reduce la rotación de garzones y recepcionistas hasta un 34%. El efecto es mayor en el período crítico de noviembre–enero: el trabajador que sabe que en enero cobra su bono no acepta ofertas en diciembre.",
    costo: "$5.400.000/año plan base",
    evita: "34% rotaciones garzones/recep.",
    ganancia: "$28.900.000 ahorro/año",
    icon: Zap,
  },
  {
    fase: 1, num: "04",
    titulo: "Plan de carrera visible: camarera → supervisora → ama de llaves",
    desc: "El 91% de las camareras de piso ignora que existe una escalera de ascenso dentro del hotel. Publicar los criterios de promoción — años de servicio, indicadores de calidad, evaluaciones — sin aumentar el presupuesto reduce la rotación en este cargo hasta un 27%. La causa de salida más frecuente es percepción de falta de futuro, no el sueldo.",
    costo: "Horas de gestión interna",
    evita: "27% salidas camareras/año",
    ganancia: "Retención +27% piso",
    icon: Users,
  },
  {
    fase: 2, num: "05",
    titulo: "Contrato multi-temporada con opción de permanencia",
    desc: "Los trabajadores de temporada excelentes son los más difíciles de recuperar al año siguiente: aprenden el estándar del hotel, conocen a los clientes frecuentes y no requieren curva de aprendizaje. Un contrato multi-temporada con prioridad de llamada y bono de regreso elimina el riesgo de perderlos a otra cadena entre temporadas.",
    costo: "Rediseño política contractual",
    evita: "Pérdida de talento estacional",
    ganancia: "Retorno temporada +45%",
    icon: CheckCircle2,
  },
];

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function TooltipInst({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const names: Record<string, string> = {
    cadena: "Cadena internacional", boutique: "Hotel boutique", independiente: "Independiente/Restorán",
  };
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

function TooltipDestino({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = destinoData.find((d) => d.region === label);
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-2">{label}</p>
      <p className="text-on-surface">{fmtCLP(payload[0].value)}</p>
      {item && (
        <p className={`font-bold mt-1 ${item.premium >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {item.premium >= 0 ? "+" : ""}{item.premium}% vs. base nacional
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalisisTurismoPage() {
  const scrolled = useScrolled();
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
            <TabNav active="turismo" />
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
                Análisis sectorial · Turismo y Hotelería · ESI 2024 INE Chile
              </motion.p>
              <div className="border-l-2 border-primary pl-6 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                  Diagnóstico salarial — Sector Turismo y Hotelería
                </h1>
              </div>
              <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
                El sector con la mayor rotación de Chile tiene también el salario más bajo del mercado formal.
                Análisis de brechas cadena/boutique/independiente, primas por destino turístico,
                riesgo de retención por cargo y caso práctico en pesos chilenos.
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

        {/* ── 1b. Urgency banner Ley 20.803 ── */}
        <div className="bg-primary text-on-primary py-3 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Scale size={15} className="shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider">
                Ley 20.803 de Propinas vigente desde 2016 — deuda retroactiva de hasta 5 años por incumplimiento
              </p>
            </div>
            <a href="#cumplimiento" className="text-[11px] font-bold underline underline-offset-2 shrink-0 hover:opacity-80 transition-opacity">
              Ver diagnóstico de cumplimiento →
            </a>
          </div>
        </div>

        {/* ── 2. Cadenas vs Boutique vs Independientes ── */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">Estructura de mercado</span>
                <h2 className="text-2xl font-bold text-primary mb-4">Cadenas vs. Boutique vs. Independientes</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  Las cadenas internacionales pagan entre <strong className="text-primary">$160.000 y $1.620.000 más</strong> que
                  los establecimientos independientes según cargo. La mayor brecha está en management: un Chef Ejecutivo
                  en cadena gana el doble que en un restaurante independiente. Esta escalera genera
                  movilidad ascendente constante: independiente → boutique → cadena.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Cadena vs. independiente (chef)",  valor: "+$1.620.000 prom./mes", color: "text-emerald-600" },
                    { label: "Cadena vs. independiente (recep.)",valor: "+$260.000 prom./mes",   color: "text-amber-600"  },
                    { label: "Brecha en Cam. de piso",           valor: "+$140.000 cad./indep.", color: "text-orange-500" },
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
                    { key: "cadena",        label: "Cadena internacional", color: "#376476" },
                    { key: "boutique",      label: "Hotel boutique",        color: "#00152a" },
                    { key: "independiente", label: "Indep./Restorán",       color: "#f59e0b" },
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
                      <Bar dataKey="cadena"        fill="#376476" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="boutique"      fill="#00152a" radius={[4, 4, 0, 0]} barSize={18} />
                      <Bar dataKey="independiente" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Factor Destino ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2">
                <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">Prima territorial</span>
                <h2 className="text-2xl font-bold text-primary mb-4">El factor destino</h2>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  El salario de un recepcionista en Isla de Pascua es un
                  <strong className="text-primary"> 65% mayor</strong> que la mediana nacional del mismo cargo.
                  En Patagonia, el aislamiento y la estacionalidad extrema generan un 38% de prima.
                  Estas brechas reflejan la escasez estructural de personal calificado en destinos remotos.
                </p>
                <div className="space-y-3">
                  {[
                    { region: "Isla de Pascua", pct: 65, color: "bg-emerald-500" },
                    { region: "Patagonia",       pct: 38, color: "bg-emerald-400" },
                    { region: "San Pedro Atac.", pct: 28, color: "bg-amber-400"   },
                    { region: "Viña / Valpo",    pct: 14, color: "bg-amber-300"   },
                    { region: "Otras regiones",  pct: -8, color: "bg-red-300"     },
                  ].map((r) => (
                    <div key={r.region} className="flex items-center gap-3 text-xs">
                      <span className="w-32 text-on-surface-variant shrink-0">{r.region}</span>
                      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${Math.max(Math.min((r.pct + 8) * 1.3, 100), 4)}%` }} />
                      </div>
                      <span className={`font-bold w-10 text-right ${r.pct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {r.pct >= 0 ? "+" : ""}{r.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-4 leading-relaxed bg-surface-container/50 rounded-xl p-3">
                  Referencia: Recepcionista de hotel. Base nacional: <strong className="text-primary">$680.000</strong>.
                  Fuente: ESI 2024 INE + contribuciones benchmark.
                </p>
              </div>

              <div className="lg:col-span-3 border border-outline-variant/30 bg-white rounded-lg p-6">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Salario por destino turístico</p>
                <h3 className="text-base font-bold text-primary mb-5">Recepcionista de hotel — salario bruto mensual CLP</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={destinoData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#43474d" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }}
                        tickFormatter={(v: number) => fmtAxis(v)} width={60} domain={[400_000, 1_200_000]} />
                      <Tooltip content={<TooltipDestino />} cursor={{ fill: "#efedf0", opacity: 0.5 }} />
                      <Bar dataKey="sueldo" radius={[6, 6, 0, 0]}>
                        {destinoData.map((d, i) => (
                          <Cell key={i} fill={premiumColor(d.premium)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-on-surface-variant pt-3 border-t border-outline-variant/20">
                  {[
                    { color: "bg-emerald-600", label: "+30% o más" },
                    { color: "bg-amber-400",   label: "+10% a +30%" },
                    { color: "bg-secondary",   label: "0% a +10%" },
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
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">Retención de talento</span>
              <h2 className="text-2xl font-bold text-primary">Riesgo de rotación por cargo</h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
                Score compuesto por brecha salarial vs P50, estacionalidad, conocimiento de banda y
                motivos declarados en entrevistas de egreso del sector.
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

        {/* ── 5. Caso práctico ── */}
        <CasoPracticoTurismo />

        {/* ── 6. Cumplimiento legal ── */}
        <div id="cumplimiento">
          <CumplimientoLegalTurismo />
        </div>

        {/* ── 7. Plan de acción ── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">

            <div className="mb-12">
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-3 block">Plan de acción</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4 leading-tight">
                Lo que debes hacer, en qué orden,
                <br className="hidden sm:block" />
                {" "}y cuánto vale cada decisión.
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
                Cinco palancas ordenadas por urgencia y retorno. Cada una incluye el costo
                de actuar y el costo de no actuar — en pesos chilenos.
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
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${fase.dotColor}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 ${fase.badgeClass}`}>
                        {fase.label}
                      </span>
                      <span className="text-sm text-on-surface-variant shrink-0">{fase.plazo}</span>
                      <div className={`flex-1 border-t ${fase.lineColor}`} />
                    </div>

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

                      {items.length === 1 && (
                        <div className="border border-dashed border-outline-variant/30 rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                            <Globe size={20} className="text-sky-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary mb-1">¿Tu establecimiento tiene un perfil diferente?</p>
                            <p className="text-xs text-on-surface-variant max-w-[220px] mx-auto leading-relaxed">
                              El plan se personaliza con tu dotación, temporadas, destino y tipo de establecimiento.
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

        {/* ── 8. CTA Final ── */}
        <section id="cta" className="bg-primary py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-container mb-8">
                Análisis sectorial · Turismo y Hotelería Chile 2024
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                Cada garzon que renuncia en enero<br />cuesta $1.850.000 reemplazarlo.
              </h2>
              <p className="text-on-primary-container text-sm mt-6 max-w-md leading-relaxed">
                Un hotel de tamaño medio puede estar perdiendo hasta{" "}
                <strong className="text-white">$121.000.000 al año</strong> en costos de rotación.
                El ahorro proyectado supera los <strong className="text-white">$69.000.000</strong> con un ROI de 2.8x.
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
            <a href="/empresas/mineria" className="text-xs text-on-primary-container hover:text-white transition-colors">Minería</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
