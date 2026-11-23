"use client";

import { motion } from "motion/react";
import { ArrowRight, Bot, FileSearch, Scale, Heart } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

const E = [0.16, 1, 0.3, 1] as const;

const BENEFICIOS = [
  { icon: Bot,        texto: "Asesoría laboral con IA" },
  { icon: FileSearch, texto: "Revisión de liquidación, anexos y contratos" },
  { icon: Scale,      texto: "Contacto con abogados laborales · primera consulta gratis" },
];

interface Props {
  origen: string; // para GA: dónde se mostró la invitación
}

export default function InvitacionSuscripcion({ origen }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: E }}
      onViewportEnter={() => sendGAEvent("event", "suscripcion_invitacion_vista", { origen })}
      className="mt-10 rounded-xl p-6 sm:p-8"
      style={{
        background: "linear-gradient(135deg, rgba(133,104,243,0.14), rgba(133,104,243,0.04))",
        border: "1px solid rgba(133,104,243,0.30)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Heart size={14} style={{ color: "#a387f5" }} />
        <p className="uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#a387f5" }}>
          Súmate · $1.000 al mes
        </p>
      </div>

      <h2 className="text-white font-bold leading-snug mb-3"
        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.35rem" }}>
        Ayúdanos a construir la infraestructura de transparencia salarial que Chile necesita
      </h2>
      <p className="text-white/50 mb-6"
        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", lineHeight: "1.6" }}>
        Con una suscripción de $1.000 mensuales sostienes un proyecto abierto que les da información
        real a trabajadoras y trabajadores, y además accedes a herramientas para defender tus derechos laborales.
      </p>

      <ul className="flex flex-col gap-2.5 mb-7">
        {BENEFICIOS.map(({ icon: Icon, texto }) => (
          <li key={texto} className="flex items-start gap-3">
            <Icon size={16} className="mt-0.5 shrink-0" style={{ color: "#8568f3" }} />
            <span className="text-white/70"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
              {texto}
            </span>
          </li>
        ))}
      </ul>

      <a
        href="/suscripcion"
        onClick={() => sendGAEvent("event", "suscripcion_click", { origen })}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
        style={{
          background: "linear-gradient(135deg, #8568f3, #a387f5)",
          color: "#ffffff",
          fontFamily: "var(--font-dm-sans)",
          fontSize: "0.95rem",
          boxShadow: "0 0 36px rgba(133,104,243,0.35)",
        }}
      >
        Quiero suscribirme <ArrowRight size={16} />
      </a>
    </motion.section>
  );
}
