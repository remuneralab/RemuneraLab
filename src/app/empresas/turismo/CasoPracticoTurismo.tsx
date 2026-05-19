"use client";

import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  Building2, TrendingDown, TrendingUp, AlertCircle,
  CircleDollarSign, Users, Clock, Star,
  ChartNoAxesCombined, Zap,
} from "lucide-react";

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n);
}

const EMPRESA = {
  nombre: "Hotel de Cadena 4★ Modelo",
  empleados: 180,
  sector: "Hotelería urbana 4 estrellas",
  region: "Santiago, Región Metropolitana",
  rotacionActual: 52,
  rotacionObjetivo: 22,
};

const ROLES = [
  { rol: "Camareras de piso",     n: 45, rotaciones: 23, costoUnitario: 1_320_000, costoTotal: 30_360_000, color: "#ef4444" },
  { rol: "Garzones / Bartenders", n: 38, rotaciones: 20, costoUnitario: 1_850_000, costoTotal: 37_000_000, color: "#f97316" },
  { rol: "Recepcionistas",        n: 26, rotaciones: 13, costoUnitario: 2_100_000, costoTotal: 27_300_000, color: "#f59e0b" },
  { rol: "Personal de cocina",    n: 32, rotaciones: 16, costoUnitario: 1_650_000, costoTotal: 26_400_000, color: "#eab308" },
];

const COSTO_ACTUAL   = 121_060_000;
const COSTO_OBJETIVO =  51_600_000;
const AHORRO_ANUAL   = COSTO_ACTUAL - COSTO_OBJETIVO;
const ROI_PLAN       = 2.8;

const barData = ROLES.map((r) => ({ rol: r.rol, costo: r.costoTotal / 1_000_000, color: r.color }));
const cmpData = [
  { label: "Costo actual",       valor: COSTO_ACTUAL   / 1_000_000, color: "#ef4444" },
  { label: "Con plan retención", valor: COSTO_OBJETIVO / 1_000_000, color: "#0F7B6C" },
];

const EFICIENCIA = [
  {
    icon: Clock,
    titulo: "Rotaciones se concentran en temporada alta",
    valor: "68%",
    unidad: "de salidas en meses peak",
    desc: "El 68% de las renuncias ocurre entre diciembre–marzo y julio–agosto — exactamente cuando la demanda es máxima. Una vacante en temporada alta cuesta el triple en urgencia de reclutamiento y fuerza a cubrir con personal sin experiencia en el cargo.",
    color: "text-red-400",
    bg: "bg-red-900/12",
    border: "border-red-500/20",
  },
  {
    icon: Star,
    titulo: "Caída en valoración de huéspedes",
    valor: "–0.4",
    unidad: "puntos en Google Reviews",
    desc: "Los hoteles con rotación anual >40% pierden en promedio 0.4 puntos en Google Reviews en 12 meses. Pasar de 4.6 a 4.2 estrellas se traduce directamente en un 12–15% menos de ocupación directa — un impacto invisible en el balance pero medible en la facturación.",
    color: "text-amber-400",
    bg: "bg-amber-900/12",
    border: "border-amber-500/20",
  },
  {
    icon: Users,
    titulo: "Caída en retorno de huéspedes frecuentes",
    valor: "–18%",
    unidad: "retorno huéspedes habituales",
    desc: "El personal de recepción y piso conoce los hábitos de los clientes frecuentes: preferencias de habitación, alergias, nombres. Cada rotación completa del equipo se correlaciona con una caída del 18% en huéspedes que vuelven — exactamente el segmento más rentable y de menor CAC.",
    color: "text-orange-400",
    bg: "bg-orange-900/12",
    border: "border-orange-500/20",
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
    <div style={tooltipStyle} className="p-3">
      <p className="font-bold text-[#00B4D8] mb-1">{label}</p>
      <p className="text-white">{fmtCLP(payload[0].value * 1_000_000)}</p>
    </div>
  );
}

export default function CasoPracticoTurismo() {
  return (
    <section className="py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[#00B4D8] uppercase tracking-[0.3em]"
              style={{ fontFamily: "Space Mono, monospace", fontSize: "0.62rem", fontWeight: 700 }}>
              Caso práctico
            </span>
            <span className="inline-flex items-center gap-1.5 bg-amber-900/15 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase px-3 py-1 rounded-full">
              <AlertCircle size={11} /> Empresa simulada — fines ilustrativos
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¿Cuánto cuesta la rotación en un hotel tipo?
          </h2>
          <p className="text-sm text-white/45 max-w-2xl">
            Simulación para un hotel de cadena 4 estrellas en Santiago. En turismo, el costo
            de rotación es subestimado: se ve como "gente que entra y sale", pero el impacto real
            incluye reclutamiento urgente en temporada alta, caída en reviews y pérdida de
            conocimiento de cliente frecuente.
          </p>
        </div>

        {/* Perfil empresa */}
        <div className="rounded-xl border border-white/10 bg-white/4 p-5 mb-10 flex flex-wrap items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-[#00B4D8]" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">{EMPRESA.nombre}</p>
            <p className="text-xs text-white/45">{EMPRESA.sector} · {EMPRESA.region}</p>
          </div>
          <div className="flex flex-wrap gap-5 ml-auto text-center">
            {[
              { label: "Dotación",        valor: EMPRESA.empleados              },
              { label: "Rotación actual", valor: `${EMPRESA.rotacionActual}%`   },
              { label: "Objetivo",        valor: `${EMPRESA.rotacionObjetivo}%` },
              { label: "Temporadas",      valor: "2/año"                        },
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
            { icon: CircleDollarSign, label: "Costo anual rotación",        valor: fmtCLP(COSTO_ACTUAL),   sub: "72 rotaciones · 4 categorías",   color: "text-red-400",     bg: "bg-red-900/12",   border: "border-red-500/20"        },
            { icon: TrendingDown,     label: "Con plan de retención (22%)", valor: fmtCLP(COSTO_OBJETIVO), sub: "estimación año 1",                color: "text-[#06D6A0]",   bg: "bg-emerald-900/12", border: "border-emerald-500/20"    },
            { icon: TrendingUp,       label: "Ahorro potencial anual",      valor: fmtCLP(AHORRO_ANUAL),   sub: `ROI ${ROI_PLAN}x sobre inversión`,color: "text-white",       bg: "bg-[#00B4D8]/5",  border: "border-[#00B4D8]/15"      },
          ].map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 border ${k.bg} ${k.border}`}>
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
            <p className="text-xs font-bold text-white/45 uppercase tracking-wider mb-1">Desglose por área</p>
            <h3 className="text-base font-bold text-white mb-5">Costo de rotación anual (millones CLP)</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} tickFormatter={(v: number) => `$${v}M`} />
                  <YAxis type="category" dataKey="rol" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }} width={150} />
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
            <p className="text-xs font-bold text-white/45 uppercase tracking-wider mb-1">Escenario comparativo</p>
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
                En hotelería el costo por rotación incluye publicación de aviso, entrevistas, capacitación
                estándar de marca, uniformes y 4–6 semanas de curva hasta alcanzar el estándar de servicio del hotel.
                Retener con un ajuste de $120.000/mes es {ROI_PLAN} veces más barato que reemplazar.
              </p>
            </div>
          </div>
        </div>

        {/* Impacto específico hotelería */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-white mb-6">Impacto específico del sector turismo</h3>
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
            <p className="text-xs font-bold text-white/45 uppercase tracking-wider">Análisis profesional</p>
            <span className="inline-flex items-center gap-1.5 bg-[#00B4D8]/5 border border-[#00B4D8]/15 text-[#00B4D8] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              <Zap size={10} /> Generado por RemuneraLab AI
            </span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#00B4D8] flex items-center justify-center text-[#0D2240] font-bold text-sm shrink-0">VR</div>
                <div>
                  <p className="font-bold text-white text-sm">Valentina Rojas</p>
                  <p className="text-xs text-white/45">Analista Customer Experience · 8 años en hotelería</p>
                </div>
                <ChartNoAxesCombined size={16} className="text-[#00B4D8] ml-auto shrink-0" />
              </div>
              <div className="text-xs text-white/45 leading-relaxed space-y-3">
                <p>
                  Lo que primero sorprende en este dato es que los garzones y bartenders representan
                  el 31% de la dotación pero el <strong className="text-white">31% del costo de rotación</strong>
                  — están perfectamente sobrerrepresentados. Eso no es casualidad: su umbral de salida
                  es bajísimo. Con un celular pueden publicar disponibilidad en grupos de empleo gastronómico
                  y tener dos ofertas al día siguiente. La competencia no es otro hotel — es cualquier
                  restaurante a la vuelta del hotel que paga lo mismo pero con mejor ambiente laboral.
                </p>
                <p>
                  El segundo patrón crítico es la temporada. Los datos muestran que el 68% de las
                  renuncias se acumula en los meses de alta demanda. La consecuencia es una
                  <strong className="text-white"> paradoja de servicio</strong>: el hotel está más lleno y
                  al mismo tiempo tiene menos personal experimentado. La caída en reviews no es
                  coincidencia — es el resultado directo de poner personal en período de prueba
                  frente a la mayor concentración de huéspedes del año.
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/4 p-6 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold text-sm shrink-0">RP</div>
                <div>
                  <p className="font-bold text-white text-sm">Rodrigo Pizarro</p>
                  <p className="text-xs text-white/45">Especialista RRHH · ex-Marriott Chile · 11 años en cadenas</p>
                </div>
                <Users size={16} className="text-white/45 ml-auto shrink-0" />
              </div>
              <div className="text-xs text-white/45 leading-relaxed space-y-3">
                <p>
                  En cadenas internacionales hay un fenómeno que los independientes no ven:
                  <strong className="text-white"> las camareras de piso no se van por el sueldo</strong>.
                  Se van porque nadie les dijo que tenían posibilidades de avanzar. El mismo trabajo
                  que se ve como el fondo de la pirámide tiene roles de supervisora, jefa de piso,
                  ama de llaves, gerenta de housekeeping. Pero si esa escalera no está escrita y
                  comunicada, la trabajadora asume que no existe. El costo de publicar un plan de
                  carrera es cero. El costo de no publicarlo es el mayor componente de rotación evitable.
                </p>
                <p>
                  El otro factor invisible es la <strong className="text-white">Ley 20.803 de propinas</strong>.
                  Los hoteles que distribuyeron las propinas correctamente y lo comunicaron a sus trabajadores
                  reportan una caída inmediata en la intención de búsqueda de empleo.
                  La razón es simple: cuando el trabajador ve en su liquidación que sus propinas fueron
                  $187.000 ese mes — dinero que antes se diluía — su percepción de la remuneración
                  total cambia. Es el beneficio con mejor ratio impacto/costo que existe en el sector.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}
