"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Upload, FileText, Loader2, AlertOctagon, AlertTriangle, CheckCircle2, Lightbulb, X, BookOpen, ChevronRight } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { LEYES, type Hallazgo, type NivelCaso } from "@/lib/liquidacion";
import ProximoPaso from "./ProximoPaso";
export type Analisis = {
  es_liquidacion: boolean;
  legible: boolean;
  resumen: string;
  datos: Record<string, string | number | null>;
  hallazgos: Hallazgo[];
  asesoria: string;
  recomienda_abogado: boolean;
  nivel: NivelCaso;
  diferencia_total: number;
};

const MENSAJES_ESPERA = [
  "Leyendo tu liquidación…",
  "Revisando cotizaciones y descuentos…",
  "Verificando horas extra y gratificación…",
  "Preparando tu asesoría…",
];

function ReferenciaLey({ codigo }: { codigo: Hallazgo["codigo"] }) {
  const [abierta, setAbierta] = useState(false);
  const ley = LEYES[codigo];
  if (!ley) return null;
  return (
    <div className="mt-2">
      <button onClick={() => setAbierta(!abierta)}
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
        style={{ ...FONT, fontSize: "0.76rem" }} aria-expanded={abierta}>
        <ChevronRight size={12} className="transition-transform" style={{ transform: abierta ? "rotate(90deg)" : "none" }} />
        <BookOpen size={12} /> {ley.norma}
      </button>
      {abierta && (
        <p className="mt-1.5 pl-5 text-white/55 italic" style={{ ...FONT, fontSize: "0.8rem", lineHeight: "1.55" }}>
          {ley.texto}
        </p>
      )}
    </div>
  );
}

const E = [0.16, 1, 0.3, 1] as const;
const FONT = { fontFamily: "var(--font-dm-sans)" } as const;

const ETIQUETAS: Record<string, string> = {
  periodo: "Período", empleador: "Empleador", cargo: "Cargo", tipo_contrato: "Contrato",
  sueldo_base: "Sueldo base", total_haberes: "Total haberes", total_imponible: "Total imponible",
  total_descuentos: "Total descuentos", liquido_a_pagar: "Líquido a pagar",
};

const ESTILO_HALLAZGO = {
  error:       { icon: AlertOctagon,  color: "#E63946", bg: "rgba(230,57,70,0.08)",  borde: "rgba(230,57,70,0.30)",  label: "Posible error" },
  advertencia: { icon: AlertTriangle, color: "#F7C948", bg: "rgba(247,201,72,0.07)", borde: "rgba(247,201,72,0.28)", label: "Revisar" },
  ok:          { icon: CheckCircle2,  color: "#06D6A0", bg: "rgba(6,214,160,0.06)",  borde: "rgba(6,214,160,0.22)",  label: "Correcto" },
};

function valor(v: string | number | null) {
  if (v == null || v === "") return "—";
  return typeof v === "number"
    ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v)
    : v;
}

export default function RevisionLiquidacion() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo,  setArchivo]  = useState<File | null>(null);
  const [arrastre, setArrastre] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [paso,     setPaso]     = useState(0);

  // Mensajes de progreso mientras se espera la respuesta
  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(() => setPaso((p) => Math.min(p + 1, MENSAJES_ESPERA.length - 1)), 6000);
    return () => clearInterval(t);
  }, [cargando]);

  function elegir(f: File | undefined) {
    if (!f) return;
    setArchivo(f); setError(null); setAnalisis(null);
  }

  async function analizar() {
    if (!archivo) return;
    setCargando(true); setError(null); setAnalisis(null); setPaso(0);
    sendGAEvent("event", "liquidacion_analizar");
    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      const res  = await fetch("/api/liquidacion/analizar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al analizar");
      setAnalisis(json.analisis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al analizar");
    } finally {
      setCargando(false);
    }
  }

  const conteo = analisis?.hallazgos.reduce((acc, h) => ({ ...acc, [h.tipo]: (acc[h.tipo] ?? 0) + 1 }), {} as Record<string, number>);
  const orden  = { error: 0, advertencia: 1, ok: 2 };

  return (
    <div>
      {/* Carga de archivo */}
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastre(true); }}
        onDragLeave={() => setArrastre(false)}
        onDrop={(e) => { e.preventDefault(); setArrastre(false); elegir(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl px-6 py-10 text-center transition-colors"
        style={{
          border: `1.5px dashed ${arrastre ? "#a387f5" : "rgba(133,104,243,0.40)"}`,
          background: arrastre ? "rgba(133,104,243,0.10)" : "rgba(255,255,255,0.03)",
        }}
      >
        <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
          className="hidden" onChange={(e) => elegir(e.target.files?.[0])} />
        {archivo ? (
          <div className="flex items-center justify-center gap-3">
            <FileText size={22} style={{ color: "#a387f5" }} />
            <span className="text-white/85 truncate max-w-[60vw]" style={{ ...FONT, fontSize: "0.95rem" }}>{archivo.name}</span>
            <button onClick={(e) => { e.stopPropagation(); setArchivo(null); setAnalisis(null); }}
              className="text-white/35 hover:text-white/70" aria-label="Quitar archivo"><X size={16} /></button>
          </div>
        ) : (
          <>
            <Upload size={26} className="mx-auto mb-3" style={{ color: "#8568f3" }} />
            <p className="text-white/80 font-semibold mb-1" style={{ ...FONT, fontSize: "0.95rem" }}>
              Arrastra tu liquidación o haz clic para subirla
            </p>
            <p className="text-white/35" style={{ ...FONT, fontSize: "0.8rem" }}>PDF, JPG, PNG o WEBP · máx. 8 MB</p>
          </>
        )}
      </div>

      <button onClick={analizar} disabled={!archivo || cargando}
        className="mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ ...FONT, background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff", fontSize: "0.95rem" }}>
        {cargando ? <><Loader2 size={17} className="animate-spin" /> {MENSAJES_ESPERA[paso]}</> : "Analizar liquidación"}
      </button>
      <p className="mt-2 text-white/35" style={{ ...FONT, fontSize: "0.78rem" }}>
        {cargando ? "No cierres esta página." : "El análisis puede tardar hasta 30 segundos."}
      </p>

      {error && (
        <p className="mt-4" style={{ ...FONT, fontSize: "0.875rem", color: "#E63946" }}>{error}</p>
      )}

      {/* Resultado */}
      {analisis && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: E }}
          className="mt-10">
          {(!analisis.es_liquidacion || !analisis.legible) ? (
            <div className="rounded-xl px-6 py-5" style={{ border: "1px solid rgba(247,201,72,0.30)", background: "rgba(247,201,72,0.07)" }}>
              <p className="font-semibold mb-1" style={{ ...FONT, color: "#F7C948" }}>No pudimos revisar este documento</p>
              <p className="text-white/60" style={{ ...FONT, fontSize: "0.9rem" }}>{analisis.resumen}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <h2 className="text-white font-bold" style={{ ...FONT, fontSize: "1.35rem" }}>Resultado de la revisión</h2>
                <div className="flex gap-3" style={{ ...FONT, fontSize: "0.8rem" }}>
                  {(["error", "advertencia", "ok"] as const).map((t) => (
                    <span key={t} style={{ color: ESTILO_HALLAZGO[t].color }}>
                      {conteo?.[t] ?? 0} {ESTILO_HALLAZGO[t].label.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-white/60 mb-3" style={{ ...FONT, fontSize: "0.95rem", lineHeight: "1.6" }}>{analisis.resumen}</p>
              {analisis.diferencia_total > 0 && (
                <p className="mb-6" style={{ ...FONT, fontSize: "0.9rem", color: "#E63946" }}>
                  Diferencia estimada este mes: <strong>{valor(analisis.diferencia_total)}</strong>
                </p>
              )}
              {!(analisis.diferencia_total > 0) && <div className="mb-3" />}

              {/* Datos detectados */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px rounded-xl overflow-hidden mb-8"
                style={{ background: "rgba(133,104,243,0.15)", border: "1px solid rgba(133,104,243,0.15)" }}>
                {Object.entries(ETIQUETAS).map(([k, label]) => (
                  <div key={k} className="px-4 py-3" style={{ background: "#1d0f45" }}>
                    <p className="text-white/35 mb-0.5" style={{ ...FONT, fontSize: "0.7rem" }}>{label}</p>
                    <p className="text-white/85 font-semibold truncate" style={{ ...FONT, fontSize: "0.9rem" }}>{valor(analisis.datos?.[k] ?? null)}</p>
                  </div>
                ))}
              </div>

              {/* Hallazgos */}
              <div className="flex flex-col gap-3 mb-8">
                {[...analisis.hallazgos].sort((a, b) => orden[a.tipo] - orden[b.tipo]).map((h, i) => {
                  const s = ESTILO_HALLAZGO[h.tipo] ?? ESTILO_HALLAZGO.advertencia;
                  const Icon = s.icon;
                  return (
                    <div key={i} className="rounded-xl px-5 py-4 flex gap-3" style={{ background: s.bg, border: `1px solid ${s.borde}` }}>
                      <Icon size={18} className="mt-0.5 shrink-0" style={{ color: s.color }} />
                      <div>
                        <p className="font-semibold mb-0.5" style={{ ...FONT, fontSize: "0.92rem", color: s.color }}>{h.titulo}</p>
                        <p className="text-white/65" style={{ ...FONT, fontSize: "0.875rem", lineHeight: "1.55" }}>{h.detalle}</p>
                        {h.tipo !== "ok" && <ReferenciaLey codigo={h.codigo} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Asesoría */}
              <div className="rounded-xl px-6 py-5 mb-8" style={{ border: "1px solid rgba(133,104,243,0.30)", background: "rgba(133,104,243,0.08)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} style={{ color: "#a387f5" }} />
                  <p className="uppercase tracking-[0.18em]" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#a387f5" }}>
                    Asesoría laboral
                  </p>
                </div>
                <p className="text-white/75" style={{ ...FONT, fontSize: "0.92rem", lineHeight: "1.65" }}>{analisis.asesoria}</p>
              </div>
            </>
          )}

          {analisis.es_liquidacion && analisis.legible && <ProximoPaso nivel={analisis.nivel} analisis={analisis} />}
        </motion.div>
      )}
    </div>
  );
}
