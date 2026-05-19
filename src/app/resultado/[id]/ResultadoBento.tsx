"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp, AlertTriangle, Users } from "lucide-react";
import ChartResult from "./ChartResult";
import AIInterpretacion from "./AIInterpretacion";
import OfertasPerfil from "./OfertasPerfil";
import LoginPerfil from "@/components/LoginPerfil";
import { getTendenciaSector, getTendenciaTamano, getTendenciaCIUO, getTendenciaSexo, EMRCL_PERIODO } from "@/lib/emrcl";
import { getBrechaCiuo, getBrechaRama, BRECHA_PERIODO } from "@/lib/brecha-genero";
import { getTasaRegion, TASA_NACIONAL, ENE_PERIODO } from "@/lib/ene";
import { getCostoLaboral, ICL_PERIODO } from "@/lib/icl";
import type { MercadoResult } from "@/lib/mercado";

const E = [0.16, 1, 0.3, 1] as const;

function calcularTension(
  nEfectivo: number,
  isLocal: boolean,
  tasaRegion: number,
  tasaNacional: number,
): { label: string; color: string; descripcion: string } {
  const scoreVacantes = isLocal
    ? (nEfectivo >= 10 ? 2 : nEfectivo >= 4 ? 1 : 0)
    : (nEfectivo >= 20 ? 2 : nEfectivo >= 8 ? 1 : 0);
  // Desocupación baja = mercado de talento ajustado = más tensión para el empleador
  const scoreEne =
    tasaRegion <= tasaNacional - 1.5 ? 2 :
    tasaRegion >= tasaNacional + 1.5 ? 0 : 1;
  const total = scoreVacantes + scoreEne;
  if (total >= 3) return {
    label: "Alta tensión laboral",
    color: "#F7C948",
    descripcion: "Muchas vacantes activas y baja desocupación regional — fuerte competencia por talento, buen momento para negociar.",
  };
  if (total === 2) return {
    label: "Tensión moderada",
    color: "#8568f3",
    descripcion: "Demanda activa de empleadores con disponibilidad de candidatos moderada — mercado en movimiento.",
  };
  if (total === 1) return {
    label: "Mercado equilibrado",
    color: "rgba(255,255,255,0.55)",
    descripcion: "Balance entre oferta de candidatos y demanda de empleadores en tu región.",
  };
  return {
    label: "Mercado holgado",
    color: "rgba(255,255,255,0.3)",
    descripcion: "Pocas vacantes activas y alta desocupación regional — hay más candidatos que empleos disponibles.",
  };
}

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
  const tendenciaSector = getTendenciaSector(industria);
  const tendenciaTamano = tamano_empresa ? getTendenciaTamano(tamano_empresa) : null;
  const tendenciaCIUO   = getTendenciaCIUO(ciuo_codigo);

  const brechaCiuo = getBrechaCiuo(ciuo_codigo);
  const brechaRama = getBrechaRama(industria);
  const tasaRegion = getTasaRegion(region);
  const tendenciaSexo = (sexo === "M" || sexo === "F") ? getTendenciaSexo(sexo) : null;
  const costoLaboral = getCostoLaboral(industria);

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

      {/* Presión de mercado y drift salarial — avisos de empleo */}
      {(mercado.presion !== null || mercado.drift !== null) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: E }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/30 uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
              Demanda y tendencia del mercado
            </p>
            <span className="text-white/20 shrink-0"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
              Avisos de empleo · últimos 90 días
            </span>
          </div>
          {(() => {
            const showTension = mercado.presion !== null && tasaRegion !== null;
            const count = [mercado.presion, mercado.drift].filter(Boolean).length;
            const cols  = count === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2";
            return (
              <>
                {/* Card de tensión laboral — combina avisos (presión) con ENE (desocupación) */}
                {showTension && (() => {
                  const p = mercado.presion!;
                  const nEfectivo = p.n_region > 0 ? p.n_region : p.n_nacional;
                  const isLocal   = p.n_region > 0;
                  const tension   = calcularTension(nEfectivo, isLocal, tasaRegion!, TASA_NACIONAL);
                  return (
                    <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5 mb-4">
                      <p className="text-white/35 uppercase tracking-widest mb-3"
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                        Índice de tensión laboral · {isLocal ? region : "nacional"}
                      </p>
                      <p className="text-2xl font-bold mb-2"
                        style={{ fontFamily: "var(--font-dm-sans)", color: tension.color }}>
                        {tension.label}
                      </p>
                      <p className="text-white/50 leading-relaxed mb-3"
                        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                        {tension.descripcion}
                      </p>
                      <div className="flex gap-3 flex-wrap"
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                        <span className="text-white/30">
                          {nEfectivo} vacante{nEfectivo !== 1 ? "s" : ""} · últimos 90d
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/30">
                          {tasaRegion!.toFixed(1).replace(".", ",")}% desocupación {isLocal ? region : ""}
                          {" "}vs {TASA_NACIONAL.toFixed(1).replace(".", ",")}% nacional
                        </span>
                      </div>
                    </div>
                  );
                })()}
                <div className={`grid gap-4 ${cols}`}>
                {mercado.presion !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      Vacantes activas · {mercado.presion.n_region > 0 ? region : "a nivel nacional"}
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "#8568f3" }}>
                      {mercado.presion.n_region > 0 ? mercado.presion.n_region : mercado.presion.n_nacional}
                    </p>
                    <p className="text-white/50 leading-relaxed mb-3"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      {mercado.presion.n_region > 0 ? (
                        <>Avisos publicados en <span className="text-white/70 font-medium">{region}</span> · {mercado.presion.n_nacional} a nivel nacional</>
                      ) : (
                        <>Avisos publicados a nivel nacional · sin registros en {region} aún</>
                      )}
                    </p>
                    {mercado.presion.fuentes.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {mercado.presion.fuentes.map(f => (
                          <span key={f}
                            className="rounded-full border border-white/10 px-2 py-0.5 text-white/35"
                            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                            {f === "BNE" ? "BNE · Gobierno" : f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {mercado.drift !== null && (() => {
                  const { pct_cambio, mediana_reciente, mediana_anterior } = mercado.drift!;
                  const subiendo = pct_cambio >= 0;
                  return (
                    <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                      <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                        Drift salarial · vs 90 días anteriores
                      </p>
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
                  );
                })()}
              </div>
            </>
          );
          })()}
        </motion.div>
      )}

      {/* Tendencias de mercado — datos INE EMRCL */}
      {(tendenciaSector !== null || tendenciaTamano !== null || tendenciaCIUO !== null || tendenciaSexo !== null) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: E }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/30 uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
              Cómo se están moviendo los sueldos en Chile
            </p>
            <span className="text-white/20 shrink-0"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
              INE · EMRCL · {EMRCL_PERIODO}
            </span>
          </div>

          {(() => {
            const cardValues = [tendenciaSector, tendenciaTamano, tendenciaCIUO, tendenciaSexo];
            const count = cardValues.filter((v) => v !== null).length;
            const cols =
              count === 1 ? "grid-cols-1" :
              count === 2 ? "grid-cols-1 sm:grid-cols-2" :
              count === 3 ? "grid-cols-1 sm:grid-cols-3" :
                            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
            const ciuoGrupoLabel: Record<string, string> = {
              "1": "directivos y gerentes",
              "2": "profesionales universitarios",
              "3": "técnicos de nivel medio",
              "4": "trabajadores administrativos",
              "5": "trabajadores de servicios",
              "7": "artesanos y trabajadores de oficio",
              "8": "operadores de máquinas y conductores",
              "9": "trabajadores de apoyo",
            };
            const ciuoLabel = ciuo_codigo ? (ciuoGrupoLabel[ciuo_codigo[0]] ?? "tu tipo de trabajo") : "tu tipo de trabajo";
            const sexoLabel = sexo === "F" ? "mujeres" : "hombres";
            return (
              <div className={`grid gap-4 ${cols}`}>
                {tendenciaSector !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      En tu rubro
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "#8568f3" }}>
                      +{tendenciaSector.toFixed(1).replace(".", ",")}%
                    </p>
                    <p className="text-white/50 leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      Los sueldos en{" "}
                      <span className="text-white/70 font-medium">{industria}</span>{" "}
                      subieron el último año
                    </p>
                  </div>
                )}
                {tendenciaTamano !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      En tu tipo de empresa
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "#8568f3" }}>
                      +{tendenciaTamano.var12.toFixed(1).replace(".", ",")}%
                    </p>
                    <p className="text-white/50 leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      Los sueldos en{" "}
                      <span className="text-white/70 font-medium">{tendenciaTamano.label}</span>{" "}
                      subieron el último año
                    </p>
                  </div>
                )}
                {tendenciaCIUO !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      En tu tipo de trabajo
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "#8568f3" }}>
                      +{tendenciaCIUO.toFixed(1).replace(".", ",")}%
                    </p>
                    <p className="text-white/50 leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      Los sueldos entre{" "}
                      <span className="text-white/70 font-medium">{ciuoLabel}</span>{" "}
                      subieron el último año
                    </p>
                  </div>
                )}
                {tendenciaSexo !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      En tu grupo
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "#8568f3" }}>
                      +{tendenciaSexo.toFixed(1).replace(".", ",")}%
                    </p>
                    <p className="text-white/50 leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      Los sueldos de las{" "}
                      <span className="text-white/70 font-medium">{sexoLabel}</span>{" "}
                      subieron el último año a nivel nacional
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Costo laboral — datos INE EMRCL ICL */}
      {costoLaboral !== null && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: E }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/30 uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
              Costo laboral en tu sector
            </p>
            <span className="text-white/20 shrink-0"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
              INE · EMRCL · {ICL_PERIODO}
            </span>
          </div>
          <div className={`grid gap-4 ${tendenciaSector !== null ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-1 max-w-sm"}`}>
            <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
              <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                Índice de costo laboral · tu rubro
              </p>
              <p className="text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-dm-sans)", color: "#06D6A0" }}>
                +{costoLaboral.toFixed(1).replace(".", ",")}%
              </p>
              <p className="text-white/50 leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                Contratar en{" "}
                <span className="text-white/70 font-medium">{industria}</span>{" "}
                costó ese porcentaje más el último año — incluye sueldos, cotizaciones y beneficios
              </p>
            </div>
            {tendenciaSector !== null && (() => {
              const diff = costoLaboral - tendenciaSector;
              return (
                <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                  <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                    Sueldos vs. costo total
                  </p>
                  <div className="flex items-end gap-3 mb-2">
                    <p className="text-3xl font-bold"
                      style={{ fontFamily: "var(--font-dm-sans)", color: "#a387f5" }}>
                      +{tendenciaSector.toFixed(1).replace(".", ",")}%
                    </p>
                    <p className="text-white/30 text-xs mb-1.5"
                      style={{ fontFamily: "var(--font-space-mono)" }}>
                      IR vs +{costoLaboral.toFixed(1).replace(".", ",")}% ICL
                    </p>
                  </div>
                  <p className="text-white/50 leading-relaxed"
                    style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                    {diff > 0.5
                      ? <>Los costos no salariales (cotizaciones, beneficios) están subiendo más rápido que los sueldos en <span className="text-white/70 font-medium">{industria}</span></>
                      : diff < -0.5
                      ? <>Los sueldos en <span className="text-white/70 font-medium">{industria}</span> están liderando el alza — los costos no salariales crecen a menor ritmo</>
                      : <>El alza del costo en <span className="text-white/70 font-medium">{industria}</span> está siendo impulsada principalmente por aumento de sueldos</>
                    }
                  </p>
                </div>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Desocupación regional — datos INE ENE */}
      {tasaRegion !== null && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: E }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/30 uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
              Mercado laboral en tu región
            </p>
            <span className="text-white/20 shrink-0"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
              INE · ENE · {ENE_PERIODO}
            </span>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
              <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                Tasa de desocupación · {region}
              </p>
              <p className="text-3xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  color: tasaRegion > TASA_NACIONAL ? "#F7C948" : "#8568f3",
                }}>
                {tasaRegion.toFixed(1).replace(".", ",")}%
              </p>
              <p className="text-white/50 leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                {tasaRegion > TASA_NACIONAL
                  ? <>Mayor que el promedio nacional{" "}
                      <span className="text-white/40">({TASA_NACIONAL.toFixed(1).replace(".", ",")}%)</span>
                      {" "}— más personas buscan trabajo en tu región</>
                  : tasaRegion < TASA_NACIONAL
                  ? <>Menor que el promedio nacional{" "}
                      <span className="text-white/40">({TASA_NACIONAL.toFixed(1).replace(".", ",")}%)</span>
                      {" "}— mercado laboral más ajustado en tu región</>
                  : <>Igual al promedio nacional ({TASA_NACIONAL.toFixed(1).replace(".", ",")}%)</>
                }
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
              <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                Qué significa para tu sueldo
              </p>
              <p className="text-white/70 leading-relaxed"
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", lineHeight: "1.65" }}>
                {tasaRegion <= TASA_NACIONAL - 1
                  ? "Con baja desocupación en tu región, hay más demanda que oferta de trabajo — tienes más poder de negociación salarial."
                  : tasaRegion >= TASA_NACIONAL + 1
                  ? "La alta desocupación regional implica más competencia por cada vacante — el mercado presiona los sueldos a la baja."
                  : "La desocupación en tu región está en línea con el promedio nacional, sin presión extrema en ningún sentido."
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Brecha de género — datos INE ESI */}
      {(brechaCiuo !== null || brechaRama !== null) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: E }}
          className="mt-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/30 uppercase tracking-[0.2em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
              Brecha de género en el mercado
            </p>
            <span className="text-white/20 shrink-0"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
              INE · ESI · {BRECHA_PERIODO}
            </span>
          </div>
          {(() => {
            const cards = [brechaCiuo, brechaRama].filter((v) => v !== null).length;
            const cols = cards === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
            const ciuoGrupoLabel: Record<string, string> = {
              "1": "directivos y gerentes",
              "2": "profesionales universitarios",
              "3": "técnicos de nivel medio",
              "4": "trabajadores administrativos",
              "5": "trabajadores de servicios",
              "6": "trabajadores agropecuarios",
              "7": "artesanos y trabajadores de oficio",
              "8": "operadores de maquinaria y conductores",
              "9": "trabajadores de apoyo",
            };
            const ciuoLabel = ciuo_codigo ? (ciuoGrupoLabel[ciuo_codigo[0]] ?? "tu tipo de trabajo") : "tu tipo de trabajo";
            const fmtBrecha = (v: number) => {
              const abs = Math.abs(v).toFixed(1).replace(".", ",");
              return v < 0 ? `-${abs}%` : `+${abs}%`;
            };
            return (
              <div className={`grid gap-4 ${cols}`}>
                {brechaCiuo !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      En tu tipo de trabajo
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: brechaCiuo < 0 ? "#F7C948" : "#8568f3" }}>
                      {fmtBrecha(brechaCiuo)}
                    </p>
                    <p className="text-white/50 leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      {brechaCiuo < 0 ? (
                        sexo === "F"
                          ? <>Podrías estar en la parte afectada: las mujeres ganan un <span className="text-white/70 font-medium">{Math.abs(brechaCiuo).toFixed(1).replace(".", ",")}% menos</span> entre {ciuoLabel}</>
                          : sexo === "M"
                          ? <>Las mujeres en tu misma ocupación ganan un <span className="text-white/70 font-medium">{Math.abs(brechaCiuo).toFixed(1).replace(".", ",")}% menos</span> en ingreso mediano</>
                          : <>En ingreso mediano, la brecha entre mujeres y hombres es de <span className="text-white/70 font-medium">{Math.abs(brechaCiuo).toFixed(1).replace(".", ",")}%</span> entre {ciuoLabel}</>
                      ) : (
                        <>Las mujeres ganan un <span className="text-white/70 font-medium">{brechaCiuo.toFixed(1).replace(".", ",")}% más</span> en ingreso mediano entre {ciuoLabel}</>
                      )}
                    </p>
                  </div>
                )}
                {brechaRama !== null && (
                  <div className="rounded-xl border border-white/8 bg-white/3 px-6 py-5">
                    <p className="text-white/35 text-xs mb-3 uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem" }}>
                      En tu rubro
                    </p>
                    <p className="text-3xl font-bold mb-2"
                      style={{ fontFamily: "var(--font-dm-sans)", color: brechaRama < 0 ? "#F7C948" : "#8568f3" }}>
                      {fmtBrecha(brechaRama)}
                    </p>
                    <p className="text-white/50 leading-relaxed"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem" }}>
                      {brechaRama < 0 ? (
                        sexo === "F"
                          ? <>En <span className="text-white/70 font-medium">{industria}</span>, las mujeres ganan un {Math.abs(brechaRama).toFixed(1).replace(".", ",")}% menos en ingreso mediano</>
                          : sexo === "M"
                          ? <>Las mujeres en <span className="text-white/70 font-medium">{industria}</span> ganan un {Math.abs(brechaRama).toFixed(1).replace(".", ",")}% menos que los hombres en ingreso mediano</>
                          : <>La brecha de género en <span className="text-white/70 font-medium">{industria}</span> es de {Math.abs(brechaRama).toFixed(1).replace(".", ",")}% en ingreso mediano</>
                      ) : (
                        <>Las mujeres en <span className="text-white/70 font-medium">{industria}</span> ganan un {brechaRama.toFixed(1).replace(".", ",")}% más en ingreso mediano</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}

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
