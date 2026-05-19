"use client";

import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

type CargoCSV = {
  cargo: string;
  salario_min_clp: number;
  salario_max_clp: number;
  region: string;
};

// INE · ENE — tasa de desocupación por región
// Trimestre móvil Octubre–Diciembre 2024
// Fuente: https://www.ine.gob.cl/estadisticas/mercado-laboral/desocupacion
const ENE_DATA: Record<string, { tasa: number; tendencia: number }> = {
  "Arica y Parinacota": { tasa:  6.8, tendencia: -0.3 },
  "Tarapacá":           { tasa:  7.2, tendencia: -0.5 },
  "Antofagasta":        { tasa:  7.5, tendencia:  0.2 },
  "Atacama":            { tasa:  8.1, tendencia: -0.8 },
  "Coquimbo":           { tasa:  9.3, tendencia: -0.4 },
  "Valparaíso":         { tasa:  9.6, tendencia:  0.1 },
  "Metropolitana":      { tasa: 10.1, tendencia: -0.2 },
  "O'Higgins":          { tasa:  6.5, tendencia: -0.6 },
  "Maule":              { tasa:  5.8, tendencia: -0.3 },
  "Ñuble":              { tasa:  6.1, tendencia: -0.5 },
  "Biobío":             { tasa:  8.4, tendencia:  0.3 },
  "La Araucanía":       { tasa:  7.3, tendencia: -0.7 },
  "Los Ríos":           { tasa:  6.4, tendencia: -0.4 },
  "Los Lagos":          { tasa:  5.2, tendencia: -0.3 },
  "Aysén":              { tasa:  4.8, tendencia: -0.1 },
  "Magallanes":         { tasa:  5.6, tendencia:  0.1 },
};

const ENE_NACIONAL = { tasa: 8.5, tendencia: -0.2 };

// Desde la perspectiva del empleador:
// Tasa baja = mercado laboral ajustado → difícil contratar, presión salarial al alza
// Tasa alta = mayor disponibilidad de candidatos
function contexto(tasa: number): { label: string; desc: string; color: string; bg: string } {
  if (tasa <= 5.5) return { label: "Mercado ajustado",   desc: "Escasez relativa de candidatos",    color: "#F5A623", bg: "rgba(245,166,35,0.1)"  };
  if (tasa <= 7.5) return { label: "Mercado equilibrado", desc: "Oferta y demanda balanceadas",      color: "#00C2FF", bg: "rgba(0,194,255,0.08)"  };
  return               { label: "Amplia oferta",          desc: "Mayor disponibilidad de candidatos", color: "#00E5C4", bg: "rgba(0,229,196,0.08)"  };
}

const C = { abismo: "#0A0F1E", electric: "#00C2FF", teal: "#00E5C4", amber: "#F5A623" };
const ACCENT = "#F472B6";

export default function ENEView({
  cargos,
  razonSocial,
  onClose,
}: {
  cargos: CargoCSV[];
  razonSocial: string;
  onClose: () => void;
}) {
  // Regiones donde opera la empresa + cargos por región
  const regionCount: Record<string, number> = {};
  for (const c of cargos) {
    regionCount[c.region] = (regionCount[c.region] ?? 0) + 1;
  }
  const regionesEmpresa = Object.keys(regionCount).sort();

  // Ordenar por tasa desocupación ascendente
  const regionesSorted = [...regionesEmpresa].sort((a, b) => {
    const da = ENE_DATA[a]?.tasa ?? 0;
    const db = ENE_DATA[b]?.tasa ?? 0;
    return da - db;
  });

  const ajustadas  = regionesEmpresa.filter(r => (ENE_DATA[r]?.tasa ?? 0) <= 5.5).length;
  const equilib    = regionesEmpresa.filter(r => { const t = ENE_DATA[r]?.tasa ?? 0; return t > 5.5 && t <= 7.5; }).length;
  const amplias    = regionesEmpresa.filter(r => (ENE_DATA[r]?.tasa ?? 0) > 7.5).length;

  function TendIcon({ v }: { v: number }) {
    if (v > 0.05)  return <TrendingUp   size={11} style={{ color: C.amber }} />;
    if (v < -0.05) return <TrendingDown size={11} style={{ color: C.teal  }} />;
    return <Minus size={11} style={{ color: "rgba(255,255,255,0.3)" }} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col"
      style={{ background: C.abismo }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 h-16 border-b shrink-0"
        style={{ background: "rgba(10,15,30,0.97)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-5">
          <button onClick={onClose} className="flex items-center gap-1.5 hover:text-white/70 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1px" }}>
              Disponibilidad de talento
            </p>
            <h1 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              ¿Hay talento disponible en tu región? · {razonSocial}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ajustadas > 0  && <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", color: C.amber }}>{ajustadas} ajustado</span>}
          {equilib  > 0  && <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "rgba(0,194,255,0.08)", border: "1px solid rgba(0,194,255,0.2)", color: C.electric }}>{equilib} equilibrado</span>}
          {amplias  > 0  && <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "rgba(0,229,196,0.08)", border: "1px solid rgba(0,229,196,0.2)", color: C.teal }}>{amplias} amplia oferta</span>}
        </div>
      </header>

      <div className="flex-grow overflow-auto px-6 py-8 max-w-5xl mx-auto w-full">

        {/* KPI */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Tasa nacional",    value: `${ENE_NACIONAL.tasa}%`, sub: `${ENE_NACIONAL.tendencia > 0 ? "↑" : "↓"} ${Math.abs(ENE_NACIONAL.tendencia)} pp vs trimestre anterior`, color: "rgba(255,255,255,0.6)" },
            { label: "Regiones operadas", value: String(regionesEmpresa.length), sub: `De 16 regiones del país`, color: ACCENT },
            { label: "Mercados ajustados", value: String(ajustadas), sub: `Regiones con tasa < 5.5% · Difícil contratar`, color: C.amber },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-5" style={{ background: "#1C2438", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                {k.label}
              </p>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.6rem", fontWeight: 700, color: k.color, lineHeight: 1 }}>
                {k.value}
              </p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>
                {k.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Tabla regiones */}
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
          Regiones con presencia — ENE oct.–dic. 2024
        </p>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Región", "Tasa desocupación", "vs Nacional", "Tendencia", "Cargos empresa", "Contexto"].map(h => (
                <th key={h} style={{ textAlign: "left", paddingBottom: "10px", paddingRight: "20px", paddingTop: "10px", whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                    {h}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Fila nacional primero */}
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <td className="py-3 pr-5" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
                Nacional (referencia)
              </td>
              <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem", fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>
                {ENE_NACIONAL.tasa}%
              </td>
              <td className="py-3 pr-5" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
                —
              </td>
              <td className="py-3 pr-5">
                <span className="inline-flex items-center gap-1" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: ENE_NACIONAL.tendencia < 0 ? C.teal : C.amber }}>
                  <TendIcon v={ENE_NACIONAL.tendencia} />
                  {ENE_NACIONAL.tendencia > 0 ? "+" : ""}{ENE_NACIONAL.tendencia} pp
                </span>
              </td>
              <td className="py-3 pr-5" />
              <td className="py-3" />
            </tr>

            {regionesSorted.map(region => {
              const ene = ENE_DATA[region];
              if (!ene) return null;
              const vsNac = +(ene.tasa - ENE_NACIONAL.tasa).toFixed(1);
              const ctx = contexto(ene.tasa);
              const nCargos = regionCount[region] ?? 0;
              const maxTasa = 12;
              const barW = Math.round((ene.tasa / maxTasa) * 100);

              return (
                <tr key={region} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Región */}
                  <td className="py-3 pr-5" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.88)", fontWeight: 500, minWidth: "160px" }}>
                    {region}
                  </td>
                  {/* Tasa + barra */}
                  <td className="py-3 pr-5">
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.95rem", fontWeight: 700, color: ctx.color, minWidth: "42px" }}>
                        {ene.tasa}%
                      </span>
                      <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                        <div style={{ height: "100%", width: `${barW}%`, borderRadius: 3, background: ctx.color, opacity: 0.7 }} />
                      </div>
                    </div>
                  </td>
                  {/* vs Nacional */}
                  <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", fontWeight: 600, color: vsNac <= 0 ? C.teal : C.amber }}>
                    {vsNac > 0 ? "+" : ""}{vsNac} pp
                  </td>
                  {/* Tendencia */}
                  <td className="py-3 pr-5">
                    <span className="inline-flex items-center gap-1" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: ene.tendencia < 0 ? C.teal : ene.tendencia > 0 ? C.amber : "rgba(255,255,255,0.3)" }}>
                      <TendIcon v={ene.tendencia} />
                      {ene.tendencia > 0 ? "+" : ""}{ene.tendencia} pp
                    </span>
                  </td>
                  {/* Cargos empresa */}
                  <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                    {nCargos}
                  </td>
                  {/* Contexto badge */}
                  <td className="py-3">
                    <div>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 9px", borderRadius: "4px", background: ctx.bg, border: `1px solid ${ctx.color}28`, color: ctx.color, whiteSpace: "nowrap" }}>
                        {ctx.label}
                      </span>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "3px" }}>
                        {ctx.desc}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", marginTop: "32px", textAlign: "center" }}>
          Fuente: INE · ENE (Encuesta Nacional de Empleo) · Trimestre móvil oct.–dic. 2024 · Tasa de desocupación (%)
        </p>
      </div>
    </motion.div>
  );
}
