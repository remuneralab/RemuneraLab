"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, ThumbsDown, MessageSquare, X, CheckCircle, Send, Loader2 } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

interface Props {
  cargo: string;
  industria: string;
  region: string;
}

type Modo = "idle" | "comentario" | "enviado";

export default function FeedbackResultado({ cargo, industria, region }: Props) {
  const [visible,   setVisible]   = useState(false);
  const [modo,      setModo]      = useState<Modo>("idle");
  const [comentario,setComentario]= useState("");
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  async function enviar(tipo: "si" | "no" | "comentario") {
    setLoading(true);
    const mensaje = tipo === "comentario"
      ? `[COMENTARIO] ${comentario}`
      : `[RATING: ${tipo === "si" ? "SÍ" : "NO"}] El resultado fue ${tipo === "si" ? "útil" : "no útil"}`;
    try {
      await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:      email || null,
          mensaje,
          url_origen: typeof window !== "undefined" ? window.location.href : null,
          cargo,
          industria,
          region,
        }),
      });
      setModo("enviado");
      setTimeout(() => setDismissed(true), 2500);
    } finally {
      setLoading(false);
    }
  }

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="feedback-resultado"
          initial={{ opacity: 0, y: 72 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 72 }}
          transition={{ duration: 0.38, ease: E }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#13093a",
              border: "1px solid rgba(133,104,243,0.32)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.72), 0 0 0 1px rgba(133,104,243,0.10)",
            }}
          >
            <AnimatePresence mode="wait">

              {/* Estado: enviado */}
              {modo === "enviado" && (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 px-6 py-7 text-center"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.25)" }}>
                    <CheckCircle size={20} style={{ color: "#06D6A0" }} />
                  </div>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, color: "#fff", fontSize: "0.95rem" }}>
                    ¡Gracias por tu feedback!
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                    Nos ayuda a mejorar RemuneraLab.
                  </p>
                </motion.div>
              )}

              {/* Estado: form comentario */}
              {modo === "comentario" && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>
                      ¿Qué mejorarías?
                    </p>
                    <button onClick={() => setDismissed(true)} className="text-white/30 hover:text-white/60 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    autoFocus
                    rows={3}
                    placeholder="Cuéntanos..."
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none resize-none mb-3"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(133,104,243,0.20)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.50)")}
                    onBlur={e  => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.20)")}
                  />
                  <input
                    type="email"
                    placeholder="Tu correo (opcional)"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none mb-3"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(133,104,243,0.20)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.50)")}
                    onBlur={e  => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.20)")}
                  />
                  <button
                    onClick={() => enviar("comentario")}
                    disabled={loading || !comentario.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-opacity disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #8568f3, #a387f5)",
                      color: "#fff",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Enviar
                  </button>
                </motion.div>
              )}

              {/* Estado: pregunta inicial */}
              {modo === "idle" && (
                <motion.div key="pregunta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-5">
                  <div className="flex items-start justify-between mb-4">
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, color: "#fff", fontSize: "0.92rem", lineHeight: 1.35 }}>
                      ¿Te fue útil esta información?
                    </p>
                    <button onClick={() => setDismissed(true)} className="ml-3 mt-0.5 shrink-0 text-white/25 hover:text-white/55 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => enviar("si")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 hover:brightness-110"
                      style={{
                        background: "rgba(6,214,160,0.12)",
                        border: "1px solid rgba(6,214,160,0.28)",
                        color: "#06D6A0",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.84rem",
                      }}
                    >
                      <ThumbsUp size={14} /> Sí
                    </button>
                    <button
                      onClick={() => enviar("no")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 hover:brightness-110"
                      style={{
                        background: "rgba(247,201,72,0.10)",
                        border: "1px solid rgba(247,201,72,0.24)",
                        color: "#F7C948",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.84rem",
                      }}
                    >
                      <ThumbsDown size={14} /> No
                    </button>
                    <button
                      onClick={() => setModo("comentario")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold transition-all active:scale-95 hover:brightness-110"
                      style={{
                        background: "rgba(133,104,243,0.12)",
                        border: "1px solid rgba(133,104,243,0.28)",
                        color: "#a387f5",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.84rem",
                      }}
                    >
                      <MessageSquare size={14} /> Comentar
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
