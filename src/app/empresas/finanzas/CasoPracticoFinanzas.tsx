"use client";

import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  Building2, TrendingDown, TrendingUp, AlertCircle,
  CircleDollarSign, Users, Clock, Activity,
  ChartNoAxesCombined, Zap,
} from "lucide-react";

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

const EMPRESA = {
  nombre: "Banco Comercial Modelo",
  empleados: 320,
  sucursales: 12,
  sector: "Banca privada",
  region: "Región Metropolitana",
  rotacionActual: 19,
  rotacionObjetivo: 8,
};

const ROLES = [
  {
    rol: "Gerentes de Área",
    n: 18,
    rotaciones: 3,
    costoUnitario: 61_200_000,
    costoTotal: 183_600_000,
    color: "#ef4444",
  },
  {
    rol: "Analistas Senior",
    n: 65,
    rotaciones: 12,
    costoUnitario: 16_800_000,
    costoTotal: 201_600_000,
    color: "#f97316",
  },
  {
    rol: "Ejecutivos Comerciales",
    n: 120,
    rotaciones: 22,
    costoUnitario: 7_920_000,
    costoTotal: 174_240_000,
    color: "#f59e0b",
  },
  {
    rol: "Back Office / Admin",
    n: 70,
    rotaciones: 13,
    costoUnitario: 4_200_000,
    costoTotal: 54_600_000,
    color: "#eab308",
  },
];

const COSTO_ACTUAL   = 614_040_000;
const COSTO_OBJETIVO = 252_000_000;
const AHORRO_ANUAL   = COSTO_ACTUAL - COSTO_OBJETIVO;
const ROI_PLAN       = 3.8;

const barData  = ROLES.map((r) => ({ rol: r.rol, costo: r.costoTotal / 1_000_000, color: r.color }));
const cmpData  = [
  { label: "Costo actual",        valor: COSTO_ACTUAL   / 1_000_000, color: "#ef4444" },
  { label: "Con plan retención",  valor: COSTO_OBJETIVO / 1_000_000, color: "#0F7B6C" },
];

const EFICIENCIA = [
  {
    icon: Users,
    titulo: "Equivalente FTE perdidos",
    valor: "7.1",
    unidad: "FTE-meses/año",
    desc: "Tiempo de vacante + rampa de aprendizaje equivale a 7 personas operando al 0% durante un año completo.",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: Clock,
    titulo: "Pérdida de cartera en transición",
    valor: "$890.000.000",
    unidad: "CLP riesgo cartera",
    desc: "Cada ejecutivo comercial que sale lleva relaciones de clientes valoradas en $40.000.000 en promedio. En 22 rotaciones, el riesgo de migración es material.",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  {
    icon: Activity,
    titulo: "Tiempo promedio de vacante",
    valor: "4.8",
    unidad: "meses por cargo",
    desc: "En roles financieros especializados, la búsqueda y selección toma casi 5 meses. En traders y analistas de riesgo, puede superar los 7 meses.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

function TooltipBarra({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/30 p-3 text-xs">
      <p className="font-bold text-primary mb-1">{label}</p>
      <p>{fmtCLP(payload[0].value * 1_000_000)}</p>
    </div>
  );
}

export default function CasoPracticoFinanzas() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-bold text-secondary tracking-[0.2em] uppercase">
              Caso práctico
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              <AlertCircle size={11} /> Empresa simulada — fines ilustrativos
            </span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            ¿Cuánto le cuesta la rotación a un banco tipo?
          </h2>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Simulación para un banco privado de tamaño medio con presencia en Región Metropolitana.
            En banca, la rotación es menos frecuente que en salud, pero el costo por evento es
            significativamente mayor — especialmente en roles con cartera de clientes.
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
          <div className="flex flex-wrap gap-5 ml-auto text-center">
            {[
              { label: "Empleados",       valor: EMPRESA.empleados       },
              { label: "Sucursales",      valor: EMPRESA.sucursales      },
              { label: "Rotación actual", valor: `${EMPRESA.rotacionActual}%` },
              { label: "Objetivo",        valor: `${EMPRESA.rotacionObjetivo}%`  },
            ].map((s) => (
              <div key={s.label} className="min-w-[72px]">
                <p className="text-xl font-bold text-primary">{s.valor}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: CircleDollarSign, label: "Costo anual rotación",         valor: fmtCLP(COSTO_ACTUAL),   sub: "50 rotaciones · 4 categorías", color: "text-red-500", bg: "bg-red-50 border-red-100" },
            { icon: TrendingDown,     label: "Con plan de retención (8%)",   valor: fmtCLP(COSTO_OBJETIVO), sub: "estimación año 1",             color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
            { icon: TrendingUp,       label: "Ahorro potencial anual",       valor: fmtCLP(AHORRO_ANUAL),   sub: `ROI ${ROI_PLAN}x sobre inversión`, color: "text-primary", bg: "bg-secondary-container/30 border-secondary-container/50" },
          ].map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border ${k.bg}`}>
              <k.icon size={20} className={`${k.color} mb-3`} />
              <p className={`text-3xl font-bold ${k.color}`}>{k.valor}</p>
              <p className="text-xs font-semibold text-on-surface mt-1">{k.label}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">{k.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          <div className="bg-white rounded-lg p-6 border border-outline-variant/30">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Desglose por categoría</p>
            <h3 className="text-base font-bold text-primary mb-5">Costo de rotación anual (millones CLP)</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} tickFormatter={(v: number) => `$${v}M`} />
                  <YAxis type="category" dataKey="rol" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} width={140} />
                  <Tooltip content={<TooltipBarra />} cursor={{ fill: "#efedf0", opacity: 0.5 }} />
                  <Bar dataKey="costo" radius={[0, 6, 6, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 divide-y divide-outline-variant/20 text-xs">
              {ROLES.map((r) => (
                <div key={r.rol} className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant">{r.rol} ({r.n})</span>
                  <div className="flex gap-4">
                    <span className="text-on-surface-variant">{r.rotaciones} rot./año</span>
                    <span className="font-bold text-primary">{fmtCLP(r.costoTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-outline-variant/30 flex flex-col">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Escenario comparativo</p>
            <h3 className="text-base font-bold text-primary mb-5">Actual vs. plan de retención</h3>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cmpData} margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={48}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#c3c6ce" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#43474d" }} tickFormatter={(v: number) => `$${v}M`} width={52} />
                  <Tooltip content={<TooltipBarra />} cursor={{ fill: "#efedf0", opacity: 0.4 }} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {cmpData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-auto pt-4 border-t border-outline-variant/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Ahorro anual proyectado</span>
                <span className="text-2xl font-bold text-emerald-600">{fmtCLP(AHORRO_ANUAL)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">ROI del plan</span>
                <span className="text-2xl font-bold text-primary">{ROI_PLAN}x</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
                En banca, el costo de reposición por cargo senior supera el 90% del sueldo anual.
                Retener a un gerente con un ajuste de $300.000/mes es {ROI_PLAN} veces más barato que reemplazarlo.
              </p>
            </div>
          </div>
        </div>

        {/* Eficiencia */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-primary mb-6">Impacto operacional específico de banca</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {EFICIENCIA.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border ${e.bg} ${e.border}`}>
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

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-lg border border-outline-variant/30 p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-on-primary font-bold text-sm shrink-0">CP</div>
                <div>
                  <p className="font-bold text-primary text-sm">Catalina Pérez</p>
                  <p className="text-xs text-on-surface-variant">Analista de Datos · 5 años en sector financiero</p>
                </div>
                <ChartNoAxesCombined size={16} className="text-secondary ml-auto shrink-0" />
              </div>
              <div className="text-xs text-on-surface leading-relaxed space-y-3">
                <p>
                  Lo que más me llama la atención es la relación entre rotación de ejecutivos comerciales
                  y riesgo de cartera. En banca, cuando alguien se va, no se lleva solo el
                  conocimiento del producto —<strong className="text-primary"> se lleva la relación con el cliente</strong>.
                  Hemos visto en estudios de mercado LATAM que entre el 18% y 25% de la cartera de un
                  ejecutivo migra al banco destino dentro de los primeros 6 meses. En este banco,
                  22 rotaciones de ejecutivos comerciales representan un riesgo de cartera de ~$890.000.000 CLP.
                </p>
                <p>
                  El segundo dato relevante es la concentración de costo en gerentes:
                  solo 3 rotaciones generan el 30% del gasto total. El patrón estadístico
                  es claro — <strong className="text-primary">el costo de rotación no es lineal con el nivel jerárquico,
                  es exponencial</strong>. Un gerente cuesta 15 veces más de reemplazar que un analista junior.
                  Ahí está el ROI más alto de cualquier plan de retención.
                </p>
                <p>
                  Para el análisis de género que viene más abajo: la brecha en compensación variable
                  no es solo un problema ético — es una señal estadística de que los criterios de
                  asignación de bonos tienen sesgos sistemáticos no declarados. Eso es litigación esperando a ocurrir.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-outline-variant/30 p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold text-sm shrink-0">MS</div>
                <div>
                  <p className="font-bold text-primary text-sm">Matías Silva</p>
                  <p className="text-xs text-on-surface-variant">Especialista Gestión de Personas · 9 años en banca</p>
                </div>
                <Users size={16} className="text-primary ml-auto shrink-0" />
              </div>
              <div className="text-xs text-on-surface leading-relaxed space-y-3">
                <p>
                  En banca el problema de retención tiene una capa que no aparece en los números:
                  <strong className="text-primary"> la cultura del silencio salarial</strong>. Durante años, los bancos han
                  operado bajo la norma no escrita de que hablar de sueldos es inapropiado.
                  El resultado es que el 69% de los analistas no sabe si está bien pagado,
                  y esa incertidumbre los hace permeable a cualquier llamado de un headhunter.
                </p>
                <p>
                  Lo que veo con más frecuencia en mis proyectos: el banco pierde a un analista
                  de 4 años de antigüedad que se va por $200.000 más al mes a la competencia.
                  Cuando hacemos la entrevista de salida, el 80% de las veces la persona
                  habría aceptado quedarse con $150.000 de ajuste si alguien se lo hubiera ofrecido
                  antes de que firmara en otro lado. <strong className="text-primary">El costo de no hablar es siempre
                  mayor que el costo de la conversación.</strong>
                </p>
                <p>
                  Y sobre la Ley de Transparencia que viene: los bancos que empiecen a construir
                  su estructura de bandas ahora, de forma proactiva, van a tener una ventaja
                  competitiva enorme para atraer talento femenino. Ya hay evidencia en Europa
                  de que la transparencia salarial actúa como señal de marca empleadora.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
