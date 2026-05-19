"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { AlertTriangle, Info, Zap } from "lucide-react";

const SECTOR_COLORS: Record<string, string> = {
  tecnologia: "#00B4D8",
  finanzas:   "#2EC4B6",
  salud:      "#06D6A0",
};

const SECTORES = [
  { key: "tecnologia", label: "Tecnología" },
  { key: "finanzas",   label: "Finanzas"   },
  { key: "salud",      label: "Salud"      },
];

const motivoData = [
  { motivo: "Mejor sueldo",     tecnologia: 41, finanzas: 48, salud: 56 },
  { motivo: "Crecimiento prof.", tecnologia: 33, finanzas: 24, salud: 18 },
  { motivo: "Mejor ambiente",   tecnologia: 16, finanzas: 14, salud: 12 },
  { motivo: "Reestructuración", tecnologia:  7, finanzas: 10, salud: 10 },
  { motivo: "Otro",             tecnologia:  3, finanzas:  4, salud:  4 },
];

const TRANSP_COLORS = ["#06D6A0", "rgba(255,255,255,0.12)", "#00B4D8"];
const transparenciaData: Record<string, { name: string; value: number }[]> = {
  tecnologia: [
    { name: "Sí, la conozco",         value: 44 },
    { name: "No la conozco",          value: 28 },
    { name: "Existe pero es privada", value: 28 },
  ],
  finanzas: [
    { name: "Sí, la conozco",         value: 31 },
    { name: "No la conozco",          value: 38 },
    { name: "Existe pero es privada", value: 31 },
  ],
  salud: [
    { name: "Sí, la conozco",         value: 19 },
    { name: "No la conozco",          value: 58 },
    { name: "Existe pero es privada", value: 23 },
  ],
};

const turnoverData = [
  {
    sector: "Tecnología", score: 74, nivel: "Alto", scoreColor: "#ef4444",
    borderClass: "border-red-500/20",   bgClass: "bg-red-900/10",   badgeClass: "bg-red-500/15 text-red-400 border border-red-500/20",
    insight: "1 de cada 3 profesionales planea cambiar empleo en los próximos 6 meses.",
    perfil:  "Mayor riesgo en devs con 2–5 años de experiencia que ganan por debajo del promedio.",
    trigger: "Oferta externa >15% sobre sueldo actual.",
  },
  {
    sector: "Finanzas", score: 52, nivel: "Moderado", scoreColor: "#f59e0b",
    borderClass: "border-amber-500/20", bgClass: "bg-amber-900/10", badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    insight: "Vulnerabilidad concentrada en analistas con 3–7 años sin banda salarial definida.",
    perfil:  "Riesgo latente si la empresa no ofrece plan de carrera visible.",
    trigger: "Falta de crecimiento profesional como razón principal de salida.",
  },
  {
    sector: "Salud", score: 68, nivel: "Alto", scoreColor: "#f97316",
    borderClass: "border-orange-500/20", bgClass: "bg-orange-900/10", badgeClass: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    insight: "Presión crítica en cargos técnicos: TENS y enfermería presentan alta rotación.",
    perfil:  "Sector con menor conocimiento de banda salarial (19% declara conocerla).",
    trigger: "Sueldo bajo el 35% del mercado combinado con alta carga laboral.",
  },
];

const TICK_STYLE = { fontSize: 11, fill: "rgba(255,255,255,0.35)", fontWeight: 500 as const };
const GRID_STROKE = "rgba(255,255,255,0.07)";
const TOOLTIP_STYLE = {
  borderRadius: "10px",
  border: "1px solid rgba(0,180,216,0.2)",
  background: "#0D2240",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  fontSize: "12px",
};

function RiskGauge({ score, color }: { score: number; color: string }) {
  const r = 52, cx = 64, cy = 64;
  const arc    = Math.PI * r;
  const filled = (score / 100) * arc;
  const path   = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <svg width="128" height="72" viewBox="0 0 128 72" className="overflow-visible">
      <path d={path} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} strokeLinecap="round" />
      <path d={path} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${filled} ${arc}`} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight={700} fill="white">{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fontWeight={600} fill="rgba(255,255,255,0.4)">/ 100</text>
    </svg>
  );
}

function TooltipMotivo({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
          <span className="text-white/50 capitalize">{p.name}:</span>
          <span className="font-bold text-white">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

const cardClass = "rounded-xl border border-white/10 bg-white/4 p-6";

export default function InsightsB2B() {
  return (
    <>
      {/* Motivo de cambio */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-[#00B4D8] tracking-[0.2em] uppercase mb-2 block"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", fontWeight: 700 }}>
                Movilidad laboral
              </span>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
                ¿Por qué cambian de trabajo?
              </h2>
              <p className="text-white/45 mt-3 max-w-lg" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
                Distribución de motivos de cambio laboral por sector. El sueldo domina
                en todos los mercados, pero el peso relativo del crecimiento profesional
                es clave para retener talento en Tecnología.
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs shrink-0">
              {SECTORES.map((s) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: SECTOR_COLORS[s.key] }} />
                  <span className="text-white/45 font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={motivoData}
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap="28%" barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
                  <XAxis type="number" domain={[0, 62]} axisLine={false} tickLine={false} tick={TICK_STYLE}
                    tickFormatter={(v: number) => `${v}%`} />
                  <YAxis type="category" dataKey="motivo" axisLine={false} tickLine={false} tick={TICK_STYLE} width={115} />
                  <Tooltip content={<TooltipMotivo />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="tecnologia" name="Tecnología" fill={SECTOR_COLORS.tecnologia} radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="finanzas"   name="Finanzas"   fill={SECTOR_COLORS.finanzas}   radius={[0, 4, 4, 0]} barSize={8} />
                  <Bar dataKey="salud"      name="Salud"      fill={SECTOR_COLORS.salud}       radius={[0, 4, 4, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-white/25 text-center mt-3"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
              Basado en proyección sectorial ESI 2024 INE Chile · n&gt;100 registros
            </p>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#00B4D8]/15 bg-[#00B4D8]/5 p-4">
            <Info size={15} className="text-[#00B4D8] shrink-0 mt-0.5" />
            <p className="text-white/55 leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
              <strong className="text-white">Dato clave para empresas:</strong> en Tecnología, el 33% se va por
              falta de crecimiento profesional — no solo por sueldo. Las empresas que no tienen
              planes de carrera claros tienen el doble de rotación que las que sí los tienen.
            </p>
          </div>
        </div>
      </section>

      {/* Transparencia salarial */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[#00B4D8] tracking-[0.2em] uppercase mb-2 block"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", fontWeight: 700 }}>
              Conocimiento de bandas
            </span>
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
              ¿Los trabajadores conocen su banda salarial?
            </h2>
            <p className="text-white/45 mt-3 max-w-xl mx-auto" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
              El desconocimiento de la propia banda salarial es el principal factor que
              impide negociaciones informadas — y aumenta la probabilidad de renuncia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {SECTORES.map((s) => {
              const data = transparenciaData[s.key];
              const siPct = data[0].value;
              return (
                <div key={s.key} className={`${cardClass} flex flex-col items-center gap-4`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${SECTOR_COLORS[s.key]}18` }}>
                    <span className="w-3 h-3 rounded-full" style={{ background: SECTOR_COLORS[s.key] }} />
                  </div>
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {s.label}
                  </h3>
                  <div className="relative">
                    <PieChart width={160} height={160}>
                      <Pie data={data} cx={80} cy={80} innerRadius={50} outerRadius={72}
                        dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                        {data.map((_, i) => <Cell key={i} fill={TRANSP_COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, ""]}
                        contentStyle={{ ...TOOLTIP_STYLE }} />
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-white"
                        style={{ fontFamily: "var(--font-space-mono)" }}>{siPct}%</span>
                      <span className="text-white/35" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem" }}>
                        la conoce
                      </span>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    {data.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TRANSP_COLORS[i] }} />
                          <span className="text-white/40" style={{ fontFamily: "var(--font-dm-sans)" }}>{d.name}</span>
                        </div>
                        <span className="font-bold text-white/70" style={{ fontFamily: "var(--font-space-mono)" }}>
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#00B4D8]/15 bg-[#00B4D8]/5 p-4">
            <Info size={15} className="text-[#00B4D8] shrink-0 mt-0.5" />
            <p className="text-white/55 leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
              <strong className="text-white">Dato clave para empresas:</strong> en Salud, solo el 19% conoce
              su banda salarial. Publicar bandas internamente reduce la brecha de negociación
              y puede disminuir rotación hasta un 23% según estudios de mercados LATAM comparables.
            </p>
          </div>
        </div>
      </section>

      {/* Turnover Risk Score */}
      <section className="py-24 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#00B4D8] tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", fontWeight: 700 }}>
                  Diferenciador estratégico
                </span>
                <span className="inline-flex items-center gap-1 bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/25 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  <Zap size={10} /> Nuevo
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Scoring de riesgo de rotación
              </h2>
              <p className="text-white/45 mt-3 max-w-lg" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
                Modelo predictivo que cruza posición salarial, años de experiencia y
                motivos de cambio para estimar la probabilidad de fuga de talento por sector.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs shrink-0">
              {[
                { label: "Bajo (0–39)", color: "bg-[#06D6A0]" },
                { label: "Moderado (40–64)", color: "bg-amber-400" },
                { label: "Alto (65–100)", color: "bg-red-500" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-white/45" style={{ fontFamily: "var(--font-dm-sans)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {turnoverData.map((t) => (
              <div key={t.sector} className={`rounded-xl border ${t.borderClass} ${t.bgClass} p-6 flex flex-col gap-5`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {t.sector}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${t.badgeClass}`}
                    style={{ fontFamily: "var(--font-space-mono)" }}>
                    {t.nivel}
                  </span>
                </div>
                <div className="flex justify-center">
                  <RiskGauge score={t.score} color={t.scoreColor} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: t.scoreColor }} />
                    <p className="text-white/65 leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                      {t.insight}
                    </p>
                  </div>
                  <div className="border-t border-white/8 pt-3 space-y-2">
                    <p className="text-white/50" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
                      <span className="font-bold text-white/80">Perfil en riesgo:</span> {t.perfil}
                    </p>
                    <p className="text-white/50" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
                      <span className="font-bold text-white/80">Trigger principal:</span> {t.trigger}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Zap size={28} className="text-[#00B4D8] shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-dm-sans)" }}>
                ¿Quieres el scoring para tu empresa?
              </p>
              <p className="text-white/45 leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                Con acceso a los datos de tu equipo calculamos el riesgo de rotación por cargo
                y región, y te entregamos un reporte accionable con las palancas de retención
                más efectivas para tu industria.
              </p>
            </div>
            <a href="#contacto"
              className="shrink-0 font-semibold px-5 py-2.5 rounded hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #06D6A0, #2EC4B6)",
                color: "#0D2240",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.8rem",
              }}>
              Solicitar análisis →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
