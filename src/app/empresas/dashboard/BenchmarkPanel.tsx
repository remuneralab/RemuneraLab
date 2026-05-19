"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

type CargoCSV = {
  cargo: string;
  salario_min_clp: number;
  salario_max_clp: number;
  region: string;
};

type RowStatus = "pending" | "loading" | "done" | "error";

type BenchmarkRow = {
  cargo: CargoCSV;
  status: RowStatus;
  p25: number | null;
  p50: number | null;
  p75: number | null;
};

type Posicion = "Sobre mercado" | "Alineado" | "Bajo mercado" | "Muy bajo" | "Sin datos";

const POS_COLOR: Record<Posicion, string> = {
  "Sobre mercado": "#06D6A0",
  "Alineado":      "#00B4D8",
  "Bajo mercado":  "#F7C948",
  "Muy bajo":      "#FF6B6B",
  "Sin datos":     "rgba(255,255,255,0.2)",
};

function inferAnios(cargo: string): number {
  const c = cargo.toLowerCase();
  if (c.includes("gerente"))                                    return 20;
  if (c.includes("senior"))                                     return 12;
  if (c.includes("supervisor"))                                 return 10;
  if (c.includes("coordinador") || c.includes("especialista")) return 8;
  if (c.includes("analista") || c.includes("profesional") || c.includes("ingeniero")) return 5;
  if (c.includes("técnico") || c.includes("tecnico"))          return 3;
  return 2;
}

function getPos(mid: number, p25: number | null, p50: number | null, p75: number | null): Posicion {
  if (p25 === null && p50 === null && p75 === null) return "Sin datos";
  if (p75 !== null && mid >= p75) return "Sobre mercado";
  if (p50 !== null && mid >= p50) return "Alineado";
  if (p25 !== null && mid >= p25) return "Bajo mercado";
  return "Muy bajo";
}

function fmtCLP(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function vsP50(mid: number, p50: number | null): string {
  if (p50 === null) return "—";
  const pct = ((mid - p50) / p50) * 100;
  return (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%";
}

function sectorToIndustria(sector: string): string {
  const MAP: Record<string, string> = {
    "Tecnología / TI":         "Tecnología",
    "Salud":                   "Salud",
    "Finanzas y Seguros":      "Finanzas y Seguros",
    "Forestal / Celulosa":     "Manufactura / Industria",
    "Minería":                 "Minería",
    "Manufactura / Industria": "Manufactura / Industria",
    "Turismo y Hotelería":     "Turismo y Hotelería",
    "Comercio y Retail":       "Comercio",
    "Educación":               "Educación",
    "Construcción":            "Construcción",
    "Agroindustria":           "Agricultura",
    "Servicios Profesionales": "Servicios Profesionales",
  };
  return MAP[sector] ?? sector;
}

const BATCH = 6;
const C = { abismo: "#0A0F1E", electric: "#00C2FF", teal: "#00E5C4" };

export default function BenchmarkPanel({
  cargos,
  sector,
  onClose,
}: {
  cargos: CargoCSV[];
  sector: string;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<BenchmarkRow[]>(() =>
    cargos.map(c => ({ cargo: c, status: "pending", p25: null, p50: null, p75: null }))
  );
  const abortRef = useRef(false);
  const industria = sectorToIndustria(sector);

  useEffect(() => {
    abortRef.current = false;

    async function runBatch(batchIdx: number) {
      const start = batchIdx * BATCH;
      const end   = Math.min(start + BATCH, cargos.length);

      setRows(prev => {
        const next = [...prev];
        for (let i = start; i < end; i++) next[i] = { ...next[i], status: "loading" };
        return next;
      });

      const results = await Promise.all(
        cargos.slice(start, end).map(async (c, j) => {
          if (abortRef.current) return null;
          const params = new URLSearchParams({
            cargo:             c.cargo,
            industria,
            anios_experiencia: String(inferAnios(c.cargo)),
            region:            c.region,
            salario_min:       String(c.salario_min_clp),
            salario_max:       String(c.salario_max_clp),
          });
          try {
            const res  = await fetch(`/api/benchmark?${params}`);
            const data = res.ok ? await res.json() : null;
            return {
              idx: start + j,
              ok:  res.ok,
              p25: data?.p25 ?? null,
              p50: data?.p50 ?? null,
              p75: data?.p75 ?? null,
            };
          } catch {
            return { idx: start + j, ok: false, p25: null, p50: null, p75: null };
          }
        })
      );

      if (abortRef.current) return;

      setRows(prev => {
        const next = [...prev];
        for (const r of results) {
          if (!r) continue;
          next[r.idx] = {
            ...next[r.idx],
            status: r.ok ? "done" : "error",
            p25:    r.p25,
            p50:    r.p50,
            p75:    r.p75,
          };
        }
        return next;
      });

      if (end < cargos.length && !abortRef.current) await runBatch(batchIdx + 1);
    }

    runBatch(0);
    return () => { abortRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDone = rows.filter(r => r.status === "done" || r.status === "error").length;
  const progress  = cargos.length > 0 ? (totalDone / cargos.length) * 100 : 100;
  const isLoading = progress < 100;

  const counts: Record<Posicion, number> = {
    "Sobre mercado": 0, "Alineado": 0, "Bajo mercado": 0, "Muy bajo": 0, "Sin datos": 0,
  };
  for (const r of rows) {
    if (r.status !== "done") continue;
    const mid = Math.round((r.cargo.salario_min_clp + r.cargo.salario_max_clp) / 2);
    counts[getPos(mid, r.p25, r.p50, r.p75)]++;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(5,8,18,0.97)", backdropFilter: "blur(8px)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 h-16 shrink-0 border-b"
        style={{ background: "rgba(10,15,30,0.98)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-4">
          <div>
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: C.electric, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2px" }}>
              Benchmark salarial
            </p>
            <h2 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
              ¿Estoy pagando bien?
            </h2>
          </div>
          <span style={{
            fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em",
            padding: "3px 8px", borderRadius: "3px",
            background: `${C.electric}12`, color: C.electric, border: `1px solid ${C.electric}25`,
          }}>
            {cargos.length} CARGOS
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 hover:text-white/70 transition-colors"
          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}
        >
          <X size={16} /> Cerrar
        </button>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div exit={{ opacity: 0 }} className="px-6 pt-4 pb-2 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                Analizando {totalDone} / {cargos.length} cargos…
              </p>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.7rem", color: C.electric }}>
                {Math.round(progress)}%
              </p>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(to right, ${C.electric}, ${C.teal})` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary chips */}
      {totalDone > 0 && (
        <div className="flex flex-wrap gap-2 px-6 py-3 shrink-0">
          {(Object.entries(counts) as [Posicion, number][])
            .filter(([, n]) => n > 0)
            .map(([label, n]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold"
                style={{
                  background: `${POS_COLOR[label]}14`,
                  border:     `1px solid ${POS_COLOR[label]}30`,
                  color:      POS_COLOR[label],
                  fontFamily: "var(--font-dm-sans)",
                  fontSize:   "0.75rem",
                }}
              >
                {n} {label}
              </span>
            ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-grow overflow-y-auto px-6 pb-10">
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead className="sticky top-0 z-10" style={{ background: "rgba(5,8,18,0.98)" }}>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Cargo", "Región", "Tu sueldo", "Rango bajo", "Sueldo típico", "Rango alto", "Estado", "vs Mercado"].map(h => (
                <th
                  key={h}
                  className="text-left py-3 pr-5"
                  style={{
                    fontFamily:    "var(--font-space-mono)",
                    fontSize:      "0.5rem",
                    letterSpacing: "0.12em",
                    color:         "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    fontWeight:    600,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const mid      = Math.round((r.cargo.salario_min_clp + r.cargo.salario_max_clp) / 2);
              const pos      = r.status === "done" ? getPos(mid, r.p25, r.p50, r.p75) : null;
              const posColor = pos ? POS_COLOR[pos] : "transparent";

              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Cargo */}
                  <td className="py-3 pr-5" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.85)" }}>
                    {r.cargo.cargo}
                  </td>
                  {/* Región */}
                  <td className="py-3 pr-5" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                    {r.cargo.region}
                  </td>
                  {/* Sueldo empresa (midpoint) */}
                  <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: C.teal, whiteSpace: "nowrap" }}>
                    {fmtCLP(mid)}
                  </td>

                  {r.status === "pending" || r.status === "loading" ? (
                    [0, 1, 2, 3, 4].map(k => (
                      <td key={k} className="py-3 pr-5">
                        <div
                          className="h-3 rounded animate-pulse"
                          style={{ width: k === 3 ? "88px" : k === 4 ? "48px" : "72px", background: "rgba(255,255,255,0.06)" }}
                        />
                      </td>
                    ))
                  ) : r.status === "error" ? (
                    <td colSpan={5} className="py-3" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,100,100,0.5)" }}>
                      Sin datos disponibles
                    </td>
                  ) : (
                    <>
                      {/* P25 */}
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                        {fmtCLP(r.p25)}
                      </td>
                      {/* P50 */}
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>
                        {fmtCLP(r.p50)}
                      </td>
                      {/* P75 */}
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                        {fmtCLP(r.p75)}
                      </td>
                      {/* Posición */}
                      <td className="py-3 pr-5">
                        {pos && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded"
                            style={{
                              background: `${posColor}14`,
                              border:     `1px solid ${posColor}30`,
                              color:      posColor,
                              fontFamily: "var(--font-dm-sans)",
                              fontSize:   "0.72rem",
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pos}
                          </span>
                        )}
                      </td>
                      {/* vs P50 */}
                      <td className="py-3 tabular-nums" style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize:   "0.75rem",
                        color:      r.p50
                          ? mid >= r.p50 ? "#06D6A0" : "#FF6B6B"
                          : "rgba(255,255,255,0.3)",
                        whiteSpace: "nowrap",
                      }}>
                        {vsP50(mid, r.p50)}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
