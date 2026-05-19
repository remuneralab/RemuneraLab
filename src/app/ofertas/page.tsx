"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";

const E = [0.16, 1, 0.3, 1] as const;

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

type FiltroItem = { nombre: string; count: number };

function fmtCLP(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}k`;
}

function FiltroBtn({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all ${
        active
          ? "bg-[#00B4D8]/15 text-[#00B4D8] border-[#00B4D8]/50"
          : "border-white/12 text-white/45 hover:border-[#00B4D8]/40 hover:text-white/80"
      }`}
      style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem" }}
    >
      {label}
      <span className={`tabular-nums text-[10px] ${active ? "opacity-80" : "opacity-40"}`}
        style={{ fontFamily: "var(--font-space-mono)" }}>
        {count.toLocaleString("es-CL")}
      </span>
    </button>
  );
}

export default function Ofertas() {
  return (
    <Suspense>
      <OfertasInner />
    </Suspense>
  );
}

function OfertasInner() {
  const searchParams = useSearchParams();
  const [sector, setSector]          = useState(() => searchParams.get("sector") ?? "Todos");
  const [region, setRegion]          = useState("Todas");
  const [soloConRegion, setSoloCR]   = useState(false);
  const [ofertas, setOfertas]        = useState<Oferta[]>([]);
  const [total, setTotal]            = useState(0);
  const [page, setPage]              = useState(0);
  const [loading, setLoading]        = useState(true);
  const [sectores, setSectores]      = useState<FiltroItem[]>([]);
  const [regiones, setRegiones]      = useState<FiltroItem[]>([]);
  const [totalGeneral, setTotalGral] = useState(0);

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetch("/api/filtros")
      .then((r) => r.json())
      .then((d) => {
        setSectores(d.sectores ?? []);
        setRegiones(d.regiones ?? []);
        const total = (d.sectores ?? []).reduce((acc: number, s: FiltroItem) => acc + s.count, 0);
        setTotalGral(total);
      })
      .catch(() => {});
  }, []);

  const fetchOfertas = useCallback(async (s: string, r: string, cr: boolean, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({
      sector: s, region: r, conRegion: cr ? "1" : "0", page: String(p),
    });
    const res  = await fetch(`/api/ofertas?${params}`);
    const json = await res.json();
    setOfertas(p === 0 ? json.ofertas : (prev: Oferta[]) => [...prev, ...json.ofertas]);
    setTotal(json.total);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
    setOfertas([]);
    fetchOfertas(sector, region, soloConRegion, 0);
  }, [sector, region, soloConRegion, fetchOfertas]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchOfertas(sector, region, soloConRegion, next);
  }

  function handleRegion(r: string) {
    setRegion(r);
    if (r !== "Todas") setSoloCR(false);
  }

  const hayMas = ofertas.length < total;

  const totalSector =
    sector === "Todos"
      ? totalGeneral
      : (sectores.find((s) => s.nombre === sector)?.count ?? 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0D2240] overflow-x-hidden">

      {/* Glows */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-24 w-[450px] h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(46,196,182,0.08) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,180,216,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/8"
        style={{ background: "rgba(13,34,64,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif-display italic text-white hover:text-[#00B4D8] transition-colors"
            style={{ fontSize: "1.4rem" }}
          >
            RemuneraLab
          </Link>
          <Link
            href="/formulario"
            className="inline-flex items-center gap-1.5 font-semibold border border-[#00B4D8]/40 text-[#00B4D8] px-4 py-1.5 rounded hover:bg-[#00B4D8]/10 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem" }}
          >
            Revisar mi sueldo <ArrowRight size={11} />
          </Link>
        </div>
      </header>

      <main className="relative flex-grow max-w-5xl mx-auto px-6 w-full pt-28 pb-24">

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="mb-10"
        >
          <p className="text-[#00B4D8] uppercase tracking-[0.3em] mb-3"
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem" }}>
            Mercado laboral · Chile
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans)" }}>
            Ofertas laborales
          </h1>
          <p className="text-white/25 mt-3"
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
            Última actualización: 12 de mayo 2026 · Verificar vigencia al postular
          </p>
          {!loading && (
            <p className="text-white/45 mt-2"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
              {total.toLocaleString("es-CL")} avisos
              {sector !== "Todos" ? ` · ${sector}` : ""}
              {region !== "Todas" ? ` · ${region}` : ""}
              {soloConRegion && region === "Todas" ? " · con región" : ""}
              {totalSector > 0 && total < totalSector && region !== "Todas" && (
                <span className="text-white/25">
                  {" "}(de {totalSector.toLocaleString("es-CL")} en este sector)
                </span>
              )}
            </p>
          )}
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E, delay: 0.1 }}
          className="flex flex-col gap-6 mb-10 p-5 rounded-xl border border-white/8 bg-white/3"
        >
          {/* Sector */}
          <div className="flex flex-col gap-2.5">
            <p className="text-white/35 uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
              Sector
            </p>
            <div className="flex flex-wrap gap-2">
              <FiltroBtn label="Todos" count={totalGeneral} active={sector === "Todos"} onClick={() => setSector("Todos")} />
              {sectores.map((s) => (
                <FiltroBtn key={s.nombre} label={s.nombre} count={s.count} active={sector === s.nombre} onClick={() => setSector(s.nombre)} />
              ))}
            </div>
          </div>

          {/* Región */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-white/35 uppercase tracking-[0.25em]"
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}>
                Región
              </p>
              <button
                onClick={() => { setSoloCR((v) => !v); setRegion("Todas"); }}
                className={`inline-flex items-center gap-2 uppercase tracking-[0.2em] transition-colors ${
                  soloConRegion ? "text-[#00B4D8]" : "text-white/30 hover:text-white/55"
                }`}
                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", fontWeight: 700 }}
              >
                <span className={`w-7 h-3.5 rounded-full transition-colors relative ${soloConRegion ? "bg-[#00B4D8]" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition-all ${soloConRegion ? "left-[calc(100%-0.75rem)]" : "left-0.5"}`} />
                </span>
                Solo con región
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <FiltroBtn label="Todas" count={totalGeneral} active={region === "Todas"} onClick={() => handleRegion("Todas")} />
              {regiones.map((r) => (
                <FiltroBtn key={r.nombre} label={r.nombre} count={r.count} active={region === r.nombre} onClick={() => handleRegion(r.nombre)} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista de ofertas */}
        {loading && ofertas.length === 0 ? (
          <div className="flex flex-col divide-y divide-white/6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="py-5 animate-pulse flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/6 rounded w-2/5" />
                  <div className="h-3 bg-white/6 rounded w-1/4" />
                </div>
                <div className="h-4 bg-white/6 rounded w-16" />
              </div>
            ))}
          </div>
        ) : ofertas.length === 0 ? (
          <p className="text-white/35 py-12 text-center"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
            No hay avisos para esta combinación de filtros.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-white/6">
            {ofertas.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: E, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => o.url_aviso && window.open(o.url_aviso, "_blank", "noopener,noreferrer")}
                className={`py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors -mx-2 px-2 rounded-lg ${
                  o.url_aviso ? "cursor-pointer hover:bg-white/4" : ""
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-sm font-semibold text-white/85 leading-snug group-hover:text-[#00B4D8] transition-colors"
                    style={{ fontFamily: "var(--font-dm-sans)" }}>
                    {o.cargo_original}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {o.industria && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30"
                        style={{ fontFamily: "var(--font-space-mono)" }}>
                        {o.industria}
                      </span>
                    )}
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

                <div className="flex items-center gap-4 shrink-0">
                  {(() => {
                    const fecha = resolverFecha(o.fecha_publicacion_texto, o.created_at);
                    const dias  = Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
                    return (
                      <span className={`tabular-nums ${dias > 45 ? "text-amber-500" : "text-white/30"}`}
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.7rem" }}>
                        {dias > 45 ? "⚠ " : ""}{fmtFecha(fecha)}
                      </span>
                    );
                  })()}
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
                    <span className="inline-flex items-center gap-1 text-white/25 group-hover:text-[#00B4D8] transition-colors"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem" }}>
                      Ver <ExternalLink size={10} />
                    </span>
                  ) : (
                    <span className="text-white/15"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem" }}>
                      Sin enlace
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cargar más */}
        {hayMas && !loading && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMore}
              className="border border-[#00B4D8]/35 text-[#00B4D8] px-6 py-2.5 rounded hover:bg-[#00B4D8]/10 transition-colors"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}
            >
              Cargar más
            </button>
          </div>
        )}

        {loading && ofertas.length > 0 && (
          <div className="mt-10 flex justify-center">
            <span className="text-white/30"
              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
              Cargando...
            </span>
          </div>
        )}

      </main>
    </div>
  );
}
