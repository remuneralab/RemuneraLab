"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloudOff, Bookmark, Clock } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

const FONT = { fontFamily: "var(--font-dm-sans)" } as const;

// Opción de guardado (aún no disponible): por ahora solo mide interés.
export default function GuardarLiquidacion() {
  const [pedido, setPedido] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl px-4 py-3.5 sm:px-5 mb-6"
      style={{ background: "linear-gradient(135deg, rgba(247,201,72,0.14), rgba(247,201,72,0.05))", border: "1.5px solid rgba(247,201,72,0.50)" }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(247,201,72,0.20)" }}>
          <CloudOff size={17} style={{ color: "#F7C948" }} />
        </div>
        <p className="text-white font-semibold leading-snug" style={{ ...FONT, fontSize: "0.92rem" }}>
          Tu liquidación no se guarda automáticamente.
          <span className="block text-white/55 font-normal" style={{ fontSize: "0.8rem" }}>
            Guárdala para revisarla y compararla en futuras consultas.
          </span>
        </p>
      </div>
      <AnimatePresence mode="wait">
        {pedido ? (
          <motion.span key="pronto" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 shrink-0" style={{ ...FONT, fontSize: "0.85rem", color: "#F7C948" }}>
            <Clock size={14} /> Disponible muy pronto
          </motion.span>
        ) : (
          <motion.button key="boton" onClick={() => { setPedido(true); sendGAEvent("event", "liquidacion_guardar_interes"); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="shrink-0 inline-flex items-center justify-center gap-2 font-bold px-5 py-2.5 rounded-lg"
            style={{ ...FONT, fontSize: "0.88rem", color: "#1b1c1e", background: "#F7C948", boxShadow: "0 0 22px rgba(247,201,72,0.35)" }}>
            <Bookmark size={15} /> Guardar liquidación
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
