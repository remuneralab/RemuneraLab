"use client";

import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";

const historialData = [
  { mes: "Ene 23", tecnologia: 2800, finanzas: 2380, salud: 1860 },
  { mes: "Mar 23", tecnologia: 2860, finanzas: 2420, salud: 1900 },
  { mes: "Jun 23", tecnologia: 2980, finanzas: 2490, salud: 1950 },
  { mes: "Sep 23", tecnologia: 3080, finanzas: 2540, salud: 1990 },
  { mes: "Dic 23", tecnologia: 3230, finanzas: 2610, salud: 2050 },
  { mes: "Mar 24", tecnologia: 3380, finanzas: 2720, salud: 2100 },
  { mes: "Jun 24", tecnologia: 3530, finanzas: 2820, salud: 2190 },
  { mes: "Sep 24", tecnologia: 3710, finanzas: 2910, salud: 2280 },
  { mes: "Dic 24", tecnologia: 3910, finanzas: 3010, salud: 2390 },
];

const prediccionData = [
  { periodo: "Q1 23", real: 2540 },
  { periodo: "Q2 23", real: 2610 },
  { periodo: "Q3 23", real: 2700 },
  { periodo: "Q4 23", real: 2810 },
  { periodo: "Q1 24", real: 2960 },
  { periodo: "Q2 24", real: 3070 },
  { periodo: "Q3 24", real: 3220 },
  { periodo: "Q4 24", real: 3360 },
  { periodo: "Q1 25", real: 3360, proyeccion: 3360 },
  { periodo: "Q2 25", proyeccion: 3530 },
  { periodo: "Q3 25", proyeccion: 3690 },
  { periodo: "Q4 25", proyeccion: 3860 },
];

const INSIGHTS = [
  { label: "Crecimiento estimado 2025", valor: "+14.9%", sub: "vs. cierre 2024",      color: "text-[#06D6A0]" },
  { label: "Mayor alza proyectada",     valor: "Tecnología", sub: "+18% interanual",  color: "text-[#00B4D8]" },
  { label: "Salario mediano Q4 2025",   valor: "$3.86M",  sub: "mercado general Chile", color: "text-white"    },
];

const LEYENDA = [
  { label: "Tecnología", color: "#00B4D8" },
  { label: "Finanzas",   color: "#2EC4B6" },
  { label: "Salud",      color: "#06D6A0" },
];

const TICK_STYLE = { fontSize: 11, fill: "rgba(255,255,255,0.35)", fontWeight: 500 };
const GRID_STROKE = "rgba(255,255,255,0.07)";
const TOOLTIP_STYLE = {
  borderRadius: "10px",
  border: "1px solid rgba(0,180,216,0.2)",
  background: "#0D2240",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  fontSize: "12px",
};

function TooltipHistorial({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-white/50 capitalize">{p.name}:</span>
          <span className="font-bold text-white">${(p.value / 1000).toFixed(1)}M</span>
        </div>
      ))}
    </div>
  );
}

function TooltipPrediccion({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const isProyeccion = label && label.includes("25") && !["Q4 24", "Q3 24"].includes(label);
  return (
    <div style={TOOLTIP_STYLE} className="p-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-bold text-[#00B4D8]">{label}</p>
        {isProyeccion && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#00B4D8] bg-[#00B4D8]/15 px-2 py-0.5 rounded-full">
            Proyectado
          </span>
        )}
      </div>
      {payload.map((p) =>
        p.value != null ? (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="font-bold text-white">${(p.value / 1000).toFixed(2)}M</span>
            <span className="text-white/50">mediana</span>
          </div>
        ) : null
      )}
    </div>
  );
}

const cardClass = "rounded-xl border border-white/10 bg-white/4 p-6";

export default function ChartsMercado() {
  return (
    <>
      {/* Evolución histórica */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-[#00B4D8] tracking-[0.2em] uppercase mb-2 block"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", fontWeight: 700 }}>
                Tendencia histórica
              </span>
              <h2 className="text-3xl font-bold text-white"
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                Evolución salarial por industria
              </h2>
              <p className="text-white/45 mt-3 max-w-lg"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
                Salario bruto mensual mediano (en miles de CLP) para los principales
                sectores del mercado chileno, enero 2023 — diciembre 2024.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs shrink-0">
              {LEYENDA.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: l.color }} />
                  <span className="text-white/45 font-medium"
                    style={{ fontFamily: "var(--font-dm-sans)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00B4D8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2EC4B6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06D6A0" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06D6A0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={TICK_STYLE} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}M`} width={55} />
                  <Tooltip content={<TooltipHistorial />} />
                  <Area type="monotone" dataKey="tecnologia" stroke="#00B4D8" strokeWidth={2.5} fill="url(#gradTec)" dot={false} activeDot={{ r: 5, fill: "#00B4D8" }} />
                  <Area type="monotone" dataKey="finanzas"   stroke="#2EC4B6" strokeWidth={2.5} fill="url(#gradFin)" dot={false} activeDot={{ r: 5, fill: "#2EC4B6" }} />
                  <Area type="monotone" dataKey="salud"      stroke="#06D6A0" strokeWidth={2.5} fill="url(#gradSal)" dot={false} activeDot={{ r: 5, fill: "#06D6A0" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-white/25 text-center mt-3"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
              Datos representativos basados en contribuciones anónimas al benchmark RemuneraLab · Chile
            </p>
          </div>
        </div>
      </section>

      {/* Proyección 2025 */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-[#00B4D8] tracking-[0.2em] uppercase mb-2 block"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", fontWeight: 700 }}>
              Proyección
            </span>
            <h2 className="text-3xl font-bold text-white"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              ¿Hacia dónde van los salarios en 2025?
            </h2>
            <p className="text-white/45 mt-3 max-w-lg"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
              Modelo de proyección basado en la tendencia histórica del mercado chileno.
              La línea punteada representa la estimación para los próximos trimestres.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className={`lg:col-span-2 ${cardClass}`}>
              <div className="flex items-center gap-4 mb-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-0.5 bg-white/60 rounded-full" />
                  <span className="text-white/45 font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>Histórico real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 border-t-2 border-dashed border-[#00B4D8]/70" />
                  <span className="text-white/45 font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>Proyección 2025</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[#06D6A0] font-bold">
                  <TrendingUp size={14} />
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>+14.9% estimado</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prediccionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="periodo" axisLine={false} tickLine={false} tick={TICK_STYLE} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={TICK_STYLE}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}M`} width={55} domain={[2400, 4000]} />
                    <Tooltip content={<TooltipPrediccion />} />
                    <ReferenceLine x="Q1 25" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4"
                      label={{ value: "Hoy", position: "top", fill: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700 }} />
                    <Line type="monotone" dataKey="real"      stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} connectNulls={false} />
                    <Line type="monotone" dataKey="proyeccion" stroke="#00B4D8" strokeWidth={2.5} strokeDasharray="6 4" dot={false} activeDot={{ r: 5, fill: "#00B4D8" }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-white/25 text-center mt-3"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                Proyección estadística — no constituye asesoría financiera
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {INSIGHTS.map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/4 p-5 flex flex-col gap-2">
                  <p className="text-white/35 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", fontWeight: 700 }}>
                    {item.label}
                  </p>
                  <div className="flex items-end justify-between">
                    <p className={`text-2xl font-bold ${item.color}`}
                      style={{ fontFamily: "var(--font-space-mono)" }}>{item.valor}</p>
                    <ArrowUpRight size={16} className={item.color} />
                  </div>
                  <p className="text-white/35" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
                    {item.sub}
                  </p>
                </div>
              ))}
              <div className="rounded-xl border border-[#00B4D8]/15 bg-[#00B4D8]/5 p-5 flex items-start gap-3">
                <Sparkles size={16} className="text-[#00B4D8] shrink-0 mt-0.5" />
                <p className="text-white/45 leading-relaxed"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                  Las proyecciones se actualizan cada mes con nuevos datos del mercado chileno.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
