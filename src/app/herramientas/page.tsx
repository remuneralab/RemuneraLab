import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MarcoOscuro from "@/components/MarcoOscuro";
import { COOKIE_SUSCRIPCION, tieneSuscripcion } from "@/lib/suscripcion";
import RevisionLiquidacion from "./RevisionLiquidacion";

export const metadata: Metadata = {
  title: "Mis herramientas · RemuneraLab",
  robots: { index: false },
};

export default async function HerramientasPage() {
  if (!tieneSuscripcion((await cookies()).get(COOKIE_SUSCRIPCION)?.value)) {
    redirect("/suscripcion");
  }

  return (
    <MarcoOscuro>
      <p className="uppercase tracking-[0.2em] mb-2"
        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "#a387f5" }}>
        Suscripción activa · Plan Trabajador
      </p>
      <h1 className="text-white font-bold mb-2"
        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)" }}>
        Revisa tu liquidación de sueldo
      </h1>
      <p className="text-white/50 mb-8 max-w-2xl"
        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", lineHeight: "1.6" }}>
        Sube tu liquidación en PDF o una foto. La IA revisa los cálculos, los descuentos legales y la gratificación,
        te explica lo que encuentre y, si hace falta, te conecta con un abogado laboral.
      </p>

      <RevisionLiquidacion />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { t: "Asesoría laboral con IA", d: "Chat para resolver dudas sobre tus derechos laborales." },
          { t: "Revisión de anexos y contratos", d: "Detecta cláusulas problemáticas antes de firmar." },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-xl p-5"
            style={{ border: "1px dashed rgba(133,104,243,0.28)", background: "rgba(255,255,255,0.02)" }}>
            <p className="uppercase tracking-[0.18em] mb-1.5"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(163,135,245,0.8)" }}>
              Próximamente
            </p>
            <p className="text-white/80 font-semibold mb-1" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}>{t}</p>
            <p className="text-white/40" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem" }}>{d}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-white/30 max-w-2xl"
        style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", lineHeight: "1.6" }}>
        El análisis es orientativo, lo genera una IA y puede contener errores. No reemplaza la asesoría de un abogado
        ni de la Dirección del Trabajo. Tu archivo no se guarda: se analiza y se descarta.
      </p>
    </MarcoOscuro>
  );
}
