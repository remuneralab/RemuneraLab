"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Building2,
  ArrowRight,
  Sparkles,
  Scale,
  Mail,
  Heart,
  HardHat,
  Globe,
} from "lucide-react";
import ChartsMercado from "./ChartsMercado";
import InsightsB2B from "./InsightsB2B";
import TabNav from "./TabNav";

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

const BENEFICIOS = [
  {
    icon: BarChart3,
    title: "Benchmark por cargo",
    desc: "Compara cada rol de tu equipo contra los percentiles P25, P50 y P75 del mercado chileno real.",
  },
  {
    icon: Scale,
    title: "Equidad salarial",
    desc: "Identifica si hay brechas entre lo que paga tu empresa y el mercado. Actúa antes de perder talento.",
  },
  {
    icon: TrendingUp,
    title: "Datos actualizados",
    desc: "Nuestro benchmark se actualiza continuamente con contribuciones anónimas reales del mercado.",
  },
];

const PASOS = [
  {
    num: "01",
    title: "Comparte tus cargos",
    desc: "Indícanos los roles que quieres analizar: cargo, industria, región y experiencia típica.",
  },
  {
    num: "02",
    title: "Recibe tu análisis",
    desc: "Te entregamos un reporte con el posicionamiento de cada cargo vs el mercado chileno.",
  },
  {
    num: "03",
    title: "Toma decisiones",
    desc: "Usa los datos para ajustar bandas salariales, retener talento y competir con evidencia.",
  },
];

const SECTORES = [
  {
    href: "/empresas/salud",
    Icon: Heart,
    label: "Salud",
    sub: "Ley Karin · cumplimiento",
    accent: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100 hover:border-red-300",
  },
  {
    href: "/empresas/finanzas",
    Icon: BarChart3,
    label: "Finanzas",
    sub: "Ley Transparencia · brechas",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100 hover:border-emerald-300",
  },
  {
    href: "/empresas/mineria",
    Icon: HardHat,
    label: "Minería",
    sub: "Ley 20.123 · turnos",
    accent: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100 hover:border-amber-300",
  },
  {
    href: "/empresas/turismo",
    Icon: Globe,
    label: "Turismo",
    sub: "Ley 20.803 · propinas",
    accent: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100 hover:border-sky-300",
  },
];

export default function EmpresasPage() {
  const scrolled = useScrolled();
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", cargo: "" });
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[RemuneraLab Empresas] Solicitud de demo — ${form.empresa}`);
    const body = encodeURIComponent(
      `Nombre: ${form.nombre}\nEmpresa: ${form.empresa}\nCargo: ${form.cargo}\nEmail: ${form.email}`
    );
    window.location.href = `mailto:andreschile111@gmail.com?subject=${subject}&body=${body}`;
    setEnviado(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-outline-variant/30"
          : "bg-white border-b border-outline-variant/10"
      }`}>
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a href="/" className="text-xs font-bold tracking-[0.12em] uppercase text-primary">RemuneraLab</a>
          <nav className="flex items-center gap-3">
            <TabNav active="general" />
            <a
              href="#contacto"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              Solicitar demo
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">

        {/* Hero */}
        <section className="pt-20 pb-20 border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">

            <div className="flex flex-col gap-8">
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant"
              >
                Para equipos de RRHH y líderes
              </motion.p>

              <div className="border-l-2 border-primary pl-6">
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease: E, delay: 0.07 }}
                  className="text-4xl sm:text-5xl font-bold text-primary leading-tight tracking-tight"
                >
                  Toma decisiones salariales con datos reales
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: E, delay: 0.15 }}
                className="text-base text-on-surface-variant leading-relaxed max-w-sm"
              >
                Compara los sueldos de tu equipo contra el mercado chileno real, por cargo,
                industria y región. Sin supuestos, sin encuestas caras.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: E, delay: 0.22 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
              >
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded hover:bg-primary/90 transition-colors"
                >
                  Solicitar demo gratuita <ArrowRight size={15} />
                </a>
                <p className="text-xs text-on-surface-variant">
                  Sin costo · Mercado chileno · Datos anónimos
                </p>
              </motion.div>
            </div>

            {/* Mock dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E, delay: 0.2 }}
              className="border border-outline-variant/40 rounded-lg p-6 sm:p-8 bg-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Análisis de equipo — ejemplo
                  </p>
                  <h3 className="text-base font-bold text-primary">Industria Tecnología · Santiago</h3>
                </div>
                <Sparkles size={18} className="text-secondary" />
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { cargo: "Dev Backend",     percentil: 72, salario: "$2.8M", color: "bg-emerald-400" },
                  { cargo: "Product Manager", percentil: 45, salario: "$3.1M", color: "bg-yellow-400"  },
                  { cargo: "UX Designer",     percentil: 28, salario: "$1.9M", color: "bg-red-400"     },
                ].map((row) => (
                  <div key={row.cargo} className="flex items-center gap-3">
                    <span className="text-xs text-on-surface-variant w-32 shrink-0">{row.cargo}</span>
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.percentil}%` }} />
                    </div>
                    <span className="text-xs font-bold text-primary w-10 text-right">P{row.percentil}</span>
                    <span className="text-xs text-on-surface-variant w-14 text-right">{row.salario}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-outline-variant/20">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Bajo P25</p>
                  <p className="text-xl font-bold text-red-500">1</p>
                  <p className="text-[10px] text-on-surface-variant">cargo</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">En mercado</p>
                  <p className="text-xl font-bold text-yellow-500">1</p>
                  <p className="text-[10px] text-on-surface-variant">cargo</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sobre P50</p>
                  <p className="text-xl font-bold text-emerald-500">1</p>
                  <p className="text-[10px] text-on-surface-variant">cargo</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats band */}
        <section className="bg-surface border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-outline-variant/20">
              {[
                { num: "106+", label: "Registros salariales" },
                { num: "8",    label: "Industrias cubiertas" },
                { num: "16",   label: "Regiones de Chile"   },
                { num: "100%", label: "Anónimo y gratuito"  },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center py-8 px-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">{s.num}</p>
                  <p className="text-xs text-on-surface-variant mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sectores */}
        <section className="py-16 border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-8"
            >
              Análisis sectorial
            </motion.p>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Elige el sector de tu empresa
            </h2>
            <p className="text-sm text-on-surface-variant mb-10">
              Benchmarks, cumplimiento legal y casos reales adaptados a cada industria.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SECTORES.map((s, i) => (
                <motion.a
                  key={s.href}
                  href={s.href}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: E, delay: i * 0.07 }}
                  className={`group flex flex-col items-center gap-3 border ${s.border} ${s.bg} rounded-lg p-6 transition-all text-center`}
                >
                  <s.Icon size={28} className={s.accent} />
                  <div>
                    <p className={`font-bold text-base ${s.accent}`}>{s.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{s.sub}</p>
                  </div>
                  <ArrowRight size={14} className={`${s.accent} opacity-60 group-hover:translate-x-1 transition-transform`} />
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué RemuneraLab */}
        <section className="py-24 bg-surface border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-12"
            >
              Por qué RemuneraLab
            </motion.p>
            <div className="grid md:grid-cols-3 gap-px bg-outline-variant/15">
              {BENEFICIOS.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: E, delay: i * 0.08 }}
                  className="bg-surface p-8 flex flex-col gap-5"
                >
                  <b.icon size={18} className="text-secondary" />
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2">{b.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-24 border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-12"
            >
              Cómo funciona para tu empresa
            </motion.p>
            <div>
              {PASOS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: E, delay: i * 0.1 }}
                  className="flex items-start gap-8 sm:gap-14 py-10 border-t border-outline-variant/20 group"
                >
                  <span className="text-5xl sm:text-6xl font-bold text-outline-variant/25 leading-none select-none tabular-nums w-16 sm:w-20 shrink-0 pt-1">
                    {p.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-primary mb-2">{p.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
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

        <ChartsMercado />
        <InsightsB2B />

        {/* Formulario de contacto */}
        <section id="contacto" className="py-24 px-6 border-b border-outline-variant/20">
          <div className="max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-8"
            >
              Contacto
            </motion.p>
            <h2 className="text-3xl font-bold text-primary mb-3">
              Solicita tu demo gratuita
            </h2>
            <p className="text-on-surface-variant text-sm mb-10">
              Cuéntanos sobre tu empresa y te mostramos cómo RemuneraLab puede ayudarte
              a tomar mejores decisiones salariales.
            </p>

            {enviado ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-outline-variant/30 rounded-lg p-12 text-center"
              >
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary mb-2">¡Solicitud enviada!</h3>
                <p className="text-on-surface-variant text-sm">
                  Te contactaremos pronto para coordinar tu demo gratuita.
                </p>
                <a href="/" className="inline-block mt-6 text-sm text-secondary hover:underline">
                  Volver al inicio
                </a>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="border border-outline-variant/30 rounded-lg p-8 flex flex-col gap-5 bg-white"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="px-4 py-3 rounded border border-outline-variant/50 bg-white text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Empresa
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre de tu empresa"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="px-4 py-3 rounded border border-outline-variant/50 bg-white text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Tu cargo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: RRHH Manager"
                      value={form.cargo}
                      onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                      className="px-4 py-3 rounded border border-outline-variant/50 bg-white text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@empresa.cl"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="px-4 py-3 rounded border border-outline-variant/50 bg-white text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded font-semibold text-sm hover:bg-primary/90 transition-colors mt-2"
                >
                  <Mail size={16} /> Solicitar demo gratuita
                </button>
                <p className="text-[11px] text-on-surface-variant text-center">
                  Sin compromiso. Te respondemos en menos de 24 horas.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-primary py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-primary-container mb-8">
                Inteligencia salarial · Chile
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight max-w-lg">
                Cada decisión salarial<br />debería tener datos detrás.
              </h2>
            </motion.div>
            <motion.a
              href="#contacto"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: E, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white text-primary text-sm font-semibold px-6 py-3 rounded hover:bg-surface transition-colors shrink-0"
            >
              Solicitar demo gratuita <ArrowRight size={15} />
            </motion.a>
          </div>
        </section>
      </main>

      {/* Footer */}
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
            <a href="/" className="text-xs text-on-primary-container hover:text-white transition-colors">Para trabajadores</a>
            <a href="/formulario" className="text-xs text-on-primary-container hover:text-white transition-colors">Contribuir datos</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
