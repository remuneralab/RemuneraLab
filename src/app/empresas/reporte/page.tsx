import PrintButton from "./PrintButton";

// ── Arauco S.A. — Demo ejecutivo ─────────────────────────────────────────────
const EMPRESA  = "Arauco S.A.";
const SECTOR   = "Forestal / Celulosa";
const FECHA    = "16 de mayo de 2026";
const PERIODO  = "ESI 2024 · INE ENE oct.–dic. 2024 · Avisos laborales últimos 90 días";

// M01 — Benchmark salarial (ESI 2024 · CIUO-08 + región + shrinkage blending)
type BenchmarkRow = { cargo: string; p25: number; p50: number; p75: number; banda_min: number; banda_max: number; percentil: number; estado: "Óptimo" | "Alerta" | "Riesgo" };
const BENCHMARK: BenchmarkRow[] = [
  {
    cargo:     "Técnico en Operación Forestal",
    p25:       520_000, p50: 670_000, p75: 850_000,
    banda_min: 900_000, banda_max: 1_550_000,
    percentil: 95,
    estado:    "Óptimo",
  },
  {
    cargo:     "Supervisor de Cosecha Forestal",
    p25:       1_100_000, p50: 1_320_000, p75: 1_700_000,
    banda_min: 1_200_000, banda_max: 1_600_000,
    percentil: 56,
    estado:    "Alerta",
  },
  {
    cargo:     "Ingeniero en Prevención de Riesgos",
    p25:       1_100_000, p50: 1_340_000, p75: 1_700_000,
    banda_min: 1_500_000, banda_max: 2_000_000,
    percentil: 78,
    estado:    "Óptimo",
  },
  {
    cargo:     "Analista de Gestión de Personas",
    p25:       700_000, p50: 900_000, p75: 1_100_000,
    banda_min: 800_000, banda_max: 1_100_000,
    percentil: 57,
    estado:    "Óptimo",
  },
  {
    cargo:     "Supervisor Planta de Celulosa",
    p25:       890_000, p50: 1_100_000, p75: 1_350_000,
    banda_min: 1_300_000, banda_max: 1_700_000,
    percentil: 83,
    estado:    "Óptimo",
  },
];

// M02 — Presión de mercado (avisos activos · últimos 90 días)
const PRESION: { cargo: string; presion: "alta" | "media" | "baja"; count_90d: number; delta_pct: number | null }[] = [
  { cargo: "Técnico en Operación Forestal",      presion: "alta",  count_90d: 56,  delta_pct: null },
  { cargo: "Supervisor de Cosecha Forestal",     presion: "alta",  count_90d: 21,  delta_pct: null },
  { cargo: "Ingeniero en Prevención de Riesgos", presion: "alta",  count_90d: 74,  delta_pct: null },
  { cargo: "Analista de Gestión de Personas",    presion: "alta",  count_90d: 194, delta_pct: null },
  { cargo: "Supervisor Planta de Celulosa",      presion: "media", count_90d: 8,   delta_pct: null },
];

// M03 — Drift salarial (mediana de avisos con salario declarado · 90 días)
const DRIFT = [
  { cargo: "Técnico en Operación Forestal",      mediana_90d: 833_000,   empresa_mid: 1_225_000, vs_mediana: +47 },
  { cargo: "Supervisor de Cosecha Forestal",     mediana_90d: 1_795_000, empresa_mid: 1_400_000, vs_mediana: -22 },
  { cargo: "Ingeniero en Prevención de Riesgos", mediana_90d: 1_336_000, empresa_mid: 1_750_000, vs_mediana: +31 },
  { cargo: "Analista de Gestión de Personas",    mediana_90d:   893_000, empresa_mid:   950_000, vs_mediana:  +6 },
  { cargo: "Supervisor Planta de Celulosa",      mediana_90d: 1_102_000, empresa_mid: 1_500_000, vs_mediana: +36 },
];

// M04 — Costo laboral (INE EMRCL · manufactura · T1 2025)
const ICL = { trimestre: "T1 2025", icl_sector: 3.9, icl_nac: 3.7, ir_sector: 3.6, ir_nac: 3.4, ipc: 3.8 };

// M05 — Brecha de género salarial (ESI 2024 · manufactura)
const BRECHA = [
  { nivel: "Dirección / Gerencia",          hombre: 3_850_000, mujer: 3_100_000, gap: 19.5, n: 1 },
  { nivel: "Profesional Senior / Jefatura", hombre: 1_800_000, mujer: 1_550_000, gap: 13.9, n: 2 },
  { nivel: "Técnico / Operativo",           hombre: 1_050_000, mujer:   930_000, gap: 11.4, n: 2 },
];
const GAP_POND = 13.2;

// M06 — Desocupación regional (INE ENE · oct.–dic. 2024)
const ENE_NAC = 8.5;
const ENE_REGIONES: { region: string; tasa: number; tendencia: number; n_cargos: number; contexto: "Mercado ajustado" | "Mercado equilibrado" | "Amplia oferta" }[] = [
  { region: "Los Lagos",     tasa:  5.2, tendencia: -0.3, n_cargos: 12, contexto: "Mercado ajustado"    },
  { region: "Maule",         tasa:  5.8, tendencia: -0.3, n_cargos:  8, contexto: "Mercado ajustado"    },
  { region: "Los Ríos",      tasa:  6.4, tendencia: -0.4, n_cargos:  6, contexto: "Mercado equilibrado" },
  { region: "La Araucanía",  tasa:  7.3, tendencia: -0.7, n_cargos:  7, contexto: "Mercado equilibrado" },
  { region: "Biobío",        tasa:  8.4, tendencia:  0.3, n_cargos: 10, contexto: "Amplia oferta"       },
  { region: "Metropolitana", tasa: 10.1, tendencia: -0.2, n_cargos:  5, contexto: "Amplia oferta"       },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function fmtM(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function estadoColor(e: "Óptimo" | "Alerta" | "Riesgo") {
  return {
    Óptimo: { bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
    Alerta: { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" },
    Riesgo: { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" },
  }[e];
}

function presionStyle(p: "alta" | "media" | "baja") {
  return {
    alta:  { bg: "#fffbeb", text: "#d97706", label: "Alta demanda"  },
    media: { bg: "#eff6ff", text: "#0284c7", label: "Mercado activo" },
    baja:  { bg: "#f9fafb", text: "#6b7280", label: "Nicho / Baja"   },
  }[p];
}

function ctxStyle(c: "Mercado ajustado" | "Mercado equilibrado" | "Amplia oferta") {
  return {
    "Mercado ajustado":    { bg: "#fffbeb", text: "#d97706" },
    "Mercado equilibrado": { bg: "#eff6ff", text: "#0284c7" },
    "Amplia oferta":       { bg: "#ecfdf5", text: "#059669" },
  }[c];
}

function gapColor(g: number) {
  if (g >= 18) return "#dc2626";
  if (g >= 12) return "#d97706";
  if (g >= 6)  return "#0284c7";
  return "#059669";
}

const SH = { fontSize: "0.6rem", color: "#9ca3af", fontFamily: "var(--font-space-mono)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const };
const TH = { fontSize: "0.58rem", color: "#9ca3af", fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 700 };

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReportePage() {
  const optimos   = BENCHMARK.filter(c => c.estado === "Óptimo").length;
  const alertas   = BENCHMARK.filter(c => c.estado === "Alerta").length;
  const riesgos   = BENCHMARK.filter(c => c.estado === "Riesgo").length;
  const ajustadas = ENE_REGIONES.filter(r => r.contexto === "Mercado ajustado").length;
  const bajosMediana = DRIFT.filter(d => d.vs_mediana < 0).length;

  return (
    <div className="min-h-screen print:min-h-0" style={{ background: "#0A0F1E", fontFamily: "var(--font-dm-sans)" }}>

      {/* Barra — solo pantalla */}
      <div
        className="print:hidden sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{ background: "rgba(10,15,30,0.95)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <a href="/empresas" className="text-white/40 hover:text-white/70 transition-colors text-sm">← Volver</a>
          <span className="text-white/20 text-sm">|</span>
          <span className="text-white/60 text-sm">Reporte ejecutivo · {EMPRESA}</span>
        </div>
        <PrintButton />
      </div>

      {/* Hoja */}
      <div className="max-w-5xl mx-auto px-8 py-12 print:p-0 print:max-w-none" style={{ color: "#0A0F1E" }}>
        <div className="rounded-2xl print:rounded-none" style={{ background: "white", boxShadow: "0 0 60px rgba(0,0,0,0.4)" }}>

          {/* ── ENCABEZADO ── */}
          <div className="px-12 py-10 print:px-8 print:py-8 border-b" style={{ borderColor: "#e5e7eb" }}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="font-bold mb-1" style={{ fontSize: "1.5rem", fontFamily: "var(--font-dm-serif)", color: "#0A0F1E", fontStyle: "italic" }}>RemuneraLab</p>
                <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "#9ca3af", textTransform: "uppercase", fontFamily: "var(--font-space-mono)" }}>Workforce Intelligence Platform · Chile</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: "0.75rem", color: "#6b7280", fontFamily: "var(--font-space-mono)" }}>{FECHA}</p>
                <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "4px", fontFamily: "var(--font-space-mono)" }}>REPORTE EJECUTIVO — CONFIDENCIAL</p>
              </div>
            </div>
            <div>
              <h1 className="font-bold mb-2" style={{ fontSize: "1.6rem", color: "#0A0F1E" }}>Análisis de Inteligencia Salarial</h1>
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>{EMPRESA} · Sector: {SECTOR} · 5 cargos analizados · 6 regiones</p>
            </div>
          </div>

          {/* ── RESUMEN EJECUTIVO ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
            <p className="mb-5" style={SH}>Resumen ejecutivo · 6 módulos</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { mod: "M01 Benchmark",       valor: `${optimos} óptimos`,         sub: `${alertas} alerta · ${riesgos} riesgo · ESI 2024`,            color: "#059669", bg: "#ecfdf5" },
                { mod: "M02 Presión mercado", valor: "4 alta demanda",              sub: "56–194 avisos activos / cargo · Técnicos en escasez",           color: "#d97706", bg: "#fffbeb" },
                { mod: "M03 Drift salarial",  valor: `${bajosMediana} bajo mediana`, sub: "Sup. Cosecha −22% vs avisos · Resto sobre mercado",            color: "#dc2626", bg: "#fef2f2" },
                { mod: "M04 ICL manufactura", valor: `+${ICL.icl_sector}%`,         sub: `T1 2025 > IPC +${ICL.ipc}% · Presión de costos`,               color: "#0284c7", bg: "#eff6ff" },
                { mod: "M05 Brecha género",   valor: `${GAP_POND}%`,                sub: `Gap ponderado · Zona Vigilar · Ley 21.719`,                     color: "#d97706", bg: "#fffbeb" },
                { mod: "M06 ENE regional",    valor: `${ajustadas} ajustadas`,       sub: `Tasa < 6% · Captación difícil · Los Lagos / Maule`,            color: "#d97706", bg: "#fffbeb" },
              ].map(k => (
                <div key={k.mod} className="rounded-xl px-5 py-4" style={{ background: k.bg }}>
                  <p style={{ fontSize: "0.58rem", fontFamily: "var(--font-space-mono)", color: k.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>{k.mod}</p>
                  <p className="font-bold tabular-nums" style={{ fontSize: "1.35rem", fontFamily: "var(--font-space-mono)", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                  <p style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: "5px", lineHeight: 1.4 }}>{k.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── M01 BENCHMARK ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb" }}>
            <p className="mb-2" style={SH}>Módulo 01 · Benchmark salarial</p>
            <p className="mb-6" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Posición de las bandas de {EMPRESA} dentro de la distribución del mercado laboral (ESI 2024 · CIUO-08)</p>
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["Cargo", "P25", "P50 mercado", "P75", "Banda empresa", "Percentil", "Estado"].map(h => (
                    <th key={h} className="pb-3 text-left pr-4" style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENCHMARK.map((c, i) => {
                  const col = estadoColor(c.estado);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td className="py-3 pr-4 font-semibold" style={{ color: "#111827", maxWidth: "200px", fontSize: "0.83rem" }}>{c.cargo}</td>
                      <td className="py-3 pr-4 tabular-nums" style={{ color: "#9ca3af", fontFamily: "var(--font-space-mono)", fontSize: "0.75rem" }}>{fmtCLP(c.p25)}</td>
                      <td className="py-3 pr-4 tabular-nums font-semibold" style={{ color: "#111827", fontFamily: "var(--font-space-mono)", fontSize: "0.78rem" }}>{fmtCLP(c.p50)}</td>
                      <td className="py-3 pr-4 tabular-nums" style={{ color: "#9ca3af", fontFamily: "var(--font-space-mono)", fontSize: "0.75rem" }}>{fmtCLP(c.p75)}</td>
                      <td className="py-3 pr-4" style={{ color: "#374151", fontFamily: "var(--font-space-mono)", fontSize: "0.7rem" }}>{fmtCLP(c.banda_min)}–{fmtCLP(c.banda_max)}</td>
                      <td className="py-3 pr-4 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: c.percentil >= 60 ? "#059669" : c.percentil >= 40 ? "#d97706" : "#dc2626" }}>P{c.percentil}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: col.bg, color: col.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.dot }} />
                          {c.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3" style={{ fontSize: "0.67rem", color: "#9ca3af" }}>
              P50 = mediana del mercado (ESI 2024 · sector forestal/manufactura + región). Percentil: posición del midpoint de la banda empresa dentro de la distribución.
            </p>
          </div>

          {/* ── M02 PRESIÓN DE MERCADO ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
            <p className="mb-2" style={SH}>Módulo 02 · Presión de mercado</p>
            <p className="mb-6" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Volumen de avisos laborales activos por cargo en los últimos 90 días. Alta demanda ≥ 20 avisos.</p>
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["Cargo", "Avisos 90d", "Tendencia vs período ant.", "Nivel de presión"].map(h => (
                    <th key={h} className="pb-3 text-left pr-5" style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRESION.map((p, i) => {
                  const ps = presionStyle(p.presion);
                  const maxCount = Math.max(...PRESION.map(x => x.count_90d));
                  const barW = Math.round((p.count_90d / maxCount) * 100);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td className="py-3 pr-5 font-semibold" style={{ color: "#111827", fontSize: "0.83rem" }}>{p.cargo}</td>
                      <td className="py-3 pr-5">
                        <div className="flex items-center gap-3">
                          <span className="tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem", color: "#111827", minWidth: "30px" }}>{p.count_90d}</span>
                          <div style={{ width: 72, height: 5, borderRadius: 3, background: "#e5e7eb" }}>
                            <div style={{ height: "100%", width: `${barW}%`, borderRadius: 3, background: ps.text }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-5" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: "#9ca3af" }}>
                        — {/* Sin período anterior disponible */}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: ps.bg, color: ps.text }}>{ps.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3" style={{ fontSize: "0.67rem", color: "#9ca3af" }}>
              Conteo por categoría ocupacional (keyword matching). Sin período anterior disponible: base de datos cargada en los últimos 90 días.
            </p>
          </div>

          {/* ── M03 DRIFT SALARIAL ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb" }}>
            <p className="mb-2" style={SH}>Módulo 03 · Drift salarial</p>
            <p className="mb-6" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Mediana de avisos con salario declarado en los últimos 90 días vs. midpoint de la banda de {EMPRESA}.</p>
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["Cargo", "Mediana avisos 90d", "Midpoint Arauco", "vs Mediana", "Señal"].map(h => (
                    <th key={h} className="pb-3 text-left pr-5" style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DRIFT.map((d, i) => {
                  const pos = d.vs_mediana >= 0;
                  const sigColor = d.vs_mediana >= 5 ? "#059669" : d.vs_mediana >= -5 ? "#d97706" : "#dc2626";
                  const sigLabel = d.vs_mediana >= 5 ? "Sobre mercado" : d.vs_mediana >= -5 ? "En mercado" : "Bajo mercado";
                  const sigBg    = d.vs_mediana >= 5 ? "#ecfdf5"      : d.vs_mediana >= -5 ? "#fffbeb"    : "#fef2f2";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td className="py-3 pr-5 font-semibold" style={{ color: "#111827", fontSize: "0.83rem" }}>{d.cargo}</td>
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#374151" }}>{fmtCLP(d.mediana_90d)}</td>
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#374151" }}>{fmtCLP(d.empresa_mid)}</td>
                      <td className="py-3 pr-5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem", color: pos ? "#059669" : "#dc2626" }}>
                        {pos ? "+" : ""}{d.vs_mediana}%
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sigBg, color: sigColor }}>{sigLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3" style={{ fontSize: "0.67rem", color: "#9ca3af" }}>
              vs Mediana = ((midpoint empresa − mediana avisos) / mediana avisos) × 100. Valores negativos indican que el mercado está ofreciendo salarios superiores a la banda de {EMPRESA}.
            </p>
          </div>

          {/* ── M04 ICL ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
            <p className="mb-2" style={SH}>Módulo 04 · Costo laboral ICL</p>
            <p className="mb-6" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Índice de Costo Laboral e Índice de Remuneraciones · INE EMRCL · Manufactura · {ICL.trimestre}</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: `ICL Manufactura · ${ICL.trimestre}`, valor: `+${ICL.icl_sector}%`, sub: `vs Nacional +${ICL.icl_nac}%`, color: "#dc2626", bg: "#fef2f2" },
                { label: `IR Manufactura · ${ICL.trimestre}`,  valor: `+${ICL.ir_sector}%`,  sub: `vs Nacional +${ICL.ir_nac}%`,  color: "#d97706", bg: "#fffbeb" },
                { label: "IPC · referencia inflación",          valor: `+${ICL.ipc}%`,         sub: "Banco Central · abril 2025",  color: "#0284c7", bg: "#eff6ff" },
              ].map(k => (
                <div key={k.label} className="rounded-xl px-5 py-4" style={{ background: k.bg }}>
                  <p style={{ fontSize: "0.58rem", fontFamily: "var(--font-space-mono)", color: "#9ca3af", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{k.label}</p>
                  <p className="font-bold tabular-nums" style={{ fontSize: "1.6rem", fontFamily: "var(--font-space-mono)", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                  <p style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: "5px" }}>{k.sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl px-5 py-4" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: "0.75rem", color: "#374151", lineHeight: 1.6 }}>
                <strong>Lectura:</strong> El ICL manufactura (+{ICL.icl_sector}%) supera al IPC (+{ICL.ipc}%) en 0.1 pp, indicando que los costos laborales crecen levemente por encima de la inflación. El presupuesto salarial de {EMPRESA} debe contemplar al menos <strong>+{ICL.icl_sector}%</strong> de ajuste base para neutralizar el alza de costo por empleado.
              </p>
            </div>
          </div>

          {/* ── M05 BRECHA DE GÉNERO ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb" }}>
            <p className="mb-2" style={SH}>Módulo 05 · Brecha de género salarial</p>
            <p className="mb-6" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Gap salarial estimado por nivel jerárquico · Sector manufactura · ESI 2024 · Ley 21.719 (equidad salarial)</p>
            <table className="w-full mb-5" style={{ borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["Nivel jerárquico", "Mediana hombre", "Mediana mujer", "Brecha %", "Riesgo Ley 21.719"].map(h => (
                    <th key={h} className="pb-3 text-left pr-5" style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BRECHA.map((b, i) => {
                  const gc = gapColor(b.gap);
                  const riesgo = b.gap >= 18 ? "Zona de riesgo" : b.gap >= 12 ? "Vigilar" : b.gap >= 6 ? "Aceptable" : "Bajo brecha";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td className="py-3 pr-5 font-semibold" style={{ color: "#111827" }}>{b.nivel}</td>
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#374151" }}>{fmtM(b.hombre)}</td>
                      <td className="py-3 pr-5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#374151" }}>{fmtM(b.mujer)}</td>
                      <td className="py-3 pr-5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem", color: gc }}>
                        {b.gap.toFixed(1).replace(".", ",")}%
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: gc + "18", color: gc }}>{riesgo}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="rounded-xl px-5 py-4" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
              <p className="font-semibold mb-1" style={{ fontSize: "0.78rem", color: "#92400e" }}>
                Gap ponderado: {GAP_POND}% · Zona <strong>Vigilar</strong>
              </p>
              <p style={{ fontSize: "0.72rem", color: "#6b7280", lineHeight: 1.55 }}>
                La brecha en Dirección/Gerencia ({BRECHA[0].gap}%) supera el umbral de riesgo de la Ley 21.719. Se recomienda auditoría de equidad remuneracional antes del próximo reporte regulatorio.
              </p>
            </div>
          </div>

          {/* ── M06 ENE REGIONAL ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb", background: "#f9fafb" }}>
            <p className="mb-2" style={SH}>Módulo 06 · Desocupación regional</p>
            <p className="mb-6" style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Tasa de desocupación en regiones donde opera {EMPRESA} · INE ENE oct.–dic. 2024 · Nacional: {ENE_NAC}%</p>
            <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  {["Región", "Tasa desocp.", "vs Nacional", "Tendencia", "Cargos empresa", "Contexto captación"].map(h => (
                    <th key={h} className="pb-3 text-left pr-5" style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ENE_REGIONES.map((r, i) => {
                  const vsNac = +(r.tasa - ENE_NAC).toFixed(1);
                  const cs = ctxStyle(r.contexto);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td className="py-3 pr-5 font-semibold" style={{ color: "#111827" }}>{r.region}</td>
                      <td className="py-3 pr-5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem", color: cs.text }}>{r.tasa}%</td>
                      <td className="py-3 pr-5 tabular-nums font-semibold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: vsNac <= 0 ? "#059669" : "#d97706" }}>
                        {vsNac > 0 ? "+" : ""}{vsNac} pp
                      </td>
                      <td className="py-3 pr-5" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", color: r.tendencia < 0 ? "#059669" : r.tendencia > 0 ? "#d97706" : "#9ca3af" }}>
                        {r.tendencia > 0 ? "↑" : r.tendencia < 0 ? "↓" : "→"} {Math.abs(r.tendencia)} pp
                      </td>
                      <td className="py-3 pr-5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: "#374151" }}>{r.n_cargos}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: cs.bg, color: cs.text }}>{r.contexto}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3" style={{ fontSize: "0.67rem", color: "#9ca3af" }}>
              Mercado ajustado (tasa ≤ 5.5%): escasez de candidatos, presión salarial al alza. Mercado equilibrado (5.5%–7.5%): oferta/demanda balanceadas. Amplia oferta (&gt;7.5%): mayor disponibilidad de candidatos.
            </p>
          </div>

          {/* ── RECOMENDACIONES ── */}
          <div className="px-12 py-8 print:px-8 border-b" style={{ borderColor: "#e5e7eb" }}>
            <p className="mb-5" style={SH}>Recomendaciones prioritarias</p>
            <ol className="space-y-5">
              {[
                {
                  color:  "#dc2626",
                  titulo: "Revisar banda de Supervisor de Cosecha Forestal — bajo mercado en avisos",
                  texto:  `La mediana de avisos laborales está en ${fmtCLP(DRIFT[1].mediana_90d)} mientras la banda de ${EMPRESA} ($1.200.000–$1.600.000, mid $1.400.000) queda 22% por debajo. Riesgo de rotación en cargo crítico. Ajuste sugerido: elevar techo a $2.000.000 y midpoint a $1.750.000.`,
                },
                {
                  color:  "#d97706",
                  titulo: "Anticipar captación en Los Lagos y Maule — mercado laboral ajustado",
                  texto:  `Tasas de desocupación de 5.2% y 5.8% respectivamente indican escasez de candidatos. Se recomienda extender el plazo de publicación de vacantes a 45+ días, activar canales pasivos (headhunting) y revisar beneficios no monetarios para aumentar atractivo.`,
                },
                {
                  color:  "#0284c7",
                  titulo: `Presupuesto salarial 2026 — incluir mínimo +${ICL.icl_sector}% por alza de ICL manufactura`,
                  texto:  `El Índice de Costo Laboral del sector manufactura creció +${ICL.icl_sector}% en ${ICL.trimestre}, superando el IPC (+${ICL.ipc}%). No incorporar esta corrección en el presupuesto implicará pérdida real del poder adquisitivo de la plantilla y riesgo de desvinculaciones voluntarias.`,
                },
                {
                  color:  "#7c3aed",
                  titulo: `Auditoría de equidad remuneracional — brecha de género ${GAP_POND}% (Ley 21.719)`,
                  texto:  `La brecha en el nivel Dirección/Gerencia alcanza 19.5%, superando el umbral de riesgo regulatorio. La Ley 21.719 (equidad salarial) exige reportes periódicos y planes de nivelación. Se recomienda auditoría interna antes del próximo ciclo de remuneraciones.`,
                },
              ].map((r, i) => (
                <li key={i} className="flex gap-4">
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5" style={{ background: r.color, fontFamily: "var(--font-space-mono)" }}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: "#111827", fontSize: "0.88rem" }}>{r.titulo}</p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.6 }}>{r.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ── PIE ── */}
          <div className="px-12 py-6 print:px-8" style={{ background: "#f9fafb" }}>
            <div className="flex items-start justify-between gap-8">
              <p style={{ fontSize: "0.67rem", color: "#9ca3af", lineHeight: 1.7, maxWidth: "560px" }}>
                <strong style={{ color: "#6b7280" }}>Fuentes:</strong> {PERIODO}. Los benchmarks M01 se calculan mediante metodología CIUO-08 con cascada de 7 niveles y shrinkage blending. M02/M03: portales laborales chilenos (90 días), keyword matching normalizado. M04: INE EMRCL {ICL.trimestre}. M05: ESI 2024 INE. M06: ENE oct.–dic. 2024 INE. Este reporte es confidencial y está destinado exclusivamente al uso interno de {EMPRESA}.
              </p>
              <div className="text-right shrink-0">
                <p className="font-bold italic" style={{ fontFamily: "var(--font-dm-serif)", color: "#0A0F1E", fontSize: "1rem" }}>RemuneraLab</p>
                <p style={{ fontSize: "0.62rem", color: "#9ca3af", fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}>remuneralab.vercel.app</p>
              </div>
            </div>
          </div>

        </div>
        <div className="print:hidden h-12" />
      </div>
    </div>
  );
}
