"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";

type CargoCSV = {
  cargo: string;
  salario_min_clp: number;
  salario_max_clp: number;
  region: string;
  horas_semana: number;
};

type BenchRow = {
  cargo: CargoCSV;
  status: "pending" | "loading" | "done" | "error";
  p10: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
  fuente: string;
};

type Posicion = "Sobre mercado" | "Alineado" | "Bajo mercado" | "Muy bajo" | "Sin datos";

const POS: Record<Posicion, { color: string; bg: string }> = {
  "Sobre mercado": { color: "#06D6A0", bg: "rgba(6,214,160,0.12)"  },
  "Alineado":      { color: "#00B4D8", bg: "rgba(0,180,216,0.12)"  },
  "Bajo mercado":  { color: "#F7C948", bg: "rgba(247,201,72,0.12)"  },
  "Muy bajo":      { color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
  "Sin datos":     { color: "rgba(255,255,255,0.2)", bg: "transparent" },
};

const NIVEL: Record<number, { label: string; color: string }> = {
  20: { label: "Dirección",    color: "#F472B6" },
  12: { label: "Senior",       color: "#A78BFA" },
  10: { label: "Supervisor",   color: "#00C2FF" },
  8:  { label: "Especialista", color: "#00E5C4" },
  5:  { label: "Profesional",  color: "#00E5C4" },
  3:  { label: "Técnico",      color: "#F5A623" },
  2:  { label: "Operario",     color: "rgba(255,255,255,0.4)" },
};

function inferAnios(cargo: string): number {
  const c = cargo.toLowerCase();
  if (c.includes("gerente"))                                           return 20;
  if (c.includes("senior"))                                            return 12;
  if (c.includes("supervisor"))                                        return 10;
  if (c.includes("coordinador") || c.includes("especialista"))        return 8;
  if (c.includes("analista") || c.includes("profesional") || c.includes("ingeniero")) return 5;
  if (c.includes("técnico") || c.includes("tecnico"))                 return 3;
  return 2;
}

function getNivel(cargo: string) {
  const y = inferAnios(cargo);
  return NIVEL[y] ?? NIVEL[2];
}

function getPos(mid: number, p25: number | null, p50: number | null, p75: number | null): Posicion {
  if (p25 === null && p50 === null && p75 === null) return "Sin datos";
  if (p75 !== null && mid >= p75) return "Sobre mercado";
  if (p50 !== null && mid >= p50) return "Alineado";
  if (p25 !== null && mid >= p25) return "Bajo mercado";
  return "Muy bajo";
}

function fmt(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

function vsP50(mid: number, p50: number | null): string {
  if (!p50) return "—";
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

// Mini barra P10–P90 con marcador del sueldo empresa
function PercentileBar({
  p10, p25, p50, p75, p90, mid,
}: {
  p10: number | null; p25: number | null; p50: number | null;
  p75: number | null; p90: number | null; mid: number;
}) {
  const lo = p10 ?? p25;
  const hi = p90 ?? p75;
  if (!lo || !hi || lo >= hi) return <div style={{ width: 120, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)" }} />;

  const span = hi - lo;
  const pct  = (v: number) => Math.min(100, Math.max(0, ((v - lo) / span) * 100));

  const q1pct = p25 ? pct(p25) : 0;
  const q3pct = p75 ? pct(p75) : 100;
  const midPct = pct(mid);

  const pos = getPos(mid, p25, p50, p75);
  const markerColor = POS[pos].color;

  return (
    <div style={{ position: "relative", width: 120, height: 16, display: "flex", alignItems: "center" }}>
      {/* Track */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }} />
      {/* IQR highlight (P25–P75) */}
      <div style={{
        position: "absolute",
        left:   `${q1pct}%`,
        width:  `${q3pct - q1pct}%`,
        height: 4,
        borderRadius: 1,
        background: "rgba(255,255,255,0.14)",
      }} />
      {/* P50 tick */}
      {p50 && (
        <div style={{
          position: "absolute",
          left:   `${pct(p50)}%`,
          width:  2,
          height: 10,
          marginTop: -3,
          borderRadius: 1,
          background: "rgba(255,255,255,0.35)",
          transform: "translateX(-50%)",
        }} />
      )}
      {/* Company mid marker */}
      <div style={{
        position: "absolute",
        left:     `${midPct}%`,
        width:    8,
        height:   8,
        borderRadius: "50%",
        background: markerColor,
        transform: "translateX(-50%)",
        boxShadow: `0 0 6px ${markerColor}80`,
        zIndex: 2,
      }} />
    </div>
  );
}

const BATCH = 6;
const C = { abismo: "#0A0F1E", nocturno: "#1C2438", electric: "#00C2FF", teal: "#00E5C4" };

type SortKey = "cargo" | "nivel" | "empresa" | "p50" | "vs" | "posicion";

export default function BenchmarkView({
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
  const [rows,      setRows]      = useState<BenchRow[]>(() =>
    cargos.map(c => ({ cargo: c, status: "pending", p10: null, p25: null, p50: null, p75: null, p90: null, fuente: "" }))
  );
  const [region,    setRegion]    = useState("Todas");
  const [sortKey,   setSortKey]   = useState<SortKey>("nivel");
  const [sortDir,   setSortDir]   = useState<1 | -1>(1);
  const abortRef = useRef(false);
  const industria = sectorToIndustria(sector);

  // Fetch en batches
  useEffect(() => {
    abortRef.current = false;

    async function runBatch(bi: number) {
      const start = bi * BATCH;
      const end   = Math.min(start + BATCH, cargos.length);

      setRows(prev => {
        const n = [...prev];
        for (let i = start; i < end; i++) n[i] = { ...n[i], status: "loading" };
        return n;
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
              idx:    start + j,
              ok:     res.ok,
              p10:    data?.p10    ?? null,
              p25:    data?.p25    ?? null,
              p50:    data?.p50    ?? null,
              p75:    data?.p75    ?? null,
              p90:    data?.p90    ?? null,
              fuente: data?.fuente_descripcion ?? "",
            };
          } catch {
            return { idx: start + j, ok: false, p10: null, p25: null, p50: null, p75: null, p90: null, fuente: "" };
          }
        })
      );

      if (abortRef.current) return;

      setRows(prev => {
        const n = [...prev];
        for (const r of results) {
          if (!r) continue;
          n[r.idx] = { ...n[r.idx], status: r.ok ? "done" : "error", p10: r.p10, p25: r.p25, p50: r.p50, p75: r.p75, p90: r.p90, fuente: r.fuente };
        }
        return n;
      });

      if (end < cargos.length && !abortRef.current) await runBatch(bi + 1);
    }

    runBatch(0);
    return () => { abortRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done     = rows.filter(r => r.status === "done" || r.status === "error").length;
  const progress = cargos.length > 0 ? (done / cargos.length) * 100 : 100;

  // Regiones únicas
  const regiones = ["Todas", ...Array.from(new Set(cargos.map(c => c.region))).sort()];

  // Filtrado
  const filtered = rows.filter(r => region === "Todas" || r.cargo.region === region);

  // Ordenamiento
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  }

  const sorted = [...filtered].sort((a, b) => {
    const aMid    = Math.round((a.cargo.salario_min_clp + a.cargo.salario_max_clp) / 2);
    const bMid    = Math.round((b.cargo.salario_min_clp + b.cargo.salario_max_clp) / 2);
    const aHoras  = a.cargo.horas_semana ?? 44;
    const bHoras  = b.cargo.horas_semana ?? 44;
    const aMidFTE = aHoras < 42 ? Math.round(aMid * (42 / aHoras)) : aMid;
    const bMidFTE = bHoras < 42 ? Math.round(bMid * (42 / bHoras)) : bMid;
    let cmp = 0;
    if (sortKey === "cargo")   cmp = a.cargo.cargo.localeCompare(b.cargo.cargo, "es");
    if (sortKey === "nivel")   cmp = inferAnios(b.cargo.cargo) - inferAnios(a.cargo.cargo);
    if (sortKey === "empresa") cmp = aMidFTE - bMidFTE;
    if (sortKey === "p50")     cmp = (a.p50 ?? 0) - (b.p50 ?? 0);
    if (sortKey === "vs")      cmp = (a.p50 ? aMidFTE - a.p50 : 0) - (b.p50 ? bMidFTE - b.p50 : 0);
    if (sortKey === "posicion") {
      const order: Posicion[] = ["Muy bajo", "Bajo mercado", "Alineado", "Sobre mercado", "Sin datos"];
      const pa = getPos(aMidFTE, a.p25, a.p50, a.p75);
      const pb = getPos(bMidFTE, b.p25, b.p50, b.p75);
      cmp = order.indexOf(pa) - order.indexOf(pb);
    }
    return cmp * sortDir;
  });

  // Resumen chips — usa mid FTE para part-time
  const counts = { "Sobre mercado": 0, "Alineado": 0, "Bajo mercado": 0, "Muy bajo": 0 };
  for (const r of rows) {
    if (r.status !== "done") continue;
    const mid = Math.round((r.cargo.salario_min_clp + r.cargo.salario_max_clp) / 2);
    const horas = r.cargo.horas_semana ?? 44;
    const midFTE = horas < 42 ? Math.round(mid * (42 / horas)) : mid;
    const pos = getPos(midFTE, r.p25, r.p50, r.p75);
    if (pos !== "Sin datos") counts[pos as keyof typeof counts]++;
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={10} style={{ opacity: 0.2 }} />;
    return sortDir === 1
      ? <ChevronUp   size={10} style={{ color: C.electric }} />
      : <ChevronDown size={10} style={{ color: C.electric }} />;
  }

  const TH = ({ k, label, right }: { k: SortKey; label: string; right?: boolean }) => (
    <th
      onClick={() => handleSort(k)}
      className="select-none cursor-pointer"
      style={{
        textAlign:     right ? "right" : "left",
        paddingBottom: "10px",
        paddingRight:  "16px",
        paddingTop:    "10px",
        whiteSpace:    "nowrap",
      }}
    >
      <span className="inline-flex items-center gap-1" style={{
        fontFamily:    "var(--font-space-mono)",
        fontSize:      "0.5rem",
        letterSpacing: "0.12em",
        color:         sortKey === k ? C.electric : "rgba(255,255,255,0.28)",
        textTransform: "uppercase",
        fontWeight:    600,
      }}>
        {label} <SortIcon k={k} />
      </span>
    </th>
  );

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
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 hover:text-white/70 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div
            className="h-4 w-px"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div>
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", color: C.electric, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1px" }}>
              Benchmark salarial
            </p>
            <h1 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              ¿Estoy pagando bien? · {razonSocial}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Summary chips */}
          {(Object.entries(counts) as [Posicion, number][])
            .filter(([, n]) => n > 0)
            .map(([label, n]) => (
              <span
                key={label}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize:   "0.72rem",
                  fontWeight: 600,
                  padding:    "3px 10px",
                  borderRadius: "20px",
                  background: POS[label].bg,
                  border:     `1px solid ${POS[label].color}30`,
                  color:      POS[label].color,
                  whiteSpace: "nowrap",
                }}
              >
                {n} {label}
              </span>
            ))}

          {/* Progress */}
          {progress < 100 && (
            <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
              {done}/{cargos.length}
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      {progress < 100 && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            style={{ height: "100%", background: `linear-gradient(to right, ${C.electric}, ${C.teal})` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Region tabs */}
      <div
        className="flex items-center gap-1 px-6 overflow-x-auto shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,15,30,0.6)", paddingTop: "10px", paddingBottom: "0" }}
      >
        {regiones.map(r => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            style={{
              fontFamily:    "var(--font-dm-sans)",
              fontSize:      "0.78rem",
              fontWeight:    region === r ? 600 : 400,
              color:         region === r ? "#fff" : "rgba(255,255,255,0.35)",
              padding:       "8px 14px",
              borderBottom:  region === r ? `2px solid ${C.electric}` : "2px solid transparent",
              marginBottom:  "-1px",
              whiteSpace:    "nowrap",
              background:    "none",
              cursor:        "pointer",
              transition:    "color 0.15s",
            }}
          >
            {r}
            <span style={{ marginLeft: "6px", fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: region === r ? C.electric : "rgba(255,255,255,0.2)" }}>
              {r === "Todas" ? cargos.length : cargos.filter(c => c.region === r).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-grow overflow-auto px-6 pb-12">
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "900px" }}>
          <thead className="sticky top-0 z-10" style={{ background: "rgba(10,15,30,0.98)" }}>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <TH k="cargo"    label="Cargo" />
              <TH k="nivel"    label="Nivel" />
              <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                  Región
                </span>
              </th>
              <TH k="empresa"  label="Tu sueldo" right />
              <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                  Mínimo
                </span>
              </th>
              <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                  Rango bajo
                </span>
              </th>
              <TH k="p50"      label="Sueldo típico" right />
              <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                  Rango alto
                </span>
              </th>
              <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                  Máximo
                </span>
              </th>
              <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px" }}>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
                  Distribución
                </span>
              </th>
              <TH k="posicion" label="Estado" />
              <TH k="vs"       label="vs Mercado" right />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const mid      = Math.round((r.cargo.salario_min_clp + r.cargo.salario_max_clp) / 2);
              const horas    = r.cargo.horas_semana ?? 44;
              const isPartTime = horas < 42;
              const midFTE   = isPartTime ? Math.round(mid * (44 / horas)) : mid;
              const pos      = r.status === "done" ? getPos(midFTE, r.p25, r.p50, r.p75) : null;
              const nivel    = getNivel(r.cargo.cargo);
              const isLoad   = r.status === "pending" || r.status === "loading";

              return (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  {/* Cargo */}
                  <td className="py-3 pr-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.88)", minWidth: "200px" }}>
                    {r.cargo.cargo}
                  </td>

                  {/* Nivel */}
                  <td className="py-3 pr-4">
                    <span style={{
                      fontFamily:   "var(--font-space-mono)",
                      fontSize:     "0.55rem",
                      letterSpacing:"0.1em",
                      padding:      "2px 7px",
                      borderRadius: "3px",
                      background:   `${nivel.color}14`,
                      border:       `1px solid ${nivel.color}30`,
                      color:        nivel.color,
                      whiteSpace:   "nowrap",
                    }}>
                      {nivel.label}
                    </span>
                  </td>

                  {/* Región */}
                  <td className="py-3 pr-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap" }}>
                    {r.cargo.region}
                  </td>

                  {/* Sueldo empresa (mid real + FTE si es part-time) */}
                  <td className="py-3 pr-4" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: C.teal }}>{fmt(mid)}</span>
                    {isPartTime && (
                      <span style={{ display: "block", fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: "#F7C948", marginTop: "2px" }}>
                        {horas}h → FTE {fmt(midFTE)}
                      </span>
                    )}
                  </td>

                  {isLoad ? (
                    [0, 1, 2, 3, 4, 5, 6, 7].map(k => (
                      <td key={k} className="py-3 pr-4">
                        <div className="h-3 rounded animate-pulse" style={{ width: k === 5 ? 120 : k >= 6 ? 72 : 64, background: "rgba(255,255,255,0.05)" }} />
                      </td>
                    ))
                  ) : r.status === "error" ? (
                    <td colSpan={8} className="py-3" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,100,100,0.45)" }}>
                      Sin datos suficientes
                    </td>
                  ) : (
                    <>
                      {/* P10 */}
                      <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.32)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {fmt(r.p10)}
                      </td>
                      {/* P25 */}
                      <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {fmt(r.p25)}
                      </td>
                      {/* P50 */}
                      <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.75)", textAlign: "right", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {fmt(r.p50)}
                      </td>
                      {/* P75 */}
                      <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {fmt(r.p75)}
                      </td>
                      {/* P90 */}
                      <td className="py-3 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.32)", textAlign: "right", whiteSpace: "nowrap" }}>
                        {fmt(r.p90)}
                      </td>
                      {/* Barra distribución — usa midFTE para comparar */}
                      <td className="py-3 pr-4">
                        <PercentileBar p10={r.p10} p25={r.p25} p50={r.p50} p75={r.p75} p90={r.p90} mid={midFTE} />
                      </td>
                      {/* Posición */}
                      <td className="py-3 pr-4">
                        {pos && pos !== "Sin datos" && (
                          <span style={{
                            fontFamily:   "var(--font-dm-sans)",
                            fontSize:     "0.72rem",
                            fontWeight:   600,
                            padding:      "3px 8px",
                            borderRadius: "4px",
                            background:   POS[pos].bg,
                            border:       `1px solid ${POS[pos].color}30`,
                            color:        POS[pos].color,
                            whiteSpace:   "nowrap",
                          }}>
                            {pos}
                          </span>
                        )}
                      </td>
                      {/* vs P50 — usa midFTE */}
                      <td className="py-3 tabular-nums" style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize:   "0.75rem",
                        fontWeight: 600,
                        textAlign:  "right",
                        whiteSpace: "nowrap",
                        color:      r.p50
                          ? midFTE >= r.p50 ? "#06D6A0" : "#FF6B6B"
                          : "rgba(255,255,255,0.25)",
                      }}>
                        {vsP50(midFTE, r.p50)}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer note */}
        {progress >= 100 && (
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", marginTop: "24px", textAlign: "center" }}>
            Fuente: ESI {new Date().getFullYear() - 1}–{new Date().getFullYear()} · INE · Avisos scrapeados · Trabajando.cl · {cargos.length} cargos analizados
          </p>
        )}
      </div>
    </motion.div>
  );
}
