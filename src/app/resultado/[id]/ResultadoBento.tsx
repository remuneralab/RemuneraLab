"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, AlertTriangle, Users } from "lucide-react";
import ChartResult from "./ChartResult";
import AIInterpretacion from "./AIInterpretacion";
import OfertasPerfil from "./OfertasPerfil";
import LoginPerfil from "@/components/LoginPerfil";
import { getBrechaCiuo, getBrechaRama, BRECHA_PERIODO } from "@/lib/brecha-genero";
import type { MercadoResult } from "@/lib/mercado";

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
    const start    = performance.now();
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
    <p ref={ref} className="text-5xl sm:text-7xl font-bold text-white leading-none mb-2 tabular-nums"
      style={{ fontFamily: "var(--font-space-mono)" }}>
      {count}%
    </p>
  );
}

interface Props {
  registroId: string;
  percentil: number;
  hasData: boolean;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  n: number;
  n_esi: number;
  n_aviso: number;
  n_trab: number;
  confianza: string;
  cargo: string;
  industria: string;
  region: string;
  salario_mid: number;
  brechaP75: number | null;
  competitividad: string;
  anios_experiencia: number;
  fuente_descripcion: string;
  nivel_cascada: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  grupo_usado: string | null;
  ciuo_codigo: string | null;
  tamano_empresa: string | null;
  sexo: string | null;
  mercado: MercadoResult;
}

const cardClass = "rounded-xl border border-white/10 bg-white/4 p-8";

const SALARIO_MINIMO_CLP = 539_000;
const CIUO_BAJA_MOVILIDAD = ["7", "8", "9"];
const INDUSTRIA_BAJA_MOVILIDAD = ["Construcción", "Manufactura / Industria", "Agricultura"];

export default function ResultadoBento({
  registroId, percentil, hasData, p25, p50, p75, n, n_esi, n_aviso, n_trab, confianza,
  cargo, industria, region, salario_mid, brechaP75, competitividad, anios_experiencia,
  fuente_descripcion, nivel_cascada, grupo_usado, ciuo_codigo, tamano_empresa, sexo, mercado,
}: Props) {
  const brechaCiuo = getBrechaCiuo(ciuo_codigo);
  const brechaRama = getBrechaRama(industria);

  const bajoMinimo    = salario_mid < SALARIO_MINIMO_CLP;
  const bajoMovilidad = ciuo_codigo
    ? CIUO_BAJA_MOVILIDAD.includes(ciuo_codigo[0])
    : INDUSTRIA_BAJA_MOVILIDAD.includes(industria);
  const perfilPrecario = bajoMinimo || (bajoMovilidad && percentil < 50);
  const totalRegistros = n + n_esi + n_aviso + n_trab;
  // Floor defensivo: el p50 nunca debe mostrarse por debajo del mínimo legal
  const p50Display = p50 !== null && p50 < SALARIO_MINIMO_CLP ? SALARIO_MINIMO_CLP : p50;
  const metrics = [
    ...(!perfilPrecario ? [{
      label: "Tu posición salarial",
      value: competitividad,
      sub: `Ganas más que el ${percentil}% de personas con tu cargo y experiencia en ${industria}.`,
      badge: percentil >= 50 ? `Top ${100 - percentil}%` : null,
      size: "text-4xl",
    }] : []),
    {
      label: "Lo que gana la mayoría",
      value: hasData ? formatCLP(p50Display!) : "—",
      sub: perfilPrecario
        ? "Desde el 1 de enero de 2026 el sueldo mínimo en Chile es de $539.000 según lo establecido en la Ley N° 21.751"
        : `Sueldo del medio — la mitad gana más y la mitad gana menos · ${cargo} · ${industria}`,
      badge: null,
      size: "text-3xl",
      soloSubTexto: perfilPrecario,
    },
    ...(!perfilPrecario ? [{
      label: "Para llegar al top 25%",
      value: brechaP75 === null ? "—" : brechaP75 === 0 ? "Ya estás ahí" : formatCLP(brechaP75),
      sub: brechaP75 === 0 ? "Tu sueldo ya supera al 75% del mercado" : "Diferencia mensual para alcanzar al grupo mejor pagado",
      badge: null,
      size: "text-3xl",
    }] : []),
  ];

  return (
    <>
      {/* Aviso ingreso mínimo — máxima visibilidad, aparece primero */}
      {bajoMinimo && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: E }}
          className="mb-8 rounded-xl border-2 border-orange-500/50 bg-orange-950/40 overflow-hidden"
        >
          <div className="bg-orange-500/15 border-b border-orange-500/25 px-7 py-3 flex items-center gap-2">
            <AlertTriangle size={13} className="text-orange-400 shrink-0" />
            <span className="text-orange-300 font-bold uppercase tracking-[0.15em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
              Atención — posible infracción laboral
            </span>
          </div>
          <div className="px-7 py-6">
            <p className="text-white font-bold text-lg mb-3 leading-snug"
              style={{ fontFamily: "var(--font-dm-sans)" }}>
              El sueldo declarado está por debajo del ingreso mínimo mensual ($539.000)
            </p>
            <p className="text-white/55 mb-5 leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>
              Si trabajas 42 horas o más, podría constituir una infracción laboral.
              La Dirección del Trabajo permite presentar denuncias anónimas y gratuitas.
            </p>
            <a
              href="https://www.dt.gob.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/45 text-orange-300 font-semibold px-6 py-3 rounded-lg hover:bg-orange-500/32 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}
            >
              Conoce tus derechos laborales en dt.gob.cl <ArrowRight size={15} />
            </a>
          </div>
        </motion.div>
      )}

      {/* Banner precisión de datos — niveles 3-7 de la cascada */}
      {nivel_cascada >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E }}
          className="mb-8 rounded-xl border border-[#F7C948]/30 bg-[#F7C948]/6 px-6 py-5 flex gap-4"
        >
          <div className="shrink-0 mt-0.5">
            <div className="w-7 h-7 rounded-full bg-[#F7C948]/15 border border-[#F7C948]/30 flex items-center justify-center">
              <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.7rem", color: "#F7C948" }}>i</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-[#F7C948] mb-1 leading-snug"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>
              {nivel_cascada <= 4
                ? "Los datos son de tu grupo de ocupación, no solo de tu cargo exacto"
                : "Los datos son del sector completo, no de tu cargo específico"}
            </p>
            <p className="text-white/50 leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
              {nivel_cascada <= 4
                ? <>No encontramos suficientes registros INE para <span className="text-white/70">{cargo}</span> específicamente. El análisis usa datos del grupo <span className="text-white/70">&ldquo;{grupo_usado}&rdquo;</span>, que agrupa distintas especialidades con rangos salariales similares. Los números pueden variar entre ±10% y ±20% respecto a tu cargo exacto.</>
                : <>No encontramos datos suficientes para <span className="text-white/70">{cargo}</span> en las encuestas del INE. El análisis usa registros del sector <span className="text-white/70">&ldquo;{grupo_usado}&rdquo;</span> en general, que incluye todos los perfiles de esa industria. Toma los percentiles como referencia aproximada, no como cifra precisa.</>
              }
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-5">

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: E }}
          className={`col-span-12 lg:col-span-8 ${cardClass}`}
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                Sueldos en el mercado
              </h2>
              <p className="text-white/40"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                {industria} · {n > 0 ? `${n} contribuciones` : n_aviso > 0 ? `${n_esi} registros ESI + ${n_aviso} avisos` : `ESI 2024 INE · ${n_esi} registros`}
              </p>
            </div>
          </div>

          {hasData ? (
            <ChartResult p25={p25!} p50={p50!} p75={p75!} percentil={percentil} n={n} n_esi={n_esi} n_aviso={n_aviso} />
          ) : (
            <div className="h-[320px] flex items-center justify-center text-white/30 text-sm">
              Aún no hay suficientes datos para mostrar la distribución.
            </div>
          )}

          {/* Brecha de género — integrada en el gráfico de benchmark */}
          {(brechaCiuo !== null || brechaRama !== null) && (() => {
            const brecha = brechaCiuo ?? brechaRama!;
            const neg    = brecha < 0;
            const abs    = Math.abs(brecha).toFixed(1).replace(".", ",");
            const fuenteLabel = brechaCiuo !== null
              ? (() => {
                  const map: Record<string, string> = {
                    "1": "directivos y gerentes", "2": "profesionales universitarios",
                    "3": "técnicos", "4": "administrativos", "5": "servicios",
                    "7": "artesanos y oficios", "8": "operadores", "9": "apoyo",
                  };
                  return ciuo_codigo ? (map[ciuo_codigo[0]] ?? "tu ocupación") : "tu ocupación";
                })()
              : industria;
            return (
              <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-4 flex-wrap">
                <div className="rounded-lg px-3 py-1.5 shrink-0"
                  style={{
                    background: neg ? "rgba(247,201,72,0.08)" : "rgba(133,104,243,0.10)",
                    border: `1px solid ${neg ? "rgba(247,201,72,0.28)" : "rgba(133,104,243,0.28)"}`,
                  }}>
                  <span className="font-bold tabular-nums"
                    style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", color: neg ? "#F7C948" : "#8568f3" }}>
                    {neg ? "−" : "+"}{abs}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(133,104,243,0.55)", letterSpacing: "0.15em", marginBottom: "2px" }}>
                    BRECHA DE GÉNERO · INE ESI · {BRECHA_PERIODO}
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.80rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
                    {neg
                      ? sexo === "F"
                        ? <>Las mujeres en <span style={{ color: "rgba(255,255,255,0.70)" }}>{fuenteLabel}</span> ganan {abs}% menos que los hombres en ingreso mediano</>
                        : sexo === "M"
                        ? <>Las mujeres en <span style={{ color: "rgba(255,255,255,0.70)" }}>{fuenteLabel}</span> ganan {abs}% menos que tú en ingreso mediano</>
                        : <>Las mujeres en <span style={{ color: "rgba(255,255,255,0.70)" }}>{fuenteLabel}</span> ganan {abs}% menos que los hombres en ingreso mediano</>
                      : <>Las mujeres en <span style={{ color: "rgba(255,255,255,0.70)" }}>{fuenteLabel}</span> ganan {abs}% más que los hombres en ingreso mediano</>
                    }
                  </p>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Columna derecha */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

          {/* Percentil destacado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: E, delay: 0.1 }}
            className="rounded-xl p-8 relative overflow-hidden flex-1"
          style={{ border: "1px solid rgba(133,104,243,0.30)", background: "rgba(133,104,243,0.08)" }}
          >
            <div className="pointer-events-none absolute -right-16 -bottom-16 w-64 h-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(133,104,243,0.22) 0%, transparent 70%)" }} />
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={14} style={{ color: "#8568f3" }} />
                <span className="uppercase tracking-[0.2em]" style={{ color: "#8568f3", fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
                  Tu resultado
                </span>
              </div>

              <PercentilCounter target={percentil} />
              <p className="text-white/40 text-sm mb-6"
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                de personas con tu cargo ganan menos
              </p>
              <p className="text-white/60 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)" }}>
                De cada 100 personas que trabajan como{" "}
                <span className="text-white font-bold">{cargo}</span>{" "}
                en {industria}, tú ganas más que {percentil} de ellas.
              </p>

              <div className="mt-auto">
                <span className={`inline-block mt-6 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.15em] ${
                  confianza === "alta"
                    ? "bg-[#8568f3]/15 text-[#8568f3] border border-[#8568f3]/25"
                    : confianza === "media"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                    : "bg-white/10 text-white/40 border border-white/15"
                }`}
                  style={{ fontFamily: "var(--font-space-mono)" }}>
                  {confianza === "alta" ? "Resultado muy confiable" : confianza === "media" ? "Resultado confiable" : "Datos limitados"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Fuentes de datos */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, ease: E, delay: 0.18 }}
            className={cardClass}
            style={{ borderLeft: "2px solid rgba(133,104,243,0.50)" }}
          >
            <div className="flex justify-between items-start mb-5">
              <p className="text-white/40 uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
                Fuentes del benchmark
              </p>
              <ShieldCheck size={16} style={{ color: "rgba(133,104,243,0.55)" }} />
            </div>
            <div className="space-y-3">
              {(() => {
                const total = n + n_esi + n_aviso + n_trab;
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>RemuneraLab</span>
                      <span className="text-white text-sm font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)" }}>{n} registros</span>
                    </div>
                    <div className="w-full bg-white/8 rounded-full h-1">
                      <div className="h-1 rounded-full transition-all" style={{ width: total > 0 ? `${Math.round((n / total) * 100)}%` : "0%", background: "#8568f3" }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>ESI 2024 · INE</span>
                      <span className="text-sm font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: "#a387f5" }}>{n_esi} registros</span>
                    </div>
                    <div className="w-full bg-white/8 rounded-full h-1">
                      <div className="h-1 rounded-full transition-all" style={{ width: total > 0 ? `${Math.round((n_esi / total) * 100)}%` : "100%", background: "#a387f5" }} />
                    </div>
                    {n_aviso > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>Avisos actuales</span>
                          <span className="text-sm font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: "#e7e4fd" }}>{n_aviso} avisos</span>
                        </div>
                        <div className="w-full bg-white/8 rounded-full h-1">
                          <div className="h-1 rounded-full transition-all" style={{ width: `${Math.round((n_aviso / total) * 100)}%`, background: "#e7e4fd" }} />
                        </div>
                      </>
                    )}
                    {n_trab > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>Trabajando.cl · nacional</span>
                          <span className="text-[#F7C948] text-sm font-bold" style={{ fontFamily: "var(--font-space-mono)" }}>prior</span>
                        </div>
                        <div className="w-full bg-white/8 rounded-full h-1">
                          <div className="bg-[#F7C948] h-1 rounded-full transition-all"
                            style={{ width: `${Math.round((n_trab / total) * 100)}%` }} />
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
              <div className="pt-3 mt-1 border-t border-white/8">
                <p className="text-white/30 uppercase tracking-[0.15em] mb-1"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", fontWeight: 700 }}>
                  Comparado con
                </p>
                <p className="text-white/60"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                  {fuente_descripcion}
                </p>
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
            className={`${m.soloSubTexto ? "col-span-12" : "col-span-12 md:col-span-4"} ${cardClass}`}
          >
            {!m.soloSubTexto && (
              <>
                <p className="text-white/30 uppercase tracking-widest mb-4"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
                  {m.label}
                </p>
                <div className="flex items-end gap-3 mb-3">
                  <h4 className={`${m.size} font-bold text-white`}
                    style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {m.value}
                  </h4>
                  {m.badge && (
                    <span className="flex items-center font-bold mb-1 text-sm" style={{ color: "#8568f3" }}>
                      <TrendingUp size={14} className="mr-1" /> {m.badge}
                    </span>
                  )}
                </div>
              </>
            )}
            <p className={m.soloSubTexto ? "text-white/60 text-base leading-relaxed" : "text-white/35"}
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: m.soloSubTexto ? "0.95rem" : "0.8rem" }}>
              {m.sub}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Drift salarial — tendencia de avisos de empleo */}
      {mercado.drift !== null && (() => {
        const { pct_cambio, mediana_reciente, mediana_anterior } = mercado.drift;
        const subiendo = pct_cambio >= 0;
        return (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: E }}
            className="mt-5 max-w-sm"
          >
            <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/35 uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                  Tendencia salarial · vs 90 días anteriores
                </p>
                <span className="text-white/20 shrink-0 ml-3"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem" }}>
                  Avisos
                </span>
              </div>
              <p className="text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-dm-sans)", color: subiendo ? "#8568f3" : "#F7C948" }}>
                {subiendo ? "+" : ""}{pct_cambio.toFixed(1).replace(".", ",")}%
              </p>
              <p className="text-white/50 leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                Los avisos muestran sueldos{" "}
                <span className="text-white/70 font-medium">{subiendo ? "subiendo" : "bajando"}</span>{" "}
                — mediana actual {formatCLP(Math.round(mediana_reciente))} vs{" "}
                {formatCLP(Math.round(mediana_anterior))} hace 90 días
              </p>
            </div>
          </motion.div>
        );
      })()}

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
          className="mt-5 rounded-xl border border-amber-500/20 bg-amber-900/15 px-6 py-4"
        >
          <p className="text-amber-400/80"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
            Hay pocos datos de RemuneraLab para tu perfil exacto — los números se basan principalmente en la{" "}
            <span className="font-bold text-amber-400">Encuesta Suplementaria de Ingresos 2024 (INE)</span>.{" "}
            Mientras más personas compartan su sueldo, más preciso será el resultado para todos.
          </p>
        </motion.div>
      )}

      {/* Bloque colectivo: para perfiles de baja movilidad */}
      {perfilPrecario && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: E }}
          className="mt-5 rounded-xl px-6 py-5"
          style={{ border: "1px solid rgba(133,104,243,0.18)", background: "rgba(133,104,243,0.06)" }}
        >
          <div className="flex items-start gap-3">
            <Users size={16} className="mt-0.5 shrink-0" style={{ color: "rgba(133,104,243,0.70)" }} />
            <p className="text-white/45"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", lineHeight: "1.6" }}>
              Tu información suma a los{" "}
              <span className="text-white/70 font-semibold">{totalRegistros.toLocaleString("es-CL")} registros</span>{" "}
              que visibilizan la realidad salarial en Chile.
            </p>
          </div>
        </motion.div>
      )}

      {/* Ofertas de trabajo: solo para perfiles con movilidad real */}
      {!perfilPrecario && <OfertasPerfil cargo={cargo} industria={industria} region={region} />}

      {/* Perfil de carrera */}
      <LoginPerfil registroId={registroId} />

      {/* CTA bottom */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: E }}
        className="mt-14 rounded-xl border border-white/10 bg-white/3 p-10 flex flex-col md:flex-row items-center gap-10"
      >
        <div className="w-full text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-dm-sans)" }}>
            ¿Quieres ver otro perfil salarial?
          </h2>
          <p className="text-white/40 mb-8"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}>
            Ingresa un nuevo cargo o industria para comparar más posiciones en el mercado chileno.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href="/formulario"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #8568f3, #a387f5)",
                color: "#ffffff",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.95rem",
                boxShadow: "0 0 36px rgba(133,104,243,0.40), 0 2px 12px rgba(133,104,243,0.25)",
              }}
            >
              Nuevo análisis <ArrowRight size={16} />
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/60 px-8 py-4 rounded hover:border-white/30 hover:text-white/80 transition-all"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}
            >
              Ir al inicio
            </a>
          </div>
        </div>
      </motion.section>
    </>
  );
}
