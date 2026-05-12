"use client";

import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  Building2, TrendingDown, TrendingUp, AlertCircle,
  CircleDollarSign, Zap, Users, Clock, Activity,
  Brain, ChartNoAxesCombined,
} from "lucide-react";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmtM(n: number) {
  return `$${(n / 1_000_000).toFixed(0)}M`;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EMPRESA = {
  nombre: "Clínica Regional Modelo",
  empleados: 210,
  camas: 85,
  sector: "Salud privada",
  region: "Región Metropolitana",
  rotacionActual: 27,
  rotacionObjetivo: 11,
};

// Costo de reposición = % del sueldo anual (reclutamiento + onboarding + curva de aprendizaje)
// Fuente: benchmarks de rotación hospitalaria LATAM
const ROLES = [
  {
    rol: "Médico General",
    n: 12,
    rotaciones: 3,
    costoUnitario: 54_720_000, // 120% sueldo anual ($3.8M × 12 × 1.20)
    costoTotal: 164_160_000,
    color: "#ef4444",
  },
  {
    rol: "Enfermera/o",
    n: 45,
    rotaciones: 13,
    costoUnitario: 14_400_000, // 75% sueldo anual ($1.6M × 12 × 0.75)
    costoTotal: 187_200_000,
    color: "#f97316",
  },
  {
    rol: "TENS",
    n: 30,
    rotaciones: 9,
    costoUnitario: 4_500_000, // 50% sueldo anual ($750k × 12 × 0.50)
    costoTotal: 40_500_000,
    color: "#f59e0b",
  },
  {
    rol: "Kinesiólogo/a",
    n: 8,
    rotaciones: 2,
    costoUnitario: 11_760_000, // 70% sueldo anual ($1.4M × 12 × 0.70)
    costoTotal: 23_520_000,
    color: "#eab308",
  },
];

const COSTO_ACTUAL    = 415_380_000;
const COSTO_OBJETIVO  = 151_980_000;
const AHORRO_ANUAL    = COSTO_ACTUAL - COSTO_OBJETIVO;
const ROI_PLAN        = 4.2; // por cada $1 invertido en retención

const barData = ROLES.map((r) => ({ rol: r.rol, costo: r.costoTotal / 1_000_000, color: r.color }));

const comparativoData = [
  { label: "Costo actual",          valor: COSTO_ACTUAL   / 1_000_000, color: "#ef4444" },
  { label: "Con plan de retención", valor: COSTO_OBJETIVO / 1_000_000, color: "#0F7B6C" },
];

const EFICIENCIA = [
  {
    icon: Users,
    titulo: "Equivalente en FTE perdidos",
    valor: "9.3",
    unidad: "FTE-meses/año",
    desc: "Capacidad clínica equivalente a casi un equipo completo operando en vacío por todo el año, entre vacantes y curvas de aprendizaje.",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: Clock,
    titulo: "Aumento en horas extra",
    valor: "+21%",
    unidad: "overtime promedio",
    desc: "El equipo restante cubre las vacantes con horas adicionales. A largo plazo esto genera burn-out en cadena, acelerando nuevas rotaciones.",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: Activity,
    titulo: "Atenciones no realizadas",
    valor: "~180",
    unidad: "consultas/mes en peak",
    desc: "Durante los meses de mayor rotación, la capacidad de atención cae entre 12–18%, afectando directamente los ingresos operacionales de la clínica.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

// ─── Tooltip barras ──────────────────────────────────────────────────────────

function TooltipBarra({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-1">{label}</p>
      <p className="text-on-surface">${payload[0].value.toFixed(0)}M CLP</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CasoPractico() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase">
              Caso práctico
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <AlertCircle size={11} /> Empresa simulada — fines ilustrativos
            </span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">
            ¿Cuánto le cuesta la rotación a una clínica tipo?
          </h2>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Simulación basada en una clínica privada de tamaño medio en la Región Metropolitana,
            con perfil de dotación y niveles de rotación representativos del sector salud chileno.
          </p>
        </div>

        {/* Perfil empresa */}
        <div className="bg-white rounded-lg border border-outline-variant/30 p-5 mb-10 flex flex-wrap items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-primary text-lg">{EMPRESA.nombre}</p>
            <p className="text-xs text-on-surface-variant">{EMPRESA.sector} · {EMPRESA.region}</p>
          </div>
          <div className="flex flex-wrap gap-4 ml-auto text-center">
            {[
              { label: "Empleados", valor: EMPRESA.empleados },
              { label: "Camas",     valor: EMPRESA.camas     },
              { label: "Rotación actual", valor: `${EMPRESA.rotacionActual}%` },
              { label: "Objetivo rotación", valor: `${EMPRESA.rotacionObjetivo}%` },
            ].map((s) => (
              <div key={s.label} className="min-w-[72px]">
                <p className="text-xl font-bold text-primary">{s.valor}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            {
              icon: CircleDollarSign,
              label: "Costo anual por rotación",
              valor: fmtM(COSTO_ACTUAL),
              sub: "27 rotaciones · 4 roles clínicos",
              color: "text-red-500",
              bg: "bg-red-50",
              border: "border-red-100",
            },
            {
              icon: TrendingDown,
              label: "Costo con rotación controlada",
              valor: fmtM(COSTO_OBJETIVO),
              sub: "bajando al 11% anual",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: TrendingUp,
              label: "Ahorro potencial anual",
              valor: fmtM(AHORRO_ANUAL),
              sub: `ROI ${ROI_PLAN}x por peso invertido en retención`,
              color: "text-primary",
              bg: "bg-secondary-container/30",
              border: "border-secondary-container/50",
            },
          ].map((k, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border ${k.bg} ${k.border}`}
            >
              <k.icon size={20} className={`${k.color} mb-3`} />
              <p className={`text-3xl font-bold ${k.color}`}>{k.valor}</p>
              <p className="text-xs font-semibold text-on-surface mt-1">{k.label}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{k.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Gráficos: costo por rol + comparativo */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14">

          {/* Costo por rol */}
          <div className="bg-white rounded-lg p-6 border border-outline-variant/30">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Desglose por cargo</p>
            <h3 className="text-base font-bold text-primary mb-5">Costo de rotación anual (millones CLP)</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} tickFormatter={(v: number) => `$${v}M`} />
                  <YAxis type="category" dataKey="rol" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} width={110} />
                  <Tooltip content={<TooltipBarra />} cursor={{ fill: "#efedf0", opacity: 0.5 }} />
                  <Bar dataKey="costo" radius={[0, 6, 6, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Tabla resumen */}
            <div className="mt-4 divide-y divide-outline-variant/20 text-xs">
              {ROLES.map((r) => (
                <div key={r.rol} className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">{r.rol} ({r.n} personas)</span>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant">{r.rotaciones} rot./año</span>
                    <span className="font-bold text-primary">{fmtM(r.costoTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparativo actual vs objetivo */}
          <div className="bg-white rounded-lg p-6 border border-outline-variant/30 flex flex-col">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Escenario comparativo</p>
            <h3 className="text-base font-bold text-primary mb-5">Actual vs. con plan de retención</h3>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativoData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} tickFormatter={(v: number) => `$${v}M`} width={52} />
                  <Tooltip content={<TooltipBarra />} cursor={{ fill: "#efedf0", opacity: 0.4 }} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {comparativoData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ahorro highlight */}
            <div className="mt-auto pt-5 border-t border-outline-variant/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-on-surface-variant">Ahorro anual proyectado</span>
                <span className="text-2xl font-bold text-emerald-600">{fmtM(AHORRO_ANUAL)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">ROI estimado del plan</span>
                <span className="text-2xl font-bold text-primary">{ROI_PLAN}x</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed">
                Por cada peso invertido en medidas de retención (bandas, plan de carrera, bienestar),
                se recuperan {ROI_PLAN} pesos en costos de rotación evitados.
              </p>
            </div>
          </div>
        </div>

        {/* Eficiencia y capacidad operativa */}
        <div className="mb-14">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Impacto operacional</p>
          <h3 className="text-xl font-bold text-primary mb-6">Eficiencia y capacidad perdida</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {EFICIENCIA.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border ${e.bg} ${e.border}`}
              >
                <e.icon size={20} className={`${e.color} mb-3`} />
                <p className={`text-3xl font-bold ${e.color} mb-1`}>{e.valor}</p>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">{e.unidad}</p>
                <p className="text-xs font-semibold text-on-surface mb-2">{e.titulo}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Análisis profesional */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Análisis profesional</p>
            <span className="inline-flex items-center gap-1.5 bg-primary/8 border border-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Zap size={10} /> Generado por RemuneraLab AI
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Valentina — Data Analyst */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg border border-outline-variant/30 p-6 flex flex-col gap-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-on-primary font-bold text-sm shrink-0">
                  VR
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">Valentina Reyes</p>
                  <p className="text-xs text-on-surface-variant">Analista de Datos · 4 años en sector salud</p>
                </div>
                <ChartNoAxesCombined size={16} className="text-secondary ml-auto shrink-0" />
              </div>

              <div className="text-xs text-on-surface leading-relaxed space-y-3">
                <p>
                  Lo primero que salta del dato es la concentración del costo: tres rotaciones de médicos
                  generan <strong className="text-primary">el 39% del gasto total</strong>, con apenas 12 personas en el pool.
                  Estadísticamente eso es un outlier que cualquier modelo de retención debería atacar antes que nada.
                  Si logras llevar la rotación médica de 3 a 1 por año, recuperas cerca de <strong className="text-primary">$110M CLP</strong> sin
                  tocar el resto del equipo.
                </p>
                <p>
                  El segundo patrón que me llama la atención es el TENS: nueve rotaciones al año en un equipo de 30
                  personas es un <strong className="text-primary">30% de rotación anual</strong>, muy por encima del benchmark sectorial.
                  El costo unitario es bajo, pero la acumulación hace daño. Y lo que no aparece en estos
                  números es el efecto cascada: cuando sale un TENS, la carga cae en enfermería, y eso
                  acelera las salidas del siguiente eslabón.
                </p>
                <p>
                  Si tuviera que priorizar una intervención con criterio de retorno, elegiría atacar primero
                  la brecha de los médicos con un diferencial de retención concreto, y en paralelo publicar
                  bandas para TENS y auxiliares. Son las dos palancas con mejor ROI en el corto plazo.
                </p>
              </div>
            </motion.div>

            {/* Rodrigo — HR Specialist */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-outline-variant/30 p-6 flex flex-col gap-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-sm shrink-0">
                  RM
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">Rodrigo Mora</p>
                  <p className="text-xs text-on-surface-variant">Especialista en Gestión de Personas · 8 años en salud</p>
                </div>
                <Users size={16} className="text-primary ml-auto shrink-0" />
              </div>

              <div className="text-xs text-on-surface leading-relaxed space-y-3">
                <p>
                  Los números son importantes, pero lo que realmente me preocupa acá no es solo el costo
                  económico. Un 27% de rotación en un equipo clínico me dice que el
                  <strong className="text-primary"> contrato psicológico está roto</strong>. La gente no se va porque encontró
                  algo mejor de un día para otro — se va porque lleva meses sintiéndose
                  prescindible, sin visibilidad de a dónde va su carrera y sin entender
                  si lo que gana es justo o no.
                </p>
                <p>
                  El dato del 81% de TENS que no conoce su banda salarial es el más
                  revelador de todos. No es un problema de sueldo, es un problema
                  de <strong className="text-primary">transparencia y confianza institucional</strong>. Cuando alguien no sabe
                  qué puede aspirar a ganar dentro de su propia organización, empieza a
                  mirar afuera por defecto. Y en salud, afuera tiene muchas opciones.
                </p>
                <p>
                  Mi recomendación prioritaria sería empezar por las conversaciones, no
                  por los ajustes de sueldo. Un líder de equipo que sabe hablar de
                  compensación con su gente retiene más que un aumento mal comunicado.
                  Después viene el resto: las bandas, el plan de carrera, los beneficios.
                  Pero sin el vínculo humano, la retención dura un ciclo de evaluación.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
