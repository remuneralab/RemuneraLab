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

type DriftRow = {
  cargo: string;
  region: string;
  mediana_90d: number | null;
  mediana_prev: number | null;
  drift_pct: number | null;
  tendencia: "alza" | "estable" | "baja" | null;
  empresa_mid: number;
  vs_mediana: number | null;
  n_90d: number;
  n_prev: number;
};

type Meta = {
  total_con_salario_90d: number;
  total_con_salario_prev: number;
  period_from: string;
  period_mid: string;
  period_to: string;
};

type ViewState = "loading" | "done" | "error";
type SortKey   = "cargo" | "nivel" | "region" | "mediana" | "drift" | "empresa" | "vs" | "tendencia";

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
  if (c.includes("gerente"))                                                           return 20;
  if (c.includes("senior"))                                                            return 12;
  if (c.includes("supervisor"))                                                        return 10;
  if (c.includes("coordinador") || c.includes("especialista"))                        return 8;
  if (c.includes("analista") || c.includes("profesional") || c.includes("ingeniero")) return 5;
  if (c.includes("técnico") || c.includes("tecnico"))                                 return 3;
  return 2;
}

function getNivel(cargo: string) {
  return NIVEL[inferAnios(cargo)] ?? NIVEL[2];
}

const TEND = {
  alza:    { label: "En alza",     color: "#F5A623", bg: "rgba(245,166,35,0.1)",   border: "rgba(245,166,35,0.25)",   Icon: TrendingUp   },
  estable: { label: "Estable",     color: "#00C2FF", bg: "rgba(0,194,255,0.08)",   border: "rgba(0,194,255,0.2)",     Icon: Minus        },
  baja:    { label: "A la baja",   color: "#00E5C4", bg: "rgba(0,229,196,0.08)",   border: "rgba(0,229,196,0.2)",     Icon: TrendingDown },
};

const TEND_ORDER = { alza: 0, estable: 1, baja: 2 };

const C = { abismo: "#0A0F1E", electric: "#00C2FF", teal: "#00E5C4", amber: "#F5A623" };

function fmt(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

function fmtPct(n: number | null, sign = true): string {
  if (n === null) return "—";
  return (sign && n >= 0 ? "+" : "") + n + "%";
}

export default function DriftView({
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
  const [state,   setState]   = useState<ViewState>("loading");
  const [rows,    setRows]    = useState<DriftRow[]>([]);
  const [meta,    setMeta]    = useState<Meta | null>(null);
  const [region,  setRegion]  = useState("Todas");
  const [sortKey, setSortKey] = useState<SortKey>("nivel");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  useEffect(() => {
    fetch("/api/drift", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cargos: cargos.map(c => ({
          cargo:       c.cargo,
          region:      c.region,
          salario_min: c.salario_min_clp,
          salario_max: c.salario_max_clp,
        })),
        sector,
      }),
    })
      .then(r => r.json())
      .then(d => { setRows(d.results ?? []); setMeta(d.meta ?? null); setState("done"); })
      .catch(() => setState("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regiones = ["Todas", ...Array.from(new Set(cargos.map(c => c.region))).sort()];

  const filtered = state === "done"
    ? rows.filter(r => region === "Todas" || r.region === region)
    : cargos
        .filter(c => region === "Todas" || c.region === region)
        .map(c => ({
          cargo: c.cargo, region: c.region,
          mediana_90d: null, mediana_prev: null, drift_pct: null, tendencia: null as null,
          empresa_mid: Math.round((c.salario_min_clp + c.salario_max_clp) / 2),
          vs_mediana: null, n_90d: 0, n_prev: 0,
        }));

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(1); }
  }

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "cargo")    cmp = a.cargo.localeCompare(b.cargo, "es");
    if (sortKey === "nivel")    cmp = inferAnios(b.cargo) - inferAnios(a.cargo);
    if (sortKey === "region")   cmp = a.region.localeCompare(b.region, "es");
    if (sortKey === "mediana")  cmp = (a.mediana_90d ?? 0) - (b.mediana_90d ?? 0);
    if (sortKey === "drift")    cmp = (a.drift_pct ?? -999) - (b.drift_pct ?? -999);
    if (sortKey === "empresa")  cmp = a.empresa_mid - b.empresa_mid;
    if (sortKey === "vs")       cmp = (a.vs_mediana ?? -999) - (b.vs_mediana ?? -999);
    if (sortKey === "tendencia") {
      cmp = (TEND_ORDER[a.tendencia ?? "estable"] ?? 1) - (TEND_ORDER[b.tendencia ?? "estable"] ?? 1);
    }
    return cmp * sortDir;
  });

  const alzaCount   = rows.filter(r => r.tendencia === "alza").length;
  const establCount = rows.filter(r => r.tendencia === "estable").length;
  const bajaCount   = rows.filter(r => r.tendencia === "baja").length;

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

  const PlainTH = ({ label }: { label: string }) => (
    <th style={{ paddingBottom: "10px", paddingRight: "16px", paddingTop: "10px", whiteSpace: "nowrap" }}>
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
              Tendencia de sueldos
            </p>
            <h1 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              ¿Están subiendo los sueldos? · {razonSocial}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {state === "done" && alzaCount > 0 && (
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: TEND.alza.bg, border: `1px solid ${TEND.alza.border}`, color: TEND.alza.color, whiteSpace: "nowrap" }}>
              {alzaCount} en alza
            </span>
          )}
          {state === "done" && establCount > 0 && (
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: TEND.estable.bg, border: `1px solid ${TEND.estable.border}`, color: TEND.estable.color, whiteSpace: "nowrap" }}>
              {establCount} estable
            </span>
          )}
          {state === "done" && bajaCount > 0 && (
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: TEND.baja.bg, border: `1px solid ${TEND.baja.border}`, color: TEND.baja.color, whiteSpace: "nowrap" }}>
              {bajaCount} a la baja
            </span>
          )}
          {meta && (
            <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
              {fmtDate(meta.period_mid)} – {fmtDate(meta.period_to)}
            </span>
          )}
          {state === "loading" && (
            <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
              Calculando…
            </span>
          )}
        </div>
      </header>

      {/* Loading bar */}
      {state === "loading" && (
        <div style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
          <motion.div
            style={{ height: "100%", background: `linear-gradient(to right, ${C.teal}, ${C.amber})` }}
            animate={{ width: ["0%", "80%"] }}
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
              borderBottom: region === r ? `2px solid ${C.amber}` : "2px solid transparent",
              marginBottom: "-1px",
              whiteSpace:   "nowrap",
              background:   "none",
              cursor:       "pointer",
              transition:   "color 0.15s",
            }}
          >
            {r}
            <span style={{ marginLeft: "6px", fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: region === r ? C.amber : "rgba(255,255,255,0.2)" }}>
              {r === "Todas" ? cargos.length : cargos.filter(c => c.region === r).length}
            </span>
          </button>
        ))}
      </div>

      {state === "error" && (
        <div className="flex-grow flex items-center justify-center">
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,100,100,0.5)" }}>
            No se pudieron cargar los datos de drift salarial.
          </p>
        </div>
      )}

      {state !== "error" && (
        <div className="flex-grow overflow-auto px-6 pb-12">
          <table className="w-full" style={{ borderCollapse: "collapse", minWidth: "960px" }}>
            <thead className="sticky top-0 z-10" style={{ background: "rgba(10,15,30,0.98)" }}>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <TH      k="cargo"    label="Cargo" />
                <TH      k="nivel"    label="Nivel" />
                <TH      k="region"   label="Región" />
                <TH      k="mediana"  label="Sueldo típico mercado" right />
                <PlainTH label="Avisos c/salario" />
                <TH      k="drift"    label="Cambio en 90 días" right />
                <TH      k="empresa"  label="Empresa (mid)" right />
                <TH      k="vs"       label="Tu sueldo vs Mercado" right />
                <TH      k="tendencia" label="Tendencia" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const nivel  = getNivel(r.cargo);
                const isLoad = state === "loading";
                const ts     = r.tendencia ? TEND[r.tendencia] : null;
                const TsIcon = ts?.Icon;

                const vsColor = r.vs_mediana === null
                  ? "rgba(255,255,255,0.25)"
                  : r.vs_mediana >= 0 ? "#06D6A0" : "#F5A623";

                const driftColor = r.drift_pct === null
                  ? "rgba(255,255,255,0.25)"
                  : r.drift_pct >= 3  ? C.amber
                  : r.drift_pct <= -3 ? C.teal
                  : "rgba(255,255,255,0.55)";

                const Skel = ({ w }: { w: number }) => (
                  <div className="h-3 rounded animate-pulse" style={{ width: w, background: "rgba(255,255,255,0.05)" }} />
                );

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

                    {/* Mediana mercado 90d */}
                    <td className="py-3 pr-4 tabular-nums" style={{ textAlign: "right" }}>
                      {isLoad ? <div className="ml-auto"><Skel w={72} /></div> : (
                        <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", fontWeight: 600, color: r.mediana_90d ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)" }}>
                          {fmt(r.mediana_90d)}
                        </span>
                      )}
                    </td>

                    {/* Avisos con salario (n_90d) */}
                    <td className="py-3 pr-4">
                      {isLoad ? <Skel w={32} /> : (
                        <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: r.n_90d >= 3 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }}>
                          {r.n_90d} avisos
                        </span>
                      )}
                    </td>

                    {/* Drift % vs 90d anterior */}
                    <td className="py-3 pr-4" style={{ textAlign: "right" }}>
                      {isLoad ? <div className="ml-auto"><Skel w={48} /></div> : (
                        <span className="inline-flex items-center justify-end gap-1" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", fontWeight: 600, color: driftColor }}>
                          {r.drift_pct !== null ? (
                            r.drift_pct >= 3  ? <TrendingUp size={11} /> :
                            r.drift_pct <= -3 ? <TrendingDown size={11} /> :
                            <Minus size={11} />
                          ) : null}
                          {r.drift_pct !== null ? fmtPct(r.drift_pct) : "—"}
                        </span>
                      )}
                    </td>

                    {/* Empresa (mid) */}
                    <td className="py-3 pr-4 tabular-nums" style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: C.teal }}>
                        {fmt(r.empresa_mid)}
                      </span>
                    </td>

                    {/* vs Mediana mercado */}
                    <td className="py-3 pr-4 tabular-nums" style={{ textAlign: "right" }}>
                      {isLoad ? <div className="ml-auto"><Skel w={48} /></div> : (
                        <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", fontWeight: 600, color: vsColor }}>
                          {fmtPct(r.vs_mediana)}
                        </span>
                      )}
                    </td>

                    {/* Tendencia badge */}
                    <td className="py-3">
                      {isLoad ? <Skel w={80} /> : ts && TsIcon ? (
                        <span className="inline-flex items-center gap-1.5" style={{
                          fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", fontWeight: 600,
                          padding: "3px 9px", borderRadius: "4px",
                          background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color, whiteSpace: "nowrap",
                        }}>
                          <TsIcon size={11} /> {ts.label}
                        </span>
                      ) : !isLoad ? (
                        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.18)" }}>
                          Sin datos
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
              Fuente: Avisos de empleo con salario declarado · {meta ? `${fmtDate(meta.period_from)} – ${fmtDate(meta.period_to)}` : ""} · {cargos.length} cargos analizados
              {meta ? ` · ${meta.total_con_salario_90d} avisos con salario (90d)` : ""}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}
