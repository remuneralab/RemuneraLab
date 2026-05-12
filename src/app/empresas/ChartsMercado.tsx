"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

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
  {
    label: "Crecimiento estimado 2025",
    valor: "+14.9%",
    sub: "vs. cierre 2024",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    label: "Mayor alza proyectada",
    valor: "Tecnología",
    sub: "+18% interanual",
    color: "text-primary",
    bg: "bg-secondary-container/30",
  },
  {
    label: "Salario mediano Q4 2025",
    valor: "$3.86M",
    sub: "mercado general Chile",
    color: "text-secondary",
    bg: "bg-surface-container",
  },
];

// ─── Tooltip custom ──────────────────────────────────────────────────────────

function TooltipHistorial({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-on-surface-variant capitalize">{p.name}:</span>
          <span className="font-bold text-on-surface">
            ${(p.value / 1000).toFixed(1)}M
          </span>
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
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-bold text-primary">{label}</p>
        {isProyeccion && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-secondary bg-secondary-container/40 px-2 py-0.5 rounded-full">
            Proyectado
          </span>
        )}
      </div>
      {payload.map((p) =>
        p.value != null ? (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="font-bold text-on-surface">${(p.value / 1000).toFixed(2)}M</span>
            <span className="text-on-surface-variant">mediana</span>
          </div>
        ) : null
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function ChartsMercado() {
  return (
    <>
      {/* ── Gráfico 1: Evolución histórica ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">
                Tendencia histórica
              </span>
              <h2 className="text-3xl font-bold text-primary">
                Evolución salarial por industria
              </h2>
              <p className="text-on-surface-variant mt-3 max-w-lg text-sm">
                Salario bruto mensual mediano (en miles de CLP) para los principales
                sectores del mercado chileno, enero 2023 — diciembre 2024.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs shrink-0">
              {[
                { label: "Tecnología", color: "#376476" },
                { label: "Finanzas", color: "#00152a" },
                { label: "Salud", color: "#0F7B6C" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: l.color }} />
                  <span className="text-on-surface-variant font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-outline-variant/30">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#376476" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#376476" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradFin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00152a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#00152a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradSal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F7B6C" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0F7B6C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                  <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#43474d", fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#43474d" }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}M`}
                    width={55}
                  />
                  <Tooltip content={<TooltipHistorial />} />
                  <Area
                    type="monotone"
                    dataKey="tecnologia"
                    stroke="#376476"
                    strokeWidth={2.5}
                    fill="url(#gradTec)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#376476" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="finanzas"
                    stroke="#00152a"
                    strokeWidth={2.5}
                    fill="url(#gradFin)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#00152a" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="salud"
                    stroke="#0F7B6C"
                    strokeWidth={2.5}
                    fill="url(#gradSal)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#0F7B6C" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-on-surface-variant text-center mt-3">
              Datos representativos basados en contribuciones anónimas al benchmark RemuneraLab · Chile
            </p>
          </div>
        </div>
      </section>

      {/* ── Gráfico 2: Predicción 2025 ── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">
              Proyección
            </span>
            <h2 className="text-3xl font-bold text-primary">
              ¿Hacia dónde van los salarios en 2025?
            </h2>
            <p className="text-on-surface-variant mt-3 max-w-lg text-sm">
              Modelo de proyección basado en la tendencia histórica del mercado chileno.
              La línea punteada representa la estimación para los próximos trimestres.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Chart */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-outline-variant/30">
              <div className="flex items-center gap-4 mb-6 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-0.5 bg-primary rounded-full" />
                  <span className="text-on-surface-variant font-medium">Histórico real</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 border-t-2 border-dashed border-secondary" />
                  <span className="text-on-surface-variant font-medium">Proyección 2025</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-emerald-600 font-bold">
                  <TrendingUp size={14} />
                  <span>+14.9% estimado</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prediccionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="periodo"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#43474d", fontWeight: 500 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#43474d" }}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}M`}
                      width={55}
                      domain={[2400, 4000]}
                    />
                    <Tooltip content={<TooltipPrediccion />} />
                    <ReferenceLine
                      x="Q1 25"
                      stroke="#43474d"
                      strokeDasharray="4 4"
                      strokeOpacity={0.5}
                      label={{
                        value: "Hoy",
                        position: "top",
                        fill: "#43474d",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    {/* Línea histórica sólida */}
                    <Line
                      type="monotone"
                      dataKey="real"
                      stroke="#00152a"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5, fill: "#00152a" }}
                      connectNulls={false}
                    />
                    {/* Línea proyectada punteada */}
                    <Line
                      type="monotone"
                      dataKey="proyeccion"
                      stroke="#376476"
                      strokeWidth={2.5}
                      strokeDasharray="6 4"
                      dot={false}
                      activeDot={{ r: 5, fill: "#376476" }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-on-surface-variant text-center mt-3">
                Proyección estadística — no constituye asesoría financiera
              </p>
            </div>

            {/* Insight cards */}
            <div className="flex flex-col gap-4">
              {INSIGHTS.map((item, i) => (
                <div
                  key={i}
                  className={`${item.bg} rounded-2xl p-5 border border-outline-variant/20 flex flex-col gap-2`}
                >
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {item.label}
                  </p>
                  <div className="flex items-end justify-between">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.valor}</p>
                    <ArrowUpRight size={16} className={item.color} />
                  </div>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
              ))}
              <div className="glass-card rounded-2xl p-5 border border-outline-variant/30 flex items-start gap-3">
                <Sparkles size={18} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant leading-relaxed">
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
