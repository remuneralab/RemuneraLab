"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";

const INDUSTRIAS = [
  "Tecnología",
  "Retail",
  "Finanzas",
  "Salud",
  "Educación",
  "Manufactura",
  "Servicios",
  "Otro",
];

const REGIONES = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

const TAMANOS_EMPRESA = [
  "Startup (1–50 empleados)",
  "Pyme (51–200 empleados)",
  "Empresa grande (201–1.000 empleados)",
  "Corporación (más de 1.000 empleados)",
];

export const RANGOS_SALARIALES = [
  { label: "Menos de $500.000", min: 0, max: 500000 },
  { label: "$500.000 – $800.000", min: 500000, max: 800000 },
  { label: "$800.000 – $1.200.000", min: 800000, max: 1200000 },
  { label: "$1.200.000 – $1.800.000", min: 1200000, max: 1800000 },
  { label: "$1.800.000 – $2.500.000", min: 1800000, max: 2500000 },
  { label: "$2.500.000 – $4.000.000", min: 2500000, max: 4000000 },
  { label: "$4.000.000 – $6.000.000", min: 4000000, max: 6000000 },
  { label: "Más de $6.000.000", min: 6000000, max: 12000000 },
];

interface FormData {
  cargo: string;
  industria: string;
  anios_experiencia: string;
  region: string;
  tamano_empresa: string;
  salario_rango: string;
}

const fieldClass =
  "w-full px-5 py-4 rounded-xl border border-outline-variant bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm text-on-surface placeholder:text-on-surface-variant/50";

const labelClass =
  "text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 block ml-1";

export default function Formulario() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    cargo: "",
    industria: "",
    anios_experiencia: "",
    region: "",
    tamano_empresa: "",
    salario_rango: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const rango = RANGOS_SALARIALES[parseInt(form.salario_rango)];

    const res = await fetch("/api/contribuir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cargo: form.cargo,
        industria: form.industria,
        anios_experiencia: parseInt(form.anios_experiencia),
        region: form.region,
        tamano_empresa: form.tamano_empresa,
        salario_min: rango.min,
        salario_max: rango.max,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      setError("No se pudo guardar la información. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    router.push(`/resultado/${data.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl w-full px-6 py-4 mx-auto">
          <a href="/" className="text-2xl font-bold tracking-tight text-primary">
            RemuneraLab
          </a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-16 px-6">
        <div className="max-w-2xl w-full">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[12px] font-bold text-primary uppercase tracking-[0.2em]">
                Contribución de datos
              </span>
              <span className="text-[12px] font-bold text-on-surface-variant">Paso 1 de 1</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full transition-all duration-500" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 sm:p-10 shadow-sm border border-outline-variant/30"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Aporta tu transparencia</h1>
              <p className="text-on-surface-variant">
                Comparte tu información para construir un mercado laboral más justo en Chile.
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-secondary-container/10 rounded-xl mb-10 border border-secondary-container/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Lock size={16} className="text-secondary" />
                </div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Anónimo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <ShieldCheck size={16} className="text-secondary" />
                </div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">Sin registro</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cargo */}
                <div className="md:col-span-2 flex flex-col">
                  <label className={labelClass} htmlFor="cargo">Cargo actual</label>
                  <input
                    id="cargo"
                    name="cargo"
                    type="text"
                    required
                    placeholder="Ej: Ingeniero de Software"
                    value={form.cargo}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </div>

                {/* Industria */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="industria">Industria</label>
                  <select
                    id="industria"
                    name="industria"
                    required
                    value={form.industria}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="" disabled>Selecciona...</option>
                    {INDUSTRIAS.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                {/* Años experiencia */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="anios_experiencia">Años de experiencia</label>
                  <select
                    id="anios_experiencia"
                    name="anios_experiencia"
                    required
                    value={form.anios_experiencia}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="" disabled>Selecciona...</option>
                    {Array.from({ length: 21 }, (_, i) => i).map((n) => (
                      <option key={n} value={n}>{n === 20 ? "20+" : n}</option>
                    ))}
                  </select>
                </div>

                {/* Región */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="region">Región</label>
                  <select
                    id="region"
                    name="region"
                    required
                    value={form.region}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="" disabled>Selecciona...</option>
                    {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Tamaño empresa */}
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="tamano_empresa">Tamaño de empresa</label>
                  <select
                    id="tamano_empresa"
                    name="tamano_empresa"
                    required
                    value={form.tamano_empresa}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="" disabled>Selecciona...</option>
                    {TAMANOS_EMPRESA.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Rango salarial */}
                <div className="md:col-span-2 flex flex-col">
                  <label className={labelClass} htmlFor="salario_rango">Rango salarial mensual bruto (CLP)</label>
                  <select
                    id="salario_rango"
                    name="salario_rango"
                    required
                    value={form.salario_rango}
                    onChange={handleChange}
                    className={fieldClass}
                  >
                    <option value="" disabled>Selecciona un rango...</option>
                    {RANGOS_SALARIALES.map((r, i) => (
                      <option key={i} value={i}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-5 py-3">
                  {error}
                </p>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary text-on-primary font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {loading ? "Calculando..." : "Ver mi posición en el mercado"}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
