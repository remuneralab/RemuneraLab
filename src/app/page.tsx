"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, ShieldCheck, RefreshCw, BarChart2, Building2 } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1200;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function PercentilViz() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="border border-outline-variant/40 rounded-lg p-8 bg-white space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-1">
          Análisis de ejemplo
        </p>
        <p className="text-base font-semibold text-primary">Desarrollador Senior</p>
        <p className="text-xs text-on-surface-variant mt-0.5">Tecnología · Santiago · 5 años exp.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
          <span>P25</span><span>P50</span><span>P75</span>
        </div>
        <div className="relative h-1 bg-surface-container rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={inView ? { width: "78%" } : { width: 0 }}
            transition={{ duration: 1.4, ease: E, delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
          <span>$2.1M</span><span>$3.1M</span><span>$4.2M</span>
        </div>
      </div>

      <div className="pt-5 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: E, delay: 1.1 }}
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Tu posición
          </p>
          <p className="text-5xl font-bold text-primary tabular-nums leading-none">78</p>
          <p className="text-xs text-on-surface-variant mt-1.5">percentil del mercado</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: E, delay: 1.2 }}
          className="text-right"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Confianza
          </p>
          <p className="text-sm font-bold text-emerald-600 mt-3">Alta</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">106 respuestas reales</p>
        </motion.div>
      </div>
    </div>
  );
}

const PASOS = [
  {
    n: "01",
    titulo: "Ingresa tu perfil",
    desc: "Cargo, industria, años de experiencia y región de Chile. Sin nombre ni email — completamente anónimo.",
  },
  {
    n: "02",
    titulo: "Comparte tu rango salarial",
    desc: "Selecciona el rango mensual bruto que corresponde a tu situación actual.",
  },
  {
    n: "03",
    titulo: "Recibe tu posición en el mercado",
    desc: "Ve tu percentil exacto comparado con profesionales en tu mismo cargo, industria y región.",
  },
];

const PILARES = [
  {
    Icon: ShieldCheck,
    titulo: "100% anónimo",
    desc: "Sin registro ni email. Tus datos se agregan al benchmark colectivo sin identificarte.",
  },
  {
    Icon: BarChart2,
    titulo: "Datos reales",
    desc: "Basado en registros ESI 2024 INE y CASEN 2022. Cada respuesta mejora la precisión.",
  },
  {
    Icon: RefreshCw,
    titulo: "Gratuito siempre",
    desc: "El acceso al benchmark es y será gratuito. Tu contribución tiene valor por sí sola.",
  },
];

export default function Home() {
  const scrolled = useScrolled();

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-outline-variant/30"
          : "bg-white border-b border-outline-variant/10"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xs font-bold tracking-[0.12em] uppercase text-primary">
            RemuneraLab
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="/empresas"
              className="hidden sm:block text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Para empresas
            </a>
            <a
              href="/formulario"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-all duration-200"
            >
              Comenzar <ArrowRight size={13} />
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="pt-40 pb-24 border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div className="flex flex-col gap-8">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant"
              >
                Benchmark salarial · Chile 2025
              </motion.p>

              <div className="border-l-2 border-primary pl-6">
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: E, delay: 0.07 }}
                  className="text-5xl sm:text-6xl lg:text-[4.25rem] font-bold text-primary leading-[1.03] tracking-tight"
                >
                  ¿Estás ganando<br />lo que mereces?
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: E, delay: 0.15 }}
                className="text-base text-on-surface-variant leading-relaxed max-w-sm"
              >
                En 2 minutos sabes exactamente en qué posición del mercado laboral chileno estás.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E, delay: 0.22 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                <a
                  href="/formulario"
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded hover:bg-primary/90 transition-colors"
                >
                  Descubre tu posición <ArrowRight size={15} />
                </a>
                <p className="text-xs text-on-surface-variant tracking-wide">
                  Sin registro · Sin email · Gratis
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E, delay: 0.2 }}
            >
              <PercentilViz />
            </motion.div>
          </div>
        </section>

        {/* ── Stats band ──────────────────────────────────────────────── */}
        <section className="bg-surface border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-3 divide-x divide-outline-variant/20">
              {[
                { value: <CountUp target={106} suffix="+" />, label: "Salarios registrados" },
                { value: "100%",    label: "Anónimo · sin email" },
                { value: "Gratis",  label: "Siempre, sin excepciones" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center py-8 px-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">{s.value}</p>
                  <p className="text-xs text-on-surface-variant mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ───────────────────────────────────────────── */}
        <section className="py-24 border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-12"
            >
              Cómo funciona
            </motion.p>
            <div>
              {PASOS.map((paso, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: E, delay: i * 0.1 }}
                  className="flex items-start gap-8 sm:gap-14 py-10 border-t border-outline-variant/20 group"
                >
                  <span className="text-5xl sm:text-6xl font-bold text-outline-variant/25 leading-none select-none tabular-nums w-16 sm:w-20 shrink-0 pt-1">
                    {paso.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">{paso.titulo}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{paso.desc}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-outline-variant/30 mt-2 shrink-0 transition-all group-hover:text-primary group-hover:translate-x-1"
                  />
                </motion.div>
              ))}
              <div className="border-t border-outline-variant/20" />
            </div>
          </div>
        </section>

        {/* ── Por qué confiar ─────────────────────────────────────────── */}
        <section className="py-24 bg-surface border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-12"
            >
              Por qué confiar
            </motion.p>
            <div className="grid md:grid-cols-3 gap-px bg-outline-variant/15">
              {PILARES.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: E, delay: i * 0.08 }}
                  className="bg-surface p-8 flex flex-col gap-5"
                >
                  <p.Icon size={18} className="text-secondary" />
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2">{p.titulo}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Para empresas ───────────────────────────────────────────── */}
        <section className="border-b border-outline-variant/20">
          <motion.a
            href="/empresas"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: E }}
            className="flex items-center justify-between gap-6 max-w-7xl mx-auto px-6 py-10 group"
          >
            <div className="flex items-center gap-5">
              <Building2 size={20} className="text-secondary shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-0.5">
                  Para empresas
                </p>
                <p className="text-base font-semibold text-primary">
                  Diagnóstico de cumplimiento laboral y benchmark B2B sectorial
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-outline-variant shrink-0 transition-all group-hover:text-primary group-hover:translate-x-1"
            />
          </motion.a>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="bg-primary py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-container mb-8">
                Transparencia salarial · Chile
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                Cada dato que compartes<br />hace el mercado más justo.
              </h2>
            </motion.div>
            <motion.a
              href="/formulario"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white text-primary text-sm font-semibold px-6 py-3 rounded hover:bg-surface transition-colors shrink-0"
            >
              Empezar análisis gratuito <ArrowRight size={15} />
            </motion.a>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-primary border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white mb-1">
              RemuneraLab
            </p>
            <p className="text-xs text-on-primary-container">
              Inteligencia salarial para Chile. Tus datos son anónimos y nunca se venderán.
            </p>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/empresas" className="text-xs text-on-primary-container hover:text-white transition-colors">
              Para empresas
            </a>
            <a href="/formulario" className="text-xs text-on-primary-container hover:text-white transition-colors">
              Benchmark
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
