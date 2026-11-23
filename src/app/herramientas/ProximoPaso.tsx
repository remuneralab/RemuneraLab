"use client";

import { Landmark, Phone, ExternalLink } from "lucide-react";
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

function TarjetaDT({ principal }: { principal: boolean }) {
  return (
    <div className="rounded-xl p-6"
      style={{
        border: `1px solid ${principal ? "rgba(46,196,182,0.45)" : "rgba(255,255,255,0.10)"}`,
        background: principal ? "rgba(46,196,182,0.07)" : "rgba(255,255,255,0.02)",
      }}>
      <div className="flex items-start gap-3">
        <Landmark size={20} className="mt-0.5 shrink-0" style={{ color: "#2EC4B6" }} />
        <div className="min-w-0">
          <p className="text-white font-semibold mb-1" style={{ ...FONT, fontSize: principal ? "1.05rem" : "0.95rem" }}>
            {principal ? "Consulta gratis en la Dirección del Trabajo" : "También puedes acudir a la Dirección del Trabajo"}
          </p>
          <p className="text-white/50 mb-4" style={{ ...FONT, fontSize: "0.85rem", lineHeight: "1.55" }}>
            Es el organismo público que fiscaliza el cumplimiento laboral. La orientación es gratuita y puedes
            pedir una fiscalización a tu empleador.
          </p>
          <div className="flex flex-wrap gap-2.5">
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
        </div>
      </div>
    </div>
  );
}

interface Props {
  nivel: NivelCaso;
  analisis: Analisis;
}

// Una sola recomendación principal según la gravedad del caso.
export default function ProximoPaso({ nivel, analisis }: Props) {
  if (nivel === "sin_problemas") return null;

  return (
    <div>
      <p className="uppercase tracking-[0.2em] mb-3"
        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#a387f5" }}>
        Próximo paso recomendado
      </p>
      {nivel === "grave" ? (
        <div className="flex flex-col gap-3">
          <ContactoAbogado analisis={analisis} variante="destacado" />
          <TarjetaDT principal={false} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <TarjetaDT principal />
          {nivel === "menor" && <ContactoAbogado analisis={analisis} variante="secundario" />}
        </div>
      )}
    </div>
  );
}
