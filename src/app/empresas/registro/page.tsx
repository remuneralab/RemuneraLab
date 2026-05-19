"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isPublicDomain, SECTORES, TAMANOS } from "@/lib/b2b-auth";

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

export default function RegistroPage() {
  const [form, setForm] = useState({
    email: "", password: "", nombre: "", cargo: "",
    razon_social: "", rut_empresa: "", tamano: "", sector: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // TODO: restaurar validación de dominio corporativo antes de producción
    // if (isPublicDomain(form.email)) {
    //   setError("Ingresa un email corporativo (no Gmail, Hotmail, Yahoo, etc.)");
    //   return;
    // }
    if (form.password.length < 12) {
      setError("La contraseña debe tener al menos 12 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/empresas/auth/callback`,
          data: { nombre: form.nombre },
        },
      });

      if (authErr) {
        setError(
          authErr.message === "User already registered"
            ? "Ya existe una cuenta con este email. Intenta iniciar sesión."
            : authErr.message,
        );
        return;
      }

      if (!authData.user) {
        setError("Error al crear la cuenta. Inténtalo de nuevo.");
        return;
      }

      // Email ya registrado sin confirmar (identities vacío)
      if ((authData.user.identities ?? []).length === 0) {
        setError("Ya existe una cuenta con este email. Revisa tu bandeja o inicia sesión.");
        return;
      }

      const res = await fetch("/api/b2b/registro", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          user_id:         authData.user.id,
          email:           form.email,
          nombre_contacto: form.nombre,
          cargo_contacto:  form.cargo,
          razon_social:    form.razon_social,
          rut_empresa:     form.rut_empresa,
          tamano_empresa:  form.tamano,
          sector:          form.sector,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar los datos de la empresa.");
        return;
      }

      window.location.href = "/empresas/registro/verificar";
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
      <div
        className="pointer-events-none fixed -top-40 right-0 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,194,255,0.06) 0%, transparent 65%)" }}
      />

      <header
        className="relative z-10 flex justify-between items-center px-6 h-16 border-b border-white/6"
        style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(12px)" }}
      >
        <a
          href="/empresas"
          className="font-serif-display italic text-white hover:text-[#00C2FF] transition-colors"
          style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.3rem" }}
        >
          RemuneraLab
        </a>
        <p
          style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "0.58rem",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Enterprise · Registro
        </p>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="w-full max-w-xl"
        >
          <div className="mb-8">
            <p
              style={{
                fontFamily: "var(--font-space-mono)",
                fontSize: "0.6rem",
                color: C.electric,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Demo gratuita · 2 meses
            </p>
            <h1
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Crea tu cuenta Enterprise
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)" }}>
              Sin compromiso · Sin tarjeta de crédito · Acceso en 24h
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-8 flex flex-col gap-5"
            style={{ background: C.nocturno, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Email + contraseña */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Email corporativo
                </label>
                <input
                  type="email"
                  required
                  placeholder="tu@empresa.cl"
                  value={form.email}
                  onChange={upd("email")}
                  className={INPUT}
                />
              </div>
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Mínimo 12 caracteres"
                    value={form.password}
                    onChange={upd("password")}
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
            </div>

            {/* Nombre + cargo */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={upd("nombre")}
                  className={INPUT}
                />
              </div>
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Cargo
                </label>
                <input
                  type="text"
                  required
                  placeholder="CHRO, CFO, Gerente RRHH…"
                  value={form.cargo}
                  onChange={upd("cargo")}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Razón social + RUT */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Razón social
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre legal de la empresa"
                  value={form.razon_social}
                  onChange={upd("razon_social")}
                  className={INPUT}
                />
              </div>
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  RUT empresa{" "}
                  <span style={{ color: "rgba(255,255,255,0.2)", textTransform: "none", letterSpacing: 0 }}>
                    (opcional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="76.xxx.xxx-x"
                  value={form.rut_empresa}
                  onChange={upd("rut_empresa")}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Tamaño + Sector */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Tamaño empresa
                </label>
                <select
                  required
                  value={form.tamano}
                  onChange={upd("tamano")}
                  className={INPUT}
                  style={{ appearance: "none" }}
                >
                  <option value="" style={{ background: C.nocturno }}>
                    Seleccionar…
                  </option>
                  {TAMANOS.map((t) => (
                    <option key={t} value={t} style={{ background: C.nocturno }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={LABEL}
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}
                >
                  Sector económico
                </label>
                <select
                  required
                  value={form.sector}
                  onChange={upd("sector")}
                  className={INPUT}
                  style={{ appearance: "none" }}
                >
                  <option value="" style={{ background: C.nocturno }}>
                    Seleccionar…
                  </option>
                  {SECTORES.map((s) => (
                    <option key={s} value={s} style={{ background: C.nocturno }}>
                      {s}
                    </option>
                  ))}
                </select>
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
                background:    `linear-gradient(135deg, ${C.teal}, #2EC4B6)`,
                color:         C.abismo,
                fontFamily:    "var(--font-dm-sans)",
                fontSize:      "0.95rem",
                boxShadow:     "0 0 28px rgba(0,229,196,0.18)",
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? "Creando cuenta…" : "Crear cuenta Enterprise"}
            </button>

            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize:   "0.72rem",
                color:      "rgba(255,255,255,0.2)",
                textAlign:  "center",
                lineHeight: "1.6",
              }}
            >
              Al continuar aceptarás Términos, NDA y Política de Privacidad en el siguiente paso.
            </p>
          </form>

          <p
            className="text-center mt-6"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)" }}
          >
            ¿Ya tienes cuenta?{" "}
            <a href="/empresas/login" style={{ color: C.electric }} className="hover:underline">
              Iniciar sesión
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
