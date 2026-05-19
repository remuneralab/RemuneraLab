"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

const PASOS = [
  {
    n: "01",
    titulo: "Ingresa tu perfil",
    desc: "Cargo, industria, años de experiencia y región de Chile. Sin nombre ni email — completamente anónimo.",
  },
  {
    n: "02",
    titulo: "Comparte tu sueldo",
    desc: "Selecciona el rango mensual bruto que corresponde a tu situación actual.",
  },
  {
    n: "03",
    titulo: "Descubre dónde estás parado",
    desc: "Ves cuántas personas con tu mismo cargo ganan más o menos que tú, y cuánto falta para llegar al grupo mejor pagado.",
  },
];

export default function Explorar() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-hidden">

      {/* Glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,180,216,0.13) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(46,196,182,0.09) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,216,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* Navbar */}
      <header className="relative z-50 border-b border-white/8">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link
            href="/"
            className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors"
            style={{ fontSize: "1.5rem" }}
          >
            RemuneraLab
          </Link>
        </div>
      </header>

      <main className="relative flex-grow max-w-3xl mx-auto px-6 w-full pt-20 pb-24">

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E }}
          className="text-[#00B4D8] uppercase tracking-[0.3em] mb-14"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem" }}
        >
          Cómo funciona
        </motion.p>

        <div>
          {PASOS.map((paso, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: E, delay: i * 0.1 }}
              className="flex items-start gap-10 py-10 border-t border-white/8"
            >
              <span
                className="leading-none select-none tabular-nums w-16 shrink-0 pt-1"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "rgba(0,180,216,0.15)",
                }}
              >
                {paso.n}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.1rem" }}>
                  {paso.titulo}
                </h3>
                <p className="text-white/45 leading-relaxed"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>
                  {paso.desc}
                </p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-white/8" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E, delay: 0.4 }}
          className="mt-14"
        >
          <Link
            href="/formulario"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded hover:opacity-90 transition-opacity"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #06D6A0, #2EC4B6)",
              color: "#0D2240",
              boxShadow: "0 0 28px rgba(6,214,160,0.2)",
            }}
          >
            Comenzar <ArrowRight size={16} />
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
