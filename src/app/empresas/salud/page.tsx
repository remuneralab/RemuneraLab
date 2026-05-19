"use client";

import { motion } from "motion/react";
import CasoRealSalud from "./CasoRealSalud";
import TabNav from "../TabNav";
import { ArrowLeft } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

export default function AnalisisSaludPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-x-hidden">

      {/* Glows */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,180,216,0.13) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(46,196,182,0.09) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,180,216,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.04) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8"
        style={{ background: "rgba(13,34,64,0.88)", backdropFilter: "blur(14px)" }}>
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a href="/" className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors"
            style={{ fontSize: "1.4rem" }}>
            RemuneraLab
          </a>
          <nav className="flex items-center gap-3">
            <TabNav active="salud" />
            <a href="/empresas#contacto"
              className="inline-flex items-center gap-1.5 text-sm border border-[#00B4D8]/40 text-[#00B4D8] px-4 py-1.5 rounded hover:bg-[#00B4D8]/10 transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              Solicitar demo
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">

        {/* Header de sección */}
        <section className="pt-12 pb-8 border-b border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}>
              <a href="/empresas"
                className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors mb-6"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                <ArrowLeft size={13} /> Volver a vista general
              </a>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#00B4D8", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "10px" }}>
                Sector Salud · Caso real aplicado
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                Diagnóstico y retención — Clínica Santa Elena
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Caso real */}
        <CasoRealSalud />

      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif-display italic text-white mb-1" style={{ fontSize: "1.2rem" }}>RemuneraLab</p>
            <p className="text-white/35" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
              Inteligencia salarial para Chile.
            </p>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-white/35 hover:text-white/60 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
              Para trabajadores
            </a>
            <a href="/empresas" className="text-white/35 hover:text-white/60 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
              Vista general
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
