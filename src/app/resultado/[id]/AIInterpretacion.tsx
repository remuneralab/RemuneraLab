"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  cargo: string;
  industria: string;
  anios_experiencia: number;
  region: string;
  salario_mid: number;
  percentil: number;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  n: number;
  confianza: string;
}

export default function AIInterpretacion(props: Props) {
  const [texto, setTexto]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    fetch("/api/interpretar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTexto(data.interpretacion ?? "");
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (error || !texto)) return null;

  return (
    <div className="mt-6 rounded-xl border border-[#00B4D8]/20 bg-[#00B4D8]/5 px-6 py-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-[#00B4D8]" />
        <span className="text-[#00B4D8] uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
          Análisis IA
        </span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-2.5 bg-white/8 rounded-full w-full animate-pulse" />
          <div className="h-2.5 bg-white/8 rounded-full w-4/5 animate-pulse" />
          <div className="h-2.5 bg-white/8 rounded-full w-3/5 animate-pulse" />
        </div>
      ) : (
        <p className="text-white/65 leading-relaxed"
          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
          {texto}
        </p>
      )}
    </div>
  );
}
