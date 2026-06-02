import { readFileSync, writeFileSync } from 'fs';

const file = 'src/app/empresas/restoran/page.tsx';
let content = readFileSync(file, 'utf8');

const start = content.indexOf('        {/* ── M03 — Riesgo de rotación núcleo ── */}');
const end   = content.indexOf('        {/* ── M04 — Presión de mercado ── */}');

const newSection = `        {/* ── M03 — Riesgo de rotación núcleo ── */}
        {activeSection === "rotacion" && (<section className="mb-8">

        {/* Diagnóstico en una línea */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Riesgo de rotación</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · 20 trabajadores del núcleo</p>
        </motion.div>

        {/* Resumen de situación */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              {criticos} personas con riesgo crítico. Si se van antes de enero, el costo de reemplazo supera <span className="text-[#ba1a1a]">$4.5M</span>.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              Diego B. y Diego L. (Ayudantes Cocina) · Fernanda F. y Vicente D. (Auxiliares) · Francisca O. (Bodega)
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {([
              { n: NUCLEO.filter(x => x.riesgo >= 65).length, label: "Crítico",  color: "#ba1a1a", bg: "rgba(186,26,26,0.08)"  },
              { n: NUCLEO.filter(x => x.riesgo >= 45 && x.riesgo < 65).length, label: "Alto", color: "#835500", bg: "rgba(131,85,0,0.08)"  },
              { n: NUCLEO.filter(x => x.riesgo < 45).length,  label: "Bajo",     color: "#2a7d4f", bg: "rgba(42,125,79,0.08)"  },
            ]).map(s => (
              <div key={s.label} className="text-center rounded-lg px-4 py-2" style={{ background: s.bg }}>
                <p className="font-bold tabular-nums text-xl" style={{ color: s.color }}>{s.n}</p>
                <p style={{ fontSize: "0.65rem", color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BLOQUE 1: Acción inmediata — Crítico (65+) */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <p className="font-semibold text-[#1c1c1a]">Acción esta semana — {NUCLEO.filter(x => x.riesgo >= 65).length} en riesgo crítico</p>
          </div>
          <div className="space-y-3">
            {NUCLEO.filter(n => n.riesgo >= 65).sort((a, b) => b.riesgo - a.riesgo).map((n, i) => {
              const bench = BENCHMARK.find(b => b.cargo === n.cargo);
              const gap   = bench ? bench.p50 - n.salario : 0;
              return (
                <motion.div key={n.nombre} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.06, ease: E }}
                  className="rounded-xl bg-white border border-[#e5e2de] p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: n.sexo === "F" ? "rgba(255,100,200,0.12)" : "rgba(4,22,53,0.07)" }}>
                        <Users size={12} style={{ color: n.sexo === "F" ? "#FF64C8" : "#041635" }} />
                      </div>
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.92rem" }}>{n.nombre}</span>
                      <span style={{ fontSize: "0.75rem", color: "#75777f" }}>{n.cargo}</span>
                      {n.contrato === "Plazo fijo" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(186,26,26,0.10)", color: "#ba1a1a" }}>Plazo fijo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {n.factores.map(f => (
                        <span key={f} style={{ fontSize: "0.75rem", color: "#835500" }}>· {f}</span>
                      ))}
                    </div>
                    {gap > 0 && (
                      <p style={{ fontSize: "0.78rem", color: "#44474e", marginTop: "4px" }}>
                        Paga <strong>{fmtCLP(n.salario)}</strong> · Mercado P50 <strong>{fmtCLP(n.salario + gap)}</strong> · brecha <strong className="text-[#ba1a1a]">−{fmtCLP(gap)}/mes</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#e5e2de] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ba1a1a] rounded-full" style={{ width: \`\${n.riesgo}%\` }} />
                      </div>
                      <span className="font-bold text-[#ba1a1a] tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem" }}>{n.riesgo}/100</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>Crítico</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* BLOQUE 2: Monitorear — Alto (45-64) */}
        {NUCLEO.filter(n => n.riesgo >= 45 && n.riesgo < 65).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, ease: E }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#835500]" />
              <p className="font-semibold text-[#1c1c1a]">Monitorear — {NUCLEO.filter(n => n.riesgo >= 45 && n.riesgo < 65).length} en riesgo alto</p>
            </div>
            <div className="rounded-xl bg-white border border-[#e5e2de] p-4">
              <p style={{ fontSize: "0.82rem", color: "#44474e", marginBottom: "12px" }}>
                No requieren acción inmediata pero cualquier oferta externa en los próximos 90 días puede inclinar la balanza.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NUCLEO.filter(n => n.riesgo >= 45 && n.riesgo < 65).sort((a, b) => b.riesgo - a.riesgo).map(n => (
                  <div key={n.nombre} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "#f6f3ef" }}>
                    <div>
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.84rem" }}>{n.nombre}</span>
                      <span className="ml-2 text-[#9a9a9a]" style={{ fontSize: "0.72rem" }}>{n.cargo}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: "#835500" }}>{n.riesgo}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* BLOQUE 3: Sin acción — Bajo/Moderado */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a7d4f]" />
            <p className="font-semibold text-[#1c1c1a]">Sin acción requerida — {NUCLEO.filter(n => n.riesgo < 45).length} con riesgo bajo o moderado</p>
          </div>
          <div className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5 items-center">
            {NUCLEO.filter(n => n.riesgo < 45).sort((a, b) => a.riesgo - b.riesgo).map(n => (
              <span key={n.nombre} className="flex items-center gap-1.5" style={{ fontSize: "0.82rem", color: "#44474e" }}>
                <CheckCircle2 size={13} style={{ color: "#2a7d4f", flexShrink: 0 }} />
                <span className="font-semibold text-[#1c1c1a]">{n.nombre}</span>
                <span className="text-[#9a9a9a]">{n.riesgo}/100</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Ver tabla completa colapsable */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.56, ease: E }}>
          <button
            onClick={() => setExpandedNucleo(expandedNucleo === -1 ? null : -1)}
            className="flex items-center gap-2 mb-3 hover:opacity-70 transition-opacity"
            style={{ fontSize: "0.82rem", color: "#75777f", fontWeight: 600 }}>
            {expandedNucleo === -1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expandedNucleo === -1 ? "Ocultar tabla completa" : "Ver los 20 trabajadores"}
          </button>
          <AnimatePresence>
            {expandedNucleo === -1 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                <div className="space-y-2">
                  {[...NUCLEO].sort((a, b) => b.riesgo - a.riesgo).map((n, i) => {
                    const rc = riesgoColor(n.riesgo);
                    return (
                      <div key={i} className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: n.sexo === "F" ? "rgba(255,100,200,0.12)" : "rgba(4,22,53,0.07)" }}>
                          <Users size={12} style={{ color: n.sexo === "F" ? "#FF64C8" : "#041635" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.82rem" }}>{n.nombre}</span>
                            <span style={{ fontSize: "0.70rem", color: "#75777f" }}>{n.cargo}</span>
                            {n.contrato === "Plazo fijo" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>PF</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-1.5 bg-[#e5e2de] rounded-full overflow-hidden">
                              <div className={\`h-full \${rc.bar} rounded-full\`} style={{ width: \`\${n.riesgo}%\` }} />
                            </div>
                            <span className={\`font-bold tabular-nums text-xs \${rc.text}\`} style={{ fontFamily: "var(--font-space-mono)" }}>{n.riesgo}</span>
                            <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded-full \${rc.badge}\`}>{rc.label}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-[#1c1c1a] tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem" }}>{fmtCLP(n.salario)}</p>
                          <p style={{ fontSize: "0.62rem", color: "#9a9a9a" }}>{n.experiencia}a · {n.area}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3" style={{ fontSize: "0.68rem", color: "#9a9a9a" }}>
                  Score compuesto: brecha salarial vs P50, tipo de contrato, antigüedad, jornada y factores de liquidez del cargo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        </section>)}

`;

const newContent = content.slice(0, start) + newSection + content.slice(end);
writeFileSync(file, newContent, 'utf8');
console.log('Done. New file size:', newContent.length);
