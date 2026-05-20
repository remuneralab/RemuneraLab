"use client";

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

const SALARIO_MINIMO_K = 539;

const BREAKPOINTS = [
  { p: 10, name: "Bajo" },
  { p: 25, name: "Básico" },
  { p: 40, name: "Típico" },
  { p: 50, name: "Mediana" },
  { p: 60, name: "Bueno" },
  { p: 75, name: "Alto" },
  { p: 90, name: "Top" },
] as const;

function buildChartData(p25: number, p50: number, p75: number) {
  const iqr = p75 - p25;
  return [
    { name: "Bajo",    val: Math.round(Math.max(SALARIO_MINIMO_K * 1000, p25 - iqr * 0.8) / 1000) },
    { name: "Básico",  val: Math.round(p25 / 1000) },
    { name: "Típico",  val: Math.round((p25 + iqr * 0.4) / 1000) },
    { name: "Mediana", val: Math.round(p50 / 1000) },
    { name: "Bueno",   val: Math.round((p50 + (p75 - p50) * 0.4) / 1000) },
    { name: "Alto",    val: Math.round(p75 / 1000) },
    { name: "Top",     val: Math.round((p75 + iqr * 0.6) / 1000) },
  ];
}

function closestLabel(percentil: number): string {
  return [...BREAKPOINTS].reduce((a, b) =>
    Math.abs(b.p - percentil) < Math.abs(a.p - percentil) ? b : a
  ).name;
}

interface Props {
  p25: number;
  p50: number;
  p75: number;
  percentil: number;
  n: number;
  n_esi: number;
  n_aviso: number;
  horasSemana?: number;
}

export default function ChartResult({ p25, p50, p75, percentil, n, n_esi, n_aviso, horasSemana }: Props) {
  const isPartTime = !!horasSemana && horasSemana < 42;
  const data       = buildChartData(p25, p50, p75);
  const refLabel   = closestLabel(percentil);

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8568f3" stopOpacity={0.30} />
              <stop offset="95%" stopColor="#8568f3" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Tooltip
            formatter={(v) => [formatCLP(Number(v) * 1000), "Salario"]}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid rgba(133,104,243,0.30)",
              background: "#180b3b",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 700, color: "#a387f5" }}
            itemStyle={{ color: "rgba(255,255,255,0.7)" }}
          />
          <Area
            type="monotone"
            dataKey="val"
            stroke="#8568f3"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorVal)"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fontWeight: 600, fill: "rgba(255,255,255,0.35)" }}
            dy={10}
          />
          {/* Marcador: FTE-equivalente para part-time, sueldo real para full-time */}
          <ReferenceLine
            x={refLabel}
            stroke={isPartTime ? "#F7C948" : "#e7e4fd"}
            strokeDasharray="4 3"
            strokeWidth={2}
            label={{
              position: "top",
              value: isPartTime ? `equiv. proporcional · P${percentil}` : `TÚ · P${percentil}`,
              fill: isPartTime ? "#F7C948" : "#e7e4fd",
              fontSize: 9,
              fontWeight: 800,
              dy: -10,
            }}
          />
          <ReferenceLine
            y={SALARIO_MINIMO_K}
            stroke="rgba(247,201,72,0.45)"
            strokeDasharray="3 4"
            strokeWidth={1.5}
            label={{
              position: "insideBottomLeft",
              value: "Mín. legal",
              fill: "rgba(247,201,72,0.55)",
              fontSize: 9,
              fontWeight: 700,
              dy: -4,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-white/30 font-medium text-center mt-2"
        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
        {n > 0 && n_esi > 0
          ? `${n} contribuciones RemuneraLab · ${n_esi} registros ESI INE${n_aviso > 0 ? ` · ${n_aviso} avisos` : ""}`
          : n_esi > 0
          ? `${n_esi} registros ESI INE${n_aviso > 0 ? ` · ${n_aviso} avisos` : ""}`
          : `${n} contribuciones RemuneraLab`}
      </p>
    </div>
  );
}
