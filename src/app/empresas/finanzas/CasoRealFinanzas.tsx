"use client";

import { useEffect, useRef } from "react";
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

const CORREDORA = {
  nombre:    "Corredora de Seguros Pacífico Sur",
  ciudad:    "Valparaíso, Región de Valparaíso",
  empleados: 95,
  tipo:      "Corredora de seguros · Segmentos corporativos y personas",
  riesgo:    70,
};

type GapLevel = "CRÍTICO" | "ALTO" | "MODERADO";

const ROLES: {
  cargo: string; refLabel: string; cantidad: number;
  actual: number; mercado: number;
  gap: number; nivel: GapLevel;
}[] = [
  { cargo: "Ejecutiva Comercial",    refLabel: "mismo cargo (hombres)",  cantidad: 8,  actual: 2_118_000, mercado: 2_580_000, gap: 18, nivel: "CRÍTICO"  },
  { cargo: "Analista de Seguros Sr.", refLabel: "Mercado P50",           cantidad: 15, actual: 1_650_000, mercado: 1_800_000, gap: 8,  nivel: "ALTO"     },
  { cargo: "Ejecutivo/a Atención",   refLabel: "Mercado P50",            cantidad: 22, actual: 1_280_000, mercado: 1_400_000, gap: 9,  nivel: "ALTO"     },
  { cargo: "Supervisor/a Comercial", refLabel: "Mercado P50",            cantidad: 4,  actual: 3_200_000, mercado: 3_500_000, gap: 9,  nivel: "MODERADO" },
];

const TIMELINE = [
  {
    mes: "Mayo 2023",
    evento: "La ejecutiva con mayor cartera (6 años, 42 clientes corporativos) empieza a recibir contactos de headhunters. RRHH no detecta señal. Su brecha salarial de $462.000/mes vs sus pares hombres lleva más de 2 años sin ser medida.",
    impacto: "Señal de mercado ignorada",
    color: "bg-orange-400",
  },
  {
    mes: "Julio 2023",
    evento: "Acepta oferta de una corredora en Santiago: $2.850.000 mensuales (35% sobre su actual). El contrato no tenía cláusula de no competencia efectiva. El aviso de salida llega sin explicación de causa.",
    impacto: "Renuncia confirmada · brecha fue el detonante",
    color: "bg-red-400",
  },
  {
    mes: "Agosto 2023",
    evento: "Los primeros 8 clientes corporativos de la ejecutiva redirigen renovaciones de pólizas a su nueva empleadora. La corredora no logra retenerlos. Ingreso anual no renovado estimado: $8M.",
    impacto: "$8.000.000 en cartera perdida · no recuperable",
    color: "bg-red-500",
  },
  {
    mes: "Octubre 2023",
    evento: "Una segunda ejecutiva (misma antigüedad, mismos resultados) descubre la diferencia salarial al conversar con un colega hombre. Consulta a abogado laboral sobre sus derechos bajo la Ley 20.348.",
    impacto: "Riesgo legal activado · aún no declarado",
    color: "bg-red-600",
  },
  {
    mes: "Diciembre 2023",
    evento: "La segunda ejecutiva presenta denuncia ante la Dirección del Trabajo invocando Ley 20.348 (igual remuneración). La empresa no tiene documentación de criterios objetivos de diferenciación salarial. La exposición retroactiva es de 5 años.",
    impacto: "Proceso legal iniciado · riesgo $27.720.000 retroactivo",
    color: "bg-red-700",
  },
  {
    mes: "Marzo 2024",
    evento: "Para evitar juicio público y daño reputacional, la empresa negocia un acuerdo extrajudicial de $14M + honorarios legales. Adicionalmente debe cubrir la reposición de la ejecutiva saliente: 7 meses de salario equivalente.",
    impacto: "$23.800.000 en costos legales y reposición",
    color: "bg-red-800",
  },
];

const SIN_RL = [
  { label: "Cartera de clientes perdida (60% de la ejecutiva saliente)",  monto: "$8.000.000"  },
  { label: "Acuerdo extrajudicial Ley 20.348 + honorarios legales",       monto: "$14.000.000" },
  { label: "Reposición ejecutiva comercial (7 meses de salario)",         monto: "$9.800.000"  },
];

const CON_RL = [
  { label: "Corrección brecha 3 ejecutivas at-risk (ajuste mensual)",     monto: "$4.200.000/año" },
  { label: "Suscripción RemuneraLab plan Growth",                         monto: "$2.268.000/año" },
];

const FUENTES = [
  {
    nombre: "Ley N° 20.348 — Resguarda la igualdad en las remuneraciones",
    uso: "Marco legal central del caso: obligación del empleador de mantener compensación sin discriminación de género y prescripción retroactiva de 5 años.",
    url: "https://www.bcn.cl/leychile/navegar?idNorma=1003032",
    organismo: "Biblioteca del Congreso Nacional de Chile",
  },
  {
    nombre: "Dirección del Trabajo — Fiscalización e igualdad salarial",
    uso: "Proceso de denuncia, obligaciones del empleador y criterios de fiscalización bajo la Ley de Igualdad de Remuneraciones entre hombres y mujeres.",
    url: "https://www.dt.gob.cl",
    organismo: "Dirección del Trabajo",
  },
  {
    nombre: "Encuesta Suplementaria de Ingresos (ESI) 2023 — INE Chile",
    uso: "Estadísticas de ingresos del trabajo por sexo y categoría ocupacional. Base para calcular brechas de género por cargo en el sector financiero y de seguros.",
    url: "https://www.ine.gob.cl/estadisticas/sociales/encuestas-de-empleo-e-ingresos",
    organismo: "Instituto Nacional de Estadísticas (INE)",
  },
  {
    nombre: "Estudio de Remuneración 2024–2025 — Michael Page Chile",
    uso: "Rangos salariales para Ejecutivo/a Comercial, Analista de Seguros y Supervisor/a Comercial en el sector seguros y financiero Chile.",
    url: "https://www.michaelpage.cl/estudios-y-tendencias/estudio-de-remuneracion-2024-2025-1-MP-095",
    organismo: "Michael Page Chile",
  },
  {
    nombre: "SernamEG — Brecha salarial de género en Chile",
    uso: "Estadísticas de brecha salarial por sector, metodología de medición y contexto comparativo. Referencia para la brecha del 18% en cargos de ventas y comercialización.",
    url: "https://www.sernameg.gob.cl",
    organismo: "SernamEG — Servicio Nacional de la Mujer y la Equidad de Género",
  },
  {
    nombre: "Guía Laboral Chile 2025 — Hays Recruitment",
    uso: "Benchmarks de compensación para ejecutivos comerciales en el sector seguros. Referencia para tasas de rotación y costos de reposición por cargo.",
    url: "https://www.hays.cl/guia-laboral",
    organismo: "Hays Chile",
  },
  {
    nombre: "CMF — Regulación y supervisión del sector asegurador chileno",
    uso: "Marco regulatorio del sector corredores de seguros, incluyendo estándares de conducta y obligaciones laborales aplicables.",
    url: "https://www.cmfchile.cl",
    organismo: "CMF — Comisión para el Mercado Financiero",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

function gapStyle(nivel: GapLevel) {
  if (nivel === "CRÍTICO")  return { badge: "bg-red-100 text-red-700"       };
  if (nivel === "ALTO")     return { badge: "bg-orange-100 text-orange-700" };
  return                          { badge: "bg-yellow-100 text-yellow-700"  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CasoRealFinanzas() {
  return (
    <div className="bg-white">

      {/* ── Perfil de empresa ─────────────────────────────────────────── */}
      <div className="border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-2 text-on-surface-variant">
            <Scale size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-widest">Caso real aplicado · Finanzas</span>
          </div>
          <div className="border-l-2 border-primary pl-6 mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
              Este es el análisis que RemuneraLab habría generado para
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-on-surface mb-2">
              {CORREDORA.nombre}
            </h2>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><MapPin size={12} />{CORREDORA.ciudad}</span>
              <span className="flex items-center gap-1.5"><Users size={12} />{CORREDORA.empleados} empleados</span>
              <span className="flex items-center gap-1.5"><Scale size={12} />{CORREDORA.tipo}</span>
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
                <span className="text-4xl font-bold text-red-500">{CORREDORA.riesgo}</span>
                <span className="text-on-surface-variant mb-1">/ 100</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${CORREDORA.riesgo}%` }}
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
                { valor: "1",    label: "Ejecutiva perdida",   sub: "6 años de seniority · cartera VIP" },
                { valor: "−18%", label: "Brecha de género",    sub: "mismo cargo, misma antigüedad"     },
                { valor: "$32M", label: "Pérdida total",       sub: "sin RemuneraLab"                   },
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
            <h3 className="text-xl font-bold text-on-surface mb-1">Tu mapa salarial vs referencia</h3>
            <p className="text-sm text-on-surface-variant">
              Datos cruzados con Michael Page, Hays Chile y ESI 2023. La primera fila compara ejecutivas vs sus pares hombres en el mismo cargo y antigüedad.
            </p>
          </motion.div>

          {/* Table header (desktop) */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_90px] gap-x-4 px-4 mb-2">
            {["Cargo", "Salario actual", "Referencia", "Gap", "Alerta"].map((h) => (
              <span key={h} className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{h}</span>
            ))}
          </div>

          <div className="space-y-2">
            {ROLES.map((r, i) => {
              const style = gapStyle(r.nivel);
              const isCritico = r.nivel === "CRÍTICO";
              return (
                <motion.div
                  key={r.cargo}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: E }}
                  viewport={{ once: true }}
                  className={`border rounded-lg px-4 py-3 ${isCritico ? "border-red-200 bg-red-50/40" : "border-outline-variant/20"}`}
                >
                  {/* Desktop */}
                  <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_90px] gap-x-4 items-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-on-surface">{r.cargo}</span>
                      <span className="text-xs text-on-surface-variant">× {r.cantidad}</span>
                      {isCritico && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          vs {r.refLabel}
                        </span>
                      )}
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
                    {isCritico && (
                      <p className="text-[10px] text-emerald-700 mb-1">Ref: {r.refLabel}</p>
                    )}
                    <div className="flex gap-4 text-xs">
                      <span className="text-on-surface-variant">Actual: <span className="font-mono font-semibold text-on-surface">{fmtCLP(r.actual)}</span></span>
                      <span className="text-on-surface-variant">Ref: <span className="font-mono font-semibold text-emerald-700">{fmtCLP(r.mercado)}</span></span>
                      <span className="font-mono font-semibold text-red-500">−{r.gap}%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alertas que nunca llegaron ────────────────────────────────── */}
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
              RemuneraLab habría detectado ambas señales en simultáneo: la brecha de género interna y el riesgo legal antes de que se volvieran irreversibles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Alerta 1: Brecha de género ── */}
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
                <span className="text-xs text-white/70">Lunes, 15 may 2023 · 09:14</span>
              </div>

              <div className="bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
                    Brecha de género no medida detectada
                  </span>
                </div>

                <p className="text-base font-bold text-on-surface">Ejecutiva Comercial · mujeres (8 personas)</p>
                <p className="text-sm text-on-surface-variant mb-5">{CORREDORA.nombre} · Valparaíso</p>

                <div className="mb-5 p-4 bg-surface-container/40 rounded-lg">
                  <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4">
                    Posición vs pares hombres (mismo cargo · misma antigüedad)
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Ene 2021 (incorporación promedio)</span>
                        <span className="font-semibold text-emerald-600">Percentil 52</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: "52%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                        <span>Mayo 2023 — hoy</span>
                        <span className="font-semibold text-red-600">Percentil 31</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: "31%" }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-red-500" />
                    El mercado subió bandas un 18% entre 2021 y 2023. Las mujeres recibieron ajustes del 4%; los hombres, del 14%.
                  </p>
                </div>

                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  Las <strong className="text-on-surface">8 ejecutivas comerciales</strong> perciben en promedio{" "}
                  <strong className="text-on-surface">$462.000 menos por mes</strong> que sus pares hombres
                  con el mismo nivel de seniority y los mismos resultados. La diferencia no está documentada ni justificada.
                </p>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Ver análisis completo <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-on-surface-variant">Recordar en 30 días</button>
                </div>
              </div>
            </motion.div>

            {/* ── Alerta 2: Ley 20.348 ── */}
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
                <span className="text-xs text-white/70">Jueves, 5 oct 2023 · 11:33</span>
              </div>

              <div className="bg-white p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                    Riesgo de demanda laboral detectado
                  </span>
                </div>

                <p className="text-base font-bold text-on-surface">Ley 20.348 — Igualdad en las remuneraciones</p>
                <p className="text-sm text-on-surface-variant mb-5">
                  Diferencia documentada entre cargos equivalentes · <strong>retroactividad 5 años</strong>
                </p>

                <div className="mb-5 p-4 bg-amber-50 border border-amber-100 rounded-lg space-y-3">
                  {[
                    {
                      label: "Diferencia mensual documentada",
                      valor: "$462.000/mes · mismo cargo",
                      colorVal: "text-red-600",
                      icon: <AlertTriangle size={13} className="text-red-500 shrink-0" />,
                    },
                    {
                      label: "Ejecutivas en situación de riesgo",
                      valor: "8 ejecutivas comerciales",
                      colorVal: "text-amber-700",
                      icon: <Users size={13} className="text-amber-600 shrink-0" />,
                    },
                    {
                      label: "Exposición estimada (1 demanda · 5 años)",
                      valor: "~$27.720.000 + intereses",
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
                  Con <strong className="text-on-surface">diferencias salariales documentadas</strong> entre ejecutivos hombres y mujeres del mismo nivel y sin criterios objetivos registrados,{" "}
                  cualquier denuncia activa <strong className="text-on-surface">retroactividad de 5 años</strong> bajo la Ley 20.348.
                </p>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                    Generar criterios objetivos <ChevronRight size={12} />
                  </button>
                  <button className="text-xs text-on-surface-variant">Ver guía legal</button>
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
              10 meses entre la primera señal y el acuerdo extrajudicial — todo originado en una brecha que nunca fue medida.
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
            <p className="text-sm text-on-surface-variant">Actuar en mayo de 2023 vs reaccionar en marzo de 2024.</p>
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
                  $<CountUp to={32} />M
                </div>
              </div>
            </motion.div>

            {/* Con RL */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: E }}
              viewport={{ once: true }}
              className="border border-emerald-100 bg-emerald-50/30 rounded-lg p-5 flex flex-col"
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
                  "Alerta salarial en mayo 2023 → ajuste de brecha antes de que la ejecutiva aceptara otra oferta.",
                  "Alerta legal en octubre 2023 → documentación de criterios objetivos antes de la denuncia.",
                  "Cero denuncias activas. Cero acuerdos extrajudiciales. La cartera, protegida.",
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
            className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
                Retorno sobre la inversión
              </p>
              <p className="text-sm text-on-surface-variant max-w-sm">
                $32M en daños evitables vs $6.5M en corrección de brecha + suscripción.
                Una brecha no medida destruyó en 10 meses lo que tardó 6 años en construirse.
              </p>
            </div>
            <div className="text-6xl font-bold text-emerald-600 shrink-0">
              <CountUp to={7} duration={900} />x
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
              La empresa es ficticia pero representativa de corredoras de seguros de 80–120 empleados en la Región de Valparaíso.
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
                    className="shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors mt-0.5"
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
