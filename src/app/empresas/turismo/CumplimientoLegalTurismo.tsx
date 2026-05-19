"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, XCircle, AlertCircle, Scale,
  ShieldAlert, FileText, Users, Info,
  ChevronRight, Gavel, Clock,
} from "lucide-react";

import { ComplianceGauge } from "../ComplianceGauge";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHECKLIST = [
  {
    item: "Contratos escritos vigentes (incluye trabajadores de temporada)",
    status: "ok" as const,
    detalle: "Se utilizan contratos escritos para todos los trabajadores propios. Los contratos de temporada tienen fechas de inicio y término definidas. Sin observaciones en las últimas dos fiscalizaciones de la DT.",
    pts: 15,
  },
  {
    item: "Nómina actualizada y cotizaciones AFP/FONASA al día",
    status: "ok" as const,
    detalle: "Cotizaciones previsionales pagadas dentro del plazo legal. Certificados de cotizaciones disponibles para auditoría inmediata. AFP sin deuda ejecutoriada.",
    pts: 12,
  },
  {
    item: "Recargo nocturno (30%) documentado y pagado correctamente",
    status: "partial" as const,
    detalle: "El 74% de los turnos nocturnos tiene el recargo del 30% correctamente liquidado (trabajo entre 21:00 y 06:00 hrs). El 26% restante corresponde a personal de cocina y bar con jornada mixta que se liquida con tarifa plana sin diferenciación. Riesgo de cobro retroactivo.",
    pts: 8,
  },
  {
    item: "Distribución de propinas según Ley 20.803",
    status: "fail" as const,
    detalle: "La Ley 20.803 (vigente desde 2016) exige que toda propina voluntaria sea recaudada por el establecimiento y distribuida en proporciones definidas. El manejo informal —propinas en efectivo retenidas por el trabajador sin pasar por liquidación— genera deuda tributaria y previsional acumulada que puede ser exigida retroactivamente por 5 años.",
    pts: 0,
  },
  {
    item: "Protocolo Ley Karin (21.643) registrado ante la DT",
    status: "fail" as const,
    detalle: "Turismo y hotelería es sector de fiscalización prioritaria por la Ley Karin: trabajo nocturno, jerarquías informales y alta presencia de personal joven crean condiciones de riesgo elevado. Sin protocolo registrado desde agosto 2024, la institución está en incumplimiento inmediato con multa base de 10 UTM por trabajador afectado.",
    pts: 0,
  },
  {
    item: "Personal que conoce su banda salarial y comp. total (>60%)",
    status: "fail" as const,
    detalle: "El 84% del personal operativo (camareras, garzones, cocina) desconoce si su sueldo está en rango de mercado. El 91% no sabe el monto total de sus propinas distribuidas. Esta opacidad es la causa directa del 68% de las renuncias en el sector.",
    pts: 0,
  },
];

const SCORE = CHECKLIST.reduce((a, c) => a + c.pts, 0); // 35

const RIESGOS = [
  {
    icon: Gavel,
    titulo: "Propinas no distribuidas — deuda acumulada y retroactiva",
    desc: "Cada mes de incumplimiento de Ley 20.803 genera una deuda acumulada: la DT puede ordenar el pago retroactivo de hasta 5 años de propinas no liquidadas. En un restaurante o bar con 30 garzones activos, la deuda retroactiva puede superar los $180.000.000 CLP en una sola fiscalización.",
    nivel: "Crítico",
    color: "text-red-400",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: ShieldAlert,
    titulo: "Multa DT por incumplimiento Ley Karin",
    desc: "El sector turismo/hotelería concentra condiciones de riesgo según la DT: trabajo nocturno, relaciones jerárquicas informales, aislamiento en destinos remotos (Patagonia, altiplano). Multa base: 10 UTM (~$660.000) por trabajador afectado, más sanciones adicionales si existe denuncia activa.",
    nivel: "Crítico",
    color: "text-red-400",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: Clock,
    titulo: "Recargo nocturno — cobro retroactivo con intereses",
    desc: "El recargo nocturno del 30% (trabajo entre 21:00 y 06:00 hrs) es un derecho irrenunciable. La prescripción de acciones laborales es de 5 años. Para un bartender que trabaja 3 noches semanales, la diferencia acumulada en 5 años puede superar los $8.000.000 en una sola demanda.",
    nivel: "Alto",
    color: "text-red-400",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: Users,
    titulo: "Ley de Transparencia Salarial — próxima a regir",
    desc: "La Ley de Transparencia (2025–26) obliga a publicar rangos salariales por cargo y reportar brecha de género anualmente. Las cadenas hoteleras con +100 trabajadores propios quedan incluidas. Multa: hasta 60 UTM por cargo incumplido (~$3.960.000 por cargo).",
    nivel: "Moderado",
    color: "text-amber-400",
    bg: "bg-amber-900/12",
    border: "border-amber-500/20",
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CumplimientoLegalTurismo() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-[#00B4D8] uppercase tracking-[0.3em]"
            style={{ fontFamily: "Space Mono, monospace", fontSize: "0.62rem", fontWeight: 700 }}>
            Marco regulatorio
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            <Scale size={10} /> Convierte útil en necesario
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Cumplimiento legal — ¿Está preparado tu establecimiento?
        </h2>
        <p className="text-sm text-white/45 max-w-2xl mb-10">
          El sector turismo y hotelería tiene una ley exclusiva que ningún otro sector enfrenta:
          la <strong className="text-white">Ley 20.803 de propinas</strong>, vigente desde 2016 y
          masivamente incumplida. Junto a la <strong className="text-white">Ley Karin</strong> y el
          recargo nocturno del 30%, forman tres vectores de riesgo que se acumulan silenciosamente.
          Este es el diagnóstico para un establecimiento hotelero tipo.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* Score + checklist */}
          <div className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <ComplianceGauge score={SCORE} />
              <div>
                <p className="text-xs font-bold text-white/45 uppercase tracking-wider mb-1">
                  Score de cumplimiento
                </p>
                <p className="text-3xl font-bold text-red-400">{SCORE}/100</p>
                <p className="text-xs text-white/45 mt-1 max-w-[200px]">
                  Exposición alta. La Ley 20.803 y la Ley Karin no admiten plazo de gracia.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {CHECKLIST.map((c, i) => {
                const isOpen = openIdx === i;
                const Icon  = c.status === "ok" ? CheckCircle2 : c.status === "partial" ? AlertCircle : XCircle;
                const color = c.status === "ok" ? "text-[#06D6A0]" : c.status === "partial" ? "text-amber-400" : "text-red-400";
                const bg    = c.status === "ok" ? "bg-emerald-900/12 border-emerald-500/20"
                            : c.status === "partial" ? "bg-amber-900/12 border-amber-500/20"
                            : "bg-red-900/12 border-red-500/20";
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

          {/* Riesgos + Ley 20.803 info */}
          <div className="flex flex-col gap-4">

            {/* Ley 20.803 destacada */}
            <div className="rounded-xl border border-red-500/20 bg-red-900/10 p-5">
              <div className="flex items-start gap-3 mb-3">
                <FileText size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white">Ley 20.803 (Propinas) — vigente desde 2016</p>
                    <span className="text-[9px] font-bold uppercase bg-red-500 text-white px-2 py-0.5 rounded-full">Exclusiva sector</span>
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">
                    Toda propina voluntaria pagada por un cliente debe ser recaudada por el establecimiento
                    e incorporada a las liquidaciones de los trabajadores en la proporción definida. El manejo
                    informal —propinas en efectivo retenidas por el trabajador sin pasar por el sistema— genera
                    deuda tributaria y previsional acumulada que puede ser exigida retroactivamente por 5 años.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-red-500/20">
                {[
                  { label: "Vigencia",        valor: "2016" },
                  { label: "Aplica a",        valor: "Hoteles/Rest." },
                  { label: "Retro. máximo",   valor: "5 años" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-base font-bold text-white">{s.valor}</p>
                    <p className="text-[10px] text-white/45">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/45 mt-2">* Deuda retroactiva con 30 garzones, 2 años de incumplimiento puede superar $180.000.000 CLP.</p>
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
              className="w-full py-3 rounded-xl text-sm font-bold text-center hover:opacity-90 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)", color: "#0D2240", boxShadow: "0 0 28px rgba(6,214,160,0.2)" }}>
              Solicitar auditoría de cumplimiento <ChevronRight size={15} />
            </a>
          </div>
        </div>

        {/* Info boxes */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-amber-900/15 border border-amber-500/20 rounded-xl p-4">
            <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/45 leading-relaxed">
              <strong className="text-white">Recargo nocturno (Art. 38 CT):</strong> todo trabajo
              realizado entre las 21:00 y las 06:00 hrs en jornadas que incluyan ese período
              debe tener un recargo del 30% sobre el valor de la hora normal. Para cocina,
              bar y recepción nocturna, este derecho se viola frecuentemente al pagar tarifa
              plana. La prescripción es de 5 años con intereses.
            </p>
          </div>
          <div className="flex items-start gap-3 bg-[#00B4D8]/5 border border-[#00B4D8]/15 rounded-xl p-4">
            <Info size={14} className="text-[#00B4D8] shrink-0 mt-0.5" />
            <p className="text-[11px] text-white/45 leading-relaxed">
              <strong className="text-white">Ley Transparencia Salarial (2025–26):</strong> cadenas
              hoteleras con +100 trabajadores propios (sin contar temporada) deberán publicar rangos
              salariales por cargo y reportar brecha de género anualmente. En hotelería, la brecha
              en cargos directivos (gerentes de hotel vs. amas de llaves) supera el 34%.
              Multa: hasta 60 UTM por cargo (~$3.960.000).
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
