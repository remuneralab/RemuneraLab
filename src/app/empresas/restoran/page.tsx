"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, ReferenceLine,
} from "recharts";
import {
  Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, TrendingUp,
  TrendingDown, Users, ArrowRight, ChevronDown, ChevronUp,
  CircleDollarSign, RotateCcw, Shield,
} from "lucide-react";

// ─── Contraseña ───────────────────────────────────────────────────────────────
const DEMO_PASSWORD = "123456789";
const STORAGE_KEY   = "rl_restoran_auth";

// ─── Constantes empresa ───────────────────────────────────────────────────────
const EMPRESA   = "Restaurante — Demo · Viña del Mar";
const SECTOR    = "Gastronomía · Turismo y Hotelería";
const REGION    = "Valparaíso";
const FECHA     = "17 de mayo de 2026";
const E         = [0.16, 1, 0.3, 1] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}
function fmtM(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}
function fmtAxis(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}k`;
}

// ─── M01 — Benchmark salarial ─────────────────────────────────────────────────
type BRow = { cargo: string; p25: number; p50: number; p75: number; empresa: number; percentil: number; estado: "Óptimo" | "Alerta" | "Riesgo"; n: number };

const BENCHMARK: BRow[] = [
  { cargo: "Chef Ejecutivo",       p25: 1_850_000, p50: 2_100_000, p75: 2_800_000, empresa: 2_321_000, percentil: 70, estado: "Óptimo",  n: 1 },
  { cargo: "Sous Chef",            p25: 1_200_000, p50: 1_450_000, p75: 1_900_000, empresa: 1_546_000, percentil: 63, estado: "Óptimo",  n: 1 },
  { cargo: "Cocinero de Partida",  p25:   750_000, p50:   900_000, p75: 1_100_000, empresa:   938_000, percentil: 55, estado: "Alerta",  n: 3 },
  { cargo: "Ayudante de Cocina",   p25:   560_000, p50:   650_000, p75:   780_000, empresa:   587_000, percentil: 32, estado: "Riesgo",  n: 2 },
  { cargo: "Jefe de Sala",         p25:   900_000, p50: 1_050_000, p75: 1_350_000, empresa: 1_113_000, percentil: 61, estado: "Óptimo",  n: 1 },
  { cargo: "Garzón/a Senior",      p25:   610_000, p50:   720_000, p75:   870_000, empresa:   710_000, percentil: 47, estado: "Alerta",  n: 4 },
  { cargo: "Bartender",            p25:   640_000, p50:   760_000, p75:   920_000, empresa:   749_000, percentil: 47, estado: "Alerta",  n: 2 },
  { cargo: "Administrador/a",      p25:   950_000, p50: 1_150_000, p75: 1_450_000, empresa: 1_124_000, percentil: 47, estado: "Alerta",  n: 1 },
  { cargo: "Cajero/a",             p25:   620_000, p50:   730_000, p75:   870_000, empresa:   769_000, percentil: 58, estado: "Óptimo",  n: 1 },
  { cargo: "Encargado de Bodega",  p25:   600_000, p50:   700_000, p75:   850_000, empresa:   644_000, percentil: 38, estado: "Riesgo",  n: 1 },
  { cargo: "Auxiliar de Limpieza", p25:   539_000, p50:   580_000, p75:   690_000, empresa:   555_000, percentil: 27, estado: "Riesgo",  n: 2 },
  { cargo: "Recepcionista",        p25:   620_000, p50:   730_000, p75:   890_000, empresa:   706_000, percentil: 45, estado: "Alerta",  n: 1 },
];

// ─── M02 — Dotación mensual ───────────────────────────────────────────────────
const DOTACION = [
  { mes: "Ene", total: 32, nucleo: 20, variable: 12, masaBase: 24_922_000, costoEmpl: 42_826_000 },
  { mes: "Feb", total: 30, nucleo: 20, variable: 10, masaBase: 23_659_000, costoEmpl: 39_658_400 },
  { mes: "Mar", total: 26, nucleo: 20, variable:  6, masaBase: 21_504_000, costoEmpl: 33_890_800 },
  { mes: "Abr", total: 23, nucleo: 20, variable:  3, masaBase: 19_622_000, costoEmpl: 30_152_400 },
  { mes: "May", total: 22, nucleo: 20, variable:  2, masaBase: 18_952_000, costoEmpl: 28_878_200 },
  { mes: "Jun", total: 22, nucleo: 20, variable:  2, masaBase: 18_952_000, costoEmpl: 28_878_200 },
  { mes: "Jul", total: 30, nucleo: 20, variable: 10, masaBase: 24_327_000, costoEmpl: 40_936_200 },
  { mes: "Ago", total: 25, nucleo: 20, variable:  5, masaBase: 21_346_000, costoEmpl: 33_181_600 },
  { mes: "Sep", total: 22, nucleo: 20, variable:  2, masaBase: 19_520_000, costoEmpl: 29_722_200 },
  { mes: "Oct", total: 22, nucleo: 20, variable:  2, masaBase: 19_520_000, costoEmpl: 29_543_400 },
  { mes: "Nov", total: 23, nucleo: 20, variable:  3, masaBase: 20_084_000, costoEmpl: 30_867_000 },
  { mes: "Dic", total: 28, nucleo: 20, variable:  8, masaBase: 23_047_000, costoEmpl: 37_384_200 },
];

// ─── M03 — Riesgo de rotación por empleado del núcleo ────────────────────────
type RiesgoRow = {
  nombre: string; cargo: string; area: string; sexo: "M" | "F"; contrato: string;
  jornada: number; experiencia: number; salario: number; riesgo: number;
  factores: string[];
};

const NUCLEO: RiesgoRow[] = [
  { nombre: "Vicente A.",    cargo: "Chef Ejecutivo",      area: "Cocina", sexo: "M", contrato: "Indefinido", jornada: 44, experiencia: 13, salario: 2_321_000, riesgo: 12, factores: [] },
  { nombre: "Ignacio F.",    cargo: "Sous Chef",           area: "Cocina", sexo: "M", contrato: "Indefinido", jornada: 44, experiencia: 10, salario: 1_546_000, riesgo: 18, factores: [] },
  { nombre: "Catalina L.",   cargo: "Cocinero de Partida", area: "Cocina", sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  4, salario:   878_000, riesgo: 38, factores: ["Sueldo en borde mercado"] },
  { nombre: "Alejandro P.",  cargo: "Cocinero de Partida", area: "Cocina", sexo: "M", contrato: "Indefinido", jornada: 44, experiencia:  6, salario:   964_000, riesgo: 34, factores: ["Sueldo en borde mercado"] },
  { nombre: "Fernanda C.",   cargo: "Cocinero de Partida", area: "Cocina", sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  6, salario:   973_000, riesgo: 33, factores: ["Sueldo en borde mercado"] },
  { nombre: "Diego B.",      cargo: "Ayudante de Cocina",  area: "Cocina", sexo: "M", contrato: "Indefinido", jornada: 44, experiencia:  0, salario:   574_000, riesgo: 78, factores: ["Salario bajo mercado", "Sin experiencia — alta liquidez"] },
  { nombre: "Diego L.",      cargo: "Ayudante de Cocina",  area: "Cocina", sexo: "M", contrato: "Plazo fijo", jornada: 44, experiencia:  3, salario:   601_000, riesgo: 81, factores: ["Salario bajo mercado", "Núcleo en plazo fijo"] },
  { nombre: "Pilar L.",      cargo: "Jefe de Sala",        area: "Sala",   sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  3, salario: 1_113_000, riesgo: 22, factores: [] },
  { nombre: "Isidora M.",    cargo: "Garzón/a Senior",     area: "Sala",   sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  7, salario:   762_000, riesgo: 35, factores: ["Sueldo en borde mercado"] },
  { nombre: "Carlos A.",     cargo: "Garzón/a Senior",     area: "Sala",   sexo: "M", contrato: "Indefinido", jornada: 44, experiencia:  3, salario:   678_000, riesgo: 44, factores: ["Sueldo bajo mediana"] },
  { nombre: "Daniela R.",    cargo: "Garzón/a Senior",     area: "Sala",   sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  5, salario:   723_000, riesgo: 40, factores: ["Sueldo bajo mediana"] },
  { nombre: "Javier M.",     cargo: "Garzón/a Senior",     area: "Sala",   sexo: "M", contrato: "Indefinido", jornada: 44, experiencia:  6, salario:   674_000, riesgo: 45, factores: ["Sueldo bajo mediana"] },
  { nombre: "Francisco F.",  cargo: "Bartender",           area: "Sala",   sexo: "M", contrato: "Indefinido", jornada: 44, experiencia:  2, salario:   786_000, riesgo: 42, factores: ["Alta liquidez laboral bartenders"] },
  { nombre: "Constanza O.",  cargo: "Bartender",           area: "Sala",   sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  2, salario:   712_000, riesgo: 50, factores: ["Sueldo bajo mediana", "Alta liquidez laboral bartenders"] },
  { nombre: "Claudia B.",    cargo: "Administrador/a",     area: "Admin",  sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  4, salario: 1_124_000, riesgo: 28, factores: ["Sueldo en borde mercado"] },
  { nombre: "Bárbara V.",    cargo: "Cajero/a",            area: "Admin",  sexo: "F", contrato: "Indefinido", jornada: 44, experiencia:  6, salario:   769_000, riesgo: 20, factores: [] },
  { nombre: "Francisca O.",  cargo: "Encargado de Bodega", area: "Apoyo",  sexo: "F", contrato: "Plazo fijo", jornada: 44, experiencia:  0, salario:   644_000, riesgo: 65, factores: ["Núcleo en plazo fijo", "Bajo mercado"] },
  { nombre: "Fernanda F.",   cargo: "Auxiliar de Limpieza",area: "Apoyo",  sexo: "F", contrato: "Plazo fijo", jornada: 40, experiencia:  2, salario:   554_000, riesgo: 72, factores: ["Salario bajo mercado", "Jornada parcial", "Núcleo en plazo fijo"] },
  { nombre: "Vicente D.",    cargo: "Auxiliar de Limpieza",area: "Apoyo",  sexo: "M", contrato: "Plazo fijo", jornada: 40, experiencia:  2, salario:   557_000, riesgo: 71, factores: ["Salario bajo mercado", "Jornada parcial", "Núcleo en plazo fijo"] },
  { nombre: "Matías M.",     cargo: "Recepcionista",       area: "Sala",   sexo: "M", contrato: "Indefinido", jornada: 44, experiencia:  3, salario:   706_000, riesgo: 40, factores: ["Sueldo bajo mediana"] },
];

// ─── M04 NUEVO — Presión de mercado ──────────────────────────────────────────
const PRESION = [
  { cargo: "Garzón/a",           ciuo: "5131", avisos90d: 47, avisos90_180d: 32, pct: +46.9, nivel: "alta"  as const },
  { cargo: "Ayudante de Cocina", ciuo: "5120", avisos90d: 38, avisos90_180d: 31, pct: +22.6, nivel: "alta"  as const },
  { cargo: "Bartender",          ciuo: "5131", avisos90d: 23, avisos90_180d: 17, pct: +35.3, nivel: "alta"  as const },
  { cargo: "Chef / Cocinero",    ciuo: "3434", avisos90d: 19, avisos90_180d: 21, pct:  -9.5, nivel: "media" as const },
  { cargo: "Recepcionista",      ciuo: "4224", avisos90d: 15, avisos90_180d: 14, pct:  +7.1, nivel: "media" as const },
  { cargo: "Auxiliar Limpieza",  ciuo: "9112", avisos90d:  8, avisos90_180d: 11, pct: -27.3, nivel: "baja"  as const },
];

// ─── M04 NUEVO — Drift salarial ───────────────────────────────────────────────
const DRIFT = [
  { cargo: "Garzón/a",           med90d: 720_000, med90_180d: 690_000, pct: +4.3, empresa: 710_000 },
  { cargo: "Ayudante de Cocina", med90d: 660_000, med90_180d: 640_000, pct: +3.1, empresa: 587_000 },
  { cargo: "Bartender",          med90d: 790_000, med90_180d: 755_000, pct: +4.6, empresa: 749_000 },
  { cargo: "Chef / Cocinero",    med90d: 940_000, med90_180d: 890_000, pct: +5.6, empresa: 938_000 },
  { cargo: "Auxiliar Limpieza",  med90d: 570_000, med90_180d: 565_000, pct: +0.9, empresa: 555_000 },
];

// ─── M05 NUEVO — Costo rotación desglose ─────────────────────────────────────
type CostoRotRow = {
  categoria: string;
  salario_ref: number;
  aviso: number;
  seleccion: number;
  documentacion: number;
  vacante: number;
  curva_aprendizaje: number;
  trainer: number;
  total: number;
  factor_meses: number;
  n_salidas_estimadas: number;
};

const COSTO_ROT: CostoRotRow[] = [
  { categoria: "Ayudante de Cocina",  salario_ref: 587_000, aviso: 60_000, seleccion: 44_000, documentacion: 25_000, vacante: 165_000, curva_aprendizaje: 256_000, trainer: 72_000, total: 622_000,  factor_meses: 1.06, n_salidas_estimadas: 2 },
  { categoria: "Garzón/a Senior",     salario_ref: 710_000, aviso: 60_000, seleccion: 55_000, documentacion: 25_000, vacante: 200_000, curva_aprendizaje: 327_000, trainer: 90_000, total: 757_000,  factor_meses: 1.07, n_salidas_estimadas: 3 },
  { categoria: "Bartender",           salario_ref: 749_000, aviso: 60_000, seleccion: 65_000, documentacion: 25_000, vacante: 215_000, curva_aprendizaje: 345_000, trainer: 95_000, total: 805_000,  factor_meses: 1.07, n_salidas_estimadas: 1 },
  { categoria: "Auxiliar Limpieza",   salario_ref: 555_000, aviso: 40_000, seleccion: 30_000, documentacion: 20_000, vacante: 100_000, curva_aprendizaje: 150_000, trainer: 40_000, total: 380_000,  factor_meses: 0.68, n_salidas_estimadas: 2 },
  { categoria: "Otros cargos núcleo", salario_ref: 700_000, aviso: 60_000, seleccion: 50_000, documentacion: 25_000, vacante: 180_000, curva_aprendizaje: 250_000, trainer: 75_000, total: 640_000,  factor_meses: 0.91, n_salidas_estimadas: 1 },
];

// ─── M06 — ICL turismo / servicios ───────────────────────────────────────────
const ICL = { trimestre: "T1 2026", icl_sector: 4.1, icl_nac: 3.9, ir_sector: 3.7, ir_nac: 3.5, ipc: 4.0 };

// ─── M07 — Brecha de género ───────────────────────────────────────────────────
const BRECHA = [
  { nivel: "Jefaturas (Jefe Sala / Administrador)",    hombre: 1_124_000, mujer: 1_113_000, gap: 1.0  },
  { nivel: "Operativo calificado (Cocinero / Garzon)", hombre:   719_000, mujer:   789_000, gap: -8.9 },
  { nivel: "Operativo básico (Auxiliar / Ayudante)",   hombre:   576_000, mujer:   554_000, gap: 3.8  },
];
const GAP_POND = 1.4;

// ─── M08 — ENE Valparaíso ─────────────────────────────────────────────────────
const ENE_NAC       = 7.8;
const ENE_VALPO     = 7.2;
const ENE_TENDENCIA = -0.4;

// ─── Recomendaciones ──────────────────────────────────────────────────────────
const COSTOROTACION_REAL = 9_780_000;

const RECS = [
  {
    color:  "#dc2626", num: "01",
    titulo: "Convertir 4 contratos de núcleo de plazo fijo a indefinido",
    texto:  "Diego L. (Ayudante Cocina), Francisca O. (Bodega), Fernanda F. y Vicente D. (Auxiliares) están en el núcleo estable con contratos a plazo fijo. Esto genera inestabilidad percibida y riesgo de fuga sin liquidación: al vencer el plazo, se van sin costo para ellos. Convertirlos a indefinido estabiliza el equipo; el costo de formalización es cero si ya superan el período de prueba.",
    costo:  "Sin costo directo",
    evita:  "4 plazas críticas en riesgo inmediato",
    ganancia: "Retención núcleo +30%",
  },
  {
    color:  "#dc2626", num: "02",
    titulo: "Ajuste salarial urgente — Ayudantes de Cocina y Auxiliares de Limpieza",
    texto:  `Diego B. y Diego L. (Ayudantes Cocina) ganan $574k–$601k vs mediana de mercado $650k (−11%). Fernanda F. y Vicente D. (Auxiliares FTE) equivalen a $609k–$613k vs mediana $580k, pero en jornada 40h su percepción es de salario bajo. Riesgo de rotación 72–81/100 — los más altos del equipo. Un ajuste de +$50k/mes por persona cuesta $2.4M/año; reemplazar uno de estos cargos cuesta mínimo $650k en selección + capacitación.`,
    costo:  "$2.400.000/año (4 personas)",
    evita:  "Reposición $2.600.000+ c/u",
    ganancia: "Riesgo de 78/81 → estimado 45",
  },
  {
    color:  "#d97706", num: "03",
    titulo: "Reajuste julio +4% — contratos indefinidos del núcleo",
    texto:  `El EMRCL sector servicios marcó +${ICL.ir_sector}% en el último período. La nómina fija el reajuste de julio en +4% para contratos indefinidos. Esto implica un incremento de masa salarial de ~$560k/mes (núcleo 20 personas). No incorporarlo deteriora el poder adquisitivo, aumenta el riesgo de rotación en Garzones Seniors (riesgo 40–45/100) y expone a conflictos DT si hay expectativas no cumplidas.`,
    costo:  "$6.700.000/año adicionales",
    evita:  "Rotación voluntaria garzones",
    ganancia: "Cumplimiento + retención",
  },
  {
    color:  "#d97706", num: "04",
    titulo: "Contrato multi-temporada para mejores trabajadores variables",
    texto:  `El restaurante pierde cada temporada baja 12–14 trabajadores estacionales y debe recapacitar el 100% al siguiente peak. Un contrato multi-temporada con prioridad de llamada y bono de regreso de $150.000 retiene al 45% del personal variable. Aplicado a los 5 mejores (bartenders de temporada + garzones con ≥2 temporadas), el ahorro en capacitación supera los $2M anuales.`,
    costo:  "$750.000 bonos retorno",
    evita:  "Costo capacitación $2.1M/año",
    ganancia: "Retorno temporada +45%",
  },
  {
    color:  "#0284c7", num: "05",
    titulo: "Publicar bandas salariales por cargo — efecto retención sin costo",
    texto:  `El 84% del personal operativo no sabe si está bien pagado vs. el mercado. La opacidad es causa del 68% de renuncias: cuando no se sabe si se está bien pagado, cualquier oferta externa parece mejor. Publicar internamente las bandas por cargo — incluyendo el P50 de mercado — cuesta cero y tiene efecto inmediato en la intención de búsqueda. 4 garzones seniors con riesgo 40–45/100 se estabilizarían con esta medida.`,
    costo:  "Sin costo",
    evita:  "68% de renuncias por opacidad",
    ganancia: "Satisfacción laboral +24%",
  },
];

// ─── Tooltips ──────────────────────────────────────────────────────────────────
const TS = {
  background: "#0D2240", border: "1px solid rgba(0,180,216,0.2)",
  borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", fontSize: "12px",
};

function TipDotacion({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const row = DOTACION.find(d => d.mes === label);
  return (
    <div style={TS} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-white/45">{p.name === "nucleo" ? "Núcleo" : "Variable"}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
      {row && <p className="text-white/35 mt-2 pt-2 border-t border-white/10">Costo empleador: {fmtM(row.costoEmpl)}</p>}
    </div>
  );
}

function TipBenchmark({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TS} className="p-3 text-xs">
      <p className="font-bold text-[#00B4D8] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="text-white/45">{p.name}:</span>
          <span className="font-bold text-white">{fmtCLP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function estadoColor(e: "Óptimo" | "Alerta" | "Riesgo") {
  return {
    Óptimo: { bg: "rgba(6,214,160,0.12)", text: "#06D6A0", dot: "#06D6A0" },
    Alerta: { bg: "rgba(247,201,72,0.12)", text: "#F7C948", dot: "#F7C948" },
    Riesgo: { bg: "rgba(255,77,90,0.12)",  text: "#FF4D5A", dot: "#FF4D5A" },
  }[e];
}

function riesgoColor(r: number) {
  if (r >= 65) return { bar: "bg-red-500",    text: "text-red-400",    badge: "bg-red-900/20 text-red-400",       label: "Crítico"  };
  if (r >= 45) return { bar: "bg-orange-400", text: "text-orange-400", badge: "bg-orange-900/20 text-orange-400", label: "Alto"     };
  if (r >= 25) return { bar: "bg-yellow-400", text: "text-yellow-400", badge: "bg-yellow-900/20 text-yellow-400", label: "Moderado" };
  return              { bar: "bg-emerald-500", text: "text-emerald-400", badge: "bg-emerald-900/20 text-emerald-400", label: "Bajo"  };
}

// ─── PasswordGate ─────────────────────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [val,   setVal]   = useState("");
  const [show,  setShow]  = useState(false);
  const [err,   setErr]   = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (val === DEMO_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onAuth();
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#0A0F1E" }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,194,255,0.1) 0%,transparent 65%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: E }}
        className={`relative z-10 w-full max-w-sm ${shake ? "animate-shake" : ""}`}
        style={shake ? { animation: "shake 0.4s ease" } : {}}
      >
        <div className="text-center mb-8">
          <p className="font-bold italic mb-2" style={{ fontFamily: "var(--font-dm-serif)", color: "white", fontSize: "1.6rem" }}>
            RemuneraLab
          </p>
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Demo empresarial · Acceso restringido
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#1C2438", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,194,255,0.12)", border: "1px solid rgba(0,194,255,0.2)" }}>
              <Lock size={20} style={{ color: "#00C2FF" }} />
            </div>
          </div>
          <h1 className="text-white text-center font-bold mb-1" style={{ fontSize: "1.15rem" }}>Acceso al demo</h1>
          <p className="text-center mb-6" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
            Restaurante · Viña del Mar · 2026
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                ref={inputRef}
                type={show ? "text" : "password"}
                value={val}
                onChange={(e) => { setVal(e.target.value); setErr(false); }}
                placeholder="Contraseña de acceso"
                className="w-full px-4 py-3.5 pr-11 rounded-lg text-white text-sm placeholder:text-white/25 transition-all focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: err ? "1px solid rgba(255,77,90,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <AnimatePresence>
              {err && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-xs" style={{ color: "#FF4D5A" }}>
                  Contraseña incorrecta
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#00E5C4,#2EC4B6)", color: "#0A0F1E" }}
            >
              <ArrowRight size={16} /> Ingresar al dashboard
            </button>
          </form>
        </div>

        <p className="text-center mt-5" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
          Acceso exclusivo para el período de demo · {FECHA}
        </p>
      </motion.div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
function Dashboard() {
  const [benchTab,    setBenchTab]    = useState<"table" | "chart">("table");
  const [expandedNucleo, setExpandedNucleo] = useState<number | null>(null);
  const [mercadoTab,  setMercadoTab]  = useState<"presion" | "drift">("presion");
  const [costoExpand, setCostoExpand] = useState(false);

  const totalAnualBase  = 255_455_000;
  const totalAnualCosto = 405_918_600;
  const costoRotacion   = COSTOROTACION_REAL;
  const tasaRotacion    = 45;
  const salidasVol      = 9;
  const salidasEst      = 14;
  const sobrecostoPct   = 58.9;

  const optimos = BENCHMARK.filter(b => b.estado === "Óptimo").length;
  const alertas = BENCHMARK.filter(b => b.estado === "Alerta").length;
  const riesgos = BENCHMARK.filter(b => b.estado === "Riesgo").length;

  const criticos = NUCLEO.filter(n => n.riesgo >= 65).length;

  // Para brecha de género: barras proporcionales
  const maxBrechaVal = Math.max(...BRECHA.flatMap(b => [b.hombre, b.mujer]));

  // Columnas costo rotación
  const costoRotCols = ["Categoría", "Aviso", "Selección", "Documentación", "Vacante", "Curva aprend.", "Trainer", "Total", "Factor", "Salidas est."];

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "#0A0F1E", fontFamily: "var(--font-dm-sans)" }}>
      {/* Glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,180,216,0.1) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(46,196,182,0.07) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(0,180,216,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.03) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/8"
        style={{ background: "rgba(10,15,30,0.92)", backdropFilter: "blur(14px)" }}>
        <div className="flex items-center gap-4">
          <span className="font-bold italic text-white" style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.25rem" }}>RemuneraLab</span>
          <span className="text-white/20 text-xs hidden sm:block">|</span>
          <span className="text-white/45 text-xs hidden sm:block">{EMPRESA}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider"
            style={{ background: "rgba(6,214,160,0.12)", color: "#06D6A0", border: "1px solid rgba(6,214,160,0.2)", fontFamily: "var(--font-space-mono)" }}>
            Demo activa
          </span>
          <a href="/empresas/reporte"
            className="text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-80 transition-opacity hidden sm:block"
            style={{ background: "rgba(0,194,255,0.1)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.15)" }}>
            Imprimir reporte
          </a>
        </div>
      </header>

      <main className="relative z-10 flex-grow px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">

        {/* ── Encabezado empresa ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }} className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#00C2FF", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "10px" }}>
            Diagnóstico salarial · {SECTOR} · {REGION}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">{EMPRESA}</h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
            {FECHA} · 20 trabajadores núcleo · pico 32 personas (enero) · Reporte basado en nómina anual 2026
          </p>
        </motion.div>

        {/* ── KPIs principales ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: CircleDollarSign, label: "Costo empleador / año",  valor: fmtM(totalAnualCosto),    sub: `Masa base ${fmtM(totalAnualBase)}`,                               color: "#00B4D8" },
            { icon: RotateCcw,        label: "Rotación real núcleo",    valor: `${tasaRotacion}%`,         sub: `${salidasVol} vol. · ${salidasEst} estacionales/año`,            color: "#FF4D5A" },
            { icon: AlertTriangle,    label: "Costo rotación estimado", valor: fmtM(9_780_000),            sub: "9 salidas voluntarias · metodología RemuneraLab",                color: "#F7C948" },
            { icon: TrendingUp,       label: "Sobrecosto s/masa base",  valor: `+${sobrecostoPct}%`,       sub: "Cotizaciones + beneficios",                                      color: "#06D6A0" },
          ].map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, ease: E }}
              className="rounded-xl p-5 border border-white/8 bg-white/4">
              <k.icon size={16} style={{ color: k.color, marginBottom: "10px" }} />
              <p className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-space-mono)" }}>{k.valor}</p>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{k.label}</p>
              <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{k.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── M01 — Benchmark ── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
                Módulo 01 · Benchmark salarial
              </p>
              <h2 className="text-lg font-bold text-white">Posición vs. mercado — ESI 2024 INE · {REGION}</h2>
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["table", "chart"] as const).map(t => (
                <button key={t} onClick={() => setBenchTab(t)}
                  className="px-3 py-1 rounded text-xs font-semibold transition-all"
                  style={benchTab === t ? { background: "rgba(0,180,216,0.15)", color: "#00B4D8" } : { color: "rgba(255,255,255,0.35)" }}>
                  {t === "table" ? "Tabla" : "Gráfico"}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen benchmark */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Óptimo", n: optimos, color: "#06D6A0", bg: "rgba(6,214,160,0.08)",  border: "rgba(6,214,160,0.2)" },
              { label: "Alerta", n: alertas, color: "#F7C948", bg: "rgba(247,201,72,0.08)", border: "rgba(247,201,72,0.2)" },
              { label: "Riesgo", n: riesgos, color: "#FF4D5A", bg: "rgba(255,77,90,0.08)",  border: "rgba(255,77,90,0.2)" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", color: s.color }}>{s.n}</p>
                <p style={{ fontSize: "0.7rem", color: s.color, marginTop: "2px", fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>de {BENCHMARK.length} cargos</p>
              </div>
            ))}
          </div>

          {benchTab === "table" ? (
            <div className="rounded-xl overflow-hidden border border-white/8">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Cargo", "P25", "P50 mercado", "P75", "Sueldo empresa", "Percentil", "Estado"].map(h => (
                      <th key={h} className="px-4 py-3 text-left"
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BENCHMARK.map((b, i) => {
                    const col = estadoColor(b.estado);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-white" style={{ fontSize: "0.82rem" }}>
                          {b.cargo}
                          {b.n > 1 && <span className="ml-2 text-white/30 text-xs font-normal">×{b.n}</span>}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{fmtCLP(b.p25)}</td>
                        <td className="px-4 py-3.5 tabular-nums font-semibold text-white" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem" }}>{fmtCLP(b.p50)}</td>
                        <td className="px-4 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{fmtCLP(b.p75)}</td>
                        <td className="px-4 py-3.5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: b.empresa >= b.p50 ? "#06D6A0" : b.empresa >= b.p25 ? "#F7C948" : "#FF4D5A" }}>
                          {fmtCLP(b.empresa)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: col.text }}>
                          P{b.percentil}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: col.bg, color: col.text }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.dot }} />
                            {b.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-white/8 bg-white/4 p-5 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BENCHMARK} barCategoryGap="25%" barGap={3} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="cargo" axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)", angle: -35, textAnchor: "end" }} interval={0} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickFormatter={fmtAxis} width={62} />
                  <Tooltip content={<TipBenchmark />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="p50"    name="P50 mercado" fill="rgba(0,180,216,0.3)"  radius={[3,3,0,0]} barSize={14} />
                  <Bar dataKey="empresa" name="Empresa"    fill="#00B4D8"              radius={[3,3,0,0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Benchmark ESI 2024 INE · CIUO-08 · Sector gastronomía + hotelería · Región de {REGION}. Cascada 7 niveles con shrinkage blending.
          </p>
        </section>

        {/* ── M02 — Dotación mensual ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 02 · Dotación y masa salarial
          </p>
          <h2 className="text-lg font-bold text-white mb-4">Evolución mensual 2026 — Núcleo + Personal variable</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Dotación */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs font-semibold text-white/45 mb-4">Personas por mes</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DOTACION} barCategoryGap="20%" barGap={2} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} domain={[0, 35]} />
                    <Tooltip content={<TipDotacion />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="nucleo"   name="nucleo"   fill="#00B4D8" radius={[3,3,0,0]} barSize={12} stackId="a" />
                    <Bar dataKey="variable" name="variable" fill="rgba(0,180,216,0.3)" radius={[3,3,0,0]} barSize={12} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-3 text-xs">
                {[{ color: "#00B4D8", label: "Núcleo (20)" }, { color: "rgba(0,180,216,0.35)", label: "Variable" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Costo empleador mensual */}
            <div className="rounded-xl border border-white/8 bg-white/4 p-5">
              <p className="text-xs font-semibold text-white/45 mb-4">Costo total empleador mensual</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DOTACION} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }} tickFormatter={fmtAxis} width={58} domain={[25_000_000, 45_000_000]} />
                    <Tooltip formatter={(v: unknown) => typeof v === "number" ? fmtCLP(v) : String(v)} cursor={{ stroke: "rgba(255,255,255,0.1)" }} contentStyle={TS} labelStyle={{ color: "#00B4D8", fontWeight: 700 }} />
                    <ReferenceLine y={33_826_550} stroke="rgba(247,201,72,0.4)" strokeDasharray="4 4" label={{ value: "Promedio", position: "right", fill: "#F7C948", fontSize: 9 }} />
                    <Line dataKey="costoEmpl" name="Costo empleador" stroke="#06D6A0" strokeWidth={2} dot={{ fill: "#06D6A0", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span className="w-5 h-0.5 bg-[#06D6A0] rounded" />
                <span>Costo mensual · Promedio anual {fmtM(totalAnualCosto / 12)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── M03 — Riesgo de rotación núcleo ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 03 · Riesgo de rotación voluntaria — Núcleo
          </p>
          <h2 className="text-lg font-bold text-white mb-2">Diagnóstico individual · 20 trabajadores permanentes</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Score compuesto: brecha salarial vs P50, tipo de contrato, antigüedad, jornada y factores de liquidez del cargo.
            <span className="ml-2 font-bold" style={{ color: "#FF4D5A" }}>{criticos} críticos</span> requieren acción inmediata.
          </p>

          <div className="space-y-2">
            {NUCLEO.sort((a, b) => b.riesgo - a.riesgo).map((n, i) => {
              const rc = riesgoColor(n.riesgo);
              const isOpen = expandedNucleo === i;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-white/8 bg-white/4 overflow-hidden">
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/3 transition-colors text-left"
                    onClick={() => setExpandedNucleo(isOpen ? null : i)}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: n.sexo === "F" ? "rgba(255,100,200,0.12)" : "rgba(0,180,216,0.12)" }}>
                      <Users size={13} style={{ color: n.sexo === "F" ? "#FF64C8" : "#00B4D8" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">{n.nombre}</span>
                        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{n.cargo}</span>
                        {n.contrato === "Plazo fijo" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(255,77,90,0.12)", color: "#FF4D5A" }}>
                            Plazo fijo
                          </span>
                        )}
                        {n.jornada < 44 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(247,201,72,0.12)", color: "#F7C948" }}>
                            {n.jornada}h/sem
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                          <div className={`h-full ${rc.bar} rounded-full transition-all`} style={{ width: `${n.riesgo}%` }} />
                        </div>
                        <span className={`font-bold text-sm tabular-nums shrink-0 ${rc.text}`} style={{ fontFamily: "var(--font-space-mono)", minWidth: "36px" }}>
                          {n.riesgo}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${rc.badge}`}>{rc.label}</span>
                        {isOpen ? <ChevronUp size={13} className="text-white/30 shrink-0" /> : <ChevronDown size={13} className="text-white/30 shrink-0" />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                        <div className="px-4 pb-4 pt-2 border-t border-white/6">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[
                              { label: "Sueldo base",   valor: fmtCLP(n.salario) },
                              { label: "Experiencia",   valor: `${n.experiencia} años` },
                              { label: "Área",          valor: n.area },
                            ].map(d => (
                              <div key={d.label}>
                                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{d.label}</p>
                                <p className="font-semibold text-white text-sm">{d.valor}</p>
                              </div>
                            ))}
                          </div>
                          {n.factores.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {n.factores.map(f => (
                                <span key={f} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                                  style={{ background: "rgba(255,77,90,0.1)", color: "#FF4D5A", border: "1px solid rgba(255,77,90,0.2)" }}>
                                  <AlertTriangle size={10} /> {f}
                                </span>
                              ))}
                            </div>
                          )}
                          {n.factores.length === 0 && (
                            <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
                              style={{ background: "rgba(6,214,160,0.1)", color: "#06D6A0", border: "1px solid rgba(6,214,160,0.15)" }}>
                              <CheckCircle2 size={10} /> Sin factores de riesgo identificados
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── M04 — Presión de mercado + Drift salarial ── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
                Módulo 04 · Presión de mercado + Drift salarial
              </p>
              <h2 className="text-lg font-bold text-white">Señales externas de mercado laboral · Viña del Mar</h2>
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {(["presion", "drift"] as const).map(t => (
                <button key={t} onClick={() => setMercadoTab(t)}
                  className="px-3 py-1 rounded text-xs font-semibold transition-all"
                  style={mercadoTab === t ? { background: "rgba(0,180,216,0.15)", color: "#00B4D8" } : { color: "rgba(255,255,255,0.35)" }}>
                  {t === "presion" ? "Presión de mercado" : "Drift salarial"}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {mercadoTab === "presion" && (
              <motion.div key="presion" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
                  Avisos activos últimos 90 días · Portales laborales · Viña del Mar
                </p>
                <div className="rounded-xl overflow-hidden border border-white/8">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["Cargo", "CIUO", "Avisos 90d", "vs período ant.", "Tendencia visual", "Nivel de demanda"].map(h => (
                          <th key={h} className="px-4 py-3 text-left"
                            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PRESION.map((p, i) => {
                        const nivelColor = p.nivel === "alta" ? "#F7C948" : p.nivel === "media" ? "#00B4D8" : "rgba(255,255,255,0.3)";
                        const nivelBg    = p.nivel === "alta" ? "rgba(247,201,72,0.12)" : p.nivel === "media" ? "rgba(0,180,216,0.12)" : "rgba(255,255,255,0.06)";
                        const maxAvisos  = Math.max(...PRESION.map(x => x.avisos90d));
                        const barWidth   = Math.round((p.avisos90d / maxAvisos) * 100);
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} className="hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-white" style={{ fontSize: "0.82rem" }}>{p.cargo}</td>
                            <td className="px-4 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{p.ciuo}</td>
                            <td className="px-4 py-3.5 tabular-nums font-bold text-white" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem" }}>{p.avisos90d}</td>
                            <td className="px-4 py-3.5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: p.pct >= 0 ? "#06D6A0" : "#FF4D5A" }}>
                              {p.pct >= 0 ? "+" : ""}{p.pct.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                                  <div className="h-full rounded-full" style={{ width: `${barWidth}%`, background: nivelColor }} />
                                </div>
                                <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-space-mono)" }}>{p.avisos90d}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                                style={{ background: nivelBg, color: nivelColor }}>
                                {p.nivel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Fuente: portales Trabajando.cl · Computrabajo · últimos 90 días. Alta demanda ≥ 20 avisos activos.
                </p>
              </motion.div>
            )}

            {mercadoTab === "drift" && (
              <motion.div key="drift" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginBottom: "12px" }}>
                  Variación mediana salarial en avisos · 90d vs 90–180d previos
                </p>
                <div className="rounded-xl overflow-hidden border border-white/8">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["Cargo", "Mediana 90d", "Mediana 90–180d", "Variación %", "Sueldo empresa", "vs Mercado"].map(h => (
                          <th key={h} className="px-4 py-3 text-left"
                            style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DRIFT.map((d, i) => {
                        const diffPct = ((d.empresa - d.med90d) / d.med90d) * 100;
                        const vsMercadoLabel = diffPct < -5 ? "Bajo mercado" : diffPct > 5 ? "Sobre mercado" : "En mercado";
                        const vsMercadoColor = diffPct < -5 ? "#FF4D5A" : diffPct > 5 ? "#06D6A0" : "#00B4D8";
                        const vsMercadoBg    = diffPct < -5 ? "rgba(255,77,90,0.12)" : diffPct > 5 ? "rgba(6,214,160,0.12)" : "rgba(0,180,216,0.12)";
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} className="hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-white" style={{ fontSize: "0.82rem" }}>{d.cargo}</td>
                            <td className="px-4 py-3.5 tabular-nums font-bold text-white" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem" }}>{fmtCLP(d.med90d)}</td>
                            <td className="px-4 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>{fmtCLP(d.med90_180d)}</td>
                            <td className="px-4 py-3.5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: d.pct >= 0 ? "#F7C948" : "#06D6A0" }}>
                              {d.pct >= 0 ? "+" : ""}{d.pct.toFixed(1)}%
                            </td>
                            <td className="px-4 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>{fmtCLP(d.empresa)}</td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{ background: vsMercadoBg, color: vsMercadoColor }}>
                                {vsMercadoLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 rounded-xl p-3 border-l-2" style={{ borderLeftColor: "#FF4D5A", background: "rgba(255,77,90,0.06)" }}>
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                    <strong className="text-white">Alerta:</strong> Ayudante de Cocina paga $87k menos que la mediana de avisos → riesgo de fuga activo.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── M05 — Desglose costo de rotación ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 05 · Desglose costo de rotación
          </p>
          <h2 className="text-lg font-bold text-white mb-2">Metodología transparente — qué entra en cada salida</h2>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "16px" }}>
            El factor 1,5× sueldo anual que citan consultoras globales aplica a cargos profesionales especializados.
            Para operativos de gastronomía, el costo real está entre 0,7 y 1,1 meses de sueldo. Desglose por componente:
          </p>

          <div className="rounded-xl overflow-x-auto border border-white/8 mb-4">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {costoRotCols.map(h => (
                    <th key={h} className="px-3 py-3 text-left"
                      style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COSTO_ROT.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} className="hover:bg-white/3 transition-colors">
                    <td className="px-3 py-3.5 font-semibold text-white" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>{r.categoria}</td>
                    <td className="px-3 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{fmtCLP(r.aviso)}</td>
                    <td className="px-3 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{fmtCLP(r.seleccion)}</td>
                    <td className="px-3 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{fmtCLP(r.documentacion)}</td>
                    <td className="px-3 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{fmtCLP(r.vacante)}</td>
                    <td className="px-3 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{fmtCLP(r.curva_aprendizaje)}</td>
                    <td className="px-3 py-3.5 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>{fmtCLP(r.trainer)}</td>
                    <td className="px-3 py-3.5 tabular-nums font-bold text-white" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem" }}>{fmtCLP(r.total)}</td>
                    <td className="px-3 py-3.5 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: "#F7C948" }}>{r.factor_meses.toFixed(2)}×</td>
                    <td className="px-3 py-3.5 tabular-nums text-center font-bold text-white" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem" }}>{r.n_salidas_estimadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl p-4 border border-white/8 bg-white/4 mb-4">
            <p className="font-semibold text-white mb-1" style={{ fontSize: "0.85rem" }}>
              Total estimado 9 salidas voluntarias: <span style={{ color: "#F7C948", fontFamily: "var(--font-space-mono)" }}>$9.780.000</span> · Factor promedio: <span style={{ color: "#F7C948" }}>1,0× sueldo mensual</span>
            </p>
          </div>

          {/* Componentes — collapse/expand */}
          <button
            onClick={() => setCostoExpand(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold mb-2 hover:opacity-80 transition-opacity"
            style={{ color: "#00B4D8" }}>
            {costoExpand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {costoExpand ? "Ocultar" : "Ver"} definición de componentes
          </button>

          <AnimatePresence>
            {costoExpand && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                <div className="rounded-xl border border-white/8 bg-white/4 p-4 grid sm:grid-cols-2 gap-3">
                  {[
                    { nombre: "Aviso",            desc: "Publicación en portal de empleo (Trabajando.cl / Computrabajo)." },
                    { nombre: "Selección",         desc: "Horas jefatura en CV screening + entrevistas (8h × costo-hora)." },
                    { nombre: "Documentación",     desc: "Trámites HR, finiquito si aplica, contratos nuevos." },
                    { nombre: "Vacante",           desc: "10 días con turno cubierto por hora extra o mesa sin atender." },
                    { nombre: "Curva de aprendizaje", desc: "4–6 semanas al 65% de productividad del reemplazante." },
                    { nombre: "Trainer",           desc: "2 semanas de un senior a 80% productividad por mentoreo." },
                  ].map(c => (
                    <div key={c.nombre} className="flex gap-2">
                      <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "#00B4D8" }} />
                      <div>
                        <span className="font-semibold text-white text-xs">{c.nombre}: </span>
                        <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>{c.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── M06 — ICL ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 06 · Costo laboral — INE EMRCL
          </p>
          <h2 className="text-lg font-bold text-white mb-4">Índice de Costo Laboral · Turismo y Servicios · {ICL.trimestre}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: `ICL Turismo/Servicios · ${ICL.trimestre}`, valor: `+${ICL.icl_sector}%`, sub: `vs Nacional +${ICL.icl_nac}%`, color: "#FF4D5A", bg: "rgba(255,77,90,0.08)", border: "rgba(255,77,90,0.2)" },
              { label: `IR Turismo/Servicios · ${ICL.trimestre}`,  valor: `+${ICL.ir_sector}%`,  sub: `vs Nacional +${ICL.ir_nac}%`,  color: "#F7C948", bg: "rgba(247,201,72,0.08)", border: "rgba(247,201,72,0.2)" },
              { label: "IPC · referencia inflación",                 valor: `+${ICL.ipc}%`,         sub: "Banco Central · T1 2026",     color: "#00B4D8", bg: "rgba(0,180,216,0.08)", border: "rgba(0,180,216,0.2)" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-5" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "2rem", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 border border-white/8 bg-white/4">
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
              <strong className="text-white">Lectura:</strong> El ICL turismo (+{ICL.icl_sector}%) supera al IPC (+{ICL.ipc}%) en 0.1 pp.
              El reajuste de julio (+4%) para contratos indefinidos está alineado con el IR sectorial (+{ICL.ir_sector}%) — decisión correcta.
              El presupuesto de RRHH 2027 debe contemplar mínimo <strong className="text-white">+{ICL.icl_sector}%</strong> de ajuste base por persona para no deteriorar el poder adquisitivo del equipo núcleo.
            </p>
          </div>
        </section>

        {/* ── M07 — Brecha de género (nueva visualización) ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 07 · Brecha de género salarial
          </p>
          <h2 className="text-lg font-bold text-white mb-5">Gap salarial interno por nivel jerárquico · {EMPRESA}</h2>

          <div className="space-y-5 mb-4">
            {BRECHA.map((b, i) => {
              const absGap   = Math.abs(b.gap);
              const favMujer = b.gap < 0;
              const gapColor = absGap >= 15 ? "#FF4D5A" : absGap >= 8 ? "#F7C948" : "#06D6A0";
              const senal    = absGap >= 15 ? "Zona de riesgo" : absGap >= 8 ? "Vigilar" : favMujer ? "Favorable mujer" : "Bajo brecha";
              const hWidth   = Math.round((b.hombre / maxBrechaVal) * 100);
              const mWidth   = Math.round((b.mujer  / maxBrechaVal) * 100);
              return (
                <div key={i} className="rounded-xl p-4 border border-white/8 bg-white/4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-white" style={{ fontSize: "0.82rem" }}>{b.nivel}</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: gapColor + "18", color: gapColor }}>
                      {favMujer ? "−" : "+"}{absGap.toFixed(1)}% · {senal}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {/* Hombre */}
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.65rem", color: "#00B4D8", fontFamily: "var(--font-space-mono)", minWidth: "48px" }}>Hombre</span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${hWidth}%`, background: "#00B4D8" }}>
                        </div>
                      </div>
                      <span className="tabular-nums font-bold text-white shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", minWidth: "84px", textAlign: "right" }}>
                        {fmtCLP(b.hombre)}
                      </span>
                    </div>
                    {/* Mujer */}
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.65rem", color: "#FF64C8", fontFamily: "var(--font-space-mono)", minWidth: "48px" }}>Mujer</span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${mWidth}%`, background: "#FF64C8" }}>
                        </div>
                      </div>
                      <span className="tabular-nums font-bold text-white shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", minWidth: "84px", textAlign: "right" }}>
                        {fmtCLP(b.mujer)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl p-4 border-l-2 bg-white/4" style={{ borderLeftColor: "#06D6A0" }}>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              <strong className="text-white">Gap ponderado: {GAP_POND}% — Bajo brecha.</strong>{" "}
              El equipo del restaurante muestra equidad remuneracional notable: en el nivel operativo calificado (garzones/cocineros),
              las mujeres ganan un 8.9% más que los hombres, reflejando mayor antigüedad promedio femenina en sala.
              Sin riesgo regulatorio bajo Ley 21.719.
            </p>
          </div>
        </section>

        {/* ── M08 — ENE Valparaíso ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 08 · Mercado laboral regional
          </p>
          <h2 className="text-lg font-bold text-white mb-4">Desocupación en {REGION} · INE ENE oct.–dic. 2024</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: `Tasa desocupación ${REGION}`, valor: `${ENE_VALPO}%`,       sub: "oct.–dic. 2024",        color: "#F7C948", bg: "rgba(247,201,72,0.08)", border: "rgba(247,201,72,0.2)" },
              { label: "Nacional",                     valor: `${ENE_NAC}%`,          sub: "promedio país",          color: "#00B4D8", bg: "rgba(0,180,216,0.08)", border: "rgba(0,180,216,0.2)" },
              { label: "Tendencia regional",           valor: `${ENE_TENDENCIA} pp`,  sub: "vs trimestre anterior",  color: "#06D6A0", bg: "rgba(6,214,160,0.08)", border: "rgba(6,214,160,0.2)" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-5" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.8rem", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 border border-white/8 bg-white/4">
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
              <strong className="text-white">Contexto:</strong> Valparaíso opera 0.6 pp bajo la media nacional, lo que indica
              <strong className="text-[#F7C948]"> mercado laboral relativamente ajustado</strong> en la región.
              En temporada alta (enero, julio), la competencia por garzones y ayudantes de cocina es alta —
              Viña del Mar concentra además la mayor densidad de restaurantes de la Quinta Región.
              Implicancia: captar personal estacional requiere publicar vacantes con 45–60 días de anticipación y ofrecer condiciones competitivas.
            </p>
          </div>
        </section>

        {/* ── Recomendaciones ── */}
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Plan de acción
          </p>
          <h2 className="text-lg font-bold text-white mb-2">5 palancas por urgencia y retorno</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            Costo estimado de rotación anual: <strong className="text-white">{fmtM(costoRotacion)}</strong> ·
            Ahorro proyectado con plan completo: <strong style={{ color: "#06D6A0" }}>~{fmtM(costoRotacion * 0.55)}</strong>
          </p>

          <div className="space-y-4">
            {RECS.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-white/8 bg-white/4 p-5 flex gap-5">
                <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: r.color + "22", color: r.color, fontFamily: "var(--font-space-mono)", border: `1px solid ${r.color}30` }}>
                  {r.num}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white mb-2" style={{ fontSize: "0.9rem" }}>{r.titulo}</p>
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }} className="mb-4">{r.texto}</p>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/8">
                    {[
                      { label: "Costo",    v: r.costo,    c: "rgba(255,255,255,0.5)" },
                      { label: "Evita",    v: r.evita,    c: "#FF4D5A" },
                      { label: "Ganancia", v: r.ganancia, c: "#06D6A0" },
                    ].map(d => (
                      <div key={d.label}>
                        <p style={{ fontSize: "0.55rem", fontFamily: "var(--font-space-mono)", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>{d.label}</p>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: d.c, lineHeight: 1.35 }}>{d.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Compliance Ley 21.719 ── */}
        <section className="mb-8">
          <div className="rounded-xl p-5 border" style={{ background: "rgba(0,180,216,0.05)", borderColor: "rgba(0,180,216,0.2)" }}>
            <div className="flex items-start gap-3">
              <Shield size={18} style={{ color: "#00B4D8", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p className="font-semibold text-white mb-1">Ley 21.719 — Protección de Datos · Vigencia 1 dic. 2026</p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                  Esta demo procesa solo datos agregados y anonimizados. No contiene RUTs, nombres reales ni información de trabajadores identificables.
                  El restaurante no tiene empleados únicos por cargo con riesgo de re-identificación (mínimo 2 personas por cargo analizado).
                  Recomendación para plan pagado: firmar DPA antes de cargar planilla real con identificadores personales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl p-8 text-center border border-white/8 bg-white/4 mb-4">
          <p className="font-bold text-white text-xl mb-2">¿Listo para activar el plan completo?</p>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
            Esta demo expira en 60 días. El plan pagado incluye alertas semanales, actualización en tiempo real y diagnóstico personalizado con tu planilla real.
          </p>
          <a href="/empresas#contacto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#06D6A0,#2EC4B6)", color: "#0A0F1E" }}>
            Contactar al equipo RemuneraLab <ArrowRight size={15} />
          </a>
        </section>

        {/* Pie */}
        <p className="text-center pb-8" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.2)" }}>
          Fuentes: ESI 2024 · CASEN INE · EMRCL {ICL.trimestre} · ENE oct.–dic. 2024 · Avisos laborales portales chilenos (90 días) · nómina proporcionada por el cliente (anonimizada).
          Reporte confidencial — uso exclusivo del período de demo.
        </p>
      </main>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function RestauranteDemoPage() {
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setAuth(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (auth === null) return null; // evita flash

  return auth
    ? <Dashboard />
    : <PasswordGate onAuth={() => setAuth(true)} />;
}
