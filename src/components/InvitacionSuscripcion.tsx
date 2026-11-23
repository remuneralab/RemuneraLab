"use client";

import { motion } from "motion/react";
import { ArrowRight, FileSearch, Landmark, Scale, Sparkles } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

const E = [0.16, 1, 0.3, 1] as const;
const FONT = { fontFamily: "var(--font-dm-sans)" } as const;

const BENEFICIOS = [
  { icon: FileSearch, texto: "Revisa tus documentos laborales, como liquidaciones, anexos y contratos, y detecta errores con ayuda de Emma, nuestra asistente laboral IA" },
  { icon: Landmark,   texto: "Te explicamos qué dice la ley y qué hacer" },
  { icon: Scale,      texto: "Abogado laboral si tu caso es grave · 1ª consulta gratis" },
];

interface Props {
  origen: string; // para GA: dónde se mostró la invitación
}

export default function InvitacionSuscripcion({ origen }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: E }}
      onViewportEnter={() => sendGAEvent("event", "suscripcion_invitacion_vista", { origen })}
      className="mt-10"
    >
      {/* Borde degradado animado */}
      <motion.div
        className="rounded-2xl p-[2px]"
        style={{
          background: "linear-gradient(120deg, #8568f3, #06D6A0, #a387f5, #F7C948, #8568f3)",
          backgroundSize: "300% 300%",
          boxShadow: "0 0 70px rgba(133,104,243,0.35)",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
      >
        <div className="rounded-[14px] px-5 py-7 sm:px-10 sm:py-9 grid gap-7 md:grid-cols-[1.4fr_1fr] md:items-center"
          style={{ background: "linear-gradient(135deg, #22105a 0%, #180b3b 70%)" }}>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-4"
              style={{ background: "rgba(247,201,72,0.14)", border: "1px solid rgba(247,201,72,0.45)" }}>
              <Sparkles size={13} style={{ color: "#F7C948" }} />
              <span className="uppercase tracking-[0.18em] font-bold"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#F7C948" }}>
                Nuevo · Plan Trabajador
              </span>
            </span>
            <h2 className="text-white font-bold leading-tight mb-3"
              style={{ ...FONT, fontSize: "clamp(1.4rem, 3.2vw, 1.9rem)" }}>
              ¿Te están pagando bien? Revisa tu liquidación por solo $1.000 al mes
            </h2>
            <p className="text-white/55 mb-5" style={{ ...FONT, fontSize: "0.92rem", lineHeight: "1.6" }}>
              Y ayúdanos a construir la infraestructura de transparencia salarial que Chile necesita.
            </p>
            <ul className="flex flex-col gap-2.5">
              {BENEFICIOS.map(({ icon: Icon, texto }) => (
                <li key={texto} className="flex items-start gap-3">
                  <Icon size={17} className="mt-0.5 shrink-0" style={{ color: "#06D6A0" }} />
                  <span className="text-white/80" style={{ ...FONT, fontSize: "0.9rem" }}>{texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center text-center rounded-xl px-5 py-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(133,104,243,0.30)" }}>
            <p className="text-white/50 mb-1" style={{ ...FONT, fontSize: "0.82rem" }}>Todo incluido</p>
            <p className="text-white font-bold mb-5 leading-none" style={{ ...FONT, fontSize: "3rem" }}>
              $1.000<span className="text-white/45 font-normal" style={{ fontSize: "1rem" }}> /mes</span>
            </p>
            <motion.a
              href="/suscripcion"
              onClick={() => sendGAEvent("event", "suscripcion_click", { origen })}
              className="relative overflow-hidden inline-flex w-full items-center justify-center gap-2 font-bold px-6 py-4 rounded-xl"
              style={{
                ...FONT,
                fontSize: "1.05rem",
                color: "#ffffff",
                background: "linear-gradient(135deg, #8568f3, #a387f5)",
                boxShadow: "0 0 40px rgba(133,104,243,0.55), 0 4px 18px rgba(133,104,243,0.35)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: [
                "0 0 30px rgba(133,104,243,0.45), 0 4px 18px rgba(133,104,243,0.30)",
                "0 0 55px rgba(133,104,243,0.75), 0 4px 18px rgba(133,104,243,0.40)",
              ] }}
              transition={{ boxShadow: { duration: 1.6, repeat: Infinity, repeatType: "mirror" } }}
            >
              Suscribirme ahora <ArrowRight size={18} />
            </motion.a>
            <p className="mt-3 text-white/35" style={{ ...FONT, fontSize: "0.75rem" }}>Cancela cuando quieras</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
