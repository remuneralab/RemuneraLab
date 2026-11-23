"use client";

import { Landmark, Phone, ExternalLink, MessageSquare } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import type { NivelCaso } from "@/lib/liquidacion";
import ContactoAbogado from "./ContactoAbogado";
import type { Analisis } from "./RevisionLiquidacion";

const FONT = { fontFamily: "var(--font-dm-sans)" } as const;

// Canales oficiales de la Dirección del Trabajo (verificados en dt.gob.cl)
const DT = {
  sitio:    "https://www.dt.gob.cl",
  denuncia: "https://www.dt.gob.cl/portal/1626/w3-article-126452.html",
  telefono: "600 450 4000",
  tel:      "tel:6004504000",
};

function Paso({ n, icon: Icon, color, titulo, children }: {
  n: number; icon: typeof Landmark; color: string; titulo: string; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl p-5" style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
        style={{ ...FONT, fontSize: "0.85rem", color, border: `1.5px solid ${color}` }}>{n}</div>
      <div className="min-w-0">
        <p className="text-white font-semibold mb-1 flex items-center gap-2" style={{ ...FONT, fontSize: "0.98rem" }}>
          <Icon size={16} style={{ color }} /> {titulo}
        </p>
        {children}
      </div>
    </div>
  );
}

function BotonesDT() {
  return (
    <div className="flex flex-wrap gap-2.5 mt-3">
      <a href={DT.tel} onClick={() => sendGAEvent("event", "dt_llamar")}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
        style={{ ...FONT, fontSize: "0.85rem", color: "#e7e4fd", border: "1px solid rgba(46,196,182,0.40)" }}>
        <Phone size={14} style={{ color: "#2EC4B6" }} /> {DT.telefono}
      </a>
      <a href={DT.denuncia} target="_blank" rel="noopener noreferrer" onClick={() => sendGAEvent("event", "dt_denuncia")}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
        style={{ ...FONT, fontSize: "0.85rem", color: "#e7e4fd", border: "1px solid rgba(46,196,182,0.40)" }}>
        Denuncia en línea (Mi DT) <ExternalLink size={13} />
      </a>
      <a href={DT.sitio} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2 py-2.5 text-white/45 hover:text-white/75 transition-colors"
        style={{ ...FONT, fontSize: "0.82rem" }}>
        dt.gob.cl <ExternalLink size={12} />
      </a>
    </div>
  );
}

const TEXTO = { ...FONT, fontSize: "0.86rem", lineHeight: "1.55" } as const;

interface Props {
  nivel: NivelCaso;
  analisis: Analisis;
}

// Ruta escalonada: los casos corregibles se resuelven primero con el empleador;
// el abogado solo se recomienda cuando el caso es grave.
export default function ProximoPaso({ nivel, analisis }: Props) {
  if (nivel === "sin_problemas") return null;

  return (
    <div>
      <p className="uppercase tracking-[0.2em] mb-3"
        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#a387f5" }}>
        {nivel === "grave" ? "Te recomendamos actuar" : "Qué hacer ahora"}
      </p>

      {nivel === "grave" ? (
        <div className="flex flex-col gap-3">
          <ContactoAbogado analisis={analisis} />
          <Paso n={2} icon={Landmark} color="#2EC4B6" titulo="También puedes acudir a la Inspección del Trabajo">
            <p className="text-white/50" style={TEXTO}>
              La orientación es gratuita y puedes pedir que fiscalicen a tu empleador.
            </p>
            <BotonesDT />
          </Paso>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Paso n={1} icon={MessageSquare} color="#a387f5" titulo="Conversa con tu jefatura o con RR.HH.">
            <p className="text-white/50" style={TEXTO}>
              {nivel === "menor"
                ? "Muchos errores de liquidación se corrigen solo con avisar. Pide una aclaración y, si corresponde, que te paguen la diferencia en la próxima liquidación. Déjalo por escrito (un correo basta)."
                : "Pregunta por los puntos marcados para revisar. Lo más probable es que tengan una explicación sencilla; si es así, guarda la respuesta por escrito."}
            </p>
          </Paso>
          <Paso n={2} icon={Landmark} color="#2EC4B6" titulo="Si no se corrige, consulta en la Inspección del Trabajo">
            <p className="text-white/50" style={TEXTO}>
              La orientación es gratuita. Si el problema sigue, puedes pedir una fiscalización a tu empleador.
            </p>
            <BotonesDT />
          </Paso>
        </div>
      )}
    </div>
  );
}
