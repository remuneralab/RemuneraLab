"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  CheckCircle2, XCircle, AlertCircle, Scale,
  ShieldAlert, FileText, Users, TrendingUp, Info,
  ChevronRight, Gavel,
} from "lucide-react";
import { ComplianceGauge } from "../ComplianceGauge";

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHECKLIST = [
  {
    item: "Bandas salariales formalizadas por cargo",
    status: "ok" as const,
    detalle: "El banco cuenta con un manual de bandas actualizado (2023).",
    pts: 15,
  },
  {
    item: "Bandas alineadas al mercado (±15%)",
    status: "partial" as const,
    detalle: "Solo 4 de 10 cargos están dentro del rango. Traders y gerentes superan el umbral inferior requerido.",
    pts: 7,
  },
  {
    item: "Sistema de evaluación de desempeño documentado",
    status: "ok" as const,
    detalle: "Se realizan evaluaciones anuales con criterios escritos.",
    pts: 15,
  },
  {
    item: "Brecha de género ≤5% en cargos equivalentes",
    status: "fail" as const,
    detalle: "Brecha actual promedio: 14.8% en salario base. En compensación total (con variable) sube al 31%.",
    pts: 0,
  },
  {
    item: "Criterios de compensación variable documentados",
    status: "fail" as const,
    detalle: "Los criterios de bonos son discrecionales y no están formalizados por escrito.",
    pts: 0,
  },
  {
    item: "Personal que conoce su banda salarial (>60%)",
    status: "partial" as const,
    detalle: "Solo el 31% declara conocer su banda. Muy por debajo del umbral mínimo que exige la ley.",
    pts: 3,
  },
];

const SCORE = CHECKLIST.reduce((a, c) => a + c.pts, 0); // 40

const RIESGOS = [
  {
    icon: Gavel,
    titulo: "Multa CMF / Dirección del Trabajo",
    desc: "Las empresas del sector financiero con >200 empleados serán fiscalizadas en prioridad. Multas estimadas entre 20 y 60 UTM por cargo incumplido.",
    nivel: "Alto",
    color: "text-red-400",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: ShieldAlert,
    titulo: "Demandas laborales por brecha de género",
    desc: "La brecha del 31% en compensación total es el principal vector de riesgo legal. Una sola demanda exitosa puede costar entre $8.000.000–$40.000.000 más honorarios.",
    nivel: "Crítico",
    color: "text-red-400",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: Users,
    titulo: "Daño reputacional y fuga de talento",
    desc: "Empresas expuestas en medios por brecha salarial reportan caídas de 18–25% en postulaciones de talento femenino en los 6 meses siguientes.",
    nivel: "Moderado",
    color: "text-amber-400",
    bg: "bg-amber-900/12",
    border: "border-amber-500/20",
  },
];

// ─── Gender gap data ──────────────────────────────────────────────────────────

const GENDER_BASE = [
  { cargo: "Gerente",      hombre: 7400, mujer: 5900 },
  { cargo: "Analista Sr.", hombre: 3800, mujer: 3200 },
  { cargo: "Ej. Comercial",hombre: 2300, mujer: 2000 },
  { cargo: "Analista Jr.", hombre: 1900, mujer: 1700 },
  { cargo: "Back Office",  hombre: 1400, mujer: 1300 },
];

const GENDER_TOTAL = [
  { cargo: "Gerente",      hombre: 11470, mujer: 7970 },
  { cargo: "Analista Sr.", hombre: 5320,  mujer: 4000  },
  { cargo: "Ej. Comercial",hombre: 3335,  mujer: 2560  },
  { cargo: "Analista Jr.", hombre: 2280,  mujer: 1938  },
  { cargo: "Back Office",  hombre: 1540,  mujer: 1404  },
];

function gap(h: number, m: number) {
  return `${(((h - m) / h) * 100).toFixed(1)}%`;
}

function TooltipGenero({
  active, payload, label, isTotal,
}: {
  active?: boolean;
  payload?: Array<{ fill: string; name: string; value: number }>;
  label?: string;
  isTotal: boolean;
}) {
  if (!active || !payload?.length) return null;
  const h = payload.find((p) => p.name === "hombre")?.value ?? 0;
  const m = payload.find((p) => p.name === "mujer")?.value ?? 0;
  return (
    <div style={{ background: "#0D2240", border: "1px solid rgba(0,180,216,0.2)", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", fontSize: "12px" }} className="p-3">
      <p className="font-bold mb-2" style={{ color: "#00B4D8" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize" style={{ color: "rgba(255,255,255,0.45)" }}>{p.name === "hombre" ? "Hombre" : "Mujer"}:</span>
          <span className="font-bold text-white">{fmtCLP(p.value * 1_000)}</span>
        </div>
      ))}
      {h > 0 && m > 0 && (
        <p className="text-red-400 font-bold mt-1 pt-1 border-t border-white/10">
          Brecha: {gap(h, m)} a favor del hombre
        </p>
      )}
      {isTotal && (
        <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>Incluye salario base + variable</p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LeyTransparencia() {
  const [view, setView] = useState<"base" | "total">("base");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const data = view === "base" ? GENDER_BASE : GENDER_TOTAL;

  const avgGapBase  = 14.2;
  const avgGapTotal = 31.0;
  const avgGap = view === "base" ? avgGapBase : avgGapTotal;

  return (
    <>
      {/* ── Ley de Transparencia ── */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-[#00B4D8] uppercase tracking-[0.3em] text-[0.62rem] font-bold" style={{ fontFamily: "Space Mono, monospace" }}>
              Marco regulatorio
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#00B4D8]/10 border border-[#00B4D8]/20 text-[#00B4D8] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Scale size={10} /> Convierte útil en necesario
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Ley de Transparencia Salarial — ¿Estás preparado?
          </h2>
          <p className="text-sm text-white/45 max-w-2xl mb-10">
            Chile avanza hacia la obligatoriedad de publicar bandas salariales y reportar brechas
            de género, siguiendo los modelos de la UE (2023), Colorado y Nueva York. Las empresas
            financieras con +200 empleados serán las primeras fiscalizadas. Aquí el diagnóstico
            de preparación para <strong className="text-white">Banco Comercial Modelo</strong> (simulado).
          </p>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">

            {/* Score + checklist */}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <ComplianceGauge score={SCORE} />
                <div>
                  <p className="text-xs font-bold text-white/45 uppercase tracking-wider mb-1">
                    Score de cumplimiento
                  </p>
                  <p className="text-3xl font-bold text-red-500">{SCORE}/100</p>
                  <p className="text-xs text-white/45 mt-1 max-w-[180px]">
                    La empresa tiene exposición legal alta ante una eventual fiscalización.
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                {CHECKLIST.map((c, i) => {
                  const isOpen = openIdx === i;
                  const Icon = c.status === "ok" ? CheckCircle2
                    : c.status === "partial" ? AlertCircle
                    : XCircle;
                  const color = c.status === "ok" ? "text-emerald-400"
                    : c.status === "partial" ? "text-amber-400"
                    : "text-red-400";
                  const bg = c.status === "ok" ? "bg-emerald-900/10 border-emerald-500/20"
                    : c.status === "partial" ? "bg-amber-900/10 border-amber-500/20"
                    : "bg-red-900/10 border-red-500/20";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                      className={`rounded-xl border ${bg} overflow-hidden`}
                    >
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      >
                        <Icon size={16} className={`shrink-0 ${color}`} />
                        <span className="text-xs font-medium text-white flex-1">{c.item}</span>
                        <span className={`text-[10px] font-bold uppercase ${color} shrink-0`}>
                          {c.status === "ok" ? "Cumple" : c.status === "partial" ? "Parcial" : "No cumple"}
                        </span>
                        <motion.span
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
                          className="inline-flex shrink-0"
                        >
                          <ChevronRight size={13} className="text-white/45" />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                              opacity: { duration: isOpen ? 0.25 : 0.15, ease: isOpen ? [0.16, 1, 0.3, 1] : [0.4, 0, 1, 1] },
                            }}
                            className="px-4 pb-3"
                          >
                            <p className="text-[11px] text-white/45 leading-relaxed border-t border-white/8 pt-2">
                              {c.detalle}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Riesgos */}
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-start gap-3 mb-3">
                  <FileText size={18} className="text-[#00B4D8] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white mb-1">¿Qué exigirá la ley?</p>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Publicación obligatoria de rangos salariales por cargo, reporte anual
                      de brecha de género desagregado por categoría y región, y acceso de
                      trabajadores a su banda sin solicitud. Empresas con +100 empleados
                      quedarán sujetas a fiscalización directa de la Dirección del Trabajo.
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-white/25 mt-2">* 60 UTM ≈ $3.960.000 por cargo incumplido (UTM mayo 2025: $66.000)</p>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/8">
                  {[
                    { label: "Empleados mín.", valor: "100+" },
                    { label: "Plazo estimado", valor: "2025–26" },
                    { label: "Multa máx.", valor: "60 UTM*" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-base font-bold text-white">{s.valor}</p>
                      <p className="text-[10px] text-white/45">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {RIESGOS.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                  className={`rounded-2xl border p-4 ${r.bg} ${r.border} flex items-start gap-4`}
                >
                  <r.icon size={18} className={`${r.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-white">{r.titulo}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${r.border} ${r.color} shrink-0`}>
                        {r.nivel}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/45 leading-relaxed">{r.desc}</p>
                  </div>
                </motion.div>
              ))}

              <a
                href="#contacto"
                className="w-full text-[#0D2240] py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)", boxShadow: "0 0 20px rgba(6,214,160,0.2)" }}
              >
                Solicitar auditoría de cumplimiento <ChevronRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brecha de género ── */}
      <section className="py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <span className="text-[#00B4D8] uppercase tracking-[0.3em] text-[0.62rem] font-bold mb-2 block" style={{ fontFamily: "Space Mono, monospace" }}>
                Ley de igualdad salarial de género
              </span>
              <h2 className="text-2xl font-bold text-white">
                Brecha de género — Sector Finanzas
              </h2>
              <p className="text-sm text-white/45 mt-2 max-w-xl">
                La Ley 20.348 exige igualdad para trabajo de igual valor. El problema en finanzas
                no es solo el salario base — es la <strong className="text-white">compensación variable</strong> donde
                la brecha se duplica. Alterna la vista para ver el impacto real.
              </p>
            </div>

            {/* Toggle */}
            <div className="flex items-center bg-white/6 rounded-xl p-1 gap-1 shrink-0">
              {(["base", "total"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    view === v
                      ? "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/30"
                      : "text-white/40 border-white/10 hover:text-white"
                  }`}
                >
                  {v === "base" ? "Salario base" : "Comp. total (+ variable)"}
                </button>
              ))}
            </div>
          </div>

          {/* Brecha promedio */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`rounded-2xl p-5 border transition-colors ${view === "total" ? "bg-red-900/12 border-red-500/20" : "bg-amber-900/12 border-amber-500/20"}`}>
              <p className="text-[11px] font-bold text-white/45 uppercase tracking-wider mb-1">
                Brecha promedio {view === "base" ? "salarial" : "compensación total"}
              </p>
              <p className={`text-3xl font-bold ${view === "total" ? "text-red-400" : "text-amber-400"}`}>
                -{avgGap}%
              </p>
              <p className="text-xs text-white/45 mt-1">
                Mujer gana {(100 - avgGap).toFixed(1)} centavos por cada peso del hombre
              </p>
            </div>
            <div className="rounded-2xl p-5 border bg-white/[0.04] border-white/10">
              <p className="text-[11px] font-bold text-white/45 uppercase tracking-wider mb-1">Cargo con mayor brecha</p>
              <p className="text-xl font-bold text-white">Gerente</p>
              <p className="text-xs text-white/45 mt-1">
                {view === "base" ? "20.3% en salario base" : "30.5% en comp. total"}
              </p>
            </div>
            <div className="rounded-2xl p-5 border bg-[#00B4D8]/5 border-[#00B4D8]/15">
              <p className="text-[11px] font-bold text-white/45 uppercase tracking-wider mb-1">
                {view === "base" ? "Amplificación en variable" : "Brecha en salario base"}
              </p>
              <p className="text-xl font-bold text-[#00B4D8]">
                {view === "base" ? "+2.2x" : "-14.2%"}
              </p>
              <p className="text-xs text-white/45 mt-1">
                {view === "base"
                  ? "La brecha se dobla al incluir bonos"
                  : "Brecha base es menor, pero el variable la amplifica"}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center gap-6 mb-5 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white/60 inline-block" /> Hombre</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#00B4D8] inline-block" /> Mujer</div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={view}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="ml-auto text-[11px] text-white/45 font-medium"
                >
                  {view === "base"
                    ? "Salario bruto mensual base (CLP)"
                    : "Compensación total: base + variable (CLP)"}
                </motion.span>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="h-[280px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} barCategoryGap="28%" barGap={4} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                    <XAxis dataKey="cargo" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}M`} width={52} />
                    <Tooltip content={<TooltipGenero isTotal={view === "total"} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="hombre" name="hombre" fill="rgba(255,255,255,0.55)" radius={[4, 4, 0, 0]} barSize={28} />
                    <Bar dataKey="mujer"  name="mujer"  fill="#00B4D8"               radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>

            {/* Gap row */}
            <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-5 gap-2">
              {data.map((d) => (
                <div key={d.cargo} className="text-center">
                  <p className="text-[10px] text-white/45 mb-0.5">{d.cargo}</p>
                  <p className="text-xs font-bold text-red-400">-{gap(d.hombre, d.mujer)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 bg-red-900/12 border border-red-500/20 rounded-xl p-4">
            <Info size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/45 leading-relaxed">
              <strong className="text-white">El dato crítico:</strong> en salario base la brecha promedio es
              del 14.2%. Al incluir compensación variable (bonos, comisiones), sube al 31%. La
              Ley 20.348 ya obliga a igualdad en compensación total — no solo en salario base.
              Los criterios discrecionales de bonos son el principal vector de litigación.
              Fuente: proyección ESI 2024 INE + CASEN 2022.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
