"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  BarChart2, FileText, TrendingUp, Shield, Settings,
  LogOut, User, ArrowRight, Loader2, Plus,
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/lib/supabase";
import LoginPerfil from "@/components/LoginPerfil";

const E = [0.16, 1, 0.3, 1] as const;

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

interface Registro {
  id: string;
  cargo: string;
  industria: string;
  region: string;
  anios_experiencia: number;
  salario_min: number;
  salario_max: number;
  fecha_registro: string;
}

interface BenchLevel {
  anios: number;
  p25?: number;
  p50?: number;
  p75?: number;
}

const NAV = [
  { id: "benchmark", label: "Benchmark",    icon: BarChart2 },
  { id: "reportes",  label: "Reportes",     icon: FileText,  soon: true },
  { id: "analytics", label: "Analytics",    icon: TrendingUp, soon: true },
  { id: "compliance",label: "Compliance",   icon: Shield,    soon: true },
  { id: "config",    label: "Configuración",icon: Settings,  soon: true },
] as const;

async function fetchBenchLevel(
  cargo: string, industria: string, region: string, anios: number,
): Promise<BenchLevel> {
  const p = new URLSearchParams({ cargo, industria, region, anios_experiencia: String(anios) });
  try {
    const r = await fetch(`/api/benchmark?${p}`);
    if (!r.ok) return { anios };
    const d = await r.json();
    return { anios, p25: d.p25, p50: d.p50, p75: d.p75 };
  } catch { return { anios }; }
}

function Sidebar({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col"
      style={{
        width: "220px",
        background: "rgba(14, 6, 38, 0.98)",
        borderRight: "1px solid rgba(133,104,243,0.12)",
        zIndex: 40,
      }}
    >
      <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(133,104,243,0.08)" }}>
        <Link href="/">
          <img
            src="/logo-white.png"
            alt="RemuneraLab"
            style={{ height: "26px", width: "auto", filter: "drop-shadow(0 0 8px rgba(133,104,243,0.28))" }}
          />
        </Link>
      </div>

      <div className="px-6 py-4">
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.26em", color: "rgba(133,104,243,0.42)", textTransform: "uppercase" }}>
          Perfil de carrera
        </p>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.id === "benchmark";
          return (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg"
              style={{
                background: active ? "rgba(133,104,243,0.13)" : "transparent",
                border: active ? "1px solid rgba(133,104,243,0.20)" : "1px solid transparent",
                cursor: "soon" in item && item.soon ? "default" : "pointer",
              }}
            >
              <div className="flex items-center gap-3">
                <Icon size={14} style={{ color: active ? "#8568f3" : "rgba(255,255,255,0.20)" }} />
                <span style={{
                  fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem",
                  color: active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.26)",
                  fontWeight: active ? 500 : 400,
                }}>
                  {item.label}
                </span>
              </div>
              {"soon" in item && item.soon && (
                <span style={{
                  fontFamily: "var(--font-space-mono)", fontSize: "0.42rem", letterSpacing: "0.08em",
                  color: "rgba(133,104,243,0.36)", background: "rgba(133,104,243,0.06)",
                  border: "1px solid rgba(133,104,243,0.10)", padding: "1.5px 5px",
                  borderRadius: "3px", textTransform: "uppercase",
                }}>
                  Pronto
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-5" style={{ borderTop: "1px solid rgba(133,104,243,0.08)" }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(133,104,243,0.16)", border: "1px solid rgba(133,104,243,0.25)" }}>
            <User size={11} style={{ color: "#8568f3" }} />
          </div>
          <span className="truncate" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.68rem", color: "rgba(255,255,255,0.32)" }}>
            {email}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.20)", textTransform: "uppercase" }}
        >
          <LogOut size={10} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { fecha: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg"
      style={{ background: "#180b3b", border: "1px solid rgba(133,104,243,0.28)", fontFamily: "var(--font-space-mono)" }}>
      <p style={{ color: "#e7e4fd", fontSize: "0.75rem" }}>{fmtCLP(payload[0].value * 1000)}</p>
      <p style={{ color: "rgba(255,255,255,0.30)", fontSize: "0.58rem" }}>{payload[0].payload.fecha}</p>
    </div>
  );
}

function Dashboard({ registros, benchmarks, benchLoading }: {
  registros: Registro[];
  benchmarks: BenchLevel[];
  benchLoading: boolean;
}) {
  const latest = registros[0];
  const prev   = registros[1];

  if (!latest) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ border: "1px solid rgba(133,104,243,0.12)", background: "rgba(133,104,243,0.04)" }}>
        <p className="mb-6" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.35)" }}>
          Haz tu primer análisis para construir tu perfil salarial
        </p>
        <Link href="/formulario"
          className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff", fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>
          Hacer mi primer análisis <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  const latestMid = Math.round((latest.salario_min + latest.salario_max) / 2);
  const prevMid   = prev ? Math.round((prev.salario_min + prev.salario_max) / 2) : null;
  const variacion = prevMid !== null ? ((latestMid - prevMid) / prevMid * 100) : null;

  const chartData = [...registros].reverse().map(r => ({
    fecha: new Date(r.fecha_registro).toLocaleDateString("es-CL", { month: "short", year: "2-digit" }),
    val: Math.round((r.salario_min + r.salario_max) / 2 / 1000),
  }));

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }}>
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.28em", color: "rgba(133,104,243,0.50)", textTransform: "uppercase" }} className="mb-1.5">
          Benchmark salarial
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1.75rem" }}>
              Dashboard
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.80rem", color: "rgba(255,255,255,0.32)" }}>
              {latest.cargo} · {latest.industria} · {latest.region}
            </p>
          </div>
          <Link href="/formulario"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #8568f3, #a387f5)", color: "#fff", fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", fontWeight: 600 }}>
            <Plus size={13} /> Nuevo análisis
          </Link>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tu sueldo */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E, delay: 0.06 }}
          className="rounded-xl p-5"
          style={{ border: "1px solid rgba(133,104,243,0.18)", background: "rgba(133,104,243,0.06)" }}
        >
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.20em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }} className="mb-3">
            Tu sueldo
          </p>
          <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: "#e7e4fd", letterSpacing: "-0.01em" }}>
            {fmtCLP(latestMid)}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.70rem", color: "rgba(255,255,255,0.26)" }} className="mt-1.5">
            {new Date(latest.fecha_registro).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </motion.div>

        {/* Variación */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E, delay: 0.12 }}
          className="rounded-xl p-5"
          style={{ border: "1px solid rgba(133,104,243,0.18)", background: "rgba(133,104,243,0.06)" }}
        >
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.20em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }} className="mb-3">
            Variación
          </p>
          {variacion !== null ? (
            <>
              <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: variacion >= 0 ? "#7cf5b0" : "#f57c7c", letterSpacing: "-0.01em" }}>
                {variacion >= 0 ? "+" : ""}{variacion.toFixed(1)}%
              </p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.70rem", color: "rgba(255,255,255,0.26)" }} className="mt-1.5">
                vs análisis anterior
              </p>
            </>
          ) : (
            <>
              <p className="font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1rem", color: "rgba(255,255,255,0.20)" }}>—</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.70rem", color: "rgba(255,255,255,0.26)" }} className="mt-1.5">
                Primera medición
              </p>
            </>
          )}
        </motion.div>

        {/* Análisis */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E, delay: 0.18 }}
          className="rounded-xl p-5"
          style={{ border: "1px solid rgba(133,104,243,0.18)", background: "rgba(133,104,243,0.06)" }}
        >
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.20em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }} className="mb-3">
            Análisis guardados
          </p>
          <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: "#e7e4fd", letterSpacing: "-0.01em" }}>
            {registros.length}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.70rem", color: "rgba(255,255,255,0.26)" }} className="mt-1.5">
            {registros.length === 1 ? "Primera medición" : "En tu historial"}
          </p>
        </motion.div>
      </div>

      {/* Salary history chart */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E, delay: 0.22 }}
        className="rounded-xl p-6"
        style={{ border: "1px solid rgba(133,104,243,0.14)", background: "rgba(133,104,243,0.04)" }}
      >
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.22em", color: "rgba(133,104,243,0.50)", textTransform: "uppercase" }} className="mb-5">
          Evolución salarial
        </p>
        {chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-px w-16" style={{ background: "rgba(133,104,243,0.12)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#8568f3", boxShadow: "0 0 10px rgba(133,104,243,0.55)" }} />
              <div className="h-px w-16" style={{ background: "rgba(133,104,243,0.12)" }} />
            </div>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.80rem", color: "rgba(255,255,255,0.22)" }}>
              Agrega más análisis para ver tu evolución
            </p>
          </div>
        ) : (
          <div style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8568f3" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#8568f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fecha"
                  tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 9, fontFamily: "var(--font-space-mono)" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="val"
                  stroke="#8568f3" strokeWidth={2}
                  fill="url(#salGrad)"
                  dot={{ fill: "#8568f3", r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: "#e7e4fd", r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E, delay: 0.28 }}
        className="rounded-xl p-6"
        style={{ border: "1px solid rgba(133,104,243,0.14)", background: "rgba(133,104,243,0.04)" }}
      >
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.22em", color: "rgba(133,104,243,0.50)", textTransform: "uppercase" }} className="mb-1">
          Comparación por nivel
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.74rem", color: "rgba(255,255,255,0.24)" }} className="mb-5">
          Percentiles de mercado por años de experiencia — {latest.cargo} · {latest.region}
        </p>
        {benchLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={17} className="animate-spin" style={{ color: "#8568f3" }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.24)", textTransform: "uppercase", padding: "0 0 12px 0", textAlign: "left", fontWeight: 400 }}>
                    Experiencia
                  </th>
                  {["P25", "P50", "P75"].map(p => (
                    <th key={p} style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.24)", textTransform: "uppercase", padding: "0 0 12px 14px", textAlign: "right", fontWeight: 400 }}>
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b) => {
                  const isUser = Math.abs(b.anios - latest.anios_experiencia) <= 1;
                  return (
                    <tr key={b.anios} style={{ borderTop: "1px solid rgba(133,104,243,0.07)" }}>
                      <td style={{ padding: "10px 0", fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: isUser ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.36)", fontWeight: isUser ? 500 : 400 }}>
                        {b.anios === 1 ? "1 año" : `${b.anios} años`}
                        {isUser && (
                          <span className="ml-2 px-1.5 py-0.5 rounded" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.42rem", letterSpacing: "0.08em", background: "rgba(133,104,243,0.14)", color: "#8568f3", border: "1px solid rgba(133,104,243,0.22)" }}>
                            tú
                          </span>
                        )}
                      </td>
                      {[b.p25, b.p50, b.p75].map((val, j) => (
                        <td key={j} style={{ padding: "10px 0 10px 14px", fontFamily: "var(--font-space-mono)", fontSize: "0.76rem", color: val ? (isUser ? "#a387f5" : "rgba(255,255,255,0.36)") : "rgba(255,255,255,0.16)", textAlign: "right", letterSpacing: "0.02em" }}>
                          {val ? fmtCLP(val) : "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* History list */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: E, delay: 0.34 }}
        className="rounded-xl p-6"
        style={{ border: "1px solid rgba(133,104,243,0.12)", background: "rgba(133,104,243,0.03)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", letterSpacing: "0.22em", color: "rgba(133,104,243,0.50)", textTransform: "uppercase" }}>
            Historial de análisis
          </p>
          <Link href="/formulario"
            className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.48rem", letterSpacing: "0.14em", color: "rgba(133,104,243,0.48)", textTransform: "uppercase" }}>
            <Plus size={10} /> Agregar
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {registros.map((r, i) => {
            const mid = Math.round((r.salario_min + r.salario_max) / 2);
            return (
              <div
                key={r.id}
                className="flex items-center justify-between py-3 px-4 rounded-lg"
                style={{ background: i === 0 ? "rgba(133,104,243,0.08)" : "transparent", border: "1px solid rgba(133,104,243,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  {i === 0 && (
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.42rem", letterSpacing: "0.1em", background: "rgba(133,104,243,0.16)", color: "#8568f3", border: "1px solid rgba(133,104,243,0.26)", padding: "1.5px 6px", borderRadius: "3px", textTransform: "uppercase" }}>
                      Último
                    </span>
                  )}
                  <div>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: i === 0 ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.40)", fontWeight: i === 0 ? 500 : 400 }}>
                      {r.cargo}
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.70rem", color: "rgba(255,255,255,0.24)" }} className="ml-2">
                      {r.anios_experiencia}a exp
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: i === 0 ? "#a387f5" : "rgba(255,255,255,0.30)", letterSpacing: "0.02em" }}>
                    {fmtCLP(mid)}
                  </span>
                  <Link href={`/resultado/${r.id}`}
                    className="flex items-center gap-1 hover:opacity-75 transition-opacity"
                    style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.48rem", letterSpacing: "0.12em", color: "rgba(133,104,243,0.46)", textTransform: "uppercase" }}>
                    Ver <ArrowRight size={9} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}

function PerfilContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading]       = useState(true);
  const [userEmail, setUserEmail]   = useState<string | null>(null);
  const [registros, setRegistros]   = useState<Registro[]>([]);
  const [vinculando, setVinculando] = useState(false);
  const [benchmarks, setBenchmarks] = useState<BenchLevel[]>([]);
  const [benchLoading, setBenchLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setUserEmail(session.user.email ?? null);

      const vincular = searchParams.get("vincular");
      if (vincular) {
        setVinculando(true);
        await fetch("/api/perfil/vincular", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
          body: JSON.stringify({ registroId: vincular }),
        });
        setVinculando(false);
        window.history.replaceState({}, "", "/perfil");
      }

      const res  = await fetch("/api/perfil/datos", {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      const regs: Registro[] = json.registros ?? [];
      setRegistros(regs);
      setLoading(false);

      if (regs.length > 0) {
        setBenchLoading(true);
        const latest = regs[0];
        const levels = await Promise.all(
          [1, 3, 5].map(a => fetchBenchLevel(latest.cargo, latest.industria, latest.region, a)),
        );
        setBenchmarks(levels);
        setBenchLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#180b3b" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#8568f3" }} />
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#180b3b" }}>
        <div className="pointer-events-none fixed inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(133,104,243,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.05) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <header className="relative z-10 px-6 h-16 flex items-center" style={{ borderBottom: "1px solid rgba(133,104,243,0.12)" }}>
          <Link href="/">
            <img src="/logo-white.png" alt="RemuneraLab" style={{ height: "28px", width: "auto", filter: "drop-shadow(0 0 8px rgba(133,104,243,0.28))" }} />
          </Link>
        </header>
        <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", letterSpacing: "0.30em", color: "#8568f3", textTransform: "uppercase" }} className="mb-3">
                Perfil de carrera
              </p>
              <h1 className="text-white font-semibold text-2xl mb-2" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Accede a tu perfil
              </h1>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(255,255,255,0.38)" }}>
                Guarda tus análisis y sigue tu evolución salarial
              </p>
            </div>
            <LoginPerfil registroId="" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#180b3b" }}>
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(133,104,243,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(133,104,243,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px", zIndex: 0 }} />
      <div className="pointer-events-none fixed -top-40 right-0 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(133,104,243,0.09) 0%, transparent 65%)", zIndex: 0 }} />

      <Sidebar email={userEmail} onLogout={handleLogout} />

      <main className="relative" style={{ marginLeft: "220px", zIndex: 1 }}>
        <div className="max-w-4xl mx-auto px-8 py-10">
          {vinculando && (
            <div className="flex items-center gap-3 mb-6 px-5 py-3 rounded-lg"
              style={{ background: "rgba(133,104,243,0.10)", border: "1px solid rgba(133,104,243,0.20)" }}>
              <Loader2 size={13} className="animate-spin" style={{ color: "#8568f3" }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.83rem", color: "rgba(255,255,255,0.48)" }}>
                Guardando análisis en tu perfil…
              </span>
            </div>
          )}
          <Dashboard registros={registros} benchmarks={benchmarks} benchLoading={benchLoading} />
        </div>
      </main>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#180b3b" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#8568f3" }} />
      </div>
    }>
      <PerfilContent />
    </Suspense>
  );
}
