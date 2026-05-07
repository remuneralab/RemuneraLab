import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calcularBenchmark } from "@/lib/benchmark";
import { Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import ChartResult from "./ChartResult";

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params;

  const { data: registro, error } = await supabase
    .from("registros_salariales")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !registro) notFound();

  const salario_mid = Math.round((registro.salario_min + registro.salario_max) / 2);

  const bench = await calcularBenchmark(
    registro.cargo,
    registro.industria,
    registro.anios_experiencia,
    registro.region,
    salario_mid
  );

  const percentil = bench.percentil_usuario ?? 50;
  const hasData = bench.n > 0 && bench.p25 && bench.p50 && bench.p75;

  const brechaP75 = hasData ? Math.max(0, bench.p75! - salario_mid) : null;

  const competitividad =
    percentil >= 75 ? "Alta" : percentil >= 50 ? "Media" : "En desarrollo";

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl w-full px-6 py-4 mx-auto">
          <a href="/" className="text-2xl font-bold tracking-tight text-primary">
            RemuneraLab
          </a>
          <a
            href="/formulario"
            className="text-primary font-bold px-4 py-2 rounded-lg hover:bg-surface-container transition-colors text-sm"
          >
            Nuevo análisis
          </a>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <section className="mb-12">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/30 text-on-secondary-container rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-secondary-container/40">
              <Sparkles size={12} />
              Benchmark verificado
            </span>
            <h1 className="text-5xl font-bold text-primary mb-4 leading-tight">
              Tu salario está en el{" "}
              <span className="text-secondary">percentil {percentil}</span> del mercado.
            </h1>
            <p className="text-lg text-on-surface-variant">
              {registro.cargo} · {registro.industria} · {registro.region}
            </p>
          </div>
        </section>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chart */}
          <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-bold text-primary">Distribución Salarial</h2>
                <p className="text-sm text-on-surface-variant font-medium mt-1">
                  {registro.industria} · {bench.n} respuestas reales
                </p>
              </div>
            </div>

            {hasData ? (
              <ChartResult
                p25={bench.p25!}
                p50={bench.p50!}
                p75={bench.p75!}
                percentil={percentil}
                n={bench.n}
              />
            ) : (
              <div className="h-[320px] flex items-center justify-center text-on-surface-variant text-sm">
                Aún no hay suficientes datos para mostrar la distribución.
              </div>
            )}
          </div>

          {/* Columna derecha */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Percentil destacado */}
            <div className="bg-primary-container text-white rounded-2xl p-8 relative overflow-hidden flex-1 shadow-2xl">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <Sparkles size={16} className="text-tertiary-fixed" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                    Tu posición
                  </span>
                </div>
                <p className="text-7xl font-bold text-white leading-none mb-2">{percentil}</p>
                <p className="text-on-primary-container text-sm mb-6">percentil</p>
                <p className="text-on-primary-container text-sm leading-relaxed">
                  Superas al{" "}
                  <span className="text-white font-bold">{percentil}%</span>{" "}
                  de profesionales en {registro.industria}.
                </p>
                <div className="mt-auto">
                  <span className={`inline-block mt-6 text-xs font-bold px-3 py-1 rounded-full ${
                    bench.confianza === "alta"
                      ? "bg-tertiary-fixed/20 text-tertiary-fixed"
                      : bench.confianza === "media"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-white/10 text-white/60"
                  }`}>
                    Confianza {bench.confianza}
                  </span>
                </div>
              </div>
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20" />
            </div>

            {/* Confianza */}
            <div className="glass-panel rounded-2xl p-8 shadow-sm border-l-4 border-secondary">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">
                    Basado en
                  </p>
                  <h4 className="text-3xl font-bold text-primary">{bench.n}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">respuestas reales</p>
                </div>
                <ShieldCheck size={40} className="text-outline-variant" />
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="col-span-12 md:col-span-4 glass-panel rounded-2xl p-8 shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              Competitividad
            </p>
            <div className="flex items-end gap-3 mb-3">
              <h4 className="text-4xl font-bold text-primary">{competitividad}</h4>
              {percentil >= 50 && (
                <span className="flex items-center text-emerald-600 font-bold mb-1 text-sm">
                  <TrendingUp size={16} className="mr-1" /> Top {100 - percentil}%
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Superas al {percentil}% de profesionales en roles similares.
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 glass-panel rounded-2xl p-8 shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              Mediana del mercado (P50)
            </p>
            <div className="flex items-end gap-3 mb-3">
              <h4 className="text-3xl font-bold text-primary">
                {hasData ? formatCLP(bench.p50!) : "—"}
              </h4>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              {registro.industria} · {registro.region}
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 glass-panel rounded-2xl p-8 shadow-sm">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              Brecha al P75
            </p>
            <div className="flex items-end gap-3 mb-3">
              <h4 className="text-3xl font-bold text-primary">
                {brechaP75 === null ? "—" : brechaP75 === 0 ? "Alcanzado" : formatCLP(brechaP75)}
              </h4>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              {brechaP75 === 0 ? "Ya estás en el cuartil superior" : "Para alcanzar el cuartil superior"}
            </p>
          </div>
        </div>

        {/* Mensajes del spec */}
        {bench.confianza === "baja" && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
            <p className="text-sm text-amber-800 font-medium">
              Aún hay pocos datos para tu perfil específico. Tu aporte es especialmente valioso.
            </p>
          </div>
        )}

        <div className="mt-6 bg-secondary-container/20 border border-secondary-container/40 rounded-2xl px-6 py-4">
          <p className="text-sm text-on-secondary-container">
            Gracias por contribuir. Cada dato que compartes hace el benchmark más preciso para todos.
          </p>
        </div>

        {/* CTA */}
        <section className="mt-16 bg-surface-container rounded-3xl p-10 flex flex-col md:flex-row items-center gap-10 border border-outline-variant/30">
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
        </section>
      </main>

      <footer className="bg-white border-t border-outline-variant/20 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-on-surface-variant text-center">
            RemuneraLab — Inteligencia salarial para Chile. Tus datos son anónimos y nunca se venderán.
          </p>
        </div>
      </footer>
    </div>
  );
}
