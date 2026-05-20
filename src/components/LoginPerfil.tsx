"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, Mail, CheckCircle, ShieldCheck } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { supabase } from "@/lib/supabase";

const E = [0.16, 1, 0.3, 1] as const;

interface Props {
  registroId: string;
}

type Estado = "cargando" | "loggedIn" | "loggedOut";

export default function LoginPerfil({ registroId }: Props) {
  const [estado, setEstado]         = useState<Estado>("cargando");
  const [email, setEmail]           = useState("");
  const [magicSent, setMagicSent]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [vinculado, setVinculado]   = useState(false);
  const [userEmail, setUserEmail]   = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEstado("loggedIn");
        setUserEmail(session.user.email ?? null);
      } else {
        setEstado("loggedOut");
      }
    });
  }, []);

  function callbackOrigin() {
    if (typeof window === "undefined") return "";
    return window.location.hostname === "localhost"
      ? "https://remuneralab.vercel.app"
      : window.location.origin;
  }

  async function handleGoogle() {
    sendGAEvent("event", "login_intento", { method: "google" });
    localStorage.setItem("rl_vincular_registro", registroId);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${callbackOrigin()}/auth/callback` },
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    localStorage.setItem("rl_vincular_registro", registroId);
    sendGAEvent("event", "login_intento", { method: "email" });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${callbackOrigin()}/auth/callback` },
    });
    setLoading(false);
    if (!error) {
      sendGAEvent("event", "login_email_enviado");
      setMagicSent(true);
    }
  }

  async function handleVincular() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    await fetch("/api/perfil/vincular", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ registroId }),
    });
    sendGAEvent("event", "analisis_guardado");
    setVinculado(true);
    setLoading(false);
  }

  if (estado === "cargando") return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: E }}
      className="mt-8 rounded-xl p-8"
      style={{ border: "1px solid rgba(133,104,243,0.20)", background: "rgba(133,104,243,0.06)" }}
    >
      {/* Estado: ya logueado */}
      {estado === "loggedIn" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#8568f3" }}>
              Perfil de carrera
            </p>
            <h3 className="text-white font-semibold text-xl mb-1" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {vinculado ? "Análisis guardado en tu perfil" : "Guarda este análisis en tu perfil"}
            </h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.40)" }}>
              {vinculado
                ? `Visible en tu perfil · ${userEmail}`
                : "Podrás comparar tu evolución salarial en el tiempo"}
            </p>
          </div>
          {vinculado ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-lg" style={{ background: "rgba(133,104,243,0.15)", border: "1px solid rgba(133,104,243,0.30)" }}>
              <CheckCircle size={16} style={{ color: "#8568f3" }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "#e7e4fd" }}>Guardado</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleVincular}
                disabled={loading}
                className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff", fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", boxShadow: "0 0 24px rgba(133,104,243,0.35)" }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                Guardar en mi perfil
              </button>
              <a href="/perfil" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "rgba(133,104,243,0.65)", letterSpacing: "0.12em" }}
                className="uppercase hover:text-[#8568f3] transition-colors">
                Ver perfil →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Estado: no logueado */}
      {estado === "loggedOut" && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <p className="uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#8568f3" }}>
              Perfil de carrera
            </p>
            <h3 className="text-white font-semibold text-xl mb-3" style={{ fontFamily: "var(--font-dm-sans)" }}>
              Haz seguimiento de tu carrera y accede a información personalizada
            </h3>
            <ul className="space-y-2 mb-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>
              <li>· Historial de tus análisis a lo largo del tiempo</li>
              <li>· Alertas cuando el mercado de tu cargo cambie</li>
              <li>· Acceso a datos personalizados según tu perfil</li>
            </ul>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} style={{ color: "rgba(133,104,243,0.60)", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                  Todo esto es <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>gratis</span>, siempre. Las consultas salariales también.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} style={{ color: "rgba(133,104,243,0.60)", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                  Sin suscripciones — ni ahora, ni nunca.
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-sm">
            <AnimatePresence mode="wait">
              {magicSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center gap-3 py-4"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(133,104,243,0.15)", border: "1px solid rgba(133,104,243,0.30)" }}>
                    <Mail size={20} style={{ color: "#8568f3" }} />
                  </div>
                  <p className="text-white font-semibold" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    Revisa tu correo
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.40)" }}>
                    Enviamos un link a <span style={{ color: "#e7e4fd" }}>{email}</span>. Haz click en él para acceder a tu perfil.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                  {/* Google */}
                  <button
                    onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
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
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>O</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
                  </div>

                  {/* Magic link */}
                  <form onSubmit={handleMagicLink} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(133,104,243,0.20)", fontFamily: "var(--font-dm-sans)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.50)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.20)")}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff", fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem" }}
                    >
                      {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                    </button>
                  </form>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
                    Te enviamos un link · sin contraseña · siempre gratis
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.section>
  );
}
