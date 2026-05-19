"use client";

import { motion } from "motion/react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

// INE · Índice de Costo Laboral — variación anual (%) por trimestre
// Fuente: https://www.ine.gob.cl/estadisticas/economia/remuneraciones-e-ingresos/indice-de-costo-laboral
const ICL_DB: Record<string, {
  label:     string;
  trimestres: { q: string; ipc: number; sector: number; nacional: number }[];
  componentes: { nombre: string; variacion: number; peso: number }[];
}> = {
  manufactura: {
    label: "Ind. Manufacturera",
    trimestres: [
      { q: "T1 2024", ipc: 3.7, sector: 5.2, nacional: 4.9 },
      { q: "T2 2024", ipc: 4.2, sector: 4.8, nacional: 4.6 },
      { q: "T3 2024", ipc: 4.9, sector: 4.3, nacional: 4.1 },
      { q: "T4 2024", ipc: 4.5, sector: 4.6, nacional: 4.3 },
      { q: "T1 2025", ipc: 3.8, sector: 3.9, nacional: 3.7 },
    ],
    componentes: [
      { nombre: "Sueldos y salarios",            variacion: 4.1, peso: 71.8 },
      { nombre: "Cotizaciones patronales",        variacion: 2.7, peso: 22.4 },
      { nombre: "Indemnizaciones y otros",        variacion: 5.8, peso:  5.8 },
    ],
  },
  mineria: {
    label: "Minería",
    trimestres: [
      { q: "T1 2024", ipc: 3.7, sector: 6.8, nacional: 4.9 },
      { q: "T2 2024", ipc: 4.2, sector: 6.2, nacional: 4.6 },
      { q: "T3 2024", ipc: 4.9, sector: 5.9, nacional: 4.1 },
      { q: "T4 2024", ipc: 4.5, sector: 6.1, nacional: 4.3 },
      { q: "T1 2025", ipc: 3.8, sector: 5.4, nacional: 3.7 },
    ],
    componentes: [
      { nombre: "Sueldos y salarios",            variacion: 5.6, peso: 68.2 },
      { nombre: "Cotizaciones patronales",        variacion: 3.1, peso: 24.5 },
      { nombre: "Indemnizaciones y otros",        variacion: 7.2, peso:  7.3 },
    ],
  },
  construccion: {
    label: "Construcción",
    trimestres: [
      { q: "T1 2024", ipc: 3.7, sector: 4.6, nacional: 4.9 },
      { q: "T2 2024", ipc: 4.2, sector: 4.1, nacional: 4.6 },
      { q: "T3 2024", ipc: 4.9, sector: 3.8, nacional: 4.1 },
      { q: "T4 2024", ipc: 4.5, sector: 4.0, nacional: 4.3 },
      { q: "T1 2025", ipc: 3.8, sector: 3.4, nacional: 3.7 },
    ],
    componentes: [
      { nombre: "Sueldos y salarios",            variacion: 3.6, peso: 73.1 },
      { nombre: "Cotizaciones patronales",        variacion: 2.4, peso: 21.2 },
      { nombre: "Indemnizaciones y otros",        variacion: 4.9, peso:  5.7 },
    ],
  },
  default: {
    label: "Total economía",
    trimestres: [
      { q: "T1 2024", ipc: 3.7, sector: 4.9, nacional: 4.9 },
      { q: "T2 2024", ipc: 4.2, sector: 4.6, nacional: 4.6 },
      { q: "T3 2024", ipc: 4.9, sector: 4.1, nacional: 4.1 },
      { q: "T4 2024", ipc: 4.5, sector: 4.3, nacional: 4.3 },
      { q: "T1 2025", ipc: 3.8, sector: 3.7, nacional: 3.7 },
    ],
    componentes: [
      { nombre: "Sueldos y salarios",            variacion: 3.9, peso: 72.1 },
      { nombre: "Cotizaciones patronales",        variacion: 2.6, peso: 22.3 },
      { nombre: "Indemnizaciones y otros",        variacion: 5.2, peso:  5.6 },
    ],
  },
};

function getSectorKey(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes("forest") || s.includes("celulosa") || s.includes("manufactura") || s.includes("industria")) return "manufactura";
  if (s.includes("miner")) return "mineria";
  if (s.includes("construc")) return "construccion";
  return "default";
}

const C = { abismo: "#0A0F1E", electric: "#00C2FF", teal: "#00E5C4", amber: "#F5A623" };
const ACCENT = C.amber;

function DeltaIcon({ v }: { v: number }) {
  if (v > 0.5)  return <TrendingUp   size={12} style={{ color: C.amber }} />;
  if (v < -0.5) return <TrendingDown size={12} style={{ color: C.teal  }} />;
  return <Minus size={12} style={{ color: "rgba(255,255,255,0.35)" }} />;
}

export default function ICLView({
  sector,
  razonSocial,
  onClose,
}: {
  sector: string;
  razonSocial: string;
  onClose: () => void;
}) {
  const key  = getSectorKey(sector);
  const data = ICL_DB[key];
  const last = data.trimestres[data.trimestres.length - 1];
  const prev = data.trimestres[data.trimestres.length - 2];
  const delta = +(last.sector - prev.sector).toFixed(1);
  const maxVal = Math.max(...data.trimestres.map(t => Math.max(t.sector, t.nacional, t.ipc)));

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
              Costo de contratar
            </p>
            <h1 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              Costo real de contratar · {razonSocial}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", color: ACCENT }}>
            {data.label} · {last.q}
          </span>
          <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)" }}>
            {last.sector > last.ipc ? "ICL sobre IPC" : "ICL bajo IPC"}
          </span>
        </div>
      </header>

      <div className="flex-grow overflow-auto px-6 py-8 max-w-5xl mx-auto w-full">

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "ICL sector " + last.q, value: `+${last.sector}%`, sub: `${last.sector > last.ipc ? "↑ sobre" : "↓ bajo"} IPC (${last.ipc}%)`, color: last.sector > last.ipc ? C.amber : C.teal },
            { label: "ICL nacional " + last.q, value: `+${last.nacional}%`, sub: `${last.sector >= last.nacional ? "Sector más caro" : "Sector bajo promedio"}`, color: C.electric },
            { label: `vs ${prev.q}`, value: (delta >= 0 ? "+" : "") + delta + " pp", sub: delta > 0 ? "Presión en alza" : delta < 0 ? "Presión cediendo" : "Sin variación", color: delta > 0 ? C.amber : C.teal },
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

        {/* Evolución trimestral */}
        <div className="mb-10">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Evolución trimestral — variación anual (%)
          </p>
          <div className="flex items-end gap-4" style={{ height: 140 }}>
            {data.trimestres.map((t, i) => {
              const isLast = i === data.trimestres.length - 1;
              const hSector   = Math.round((t.sector   / maxVal) * 120);
              const hNacional = Math.round((t.nacional / maxVal) * 120);
              const hIPC      = Math.round((t.ipc      / maxVal) * 120);
              return (
                <div key={t.q} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-end gap-1 justify-center" style={{ height: 120 }}>
                    {/* Barra IPC */}
                    <div style={{ width: 10, height: hIPC, background: "rgba(255,255,255,0.12)", borderRadius: "3px 3px 0 0" }} title={`IPC: ${t.ipc}%`} />
                    {/* Barra Nacional */}
                    <div style={{ width: 14, height: hNacional, background: isLast ? "rgba(0,194,255,0.6)" : "rgba(0,194,255,0.25)", borderRadius: "3px 3px 0 0" }} title={`Nacional: ${t.nacional}%`} />
                    {/* Barra Sector */}
                    <div style={{ width: 14, height: hSector, background: isLast ? C.amber : "rgba(245,166,35,0.45)", borderRadius: "3px 3px 0 0" }} title={`${data.label}: ${t.sector}%`} />
                  </div>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", color: isLast ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", textAlign: "center", whiteSpace: "nowrap" }}>
                    {t.q}
                  </p>
                  {isLast && (
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: C.amber, fontWeight: 700 }}>
                      {t.sector}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {/* Leyenda */}
          <div className="flex items-center gap-5 mt-4">
            {[
              { color: "rgba(255,255,255,0.2)", label: "IPC" },
              { color: "rgba(0,194,255,0.6)",   label: "ICL Nacional" },
              { color: C.amber,                  label: `ICL ${data.label}` },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Componentes */}
        <div>
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
            Componentes — {last.q} · {data.label}
          </p>
          <div className="flex flex-col gap-3">
            {data.componentes.map(c => (
              <div key={c.nombre} className="rounded-xl p-4" style={{ background: "#1C2438", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{c.nombre}</p>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>
                      Peso: {c.peso}% del ICL total
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DeltaIcon v={c.variacion - last.nacional} />
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", fontWeight: 700, color: c.variacion > last.ipc ? C.amber : C.teal }}>
                      +{c.variacion}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (c.variacion / 8) * 100)}%`, borderRadius: 3, background: c.variacion > last.ipc ? C.amber : C.teal }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", marginTop: "32px", textAlign: "center" }}>
          Fuente: INE · Índice de Costo Laboral (ICL) · Variación anual (%) por trimestre · {data.label}
        </p>
      </div>
    </motion.div>
  );
}
