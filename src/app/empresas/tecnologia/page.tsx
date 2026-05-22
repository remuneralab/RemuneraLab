"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  Code2, AlertTriangle, TrendingDown, MapPin, Users,
  Bell, ArrowLeft, ArrowRight, ChevronRight, CheckCircle2, ExternalLink,
  Building2, Clock,
} from "lucide-react";
import TabNav from "../TabNav";

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

function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  const decimals = to % 1 !== 0 ? 1 : 0;
  useEffect(() => {
    if (!inView || !ref.current) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - (1 - p) ** 3;
      if (ref.current) ref.current.textContent = (ease * to).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, duration, decimals]);
  return <span ref={ref}>0</span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EMPRESA = {
  nombre: "Soluciones Digitales Pacífico SpA",
  ciudad: "Santiago, Región Metropolitana",
  empleados: 68,
  tipo: "SaaS B2B · Fintech",
  riesgo: 72,
};

type GapLevel = "CRÍTICO" | "ALTO" | "MODERADO";

const ROLES: {
  cargo: string; cantidad: number;
  actual: number; mercado: number;
  gap: number; nivel: GapLevel;
}[] = [
  { cargo: "Desarrollador Full Stack Senior", cantidad: 5,  actual: 2800000, mercado: 3850000, gap: 27, nivel: "CRÍTICO"  },
  { cargo: "DevOps / SRE",                   cantidad: 3,  actual: 2600000, mercado: 3700000, gap: 30, nivel: "CRÍTICO"  },
  { cargo: "Product Manager",                cantidad: 3,  actual: 2200000, mercado: 3000000, gap: 27, nivel: "ALTO"     },
  { cargo: "Mid Full Stack Developer",        cantidad: 9,  actual: 1950000, mercado: 2700000, gap: 28, nivel: "ALTO"     },
  { cargo: "UX / UI Designer",               cantidad: 3,  actual: 1600000, mercado: 2100000, gap: 24, nivel: "ALTO"     },
  { cargo: "QA Engineer",                    cantidad: 4,  actual: 1400000, mercado: 1800000, gap: 22, nivel: "MODERADO" },
  { cargo: "Desarrollador Junior",           cantidad: 7,  actual: 1100000, mercado: 1350000, gap: 19, nivel: "MODERADO" },
];

const TIMELINE = [
  {
    mes: "Enero 2023",
    evento: "Andrés V. (Senior, 4 años) recibe oferta de empresa remote-first de EE.UU. por $5.200.000. Solicita contraoferta. RRHH responde que el salario \"está sobre el mercado\".",
    impacto: "Señal ignorada",
    color: "bg-orange-400",
  },
  {
    mes: "Marzo 2023",
    evento: "Andrés V. renuncia. La empresa abre proceso de búsqueda urgente. La reclutadora cobra $1.800.000. El candidato que entra tarda 4 meses en producir al mismo nivel.",
    impacto: "$18.000.000 en costos directos e indirectos",
    color: "bg-red-500",
  },
  {
    mes: "Junio 2023",
    evento: "María L. (DevOps lead, infraestructura crítica) se incorpora a Toptal. Cotizaba $4.800.000 remoto. Renuncia sin negociar — ya estaba decidida.",
    impacto: "$22.000.000 en costos y curva de aprendizaje",
    color: "bg-red-500",
  },
  {
    mes: "Agosto 2023",
    evento: "Carlos R., arquitecto del módulo de pagos, renuncia por oferta de $6.000.000 en empresa extranjera. El sistema de pagos no tiene documentación actualizada.",
    impacto: "El más costoso — $23.000.000 incluye consultora de recuperación",
    color: "bg-red-600",
  },
  {
    mes: "Sep – Nov 2023",
    evento: "La empresa contrata consultora externa para recuperar la arquitectura del módulo de pagos ($8.000.000). Tres proyectos se atrasan 4 meses. Un cliente enterprise evalúa alternativas.",
    impacto: "$8.000.000 + atrasos en roadmap",
    color: "bg-red-700",
  },
  {
    mes: "Diciembre 2023",
    evento: "El cliente enterprise cancela el contrato anual por los atrasos. Los 2 seniors restantes negocian aumento o amenazan con renunciar. La empresa sube a $3.500.000 — tarde.",
    impacto: "$12.000.000 en contrato perdido",
    color: "bg-red-800",
  },
];

const SIN_RL = [
  { label: "3 reposiciones Senior Full Stack (reclutadora + curva + prod. perdida)", monto: "$63.000.000" },
  { label: "Consultora recuperación módulo de pagos (arquitectura + docs)",          monto: "$8.000.000"  },
  { label: "Contrato enterprise cancelado por atrasos en entrega",                   monto: "$12.000.000" },
];

const CON_RL = [
  { label: "Ajuste 3 seniors at-risk × $600.000 extra/mes × 6 meses",  monto: "$10.800.000" },
  { label: "Suscripción RemuneraLab plan Growth",                       monto: "$2.268.000/año" },
];

const FUENTES = [
  {
    nombre: "Estudio de Remuneración TI 2024 — IT Hunter",
    uso: "Benchmarks salariales para perfiles tecnológicos en Chile. Fuente principal para rangos de Desarrollador Full Stack Senior ($3.850.000 promedio senior Santiago).",
    url: "https://www.it-hunter.cl/en/estudio-de-rentas-ti",
  },
  {
    nombre: "Estudio de Remuneración 2024–2025 — Michael Page Chile",
    uso: "Rangos salariales para desarrolladores, DevOps, Product Managers y perfiles digitales en el mercado chileno.",
    url: "https://www.michaelpage.cl/estudios-y-tendencias/estudio-de-remuneracion-2024-2025-1-MP-095",
  },
  {
    nombre: "Guía Laboral Chile 2025 — Hays Recruitment",
    uso: "Encuesta sobre compensaciones, trabajo remoto y tendencias de retención en el sector tecnología Chile (16.334 participantes).",
    url: "https://www.hays.cl/guia-laboral",
  },
  {
    nombre: "Estudio de Remuneración Global 2025 — Robert Walters Chile",
    uso: "Contexto de salarios IT en Chile y comparativa regional para perfiles tech especializados.",
    url: "https://www.robertwalters.cl/servicios/estudio-de-remuneracion-global.html",
  },
  {
    nombre: "Ley N° 21.220 — Trabajo a Distancia y Teletrabajo",
    uso: "Marco legal del teletrabajo en Chile. Obligaciones del empleador (equipamiento, gastos), derechos del trabajador y sanciones por incumplimiento.",
    url: "https://www.bcn.cl/leychile/navegar?idNorma=1143741",
  },
  {
    nombre: "Guía Teletrabajo — Dirección del Trabajo",
    uso: "Interpretación oficial de la Ley 21.220, obligaciones específicas y proceso de fiscalización.",
    url: "https://www.dt.gob.cl/portal/1626/w3-propertyvalue-179028.html",
  },
  {
    nombre: "Normativa SUSESO — Teletrabajo y Fiscalización",
    uso: "Estadísticas de inspecciones bajo Ley 21.220 y sanciones aplicadas al sector privado.",
    url: "https://www.suseso.cl/612/w3-propertyvalue-323154.html",
  },
  {
    nombre: "Developer Survey 2024 — Stack Overflow",
    uso: "Salarios y tendencias de trabajo remoto global. Contexto para la brecha entre salarios locales chilenos y ofertas de empresas extranjeras en modalidad remota.",
    url: "https://survey.stackoverflow.co/2024/",
  },
  {
    nombre: "ACTI — Asociación Chilena de Empresas de Tecnologías de la Información",
    uso: "Datos del sector TI en Chile: tamaño de la industria, perfil de empresas y tendencias de empleo tecnológico.",
    url: "https://acti.cl/",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtM(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

function gapStyle(nivel: GapLevel) {
  if (nivel === "CRÍTICO")  return { badge: "bg-red-900/20 text-red-400",       dot: "bg-red-500"    };
  if (nivel === "ALTO")     return { badge: "bg-orange-900/20 text-orange-400", dot: "bg-orange-500" };
  return                          { badge: "bg-yellow-900/20 text-yellow-400",  dot: "bg-yellow-500" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TecnologiaPage() {
  const scrolled = useScrolled();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-x-hidden">

      {/* Fixed glows */}
      <div
        className="pointer-events-none fixed -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,180,216,0.13) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(46,196,182,0.09) 0%, transparent 65%)" }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,216,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/12"
        style={{ background: "rgba(13,34,64,0.88)", backdropFilter: "blur(14px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors" style={{ fontSize: "1.4rem" }}>RemuneraLab</a>
          <TabNav active="tecnologia" />
        </div>
      </nav>

      <div className="pt-16">

        {/* ── Hero / Company Profile ─────────────────────────────────────── */}
        <div className="border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <a href="/empresas/resumen" className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors mb-6">
              <ArrowLeft size={13} /> Panel principal
            </a>
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <Code2 size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-widest">Tecnología · Análisis de mercado</span>
            </div>
            <div className="border-l-2 border-[#00B4D8] pl-6 mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-2">
                Este es el análisis que RemuneraLab habría generado para
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {EMPRESA.nombre}
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/45">
                <span className="flex items-center gap-1.5"><MapPin size={12} />{EMPRESA.ciudad}</span>
                <span className="flex items-center gap-1.5"><Users size={12} />{EMPRESA.empleados} empleados</span>
                <span className="flex items-center gap-1.5"><Building2 size={12} />{EMPRESA.tipo}</span>
              </div>
            </div>

            {/* Risk + KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Risk score */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: E }}
                className="sm:col-span-1 rounded-xl border border-white/10 bg-white/4 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-3">
                  Riesgo de rotación
                </p>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-bold text-red-500">{EMPRESA.riesgo}</span>
                  <span className="text-white/45 mb-1">/ 100</span>
                </div>
                <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${EMPRESA.riesgo}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: E }}
                  />
                </div>
                <p className="text-xs text-red-400 font-semibold mt-2">ALTO · Requiere atención inmediata</p>
              </motion.div>

              {/* KPIs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: E }}
                className="sm:col-span-2 grid grid-cols-3 divide-x divide-white/8 rounded-xl border border-white/10 bg-white/4 overflow-hidden"
              >
                {[
                  { valor: "5",    label: "Cargos críticos",    sub: "con riesgo CRÍTICO o ALTO" },
                  { valor: "−27%", label: "Gap promedio",       sub: "en roles senior vs mercado" },
                  { valor: "$83M", label: "Exposición total",   sub: "si los seniors se van" },
                ].map((k, i) => (
                  <div key={i} className="p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-indigo-400">{k.valor}</div>
                    <div className="text-xs font-medium text-white mt-0.5">{k.label}</div>
                    <div className="text-xs text-white/45">{k.sub}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Mapa Salarial ─────────────────────────────────────────────── */}
        <div className="border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold text-white mb-1">Tu mapa salarial vs mercado</h2>
              <p className="text-sm text-white/45">
                Datos cruzados con IT Hunter, Michael Page y Hays Chile 2024–2025.
                Mercado P50 corresponde a Santiago, Región Metropolitana.
              </p>
            </motion.div>

            {/* Desktop table header */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_90px] gap-x-4 px-4 mb-2">
              {["Cargo", "Salario actual", "Mercado P50", "Gap", "Alerta"].map((h) => (
                <span key={h} className="text-xs font-semibold uppercase tracking-wider text-white/45">{h}</span>
              ))}
            </div>

            <div className="space-y-2">
              {ROLES.map((r, i) => {
                const style = gapStyle(r.nivel);
                return (
                  <motion.div
                    key={r.cargo}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05, ease: E }}
                    viewport={{ once: true }}
                    className="rounded-xl border border-white/10 bg-white/4 px-4 py-3"
                  >
                    {/* Desktop */}
                    <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_90px] gap-x-4 items-center">
                      <div>
                        <span className="text-sm font-medium text-white">{r.cargo}</span>
                        <span className="ml-2 text-xs text-white/45">× {r.cantidad}</span>
                      </div>
                      <span className="font-mono text-sm text-white">{fmtM(r.actual)}</span>
                      <span className="font-mono text-sm text-[#06D6A0]">{fmtM(r.mercado)}</span>
                      <span className="font-mono text-sm font-semibold text-red-500">−{r.gap}%</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${style.badge}`}>
                        {r.nivel}
                      </span>
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-white">{r.cargo} <span className="text-white/45">× {r.cantidad}</span></span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>{r.nivel}</span>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className="text-white/45">Actual: <span className="font-mono font-semibold text-white">{fmtM(r.actual)}</span></span>
                        <span className="text-white/45">Mercado: <span className="font-mono font-semibold text-[#06D6A0]">{fmtM(r.mercado)}</span></span>
                        <span className="font-mono font-semibold text-red-500">−{r.gap}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Alerta que no llegó ───────────────────────────────────────── */}
        <div className="border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">La alerta que nunca llegó</h2>
              <p className="text-sm text-white/45 max-w-xl">
                Esto es lo que RemuneraLab habría enviado en enero de 2023 — seis meses antes de la primera renuncia.
              </p>
            </motion.div>

            {/* Notification mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: E }}
              viewport={{ once: true }}
              className="max-w-xl border border-indigo-500/25 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Notification header — keep colored bg as-is */}
              <div className="bg-indigo-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-white" />
                  <span className="text-sm font-semibold text-white">RemuneraLab · Alerta de mercado</span>
                </div>
                <span className="text-xs text-white/70">Lunes, 15 ene 2023 · 09:14</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-5">
                {/* Alert type */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
                    Desalineamiento salarial crítico detectado
                  </span>
                </div>

                {/* Cargo + empresa */}
                <div className="mb-5">
                  <p className="text-base font-bold text-white">Desarrollador Full Stack Senior</p>
                  <p className="text-sm text-white/45">{EMPRESA.nombre} · Santiago</p>
                </div>

                {/* Percentile visualization */}
                <div className="mb-5 p-4 bg-white/6 rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-4">
                    Posición en el mercado
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-white/45 mb-1">
                        <span>Julio 2022</span>
                        <span className="font-semibold text-[#06D6A0]">Percentil 55</span>
                      </div>
                      <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-white/45 mb-1">
                        <span>Enero 2023 — hoy</span>
                        <span className="font-semibold text-red-400">Percentil 29</span>
                      </div>
                      <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: "29%" }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white/45 mt-3 flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-red-500" />
                    El mercado remoto para este perfil subió 38% en 2022. Tu banda salarial no se movió.
                  </p>
                </div>

                {/* Message */}
                <p className="text-sm text-white/45 mb-4 leading-relaxed">
                  Hay 3 plataformas de trabajo remoto activamente reclutando este perfil en Santiago con ofertas entre
                  <strong className="text-white"> $4.200.000 y $5.800.000</strong>. Tu equipo senior está expuesto.
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Ver análisis completo <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-white/45 hover:text-white">
                    Recordar en 30 días
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Timeline sin RL ───────────────────────────────────────────── */}
        <div className="border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">Lo que ocurrió sin RemuneraLab</h2>
              <p className="text-sm text-white/45">12 meses de pérdidas que empezaron con una señal que nadie vio.</p>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] sm:left-[11px] top-2 bottom-2 w-px bg-white/10" />

              <div className="space-y-6">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: E }}
                    viewport={{ once: true }}
                    className="flex gap-4 sm:gap-6"
                  >
                    <div className="shrink-0 pt-1">
                      <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full ${item.color} ring-2 ring-[#0D2240]`} />
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={11} className="text-white/45" />
                        <span className="text-xs font-semibold text-white/45 uppercase tracking-wide">{item.mes}</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed mb-1.5">{item.evento}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-900/12 px-2 py-0.5 rounded">
                        <AlertTriangle size={10} />
                        {item.impacto}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Comparativa de costos ─────────────────────────────────────── */}
        <div className="border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-1">El costo de saber vs no saber</h2>
              <p className="text-sm text-white/45">La diferencia entre actuar en enero y reaccionar en diciembre.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Sin RL */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: E }}
                viewport={{ once: true }}
                className="bg-white/4 border border-white/10 rounded-lg p-5"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm font-semibold text-white">Sin RemuneraLab</span>
                </div>
                <div className="space-y-3 mb-5">
                  {SIN_RL.map((item) => (
                    <div key={item.label} className="flex justify-between items-start gap-3">
                      <span className="text-xs text-white/45 leading-relaxed">{item.label}</span>
                      <span className="text-xs font-mono font-semibold text-white whitespace-nowrap">{item.monto}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/8 pt-4 flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Total</span>
                  <div className="text-2xl font-bold text-red-500">
                    $<CountUp to={83} />M
                  </div>
                </div>
              </motion.div>

              {/* Con RL */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: E }}
                viewport={{ once: true }}
                className="bg-white/4 border border-indigo-500/25 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-sm font-semibold text-white">Con RemuneraLab</span>
                </div>
                <div className="space-y-3 mb-5">
                  {CON_RL.map((item) => (
                    <div key={item.label} className="flex justify-between items-start gap-3">
                      <span className="text-xs text-white/45 leading-relaxed">{item.label}</span>
                      <span className="text-xs font-mono font-semibold text-indigo-400 whitespace-nowrap">{item.monto}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto space-y-2">
                  {[
                    "Los 3 seniors reciben la alerta en enero — antes de que empezaran a buscar",
                    "El módulo de pagos sigue documentado. El roadmap se entrega en fecha.",
                    "El cliente enterprise renueva contrato.",
                  ].map((txt, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-white/45">{txt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ROI */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: E }}
              viewport={{ once: true }}
              className="bg-indigo-900/12 border border-indigo-500/25 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-1">
                  Retorno sobre la inversión
                </p>
                <p className="text-sm text-white/45 max-w-xs">
                  La mayor exposición absoluta de los cuatro sectores —
                  $83M vs una inversión de $13M en alertas tempranas y ajuste preventivo.
                </p>
              </div>
              <div className="text-6xl font-bold text-indigo-400 shrink-0">
                <CountUp to={6} duration={900} />x
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Fuentes ──────────────────────────────────────────────────── */}
        <div className="border-b border-white/8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h2 className="text-lg font-bold text-white mb-1">Metodología y fuentes</h2>
              <p className="text-sm text-white/45">
                El caso está construido sobre datos reales del mercado TI en Chile. La empresa es ficticia
                pero representativa del segmento SaaS B2B de 50–100 empleados en Santiago.
              </p>
            </motion.div>
            <div className="space-y-3">
              {FUENTES.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: E }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-white/10 bg-white/4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white mb-0.5">{f.nombre}</p>
                      <p className="text-xs text-white/45 leading-relaxed">{f.uso}</p>
                    </div>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-indigo-400 hover:text-indigo-300 transition-colors"
                      aria-label="Ver fuente"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-white/25 mt-1.5 truncate">{f.url}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="border-t border-white/8 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-10">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-4">Para tu empresa</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                ¿Cuántos de tus seniors están en el percentil 29 hoy?
              </h2>
              <p className="text-white/45 leading-relaxed">
                El problema no es que tu empresa pague mal. Es que no sabes si paga bien.
                RemuneraLab te da la alerta antes de que el primer talento empiece a buscar.
              </p>
            </div>
            <a
              href="/formulario"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity shrink-0"
              style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)", color: "#0D2240", boxShadow: "0 0 28px rgba(6,214,160,0.2)" }}
            >
              Ver mi posición salarial
              <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/8 py-10 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-serif-display italic text-white mb-1" style={{ fontSize: "1.2rem" }}>RemuneraLab</p>
            <span className="text-white/30 text-sm">
              Inteligencia salarial para Chile · Tus datos son anónimos y nunca se venderán.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
