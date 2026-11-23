"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

const BOTON = {
  background: "linear-gradient(135deg, #8568f3, #a387f5)",
  color: "#ffffff",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "1rem",
  boxShadow: "0 0 36px rgba(133,104,243,0.40)",
} as const;

export default function PagoDemo({ activa }: { activa: boolean }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"idle" | "pagando" | "error">("idle");

  async function pagar() {
    setEstado("pagando");
    sendGAEvent("event", "suscripcion_pago_demo");
    try {
      // Simula el tiempo de una pasarela de pago
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch("/api/suscripcion/demo", { method: "POST" });
      if (!res.ok) throw new Error();
      router.push("/herramientas");
    } catch {
      setEstado("error");
    }
  }

  if (activa) {
    return (
      <a href="/herramientas"
        className="flex w-full items-center justify-center gap-2 font-semibold px-6 py-4 rounded-lg hover:opacity-90 transition-opacity"
        style={BOTON}>
        Ya estás suscrito · Ir a mis herramientas <ArrowRight size={16} />
      </a>
    );
  }

  return (
    <>
      <button onClick={pagar} disabled={estado === "pagando"}
        className="flex w-full items-center justify-center gap-2 font-semibold px-6 py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70"
        style={BOTON}>
        {estado === "pagando"
          ? <><Loader2 size={18} className="animate-spin" /> Procesando pago…</>
          : <><Lock size={16} /> Pagar $1.000 y suscribirme</>}
      </button>
      {estado === "error" && (
        <p className="mt-3 text-center" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "#E63946" }}>
          No pudimos activar tu suscripción. Intenta de nuevo.
        </p>
      )}
      <p className="mt-4 text-center text-white/35" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", lineHeight: "1.5" }}>
        Versión de prueba: no se realiza ningún cobro. El botón activa el acceso por 30 días.
      </p>
    </>
  );
}
