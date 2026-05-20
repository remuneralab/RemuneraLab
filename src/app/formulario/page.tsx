"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { clasificarCargo, type CiuoMatch } from "@/lib/ciuo08";

const CIUO_INDUSTRIA_ESPERADA: Record<string, { industrias: string[]; sector: string }> = {
  "22": { industrias: ["Salud"],                                                sector: "salud" },
  "23": { industrias: ["Educación", "Gobierno / Sector Público"],               sector: "educación" },
  "61": { industrias: ["Agricultura"],                                           sector: "agricultura" },
  "62": { industrias: ["Agricultura"],                                           sector: "agricultura" },
  "71": { industrias: ["Construcción", "Manufactura / Industria"],              sector: "construcción" },
  "72": { industrias: ["Construcción", "Manufactura / Industria"],              sector: "oficios industriales" },
  "81": { industrias: ["Manufactura / Industria", "Minería", "Transporte y Logística"], sector: "operaciones industriales" },
  "82": { industrias: ["Manufactura / Industria", "Minería"],                   sector: "manufactura" },
  "83": { industrias: ["Transporte y Logística"],                               sector: "transporte" },
};

function detectarMalaCombo(ciuo: CiuoMatch | null, industriaValue: string): string | null {
  if (!ciuo || !industriaValue) return null;
  const prefijo = ciuo.codigo.slice(0, 2);
  const esperada = CIUO_INDUSTRIA_ESPERADA[prefijo];
  if (!esperada || esperada.industrias.includes(industriaValue)) return null;
  return `Este cargo suele pertenecer al sector ${esperada.sector}. ¿Estás seguro de que tu industria es correcta?`;
}

const INDUSTRIAS: { label: string; value: string }[] = [
  { label: "Tecnología",               value: "Tecnología" },
  { label: "Retail / Comercio",        value: "Retail / Comercio" },
  { label: "Finanzas",                 value: "Finanzas y Seguros" },
  { label: "Seguros",                  value: "Finanzas y Seguros" },
  { label: "Salud",                    value: "Salud" },
  { label: "Educación",                value: "Educación" },
  { label: "Manufactura / Industria",  value: "Manufactura / Industria" },
  { label: "Minería",                  value: "Minería" },
  { label: "Construcción",             value: "Construcción" },
  { label: "Transporte y Logística",   value: "Transporte y Logística" },
  { label: "Agricultura",              value: "Agricultura" },
  { label: "Sector Público",           value: "Gobierno / Sector Público" },
  { label: "Servicios",                value: "Servicios" },
  { label: "Otro",                     value: "Otro" },
];

const REGIONES = [
  "Arica y Parinacota","Tarapacá","Antofagasta","Atacama","Coquimbo",
  "Valparaíso","Metropolitana","O'Higgins","Maule","Ñuble",
  "Biobío","La Araucanía","Los Ríos","Los Lagos","Aysén","Magallanes",
];

const TAMANOS_EMPRESA = [
  "Microempresa (1–9 empleados)",
  "Pequeña empresa (10–49 empleados)",
  "Mediana empresa (50–199 empleados)",
  "Gran empresa (200+ empleados)",
];

// Escala logarítmica: da resolución útil en el rango $200k–$2M donde está la mayoría
const SALARY_MIN = 200_000;
const SALARY_MAX = 15_000_000;
const SALARY_LOG_MIN = Math.log(SALARY_MIN);
const SALARY_LOG_MAX = Math.log(SALARY_MAX);
const SALARIO_MINIMO = 539_000;

function sliderToSalary(pos: number): number {
  const logVal = SALARY_LOG_MIN + (pos / 1000) * (SALARY_LOG_MAX - SALARY_LOG_MIN);
  return Math.round(Math.exp(logVal) / 25_000) * 25_000;
}

function salaryToSliderPos(salary: number): number {
  const clamped = Math.max(SALARY_MIN, Math.min(SALARY_MAX, salary));
  return Math.round(((Math.log(clamped) - SALARY_LOG_MIN) / (SALARY_LOG_MAX - SALARY_LOG_MIN)) * 1000);
}

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

interface FormData {
  cargo: string;
  industria: string;
  anios_experiencia: string;
  region: string;
  tamano_empresa: string;
  salario_exacto: number;
  sexo: string;
}

const fieldClass =
  "w-full px-4 py-3.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:border-[#8568f3] focus:bg-white/8 transition-all text-sm";

const selectClass =
  "w-full px-4 py-3.5 rounded-lg border border-white/10 bg-[#180b3b] text-white focus:outline-none focus:border-[#8568f3] transition-all text-sm appearance-none cursor-pointer";

const labelClass =
  "block mb-2 uppercase tracking-[0.18em] text-white/40";

export default function Formulario() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    cargo: "", industria: "", anios_experiencia: "",
    region: "", tamano_empresa: "", salario_exacto: 700_000, sexo: "",
  });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [ciuo, setCiuo]               = useState<CiuoMatch | null>(null);
  const [esJornadaParcial, setEsJornadaParcial] = useState(false);
  const [horasSemana, setHorasSemana] = useState(20);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    sendGAEvent("event", "formulario_inicio");
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCargoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, cargo: value }));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setCiuo(clasificarCargo(value)), 350);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const industriaDB = INDUSTRIAS.find((i) => i.label === form.industria)?.value ?? form.industria;
    const res = await fetch("/api/contribuir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cargo: form.cargo,
        industria: industriaDB,
        anios_experiencia: parseInt(form.anios_experiencia),
        region: form.region,
        tamano_empresa: form.tamano_empresa,
        salario_min: form.salario_exacto,
        salario_max: form.salario_exacto,
        ciuo_codigo: ciuo?.codigo ?? null,
        sexo: form.sexo || null,
      }),
    });
    const data = await res.json();
    if (res.status === 429) { setRateLimited(true); setLoading(false); return; }
    if (!res.ok || !data.id) {
      setError(data.error ?? "No se pudo guardar la información. Intenta nuevamente.");
      sendGAEvent("event", "benchmark_error", { cargo: form.cargo, industria: form.industria });
      setLoading(false);
      return;
    }
    sendGAEvent("event", "benchmark_calculado", {
      cargo: form.cargo,
      industria: INDUSTRIAS.find(i => i.label === form.industria)?.value ?? form.industria,
      region: form.region,
      anios_experiencia: parseInt(form.anios_experiencia),
      rango_salarial: form.salario_exacto < 800_000 ? "bajo" : form.salario_exacto < 2_000_000 ? "medio" : "alto",
    });
    router.push(`/resultado/${data.id}${esJornadaParcial && horasSemana < 42 ? `?horas=${horasSemana}` : ""}`);
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#180b3b" }}>

      {/* Glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.18) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.11) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(133,104,243,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* Navbar */}
      <header className="relative z-50" style={{ borderBottom: "1px solid rgba(133,104,243,0.12)" }}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img
              src="/logo-white.png"
              alt="RemuneraLab"
              style={{ height: "32px", width: "auto", filter: "drop-shadow(0 0 10px rgba(133,104,243,0.30))" }}
            />
          </Link>
        </div>
      </header>

      <main className="relative flex-grow flex items-center justify-center py-16 px-6">
        <div className="max-w-2xl w-full">

          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <p className="uppercase tracking-[0.3em] mb-3"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#8568f3" }}>
              Benchmark salarial · Chile 2026
            </p>
            <h1 className="text-white font-semibold mb-3"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)" }}>
              Descubre tu posición en el mercado
            </h1>
            <p className="text-white/40 font-light"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>
              Comparte tu información y construye un mercado laboral más justo.
            </p>
          </motion.div>

          {/* Tarjeta del formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="rounded-xl border border-white/10 bg-white/4 p-8"
            style={{ backdropFilter: "blur(8px)" }}
          >

            {/* Trust badges */}
            <div className="flex items-center gap-6 mb-8 pb-7" style={{ borderBottom: "1px solid rgba(133,104,243,0.15)" }}>
              <div className="flex items-center gap-2">
                <Lock size={13} style={{ color: "#8568f3" }} />
                <span className="uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#8568f3" }}>
                  Anónimo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} style={{ color: "#8568f3" }} />
                <span className="uppercase tracking-[0.18em]"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#8568f3" }}>
                  Sin registro
                </span>
              </div>
              <div className="ml-auto text-white/20 uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                Paso 1 de 1
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Cargo */}
                <div className="md:col-span-2 flex flex-col">
                  <label className={labelClass} htmlFor="cargo"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                    Cargo actual
                  </label>
                  <input
                    id="cargo" name="cargo" type="text" required
                    placeholder="Ej: Ingeniero de Software"
                    value={form.cargo}
                    onChange={handleCargoChange}
                    className={fieldClass}
                  />
                  {ciuo && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <span className="inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1"
                        style={{ fontFamily: "var(--font-space-mono)", color: "rgba(133,104,243,0.75)", border: "1px solid rgba(133,104,243,0.25)" }}>
                        {ciuo.codigo} · {ciuo.grupo}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Industria */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="industria"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                    Industria
                  </label>
                  <select id="industria" name="industria" required
                    value={form.industria} onChange={handleChange}
                    className={selectClass}>
                    <option value="" disabled>Selecciona...</option>
                    {INDUSTRIAS.map((i) => <option key={i.label} value={i.label}>{i.label}</option>)}
                  </select>
                  {(() => {
                    const industriaValue = INDUSTRIAS.find(i => i.label === form.industria)?.value ?? form.industria;
                    const aviso = detectarMalaCombo(ciuo, industriaValue);
                    return aviso ? (
                      <p className="mt-2 text-[11px] text-amber-400/80"
                        style={{ fontFamily: "var(--font-dm-sans)" }}>
                        ⚠ {aviso}
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Años experiencia */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="anios_experiencia"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                    Años de experiencia
                  </label>
                  <select id="anios_experiencia" name="anios_experiencia" required
                    value={form.anios_experiencia} onChange={handleChange}
                    className={selectClass}>
                    <option value="" disabled>Selecciona...</option>
                    {Array.from({ length: 21 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>{n === 20 ? "20+" : n}</option>
                    ))}
                  </select>
                </div>

                {/* Región */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="region"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                    Región
                  </label>
                  <select id="region" name="region" required
                    value={form.region} onChange={handleChange}
                    className={selectClass}>
                    <option value="" disabled>Selecciona...</option>
                    {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Tamaño empresa */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="tamano_empresa"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                    Tamaño de empresa
                  </label>
                  <select id="tamano_empresa" name="tamano_empresa" required
                    value={form.tamano_empresa} onChange={handleChange}
                    className={selectClass}>
                    <option value="" disabled>Selecciona...</option>
                    {TAMANOS_EMPRESA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Sexo */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="sexo"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                    Sexo{" "}
                    <span className="normal-case tracking-normal text-white/20 font-normal">
                      (opcional)
                    </span>
                  </label>
                  <select id="sexo" name="sexo"
                    value={form.sexo} onChange={handleChange}
                    className={selectClass}>
                    <option value="">Prefiero no responder</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                {/* Slider salarial */}
                <div className="md:col-span-2 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <label className={labelClass}
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                      Sueldo mensual bruto (CLP)
                    </label>
                    <motion.span
                      key={form.salario_exacto}
                      initial={{ opacity: 0.5, y: -3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className="font-bold tabular-nums"
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize: "1.35rem",
                        color: form.salario_exacto < SALARIO_MINIMO ? "#F7C948" : "#a387f5",
                      }}
                    >
                      {fmtCLP(form.salario_exacto)}
                    </motion.span>
                  </div>

                  {/* Track + thumb custom */}
                  <div className="relative h-7 flex items-center select-none">
                    <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${salaryToSliderPos(form.salario_exacto) / 10}%`,
                          background: form.salario_exacto < SALARIO_MINIMO ? "#F7C948" : "#8568f3",
                        }}
                      />
                    </div>
                    <div
                      className="absolute w-5 h-5 rounded-full pointer-events-none -translate-x-1/2"
                      style={{
                        left: `${salaryToSliderPos(form.salario_exacto) / 10}%`,
                        background: form.salario_exacto < SALARIO_MINIMO ? "#F7C948" : "#8568f3",
                        border: "2.5px solid #180b3b",
                        boxShadow: form.salario_exacto < SALARIO_MINIMO
                          ? "0 0 10px rgba(247,201,72,0.55)"
                          : "0 0 10px rgba(133,104,243,0.60)",
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      step={1}
                      value={salaryToSliderPos(form.salario_exacto)}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, salario_exacto: sliderToSalary(parseInt(e.target.value)) }))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Marcadores de escala — posicionados según escala log */}
                  <div className="relative h-4" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.2)" }}>
                    <span className="absolute" style={{ left: "0%" }}>$200k</span>
                    <span className="absolute" style={{ left: "37.3%", transform: "translateX(-50%)" }}>$1M</span>
                    <span className="absolute" style={{ left: "74.5%", transform: "translateX(-50%)" }}>$5M</span>
                    <span className="absolute" style={{ left: "100%", transform: "translateX(-100%)" }}>$15M+</span>
                  </div>

                  {form.salario_exacto < SALARIO_MINIMO && (
                    <p className="text-amber-400/70 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      ⚠ Este monto está por debajo del sueldo mínimo legal ($539.000)
                    </p>
                  )}
                </div>

                {/* Jornada parcial */}
                <div className="md:col-span-2 flex flex-col gap-3 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={esJornadaParcial}
                      onChange={(e) => setEsJornadaParcial(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#8568f3]"
                    />
                    <span className="uppercase tracking-[0.18em] text-white/40"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem" }}>
                      Trabajo a tiempo parcial
                    </span>
                  </label>
                  {esJornadaParcial && (
                    <div className="flex items-center gap-3 pl-7">
                      <input
                        type="number"
                        min={1}
                        max={41}
                        value={horasSemana}
                        onChange={(e) => setHorasSemana(Math.min(41, Math.max(1, parseInt(e.target.value) || 1)))}
                        className={`${fieldClass} w-28`}
                      />
                      <span className="text-white/40 text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                        horas / semana
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-3"
                  style={{ fontFamily: "var(--font-dm-sans)" }}>
                  {error}
                </p>
              )}

              {rateLimited ? (
                <div className="flex gap-4 items-start bg-amber-900/20 border border-amber-500/20 rounded-lg px-5 py-4">
                  <span className="text-xl mt-0.5">🙌</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-400 mb-1"
                      style={{ fontFamily: "var(--font-dm-sans)" }}>
                      Ya registraste tu aporte por hoy
                    </p>
                    <p className="text-sm text-amber-400/70"
                      style={{ fontFamily: "var(--font-dm-sans)" }}>
                      Permitimos máximo 3 respuestas por persona al día para mantener la calidad de los datos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-semibold py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #8568f3, #a387f5)",
                      color: "#ffffff",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.95rem",
                      boxShadow: "0 0 36px rgba(133,104,243,0.40), 0 2px 12px rgba(133,104,243,0.25)",
                    }}
                  >
                    {loading ? "Calculando..." : "Ver mi posición en el mercado"}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </div>
              )}
            </form>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
