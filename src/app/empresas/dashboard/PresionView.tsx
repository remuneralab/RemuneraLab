"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";

type CargoCSV = {
  cargo: string;
  salario_min_clp: number;
  salario_max_clp: number;
  region: string;
};

type PresionRow = {
  cargo: string;
  region: string;
  count_90d: number;
  count_prev: number;
  delta_pct: number | null;
  presion: "alta" | "media" | "baja" | null;
};

type Meta = {
  total_avisos_90d: number;
  total_avisos_prev: number;
  period_from: string;
  period_mid: string;
  period_to: string;
};

type ViewState = "loading" | "done" | "error";
type SortKey = "cargo" | "nivel" | "region" | "count" | "delta" | "presion";

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
  if (c.includes("gerente"))                                                       return 20;
  if (c.includes("senior"))                                                        return 12;
  if (c.includes("supervisor"))                                                    return 10;
  if (c.includes("coordinador") || c.includes("especialista"))                    return 8;
  if (c.includes("analista") || c.includes("profesional") || c.includes("ingeniero")) return 5;
  if (c.includes("técnico") || c.includes("tecnico"))                             return 3;
  return 2;
}

function getNivel(cargo: string) {
  return NIVEL[inferAnios(cargo)] ?? NIVEL[2];
}

const PRESION_STYLE = {
  alta:  { label: "Alta demanda",    color: "#F5A623", bg: "rgba(245,166,35,0.1)",   border: "rgba(245,166,35,0.25)"   },
  media: { label: "Mercado activo",  color: "#00C2FF", bg: "rgba(0,194,255,0.08)",   border: "rgba(0,194,255,0.2)"     },
  baja:  { label: "Nicho / Baja",    color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" },
};

const PRESION_ORDER = { alta: 0, media: 1, baja: 2 };

const C = { abismo: "#0A0F1E", nocturno: "#1C2438", electric: "#00C2FF", teal: "#00E5C4", amber: "#F5A623" };

function AvisoBar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (count / max) * 100) : 0;
  const color = count >= 20 ? C.amber : count >= 5 ? C.electric : "rgba(255,255,255,0.15)";
  return (
    <div style={{ width: 72, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.6s ease" }} />
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function PresionView({
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
  const [state,    setState]    = useState<ViewState>("loading");
  const [rows,     setRows]     = useState<PresionRow[]>([]);
  const [meta,     setMeta]     = useState<Meta | null>(null);
  const [region,   setRegion]   = useState("Todas");
  const [sortKey,  setSortKey]  = useState<SortKey>("nivel");
  const [sortDir,  setSortDir]  = useState<1 | -1>(1);

  useEffect(() => {
    const body = {
      cargos: cargos.map(c => ({ cargo: c.cargo, region: c.region })),
      sector,
    };
    fetch("/api/presion", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    })
      .then(r => r.json())
      .then(d => {
        setRows(d.results ?? []);
        setMeta(d.meta ?? null);
        setState("done");
      })
      .catch(() => setState("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regiones = ["Todas", ...Array.from(new Set(cargos.map(c => c.region))).sort()];

  const filtered = state === "done"
    ? rows.filter(r => region === "Todas" || r.region === region)
    : cargos
        .filter(c => region === "Todas" || c.region === region)
        .map(c => ({ cargo: c.cargo, region: c.region, count_90d: 0, count_prev: 0, delta_pct: null, presion: null as null }));

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  }

  const maxCount = Math.max(1, ...rows.map(r => r.count_90d));

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "cargo")   cmp = a.cargo.localeCompare(b.cargo, "es");
    if (sortKey === "nivel")   cmp = inferAnios(b.cargo) - inferAnios(a.cargo);
    if (sortKey === "region")  cmp = a.region.localeCompare(b.region, "es");
    if (sortKey === "count")   cmp = a.count_90d - b.count_90d;
    if (sortKey === "delta")   cmp = (a.delta_pct ?? -999) - (b.delta_pct ?? -999);
    if (sortKey === "presion") {
      cmp = (PRESION_ORDER[a.presion ?? "baja"] ?? 2) - (PRESION_ORDER[b.presion ?? "baja"] ?? 2);
    }
    return cmp * sortDir;
  });

  // Chips de resumen
  const altaCount  = rows.filter(r => r.presion === "alta").length;
  const mediaCount = rows.filter(r => r.presion === "media").length;

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
      style={{ textAlign: right ? "right" : "left", paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px", whiteSpace: "nowrap" }}
    >
      <span className="inline-flex items-center gap-1" style={{
        fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em",
        color: sortKey === k ? C.electric : "rgba(255,255,255,0.28)", textTransform: "uppercase", fontWeight: 600,
      }}>
        {label} <SortIcon k={k} />
      </span>
    </th>
  );

  const PlainTH = ({ label, right }: { label: string; right?: boolean }) => (
    <th style={{ textAlign: right ? "right" : "left", paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px", whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
        {label}
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
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div>
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.5rem", color: C.teal, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1px" }}>
              Competencia de contratación
            </p>
            <h1 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              ¿Hay competencia por tus cargos? · {razonSocial}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {state === "done" && altaCount > 0 && (
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: PRESION_STYLE.alta.bg, border: `1px solid ${PRESION_STYLE.alta.border}`, color: PRESION_STYLE.alta.color, whiteSpace: "nowrap" }}>
              {altaCount} alta demanda
            </span>
          )}
          {state === "done" && mediaCount > 0 && (
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: PRESION_STYLE.media.bg, border: `1px solid ${PRESION_STYLE.media.border}`, color: PRESION_STYLE.media.color, whiteSpace: "nowrap" }}>
              {mediaCount} activo
            </span>
          )}
          {meta && (
            <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
              {fmtDate(meta.period_mid)} – {fmtDate(meta.period_to)}
            </span>
          )}
          {state === "loading" && (
            <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
              Cargando…
            </span>
          )}
        </div>
      </header>

      {/* Loading bar */}
      {state === "loading" && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            style={{ height: "100%", background: `linear-gradient(to right, ${C.teal}, ${C.electric})` }}
            animate={{ width: ["0%", "85%"] }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
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
              fontFamily:   "var(--font-dm-sans)",
              fontSize:     "0.78rem",
              fontWeight:   region === r ? 600 : 400,
              color:        region === r ? "#fff" : "rgba(255,255,255,0.35)",
              padding:      "8px 14px",
              borderBottom: region === r ? `2px solid ${C.teal}` : "2px solid transparent",
              marginBottom: "-1px",
              whiteSpace:   "nowrap",
              background:   "none",
              cursor:       "pointer",
              transition:   "color 0.15s",
            }}
          >
            {r}
            <span style={{ marginLeft: "6px", fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: region === r ? C.teal : "rgba(255,255,255,0.2)" }}>
              {r === "Todas" ? cargos.length : cargos.filter(c => c.region === r).length}
            </span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {state === "error" && (
        <div className="flex-grow flex items-center justify-center">
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,100,100,0.5)" }}>
            No se pudieron cargar los datos de presión de mercado.
          </p>
        </div>
      )}

      {/* Table */}
      {state !== "error" && (
        <div className="flex-grow overflow-auto px-6 pb-12">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "780px" }}>
            <thead className="sticky top-0 z-10" style={{ background: "rgba(10,15,30,0.98)" }}>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <TH    k="cargo"   label="Cargo" />
                <TH    k="nivel"   label="Nivel" />
                <TH    k="region"  label="Región" />
                <TH    k="count"   label="Avisos activos" right />
                <PlainTH label="Actividad" />
                <TH    k="delta"   label="Tendencia" right />
                <TH    k="presion" label="Demanda" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const nivel   = getNivel(r.cargo);
                const isLoad  = state === "loading";
                const ps      = r.presion ? PRESION_STYLE[r.presion] : null;

                const DeltaCell = () => {
                  if (isLoad) return <div className="h-3 rounded animate-pulse" style={{ width: 48, background: "rgba(255,255,255,0.05)" }} />;
                  if (r.delta_pct === null) {
                    return <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>—</span>;
                  }
                  const up    = r.delta_pct >= 0;
                  const color = up ? C.teal : C.amber;
                  const Icon  = up ? TrendingUp : TrendingDown;
                  return (
                    <span className="inline-flex items-center gap-1" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", fontWeight: 600, color }}>
                      <Icon size={11} />
                      {up ? "+" : ""}{r.delta_pct}%
                    </span>
                  );
                };

                return (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {/* Cargo */}
                    <td className="py-3 pr-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.88)", minWidth: "200px" }}>
                      {r.cargo}
                    </td>

                    {/* Nivel */}
                    <td className="py-3 pr-4">
                      <span style={{
                        fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", letterSpacing: "0.1em",
                        padding: "2px 7px", borderRadius: "3px",
                        background: `${nivel.color}14`, border: `1px solid ${nivel.color}30`, color: nivel.color, whiteSpace: "nowrap",
                      }}>
                        {nivel.label}
                      </span>
                    </td>

                    {/* Región */}
                    <td className="py-3 pr-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", whiteSpace: "nowrap" }}>
                      {r.region}
                    </td>

                    {/* Avisos 90d */}
                    <td className="py-3 pr-4 tabular-nums" style={{ textAlign: "right" }}>
                      {isLoad ? (
                        <div className="h-3 rounded animate-pulse ml-auto" style={{ width: 32, background: "rgba(255,255,255,0.05)" }} />
                      ) : (
                        <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", fontWeight: 700, color: r.count_90d >= 20 ? C.amber : r.count_90d >= 5 ? C.electric : "rgba(255,255,255,0.3)" }}>
                          {r.count_90d}
                        </span>
                      )}
                    </td>

                    {/* Barra de actividad */}
                    <td className="py-3 pr-5">
                      {isLoad ? (
                        <div className="h-3 rounded animate-pulse" style={{ width: 72, background: "rgba(255,255,255,0.05)" }} />
                      ) : (
                        <AvisoBar count={r.count_90d} max={maxCount} />
                      )}
                    </td>

                    {/* Delta */}
                    <td className="py-3 pr-4" style={{ textAlign: "right" }}>
                      {r.count_90d === 0 && r.count_prev === 0 && !isLoad ? (
                        <span className="inline-flex items-center gap-1" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
                          <Minus size={10} /> Sin datos
                        </span>
                      ) : (
                        <DeltaCell />
                      )}
                    </td>

                    {/* Presión badge */}
                    <td className="py-3">
                      {isLoad ? (
                        <div className="h-5 rounded animate-pulse" style={{ width: 90, background: "rgba(255,255,255,0.05)" }} />
                      ) : ps ? (
                        <span style={{
                          fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600,
                          padding: "3px 9px", borderRadius: "4px",
                          background: ps.bg, border: `1px solid ${ps.border}`, color: ps.color, whiteSpace: "nowrap",
                        }}>
                          {ps.label}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {state === "done" && (
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.18)", marginTop: "24px", textAlign: "center" }}>
              Fuente: Portales de empleo · {meta ? `${fmtDate(meta.period_mid)} – ${fmtDate(meta.period_to)}` : ""} · {cargos.length} cargos · {meta?.total_avisos_90d ?? 0} avisos analizados · Conteo por categoría ocupacional
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
