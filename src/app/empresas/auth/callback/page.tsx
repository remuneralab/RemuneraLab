"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handle() {
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchErr) {
          setError("El enlace de verificación es inválido o ya expiró.");
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/empresas/registro");
        return;
      }

      const { data: empresa } = await supabase
        .from("empresas_b2b")
        .select("estado")
        .eq("user_id", user.id)
        .maybeSingle();

      if (empresa?.estado === "activo") {
        router.replace("/empresas/dashboard");
      } else {
        router.replace("/empresas/legal");
      }
    }

    handle();
  }, []);

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#0A0F1E" }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(255,77,90,0.1)", border: "1px solid rgba(255,77,90,0.2)" }}
          >
            <AlertCircle size={28} style={{ color: "#FF4D5A" }} />
          </div>
          <h2
            className="text-xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Enlace inválido
          </h2>
          <p
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}
          >
            {error}
          </p>
          <a
            href="/empresas/registro"
            className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
            style={{ background: "rgba(0,194,255,0.1)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.2)", fontFamily: "var(--font-dm-sans)" }}
          >
            Volver al registro
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0A0F1E" }}
    >
      <div className="text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: "#00C2FF" }} />
        <p
          style={{
            fontFamily:    "var(--font-space-mono)",
            fontSize:      "0.65rem",
            color:         "rgba(255,255,255,0.3)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Verificando acceso…
        </p>
      </div>
    </div>
  );
}
