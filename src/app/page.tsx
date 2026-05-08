"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Sparkles,
  ShieldCheck,
  Scale,
  TrendingUp,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl w-full px-6 py-4 mx-auto">
          <span className="text-2xl font-bold tracking-tight text-primary">RemuneraLab</span>
          <a
            href="/formulario"
            className="hidden sm:block bg-primary text-on-primary font-bold px-6 py-2 rounded-lg hover:opacity-90 transition-all text-sm shadow-sm"
          >
            Descubre tu percentil
          </a>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative pt-20 pb-20 overflow-hidden bg-gradient-to-b from-surface to-white">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start gap-8"
            >
              <div className="inline-flex items-center gap-2 bg-secondary-container/30 px-4 py-1 rounded-full border border-secondary-container/50">
                <Sparkles size={16} className="text-secondary" />
                <span className="text-[11px] font-semibold text-on-secondary-container tracking-wider uppercase">
                  Benchmark salarial — Chile 2025
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-primary leading-tight">
                ¿Estás ganando lo que mereces?
              </h1>
              <p className="text-lg text-on-surface-variant max-w-lg">
                En 2 minutos sabes en qué percentil del mercado laboral chileno estás,
                según tu cargo, industria y experiencia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <a
                  href="/formulario"
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center"
                >
                  Descubre tu posición salarial
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card rounded-2xl p-8 shadow-2xl relative z-10 border border-white/50">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Análisis de ejemplo
                    </p>
                    <h3 className="text-xl font-bold text-primary">Desarrollador Senior</h3>
                  </div>
                  <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1 rounded-full text-xs font-bold">
                    Percentil 78
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[78%] rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-surface p-2 sm:p-4 rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">P50</p>
                      <p className="text-lg font-bold text-primary">$3.1M</p>
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <TrendingUp size={10} /> Tecnología
                      </span>
                    </div>
                    <div className="bg-surface p-2 sm:p-4 rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">P75</p>
                      <p className="text-lg font-bold text-primary">$4.2M</p>
                      <span className="text-[10px] text-secondary font-medium">Stgo.</span>
                    </div>
                    <div className="bg-surface p-2 sm:p-4 rounded-lg border border-outline-variant/30">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Confianza</p>
                      <p className="text-lg font-bold text-primary">Alta</p>
                      <span className="text-[10px] text-on-tertiary-container font-medium">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-container/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </section>

        {/* Features bento grid */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase mb-2 block">
                Capacidades
              </span>
              <h2 className="text-3xl font-bold text-primary">
                Inteligencia diseñada para el mercado de Chile
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 glass-card rounded-2xl p-8 border border-outline-variant/30 flex flex-col justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <BarChart3 className="text-primary mb-4" size={32} />
                  <h3 className="text-2xl font-bold text-primary mb-4">Benchmarking en Tiempo Real</h3>
                  <p className="text-on-surface-variant max-w-md">
                    Compara tu salario contra datos reales del mercado chileno filtrados por
                    cargo, industria, experiencia y región.
                  </p>
                </div>
                <div className="mt-12 h-40 w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-center">
                  <BarChart3 size={64} className="text-blue-200" />
                </div>
              </div>

              <div className="md:col-span-4 bg-primary rounded-2xl p-8 flex flex-col justify-between text-on-primary">
                <div>
                  <Sparkles className="text-secondary-container mb-4" size={32} />
                  <h3 className="text-2xl font-bold mb-4">Percentil exacto</h3>
                  <p className="text-on-primary-container text-sm">
                    Calculamos tu posición exacta en el mercado usando percentiles P25, P50 y P75
                    ajustados a tu perfil.
                  </p>
                </div>
                <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10 italic text-sm opacity-80">
                  "Tu perfil supera al 78% de desarrolladores en Santiago."
                </div>
              </div>

              <div className="md:col-span-5 glass-card rounded-2xl p-8 border border-outline-variant/30">
                <ShieldCheck className="text-primary mb-4" size={32} />
                <h3 className="text-xl font-bold text-primary mb-4">100% Anónimo</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  No pedimos email ni registro. Tus datos se agregan al benchmark
                  colectivo sin nunca identificarte.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <span className="px-3 py-1 bg-surface-container rounded-full">Sin registro</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full">Sin email</span>
                  <span className="px-3 py-1 bg-surface-container rounded-full">100% gratuito</span>
                </div>
              </div>

              <div className="md:col-span-7 bg-secondary-container/30 rounded-2xl p-8 flex items-center gap-8 border border-secondary-container/50">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary mb-4">Datos que mejoran solos</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Cada vez que alguien completa el formulario, el benchmark se vuelve más preciso
                    para todos. Tú contribuyes y recibes al mismo tiempo.
                  </p>
                </div>
                <div className="w-24 h-24 flex items-center justify-center bg-secondary/10 rounded-full shrink-0">
                  <Scale size={48} className="text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-primary text-center mb-20">
              Tu camino hacia la transparencia
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { step: "01", title: "Ingresa tu rol", desc: "Describe tu cargo, experiencia y región en Chile de forma 100% anónima." },
                { step: "02", title: "Comparte tu rango", desc: "Selecciona el rango salarial que corresponde a tu situación actual." },
                { step: "03", title: "Accede al resultado", desc: "Ve tu percentil exacto, el rango del mercado y qué tan confiable es el dato.", highlight: true },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-sm border border-outline-variant/30 ${item.highlight ? "bg-primary text-on-primary" : "bg-white text-primary"}`}>
                    {item.highlight ? <CheckCircle2 /> : item.step}
                  </div>
                  <h4 className="text-lg font-bold text-primary mb-3">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto bg-primary-container rounded-[2.5rem] p-8 sm:p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-end justify-end">
              <LayoutDashboard size={400} className="text-white -mb-24 -mr-24 rotate-12" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 relative z-10">
              Únete a la transparencia salarial
            </h2>
            <p className="text-on-primary-container text-lg max-w-xl mx-auto mb-10 relative z-10">
              Cada dato que compartes hace el mercado más justo para todos los profesionales en Chile.
            </p>
            <a
              href="/formulario"
              className="inline-block bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:bg-surface transition-all relative z-10 shadow-2xl"
            >
              Empezar análisis gratuito
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant/20 py-12 px-6 mt-0">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-on-surface-variant text-center">
            RemuneraLab — Inteligencia salarial para Chile. Tus datos son anónimos y nunca se venderán.
          </p>
        </div>
      </footer>
    </div>
  );
}
