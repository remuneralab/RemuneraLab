import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bot, FileSearch, Scale, Check } from "lucide-react";
import MarcoOscuro from "@/components/MarcoOscuro";
import { COOKIE_SUSCRIPCION, tieneSuscripcion } from "@/lib/suscripcion";
import PagoDemo from "./PagoDemo";

export const metadata: Metadata = {
  title: "Suscripción · RemuneraLab",
  description: "Por $1.000 al mes accede a asesoría laboral con IA, revisión de liquidaciones y contacto con abogados laborales.",
};

const HERRAMIENTAS = [
  { icon: Bot,        titulo: "Asesoría laboral con IA",        texto: "Resuelve dudas sobre tus derechos laborales en lenguaje simple." },
  { icon: FileSearch, titulo: "Revisión de documentos",          texto: "Sube tu liquidación de sueldo y detecta errores en descuentos, gratificación y cálculos. Pronto: anexos y contratos." },
  { icon: Scale,      titulo: "Abogados laborales",              texto: "Si encontramos algo serio, te conectamos con abogados que ofrecen la primera consulta gratis." },
];

const INCLUYE = [
  "Revisión de liquidaciones con IA",
  "Asesoría laboral breve en cada análisis",
  "Contacto con abogado laboral",
  "Apoyas la transparencia salarial en Chile",
];

export default async function SuscripcionPage() {
  const activa = tieneSuscripcion((await cookies()).get(COOKIE_SUSCRIPCION)?.value);

  return (
    <MarcoOscuro>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="uppercase tracking-[0.2em] mb-3"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "#a387f5" }}>
          RemuneraLab · Suscripción
        </p>
        <h1 className="text-white font-bold leading-tight mb-4"
          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}>
          Construyamos juntos la transparencia salarial que Chile necesita
        </h1>
        <p className="text-white/50" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", lineHeight: "1.6" }}>
          Tu aporte mensual sostiene una infraestructura abierta de datos salariales y te da herramientas
          para revisar que te estén pagando bien.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        {HERRAMIENTAS.map(({ icon: Icon, titulo, texto }) => (
          <div key={titulo} className="rounded-xl p-5"
            style={{ border: "1px solid rgba(133,104,243,0.20)", background: "rgba(255,255,255,0.03)" }}>
            <Icon size={20} className="mb-3" style={{ color: "#8568f3" }} />
            <p className="text-white font-semibold mb-1.5" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}>{titulo}</p>
            <p className="text-white/45" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", lineHeight: "1.55" }}>{texto}</p>
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto rounded-2xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, rgba(133,104,243,0.18), rgba(133,104,243,0.05))",
          border: "1px solid rgba(133,104,243,0.35)",
          boxShadow: "0 0 60px rgba(133,104,243,0.15)",
        }}>
        <p className="text-white/60 mb-1" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem" }}>Plan Trabajador</p>
        <p className="text-white font-bold mb-5" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "2.4rem", lineHeight: 1 }}>
          $1.000 <span className="text-white/40 font-normal" style={{ fontSize: "1rem" }}>/ mes</span>
        </p>
        <ul className="flex flex-col gap-2.5 mb-7">
          {INCLUYE.map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#06D6A0" }} />
              <span className="text-white/75" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>{t}</span>
            </li>
          ))}
        </ul>
        <PagoDemo activa={activa} />
      </div>
    </MarcoOscuro>
  );
}
