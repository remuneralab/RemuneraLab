"use client";

import { motion } from "motion/react";
import {
  TrendingDown, BarChart2, Zap, Scale,
  ArrowRight, ChevronRight,
} from "lucide-react";
import TabNav from "../TabNav";

const E = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    id: "rotacion",
    color: "#F97316",
    bg: "rgba(249,115,22,0.07)",
    border: "rgba(249,115,22,0.18)",
    borderHover: "rgba(249,115,22,0.35)",
    Icon: TrendingDown,
    badge: "Costo Rotacional",
    metrica: "1.5×",
    metricaLabel: "el sueldo anual en costos de reemplazo",
    titulo: "Perder un colaborador cuesta más de lo que parece",
    descripcion:
      "Cada vez que un cargo se va, la empresa gasta entre el 50% y 200% del salario anual de esa persona en búsqueda, selección, inducción y productividad perdida. Detectar el riesgo antes de que ocurra es clave.",
    bullets: [
      { label: "Costo promedio en sector salud",     valor: "$4.2M CLP por cargo" },
      { label: "Costo promedio en sector finanzas",  valor: "$5.8M CLP por cargo" },
      { label: "Tiempo para cubrir un cargo clave",  valor: "45–90 días hábiles" },
    ],
    href: "/empresas/casos",
    cta: "Ver casos de ROI real",
  },
  {
    id: "bandas",
    color: "#00B4D8",
    bg: "rgba(0,180,216,0.07)",
    border: "rgba(0,180,216,0.18)",
    borderHover: "rgba(0,180,216,0.35)",
    Icon: BarChart2,
    badge: "Bandas Salariales",
    metrica: "−19%",
    metricaLabel: "bajo el mercado en cargos críticos",
    titulo: "¿Tus sueldos están donde el mercado manda?",
    descripcion:
      "Comparamos tus bandas salariales contra datos reales del mercado chileno. Un cargo fuera de rango es una alerta temprana: el talento empieza a buscar alternativas mucho antes de renunciar.",
    bullets: [
      { label: "Cargo más afectado en salud",    valor: "TENS UCI: −21% vs. mercado" },
      { label: "Cargo más afectado en finanzas", valor: "Analista Senior: −18%" },
      { label: "Rango óptimo para retener",      valor: "Percentil 60 – 75 del mercado" },
    ],
    href: "/empresas/salud",
    cta: "Ver análisis sector salud",
  },
  {
    id: "presion",
    color: "#2EC4B6",
    bg: "rgba(46,196,182,0.07)",
    border: "rgba(46,196,182,0.18)",
    borderHover: "rgba(46,196,182,0.35)",
    Icon: Zap,
    badge: "Presión de Mercado",
    metrica: "3×",
    metricaLabel: "más competencia por los mismos perfiles TI",
    titulo: "Tu competencia ya está buscando tu talento",
    descripcion:
      "Cuando muchas empresas compiten por los mismos perfiles, los sueldos suben y los procesos de selección se alargan. Saber esto a tiempo te permite actuar antes de perder a alguien clave.",
    bullets: [
      { label: "Cargos con alta presión en tecnología", valor: "7 de cada 10" },
      { label: "Aumento de avisos en finanzas",         valor: "+42% en 6 meses" },
      { label: "Demora promedio para llenar un cargo TI", valor: "68 días hábiles" },
    ],
    href: "/empresas/tecnologia",
    cta: "Ver presión en tecnología",
  },
  {
    id: "legal",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.18)",
    borderHover: "rgba(167,139,250,0.35)",
    Icon: Scale,
    badge: "Cumplimiento Legal",
    metrica: "3",
    metricaLabel: "normativas laborales activas en Chile",
    titulo: "Hay leyes nuevas que ya rigen para tu empresa",
    descripcion:
      "Chile actualizó sus leyes laborales en 2024. No cumplirlas expone a la empresa a multas, denuncias ante la Dirección del Trabajo y daño reputacional que impacta directamente en la atracción de talento.",
    bullets: [
      { label: "Ley Karin (N°21.643)",           valor: "Vigente desde agosto 2024" },
      { label: "Ley de Transparencia Salarial",  valor: "Aplica desde 100 trabajadores" },
      { label: "Reducción de jornada a 40 horas", valor: "Progresiva hasta 2028" },
    ],
    href: "/empresas/finanzas",
    cta: "Ver cumplimiento en finanzas",
  },
] as const;

export default function ResumenEmpresasPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-x-hidden">

      {/* Background glows */}
      <div
        className="pointer-events-none fixed -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,180,216,0.12) 0%,transparent 65%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(46,196,182,0.08) 0%,transparent 65%)" }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,216,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.04) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/8"
        style={{ background: "rgba(13,34,64,0.88)", backdropFilter: "blur(14px)" }}
      >
        <div className="flex justify-between items-center max-w-7xl w-full px-6 h-16 mx-auto">
          <a
            href="/"
            className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors"
            style={{ fontSize: "1.4rem" }}
          >
            RemuneraLab
          </a>
          <nav className="flex items-center gap-3">
            <TabNav active="resumen" />
            <a
              href="/empresas#contacto"
              className="inline-flex items-center gap-1.5 text-sm border border-[#00B4D8]/40 text-[#00B4D8] px-4 py-1.5 rounded hover:bg-[#00B4D8]/10 transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Solicitar demo
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">

        {/* Hero */}
        <section className="pt-14 pb-10 border-b border-white/8">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
            >
              <p
                style={{
                  fontFamily: "var(--font-space-mono)",
                  fontSize: "0.6rem",
                  color: "#00B4D8",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Panel de diagnóstico · Demos empresas
              </p>
              <h1
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-dm-sans)", maxWidth: "640px" }}
              >
                Los 4 indicadores que más impactan la gestión de personas
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "1rem",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "14px",
                  maxWidth: "560px",
                  lineHeight: "1.7",
                }}
              >
                Un diagnóstico rápido de lo más importante. Haz clic en cualquier tarjeta para
                ver el análisis detallado con datos reales de cada sector.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Cards 2×2 */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {CARDS.map((card, i) => (
                <motion.a
                  key={card.id}
                  href={card.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: E, delay: 0.1 + i * 0.09 }}
                  className="relative rounded-2xl p-7 flex flex-col gap-5 group overflow-hidden"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    transition: "border-color 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = card.borderHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = card.border;
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: `linear-gradient(to right, ${card.color}, transparent 70%)` }}
                  />

                  {/* Corner glow */}
                  <div
                    className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-15"
                    style={{ background: `radial-gradient(circle, ${card.color} 0%, transparent 70%)` }}
                  />

                  {/* Badge row */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}
                      >
                        <card.Icon size={16} style={{ color: card.color }} />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-space-mono)",
                          fontSize: "0.55rem",
                          color: card.color,
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                        }}
                      >
                        {card.badge}
                      </span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                      style={{ color: card.color }}
                    />
                  </div>

                  {/* Big metric */}
                  <div className="relative z-10">
                    <div
                      className="tabular-nums"
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize: "3.25rem",
                        fontWeight: 700,
                        color: card.color,
                        lineHeight: 1,
                      }}
                    >
                      {card.metrica}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.38)",
                        marginTop: "5px",
                      }}
                    >
                      {card.metricaLabel}
                    </div>
                  </div>

                  {/* Title + Description */}
                  <div className="relative z-10">
                    <h2
                      className="font-bold text-white"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.08rem", lineHeight: 1.35 }}
                    >
                      {card.titulo}
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.83rem",
                        color: "rgba(255,255,255,0.48)",
                        marginTop: "8px",
                        lineHeight: "1.65",
                      }}
                    >
                      {card.descripcion}
                    </p>
                  </div>

                  {/* Bullets */}
                  <div
                    className="relative z-10 flex flex-col gap-2.5 pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {card.bullets.map((b, j) => (
                      <div key={j} className="flex items-center justify-between gap-4">
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.38)",
                            lineHeight: 1.5,
                          }}
                        >
                          {b.label}
                        </span>
                        <span
                          className="shrink-0 font-semibold"
                          style={{
                            fontFamily: "var(--font-space-mono)",
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.82)",
                          }}
                        >
                          {b.valor}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="relative z-10 mt-auto pt-2">
                    <span
                      className="inline-flex items-center gap-1.5 font-semibold transition-all duration-200 group-hover:gap-2.5"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: card.color }}
                    >
                      {card.cta} <ChevronRight size={14} />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-white font-bold text-lg"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                ¿Quieres ver este diagnóstico con los datos reales de tu empresa?
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "4px",
                }}
              >
                Sube tu nómina y obtén el análisis en minutos. Sin esperas, sin intermediarios.
              </p>
            </div>
            <a
              href="/empresas#contacto"
              className="shrink-0 inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "#00B4D8", color: "#0D2240", fontFamily: "var(--font-dm-sans)" }}
            >
              Solicitar demo <ArrowRight size={15} />
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/8 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif-display italic text-white mb-1" style={{ fontSize: "1.2rem" }}>
              RemuneraLab
            </p>
            <p className="text-white/35" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
              Inteligencia salarial para Chile.
            </p>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="/"
              className="text-white/35 hover:text-white/60 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}
            >
              Para trabajadores
            </a>
            <a
              href="/empresas"
              className="text-white/35 hover:text-white/60 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}
            >
              Vista general
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
