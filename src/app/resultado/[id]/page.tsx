export const runtime = 'edge';

import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calcularBenchmark } from "@/lib/benchmark";
import { calcularMercado } from "@/lib/mercado";
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

  const [bench, mercado] = await Promise.all([
    calcularBenchmark(
      registro.cargo,
      registro.industria,
      registro.anios_experiencia,
      registro.region,
      salario_mid,
    ),
    calcularMercado(
      registro.ciuo_codigo ?? null,
      registro.industria,
      registro.region,
    ),
  ]);

  const percentil      = bench.percentil_usuario ?? 50;
  const hasData        = !!(bench.p25 && bench.p50 && bench.p75);
  const brechaP75      = hasData ? Math.max(0, bench.p75! - salario_mid) : null;
  const competitividad = percentil >= 75 ? "Alta" : percentil >= 50 ? "Media" : "En desarrollo";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#180b3b" }}>

      {/* Glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.18) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.11) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(133,104,243,0.06) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(133,104,243,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* Navbar */}
      <header className="relative z-50" style={{ borderBottom: "1px solid rgba(133,104,243,0.12)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img
              src="/logo-white.png"
              alt="RemuneraLab"
              style={{ height: "32px", width: "auto", filter: "drop-shadow(0 0 10px rgba(133,104,243,0.30))" }}
            />
          </Link>
          <nav className="flex items-center gap-5">

            <Link
              href="/formulario"
              className="inline-flex items-center gap-1.5 font-semibold px-4 py-1.5 rounded transition-colors hover:bg-[#8568f3]/10"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", border: "1px solid rgba(133,104,243,0.40)", color: "#8568f3" }}
            >
              Nuevo análisis
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        <PercentilHero
          percentil={percentil}
          cargo={registro.cargo}
          industria={registro.industria}
          region={registro.region}
        />

        <ResultadoBento
          registroId={id}
          percentil={percentil}
          hasData={hasData}
          p25={bench.p25 ?? null}
          p50={bench.p50 ?? null}
          p75={bench.p75 ?? null}
          n={bench.n}
          n_esi={bench.n_esi}
          n_aviso={bench.n_aviso}
          n_trab={bench.n_trab}
          confianza={bench.confianza}
          cargo={registro.cargo}
          industria={registro.industria}
          region={registro.region}
          salario_mid={salario_mid}
          brechaP75={brechaP75}
          competitividad={competitividad}
          anios_experiencia={registro.anios_experiencia}
          fuente_descripcion={bench.fuente_descripcion}
          nivel_cascada={bench.nivel_cascada}
          grupo_usado={bench.grupo_usado}
          ciuo_codigo={registro.ciuo_codigo ?? null}
          tamano_empresa={registro.tamano_empresa ?? null}
          sexo={registro.sexo ?? null}
          mercado={mercado}
        />
      </main>

      <footer className="relative py-8 px-6 mt-12" style={{ borderTop: "1px solid rgba(133,104,243,0.12)" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-white/25 text-center"
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.15em" }}>
            REMUNERALAB — TUS DATOS SON ANÓNIMOS Y NUNCA SE VENDERÁN
          </p>
        </div>
      </footer>
    </div>
  );
}
