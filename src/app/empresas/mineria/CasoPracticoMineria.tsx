"use client";

import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  Building2, TrendingDown, TrendingUp, AlertCircle,
  CircleDollarSign, Users, Clock, ShieldAlert,
  ChartNoAxesCombined, Zap,
} from "lucide-react";

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

const EMPRESA = {
  nombre: "Faena Minera Modelo",
  empleados: 255,
  sector: "Minería del cobre — gran minería",
  region: "Región de Antofagasta",
  rotacionActual: 22,
  rotacionObjetivo: 9,
};

const ROLES = [
  {
    rol: "Superintendentes",
    n: 20, rotaciones: 3,
    costoUnitario: 38_400_000,
    costoTotal:   115_200_000,
    color: "#ef4444",
  },
  {
    rol: "Ingenieros / Geólogos",
    n: 45, rotaciones: 8,
    costoUnitario: 17_640_000,
    costoTotal:   141_120_000,
    color: "#f97316",
  },
  {
    rol: "Operadores Eq. Pesado",
    n: 110, rotaciones: 25,
    costoUnitario: 12_000_000,
    costoTotal:   300_000_000,
    color: "#f59e0b",
  },
  {
    rol: "Técs. de Mantención",
    n: 80, rotaciones: 15,
    costoUnitario: 7_200_000,
    costoTotal:   108_000_000,
    color: "#eab308",
  },
];

const COSTO_ACTUAL   = 664_320_000;
const COSTO_OBJETIVO = 298_800_000;
const AHORRO_ANUAL   = COSTO_ACTUAL - COSTO_OBJETIVO;
const ROI_PLAN       = 3.2;

const barData = ROLES.map((r) => ({ rol: r.rol, costo: r.costoTotal / 1_000_000, color: r.color }));
const cmpData = [
  { label: "Costo actual",        valor: COSTO_ACTUAL   / 1_000_000, color: "#ef4444" },
  { label: "Con plan retención",  valor: COSTO_OBJETIVO / 1_000_000, color: "#0F7B6C" },
];

const EFICIENCIA = [
  {
    icon: Clock,
    titulo: "Caída en disponibilidad de flota",
    valor: "–8.4%",
    unidad: "disponibilidad equipos",
    desc: "Cada vacante en operadores reduce la disponibilidad de flota ~0.3%. Con 25 vacantes acumuladas en el año, el impacto equivale a un equipo pesado fuera de línea de forma permanente.",
    color: "text-red-500",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: Users,
    titulo: "Sobrecosto en turnos cubiertos",
    valor: "+34%",
    unidad: "costo hora-hombre extra",
    desc: "Los turnos vacantes se cubren con horas extra al 150% del valor base. En una operación de 3 turnos continuos en faena, este sobrecosto se acumula en todos los equipos activos.",
    color: "text-orange-500",
    bg: "bg-amber-900/12",
    border: "border-amber-500/20",
  },
  {
    icon: ShieldAlert,
    titulo: "Semanas operando sin cert. completa",
    valor: "4–6",
    unidad: "semanas de riesgo legal",
    desc: "Los reemplazos ingresan sin todas las certificaciones SERNAGEOMIN activas. Durante la habilitación, la faena opera con exposición legal no cubierta por los seguros de responsabilidad civil.",
    color: "text-amber-500",
    bg: "bg-amber-900/12",
    border: "border-amber-500/20",
  },
];

const tooltipStyle = {
  background: "#0D2240",
  border: "1px solid rgba(0,180,216,0.2)",
  borderRadius: "10px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  fontSize: "12px",
};

function TooltipBarra({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-1">{label}</p>
      <p className="text-white">{fmtCLP(payload[0].value * 1_000_000)}</p>
    </div>
  );
}

export default function CasoPracticoMineria() {
  return (
    <section className="py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[#00B4D8] uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>
              Caso práctico
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-900/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              <AlertCircle size={11} /> Empresa simulada — fines ilustrativos
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¿Cuánto le cuesta la rotación a una faena tipo?
          </h2>
          <p className="text-sm text-white/45 max-w-2xl">
            Simulación para una operación minera de cobre de tamaño medio en Antofagasta.
            En minería, el costo de reposición es único: suma vuelos, alojamiento, certificaciones
            SERNAGEOMIN y curva de aprendizaje en equipos de alta especialización.
          </p>
        </div>

        {/* Perfil empresa */}
        <div className="rounded-xl border border-white/10 bg-white/4 p-5 mb-10 flex flex-wrap items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">{EMPRESA.nombre}</p>
            <p className="text-xs text-white/45">{EMPRESA.sector} · {EMPRESA.region}</p>
          </div>
          <div className="flex flex-wrap gap-5 ml-auto text-center">
            {[
              { label: "Dotación",          valor: EMPRESA.empleados            },
              { label: "Rotación actual",   valor: `${EMPRESA.rotacionActual}%` },
              { label: "Objetivo",          valor: `${EMPRESA.rotacionObjetivo}%` },
              { label: "Turno régimen",     valor: "7×7"                        },
            ].map((s) => (
              <div key={s.label} className="min-w-[72px]">
                <p className="text-xl font-bold text-white">{s.valor}</p>
                <p className="text-[10px] text-white/45 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: CircleDollarSign, label: "Costo anual rotación",       valor: fmtCLP(COSTO_ACTUAL),   sub: "51 rotaciones · 4 categorías",   color: "text-red-500",     bg: "bg-red-900/12 border-red-500/20"         },
            { icon: TrendingDown,     label: "Con plan de retención (9%)", valor: fmtCLP(COSTO_OBJETIVO), sub: "estimación año 1",               color: "text-[#06D6A0]",   bg: "bg-emerald-900/12 border-emerald-500/25" },
            { icon: TrendingUp,       label: "Ahorro potencial anual",     valor: fmtCLP(AHORRO_ANUAL),   sub: `ROI ${ROI_PLAN}x sobre inversión`,color: "text-white",      bg: "bg-[#00B4D8]/5 border-[#00B4D8]/15"     },
          ].map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border ${k.bg}`}>
              <k.icon size={20} className={`${k.color} mb-3`} />
              <p className={`text-3xl font-bold ${k.color}`}>{k.valor}</p>
              <p className="text-xs font-semibold text-white mt-1">{k.label}</p>
              <p className="text-[11px] text-white/45 mt-0.5">{k.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          <div className="rounded-xl border border-white/10 bg-white/4 p-6">
            <p className="text-[#00B4D8] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Desglose por categoría</p>
            <h3 className="text-base font-bold text-white mb-5">Costo de rotación anual (millones CLP)</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} tickFormatter={(v: number) => `$${v}M`} />
                  <YAxis type="category" dataKey="rol" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} width={140} />
                  <Tooltip content={<TooltipBarra />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="costo" radius={[0, 6, 6, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 divide-y divide-white/8 text-xs">
              {ROLES.map((r) => (
                <div key={r.rol} className="flex items-center justify-between py-2">
                  <span className="text-white/45">{r.rol} ({r.n})</span>
                  <div className="flex gap-4">
                    <span className="text-white/45">{r.rotaciones} rot./año</span>
                    <span className="font-bold text-white">{fmtCLP(r.costoTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col">
            <p className="text-[#00B4D8] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Escenario comparativo</p>
            <h3 className="text-base font-bold text-white mb-5">Actual vs. plan de retención</h3>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmpData} margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} tickFormatter={(v: number) => `$${v}M`} width={52} />
                  <Tooltip content={<TooltipBarra />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {cmpData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto pt-4 border-t border-white/8 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/45">Ahorro anual proyectado</span>
                <span className="text-2xl font-bold text-[#06D6A0]">{fmtCLP(AHORRO_ANUAL)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/45">ROI del plan</span>
                <span className="text-2xl font-bold text-white">{ROI_PLAN}x</span>
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed pt-1">
                En minería el costo por evento incluye vuelos, alojamiento en faena, certificaciones
                SERNAGEOMIN y hasta 6 semanas de curva de aprendizaje en equipos específicos.
                Retener a un operador con $400.000/mes de ajuste es {ROI_PLAN} veces más barato que reemplazarlo.
              </p>
            </div>
          </div>
        </div>

        {/* Impacto operacional */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6">Impacto operacional específico de minería</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {EFICIENCIA.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border ${e.bg} ${e.border}`}>
                <e.icon size={20} className={`${e.color} mb-3`} />
                <p className={`text-3xl font-bold ${e.color} mb-1`}>{e.valor}</p>
                <p className="text-[11px] font-bold text-white/45 uppercase tracking-wider mb-2">{e.unidad}</p>
                <p className="text-xs font-semibold text-white mb-2">{e.titulo}</p>
                <p className="text-xs text-white/45 leading-relaxed">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Análisis profesional */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-[#00B4D8] uppercase tracking-[0.3em]" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.62rem", fontWeight: 700 }}>Análisis profesional</p>
            <span className="inline-flex items-center gap-1.5 bg-[#00B4D8]/5 border border-[#00B4D8]/15 text-[#00B4D8] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Zap size={10} /> Generado por RemuneraLab AI
            </span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#00B4D8]/20 flex items-center justify-center text-white font-bold text-sm shrink-0">SC</div>
                <div>
                  <p className="font-bold text-white text-sm">Sofía Contreras</p>
                  <p className="text-xs text-white/45">Analista de Datos · 6 años en sector minero</p>
                </div>
                <ChartNoAxesCombined size={16} className="text-[#00B4D8] ml-auto shrink-0" />
              </div>
              <div className="text-xs text-white/45 leading-relaxed space-y-3">
                <p>
                  Lo primero que sale del dato es la asimetría de la distribución de costos: los operadores de
                  equipos pesados representan el 45% del gasto total de rotación con solo el 43% de la dotación.
                  Pero lo más revelador no es el costo por evento — es la <strong className="text-white">frecuencia</strong>:
                  25 rotaciones de operadores al año equivalen a renovar el 23% del equipo de turno cada 12 meses.
                  En una faena continua, eso significa que en cualquier momento hay 2–3 personas en proceso de
                  habilitación, sin acceso pleno a los equipos críticos.
                </p>
                <p>
                  El segundo patrón es la concentración en los extremos: los 3 superintendentes que rotan
                  generan el 17% del costo total. El patrón estadístico es el mismo que en otros sectores —
                  <strong className="text-white"> el costo de rotación es exponencial con el nivel jerárquico</strong>,
                  no lineal. Retener a un superintendente con un ajuste de $600.000/mes es 5 veces más barato
                  que reemplazarlo, sin contar el costo en continuidad de operaciones y conocimiento de la faena.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">CV</div>
                <div>
                  <p className="font-bold text-white text-sm">Cristóbal Vega</p>
                  <p className="text-xs text-white/45">Especialista RRHH · 11 años en gran minería</p>
                </div>
                <Users size={16} className="text-white ml-auto shrink-0" />
              </div>
              <div className="text-xs text-white/45 leading-relaxed space-y-3">
                <p>
                  En minería hay un factor que no aparece en los modelos de costo estándar:
                  <strong className="text-white"> el costo del conocimiento tácito de la faena</strong>.
                  Un operador que lleva 3 años en esa mina específica sabe cosas que no están en ningún manual —
                  cómo se comporta el suelo en ese sector, qué ruta evitar en invierno, cuándo el equipo
                  da señales de falla antes de que el sistema lo registre. Ese conocimiento se va con él
                  y el reemplazo tarda mínimo 18 meses en adquirirlo.
                </p>
                <p>
                  La causa de salida que más escucho en las entrevistas de egreso no es el sueldo —
                  es el régimen de turno. El <strong className="text-white">7×7 en faena remota</strong> es
                  sostenible económicamente pero desgastante personalmente. Los trabajadores que salen
                  en el año 3–4 no se van porque les pagan menos: se van porque priorizan estar con
                  su familia. Las empresas que ofrecen alguna flexibilidad — rotación de turno,
                  traslado pagado más frecuente, días adicionales — retienen más sin subir sueldos.
                  Es la palanca más subestimada del sector.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
