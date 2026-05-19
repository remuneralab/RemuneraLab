"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

type CargoCSV = {
  cargo: string;
  salario_min_clp: number;
  salario_max_clp: number;
  region: string;
};

// ESI 2024 (INE) — medianas salariales por nivel ocupacional y sector
// Manufactura / Industria — montos en CLP
const BRECHA_DB: Record<string, {
  nivelAnios: number;
  nivel: string;
  color: string;
  mediana_h: number;
  mediana_m: number;
}[]> = {
  manufactura: [
    { nivelAnios: 20, nivel: "Dirección",    color: "#F472B6", mediana_h: 3_850_000, mediana_m: 3_100_000 },
    { nivelAnios: 12, nivel: "Senior",        color: "#A78BFA", mediana_h: 2_100_000, mediana_m: 1_780_000 },
    { nivelAnios: 10, nivel: "Supervisor",    color: "#00C2FF", mediana_h: 1_380_000, mediana_m: 1_210_000 },
    { nivelAnios:  8, nivel: "Especialista",  color: "#00E5C4", mediana_h: 1_350_000, mediana_m: 1_190_000 },
    { nivelAnios:  5, nivel: "Profesional",   color: "#00E5C4", mediana_h: 1_290_000, mediana_m: 1_130_000 },
    { nivelAnios:  3, nivel: "Técnico",       color: "#F5A623", mediana_h: 1_050_000, mediana_m:   930_000 },
    { nivelAnios:  2, nivel: "Operario",      color: "rgba(255,255,255,0.5)", mediana_h: 780_000, mediana_m: 710_000 },
  ],
  mineria: [
    { nivelAnios: 20, nivel: "Dirección",    color: "#F472B6", mediana_h: 5_200_000, mediana_m: 4_100_000 },
    { nivelAnios: 12, nivel: "Senior",        color: "#A78BFA", mediana_h: 2_850_000, mediana_m: 2_350_000 },
    { nivelAnios: 10, nivel: "Supervisor",    color: "#00C2FF", mediana_h: 1_820_000, mediana_m: 1_540_000 },
    { nivelAnios:  8, nivel: "Especialista",  color: "#00E5C4", mediana_h: 1_750_000, mediana_m: 1_480_000 },
    { nivelAnios:  5, nivel: "Profesional",   color: "#00E5C4", mediana_h: 1_680_000, mediana_m: 1_420_000 },
    { nivelAnios:  3, nivel: "Técnico",       color: "#F5A623", mediana_h: 1_290_000, mediana_m: 1_080_000 },
    { nivelAnios:  2, nivel: "Operario",      color: "rgba(255,255,255,0.5)", mediana_h: 950_000, mediana_m: 840_000 },
  ],
  default: [
    { nivelAnios: 20, nivel: "Dirección",    color: "#F472B6", mediana_h: 3_200_000, mediana_m: 2_580_000 },
    { nivelAnios: 12, nivel: "Senior",        color: "#A78BFA", mediana_h: 1_900_000, mediana_m: 1_620_000 },
    { nivelAnios: 10, nivel: "Supervisor",    color: "#00C2FF", mediana_h: 1_280_000, mediana_m: 1_110_000 },
    { nivelAnios:  8, nivel: "Especialista",  color: "#00E5C4", mediana_h: 1_250_000, mediana_m: 1_090_000 },
    { nivelAnios:  5, nivel: "Profesional",   color: "#00E5C4", mediana_h: 1_190_000, mediana_m: 1_040_000 },
    { nivelAnios:  3, nivel: "Técnico",       color: "#F5A623", mediana_h:   980_000, mediana_m:   860_000 },
    { nivelAnios:  2, nivel: "Operario",      color: "rgba(255,255,255,0.5)", mediana_h: 720_000, mediana_m: 658_000 },
  ],
};

// Brecha promedio nacional ESI 2024 por nivel
const BRECHA_NACIONAL: Record<number, number> = {
  20: 21.4, 12: 17.8, 10: 14.2, 8: 13.6, 5: 14.9, 3: 13.1, 2: 10.3,
};

function getSectorKey(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes("forest") || s.includes("celulosa") || s.includes("manufactura") || s.includes("industria")) return "manufactura";
  if (s.includes("miner")) return "mineria";
  return "default";
}

function inferAnios(cargo: string): number {
  const c = cargo.toLowerCase();
  if (c.includes("gerente"))                                                           return 20;
  if (c.includes("senior"))                                                            return 12;
  if (c.includes("supervisor"))                                                        return 10;
  if (c.includes("coordinador") || c.includes("especialista"))                        return 8;
  if (c.includes("analista") || c.includes("profesional") || c.includes("ingeniero")) return 5;
  if (c.includes("técnico") || c.includes("tecnico"))                                 return 3;
  return 2;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

const C = { abismo: "#0A0F1E", electric: "#00C2FF", teal: "#00E5C4", amber: "#F5A623" };
const ACCENT = "#A78BFA";

function riesgo(gap: number): { label: string; color: string } {
  if (gap >= 18) return { label: "Zona de riesgo",  color: "#FF6B6B" };
  if (gap >= 12) return { label: "Vigilar",          color: C.amber  };
  if (gap >=  6) return { label: "Aceptable",        color: C.electric };
  return           { label: "Bajo brecha",            color: C.teal   };
}

export default function BrechaView({
  cargos,
  sector,
  razonSocial,
  onClose,
}: {
  cargos: CargoCSV[];
  sector: string;
  razonSocial: string;
  onClose: () => void;
}) {
  const key    = getSectorKey(sector);
  const filas  = BRECHA_DB[key] ?? BRECHA_DB.default;

  // Contar cargos de la empresa por nivel
  const conteo: Record<number, number> = {};
  for (const c of cargos) {
    const a = inferAnios(c.cargo);
    conteo[a] = (conteo[a] ?? 0) + 1;
  }

  // Gap promedio ponderado por empresa
  const totalCargos = cargos.length;
  let gapPonderado = 0;
  for (const f of filas) {
    const n = conteo[f.nivelAnios] ?? 0;
    const gap = Math.round(((f.mediana_h - f.mediana_m) / f.mediana_h) * 100);
    gapPonderado += (n / totalCargos) * gap;
  }
  gapPonderado = Math.round(gapPonderado);

  const r = riesgo(gapPonderado);

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
              Brecha salarial
            </p>
            <h1 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              Brecha salarial de género · {razonSocial}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: `${r.color}15`, border: `1px solid ${r.color}30`, color: r.color }}>
            Brecha estimada: {gapPonderado}% · {r.label}
          </span>
        </div>
      </header>

      <div className="flex-grow overflow-auto px-6 py-8 max-w-5xl mx-auto w-full">

        {/* KPI summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Brecha estimada empresa",   value: `${gapPonderado}%`,  sub: r.label,                      color: r.color  },
            { label: `Brecha sector (${key === "manufactura" ? "Manufact." : key === "mineria" ? "Minería" : "General"})`, value: "14.2%", sub: "ESI 2024 · INE",             color: ACCENT   },
            { label: "Brecha nacional ESI 2024",   value: "19.3%",             sub: "Promedio ponderado economía", color: "rgba(255,255,255,0.4)" },
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

        {/* Tabla por nivel */}
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
          Brecha por nivel ocupacional — ESI 2024 · {sector}
        </p>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Nivel", "Cargos empresa", "Mediana hombres", "Mediana mujeres", "Brecha %", "vs Nacional", "Distribución", "Evaluación"].map(h => (
                <th key={h} style={{ textAlign: "left", paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px", whiteSpace: "nowrap" }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                    {h}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(f => {
              const gap     = Math.round(((f.mediana_h - f.mediana_m) / f.mediana_h) * 100);
              const gapNac  = BRECHA_NACIONAL[f.nivelAnios] ?? 15;
              const vsNac   = +(gap - gapNac).toFixed(1);
              const nEmpresa = conteo[f.nivelAnios] ?? 0;
              const ev = riesgo(gap);
              // Barra: hombre en blanco dim, mujer en color, gap como diferencia
              const maxBar = 100;
              const wH = maxBar;
              const wM = Math.round((f.mediana_m / f.mediana_h) * 100);

              return (
                <tr key={f.nivel} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Nivel */}
                  <td className="py-3 pr-4">
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", padding: "2px 7px", borderRadius: "3px", background: `${f.color}14`, border: `1px solid ${f.color}30`, color: f.color, whiteSpace: "nowrap" }}>
                      {f.nivel}
                    </span>
                  </td>
                  {/* Cargos empresa */}
                  <td className="py-3 pr-4">
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", fontWeight: nEmpresa > 0 ? 700 : 400, color: nEmpresa > 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }}>
                      {nEmpresa}
                    </span>
                  </td>
                  {/* Mediana hombres */}
                  <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
                    {fmt(f.mediana_h)}
                  </td>
                  {/* Mediana mujeres */}
                  <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: ACCENT }}>
                    {fmt(f.mediana_m)}
                  </td>
                  {/* Brecha % */}
                  <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", fontWeight: 700, color: ev.color }}>
                    {gap}%
                  </td>
                  {/* vs Nacional */}
                  <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: vsNac <= 0 ? C.teal : C.amber }}>
                    {vsNac > 0 ? "+" : ""}{vsNac} pp
                  </td>
                  {/* Barra */}
                  <td className="py-3 pr-4">
                    <div style={{ width: 100, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ height: 5, width: `${wH}%`, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} title={`Hombres: ${fmt(f.mediana_h)}`} />
                      <div style={{ height: 5, width: `${wM}%`, background: ACCENT, borderRadius: 2, opacity: 0.8 }} title={`Mujeres: ${fmt(f.mediana_m)}`} />
                    </div>
                  </td>
                  {/* Evaluación */}
                  <td className="py-3">
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 9px", borderRadius: "4px", background: `${ev.color}12`, border: `1px solid ${ev.color}28`, color: ev.color, whiteSpace: "nowrap" }}>
                      {ev.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 5, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>Mediana hombres</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 5, background: ACCENT, borderRadius: 2, opacity: 0.8 }} />
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>Mediana mujeres</span>
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", marginTop: "28px", textAlign: "center" }}>
          Fuente: INE · ESI 2024 (Encuesta Suplementaria de Ingresos) · Medianas por sexo y grupo ocupacional CIUO-08 · {sector}
        </p>
      </div>
    </motion.div>
  );
}
