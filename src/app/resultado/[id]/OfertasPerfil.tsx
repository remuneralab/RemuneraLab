"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ExternalLink, MapPin, BriefcaseBusiness } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

function resolverFecha(texto: string | null, createdAt: string): Date {
  if (texto) {
    const m = texto.match(/(\d+)\s+de\s+(\w+)/i);
    if (m) {
      const mes = MESES[m[2].toLowerCase()];
      if (mes !== undefined) {
        const ref  = new Date(createdAt);
        const date = new Date(ref.getFullYear(), mes, parseInt(m[1]));
        if (date > ref) date.setFullYear(ref.getFullYear() - 1);
        return date;
      }
    }
  }
  return new Date(createdAt);
}

function fmtFecha(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7)  return `Hace ${diff} días`;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

function fmtCLP(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}k`;
}

type Oferta = {
  id: string;
  cargo_original: string;
  industria: string | null;
  region: string | null;
  salario_mid: number | null;
  url_aviso: string | null;
  modalidad: string | null;
  fecha_publicacion_texto: string | null;
  created_at: string;
};

interface Props {
  cargo: string;
  industria: string;
  region: string;
}

const PREVIEW = 3;

export default function OfertasPerfil({ cargo, industria, region }: Props) {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [total, setTotal]     = useState<number | null>(null);
  const [abierto, setAbierto] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ cargo, industria, region });
    fetch(`/api/ofertas-perfil?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setOfertas(d.ofertas ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => setTotal(0))
      .finally(() => setLoading(false));
  }, [cargo, industria, region]);

  // No mostrar nada hasta saber si hay resultados
  if (!loading && total === 0) return null;

  const labelBtn = loading
    ? "Buscando ofertas..."
    : `Ver ${total} oferta${total === 1 ? "" : "s"} de ${cargo} en ${region}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: E }}
      className="mt-6 rounded-xl border border-white/10 bg-white/3 overflow-hidden"
    >
      {/* Cabecera / botón */}
      <button
        onClick={() => !loading && setAbierto((v) => !v)}
        disabled={loading}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/4 transition-colors disabled:cursor-default"
      >
        <div className="flex items-start gap-3">
          <BriefcaseBusiness size={16} className="text-[#00B4D8] shrink-0 mt-0.5" />
          <div>
            <p className="uppercase tracking-[0.18em] mb-0.5"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "#00B4D8" }}>
              Ofertas laborales activas
            </p>
            <span className="font-semibold text-white"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}>
              {labelBtn}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: abierto ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-white/40" />
        </motion.div>
      </button>

      {/* Lista expandible */}
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="lista"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: E }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-white/8 divide-y divide-white/6">
              {(expanded ? ofertas : ofertas.slice(0, PREVIEW)).map((o) => {
                const fecha = resolverFecha(o.fecha_publicacion_texto, o.created_at);
                const dias  = Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
                return (
                  <div
                    key={o.id}
                    onClick={() => o.url_aviso && window.open(o.url_aviso, "_blank", "noopener,noreferrer")}
                    className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors ${
                      o.url_aviso ? "cursor-pointer hover:bg-white/4" : ""
                    }`}
                  >
                    {/* Info izquierda */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-semibold text-white/85 leading-snug group-hover:text-[#00B4D8] transition-colors"
                        style={{ fontFamily: "var(--font-dm-sans)" }}>
                        {o.cargo_original}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {o.region && (
                          <span className="flex items-center gap-1 text-white/35"
                            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
                            <MapPin size={10} />
                            {o.region}
                          </span>
                        )}
                        {o.modalidad && (
                          <span className="text-white/30"
                            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem" }}>
                            {o.modalidad}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info derecha */}
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`tabular-nums ${dias > 45 ? "text-amber-500" : "text-white/30"}`}
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.7rem" }}>
                        {dias > 45 ? "⚠ " : ""}{fmtFecha(fecha)}
                      </span>
                      {o.salario_mid ? (
                        <span className="font-bold text-[#06D6A0] tabular-nums"
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.85rem" }}>
                          {fmtCLP(o.salario_mid)}
                        </span>
                      ) : (
                        <span className="text-white/20"
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.7rem" }}>
                          Sin salario
                        </span>
                      )}
                      {o.url_aviso ? (
                        <span className="flex items-center gap-1 text-white/30 group-hover:text-[#00B4D8] transition-colors"
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem" }}>
                          Ver <ExternalLink size={10} />
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ver más */}
            {!expanded && ofertas.length > PREVIEW && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full py-3 border-t border-white/8 text-center hover:bg-white/4 transition-colors"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", color: "#00B4D8" }}
              >
                VER {ofertas.length - PREVIEW} OFERTAS MÁS ↓
              </button>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/8 flex items-center justify-between gap-4">
              {expanded && (total ?? 0) > ofertas.length ? (
                <p className="text-white/30" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}>
                  Mostrando {ofertas.length} de {total} ofertas encontradas
                </p>
              ) : (
                <span />
              )}
              <a
                href={`/ofertas?sector=${encodeURIComponent(industria)}`}
                className="inline-flex items-center gap-1.5 border border-[#00B4D8]/35 text-[#00B4D8] px-4 py-2 rounded hover:bg-[#00B4D8]/10 transition-colors shrink-0"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", letterSpacing: "0.12em" }}
              >
                VER TODAS LAS OFERTAS EN {industria.toUpperCase()} →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
