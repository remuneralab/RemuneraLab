"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

const E = [0.16, 1, 0.3, 1] as const;

type Sector = { sector: string; count: number };

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString("es-CL")}</span>;
}

export default function Home() {
  const router = useRouter();
  const [sectores, setSectores]     = useState<Sector[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const totalAvisos = sectores.reduce((a, s) => a + s.count, 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/perfil");
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  useEffect(() => {
    fetch("/api/sectores")
      .then((r) => r.json())
      .then(setSectores)
      .catch(() => {});
  }, []);

  const maxCount = Math.max(...sectores.map((s) => s.count), 1);

  if (!authChecked) return <div className="min-h-screen" style={{ background: "#180b3b" }} />;

  return (
    <div style={{ background: "#180b3b" }}>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Fondo: glows + grid */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(133,104,243,0.20) 0%, transparent 65%)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(133,104,243,0.12) 0%, transparent 65%)" }} />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(133,104,243,0.07) 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(133,104,243,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }} />

        <div className="relative flex flex-col items-center text-center gap-7 max-w-4xl w-full">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: E }}
          >
            <Image
              src="/logo-white.png"
              alt="RemuneraLab"
              width={280}
              height={72}
              priority
              className="select-none"
              style={{ filter: "drop-shadow(0 0 24px rgba(133,104,243,0.35))" }}
            />
          </motion.div>

          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: E, delay: 0.1 }}
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.35em", color: "rgba(133,104,243,0.65)" }}
            className="uppercase"
          >
            Benchmark salarial · Chile 2026
          </motion.p>

          {/* Línea separadora */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: E, delay: 0.2 }}
            className="origin-center h-px w-24"
            style={{ background: "linear-gradient(to right, transparent, #8568f3, transparent)" }}
          />

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: E, delay: 0.24 }}
            className="font-semibold leading-tight text-white"
            style={{ fontSize: "clamp(1.5rem, 3.8vw, 2.6rem)", fontFamily: "var(--font-dm-sans)" }}
          >
            Descubre en qué percentil del mercado<br />
            laboral chileno estás —{" "}
            <span style={{ color: "#e7e4fd" }}>en 2 minutos.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: E, delay: 0.32 }}
            className="font-light leading-relaxed max-w-md"
            style={{ fontSize: "1.05rem", fontFamily: "var(--font-dm-sans)", color: "rgba(255,255,255,0.45)" }}
          >
            Ingresa tu cargo, industria y experiencia.
            Sin registro ni email — completamente anónimo.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: E, delay: 0.40 }}
          >
            <Link
              href="/formulario"
              className="inline-flex items-center gap-2 font-semibold px-9 py-4 rounded-lg hover:opacity-90 transition-opacity"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.95rem",
                background: "linear-gradient(135deg, #8568f3, #a387f5)",
                color: "#ffffff",
                boxShadow: "0 0 36px rgba(133,104,243,0.40), 0 2px 12px rgba(133,104,243,0.25)",
              }}
            >
              Descubrir mi posición <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: E, delay: 0.52 }}
            className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2"
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)" }}
          >
            <span>+104.000 REGISTROS REALES</span>
            <span style={{ color: "rgba(255,255,255,0.10)" }}>·</span>
            <span>100% ANÓNIMO</span>
            <span style={{ color: "rgba(255,255,255,0.10)" }}>·</span>
            <span>SIEMPRE GRATIS</span>
          </motion.div>

        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: E, delay: 0.9 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight size={14} className="rotate-90" style={{ color: "rgba(255,255,255,0.18)" }} />
          </motion.div>
        </motion.div>

      </section>

      {/* ══════════════ SECTORES ══════════════ */}
      {sectores.length > 0 && (
        <section
          className="relative px-6 py-24 overflow-hidden"
          style={{ borderTop: "1px solid rgba(133,104,243,0.12)" }}
        >

          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
            style={{ background: "radial-gradient(ellipse, rgba(133,104,243,0.10) 0%, transparent 70%)" }} />

          <div className="relative max-w-5xl mx-auto flex flex-col gap-12">

            {/* Header + stat grande */}
            <div className="flex flex-col items-center text-center gap-4">
              <p
                className="uppercase tracking-[0.3em]"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: "#8568f3" }}
              >
                Mercado laboral · Chile
              </p>
              <div className="h-px w-12" style={{ background: "rgba(133,104,243,0.40)" }} />

              <div className="flex flex-col items-center gap-1">
                <span
                  className="leading-none tabular-nums"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    fontSize: "clamp(2.8rem, 7vw, 4.5rem)",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    textShadow: "0 0 40px rgba(133,104,243,0.25)",
                  }}
                >
                  <CountUp target={totalAvisos} />
                </span>
                <span
                  className="uppercase tracking-[0.3em]"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: "#8568f3" }}
                >
                  avisos laborales disponibles
                </span>
              </div>

              <p
                className="font-light max-w-sm mt-2"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "rgba(255,255,255,0.35)" }}
              >
                Selecciona un sector para ver las ofertas disponibles.
              </p>
            </div>

            {/* Tarjetas de sectores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectores.map(({ sector, count }, i) => {
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <motion.div
                    key={sector}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, ease: E, delay: i * 0.07 }}
                  >
                    <Link
                      href={`/ofertas?sector=${encodeURIComponent(sector)}`}
                      className="group flex flex-col gap-4 p-6 rounded-xl h-full transition-all"
                      style={{
                        border: "1px solid rgba(133,104,243,0.15)",
                        background: "rgba(133,104,243,0.05)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(133,104,243,0.12)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(133,104,243,0.40)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(133,104,243,0.05)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(133,104,243,0.15)";
                      }}
                    >
                      <span
                        className="font-semibold text-white leading-tight transition-colors group-hover:text-[#e7e4fd]"
                        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.15rem" }}
                      >
                        {sector}
                      </span>

                      <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(133,104,243,0.15)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: E, delay: 0.15 + i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: "rgba(133,104,243,0.60)" }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className="tabular-nums transition-colors"
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", letterSpacing: "0.05em", color: "rgba(255,255,255,0.45)" }}
                        >
                          {count} avisos
                        </span>
                        <span
                          className="flex items-center gap-1 transition-colors"
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.20)" }}
                        >
                          VER <ArrowRight size={9} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA general */}
            <div className="flex justify-center">
              <Link
                href="/ofertas"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg transition-all"
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  border: "1px solid rgba(133,104,243,0.40)",
                  color: "#8568f3",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(133,104,243,0.10)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#e7e4fd";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#8568f3";
                }}
              >
                VER TODOS LOS SECTORES <ArrowRight size={11} />
              </Link>
            </div>

          </div>
        </section>
      )}

    </div>
  );
}
