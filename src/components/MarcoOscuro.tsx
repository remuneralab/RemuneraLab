import Link from "next/link";

// Marco visual compartido (fondo violeta, navbar y footer) de las páginas B2C oscuras.
export default function MarcoOscuro({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#180b3b" }}>
      <div className="pointer-events-none absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.18) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.11) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(133,104,243,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      <header className="relative z-50" style={{ borderBottom: "1px solid rgba(133,104,243,0.12)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo-white.png" alt="RemuneraLab"
              style={{ height: "32px", width: "auto", filter: "drop-shadow(0 0 10px rgba(133,104,243,0.30))" }} />
          </Link>
          <Link href="/formulario"
            className="inline-flex items-center gap-1.5 font-semibold px-4 py-1.5 rounded transition-colors hover:bg-[#8568f3]/10"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", border: "1px solid rgba(133,104,243,0.40)", color: "#8568f3" }}>
            Consultar sueldo
          </Link>
        </div>
      </header>

      <main className="relative flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {children}
      </main>

      <footer className="relative py-8 px-6 mt-8" style={{ borderTop: "1px solid rgba(133,104,243,0.12)" }}>
        <p className="text-white/25 text-center"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.15em" }}>
          REMUNERALAB — TUS DATOS SON ANÓNIMOS Y NUNCA SE VENDERÁN
        </p>
      </footer>
    </div>
  );
}
