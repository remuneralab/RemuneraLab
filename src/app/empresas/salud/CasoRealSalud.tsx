"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import {
  AlertTriangle, Bell, CheckCircle2, ChevronRight,
  Clock, ExternalLink, MapPin, Scale, TrendingDown, Users,
} from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

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

const CLINICA = {
  nombre:    "Clínica Santa Elena",
  ciudad:    "Santiago, Región Metropolitana",
  empleados: 280,
  tipo:      "Clínica privada · Sector oriente de Santiago",
  riesgo:    78,
};

type GapLevel = "CRÍTICO" | "ALTO" | "MODERADO";

const ROLES: {
  cargo: string; cantidad: number;
  actual: number; mercado: number;
  gap: number; nivel: GapLevel;
}[] = [
  { cargo: "TENS · UCI y curaciones avanzadas", cantidad: 18, actual: 680000,  mercado: 865000,  gap: 21, nivel: "CRÍTICO"  },
  { cargo: "Auxiliar de Enfermería",            cantidad: 24, actual: 620000,  mercado: 750000,  gap: 17, nivel: "CRÍTICO"  },
  { cargo: "Enfermera/o",                       cantidad: 32, actual: 1100000, mercado: 1350000, gap: 19, nivel: "ALTO"     },
  { cargo: "Técnico en Radiología",             cantidad: 8,  actual: 720000,  mercado: 890000,  gap: 19, nivel: "ALTO"     },
  { cargo: "Kinesiólogo/a",                     cantidad: 12, actual: 980000,  mercado: 1200000, gap: 18, nivel: "ALTO"     },
];

const TIMELINE = [
  {
    mes: "Enero 2024",
    evento: "Primera renuncia: TENS con 3 años en UCI migra a clínica del sector oriente. RRHH registra \"motivo personal\" y abre proceso de reemplazo urgente.",
    impacto: "Señal ignorada",
    color: "bg-orange-400",
  },
  {
    mes: "Febrero 2024",
    evento: "Segunda y tercera renuncia simultánea. RRHH diagnostica \"estrés por turno nocturno\". No investiga compensación. Los dos reemplazos contratados tienen menos de 1 año de experiencia.",
    impacto: "$10.200.000 en primeros costos de reposición",
    color: "bg-red-400",
  },
  {
    mes: "Abril 2024",
    evento: "Cuarta y quinta renuncia. La UCI opera con dotación mínima durante 6 semanas. Se registran demoras en protocolos de curaciones avanzadas por falta de experiencia del personal nuevo.",
    impacto: "$10.200.000 adicionales · riesgo clínico activo",
    color: "bg-red-500",
  },
  {
    mes: "Junio 2024",
    evento: "Sexta y séptima renuncia. Ambos TENS llevan más de 4 años en la clínica. Al hacer exit interview, declaran: \"en la clínica de al lado pagan $780.000\". Es la primera vez que RRHH escucha este argumento.",
    impacto: "$10.200.000 · la causa real empieza a ser visible",
    color: "bg-red-600",
  },
  {
    mes: "Julio – Agosto 2024",
    evento: "Renuncias 8 a 11 en el mismo período. El 1 de agosto entra en vigencia la Ley Karin (21.643). La clínica no tiene protocolo de prevención de acoso registrado ante la Dirección del Trabajo.",
    impacto: "$20.400.000 en reposición · exposición legal activada",
    color: "bg-red-700",
  },
  {
    mes: "Septiembre 2024",
    evento: "Un TENS que renunció presenta denuncia ante la DT por condiciones de trabajo hostiles. La DT fiscaliza. Sin protocolo Ley Karin registrado, la multa es inmediata: 10 UTM por trabajador afectado, más honorarios legales.",
    impacto: "$8.000.000 en multas y costos legales",
    color: "bg-red-800",
  },
];

const SIN_RL = [
  { label: "11 reposiciones TENS (7 meses de salario promedio c/u)",  monto: "$52.360.000" },
  { label: "Multa DT Ley Karin + honorarios legales",                 monto: "$8.000.000"  },
];

const CON_RL = [
  { label: "Ajuste 8 TENS at-risk × $80.000/mes × 12 meses",         monto: "$7.680.000/año"  },
  { label: "Suscripción RemuneraLab plan Growth",                     monto: "$2.268.000/año"  },
];

const FUENTES = [
  {
    nombre: "Ley N° 21.643 (Ley Karin) — Prevención del acoso laboral y sexual",
    uso:
      "Marco legal de Ley Karin: obligaciones del empleador, protocolos de prevención obligatorios y sanciones (multa base 10 UTM por trabajador afectado).",
    url: "https://www.mintrab.gob.cl/ley-karin/",
    organismo: "Ministerio del Trabajo y Previsión Social de Chile",
  },
  {
    nombre: "Normativa Ley Karin — Dirección del Trabajo",
    uso:
      "Interpretación oficial, obligaciones específicas del empleador y proceso de fiscalización bajo Ley 21.643.",
    url: "https://www.dt.gob.cl/portal/1626/w3-propertyvalue-179028.html",
    organismo: "Dirección del Trabajo",
  },
  {
    nombre: "Burnout e intención de abandono en enfermería y personal clínico — SciELO Chile",
    uso:
      "Base empírica para la estadística: \"alrededor de un tercio de las enfermeras en Chile reporta burnout e intención de dejar su trabajo\". Burnout no es la causa raíz — el salario desalineado lo es.",
    url: "https://www.scielo.cl",
    organismo: "SciELO Chile — Red de revistas científicas",
  },
  {
    nombre: "Estudio de Remuneración 2024–2025 — Michael Page Chile",
    uso:
      "Rangos salariales para cargos del sector salud en Chile: TENS, Auxiliares de Enfermería, Kinesiólogos y Técnicos en Radiología.",
    url:
      "https://www.michaelpage.cl/estudios-y-tendencias/estudio-de-remuneracion-2024-2025-1-MP-095",
    organismo: "Michael Page Chile",
  },
  {
    nombre: "Guía Laboral Chile 2025 — Hays Recruitment",
    uso:
      "Benchmarks de compensación para el sector salud y parámetros de retención de talento clínico especializado en el mercado chileno.",
    url: "https://www.hays.cl/guia-laboral",
    organismo: "Hays Chile",
  },
  {
    nombre: "ClinicalWork — Portal empleos sector salud",
    uso:
      "Rangos salariales publicados para TENS con experiencia en UCI y curaciones avanzadas en Santiago 2023–2024 (fuente original del caso).",
    url: "https://clinicalwork.cl",
    organismo: "ClinicalWork Chile",
  },
  {
    nombre: "Estadísticas SUSESO — Fiscalización Ley Karin 2024",
    uso:
      "Datos de inspecciones y sanciones aplicadas bajo Ley 21.643 desde su entrada en vigencia (agosto 2024). Referencia para estimar la exposición legal real de la clínica.",
    url: "https://www.suseso.cl/612/w3-propertyvalue-323154.html",
    organismo: "SUSESO — Superintendencia de Seguridad Social",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

function gapStyle(nivel: GapLevel) {
  if (nivel === "CRÍTICO")  return { badge: "bg-red-100 text-red-700"    };
  if (nivel === "ALTO")     return { badge: "bg-orange-100 text-orange-700" };
  return                          { badge: "bg-yellow-100 text-yellow-700" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CasoRealSalud() {
  return (
    <div className="bg-white">

      {/* ── Perfil de empresa ─────────────────────────────────────────── */}
      <div className="border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
            <Scale size={14} className="text-red-500" />
            <span className="text-xs font-semibold uppercase tracking-widest">Caso real aplicado · Salud</span>
          </div>
          <div className="border-l-2 border-primary pl-6 mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
              Este es el análisis que RemuneraLab habría generado para
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mb-2">
              {CLINICA.nombre}
            </h2>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><MapPin size={12} />{CLINICA.ciudad}</span>
              <span className="flex items-center gap-1.5"><Users size={12} />{CLINICA.empleados} empleados</span>
              <span className="flex items-center gap-1.5"><Scale size={12} />{CLINICA.tipo}</span>
            </div>
          </div>

          {/* Risk score + KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: E }}
              className="border border-outline-variant/20 rounded-lg p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                Riesgo de rotación
              </p>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-4xl font-bold text-red-500">{CLINICA.riesgo}</span>
                <span className="text-on-surface-variant mb-1">/ 100</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${CLINICA.riesgo}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: E }}
                />
              </div>
              <p className="text-xs text-red-600 font-semibold mt-2">ALTO · Requiere atención inmediata</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: E }}
              className="sm:col-span-2 grid grid-cols-3 divide-x divide-outline-variant/20 border border-outline-variant/20 rounded-lg overflow-hidden"
            >
              {[
                { valor: "11",    label: "TENS perdidos",      sub: "en 8 meses, misma causa" },
                { valor: "−21%",  label: "Gap cargo crítico",  sub: "TENS vs mercado P50"     },
                { valor: "$60M",  label: "Pérdida total",      sub: "sin RemuneraLab"         },
              ].map((k, i) => (
                <div key={i} className="p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-500">{k.valor}</div>
                  <div className="text-xs font-medium text-on-surface mt-0.5">{k.label}</div>
                  <div className="text-xs text-on-surface-variant">{k.sub}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Mapa salarial ─────────────────────────────────────────────── */}
      <div className="border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h3 className="text-xl font-bold text-on-surface mb-1">Tu mapa salarial vs mercado</h3>
            <p className="text-sm text-on-surface-variant">
              Datos cruzados con Michael Page, Hays Chile y ClinicalWork 2024. Mercado P50 corresponde a Santiago privado.
            </p>
          </motion.div>

          {/* Table header (desktop) */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_90px] gap-x-4 px-4 mb-2">
            {["Cargo", "Salario actual", "Mercado P50", "Gap", "Alerta"].map((h) => (
              <span key={h} className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{h}</span>
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
                  className="border border-outline-variant/20 rounded-lg px-4 py-3"
                >
                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_90px] gap-x-4 items-center">
                    <div>
                      <span className="text-sm font-medium text-on-surface">{r.cargo}</span>
                      <span className="ml-2 text-xs text-on-surface-variant">× {r.cantidad}</span>
                    </div>
                    <span className="font-mono text-sm text-on-surface">{fmtCLP(r.actual)}</span>
                    <span className="font-mono text-sm text-emerald-700">{fmtCLP(r.mercado)}</span>
                    <span className="font-mono text-sm font-semibold text-red-500">−{r.gap}%</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${style.badge}`}>
                      {r.nivel}
                    </span>
                  </div>
                  {/* Mobile */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-on-surface">{r.cargo} <span className="text-on-surface-variant">× {r.cantidad}</span></span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>{r.nivel}</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-on-surface-variant">Actual: <span className="font-mono font-semibold text-on-surface">{fmtCLP(r.actual)}</span></span>
                      <span className="text-on-surface-variant">P50: <span className="font-mono font-semibold text-emerald-700">{fmtCLP(r.mercado)}</span></span>
                      <span className="font-mono font-semibold text-red-500">−{r.gap}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alertas que no llegaron ───────────────────────────────────── */}
      <div className="border-b border-outline-variant/20 bg-surface-container/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-on-surface mb-1">Las dos alertas que nunca llegaron</h3>
            <p className="text-sm text-on-surface-variant max-w-2xl">
              RemuneraLab monitorea dos dimensiones simultáneamente: el mercado salarial y el cumplimiento legal.
              Ambas habrían llegado con meses de anticipación.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Alerta 1: Salary ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: E }}
              viewport={{ once: true }}
              className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-red-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-white" />
                  <span className="text-sm font-semibold text-white">RemuneraLab · Alerta salarial</span>
                </div>
                <span className="text-xs text-white/70">Miércoles, 11 oct 2023 · 08:52</span>
              </div>

              <div className="bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
                    Desalineamiento salarial crítico detectado
                  </span>
                </div>

                <p className="text-base font-bold text-on-surface">TENS · UCI y curaciones avanzadas</p>
                <p className="text-sm text-on-surface-variant mb-5">{CLINICA.nombre} · Santiago</p>

                <div className="mb-5 p-4 bg-surface-container/40 rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4">
                    Posición en el mercado
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Enero 2023</span>
                        <span className="font-semibold text-emerald-600">Percentil 48</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: "48%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Octubre 2023 — hoy</span>
                        <span className="font-semibold text-red-600">Percentil 31</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: "31%" }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-red-500" />
                    Las clínicas del sector oriente subieron bandas salariales un 22% en 2023. Tu banda no se movió.
                  </p>
                </div>

                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  Hay <strong className="text-on-surface">3 clínicas competidoras en un radio de 8 km</strong> que
                  están reclutando TENS especializados en UCI con ofertas entre{" "}
                  <strong className="text-on-surface">$780.000 y $950.000</strong>. Tu equipo está expuesto.
                </p>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Ver análisis completo <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-on-surface-variant">Recordar en 30 días</button>
                </div>
              </div>
            </motion.div>

            {/* ── Alerta 2: Ley Karin ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: E }}
              viewport={{ once: true }}
              className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-amber-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={14} className="text-white" />
                  <span className="text-sm font-semibold text-white">RemuneraLab · Alerta legal</span>
                </div>
                <span className="text-xs text-white/70">Martes, 9 abr 2024 · 10:17</span>
              </div>

              <div className="bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                    Riesgo de incumplimiento legal detectado
                  </span>
                </div>

                <p className="text-base font-bold text-on-surface">Ley Karin (21.643)</p>
                <p className="text-sm text-on-surface-variant mb-5">
                  Entra en vigencia el 1 de agosto de 2024 · <strong>113 días</strong>
                </p>

                <div className="mb-5 p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-3">
                  {[
                    {
                      label: "Protocolo DT registrado",
                      valor: "No encontrado",
                      colorVal: "text-red-600",
                      icon: <AlertTriangle size={13} className="text-red-500 shrink-0" />,
                    },
                    {
                      label: "Empleados expuestos",
                      valor: "280 trabajadores",
                      colorVal: "text-amber-700",
                      icon: <Users size={13} className="text-amber-600 shrink-0" />,
                    },
                    {
                      label: "Exposición máxima estimada",
                      valor: "2.800 UTM · ~$184.800.000",
                      colorVal: "text-red-600",
                      icon: <Scale size={13} className="text-red-500 shrink-0" />,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {row.icon}
                        <span className="text-xs text-on-surface-variant">{row.label}</span>
                      </div>
                      <span className={`text-xs font-semibold ${row.colorVal}`}>{row.valor}</span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  Con <strong className="text-on-surface">280 empleados y sin protocolo registrado</strong>,
                  cualquier denuncia activa activa la multa máxima desde el primer día de vigencia.
                  El protocolo se implementa en 48 horas — el riesgo legal, no.
                </p>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Generar protocolo guiado <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-on-surface-variant">Ver guía completa</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Timeline sin RemuneraLab ──────────────────────────────────── */}
      <div className="border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-on-surface mb-1">Lo que ocurrió sin RemuneraLab</h3>
            <p className="text-sm text-on-surface-variant">
              8 meses de pérdidas que empezaron con una señal de mercado que nadie tenía cómo ver.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[7px] sm:left-[11px] top-2 bottom-2 w-px bg-outline-variant/30" />
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
                    <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full ${item.color} ring-2 ring-white`} />
                  </div>
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={11} className="text-on-surface-variant" />
                      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{item.mes}</span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed mb-1.5">{item.evento}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
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
      <div className="border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-on-surface mb-1">El costo de saber vs no saber</h3>
            <p className="text-sm text-on-surface-variant">Actuar en octubre de 2023 vs reaccionar en septiembre de 2024.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Sin RL */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E }}
              viewport={{ once: true }}
              className="border border-red-200 rounded-lg p-5"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm font-semibold text-on-surface">Sin RemuneraLab</span>
              </div>
              <div className="space-y-3 mb-5">
                {SIN_RL.map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-3">
                    <span className="text-xs text-on-surface-variant leading-relaxed">{item.label}</span>
                    <span className="text-xs font-mono font-semibold text-on-surface whitespace-nowrap">{item.monto}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant/20 pt-4 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Total</span>
                <div className="text-2xl font-bold text-red-500">
                  $<CountUp to={60} />M
                </div>
              </div>
            </motion.div>

            {/* Con RL */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: E }}
              viewport={{ once: true }}
              className="border border-red-100 bg-red-50/30 rounded-lg p-5 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-on-surface">Con RemuneraLab</span>
              </div>
              <div className="space-y-3 mb-5">
                {CON_RL.map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-3">
                    <span className="text-xs text-on-surface-variant leading-relaxed">{item.label}</span>
                    <span className="text-xs font-mono font-semibold text-emerald-700 whitespace-nowrap">{item.monto}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto space-y-2">
                {[
                  "Alerta salarial en octubre 2023 → ajuste preventivo antes de la primera renuncia.",
                  "Alerta legal en abril 2024 → protocolo Ley Karin implementado antes de agosto.",
                  "Cero denuncias activas. Cero multas. Las 11 renuncias, evitadas.",
                ].map((txt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-on-surface-variant">{txt}</span>
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
            className="bg-red-50 border border-red-300 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                Retorno sobre la inversión
              </p>
              <p className="text-sm text-on-surface-variant max-w-sm">
                $60M en daños evitables vs $9.9M en ajuste salarial preventivo + suscripción.
                El más alto de los cuatro sectores analizados.
              </p>
            </div>
            <div className="text-6xl font-bold text-red-500 shrink-0">
              <CountUp to={26} duration={900} />x
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Fuentes ──────────────────────────────────────────────────── */}
      <div className="bg-surface-container/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: E }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-on-surface mb-1">Metodología y fuentes</h3>
            <p className="text-sm text-on-surface-variant">
              La empresa es ficticia pero representativa de clínicas privadas de 200–350 empleados en el sector oriente de Santiago.
              Los montos, leyes, estadísticas y benchmarks son reales y verificables.
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
                className="border border-outline-variant/20 rounded-lg p-4 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface mb-0.5">{f.nombre}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{f.uso}</p>
                    <p className="text-xs text-on-surface-variant/50 mt-0.5">{f.organismo}</p>
                  </div>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-red-500 hover:text-red-700 transition-colors mt-0.5"
                    aria-label="Ver fuente"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-xs font-mono text-on-surface-variant/40 mt-1.5 truncate">{f.url}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
