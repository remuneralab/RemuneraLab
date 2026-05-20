"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, ExternalLink, MapPin, Loader2 } from "lucide-react";

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

function fmtCLP(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}k`;
}

type FiltroItem = { nombre: string; count: number };

function FiltroRow({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all text-left"
      style={{
        background: active ? "rgba(133,104,243,0.12)" : "transparent",
        border: active ? "1px solid rgba(133,104,243,0.20)" : "1px solid transparent",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: active ? "#8568f3" : "rgba(255,255,255,0.18)" }} />
        <span className="truncate" style={{
          fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem",
          color: active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.42)",
          fontWeight: active ? 500 : 400,
        }}>
          {label}
        </span>
      </div>
      <span style={{
        fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", letterSpacing: "0.04em",
        color: active ? "rgba(133,104,243,0.80)" : "rgba(255,255,255,0.20)",
        flexShrink: 0, marginLeft: "8px",
      }}>
        {count.toLocaleString("es-CL")}
      </span>
    </button>
  );
}

export default function Ofertas() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#180b3b" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#8568f3" }} />
      </div>
    }>
      <OfertasInner />
    </Suspense>
  );
}

function OfertasInner() {
  const searchParams = useSearchParams();
  const [sector, setSector]          = useState(() => searchParams.get("sector") ?? "Todos");
  const [region, setRegion]          = useState("Todas");
  const [soloConRegion, setSoloCR]   = useState(false);
  const [cargo, setCargo]            = useState("");
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
        const t = (d.sectores ?? []).reduce((acc: number, s: FiltroItem) => acc + s.count, 0);
        setTotalGral(t);
      })
      .catch(() => {});
  }, []);

  const fetchOfertas = useCallback(async (s: string, r: string, cr: boolean, p: number, c: string) => {
    setLoading(true);
    const params = new URLSearchParams({ sector: s, region: r, conRegion: cr ? "1" : "0", page: String(p) });
    if (c) params.set("cargo", c);
    const res  = await fetch(`/api/ofertas?${params}`);
    const json = await res.json();
    setOfertas(p === 0 ? json.ofertas : (prev: Oferta[]) => [...prev, ...json.ofertas]);
    setTotal(json.total);
    setLoading(false);
  }, []);

  useEffect(() => {
    setPage(0);
    setOfertas([]);
    fetchOfertas(sector, region, soloConRegion, 0, cargo);
  }, [sector, region, soloConRegion, cargo, fetchOfertas]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchOfertas(sector, region, soloConRegion, next, cargo);
  }

  function handleRegion(r: string) {
    setRegion(r);
    if (r !== "Todas") setSoloCR(false);
  }

  const hayMas = ofertas.length < total;

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "#180b3b" }}>

      {/* Glows */}
      <div className="pointer-events-none fixed -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.16) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.09) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(133,104,243,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ background: "rgba(24,11,59,0.88)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(133,104,243,0.12)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <img src="/logo-white.png" alt="RemuneraLab"
              style={{ height: "30px", width: "auto", filter: "drop-shadow(0 0 10px rgba(133,104,243,0.30))" }} />
          </Link>
          <nav className="flex items-center gap-5">

            <Link href="/formulario"
              className="inline-flex items-center gap-1.5 font-semibold px-4 py-1.5 rounded transition-colors hover:bg-[#8568f3]/10"
              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", border: "1px solid rgba(133,104,243,0.40)", color: "#8568f3" }}>
              Revisar mi sueldo <ArrowRight size={11} />
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative flex-grow max-w-7xl mx-auto px-6 w-full pt-28 pb-24">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="mb-8"
        >
          <p className="uppercase tracking-[0.3em] mb-2"
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#8568f3" }}>
            Mercado laboral · Chile
          </p>
          <h1 className="font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>
            Ofertas laborales
          </h1>
          {!loading && (
            <p className="mt-2" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.38)" }}>
              {total.toLocaleString("es-CL")} avisos
              {cargo && ` · "${cargo}"`}
              {sector !== "Todos" && ` · ${sector}`}
              {region !== "Todas" && ` · ${region}`}
            </p>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sidebar filtros ── */}
          <motion.aside
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: E, delay: 0.08 }}
            className="w-full lg:w-60 shrink-0 lg:sticky lg:top-24"
          >
            <div className="rounded-xl p-4 flex flex-col gap-5"
              style={{ border: "1px solid rgba(133,104,243,0.14)", background: "rgba(133,104,243,0.04)" }}>

              {/* Cargo — búsqueda libre */}
              <div>
                <p className="px-3 mb-2 uppercase tracking-[0.22em]"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(133,104,243,0.55)", fontWeight: 700 }}>
                  Cargo
                </p>
                <input
                  type="text"
                  placeholder="ej. diseñador, contador..."
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(133,104,243,0.18)",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.82rem",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.45)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(133,104,243,0.18)")}
                />
              </div>

              <div style={{ height: "1px", background: "rgba(133,104,243,0.10)" }} />

              {/* Sector */}
              <div>
                <p className="px-3 mb-2 uppercase tracking-[0.22em]"
                  style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(133,104,243,0.55)", fontWeight: 700 }}>
                  Sector
                </p>
                <div className="flex flex-col gap-0.5">
                  <FiltroRow label="Todos" count={totalGeneral} active={sector === "Todos"} onClick={() => setSector("Todos")} />
                  {sectores.map((s) => (
                    <FiltroRow key={s.nombre} label={s.nombre} count={s.count} active={sector === s.nombre} onClick={() => setSector(s.nombre)} />
                  ))}
                </div>
              </div>

              <div style={{ height: "1px", background: "rgba(133,104,243,0.10)" }} />

              {/* Región */}
              <div>
                <div className="px-3 mb-2 flex items-center justify-between gap-2">
                  <p className="uppercase tracking-[0.22em]"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(133,104,243,0.55)", fontWeight: 700 }}>
                    Región
                  </p>
                  <button
                    onClick={() => { setSoloCR((v) => !v); setRegion("Todas"); }}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ color: soloConRegion ? "#8568f3" : "rgba(255,255,255,0.28)", fontFamily: "var(--font-space-mono)", fontSize: "0.48rem", letterSpacing: "0.1em" }}
                  >
                    <span className="relative w-6 h-3 rounded-full transition-colors"
                      style={{ background: soloConRegion ? "#8568f3" : "rgba(255,255,255,0.15)" }}>
                      <span className="absolute top-0.5 w-2 h-2 rounded-full bg-white shadow transition-all"
                        style={{ left: soloConRegion ? "calc(100% - 0.625rem)" : "2px" }} />
                    </span>
                    <span>Con región</span>
                  </button>
                </div>
                <div className="flex flex-col gap-0.5">
                  <FiltroRow label="Todas" count={totalGeneral} active={region === "Todas"} onClick={() => handleRegion("Todas")} />
                  {regiones.map((r) => (
                    <FiltroRow key={r.nombre} label={r.nombre} count={r.count} active={region === r.nombre} onClick={() => handleRegion(r.nombre)} />
                  ))}
                </div>
              </div>

            </div>
          </motion.aside>

          {/* ── Lista de ofertas ── */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: E, delay: 0.12 }}
            className="flex-1 min-w-0"
          >
            {loading && ofertas.length === 0 ? (
              <div className="flex flex-col divide-y" style={{ borderColor: "rgba(133,104,243,0.08)" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="py-5 animate-pulse flex gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-2/5" style={{ background: "rgba(133,104,243,0.10)" }} />
                      <div className="h-3 rounded w-1/4" style={{ background: "rgba(133,104,243,0.06)" }} />
                    </div>
                    <div className="h-4 rounded w-16" style={{ background: "rgba(133,104,243,0.08)" }} />
                  </div>
                ))}
              </div>
            ) : ofertas.length === 0 ? (
              <p className="py-12 text-center" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: "rgba(255,255,255,0.28)" }}>
                No hay avisos para esta combinación de filtros.
              </p>
            ) : (
              <div className="flex flex-col" style={{ borderTop: "1px solid rgba(133,104,243,0.08)" }}>
                {ofertas.map((o, i) => {
                  const fecha = resolverFecha(o.fecha_publicacion_texto, o.created_at);
                  const dias  = Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
                  return (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: E, delay: Math.min(i * 0.025, 0.25) }}
                      onClick={() => o.url_aviso && window.open(o.url_aviso, "_blank", "noopener,noreferrer")}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 -mx-2 px-2 rounded-lg transition-all group"
                      style={{
                        borderBottom: "1px solid rgba(133,104,243,0.07)",
                        cursor: o.url_aviso ? "pointer" : "default",
                      }}
                      onMouseEnter={e => { if (o.url_aviso) (e.currentTarget as HTMLDivElement).style.background = "rgba(133,104,243,0.05)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <p className="font-semibold leading-snug transition-colors"
                          style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.82)" }}>
                          {o.cargo_original}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {o.industria && (
                            <span className="uppercase tracking-wider"
                              style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "rgba(133,104,243,0.55)" }}>
                              {o.industria}
                            </span>
                          )}
                          {o.region && (
                            <span className="flex items-center gap-1"
                              style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.32)" }}>
                              <MapPin size={10} />{o.region}
                            </span>
                          )}
                          {o.modalidad && (
                            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.28)" }}>
                              {o.modalidad}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-5 shrink-0">
                        <span className={`tabular-nums`}
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.68rem", color: dias > 45 ? "#F7C948" : "rgba(255,255,255,0.28)" }}>
                          {dias > 45 ? "⚠ " : ""}{fmtFecha(fecha)}
                        </span>
                        {o.salario_mid ? (
                          <span className="font-bold tabular-nums"
                            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.85rem", color: "#a387f5" }}>
                            {fmtCLP(o.salario_mid)}
                          </span>
                        ) : (
                          <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.68rem", color: "rgba(255,255,255,0.18)" }}>
                            Sin salario
                          </span>
                        )}
                        {o.url_aviso ? (
                          <span className="inline-flex items-center gap-1 transition-colors"
                            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: "rgba(133,104,243,0.45)" }}>
                            Ver <ExternalLink size={10} />
                          </span>
                        ) : (
                          <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.62rem", color: "rgba(255,255,255,0.14)" }}>
                            Sin enlace
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {hayMas && !loading && (
              <div className="mt-10 flex justify-center">
                <button onClick={loadMore}
                  className="px-6 py-2.5 rounded-lg transition-all hover:opacity-90"
                  style={{ border: "1px solid rgba(133,104,243,0.35)", color: "#8568f3", fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem" }}>
                  Cargar más
                </button>
              </div>
            )}

            {loading && ofertas.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Loader2 size={18} className="animate-spin" style={{ color: "#8568f3" }} />
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <footer className="relative py-6 px-6" style={{ borderTop: "1px solid rgba(133,104,243,0.10)" }}>
        <p className="text-center" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.18)" }}>
          REMUNERALAB — DATOS ACTUALIZADOS PERIÓDICAMENTE · VERIFICAR VIGENCIA AL POSTULAR
        </p>
      </footer>
    </div>
  );
}
