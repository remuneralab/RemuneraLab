"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, XCircle, AlertCircle, Scale,
  ShieldAlert, FileText, Users, Info,
  ChevronRight, Gavel,
} from "lucide-react";
import { ComplianceGauge } from "../ComplianceGauge";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHECKLIST = [
  {
    item: "Registro de jornada efectiva vs. contratada",
    status: "ok" as const,
    detalle: "Se lleva registro de turnos con sistema de marcación en todos los pabellones y servicios clínicos.",
    pts: 18,
  },
  {
    item: "Sistema de evaluación de desempeño documentado",
    status: "ok" as const,
    detalle: "Se realizan evaluaciones anuales con criterios escritos por cargo y categoría de profesional.",
    pts: 17,
  },
  {
    item: "Bandas salariales formalizadas por cargo clínico",
    status: "partial" as const,
    detalle: "Existen bandas para médicos y enfermeras, pero TENS, auxiliares y paramédicos carecen de bandas formalizadas.",
    pts: 10,
  },
  {
    item: "Protocolo Ley Karin registrado ante la DT",
    status: "fail" as const,
    detalle: "La Ley 21.643 exige protocolo de prevención de acoso laboral registrado desde agosto 2024. Sin este registro, la institución está en incumplimiento inmediato.",
    pts: 0,
  },
  {
    item: "Brecha de género ≤5% en cargos equivalentes",
    status: "fail" as const,
    detalle: "Brecha en cargos directivos: 29%. En médicos jefe de servicio: 21%. Ambas muy por sobre el umbral de Ley 20.348.",
    pts: 0,
  },
  {
    item: "Personal que conoce su banda salarial (>60%)",
    status: "fail" as const,
    detalle: "El 81% de TENS y auxiliares desconoce su banda. Incluso el 47% de enfermeras/os no la conoce. Muy bajo el mínimo que exige la ley de transparencia.",
    pts: 0,
  },
];

const SCORE = CHECKLIST.reduce((a, c) => a + c.pts, 0); // 45

const RIESGOS = [
  {
    icon: Gavel,
    titulo: "Multa DT por incumplimiento Ley Karin",
    desc: "Desde agosto 2024 toda empresa con trabajadores debe tener protocolo registrado. Sin registro: multa base de 10 UTM (~$660.000) por trabajador afectado, más sanciones adicionales si existe denuncia activa.",
    nivel: "Crítico",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: ShieldAlert,
    titulo: "Demandas laborales por brecha de género",
    desc: "La brecha del 29% en cargos directivos es el principal vector de litigación bajo Ley 20.348. Una demanda exitosa incluye retroactivo de hasta 5 años de diferencia salarial más indemnizaciones.",
    nivel: "Alto",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: Users,
    titulo: "Multas por opacidad salarial (ley próxima)",
    desc: "La Ley de Transparencia Salarial (2025–26) afecta a instituciones con +100 empleados — lo que incluye prácticamente toda clínica u hospital privado de tamaño medio.",
    nivel: "Moderado",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CumplimientoLegalSalud() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase">
            Marco regulatorio
          </span>
          <span className="inline-flex items-center gap-1.5 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <Scale size={10} /> Convierte útil en necesario
          </span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Cumplimiento legal — ¿Está preparada tu institución?
        </h2>
        <p className="text-sm text-on-surface-variant max-w-2xl mb-10">
          Tres leyes convergen en el sector salud con urgencia diferente: la <strong className="text-primary">Ley Karin</strong> ya
          está vigente desde agosto 2024, la <strong className="text-primary">Ley 20.348</strong> lleva 15 años en
          vigor y la <strong className="text-primary">Ley de Transparencia Salarial</strong> llega en 2025–26.
          Este es el diagnóstico de cumplimiento para una institución de salud privada tipo.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* Score + checklist */}
          <div className="bg-white rounded-lg border border-outline-variant/30 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <ComplianceGauge score={SCORE} />
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Score de cumplimiento
                </p>
                <p className="text-3xl font-bold text-amber-500">{SCORE}/100</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-[200px]">
                  Exposición legal significativa. La Ley Karin no admite plazo de gracia.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {CHECKLIST.map((c, i) => {
                const isOpen = openIdx === i;
                const Icon  = c.status === "ok" ? CheckCircle2 : c.status === "partial" ? AlertCircle : XCircle;
                const color = c.status === "ok" ? "text-emerald-500" : c.status === "partial" ? "text-amber-500" : "text-red-500";
                const bg    = c.status === "ok" ? "bg-emerald-50 border-emerald-100"
                            : c.status === "partial" ? "bg-amber-50 border-amber-100"
                            : "bg-red-50 border-red-100";
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                    className={`rounded-xl border ${bg} overflow-hidden`}
                  >
                    <button onClick={() => setOpenIdx(isOpen ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left">
                      <Icon size={16} className={`shrink-0 ${color}`} />
                      <span className="text-xs font-medium text-on-surface flex-1">{c.item}</span>
                      <span className={`text-[10px] font-bold uppercase ${color} shrink-0`}>
                        {c.status === "ok" ? "Cumple" : c.status === "partial" ? "Parcial" : "No cumple"}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
                        className="inline-flex shrink-0"
                      >
                        <ChevronRight size={13} className="text-on-surface-variant" />
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
                          <p className="text-[11px] text-on-surface-variant leading-relaxed border-t border-black/5 pt-2">
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

          {/* Riesgos + Ley Karin info */}
          <div className="flex flex-col gap-4">

            {/* Ley Karin destacada */}
            <div className="bg-white rounded-lg border border-red-200 bg-red-50/60 p-5">
              <div className="flex items-start gap-3 mb-3">
                <FileText size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-primary">Ley Karin (21.643) — vigente desde agosto 2024</p>
                    <span className="text-[9px] font-bold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full">Ya rige</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Toda organización con trabajadores debe tener un protocolo de prevención de acoso laboral,
                    sexual y de violencia en el trabajo, registrado ante la Dirección del Trabajo. El sector salud
                    es de fiscalización prioritaria por la naturaleza de las relaciones laborales.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-red-100">
                {[
                  { label: "Vigencia",      valor: "Ago. 2024" },
                  { label: "Aplica a",      valor: "Todos"     },
                  { label: "Multa base",    valor: "10 UTM*"   },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-base font-bold text-primary">{s.valor}</p>
                    <p className="text-[10px] text-on-surface-variant">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-2">* 10 UTM ≈ $660.000 por trabajador afectado (UTM mayo 2025: $66.000)</p>
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
                    <p className="text-xs font-bold text-on-surface">{r.titulo}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${r.border} ${r.color} shrink-0`}>
                      {r.nivel}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}

            <a href="#cta"
              className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-bold text-center hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Solicitar auditoría de cumplimiento <ChevronRight size={15} />
            </a>
          </div>
        </div>

        {/* Info Ley Transparencia + 20.348 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-secondary-container/20 border border-secondary-container/40 rounded-xl p-4">
            <Info size={14} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              <strong className="text-primary">Ley Transparencia Salarial (2025–26):</strong> instituciones
              con +100 empleados deberán publicar rangos salariales por cargo y reportar brecha de género
              anualmente. Aplica a prácticamente toda clínica u hospital privado de tamaño medio. Multa: hasta 60 UTM por cargo (~$3.960.000).
            </p>
          </div>
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              <strong className="text-primary">Ley 20.348 (igualdad salarial):</strong> vigente desde 2009.
              Exige igual remuneración para trabajos de igual valor. La brecha del 29% en cargos directivos
              de salud es litigación esperando a ocurrir. La prescripción de acciones laborales es de 5 años.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
