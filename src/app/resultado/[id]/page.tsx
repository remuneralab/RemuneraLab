import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calcularBenchmark } from "@/lib/benchmark";
import PercentilHero from "./PercentilHero";
import ResultadoBento from "./ResultadoBento";

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

  const percentil      = bench.percentil_usuario ?? 50;
  const hasData        = !!(bench.p25 && bench.p50 && bench.p75);
  const brechaP75      = hasData ? Math.max(0, bench.p75! - salario_mid) : null;
  const competitividad = percentil >= 75 ? "Alta" : percentil >= 50 ? "Media" : "En desarrollo";

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl w-full px-6 py-4 mx-auto">
          <a href="/" className="text-2xl font-bold tracking-tight text-primary">
            RemuneraLab
          </a>
          <nav className="flex items-center gap-4">
            <a
              href="/empresas"
              className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Para empresas
            </a>
            <a
              href="/formulario"
              className="text-primary font-bold px-4 py-2 rounded-lg hover:bg-surface-container transition-colors text-sm"
            >
              Nuevo análisis
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <PercentilHero
          percentil={percentil}
          cargo={registro.cargo}
          industria={registro.industria}
          region={registro.region}
        />

        <ResultadoBento
          percentil={percentil}
          hasData={hasData}
          p25={bench.p25 ?? null}
          p50={bench.p50 ?? null}
          p75={bench.p75 ?? null}
          n={bench.n}
          n_esi={bench.n_esi}
          confianza={bench.confianza}
          cargo={registro.cargo}
          industria={registro.industria}
          region={registro.region}
          salario_mid={salario_mid}
          brechaP75={brechaP75}
          competitividad={competitividad}
          anios_experiencia={registro.anios_experiencia}
          fuente_descripcion={bench.fuente_descripcion}
        />
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
