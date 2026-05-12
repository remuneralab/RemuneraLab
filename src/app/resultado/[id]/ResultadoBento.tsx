"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import ChartResult from "./ChartResult";
import AIInterpretacion from "./AIInterpretacion";

const E = [0.16, 1, 0.3, 1] as const;

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

function PercentilCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref    = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const p     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <p ref={ref} className="text-5xl sm:text-7xl font-bold text-white leading-none mb-2 tabular-nums">
      {count}
    </p>
  );
}

interface Props {
  percentil: number;
  hasData: boolean;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  n: number;
  n_esi: number;
  confianza: string;
  cargo: string;
  industria: string;
  region: string;
  salario_mid: number;
  brechaP75: number | null;
  competitividad: string;
  anios_experiencia: number;
  fuente_descripcion: string;
}

export default function ResultadoBento({
  percentil, hasData, p25, p50, p75, n, n_esi, confianza,
  cargo, industria, region, salario_mid, brechaP75, competitividad, anios_experiencia,
  fuente_descripcion,
}: Props) {
  const metrics = [
    {
      label: "Competitividad",
      value: competitividad,
      sub: `Superas al ${percentil}% de personas con tu cargo y experiencia en ${industria}.`,
      badge: percentil >= 50 ? `Top ${100 - percentil}%` : null,
      size: "text-4xl",
    },
    {
      label: "Mediana del mercado (P50)",
      value: hasData ? formatCLP(p50!) : "—",
      sub: `${cargo} · ${industria} · ${region}`,
      badge: null,
      size: "text-3xl",
    },
    {
      label: "Brecha al P75",
      value: brechaP75 === null ? "—" : brechaP75 === 0 ? "Alcanzado" : formatCLP(brechaP75),
      sub: brechaP75 === 0 ? "Ya estás en el cuartil superior" : "Para alcanzar el cuartil superior",
      badge: null,
      size: "text-3xl",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: E }}
          className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-8 shadow-sm"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-bold text-primary">Distribución Salarial</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                {industria} · {n > 0 ? `${n} contribuciones` : `ESI 2024 INE · ${n_esi} registros`}
              </p>
            </div>
          </div>

          {hasData ? (
            <ChartResult p25={p25!} p50={p50!} p75={p75!} percentil={percentil} n={n} />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-on-surface-variant text-sm">
              Aún no hay suficientes datos para mostrar la distribución.
            </div>
          )}
        </motion.div>

        {/* Columna derecha */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Percentil destacado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: E, delay: 0.1 }}
            className="bg-primary-container text-white rounded-2xl p-8 relative overflow-hidden flex-1 shadow-2xl"
          >
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                <Sparkles size={16} className="text-tertiary-fixed" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Tu posición</span>
              </div>

              <PercentilCounter target={percentil} />
              <p className="text-on-primary-container text-sm mb-6">percentil</p>
              <p className="text-on-primary-container text-sm leading-relaxed">
                Superas al{" "}
                <span className="text-white font-bold">{percentil}%</span>{" "}
                de personas con tu cargo y experiencia en {industria}.
              </p>

              <div className="mt-auto">
                <span className={`inline-block mt-6 text-xs font-bold px-3 py-1 rounded-full ${
                  confianza === "alta"
                    ? "bg-tertiary-fixed/20 text-tertiary-fixed"
                    : confianza === "media"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-white/10 text-white/60"
                }`}>
                  Confianza {confianza}
                </span>
              </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20" />
          </motion.div>

          {/* Fuentes de datos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease: E, delay: 0.18 }}
            className="glass-panel rounded-2xl p-6 shadow-sm border-l-4 border-secondary"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                Fuentes del benchmark
              </p>
              <ShieldCheck size={20} className="text-outline-variant" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">RemuneraLab</span>
                <span className="text-sm font-bold text-primary">{n} registros</span>
              </div>
              <div className="w-full bg-outline-variant/15 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: n + n_esi > 0 ? `${Math.round((n / (n + n_esi)) * 100)}%` : "0%" }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-on-surface-variant">ESI 2024 · INE</span>
                <span className="text-sm font-bold text-secondary">{n_esi} registros</span>
              </div>
              <div className="w-full bg-outline-variant/15 rounded-full h-1.5">
                <div
                  className="bg-secondary h-1.5 rounded-full transition-all"
                  style={{ width: n + n_esi > 0 ? `${Math.round((n_esi / (n + n_esi)) * 100)}%` : "100%" }}
                />
              </div>
              <div className="pt-3 mt-1 border-t border-outline-variant/20">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-1">
                  Comparado con
                </p>
                <p className="text-xs text-on-surface font-medium">{fuente_descripcion}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metric cards */}
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: E, delay: i * 0.07 }}
            className="col-span-12 md:col-span-4 glass-panel rounded-2xl p-8 shadow-sm"
          >
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              {m.label}
            </p>
            <div className="flex items-end gap-3 mb-3">
              <h4 className={`${m.size} font-bold text-primary`}>{m.value}</h4>
              {m.badge && (
                <span className="flex items-center text-emerald-600 font-bold mb-1 text-sm">
                  <TrendingUp size={16} className="mr-1" /> {m.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-medium">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      <AIInterpretacion
        cargo={cargo}
        industria={industria}
        anios_experiencia={anios_experiencia}
        region={region}
        salario_mid={salario_mid}
        percentil={percentil}
        p25={p25}
        p50={p50}
        p75={p75}
        n={n}
        confianza={confianza}
      />

      {confianza === "baja" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: E }}
          className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4"
        >
          <p className="text-sm text-amber-800 font-medium">
            Pocos datos de RemuneraLab para tu perfil específico — el benchmark usa la{" "}
            <span className="font-bold">Encuesta Suplementaria de Ingresos 2024 (INE)</span>{" "}
            como referencia de mercado. Tu aporte hará el resultado más preciso.
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: E }}
        className="mt-6 bg-secondary-container/20 border border-secondary-container/40 rounded-2xl px-6 py-4"
      >
        <p className="text-sm text-on-secondary-container">
          Gracias por contribuir. Cada dato que compartes hace el benchmark más preciso para todos.
        </p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: E }}
        className="mt-16 bg-surface-container rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 border border-outline-variant/30"
      >
        <div className="md:w-full text-center md:text-left">
          <h2 className="text-2xl font-bold text-primary mb-4">
            ¿Quieres ver otro perfil salarial?
          </h2>
          <p className="text-on-surface-variant mb-8">
            Ingresa un nuevo cargo o industria para comparar más posiciones en el mercado chileno.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="/formulario"
              className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl text-center"
            >
              Nuevo análisis
            </a>
            <a
              href="/"
              className="bg-white border border-outline-variant text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container transition-all text-center"
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </motion.section>
    </>
  );
}
