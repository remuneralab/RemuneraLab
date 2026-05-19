"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  Heart, BarChart3, HardHat, Globe, BookOpen,
  AlertTriangle, TrendingDown, MapPin, Users, ArrowRight,
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

type CaseItem = { label: string; monto: string };
type CaseStat = { label: string; valor: string; sub: string };

type Case = {
  id: string;
  sector: string;
  empresa: string;
  ciudad: string;
  empleados: number;
  cargo: string;
  Icon: React.ElementType;
  color: string;
  colorBg: string;
  colorBorder: string;
  colorDot: string;
  stats: CaseStat[];
  narrative: string;
  gap: { title: string; pagado: string; mercado: string; pct: string; pagadoW: number; mercadoW: number };
  ley: { nombre: string; articulo: string; riesgo: string };
  sinRL: { items: CaseItem[]; total: number };
  conRL: { items: CaseItem[]; nota: string };
  roi: number;
};

const CASES: Case[] = [
  {
    id: "salud",
    sector: "Salud",
    empresa: "Clínica Santa Elena",
    ciudad: "Santiago",
    empleados: 280,
    cargo: "TENS · UCI y curaciones avanzadas",
    Icon: Heart,
    color: "text-red-500",
    colorBg: "bg-red-900/12",
    colorBorder: "border-red-500/20",
    colorDot: "bg-red-400",
    stats: [
      { label: "TENS perdidos",    valor: "11",  sub: "en 8 meses"      },
      { label: "Bajo el mercado",  valor: "40%", sub: "sin saberlo"     },
      { label: "Pérdida total",    valor: "$60M",sub: "sin RemuneraLab" },
    ],
    narrative:
      "La clínica perdió 11 TENS en ocho meses. El área de RRHH asumió que el problema era carga laboral y no investigó más. Lo que nadie calculó: pagaban $680.000 cuando el mercado en Santiago para ese perfil estaba entre $780.000 y $950.000 — entre un 13% y un 40% bajo el mercado, sin saberlo. Cuando uno de los TENS renunció y presentó una denuncia por Ley Karin ante la DT, la exposición legal fue inmediata.",
    gap: {
      title: "Salario TENS (UCI) — Santiago 2024",
      pagado: "$680.000",
      mercado: "$780.000 – $950.000",
      pct: "13–40% bajo el mercado",
      pagadoW: 68,
      mercadoW: 95,
    },
    ley: {
      nombre: "Ley Karin",
      articulo: "21.643",
      riesgo:
        "Multa base de 10 UTM (~$660.000) por trabajador afectado, con sanciones adicionales si existe denuncia activa. Con 280 empleados y denuncia activa, la exposición fue inmediata.",
    },
    sinRL: {
      items: [
        { label: "11 reposiciones TENS (7 meses salario c/u)", monto: "$52.360.000" },
        { label: "Multa DT + honorarios legales Ley Karin",    monto: "$8.000.000"  },
      ],
      total: 60,
    },
    conRL: {
      items: [
        { label: "Ajuste 8 TENS × $80.000/mes × 12 meses",    monto: "$7.680.000/año"  },
        { label: "Suscripción RemuneraLab plan Growth",        monto: "$2.268.000/año"  },
      ],
      nota: "Una alerta cuando el cargo cayó de P48 a P31 habría activado la conversación sobre ajuste salarial seis meses antes. El RPM con timestamp habría respaldado las decisiones ante la DT.",
    },
    roi: 26,
  },
  {
    id: "finanzas",
    sector: "Finanzas",
    empresa: "Corredora de Seguros Pacífico Sur",
    ciudad: "Valparaíso",
    empleados: 95,
    cargo: "Ejecutivo/a Comercial",
    Icon: BarChart3,
    color: "text-[#06D6A0]",
    colorBg: "bg-emerald-900/12",
    colorBorder: "border-emerald-500/30",
    colorDot: "bg-emerald-500",
    stats: [
      { label: "Brecha de género", valor: "−18%",  sub: "no medida"       },
      { label: "Cartera perdida",  valor: "60%",   sub: "se fue con ella"  },
      { label: "Pérdida total",    valor: "$32M",  sub: "sin RemuneraLab" },
    ],
    narrative:
      "Estructura salarial congelada desde 2021. Nadie había medido que la brecha de género en el cargo Ejecutivo Comercial era del 18%: hombres y mujeres con igual antigüedad y cartera ganaban diferente. En marzo 2024, la ejecutiva con la segunda cartera más grande renunció por $350.000 más al mes en la competencia — y se llevó el 60% de sus clientes. Tres meses después, otra ejecutiva denunció por discriminación salarial ante la DT.",
    gap: {
      title: "Ejecutivo/a Comercial (mujeres) — Valparaíso 2024",
      pagado: "$1.400.000",
      mercado: "$1.750.000 (mercado equivalente)",
      pct: "Brecha de género −18% no medida",
      pagadoW: 70,
      mercadoW: 87,
    },
    ley: {
      nombre: "Ley de igualdad salarial",
      articulo: "20.348",
      riesgo:
        "Retroactivo de hasta 5 años de diferencia salarial más indemnizaciones. Para esta ejecutiva, con 4 años de brecha del 18% sobre $1.400.000, el retroactivo superaba los $12.000.000 solo en diferencias.",
    },
    sinRL: {
      items: [
        { label: "Pérdida cartera ejecutiva que renunció (año 1)", monto: "$8.000.000"  },
        { label: "Acuerdo extrajudicial Ley 20.348",               monto: "$14.000.000" },
        { label: "Reposición cargo vacante (7 meses salario)",     monto: "$9.800.000"  },
      ],
      total: 32,
    },
    conRL: {
      items: [
        { label: "Corrección brecha: 3 cargos × $350.000 × 12m",  monto: "$4.200.000/año" },
        { label: "Suscripción RemuneraLab (auditoría historial)",  monto: "$2.268.000/año" },
      ],
      nota: "El historial de auditoría habría documentado que la empresa actuó antes de la denuncia, reduciendo radicalmente la exposición legal.",
    },
    roi: 7,
  },
  {
    id: "mineria",
    sector: "Minería",
    empresa: "Servicios Mineros Altamirano",
    ciudad: "Región de Antofagasta",
    empleados: 160,
    cargo: "Técnico Eléctrico · certificación SERNAGEOMIN",
    Icon: HardHat,
    color: "text-amber-600",
    colorBg: "bg-amber-900/12",
    colorBorder: "border-amber-500/20",
    colorDot: "bg-amber-500",
    stats: [
      { label: "Técnicos perdidos",  valor: "6/14",  sub: "en 12 meses"      },
      { label: "Faenas críticas",    valor: "2",     sub: "dotación mínima"  },
      { label: "Pérdida total",      valor: "$82M",  sub: "sin RemuneraLab" },
    ],
    narrative:
      "Altamirano operaba en tres faenas con 14 técnicos eléctricos certificados SERNAGEOMIN. En 12 meses perdió 6, todos reclutados por contratistas que pagaban entre $400.000 y $600.000 más al mes. Pagaban $2.100.000 cuando el piso del mercado era $2.300.000 — nunca hicieron una comparación estructurada. Dos faenas operaron con dotación mínima durante semanas. Cuando una fue fiscalizada por horas extras no pagadas, la empresa mandante ejerció responsabilidad solidaria sobre Altamirano.",
    gap: {
      title: "Técnico Eléctrico SERNAGEOMIN — Antofagasta 2024",
      pagado: "$2.100.000",
      mercado: "$2.300.000 – $3.900.000",
      pct: "Bajo el piso del mercado",
      pagadoW: 53,
      mercadoW: 97,
    },
    ley: {
      nombre: "Ley de subcontratación",
      articulo: "20.123",
      riesgo:
        "La empresa principal responde solidaria y subsidiariamente por las obligaciones laborales del contratista. Cuando la faena fue fiscalizada por horas extras no pagadas, la cadena de responsabilidad se activó sobre Altamirano.",
    },
    sinRL: {
      items: [
        { label: "6 reposiciones Técnico Eléctrico SERNAGEOMIN",  monto: "$72.000.000" },
        { label: "Multas horas extras período crítico",            monto: "$4.200.000"  },
        { label: "Penalización contractual empresa mandante",      monto: "$6.000.000"  },
      ],
      total: 82,
    },
    conRL: {
      items: [
        { label: "Ajuste 14 técnicos × $300.000/mes",             monto: "$4.200.000/mes" },
        { label: "Suscripción RemuneraLab plan Growth",           monto: "$2.268.000/año" },
      ],
      nota: "Una alerta cuando el cargo cayó de P50 a P28 habría activado la revisión. El RPM habría documentado el ajuste como decisión de mercado defendible ante la empresa mandante.",
    },
    roi: 17,
  },
  {
    id: "turismo",
    sector: "Turismo",
    empresa: "Hotel Boutique Vista Pacífico",
    ciudad: "Viña del Mar",
    empleados: 58,
    cargo: "Garzón bilingüe · temporada alta",
    Icon: Globe,
    color: "text-sky-600",
    colorBg: "bg-sky-900/12",
    colorBorder: "border-sky-500/20",
    colorDot: "bg-sky-500",
    stats: [
      { label: "Rotación anual",    valor: "35%",       sub: "cargos de contacto"      },
      { label: "TripAdvisor",       valor: "4.6 → 4.1", sub: "caída en 3 meses"        },
      { label: "Pérdida total",     valor: "$19.4M",    sub: "sin RemuneraLab"         },
    ],
    narrative:
      "Rotación del 35% concentrada en cargos de contacto con el huésped. Los garzones bilingues se iban en noviembre — justo antes de la temporada alta — reclutados por cadenas que pagaban entre $180.000 y $260.000 más al mes. El dueño asumía que \"las propinas compensan\" sin haberlo medido nunca: el salario base era $450.000 cuando las cadenas pagaban $620.000–$680.000. En temporada 2024, operó con 4 de 8 garzones reemplazados por personal sin inglés. Las reseñas bajaron de 4.6 a 4.1 en tres meses.",
    gap: {
      title: "Garzón bilingüe — Viña del Mar, temporada alta 2024",
      pagado: "$450.000 (base)",
      mercado: "$620.000 – $680.000 (cadenas zona)",
      pct: "38–51% bajo las cadenas competidoras",
      pagadoW: 56,
      mercadoW: 85,
    },
    ley: {
      nombre: "Ley de propinas",
      articulo: "20.803",
      riesgo:
        "El hotel pagaba propinas correctamente. El problema era el salario base — invisible porque el supuesto \"las propinas compensan\" nunca fue medido ni comparado con el mercado real.",
    },
    sinRL: {
      items: [
        { label: "4 reposiciones garzón bilingüe, temporada alta", monto: "$7.400.000"  },
        { label: "Pérdida reservas + caída reseñas TripAdvisor",   monto: "$12.000.000" },
      ],
      total: 19.4,
    },
    conRL: {
      items: [
        { label: "Ajuste 8 garzones × $150.000 × 4 meses",        monto: "$4.800.000"      },
        { label: "Suscripción RemuneraLab",                        monto: "$490.000/año"    },
      ],
      nota: "Una alerta en septiembre habría permitido ajustar el salario base antes de que las cadenas empezaran a reclutar para la temporada.",
    },
    roi: 4,
  },
];

// ─── Case Section ─────────────────────────────────────────────────────────────

const CaseSection = forwardRef<HTMLElement, { caso: Case }>(({ caso: c }, ref) => {
  return (
    <section
      ref={ref}
      id={c.id}
      className="scroll-mt-28 py-14 sm:py-18 border-b border-white/8 last:border-0"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: E }}
        viewport={{ once: true }}
        className={`border-l-4 ${c.colorBorder} pl-5 mb-8`}
      >
        <div className={`flex items-center gap-2 mb-1.5 ${c.color}`}>
          <c.Icon size={14} />
          <span className="text-xs font-semibold uppercase tracking-widest">{c.sector}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">{c.empresa}</h2>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-white/45">
          <span className="flex items-center gap-1"><MapPin size={12} />{c.ciudad}</span>
          <span className="flex items-center gap-1"><Users size={12} />{c.empleados} empleados</span>
          <span className="italic">{c.cargo}</span>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: E }}
        viewport={{ once: true }}
        className="grid grid-cols-3 divide-x divide-white/8 border border-white/8 rounded-lg overflow-hidden mb-8"
      >
        {c.stats.map((s, i) => (
          <div key={i} className="p-4 sm:p-5 text-center">
            <div className={`text-xl sm:text-2xl font-bold ${c.color}`}>{s.valor}</div>
            <div className="text-xs font-medium text-white mt-0.5">{s.label}</div>
            <div className="text-xs text-white/45">{s.sub}</div>
          </div>
        ))}
      </motion.div>

      {/* Narrative */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: E }}
        viewport={{ once: true }}
        className="text-white/45 leading-relaxed text-[15px] mb-8 max-w-3xl"
      >
        {c.narrative}
      </motion.p>

      {/* Salary gap visual */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: E }}
        viewport={{ once: true }}
        className="mb-6 p-5 rounded-lg border border-white/10 bg-white/6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-5">
          {c.gap.title}
        </p>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-white/45">Salario pagado</span>
              <span className="font-mono text-sm font-semibold text-red-500">{c.gap.pagado}</span>
            </div>
            <div className="h-2.5 bg-white/6 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-red-400 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${c.gap.pagadoW}%` }}
                transition={{ duration: 0.9, ease: E }}
                viewport={{ once: true }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-white/45">Mercado real</span>
              <span className="font-mono text-sm font-semibold text-[#06D6A0]">{c.gap.mercado}</span>
            </div>
            <div className="h-2.5 bg-white/6 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${c.gap.mercadoW}%` }}
                transition={{ duration: 0.9, delay: 0.12, ease: E }}
                viewport={{ once: true }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={13} className="text-red-500" />
            <span className="text-sm font-semibold text-red-500">{c.gap.pct}</span>
          </div>
        </div>
      </motion.div>

      {/* Legal risk */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: E }}
        viewport={{ once: true }}
        className="mb-8 p-4 rounded-lg border-l-4 border-red-400 bg-red-900/12"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <span className="font-semibold text-red-400 text-sm">
            {c.ley.nombre} · Ley {c.ley.articulo}
          </span>
        </div>
        <p className="text-sm text-red-400 leading-relaxed">{c.ley.riesgo}</p>
      </motion.div>

      {/* Cost comparison */}
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
            {c.sinRL.items.map((item) => (
              <div key={item.label} className="flex justify-between items-start gap-3">
                <span className="text-xs text-white/45 leading-relaxed">{item.label}</span>
                <span className="text-xs font-mono font-semibold text-white whitespace-nowrap">{item.monto}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-4 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/45">Total</span>
            <div className="text-2xl font-bold text-red-500">
              $<CountUp to={c.sinRL.total} />M
            </div>
          </div>
        </motion.div>

        {/* Con RL */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: E }}
          viewport={{ once: true }}
          className="bg-white/4 border border-white/10 rounded-lg p-5 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-white">Con RemuneraLab</span>
          </div>
          <div className="space-y-3 mb-5">
            {c.conRL.items.map((item) => (
              <div key={item.label} className="flex justify-between items-start gap-3">
                <span className="text-xs text-white/45 leading-relaxed">{item.label}</span>
                <span className="text-xs font-mono font-semibold text-[#06D6A0] whitespace-nowrap">{item.monto}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-3 rounded-lg bg-emerald-900/12 border border-emerald-500/30">
            <p className="text-xs text-white/45 leading-relaxed">{c.conRL.nota}</p>
          </div>
        </motion.div>
      </div>

      {/* ROI banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: E }}
        viewport={{ once: true }}
        className={`${c.colorBg} border ${c.colorBorder} rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45 mb-1">
            Retorno sobre la inversión
          </p>
          <p className="text-sm text-white/45 max-w-xs">
            Lo que costó prevenir comparado con lo que costó no hacerlo
          </p>
        </div>
        <div className={`text-6xl font-bold ${c.color} shrink-0`}>
          <CountUp to={c.roi} duration={900} />x
        </div>
      </motion.div>
    </section>
  );
});
CaseSection.displayName = "CaseSection";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CasosPage() {
  const scrolled = useScrolled();
  const [activeCase, setActiveCase] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers = CASES.map((_, i) => {
      const el = sectionRefs.current[i];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCase(i); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  function scrollToCase(i: number) {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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

      {/* Main navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/12"
        style={{ background: "rgba(13,34,64,0.88)", backdropFilter: "blur(14px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors" style={{ fontSize: "1.4rem" }}>
            RemuneraLab
          </a>
          <TabNav active="casos" />
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-b border-white/8">
          <div className="border-l-2 border-[#00B4D8] pl-6">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <BookOpen size={14} />
              <span className="text-xs font-semibold uppercase tracking-widest">Evidencia de mercado</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Cuatro casos donde RemuneraLab<br className="hidden sm:block" /> habría marcado la diferencia
            </h1>
            <p className="text-white/45 max-w-2xl text-[15px] leading-relaxed">
              Construidos sobre datos verificables del mercado chileno. Las leyes, los montos y los patrones de rotación son reales. Los nombres son ficticios pero representativos del tipo exacto de organización donde estos problemas ocurren.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky inner nav */}
      <div className="sticky top-16 z-30 bg-[#0D2240]/90 backdrop-blur border-b border-white/8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {CASES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => scrollToCase(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCase === i
                    ? `${c.colorBg} ${c.color} font-semibold`
                    : "text-white/45 hover:text-white hover:bg-white/6"
                }`}
              >
                <c.Icon size={13} />
                {c.sector}
                {activeCase === i && (
                  <span className={`w-1.5 h-1.5 rounded-full ${c.colorDot}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {CASES.map((c, i) => (
          <CaseSection
            key={c.id}
            caso={c}
            ref={(el) => { sectionRefs.current[i] = el; }}
          />
        ))}
      </div>

      {/* Closing — "Lo que tienen en común" */}
      <div className="border-t border-white/8 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-4">
              El patrón común
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              En todos el patrón es idéntico
            </h2>
            <p className="text-white/45 leading-relaxed mb-4">
              La empresa no tenía un número malo, tenía un número desconocido. No sabía que estaba bajo el mercado. Nadie se lo dijo hasta que ya era demasiado tarde.
            </p>
            <p className="text-white font-medium">
              RemuneraLab no vende el análisis del problema después de que ocurrió — vende la alerta antes de que ocurra.
            </p>
          </div>
          <a
            href="/formulario"
            className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity shrink-0"
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
  );
}
