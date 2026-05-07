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

function buildChartData(p25: number, p50: number, p75: number) {
  const iqr = p75 - p25;
  return [
    { name: "P10", val: Math.round(Math.max(0, p25 - iqr * 0.8) / 1000) },
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
}

export default function ChartResult({ p25, p50, p75, percentil, n }: Props) {
  const data = buildChartData(p25, p50, p75);
  const refLabel = closestLabel(percentil);

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#376476" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#376476" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            formatter={(v) => [formatCLP(Number(v) * 1000), "Salario"]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 700, color: "#00152a" }}
          />
          <Area
            type="monotone"
            dataKey="val"
            stroke="#376476"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVal)"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fontWeight: 600, fill: "#43474d" }}
            dy={10}
          />
          <ReferenceLine
            x={refLabel}
            stroke="#00152a"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              position: "top",
              value: `TÚ · P${percentil}`,
              fill: "#00152a",
              fontSize: 10,
              fontWeight: 800,
              dy: -10,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-on-surface-variant font-medium text-center mt-2">
        Distribución basada en {n} respuestas reales
      </p>
    </div>
  );
}
