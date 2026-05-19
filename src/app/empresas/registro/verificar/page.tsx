import { Mail } from "lucide-react";

export default function VerificarPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 60% 0%, rgba(0,194,255,0.07) 0%, transparent 55%), #0A0F1E",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header
        className="relative z-10 flex justify-between items-center px-6 h-16 border-b border-white/6"
        style={{ background: "rgba(10,15,30,0.9)", backdropFilter: "blur(12px)" }}
      >
        <a
          href="/empresas"
          className="hover:text-[#00C2FF] transition-colors text-white"
          style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.3rem", fontStyle: "italic" }}
        >
          RemuneraLab
        </a>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.2)" }}
          >
            <Mail size={36} style={{ color: "#00C2FF" }} />
          </div>

          <p
            style={{
              fontFamily:    "var(--font-space-mono)",
              fontSize:      "0.6rem",
              color:         "#00C2FF",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom:  "12px",
            }}
          >
            Paso 2 de 3 · Verificación
          </p>

          <h1
            className="text-3xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Revisa tu email
          </h1>

          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize:   "0.95rem",
              color:      "rgba(255,255,255,0.45)",
              lineHeight: "1.7",
              marginBottom: "32px",
            }}
          >
            Te enviamos un enlace de confirmación a tu email corporativo.
            Haz click en el enlace para continuar con el proceso de registro.
          </p>

          <div
            className="rounded-xl p-5 text-left mb-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              "El enlace expira en 24 horas",
              "Revisa también tu carpeta de spam",
              "Solo acepta correos de noreply@mail.app.supabase.io",
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#00C2FF" }} />
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>

          <a
            href="/empresas/registro"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize:   "0.82rem",
              color:      "rgba(255,255,255,0.3)",
            }}
            className="hover:text-white/60 transition-colors"
          >
            ← Volver al registro
          </a>
        </div>
      </main>
    </div>
  );
}
