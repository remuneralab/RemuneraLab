"use client";

import { useState } from "react";
import { ShieldCheck, Bookmark, Clock } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

const FONT = { fontFamily: "var(--font-dm-sans)" } as const;

// Opción de guardado (aún no disponible): por ahora solo mide interés.
export default function GuardarLiquidacion() {
  const [pedido, setPedido] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-4 py-2.5 mb-6"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="inline-flex items-center gap-1.5 text-white/55" style={{ ...FONT, fontSize: "0.82rem" }}>
        <ShieldCheck size={14} style={{ color: "#06D6A0" }} /> Tu liquidación no se guarda.
      </span>
      {pedido ? (
        <span className="inline-flex items-center gap-1.5" style={{ ...FONT, fontSize: "0.82rem", color: "#a387f5" }}>
          <Clock size={13} /> Pronto podrás guardarla y comparar mes a mes.
        </span>
      ) : (
        <button onClick={() => { setPedido(true); sendGAEvent("event", "liquidacion_guardar_interes"); }}
          className="inline-flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
          style={{ ...FONT, fontSize: "0.82rem", color: "#a387f5" }}>
          <Bookmark size={13} /> Guardar para futuras consultas
        </button>
      )}
    </div>
  );
}
