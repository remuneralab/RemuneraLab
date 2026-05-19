"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, XCircle, AlertCircle, Scale,
  ShieldAlert, FileText, Users, Info,
  ChevronRight, Gavel, HardHat,
} from "lucide-react";

import { ComplianceGauge } from "../ComplianceGauge";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHECKLIST = [
  {
    item: "Registro de contratistas ante empresa principal (Ley 20.123)",
    status: "ok" as const,
    detalle: "Se mantiene nómina actualizada de contratistas y subcontratistas con contratos, RUT empresa y representante legal. Inspecciones DT sin observaciones.",
    pts: 15,
  },
  {
    item: "Registro de jornada y pago de horas extra en turno",
    status: "ok" as const,
    detalle: "Sistema de marcación biométrica activo en acceso a faena. Todas las horas extra documentadas y liquidadas en plazo legal. Sin contingencias recientes.",
    pts: 12,
  },
  {
    item: "Certificaciones SERNAGEOMIN por operador (DS 132)",
    status: "partial" as const,
    detalle: "El 78% de operadores de equipos pesados tiene certificación vigente. 22% en proceso de renovación con vencimiento en los próximos 90 días. Riesgo de paralización de equipo si vence.",
    pts: 8,
  },
  {
    item: "Auditoría de cumplimiento laboral a contratistas (Ley 20.123)",
    status: "fail" as const,
    detalle: "La empresa principal responde SOLIDARIAMENTE por las obligaciones laborales y previsionales de los contratistas. Sin auditorías periódicas, cualquier deuda de AFP o sueldo del contratista se convierte en deuda de la faena.",
    pts: 0,
  },
  {
    item: "Bandas salariales diferenciadas por turno, zona y régimen",
    status: "fail" as const,
    detalle: "No existen bandas formalizadas que distingan entre turno 7×7 y 5×2, faena vs. planta, o zona norte vs. zona central. La opacidad genera diferencias informales que ya son fuente de conflictos internos en mandos medios.",
    pts: 0,
  },
  {
    item: "Personal que conoce su banda salarial (>60%)",
    status: "fail" as const,
    detalle: "El 88% de operadores y técnicos de mantención desconoce si su sueldo está en rango. El 61% de contratistas no sabe si su empleador le paga lo mismo que trabajadores propios en roles equivalentes — derecho garantizado por Ley 20.123.",
    pts: 0,
  },
];

const SCORE = CHECKLIST.reduce((a, c) => a + c.pts, 0); // 35

const RIESGOS = [
  {
    icon: Gavel,
    titulo: "Responsabilidad solidaria por deudas de contratistas",
    desc: "La Ley 20.123 hace a la empresa principal responsable de todas las obligaciones laborales y previsionales de sus contratistas. Una AFP impaga de un contratista — aunque sea pequeño — puede ejecutarse directamente contra la minera o el yacimiento.",
    nivel: "Crítico",
    color: "text-red-500",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: HardHat,
    titulo: "Paralización de equipos por certificaciones DS 132 vencidas",
    desc: "SERNAGEOMIN puede ordenar paralización inmediata de cualquier equipo pesado operado sin certificación vigente. Costo directo: $2.800.000/día por equipo paralizado + multa de 10 a 150 UTM según reincidencia.",
    nivel: "Crítico",
    color: "text-red-500",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: ShieldAlert,
    titulo: "Demandas por brecha de género en cargos técnicos",
    desc: "La minería es el sector con mayor brecha de género en Chile: mujeres ganan un 21% menos que hombres en cargos equivalentes, controlando por experiencia. La Ley 20.348 está vigente desde 2009 y la prescripción de acciones es de 5 años.",
    nivel: "Alto",
    color: "text-red-500",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: Users,
    titulo: "Ley de Transparencia Salarial — próxima a regir",
    desc: "La Ley de Transparencia (2025–26) obliga a publicar rangos salariales por cargo y reportar brecha de género anualmente. Las mineras con +100 trabajadores propios (no contratistas) quedan incluidas. Multa: hasta 60 UTM por cargo incumplido.",
    nivel: "Moderado",
    color: "text-amber-500",
    bg: "bg-amber-900/12",
    border: "border-amber-500/20",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CumplimientoLegalMineria() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-[#00B4D8] uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>
            Marco regulatorio
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#00B4D8]/10 text-[#00B4D8] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#00B4D8]/20">
            <Scale size={10} /> Convierte útil en necesario
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Cumplimiento legal — ¿Está preparada tu operación?
        </h2>
        <p className="text-sm text-white/45 max-w-2xl mb-10">
          La minería acumula tres capas regulatorias simultáneas: la <strong className="text-white">Ley 20.123</strong> convierte
          cada deuda de contratistas en deuda propia, el <strong className="text-white">DS 132 SERNAGEOMIN</strong> puede
          paralizar equipos sin previo aviso, y la <strong className="text-white">Ley 20.348</strong> lleva 15 años exigiendo
          igualdad salarial. Este es el diagnóstico para una operación minera privada tipo.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* Score + checklist */}
          <div className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <ComplianceGauge score={SCORE} />
              <div>
                <p className="text-[#00B4D8] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>
                  Score de cumplimiento
                </p>
                <p className="text-3xl font-bold text-red-500">{SCORE}/100</p>
                <p className="text-xs text-white/45 mt-1 max-w-[200px]">
                  Exposición alta. Tres incumplimientos críticos con riesgo de ejecución inmediata.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {CHECKLIST.map((c, i) => {
                const isOpen = openIdx === i;
                const Icon  = c.status === "ok" ? CheckCircle2 : c.status === "partial" ? AlertCircle : XCircle;
                const color = c.status === "ok" ? "text-[#06D6A0]" : c.status === "partial" ? "text-amber-500" : "text-red-500";
                const bg    = c.status === "ok" ? "bg-emerald-900/10 border-emerald-500/20"
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
                    <button onClick={() => setOpenIdx(isOpen ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left">
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

          {/* Riesgos + Ley 20.123 info */}
          <div className="flex flex-col gap-4">

            {/* Ley 20.123 destacada */}
            <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-5">
              <div className="flex items-start gap-3 mb-3">
                <FileText size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white">Ley 20.123 (subcontratación) — vigente desde 2007</p>
                    <span className="text-[9px] font-bold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full">Crítica</span>
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">
                    La empresa principal responde <strong className="text-white">solidaria y subsidiariamente</strong> por
                    todas las obligaciones laborales y previsionales de sus contratistas y subcontratistas.
                    En minería, donde hasta el 60% de la dotación puede ser contratista, la exposición es masiva
                    sin auditorías periódicas.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-red-500/20">
                {[
                  { label: "Vigencia",     valor: "2007" },
                  { label: "Aplica a",     valor: "Todos" },
                  { label: "Exposición",   valor: "Masiva" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-base font-bold text-white">{s.valor}</p>
                    <p className="text-[10px] text-white/45">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/45 mt-2">Sin auditoría activa de contratistas, cualquier deuda de AFP o sueldo impago ejecuta contra la faena.</p>
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

            <a href="#cta"
              className="w-full text-[#0D2240] py-3 rounded-xl text-sm font-bold text-center hover:opacity-90 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)" }}>
              Solicitar auditoría de cumplimiento <ChevronRight size={15} />
            </a>
          </div>
        </div>

        {/* Info DS 132 + Ley 20.348 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-amber-900/12 border border-amber-500/20 rounded-xl p-4">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/45 leading-relaxed">
              <strong className="text-white">DS 132 SERNAGEOMIN:</strong> todo operador de
              equipo pesado (camión minero, pala, cargador) debe tener su certificación operacional
              vigente. SERNAGEOMIN puede ordenar paralización inmediata de un equipo cuyo operador
              no tenga certificación. Multa desde 10 UTM hasta 150 UTM por reincidencia (~$660.000–$9.900.000).
            </p>
          </div>
          <div className="flex items-start gap-3 bg-[#00B4D8]/5 border border-[#00B4D8]/15 rounded-xl p-4">
            <Info size={14} className="text-[#00B4D8] shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/45 leading-relaxed">
              <strong className="text-white">Ley 20.348 (igualdad salarial):</strong> la minería
              es el sector con mayor brecha de género en Chile. Mujeres en roles técnicos equivalentes
              ganan hasta un 21% menos. Con prescripción de 5 años y alta visibilidad mediática,
              el sector minero es de fiscalización prioritaria para la DT desde 2023.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
