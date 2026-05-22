"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GoogleSesion() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setup() {
      const res = await fetch("/api/auth/google/sesion");
      if (!res.ok) {
        setError("No se pudo completar el acceso. Intenta de nuevo.");
        return;
      }

      const { access_token, refresh_token } = await res.json();

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        setError("Error al iniciar sesión. Intenta de nuevo.");
        return;
      }

      localStorage.removeItem("rl_vincular_registro");
      const redirectTo = localStorage.getItem("rl_redirect_after_login") ?? "/";
      localStorage.removeItem("rl_redirect_after_login");
      router.replace(redirectTo);
    }

    setup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#180b3b" }}>
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(133,104,243,0.12)", border: "1px solid rgba(133,104,243,0.25)" }}
          >
            <AlertCircle size={28} style={{ color: "#8568f3" }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-dm-sans)" }}>
            No se pudo acceder
          </h2>
          <p className="mb-6" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)" }}>
            {error}
          </p>
          <a
            href="/perfil"
            className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
            style={{ background: "rgba(133,104,243,0.12)", color: "#8568f3", border: "1px solid rgba(133,104,243,0.25)", fontFamily: "var(--font-dm-sans)" }}
          >
            Volver e intentar de nuevo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#180b3b" }}>
      <div className="text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: "#8568f3" }} />
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Verificando acceso…
        </p>
      </div>
    </div>
  );
}
