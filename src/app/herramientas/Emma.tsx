"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, ChevronRight, MessageCircle } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import type { Hallazgo, NivelCaso, ContextoCaso } from "@/lib/liquidacion";

const E = [0.16, 1, 0.3, 1] as const;
const FONT = { fontFamily: "var(--font-dm-sans)" } as const;
const MS_POR_LETRA = 16;

type Modo = "inicio" | "mas" | "pregunta";
interface Turno { pregunta: string; respuesta: string; modo: Modo }

interface Props {
  nivel: NivelCaso;
  contexto: ContextoCaso;
  hallazgos: Hallazgo[];
  diferencia_total: number;
  datos: Record<string, string | number | null>;
}

function AvatarEmma({ size = 40 }: { size?: number }) {
  return (
    <div className="shrink-0 rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: "linear-gradient(135deg, #8568f3, #06D6A0)", boxShadow: "0 0 18px rgba(133,104,243,0.55)" }}>
      <Sparkles size={size * 0.48} color="#fff" />
    </div>
  );
}

// Muestra el texto letra por letra, como si Emma lo estuviera escribiendo.
function TextoEscrito({ texto, onFin }: { texto: string; onFin?: () => void }) {
  const [n, setN] = useState(0);
  const fin = useRef(onFin);
  useEffect(() => { fin.current = onFin; }, [onFin]);
  useEffect(() => {
    const t = setInterval(() => {
      setN((v) => {
        if (v >= texto.length) { clearInterval(t); fin.current?.(); return v; }
        return v + 1;
      });
    }, MS_POR_LETRA);
    return () => clearInterval(t);
  }, [texto]);
  return (
    <span>
      {texto.slice(0, n)}
      {n < texto.length && <span className="inline-block w-[2px] h-[1em] align-[-2px] ml-0.5 animate-pulse" style={{ background: "#a387f5" }} />}
    </span>
  );
}

function Escribiendo() {
  return (
    <span className="inline-flex gap-1 items-center h-5" aria-label="Emma está escribiendo">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#a387f5" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}

export default function Emma({ nivel, contexto, hallazgos, diferencia_total, datos }: Props) {
  const [abierta,    setAbierta]    = useState(false);
  const [turnos,     setTurnos]     = useState<Turno[]>([]);
  const [pensando,   setPensando]   = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const [pregunta,   setPregunta]   = useState("");
  const [error,      setError]      = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  async function consultar(modo: Modo, texto = "") {
    setPensando(true); setError(null); setPreguntando(false);
    sendGAEvent("event", "emma_consulta", { modo });
    const etiqueta = modo === "inicio" ? "" : modo === "mas" ? "Quiero saber más" : texto;
    try {
      const res = await fetch("/api/emma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo, pregunta: texto, nivel, contexto, hallazgos, diferencia_total, datos,
          historial: turnos.map(({ pregunta, respuesta }) => ({ pregunta, respuesta })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error");
      setEscribiendo(true);
      setTurnos((t) => [...t, { pregunta: etiqueta, respuesta: json.respuesta, modo }]);
      setPregunta("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Emma no está disponible.");
    } finally {
      setPensando(false);
    }
  }

  function abrir() {
    setAbierta(true);
    if (!turnos.length) consultar("inicio");
  }

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turnos.length, pensando, preguntando]);

  const ocupado = pensando || escribiendo;

  // ── Estado cerrado: solo la invitación ──
  if (!abierta) {
    return (
      <motion.button onClick={abrir}
        className="w-full rounded-2xl p-[2px] text-left mb-8"
        style={{ background: "linear-gradient(120deg, #8568f3, #06D6A0, #a387f5, #8568f3)", backgroundSize: "300% 300%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <div className="rounded-[14px] px-5 py-5 sm:px-6 flex items-center gap-4" style={{ background: "#1d0f45" }}>
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <AvatarEmma size={48} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold leading-snug" style={{ ...FONT, fontSize: "1.08rem" }}>
              Consulta con Emma, nuestra asistente IA laboral
            </p>
            <p className="text-white/55" style={{ ...FONT, fontSize: "0.85rem" }}>
              Te explica tu liquidación en palabras simples y qué hacer
            </p>
          </div>
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 font-semibold px-4 py-2.5 rounded-lg"
            style={{ ...FONT, fontSize: "0.88rem", color: "#fff", background: "linear-gradient(135deg, #8568f3, #a387f5)" }}>
            Preguntar a Emma <ChevronRight size={16} />
          </span>
        </div>
      </motion.button>
    );
  }

  // ── Conversación ──
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E }}
      className="rounded-2xl p-5 sm:p-6 mb-8"
      style={{ background: "linear-gradient(160deg, rgba(133,104,243,0.14), rgba(6,214,160,0.04))", border: "1px solid rgba(133,104,243,0.40)" }}>
      <div className="flex items-center gap-3 mb-5">
        <AvatarEmma size={36} />
        <div>
          <p className="text-white font-bold leading-tight" style={{ ...FONT, fontSize: "1rem" }}>Emma</p>
          <p className="text-white/45" style={{ ...FONT, fontSize: "0.75rem" }}>Asistente IA laboral · RemuneraLab</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {turnos.map((t, i) => (
          <div key={i} className="flex flex-col gap-3">
            {t.pregunta && (
              <p className="self-end max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 text-white"
                style={{ ...FONT, fontSize: "0.88rem", background: "rgba(133,104,243,0.35)" }}>
                {t.pregunta}
              </p>
            )}
            <p className="max-w-[95%] rounded-2xl rounded-tl-sm px-4 py-3 text-white/90 whitespace-pre-line"
              style={{ ...FONT, fontSize: "0.93rem", lineHeight: "1.65", background: "rgba(255,255,255,0.06)" }}>
              {i === turnos.length - 1 && escribiendo
                ? <TextoEscrito texto={t.respuesta} onFin={() => setEscribiendo(false)} />
                : t.respuesta}
            </p>
          </div>
        ))}

        {pensando && (
          <div className="rounded-2xl rounded-tl-sm px-4 py-3 self-start" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Escribiendo />
          </div>
        )}

        {error && <p style={{ ...FONT, fontSize: "0.85rem", color: "#E63946" }}>{error}</p>}

        {/* Opciones después de cada respuesta */}
        <AnimatePresence>
          {!ocupado && turnos.length > 0 && !preguntando && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-wrap gap-2.5 pt-1">
              <button onClick={() => consultar("mas")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity"
                style={{ ...FONT, fontSize: "0.85rem", color: "#fff", background: "linear-gradient(135deg, #8568f3, #a387f5)" }}>
                <Sparkles size={14} /> Saber más
              </button>
              <button onClick={() => setPreguntando(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-white/5 transition-colors"
                style={{ ...FONT, fontSize: "0.85rem", color: "#e7e4fd", border: "1px solid rgba(133,104,243,0.45)" }}>
                <MessageCircle size={14} /> Consultar otro tema
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {preguntando && !ocupado && (
          <form onSubmit={(e) => { e.preventDefault(); if (pregunta.trim()) consultar("pregunta", pregunta.trim()); }}
            className="flex gap-2 pt-1">
            <input autoFocus value={pregunta} onChange={(e) => setPregunta(e.target.value)} maxLength={500}
              placeholder="Ej: ¿Cómo se calculan mis vacaciones?"
              className="flex-1 min-w-0 rounded-full px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#8568f3]/60"
              style={{ ...FONT, fontSize: "0.88rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(133,104,243,0.35)" }} />
            <button type="submit" disabled={!pregunta.trim()} aria-label="Enviar consulta"
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #8568f3, #a387f5)" }}>
              <Send size={16} color="#fff" />
            </button>
          </form>
        )}
        <div ref={finRef} />
      </div>

      <p className="mt-4 text-white/30" style={{ ...FONT, fontSize: "0.7rem" }}>
        Emma es una IA y puede equivocarse. Su orientación no reemplaza la asesoría legal.
      </p>
    </motion.div>
  );
}
