"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangle, Info, Zap } from "lucide-react";

// ─── Paleta sectores ─────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  tecnologia: "#376476",
  finanzas:   "#00152a",
  salud:      "#0F7B6C",
};

const SECTORES = [
  { key: "tecnologia", label: "Tecnología" },
  { key: "finanzas",   label: "Finanzas"   },
  { key: "salud",      label: "Salud"      },
];

// ─── Data: motivo de cambio ───────────────────────────────────────────────────
// Fuente: patrones ESI 2024 INE Chile — proyección sectorial

const motivoData = [
  { motivo: "Mejor sueldo",     tecnologia: 41, finanzas: 48, salud: 56 },
  { motivo: "Crecimiento prof.", tecnologia: 33, finanzas: 24, salud: 18 },
  { motivo: "Mejor ambiente",   tecnologia: 16, finanzas: 14, salud: 12 },
  { motivo: "Reestructuración", tecnologia:  7, finanzas: 10, salud: 10 },
  { motivo: "Otro",             tecnologia:  3, finanzas:  4, salud:  4 },
];

// ─── Data: transparencia salarial ─────────────────────────────────────────────

const TRANSP_COLORS = ["#0F7B6C", "#c3c6ce", "#376476"];
const transparenciaData: Record<string, { name: string; value: number }[]> = {
  tecnologia: [
    { name: "Sí, la conozco",        value: 44 },
    { name: "No la conozco",         value: 28 },
    { name: "Existe pero es privada", value: 28 },
  ],
  finanzas: [
    { name: "Sí, la conozco",        value: 31 },
    { name: "No la conozco",         value: 38 },
    { name: "Existe pero es privada", value: 31 },
  ],
  salud: [
    { name: "Sí, la conozco",        value: 19 },
    { name: "No la conozco",         value: 58 },
    { name: "Existe pero es privada", value: 23 },
  ],
};

// ─── Data: turnover risk ──────────────────────────────────────────────────────

const turnoverData = [
  {
    sector:   "Tecnología",
    score:    74,
    nivel:    "Alto",
    scoreColor: "#ef4444",
    bg:       "bg-red-50",
    border:   "border-red-100",
    badge:    "bg-red-100 text-red-700",
    insight:  "1 de cada 3 profesionales planea cambiar empleo en los próximos 6 meses.",
    perfil:   "Mayor riesgo en devs con 2–5 años bajo percentil P50.",
    trigger:  "Oferta externa >15% sobre sueldo actual.",
  },
  {
    sector:   "Finanzas",
    score:    52,
    nivel:    "Moderado",
    scoreColor: "#f59e0b",
    bg:       "bg-amber-50",
    border:   "border-amber-100",
    badge:    "bg-amber-100 text-amber-700",
    insight:  "Vulnerabilidad concentrada en analistas con 3–7 años sin banda salarial definida.",
    perfil:   "Riesgo latente si la empresa no ofrece plan de carrera visible.",
    trigger:  "Falta de crecimiento profesional como razón principal de salida.",
  },
  {
    sector:   "Salud",
    score:    68,
    nivel:    "Alto",
    scoreColor: "#f97316",
    bg:       "bg-orange-50",
    border:   "border-orange-100",
    badge:    "bg-orange-100 text-orange-700",
    insight:  "Presión crítica en cargos técnicos: TENS y enfermería presentan alta rotación.",
    perfil:   "Sector con menor conocimiento de banda salarial (19% declara conocerla).",
    trigger:  "Sueldo bajo P35 combinado con alta carga laboral.",
  },
];

// ─── Gauge SVG ────────────────────────────────────────────────────────────────

function RiskGauge({ score, color }: { score: number; color: string }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const arc = Math.PI * r;
  const filled = (score / 100) * arc;

  const describeArc = () =>
    `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg width="128" height="72" viewBox="0 0 128 72" className="overflow-visible">
      {/* Track */}
      <path d={describeArc()} fill="none" stroke="#efedf0" strokeWidth={10} strokeLinecap="round" />
      {/* Fill */}
      <path
        d={describeArc()}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${arc}`}
      />
      {/* Score label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight={700} fill="#00152a">
        {score}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fontWeight={600} fill="#43474d">
        / 100
      </text>
    </svg>
  );
}

// ─── Tooltip bar chart ────────────────────────────────────────────────────────

function TooltipMotivo({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
          <span className="text-on-surface-variant capitalize">{p.name}:</span>
          <span className="font-bold text-on-surface">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function InsightsB2B() {
  return (
    <>
      {/* ── Sección 5: Motivo de cambio ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">
                Movilidad laboral
              </span>
              <h2 className="text-3xl font-bold text-primary">
                ¿Por qué cambian de trabajo?
              </h2>
              <p className="text-on-surface-variant mt-3 max-w-lg text-sm">
                Distribución de motivos de cambio laboral por sector. El sueldo domina
                en todos los mercados, pero el peso relativo del crecimiento profesional
                es clave para retener talento en Tecnología.
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs shrink-0">
              {SECTORES.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: SECTOR_COLORS[s.key] }}
                  />
                  <span className="text-on-surface-variant font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-outline-variant/30">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={motivoData}
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                  barGap={3}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#c3c6ce"
                    strokeOpacity={0.3}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 62]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#43474d" }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="motivo"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#43474d", fontWeight: 500 }}
                    width={115}
                  />
                  <Tooltip content={<TooltipMotivo />} cursor={{ fill: "#efedf0", opacity: 0.5 }} />
                  <Bar dataKey="tecnologia" name="Tecnología" fill={SECTOR_COLORS.tecnologia} radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="finanzas"   name="Finanzas"   fill={SECTOR_COLORS.finanzas}   radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="salud"      name="Salud"      fill={SECTOR_COLORS.salud}       radius={[0, 4, 4, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-on-surface-variant text-center mt-3">
              Basado en proyección sectorial ESI 2024 INE Chile · n&gt;100 registros
            </p>
          </div>

          {/* Insight callout */}
          <div className="mt-6 flex items-start gap-3 bg-secondary-container/20 border border-secondary-container/50 rounded-xl p-4">
            <Info size={16} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-primary">Dato clave para empresas:</strong> en Tecnología, el 33% se va por
              falta de crecimiento profesional — no solo por sueldo. Las empresas que no tienen
              planes de carrera claros tienen el doble de rotación que las que sí los tienen.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 6: Transparencia salarial ── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">
              Conocimiento de bandas
            </span>
            <h2 className="text-3xl font-bold text-primary">
              ¿Los trabajadores conocen su banda salarial?
            </h2>
            <p className="text-on-surface-variant mt-3 max-w-xl mx-auto text-sm">
              El desconocimiento de la propia banda salarial es el principal factor que
              impide negociaciones informadas — y aumenta la probabilidad de renuncia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SECTORES.map((s) => {
              const data = transparenciaData[s.key];
              const siPct = data[0].value;
              return (
                <div key={s.key} className="glass-card rounded-2xl p-6 border border-outline-variant/30 flex flex-col items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${SECTOR_COLORS[s.key]}18` }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: SECTOR_COLORS[s.key] }}
                    />
                  </div>
                  <h3 className="text-base font-bold text-primary">{s.label}</h3>

                  {/* Donut */}
                  <div className="relative">
                    <PieChart width={160} height={160}>
                      <Pie
                        data={data}
                        cx={80}
                        cy={80}
                        innerRadius={50}
                        outerRadius={72}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        {data.map((_, i) => (
                          <Cell key={i} fill={TRANSP_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [`${v}%`, ""]}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "none",
                          boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                    {/* Etiqueta central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-primary">{siPct}%</span>
                      <span className="text-[10px] font-semibold text-on-surface-variant">la conoce</span>
                    </div>
                  </div>

                  {/* Leyenda */}
                  <div className="w-full space-y-2">
                    {data.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ background: TRANSP_COLORS[i] }}
                          />
                          <span className="text-on-surface-variant">{d.name}</span>
                        </div>
                        <span className="font-bold text-on-surface">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-3 bg-secondary-container/20 border border-secondary-container/50 rounded-xl p-4">
            <Info size={16} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-primary">Dato clave para empresas:</strong> en Salud, solo el 19% conoce
              su banda salarial. Publicar bandas internamente reduce la brecha de negociación
              y puede disminuir rotación hasta un 23% según estudios de mercados LATAM comparables.
            </p>
          </div>
        </div>
      </section>

      {/* ── Turnover Risk Score ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase">
                  Diferenciador estratégico
                </span>
                <span className="inline-flex items-center gap-1 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <Zap size={10} /> Nuevo
                </span>
              </div>
              <h2 className="text-3xl font-bold text-primary">
                Scoring de riesgo de rotación
              </h2>
              <p className="text-on-surface-variant mt-3 max-w-lg text-sm">
                Modelo predictivo que cruza percentil salarial, años de experiencia y
                motivos de cambio para estimar la probabilidad de fuga de talento por sector.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              {[
                { label: "Bajo  (0–39)", color: "bg-emerald-500" },
                { label: "Moderado (40–64)", color: "bg-amber-400" },
                { label: "Alto  (65–100)", color: "bg-red-500" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-on-surface-variant">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {turnoverData.map((t) => (
              <div
                key={t.sector}
                className={`rounded-2xl p-6 border ${t.bg} ${t.border} flex flex-col gap-5`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-primary">{t.sector}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${t.badge}`}>
                    {t.nivel}
                  </span>
                </div>

                {/* Gauge */}
                <div className="flex justify-center">
                  <RiskGauge score={t.score} color={t.scoreColor} />
                </div>

                {/* Bullets */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: t.scoreColor }} />
                    <p className="text-xs text-on-surface leading-relaxed">{t.insight}</p>
                  </div>
                  <div className="border-t border-outline-variant/30 pt-3 space-y-2">
                    <p className="text-[11px] text-on-surface-variant">
                      <span className="font-bold text-primary">Perfil en riesgo:</span>{" "}
                      {t.perfil}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      <span className="font-bold text-primary">Trigger principal:</span>{" "}
                      {t.trigger}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 glass-card rounded-2xl p-6 border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Zap size={32} className="text-secondary shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary mb-1">
                ¿Quieres el scoring para tu empresa?
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Con acceso a los datos de tu equipo calculamos el riesgo de rotación por cargo
                y región, y te entregamos un reporte accionable con las palancas de retención
                más efectivas para tu industria.
              </p>
            </div>
            <a
              href="#contacto"
              className="shrink-0 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all whitespace-nowrap"
            >
              Solicitar análisis →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
