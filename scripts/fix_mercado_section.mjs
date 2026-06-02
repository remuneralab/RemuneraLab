import { readFileSync, writeFileSync } from 'fs';

const file = 'src/app/empresas/restoran/page.tsx';
let content = readFileSync(file, 'utf8');

const startMark = '        {/* ── M04 — Presión de mercado ── */}';
const endMark   = '        {/* ── Calculadora rotación ── */}';

const start = content.indexOf(startMark);
const end   = content.indexOf(endMark);

const newSection = `        {/* ── M04 — Presión de mercado ── */}
        {activeSection === "mercado" && (<section className="mb-8">

        {/* Diagnóstico en una línea */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Presión de mercado</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · Avisos laborales últimos 90 días · Región Valparaíso</p>
        </motion.div>

        {/* Alerta principal */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              El mercado está compitiendo activamente por tu Ayudante de Cocina y Garzón Senior ahora mismo.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              3 cargos con alta presión · tensión 82–88/100 · probabilidad de oferta externa 55–78% en 90 días
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {([
              { n: MERCADO_IMPACT.filter(m => m.nivel === "alta").length,  label: "Alta presión", color: "#ba1a1a", bg: "rgba(186,26,26,0.08)"  },
              { n: MERCADO_IMPACT.filter(m => m.nivel === "media").length, label: "Media",        color: "#835500", bg: "rgba(131,85,0,0.08)"  },
              { n: MERCADO_IMPACT.filter(m => m.nivel === "baja").length,  label: "Baja",         color: "#2a7d4f", bg: "rgba(42,125,79,0.08)"  },
            ]).map(s => (
              <div key={s.label} className="text-center rounded-lg px-4 py-2" style={{ background: s.bg }}>
                <p className="font-bold tabular-nums text-xl" style={{ color: s.color }}>{s.n}</p>
                <p style={{ fontSize: "0.65rem", color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BLOQUE 1: Alta presión — Acción inmediata */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <p className="font-semibold text-[#1c1c1a]">Acción urgente — {MERCADO_IMPACT.filter(m => m.nivel === "alta").length} cargos con alta presión de mercado</p>
          </div>
          <div className="space-y-3">
            {MERCADO_IMPACT.filter(m => m.nivel === "alta").map((m, i) => {
              const probColor = m.probOferta >= 65 ? "#ba1a1a" : "#835500";
              const probBg    = m.probOferta >= 65 ? "rgba(186,26,26,0.08)" : "rgba(131,85,0,0.08)";
              const gapAbs    = m.med90d ? Math.abs(m.empresa - m.med90d) : 0;
              return (
                <motion.div key={m.cargo} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.06, ease: E }}
                  className="rounded-xl bg-white border border-[#e5e2de] p-4 flex flex-wrap items-start justify-between gap-4"
                  style={{ borderLeft: "3px solid #ba1a1a" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.92rem" }}>{m.cargo}</span>
                      <span style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>×{m.n_empresa} en equipo</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                        style={{ fontSize: "0.65rem", background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>
                        Alta presión · {m.avisos90d} avisos activos
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.65, borderLeft: "3px solid rgba(186,26,26,0.2)", paddingLeft: "10px" }}>
                      {m.narrativa}
                    </p>
                    {gapAbs > 0 && m.salGap < 0 && (
                      <p style={{ fontSize: "0.75rem", color: "#835500", marginTop: "8px", fontWeight: 600 }}>
                        ↳ Brecha salarial: −{fmtCLP(gapAbs)}/mes vs. mercado — ajustar ahora cuesta menos que reemplazar
                      </p>
                    )}
                  </div>
                  <div className="text-center rounded-lg px-4 py-2 shrink-0" style={{ background: probBg }}>
                    <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: probColor, lineHeight: 1 }}>{m.probOferta}%</p>
                    <p style={{ fontSize: "0.60rem", color: probColor, fontWeight: 600, marginTop: "3px" }}>prob. oferta · 90d</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* BLOQUE 2: Monitorear — Media */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#835500]" />
            <p className="font-semibold text-[#1c1c1a]">Monitorear — {MERCADO_IMPACT.filter(m => m.nivel === "media").length} cargos con presión moderada</p>
          </div>
          <div className="rounded-xl bg-white border border-[#e5e2de] p-4">
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginBottom: "12px" }}>
              Mercado activo pero no agresivo. Mantén sueldos ajustados y monitorea la tendencia trimestral de avisos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MERCADO_IMPACT.filter(m => m.nivel === "media").map(m => (
                <div key={m.cargo} className="rounded-lg p-3" style={{ background: "#f6f3ef" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.84rem" }}>{m.cargo}</span>
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#835500", fontWeight: 700 }}>{m.probOferta}%</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#75777f", lineHeight: 1.5 }}>{m.narrativa}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* BLOQUE 3: Sin acción — Baja + ventana de oportunidad */}
        {MERCADO_IMPACT.filter(m => m.nivel === "baja").length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, ease: E }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a7d4f]" />
              <p className="font-semibold text-[#1c1c1a]">Ventana de oportunidad — presión baja</p>
            </div>
            <div className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3">
              {MERCADO_IMPACT.filter(m => m.nivel === "baja").map(m => (
                <div key={m.cargo} className="flex items-start gap-3">
                  <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full font-semibold shrink-0"
                    style={{ fontSize: "0.65rem", background: "rgba(42,125,79,0.08)", color: "#2a7d4f" }}>
                    ✦ {m.cargo}
                  </span>
                  <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.6 }}>{m.narrativa}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <p style={{ fontSize: "0.66rem", color: "#aaaaaa" }}>
          Fuente: portales Trabajando.cl · Computrabajo · últimos 90 días (mar–may 2026). Índice de tensión calculado sobre avisos activos, tendencia y brecha salarial. Probabilidad de oferta: modelo estimativo.
        </p>

        </section>)}

`;

const newContent = content.slice(0, start) + newSection + content.slice(end);
writeFileSync(file, newContent, 'utf8');
console.log('Done. New file size:', newContent.length);
