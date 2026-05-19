"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const E = [0.16, 1, 0.3, 1] as const;
const C = {
  abismo:   "#0A0F1E",
  nocturno: "#1C2438",
  electric: "#00C2FF",
  teal:     "#00E5C4",
  red:      "#FF4D5A",
};

const INPUT =
  "w-full px-4 py-3.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:outline-none focus:border-[#00C2FF] focus:bg-white/8 transition-all text-sm";
const LABEL = "block mb-2 text-white/40 uppercase tracking-[0.18em]";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        setError("Email o contraseña incorrectos.");
        return;
      }

      // Verificar estado de la empresa
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Error de autenticación."); return; }

      const { data: empresa } = await supabase
        .from("empresas_b2b")
        .select("estado")
        .eq("user_id", user.id)
        .maybeSingle();

      if (empresa?.estado === "activo") {
        window.location.href = "/empresas/dashboard";
      } else {
        window.location.href = "/empresas/legal";
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.abismo }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header
        className="relative z-10 flex justify-between items-center px-6 h-16 border-b border-white/6"
        style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(12px)" }}
      >
        <a
          href="/empresas"
          className="hover:text-[#00C2FF] transition-colors text-white"
          style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.3rem", fontStyle: "italic" }}
        >
          RemuneraLab
        </a>
        <p
          style={{
            fontFamily:    "var(--font-space-mono)",
            fontSize:      "0.58rem",
            color:         "rgba(255,255,255,0.3)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Enterprise · Acceso
        </p>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <p
              style={{
                fontFamily:    "var(--font-space-mono)",
                fontSize:      "0.6rem",
                color:         C.electric,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom:  "12px",
              }}
            >
              Enterprise
            </p>
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Iniciar sesión
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-8 flex flex-col gap-5"
            style={{ background: C.nocturno, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div>
              <label className={LABEL} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}>
                Email corporativo
              </label>
              <input
                type="email"
                required
                placeholder="tu@empresa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ background: "rgba(255,77,90,0.08)", border: "1px solid rgba(255,77,90,0.2)" }}
              >
                <AlertCircle size={14} style={{ color: C.red, flexShrink: 0 }} />
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: C.red }}>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${C.teal}, #2EC4B6)`,
                color:      C.abismo,
                fontFamily: "var(--font-dm-sans)",
                fontSize:   "0.95rem",
                boxShadow:  "0 0 28px rgba(0,229,196,0.18)",
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p
            className="text-center mt-6"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}
          >
            ¿No tienes cuenta?{" "}
            <a href="/empresas/registro" style={{ color: C.electric }} className="hover:underline">
              Solicitar demo gratuita
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
