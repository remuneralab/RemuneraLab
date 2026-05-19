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

const SALARIO_MINIMO_K = 539; // $539.000 expresado en miles (unidad del eje Y)

function buildChartData(p25: number, p50: number, p75: number) {
  const iqr = p75 - p25;
  return [
    { name: "P10", val: Math.round(Math.max(SALARIO_MINIMO_K * 1000, p25 - iqr * 0.8) / 1000) },
    { name: "P25", val: Math.round(p25 / 1000) },
    { name: "P40", val: Math.round((p25 + iqr * 0.4) / 1000) },
    { name: "P50", val: Math.round(p50 / 1000) },
    { name: "P60", val: Math.round((p50 + (p75 - p50) * 0.4) / 1000) },
    { name: "P75", val: Math.round(p75 / 1000) },
    { name: "P90", val: Math.round((p75 + iqr * 0.6) / 1000) },
  ];
}

function closestLabel(percentil: number) {
  const breakpoints = [10, 25, 40, 50, 60, 75, 90];
  const closest = breakpoints.reduce((a, b) =>
    Math.abs(b - percentil) < Math.abs(a - percentil) ? b : a
  );
  return `P${closest}`;
}

interface Props {
  p25: number;
  p50: number;
  p75: number;
  percentil: number;
  n: number;
  n_esi: number;
  n_aviso: number;
}

export default function ChartResult({ p25, p50, p75, percentil, n, n_esi, n_aviso }: Props) {
  const data = buildChartData(p25, p50, p75);
  const refLabel = closestLabel(percentil);

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
          <ReferenceLine
            x={refLabel}
            stroke="#e7e4fd"
            strokeDasharray="4 3"
            strokeWidth={2}
            label={{
              position: "top",
              value: `TÚ · P${percentil}`,
              fill: "#e7e4fd",
              fontSize: 10,
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
