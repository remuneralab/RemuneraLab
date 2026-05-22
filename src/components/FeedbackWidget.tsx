"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, CheckCircle, Loader2 } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

export default function FeedbackWidget() {
  const [open, setOpen]       = useState(false);
  const [email, setEmail]     = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || null,
          mensaje,
          url_origen: typeof window !== "undefined" ? window.location.href : null,
        }),
      });
      setEnviado(true);
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => { setEnviado(false); setEmail(""); setMensaje(""); }, 400);
      }, 2800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.95 }}
            transition={{ duration: 0.22, ease: E }}
            className="w-80 rounded-2xl overflow-hidden"
            style={{
              background: "#13093a",
              border: "1px solid rgba(133,104,243,0.28)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(133,104,243,0.10)",
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(133,104,243,0.15)" }}>
              <div className="flex items-center gap-2">
                <MessageCircle size={14} style={{ color: "#8568f3" }} />
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "#fff", fontWeight: 600 }}>
                  ¿Cómo podemos mejorar?
                </p>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white/60 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                {enviado ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center gap-3 py-6"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(133,104,243,0.15)", border: "1px solid rgba(133,104,243,0.30)" }}>
                      <CheckCircle size={22} style={{ color: "#8568f3" }} />
                    </div>
                    <p style={{ fontFamily: "var(--font-dm-sans)", color: "#fff", fontWeight: 600 }}>
                      ¡Gracias por tu mensaje!
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "rgba(255,255,255,0.40)" }}>
                      Te responderemos a la brevedad.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3"
                  >
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.80rem", color: "rgba(255,255,255,0.38)" }}>
                      Cuéntanos si tuviste algún problema, o cómo podemos mejorar RemuneraLab.
                    </p>

                    <textarea
                      required
                      rows={3}
                      placeholder="Tu comentario..."
                      value={mensaje}
                      onChange={e => setMensaje(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none resize-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(133,104,243,0.20)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.50)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.20)")}
                    />

                    <input
                      type="email"
                      placeholder="Tu correo (opcional, para respuesta)"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(133,104,243,0.20)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.50)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.20)")}
                    />

                    <button
                      type="submit"
                      disabled={loading || !mensaje.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg, #8568f3, #a387f5)",
                        color: "#fff",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Enviar mensaje
                    </button>

                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.57rem", color: "rgba(255,255,255,0.20)", textAlign: "center", letterSpacing: "0.05em", lineHeight: 1.6 }}>
                      También puedes escribirnos a{" "}
                      <a
                        href="mailto:andreschile111@gmail.com"
                        className="transition-colors hover:underline"
                        style={{ color: "rgba(133,104,243,0.65)" }}
                      >
                        andreschile111@gmail.com
                      </a>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex items-center justify-center w-12 h-12 rounded-full"
        style={{
          background: open
            ? "rgba(133,104,243,0.20)"
            : "linear-gradient(135deg, #8568f3, #a387f5)",
          color: "#fff",
          border: open ? "1px solid rgba(133,104,243,0.40)" : "none",
          boxShadow: open ? "none" : "0 8px 32px rgba(133,104,243,0.45)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <MessageCircle size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
