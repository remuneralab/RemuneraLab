"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
      style={{
        background: "rgba(0,229,196,0.12)",
        border: "1px solid rgba(0,229,196,0.3)",
        color: "#00E5C4",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      Imprimir / Guardar PDF
    </button>
  );
}
