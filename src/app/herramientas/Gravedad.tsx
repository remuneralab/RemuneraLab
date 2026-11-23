"use client";

import { motion } from "motion/react";
import { MessageSquare, Landmark, Phone, ExternalLink, Lock, CheckCircle2, ShieldAlert } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import type { NivelCaso, ContextoCaso } from "@/lib/liquidacion";
import ContactoAbogado from "./ContactoAbogado";
import type { Analisis } from "./RevisionLiquidacion";

const FONT = { fontFamily: "var(--font-dm-sans)" } as const;
const MONO = { fontFamily: "var(--font-space-mono)" } as const;

export const NIVEL_INFO: Record<NivelCaso, { label: string; color: string; titulo: string; texto: string }> = {
  sin_problemas: { label: "Sin problemas", color: "#06D6A0", titulo: "Tu liquidación está en orden",
    texto: "No encontramos errores en los puntos revisados. Guarda tus liquidaciones como respaldo." },
  leve:          { label: "Leve", color: "#F7C948", titulo: "Hay puntos que conviene aclarar",
    texto: "No son errores confirmados. Lo más probable es que se resuelvan con una pregunta a tu empleador." },
  corregible:    { label: "Corregible", color: "#FF9F1C", titulo: "Hay errores que se pueden corregir conversando",
    texto: "La mayoría de los errores de liquidación se corrigen al avisar. El primer paso es pedir la corrección en tu lugar de trabajo." },
  grave:         { label: "Grave", color: "#E63946", titulo: "El problema se repite o tu empleador se negó a corregirlo",
    texto: "Un error reiterado o la negativa del empleador es una situación grave. Ya no basta con conversar: corresponde acudir a la Inspección del Trabajo o a un abogado laboral." },
};
const ORDEN: NivelCaso[] = ["sin_problemas", "leve", "corregible", "grave"];

// ── Nivel de gravedad + preguntas de contexto ─────────────────────────────
function Opcion({ activo, color, onClick, children }: { activo: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={activo}
      className="px-3.5 py-2 rounded-full transition-colors"
      style={{ ...FONT, fontSize: "0.82rem", color: activo ? "#fff" : "rgba(255,255,255,0.65)",
        background: activo ? color : "rgba(255,255,255,0.04)", border: `1px solid ${activo ? color : "rgba(255,255,255,0.15)"}` }}>
      {children}
    </button>
  );
}

export function NivelGravedad({ base, nivel, contexto, onContexto }: {
  base: NivelCaso; nivel: NivelCaso; contexto: ContextoCaso; onContexto: (c: ContextoCaso) => void;
}) {
  const info = NIVEL_INFO[nivel];
  const idx = ORDEN.indexOf(nivel);

  return (
    <div className="rounded-2xl p-5 sm:p-6 mb-8" style={{ border: `1.5px solid ${info.color}55`, background: `${info.color}10` }}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={16} style={{ color: info.color }} />
        <p className="uppercase tracking-[0.2em]" style={{ ...MONO, fontSize: "0.62rem", color: info.color }}>Nivel de gravedad</p>
      </div>

      {/* Medidor */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {ORDEN.map((n, i) => (
          <motion.div key={n} className="h-2.5 rounded-full"
            animate={{ background: i <= idx ? NIVEL_INFO[nivel].color : "rgba(255,255,255,0.10)", opacity: i === idx ? 1 : i < idx ? 0.55 : 1 }}
            transition={{ duration: 0.4 }} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {ORDEN.map((n) => (
          <p key={n} className="text-center" style={{ ...FONT, fontSize: "0.7rem", fontWeight: n === nivel ? 700 : 400,
            color: n === nivel ? NIVEL_INFO[n].color : "rgba(255,255,255,0.35)" }}>{NIVEL_INFO[n].label}</p>
        ))}
      </div>

      <p className="text-white font-bold mb-1" style={{ ...FONT, fontSize: "1.1rem" }}>{info.titulo}</p>
      <p className="text-white/60" style={{ ...FONT, fontSize: "0.88rem", lineHeight: "1.6" }}>{info.texto}</p>

      {/* Preguntas que el documento no puede responder */}
      {base !== "sin_problemas" && (
        <div className="mt-5 pt-5 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-white/50" style={{ ...FONT, fontSize: "0.8rem" }}>
            Para definir bien la gravedad, cuéntanos:
          </p>
          <div>
            <p className="text-white/85 mb-2" style={{ ...FONT, fontSize: "0.9rem" }}>¿Este error se ha repetido en meses anteriores?</p>
            <div className="flex flex-wrap gap-2">
              <Opcion activo={contexto.reiterado === true} color="#E63946"
                onClick={() => { sendGAEvent("event", "gravedad_reiterado", { valor: "si" }); onContexto({ ...contexto, reiterado: true }); }}>
                Sí, se repite</Opcion>
              <Opcion activo={contexto.reiterado === false} color="#8568f3"
                onClick={() => onContexto({ ...contexto, reiterado: false })}>No, es la primera vez</Opcion>
            </div>
          </div>
          <div>
            <p className="text-white/85 mb-2" style={{ ...FONT, fontSize: "0.9rem" }}>¿Pediste la corrección y tu empleador se negó?</p>
            <div className="flex flex-wrap gap-2">
              <Opcion activo={contexto.negativa === true} color="#E63946"
                onClick={() => { sendGAEvent("event", "gravedad_negativa", { valor: "si" }); onContexto({ ...contexto, negativa: true }); }}>
                Sí, se negó</Opcion>
              <Opcion activo={contexto.negativa === false} color="#8568f3"
                onClick={() => onContexto({ ...contexto, negativa: false })}>No / aún no lo pido</Opcion>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Línea de acción escalonada ────────────────────────────────────────────
const DT = {
  sitio:    "https://www.dt.gob.cl",
  denuncia: "https://www.dt.gob.cl/portal/1626/w3-article-126452.html",
  telefono: "600 450 4000",
  tel:      "tel:6004504000",
};

function Paso({ n, estado, titulo, icon: Icon, children }: {
  n: number; estado: "activo" | "hecho" | "bloqueado"; titulo: string; icon: typeof Landmark; children: React.ReactNode;
}) {
  const color = estado === "activo" ? "#a387f5" : estado === "hecho" ? "#06D6A0" : "rgba(255,255,255,0.30)";
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold"
          style={{ ...FONT, fontSize: "0.9rem", color: estado === "activo" ? "#fff" : color,
            background: estado === "activo" ? "linear-gradient(135deg, #8568f3, #a387f5)" : "transparent",
            border: estado === "activo" ? "none" : `1.5px solid ${color}`,
            boxShadow: estado === "activo" ? "0 0 18px rgba(133,104,243,0.5)" : "none" }}>
          {estado === "hecho" ? <CheckCircle2 size={17} /> : estado === "bloqueado" ? <Lock size={14} /> : n}
        </div>
      </div>
      <div className="min-w-0 pb-6 flex-1" style={{ opacity: estado === "bloqueado" ? 0.6 : 1 }}>
        <p className="font-semibold mb-1 flex items-center gap-2" style={{ ...FONT, fontSize: "1rem", color: estado === "bloqueado" ? "rgba(255,255,255,0.6)" : "#fff" }}>
          <Icon size={16} style={{ color }} /> {titulo}
        </p>
        {children}
      </div>
    </div>
  );
}

const TXT = { ...FONT, fontSize: "0.87rem", lineHeight: "1.6" } as const;

export function LineaAccion({ nivel, analisis }: { nivel: NivelCaso; analisis: Analisis }) {
  if (nivel === "sin_problemas") return null;
  const grave = nivel === "grave";

  return (
    <div className="rounded-2xl p-5 sm:p-6 mb-8" style={{ border: "1px solid rgba(133,104,243,0.25)", background: "rgba(255,255,255,0.02)" }}>
      <p className="uppercase tracking-[0.2em] mb-5" style={{ ...MONO, fontSize: "0.62rem", color: "#a387f5" }}>Línea de acción</p>

      <Paso n={1} estado={grave ? "hecho" : "activo"} icon={MessageSquare}
        titulo={grave ? "Pedir la corrección en tu lugar de trabajo no fue suficiente" : "Pide la corrección en tu lugar de trabajo"}>
        <p className="text-white/55" style={TXT}>
          {grave
            ? "El error se repite o tu empleador se negó a corregirlo. Guarda tus liquidaciones y cualquier correo o mensaje como respaldo."
            : nivel === "corregible"
              ? "Conversa con tu jefatura o RR.HH. y pide que corrijan los errores y te paguen la diferencia en la próxima liquidación. Déjalo por escrito: un correo basta."
              : "Pregunta a tu jefatura o RR.HH. por los puntos marcados. Si tienen una explicación, guarda la respuesta por escrito."}
        </p>
      </Paso>

      <Paso n={2} estado={grave ? "activo" : "bloqueado"} icon={Landmark}
        titulo="Acude a la Inspección del Trabajo o a un abogado laboral">
        {!grave ? (
          <p className="text-white/50" style={TXT}>
            Solo si el error se repite mes a mes o tu empleador se niega a corregirlo. Si eso pasa, vuelve a esta revisión
            y marca tu situación arriba.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-white/60" style={TXT}>
              Puedes pedir una fiscalización gratuita en la Inspección del Trabajo o, si prefieres asesoría directa, hablar con un abogado laboral.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <a href={DT.tel} onClick={() => sendGAEvent("event", "dt_llamar")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ ...FONT, fontSize: "0.85rem", color: "#e7e4fd", border: "1px solid rgba(46,196,182,0.45)" }}>
                <Phone size={14} style={{ color: "#2EC4B6" }} /> Inspección: {DT.telefono}
              </a>
              <a href={DT.denuncia} target="_blank" rel="noopener noreferrer" onClick={() => sendGAEvent("event", "dt_denuncia")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                style={{ ...FONT, fontSize: "0.85rem", color: "#e7e4fd", border: "1px solid rgba(46,196,182,0.45)" }}>
                Denuncia en línea (Mi DT) <ExternalLink size={13} />
              </a>
              <a href={DT.sitio} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-2.5 text-white/45 hover:text-white/75 transition-colors"
                style={{ ...FONT, fontSize: "0.82rem" }}>dt.gob.cl <ExternalLink size={12} /></a>
            </div>
            <ContactoAbogado analisis={analisis} />
          </div>
        )}
      </Paso>
    </div>
  );
}
