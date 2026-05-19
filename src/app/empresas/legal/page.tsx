"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Shield, FileText, Lock, CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const E = [0.16, 1, 0.3, 1] as const;
const C = {
  abismo:   "#0A0F1E",
  nocturno: "#1C2438",
  electric: "#00C2FF",
  teal:     "#00E5C4",
  red:      "#FF4D5A",
};

const DOCS = [
  {
    key:   "terminos",
    icon:  FileText,
    title: "Términos y Condiciones de Uso",
    desc:  "Define el alcance del servicio, limitaciones de responsabilidad, propiedad intelectual y uso aceptable de la plataforma.",
    href:  "/legal/terminos",
    color: C.electric,
  },
  {
    key:   "nda",
    icon:  Lock,
    title: "Acuerdo Mutuo de Confidencialidad (NDA)",
    desc:  "RemuneraLab no divulga datos de tu empresa. Tu empresa no divulga metodología ni reportes propietarios de RemuneraLab.",
    href:  "/legal/nda",
    color: C.teal,
  },
  {
    key:   "privacidad",
    icon:  Shield,
    title: "Política de Privacidad y Tratamiento de Datos",
    desc:  "Conforme a Ley N° 19.628 vigente, con cumplimiento anticipado de Ley N° 21.719 (vigencia diciembre 2026).",
    href:  "/legal/privacidad",
    color: "#A78BFA",
  },
] as const;

export default function LegalPage() {
  const router = useRouter();
  const [userId,   setUserId]   = useState<string | null>(null);
  const [checked,  setChecked]  = useState({ terminos: false, nda: false, privacidad: false });
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/empresas/login");
        return;
      }
      // Ya aceptó legal → ir directo al dashboard
      const { data: empresa } = await supabase
        .from("empresas_b2b")
        .select("estado")
        .eq("user_id", user.id)
        .maybeSingle();
      if (empresa?.estado === "activo") {
        router.replace("/empresas/dashboard");
        return;
      }
      setUserId(user.id);
      setChecking(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allChecked = checked.terminos && checked.nda && checked.privacidad;

  async function handleAceptar() {
    if (!allChecked || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/b2b/legal-aceptar", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al registrar la aceptación.");
        return;
      }
      router.replace("/empresas/dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.abismo }}>
        <Loader2 size={28} className="animate-spin" style={{ color: C.electric }} />
      </div>
    );
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
          Paso 3 de 3 · Documentos legales
        </p>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="w-full max-w-lg"
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
              Acuerdos legales
            </p>
            <h1
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Revisa y acepta los documentos
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)" }}>
              Conforme a Ley N° 19.799, esta aceptación electrónica tiene validez jurídica plena.
              Cada documento tiene su propio checkbox.
            </p>
          </div>

          <div
            className="rounded-xl overflow-hidden mb-5"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {DOCS.map((doc, i) => {
              const isChecked = checked[doc.key as keyof typeof checked];
              return (
                <div
                  key={doc.key}
                  className={`p-6 ${i < DOCS.length - 1 ? "border-b" : ""}`}
                  style={{
                    background:   isChecked ? `${doc.color}07` : C.nocturno,
                    borderColor:  "rgba(255,255,255,0.07)",
                    transition:   "background 0.2s",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${doc.color}12`, border: `1px solid ${doc.color}25` }}
                    >
                      <doc.icon size={15} style={{ color: doc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <p
                          className="font-semibold text-white"
                          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}
                        >
                          {doc.title}
                        </p>
                        <a
                          href={doc.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily:    "var(--font-space-mono)",
                            fontSize:      "0.55rem",
                            color:         doc.color,
                            letterSpacing: "0.1em",
                            whiteSpace:    "nowrap",
                            flexShrink:    0,
                          }}
                          className="hover:underline mt-0.5"
                        >
                          VER DOCUMENTO ↗
                        </a>
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontSize:   "0.8rem",
                          color:      "rgba(255,255,255,0.4)",
                          lineHeight: "1.6",
                          marginBottom: "14px",
                        }}
                      >
                        {doc.desc}
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: isChecked ? doc.color : "rgba(255,255,255,0.06)",
                            border:     isChecked ? `1px solid ${doc.color}` : "1px solid rgba(255,255,255,0.15)",
                          }}
                          onClick={() =>
                            setChecked((c) => ({ ...c, [doc.key]: !c[doc.key as keyof typeof c] }))
                          }
                        >
                          {isChecked && <CheckCircle2 size={13} style={{ color: C.abismo }} />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={(e) =>
                            setChecked((c) => ({ ...c, [doc.key]: e.target.checked }))
                          }
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize:   "0.82rem",
                            color:      isChecked ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
                            transition: "color 0.2s",
                          }}
                        >
                          He leído y acepto {doc.title}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5"
              style={{ background: "rgba(255,77,90,0.08)", border: "1px solid rgba(255,77,90,0.2)" }}
            >
              <AlertCircle size={14} style={{ color: C.red, flexShrink: 0 }} />
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: C.red }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleAceptar}
            disabled={!allChecked || loading}
            className="w-full inline-flex items-center justify-center gap-2 font-semibold py-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: allChecked
                ? `linear-gradient(135deg, ${C.teal}, #2EC4B6)`
                : "rgba(255,255,255,0.06)",
              color:      allChecked ? C.abismo : "rgba(255,255,255,0.3)",
              fontFamily: "var(--font-dm-sans)",
              fontSize:   "0.95rem",
              boxShadow:  allChecked ? "0 0 28px rgba(0,229,196,0.18)" : "none",
              border:     allChecked ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ArrowRight size={16} />
            )}
            {loading ? "Activando demo…" : "Aceptar y acceder al dashboard"}
          </button>

          <p
            className="text-center mt-4"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize:   "0.68rem",
              color:      "rgba(255,255,255,0.2)",
              lineHeight: "1.6",
            }}
          >
            Tu aceptación queda registrada con timestamp UTC, IP y user agent
            conforme a Ley N° 19.799 art. 5.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
