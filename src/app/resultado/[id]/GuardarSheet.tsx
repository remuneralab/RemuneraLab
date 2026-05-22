"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Mail, CheckCircle, X } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { supabase } from "@/lib/supabase";

const E = [0.16, 1, 0.3, 1] as const;

interface Props {
  registroId: string;
  onDismiss: () => void;
}

type Paso = "opciones" | "magic" | "guardado" | "skip";

export default function GuardarSheet({ registroId, onDismiss }: Props) {
  const [visible,    setVisible]    = useState(false);
  const [paso,       setPaso]       = useState<Paso>("opciones");
  const [email,      setEmail]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [userEmail,  setUserEmail]  = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Ya logueado: vincular directamente sin mostrar el sheet
        vincularSilencioso(session.access_token);
      } else {
        sendGAEvent("event", "Login_interno");
        const t = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(t);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function vincularSilencioso(token: string) {
    await fetch("/api/perfil/vincular", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ registroId }),
    });
    sendGAEvent("event", "analisis_guardado");
    onDismiss();
  }

  function callbackOrigin() {
    if (typeof window === "undefined") return "";
    return window.location.hostname === "localhost"
      ? "https://remuneralab.vercel.app"
      : window.location.origin;
  }

  async function handleGoogle() {
    sendGAEvent("event", "login_intento", { method: "google" });
    localStorage.setItem("rl_vincular_registro", registroId);
    localStorage.setItem("rl_redirect_after_login", window.location.href);
    window.location.href = "/api/auth/google/init";
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    localStorage.setItem("rl_vincular_registro", registroId);
    localStorage.setItem("rl_redirect_after_login", window.location.href);
    sendGAEvent("event", "login_intento", { method: "email" });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${callbackOrigin()}/auth/callback` },
    });
    setLoading(false);
    if (!error) {
      setUserEmail(email);
      sendGAEvent("event", "login_email_enviado");
      setPaso("magic");
    }
  }

  function handleSkip() {
    sendGAEvent("event", "login_skip");
    setPaso("skip");
    setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400); }, 100);
  }

  return (
    <AnimatePresence>
      {visible && paso !== "skip" && (
        <motion.div
          key="guardar-sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.38, ease: E }}
          className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-full sm:max-w-md"
        >
          {/* Sheet card */}
          <div
            className="rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{
              background: "#13093a",
              border: "1px solid rgba(133,104,243,0.32)",
              borderBottom: "none",
              boxShadow: "0 -8px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(133,104,243,0.10)",
            }}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            </div>

            <AnimatePresence mode="wait">

              {/* Paso: link enviado */}
              {paso === "magic" && (
                <motion.div
                  key="magic"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center gap-3 px-6 py-8"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(133,104,243,0.15)", border: "1px solid rgba(133,104,243,0.30)" }}>
                    <Mail size={20} style={{ color: "#8568f3" }} />
                  </div>
                  <p className="text-white font-semibold" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    Revisa tu correo
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.40)" }}>
                    Link enviado a <span style={{ color: "#e7e4fd" }}>{userEmail}</span>
                  </p>
                  <button onClick={handleSkip}
                    style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                    Cerrar
                  </button>
                </motion.div>
              )}

              {/* Paso: opciones */}
              {paso === "opciones" && (
                <motion.div key="opciones" initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="px-5 pb-6 pt-2">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="uppercase tracking-[0.2em] mb-1"
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "#8568f3" }}>
                        Guardar análisis
                      </p>
                      <p className="text-white font-semibold leading-snug"
                        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}>
                        Cada perfil guardado ayuda de manera anónima a miles de trabajadores a acceder a transparencia salarial para un mercado más justo
                      </p>
                    </div>
                    <button onClick={handleSkip}
                      className="mt-0.5 ml-3 shrink-0 text-white/25 hover:text-white/50 transition-colors">
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5">

                    {/* Google */}
                    <button
                      onClick={handleGoogle}
                      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
                      style={{ background: "#fff", color: "#1a1a1a", fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
                      </svg>
                      Continuar con Google
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
                      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.15em" }}>O</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
                    </div>

                    {/* Magic link */}
                    <form onSubmit={handleMagicLink} className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(133,104,243,0.20)", fontFamily: "var(--font-dm-sans)" }}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.50)")}
                        onBlur={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.20)")}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff" }}
                      >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                      </button>
                    </form>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.15em" }}>O</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                    </div>

                    {/* Skip — visible y claro */}
                    <button
                      onClick={handleSkip}
                      className="w-full flex items-center justify-center py-3 rounded-xl font-medium transition-all hover:bg-white/8 active:scale-[0.98]"
                      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.20)" }}
                    >
                      Continuar sin registrarme
                    </button>

                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.68rem", color: "rgba(255,255,255,0.20)", textAlign: "center" }}>
                      Tus datos son anónimos · gratis siempre
                    </p>
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
