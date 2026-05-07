"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const INDUSTRIAS = [
  "Tecnología",
  "Banca y Finanzas",
  "Retail",
  "Salud",
  "Educación",
  "Construcción",
  "Minería",
  "Agro",
  "Telecomunicaciones",
  "Gobierno",
  "Consultoría",
  "Manufactura",
  "Transporte y Logística",
  "Energía",
  "Medios y Entretenimiento",
  "Otra",
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

interface FormData {
  cargo: string;
  industria: string;
  anios_experiencia: string;
  region: string;
  sueldo_mensual: string;
}

export default function Formulario() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    cargo: "",
    industria: "",
    anios_experiencia: "",
    region: "",
    sueldo_mensual: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: sbError } = await supabase.from("salarios").insert({
      cargo: form.cargo.trim(),
      industria: form.industria,
      anios_experiencia: parseInt(form.anios_experiencia),
      region: form.region,
      sueldo_mensual: parseInt(form.sueldo_mensual),
    });

    if (sbError) {
      setError("No se pudo guardar la información. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    router.push(
      `/resultado?sueldo=${form.sueldo_mensual}&industria=${encodeURIComponent(form.industria)}&region=${encodeURIComponent(form.region)}&cargo=${encodeURIComponent(form.cargo.trim())}`
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-8 py-5">
        <a href="/" className="text-xl font-semibold tracking-tight text-gray-900">
          Remunera<span className="text-blue-600">Lab</span>
        </a>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Tu información laboral
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Todos los datos son anónimos y se usan solo para calcular percentiles.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cargo actual
              </label>
              <input
                name="cargo"
                type="text"
                required
                placeholder="Ej: Ingeniero de Software"
                value={form.cargo}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Industria
              </label>
              <select
                name="industria"
                required
                value={form.industria}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="" disabled>Selecciona una industria</option>
                {INDUSTRIAS.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Años de experiencia
              </label>
              <input
                name="anios_experiencia"
                type="number"
                required
                min={0}
                max={50}
                placeholder="Ej: 5"
                value={form.anios_experiencia}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Región
              </label>
              <select
                name="region"
                required
                value={form.region}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="" disabled>Selecciona una región</option>
                {REGIONES.map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sueldo líquido mensual (CLP)
              </label>
              <input
                name="sueldo_mensual"
                type="number"
                required
                min={0}
                step={10000}
                placeholder="Ej: 1500000"
                value={form.sueldo_mensual}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ingresa el monto en pesos chilenos, sin puntos ni comas.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              {loading ? "Calculando..." : "Ver mi posición en el mercado"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
