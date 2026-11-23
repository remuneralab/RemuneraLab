"use client";

import { useState } from "react";
import { Scale, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import type { Analisis } from "./RevisionLiquidacion";

const FONT = { fontFamily: "var(--font-dm-sans)" } as const;
const INPUT = "w-full rounded-lg px-4 py-3 text-white placeholder:text-white/25 outline-none focus:ring-2 focus:ring-[#8568f3]/60";
const INPUT_STYLE = { ...FONT, fontSize: "0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(133,104,243,0.25)" };

interface Props {
  analisis: Analisis | null;
  variante: "destacado" | "secundario";
}

export default function ContactoAbogado({ analisis, variante }: Props) {
  const destacado = variante === "destacado";
  const [abierto,  setAbierto]  = useState(false);
  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [telefono, setTelefono] = useState("");
  const [detalle,  setDetalle]  = useState("");
  const [adjuntar, setAdjuntar] = useState(true);
  const [estado,   setEstado]   = useState<"idle" | "enviando" | "ok" | "error">("idle");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    sendGAEvent("event", "abogado_solicitud");

    const hallazgos = adjuntar && analisis
      ? analisis.hallazgos.filter((h) => h.tipo !== "ok").map((h) => `- [${h.tipo}] ${h.titulo}: ${h.detalle}`).join("\n")
      : "";
    const mensaje = [
      "[ABOGADO LABORAL] Solicitud de primera consulta gratuita",
      `Nombre: ${nombre}`,
      telefono && `Teléfono: ${telefono}`,
      `Caso: ${detalle || "(sin detalle)"}`,
      hallazgos && `\nHallazgos de la revisión de liquidación:\n${hallazgos}`,
    ].filter(Boolean).join("\n");

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mensaje, url_origen: window.location.href }),
      });
      if (!res.ok) throw new Error();
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  // Versión discreta: solo un enlace que despliega el formulario
  if (!destacado && !abierto && estado !== "ok") {
    return (
      <button onClick={() => setAbierto(true)}
        className="self-start inline-flex items-center gap-2 px-1 py-1 text-white/55 hover:text-white/85 transition-colors"
        style={{ ...FONT, fontSize: "0.85rem" }}>
        <Scale size={14} style={{ color: "#a387f5" }} />
        ¿Prefieres hablar con un abogado laboral? Primera consulta gratis <ArrowRight size={14} />
      </button>
    );
  }

  return (
    <div className="rounded-xl p-6"
      style={{
        border: `1px solid ${destacado ? "rgba(133,104,243,0.55)" : "rgba(133,104,243,0.22)"}`,
        background: destacado ? "linear-gradient(135deg, rgba(133,104,243,0.16), rgba(133,104,243,0.05))" : "rgba(255,255,255,0.03)",
      }}>
      <div className="flex items-start gap-3 mb-4">
        <Scale size={20} className="mt-0.5 shrink-0" style={{ color: "#a387f5" }} />
        <div>
          <p className="text-white font-semibold mb-1" style={{ ...FONT, fontSize: "1.05rem" }}>
            {destacado ? "Te recomendamos hablar con un abogado laboral" : "Habla con un abogado laboral"}
          </p>
          <p className="text-white/50" style={{ ...FONT, fontSize: "0.875rem", lineHeight: "1.55" }}>
            {destacado
              ? "Los errores encontrados afectan tu sueldo o tus cotizaciones. Abogados laborales de nuestra red ofrecen la primera consulta gratis: déjanos tus datos y te contactarán."
              : "Abogados laborales de nuestra red ofrecen la primera consulta gratis. Déjanos tus datos y te contactarán."}
          </p>
        </div>
      </div>

      {estado === "ok" ? (
        <div className="flex items-center gap-2" style={{ ...FONT, fontSize: "0.9rem", color: "#06D6A0" }}>
          <CheckCircle2 size={18} /> Recibimos tu solicitud. Te contactaremos a {email}.
        </div>
      ) : !abierto ? (
        <button onClick={() => setAbierto(true)}
          className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          style={{ ...FONT, fontSize: "0.9rem", background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff" }}>
          Contactar a un abogado laboral <ArrowRight size={16} />
        </button>
      ) : (
        <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2">
          <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre"
            className={INPUT} style={INPUT_STYLE} />
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico"
            className={INPUT} style={INPUT_STYLE} />
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono (opcional)"
            className={`${INPUT} sm:col-span-2`} style={INPUT_STYLE} />
          <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} rows={3}
            placeholder="Cuéntanos brevemente tu caso (opcional)"
            className={`${INPUT} sm:col-span-2 resize-none`} style={INPUT_STYLE} />
          {analisis && (
            <label className="sm:col-span-2 flex items-start gap-2 text-white/55 cursor-pointer" style={{ ...FONT, fontSize: "0.82rem" }}>
              <input type="checkbox" checked={adjuntar} onChange={(e) => setAdjuntar(e.target.checked)} className="mt-0.5 accent-[#8568f3]" />
              Compartir con el abogado los hallazgos de mi revisión (no se envía el archivo)
            </label>
          )}
          <button type="submit" disabled={estado === "enviando"}
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ ...FONT, fontSize: "0.9rem", background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff" }}>
            {estado === "enviando" ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : "Solicitar primera consulta gratis"}
          </button>
          {estado === "error" && (
            <p className="sm:col-span-2" style={{ ...FONT, fontSize: "0.82rem", color: "#E63946" }}>
              No pudimos enviar tu solicitud. Intenta de nuevo.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
