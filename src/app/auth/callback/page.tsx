"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If OAuth returned an error (e.g. user cancelled), show it immediately
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const msg = searchParams.get("msg");
      setError(`Error: ${oauthError}${msg ? ` — ${msg}` : ""}`);
      return;
    }

    let redirected = false;

    function redirect(session: Session | null) {
      if (redirected || !session) return;
      redirected = true;
      const vincular = localStorage.getItem("rl_vincular_registro");
      if (vincular) {
        localStorage.removeItem("rl_vincular_registro");
        router.replace(`/perfil?vincular=${vincular}`);
      } else {
        router.replace("/perfil");
      }
    }

    // Supabase automatically exchanges ?code= via detectSessionInUrl.
    // We just wait for onAuthStateChange to fire — no manual exchangeCodeForSession.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        redirect(session);
      }
    });

    // Also check immediately in case the session was set before the listener registered
    supabase.auth.getSession().then(({ data: { session } }) => {
      redirect(session);
    });

    // Timeout: if nothing happens in 12s, show error
    const timeout = setTimeout(() => {
      if (!redirected) setError("Tiempo de espera agotado. Intenta de nuevo.");
    }, 12000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#180b3b" }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(133,104,243,0.12)", border: "1px solid rgba(133,104,243,0.25)" }}>
            <AlertCircle size={28} style={{ color: "#8568f3" }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-dm-sans)" }}>
            No se pudo acceder
          </h2>
          <p className="mb-6" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.4)" }}>
            {error}
          </p>
          <a href="/perfil"
            className="inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
            style={{ background: "rgba(133,104,243,0.12)", color: "#8568f3", border: "1px solid rgba(133,104,243,0.25)", fontFamily: "var(--font-dm-sans)" }}>
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#180b3b" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#8568f3" }} />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
