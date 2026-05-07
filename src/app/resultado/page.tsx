"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

function getMensaje(p: number, industria: string) {
  if (p >= 90) return `Tu sueldo está en el top 10% de ${industria}.`;
  if (p >= 75) return `Tu sueldo está en el top 25% de ${industria}.`;
  if (p >= 50) return `Estás por encima de la mitad del mercado en ${industria}.`;
  if (p >= 25) return `Estás en la mitad inferior del mercado en ${industria}.`;
  return `Hay espacio para crecer en el mercado de ${industria}.`;
}

function getColor(p: number) {
  if (p >= 75) return { text: "text-green-600", bar: "from-green-400 to-green-600", border: "border-green-600" };
  if (p >= 50) return { text: "text-blue-600", bar: "from-blue-400 to-blue-600", border: "border-blue-600" };
  if (p >= 25) return { text: "text-yellow-500", bar: "from-yellow-400 to-yellow-500", border: "border-yellow-500" };
  return { text: "text-red-500", bar: "from-red-400 to-red-500", border: "border-red-500" };
}

function getConfianza(n: number) {
  if (n >= 30) return { label: "Muestra sólida", className: "text-green-700 bg-green-50 border-green-200" };
  if (n >= 10) return { label: "Muestra moderada", className: "text-yellow-700 bg-yellow-50 border-yellow-200" };
  return { label: "Muestra reducida", className: "text-orange-600 bg-orange-50 border-orange-200" };
}

interface Stats {
  percentil: number;
  mediana: number;
  p25: number;
  p75: number;
  total: number;
}

function calcularStats(sueldos: number[], sueldo: number): Stats {
  const ordenados = [...sueldos].sort((a, b) => a - b);
  const n = ordenados.length;

  const menores = sueldos.filter((s) => s < sueldo).length;
  const iguales = sueldos.filter((s) => s === sueldo).length;
  const percentil = Math.min(99, Math.max(1, Math.round(((menores + 0.5 * iguales) / n) * 100)));

  const mediana = ordenados[Math.floor(n / 2)];
  const p25 = ordenados[Math.floor(n * 0.25)];
  const p75 = ordenados[Math.floor(n * 0.75)];

  return { percentil, mediana, p25, p75, total: n };
}

function ResultadoContent() {
  const params = useSearchParams();
  const sueldo = parseInt(params.get("sueldo") || "0");
  const industria = params.get("industria") || "";
  const region = params.get("region") || "";
  const cargo = params.get("cargo") || "";

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function calcular() {
      const { data, error } = await supabase
        .from("salarios")
        .select("sueldo_mensual")
        .eq("industria", industria);

      if (error) {
        setErrorMsg("No se pudo obtener los datos. Intenta más tarde.");
        setLoading(false);
        return;
      }

      const registros = data ?? [];

      if (registros.length === 0) {
        setStats({ percentil: 50, mediana: sueldo, p25: sueldo, p75: sueldo, total: 0 });
      } else {
        setStats(calcularStats(registros.map((r) => r.sueldo_mensual), sueldo));
      }

      setLoading(false);
    }

    if (sueldo && industria) calcular();
    else setLoading(false);
  }, [sueldo, industria]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Calculando tu posición...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{errorMsg}</p>
          <a href="/formulario" className="text-sm text-blue-600 hover:underline">Volver al formulario</a>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const color = getColor(stats.percentil);
  const confianza = getConfianza(stats.total);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Header */}
          <div className="text-center mb-6">
            {cargo && <p className="text-sm font-medium text-gray-600">{cargo}</p>}
            {region && <p className="text-xs text-gray-400">{region}</p>}
          </div>

          {/* Percentil */}
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Tu percentil en {industria}
            </p>
            <p className={`text-8xl font-bold leading-none mb-2 ${color.text}`}>
              {stats.percentil}
            </p>
            <p className="text-sm text-gray-500">{getMensaje(stats.percentil, industria)}</p>
          </div>

          {/* Barra */}
          <div className="mb-6">
            <div className="relative w-full h-3 bg-gray-100 rounded-full mb-1">
              <div
                className={`absolute left-0 top-0 h-3 rounded-full bg-gradient-to-r ${color.bar}`}
                style={{ width: `${stats.percentil}%` }}
              />
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 ${color.border} rounded-full shadow`}
                style={{ left: `calc(${stats.percentil}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>P0</span>
              <span>P50</span>
              <span>P100</span>
            </div>
          </div>

          {/* Stats de la industria */}
          {stats.total >= 2 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">P25</p>
                <p className="text-sm font-semibold text-gray-700">{formatCLP(stats.p25)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Mediana</p>
                <p className="text-sm font-semibold text-gray-700">{formatCLP(stats.mediana)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">P75</p>
                <p className="text-sm font-semibold text-gray-700">{formatCLP(stats.p75)}</p>
              </div>
            </div>
          )}

          {/* Footer: confianza + total */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${confianza.className}`}>
              {confianza.label}
            </span>
            <span className="text-xs text-gray-400">
              {stats.total === 0
                ? "Eres el primero en esta industria"
                : `${stats.total} ${stats.total === 1 ? "respuesta" : "respuestas"} en ${industria}`}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-6">
          <a href="/formulario" className="text-sm text-gray-400 hover:text-gray-600">
            Ingresar otro sueldo
          </a>
          <a href="/" className="text-sm text-blue-600 hover:underline">
            Inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Resultado() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-8 py-5">
        <a href="/" className="text-xl font-semibold tracking-tight text-gray-900">
          Remunera<span className="text-blue-600">Lab</span>
        </a>
      </nav>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 animate-pulse">Calculando tu posición...</p>
          </div>
        }
      >
        <ResultadoContent />
      </Suspense>
    </main>
  );
}
