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
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <div className="mt-6 bg-primary/5 border border-primary/20 rounded-2xl px-6 py-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-secondary" />
        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
          Análisis IA
        </span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-primary/10 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-primary/10 rounded-full w-4/5 animate-pulse" />
          <div className="h-3 bg-primary/10 rounded-full w-3/5 animate-pulse" />
        </div>
      ) : (
        <p className="text-sm text-on-surface leading-relaxed">{texto}</p>
      )}
    </div>
  );
}
