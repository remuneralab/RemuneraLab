"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, ReferenceLine,
} from "recharts";
import {
  Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, TrendingUp,
  TrendingDown, Users, ArrowRight, ChevronDown, ChevronUp, ChevronRight,
  CircleDollarSign, RotateCcw, Shield, BarChart2, Activity, MapPin, Scale, Layers,
  LayoutDashboard,
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

// ─── M04b — Presión de mercado consolidado ───────────────────────────────────
type MercadoRow = {
  cargo: string; n_empresa: number;
  avisos90d: number; avisosTrend: number; nivel: "alta" | "media" | "baja";
  med90d: number | null; empresa: number; salGap: number;
  probOferta: number; tensionIdx: number; narrativa: string;
};

const MERCADO_IMPACT: MercadoRow[] = [
  {
    cargo: "Garzón/a Senior", n_empresa: 4,
    avisos90d: 47, avisosTrend: +46.9, nivel: "alta",
    med90d: 720_000, empresa: 710_000, salGap: -1.4,
    probOferta: 68, tensionIdx: 82,
    narrativa: "La demanda de Garzones creció 47% en 90 días. Con 4 en tu equipo y 47 avisos activos, la probabilidad de que uno reciba una oferta competitiva antes de fin de semestre es alta. El riesgo viene del volumen de oportunidades, no del gap salarial.",
  },
  {
    cargo: "Ayudante de Cocina", n_empresa: 2,
    avisos90d: 38, avisosTrend: +22.6, nivel: "alta",
    med90d: 660_000, empresa: 587_000, salGap: -11.1,
    probOferta: 78, tensionIdx: 88,
    narrativa: "El cargo más expuesto de la operación: alta demanda + brecha de $73.000/mes vs. mercado. Con riesgo de rotación 78–81/100, el mercado está compitiendo activamente por este perfil hoy.",
  },
  {
    cargo: "Bartender", n_empresa: 2,
    avisos90d: 23, avisosTrend: +35.3, nivel: "alta",
    med90d: 790_000, empresa: 749_000, salGap: -5.2,
    probOferta: 55, tensionIdx: 70,
    narrativa: "Alta liquidez característica del rubro. 23 avisos activos con sueldos en alza +4.6%. La brecha de $41.000/mes, en combinación con el dinamismo del mercado, hace que cualquier oferta sea tentadora.",
  },
  {
    cargo: "Chef / Cocinero de Partida", n_empresa: 3,
    avisos90d: 19, avisosTrend: -9.5, nivel: "media",
    med90d: 940_000, empresa: 938_000, salGap: -0.2,
    probOferta: 28, tensionIdx: 40,
    narrativa: "Demanda en desaceleración y sueldo en la mediana de avisos. La caída de -9.5% en publicaciones indica que el mercado para este perfil se estabiliza — ventana de tranquilidad.",
  },
  {
    cargo: "Recepcionista", n_empresa: 1,
    avisos90d: 15, avisosTrend: +7.1, nivel: "media",
    med90d: 730_000, empresa: 706_000, salGap: -3.3,
    probOferta: 22, tensionIdx: 32,
    narrativa: "Presión moderada y brecha pequeña de $24.000/mes. El perfil de Recepcionista en gastronomía tiene menor movilidad que sala u operativo de cocina — riesgo bajo en el corto plazo.",
  },
  {
    cargo: "Auxiliar de Limpieza", n_empresa: 2,
    avisos90d: 8, avisosTrend: -27.3, nivel: "baja",
    med90d: 570_000, empresa: 555_000, salGap: -2.6,
    probOferta: 15, tensionIdx: 16,
    narrativa: "Mercado en retroceso — demanda bajó 27%. Con pocas alternativas activas, este es el momento para formalizar contratos y consolidar el equipo de apoyo antes del próximo peak.",
  },
];

// ─── M04c — Bandas salariales 3 fuentes ──────────────────────────────────────
type BandSrc = { p25: number; p50: number; p75: number };
type BandaRow = {
  cargo: string; n: number; empresa: number;
  esi: BandSrc; avisos: BandSrc; rl: BandSrc;
};

const BANDAS: BandaRow[] = [
  { cargo: "Chef Ejecutivo",       n: 1, empresa: 2_321_000,
    esi:    { p25: 1_850_000, p50: 2_100_000, p75: 2_800_000 },
    avisos: { p25: 2_000_000, p50: 2_350_000, p75: 3_200_000 },
    rl:     { p25: 1_950_000, p50: 2_180_000, p75: 2_900_000 } },
  { cargo: "Sous Chef",            n: 1, empresa: 1_546_000,
    esi:    { p25: 1_200_000, p50: 1_450_000, p75: 1_900_000 },
    avisos: { p25: 1_350_000, p50: 1_620_000, p75: 2_100_000 },
    rl:     { p25: 1_280_000, p50: 1_520_000, p75: 1_980_000 } },
  { cargo: "Cocinero de Partida",  n: 3, empresa: 938_000,
    esi:    { p25:   750_000, p50:   900_000, p75: 1_100_000 },
    avisos: { p25:   820_000, p50:   980_000, p75: 1_250_000 },
    rl:     { p25:   780_000, p50:   945_000, p75: 1_180_000 } },
  { cargo: "Ayudante de Cocina",   n: 2, empresa: 587_000,
    esi:    { p25: 560_000, p50: 650_000, p75: 780_000 },
    avisos: { p25: 600_000, p50: 660_000, p75: 800_000 },
    rl:     { p25: 555_000, p50: 640_000, p75: 775_000 } },
  { cargo: "Jefe de Sala",         n: 1, empresa: 1_113_000,
    esi:    { p25:   900_000, p50: 1_050_000, p75: 1_350_000 },
    avisos: { p25:   980_000, p50: 1_160_000, p75: 1_520_000 },
    rl:     { p25:   950_000, p50: 1_100_000, p75: 1_420_000 } },
  { cargo: "Garzón/a Senior",      n: 4, empresa: 710_000,
    esi:    { p25: 610_000, p50: 720_000, p75: 870_000 },
    avisos: { p25: 650_000, p50: 755_000, p75: 930_000 },
    rl:     { p25: 630_000, p50: 738_000, p75: 895_000 } },
  { cargo: "Bartender",            n: 2, empresa: 749_000,
    esi:    { p25: 640_000, p50: 760_000, p75: 920_000 },
    avisos: { p25: 710_000, p50: 805_000, p75: 990_000 },
    rl:     { p25: 680_000, p50: 785_000, p75: 955_000 } },
  { cargo: "Administrador/a",      n: 1, empresa: 1_124_000,
    esi:    { p25:   950_000, p50: 1_150_000, p75: 1_450_000 },
    avisos: { p25: 1_050_000, p50: 1_260_000, p75: 1_620_000 },
    rl:     { p25: 1_000_000, p50: 1_210_000, p75: 1_540_000 } },
  { cargo: "Cajero/a",             n: 1, empresa: 769_000,
    esi:    { p25: 620_000, p50: 730_000, p75: 870_000 },
    avisos: { p25: 665_000, p50: 770_000, p75: 940_000 },
    rl:     { p25: 640_000, p50: 750_000, p75: 905_000 } },
  { cargo: "Encargado de Bodega",  n: 1, empresa: 644_000,
    esi:    { p25: 600_000, p50: 700_000, p75: 850_000 },
    avisos: { p25: 635_000, p50: 730_000, p75: 880_000 },
    rl:     { p25: 615_000, p50: 715_000, p75: 862_000 } },
  { cargo: "Auxiliar de Limpieza", n: 2, empresa: 555_000,
    esi:    { p25: 539_000, p50: 580_000, p75: 690_000 },
    avisos: { p25: 550_000, p50: 590_000, p75: 710_000 },
    rl:     { p25: 542_000, p50: 578_000, p75: 695_000 } },
  { cargo: "Recepcionista",        n: 1, empresa: 706_000,
    esi:    { p25: 620_000, p50: 730_000, p75: 890_000 },
    avisos: { p25: 680_000, p50: 762_000, p75: 960_000 },
    rl:     { p25: 650_000, p50: 746_000, p75: 925_000 } },
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

// ─── BandChart ───────────────────────────────────────────────────────────────
function BandChart({ b }: { b: BandaRow }) {
  const allPs = [b.esi.p25, b.esi.p75, b.avisos.p25, b.avisos.p75, b.rl.p25, b.rl.p75, b.empresa];
  const rawMin = Math.min(...allPs);
  const rawMax = Math.max(...allPs);
  const pad    = (rawMax - rawMin) * 0.10;
  const sMin   = rawMin - pad;
  const sMax   = rawMax + pad;
  const pct    = (v: number) => Math.max(0, Math.min(100, ((v - sMin) / (sMax - sMin)) * 100));
  const empPct = pct(b.empresa);

  const sources = [
    { key: "esi",    label: "ESI INE 2024",      color: "#00B4D8", data: b.esi    },
    { key: "avisos", label: "Avisos lab. 90d",    color: "#F7C948", data: b.avisos },
    { key: "rl",     label: "RemuneraLab",        color: "#8568f3", data: b.rl    },
  ];

  return (
    <div className="mt-4 space-y-4">
      {sources.map(({ key, label, color, data }) => {
        const p25p = pct(data.p25);
        const p50p = pct(data.p50);
        const p75p = pct(data.p75);
        const diff = ((b.empresa - data.p50) / data.p50) * 100;
        const dc   = diff < -5 ? "#FF4D5A" : diff < 0 ? "#F7C948" : "#06D6A0";
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-space-mono)" }}>{label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-space-mono)" }}>
                  P25 {fmtCLP(data.p25)} · P50 {fmtCLP(data.p50)} · P75 {fmtCLP(data.p75)}
                </span>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.64rem", fontWeight: 700, color: dc }}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="relative h-5">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full"
                style={{ left: `${p25p}%`, width: `${p75p - p25p}%`, background: `${color}18`, border: `1px solid ${color}28` }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ left: `${p50p}%`, background: color, zIndex: 2 }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                style={{ left: `${empPct}%`, background: "rgba(255,255,255,0.85)", zIndex: 3 }} />
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {([
          { sym: "●", label: "P50 fuente", c: "rgba(255,255,255,0.28)" },
          { sym: "◆", label: `Empresa · ${fmtCLP(b.empresa)}`, c: "rgba(255,255,255,0.50)" },
        ] as const).map(l => (
          <span key={l.label} style={{ fontSize: "0.58rem", color: l.c, fontFamily: "var(--font-space-mono)" }}>
            {l.sym}  {l.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.56rem", color: "rgba(255,255,255,0.20)", fontFamily: "var(--font-space-mono)" }}>
          Banda P25–P75 sombreada
        </span>
      </div>
    </div>
  );
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
type Section = "resumen" | "benchmark" | "bandas" | "dotacion" | "rotacion" | "mercado" | "costo_rot" | "icl" | "brecha" | "ene" | "cumplimiento" | "recomendaciones";

const NAV: ReadonlyArray<{ id: Section; label: string; icon: React.ElementType }> = [
  { id: "benchmark",       label: "Benchmark salarial",  icon: BarChart2        },
  { id: "bandas",          label: "Bandas salariales",    icon: Layers           },
  { id: "dotacion",        label: "Dotación",             icon: Users            },
  { id: "rotacion",        label: "Riesgo rotación",      icon: RotateCcw        },
  { id: "mercado",         label: "Presión de mercado",   icon: TrendingUp       },
  { id: "costo_rot",       label: "Costo rotación",       icon: CircleDollarSign },
  { id: "icl",             label: "Costo laboral",        icon: Activity         },
  { id: "brecha",          label: "Brecha de género",     icon: Shield           },
  { id: "ene",             label: "Mercado laboral",      icon: MapPin           },
  { id: "cumplimiento",    label: "Cumplimiento",         icon: Scale            },
  { id: "recomendaciones", label: "Recomendaciones",      icon: CheckCircle2     },
];

function Sidebar({ section, onSection }: { section: Section; onSection: (s: Section) => void }) {
  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-full flex-col"
      style={{ width: "240px", background: "rgba(10,15,30,0.98)", borderRight: "1px solid rgba(0,180,216,0.10)", zIndex: 40 }}
    >
      <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(0,180,216,0.08)" }}>
        <span className="font-bold italic text-white" style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.2rem" }}>RemuneraLab</span>
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.46rem", letterSpacing: "0.22em", color: "rgba(0,194,255,0.42)", textTransform: "uppercase", marginTop: "4px" }}>
          Demo empresarial
        </p>
      </div>
      <div className="px-6 py-3" style={{ borderBottom: "1px solid rgba(0,180,216,0.05)" }}>
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.46rem", letterSpacing: "0.14em", color: "rgba(0,180,216,0.35)", textTransform: "uppercase", lineHeight: 1.6 }}>
          {EMPRESA}
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto py-3">

        {/* ── Acceso al panel principal ── */}
        <div
          onClick={() => onSection("resumen")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all hover:brightness-110 cursor-pointer"
          style={{
            background: section === "resumen" ? "rgba(0,180,216,0.14)" : "rgba(0,180,216,0.07)",
            border: section === "resumen" ? "1px solid rgba(0,180,216,0.35)" : "1px solid rgba(0,180,216,0.20)",
          }}
        >
          <LayoutDashboard size={14} style={{ color: "#00C2FF", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "#00C2FF", fontWeight: 500 }}>
            Panel principal
          </span>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "4px 4px 6px" }} />

        {NAV.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSection(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
              style={{
                background: active ? "rgba(0,180,216,0.12)" : "transparent",
                border: active ? "1px solid rgba(0,180,216,0.18)" : "1px solid transparent",
              }}
            >
              <Icon size={14} style={{ color: active ? "#00C2FF" : "rgba(255,255,255,0.22)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)", fontWeight: active ? 500 : 400 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(0,180,216,0.08)" }}>
        <span
          className="inline-block mb-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
          style={{ background: "rgba(6,214,160,0.12)", color: "#06D6A0", border: "1px solid rgba(6,214,160,0.2)", fontFamily: "var(--font-space-mono)" }}
        >
          Demo activa
        </span>
        <a
          href="/empresas/reporte"
          className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.46rem", letterSpacing: "0.14em", color: "rgba(0,194,255,0.45)", textTransform: "uppercase" }}
        >
          Imprimir reporte
        </a>
      </div>
    </aside>
  );
}

function MobileNav({ section, onSection }: { section: Section; onSection: (s: Section) => void }) {
  return (
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-40"
      style={{ background: "rgba(10,15,30,0.98)", borderBottom: "1px solid rgba(0,180,216,0.10)" }}
    >
      <div className="flex items-center justify-between px-5 h-12">
        <span className="font-bold italic text-white" style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.1rem" }}>RemuneraLab</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSection("resumen")}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(0,194,255,0.12)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.25)" }}
          >
            <LayoutDashboard size={11} /> Panel principal
          </button>
          <a
            href="/empresas/reporte"
            className="text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(0,194,255,0.1)", color: "#00C2FF", border: "1px solid rgba(0,194,255,0.15)" }}
          >
            Imprimir
          </a>
        </div>
      </div>
      <div className="flex overflow-x-auto px-2 pb-2 gap-1" style={{ borderTop: "1px solid rgba(0,180,216,0.06)" }}>
        {NAV.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSection(item.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0"
              style={{
                background: active ? "rgba(0,180,216,0.14)" : "transparent",
                border: active ? "1px solid rgba(0,180,216,0.2)" : "1px solid transparent",
                color: active ? "#00C2FF" : "rgba(255,255,255,0.30)",
              }}
            >
              <Icon size={10} style={{ color: active ? "#00C2FF" : "rgba(255,255,255,0.28)" }} />
              <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-dm-sans)" }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
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
  const [rotExpanded, setRotExpanded] = useState<number | null>(null);
  const [rotacionMeta, setRotacionMeta] = useState(25);
  const [bandasOpen, setBandasOpen] = useState<number | null>(null);

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

  const [activeSection, setActiveSection] = useState<Section>("resumen");

  function switchSection(s: Section) {
    setActiveSection(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen" style={{ background: "#0A0F1E", fontFamily: "var(--font-dm-sans)" }}>
      {/* Glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(0,180,216,0.1) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed bottom-0 -left-24 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(46,196,182,0.07) 0%,transparent 65%)" }} />
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(0,180,216,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.03) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      <MobileNav section={activeSection} onSection={switchSection} />
      <Sidebar section={activeSection} onSection={switchSection} />

      <main className="relative z-10 lg:ml-[240px]">
        <div className="px-4 sm:px-6 pt-[100px] lg:pt-8 pb-12 max-w-5xl mx-auto">

        {activeSection === "resumen" && (<>
        {/* ── Panel principal — Resumen empresa ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: E }} className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.6rem", color: "#00C2FF", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "10px" }}>
            Panel principal · {SECTOR} · {REGION}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">{EMPRESA}</h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
            {FECHA} · Resumen ejecutivo · 4 indicadores clave de tu empresa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {[
            {
              color: "#F97316",
              shadow: "rgba(249,115,22,0.18)",
              icon: CircleDollarSign,
              badge: "Costo rotación",
              metric: "$9.8M",
              metricSub: "por salida voluntaria",
              title: "Rotación de personal",
              desc: "Cada trabajador que se va tiene un costo real medido en reclutamiento, vacante y curva de aprendizaje.",
              bullets: ["9 salidas voluntarias · 45% tasa rotación", "$405.9M costo empleador anual", "Metodología RemuneraLab 2024"],
              cta: "Ver análisis de costo rotacional",
              section: "costo_rot" as Section,
            },
            {
              color: "#00B4D8",
              shadow: "rgba(0,180,216,0.18)",
              icon: BarChart2,
              badge: "Bandas salariales",
              metric: "2",
              metricSub: "cargos en zona de riesgo",
              title: "Posición vs. mercado",
              desc: "Dos cargos pagan bajo el percentil 25 del mercado regional, generando alto riesgo de fuga de talento.",
              bullets: ["Ayudante Cocina: P32 · bajo mercado", "Encargado Bodega: P38 · alerta", "4 cargos en zona de alerta"],
              cta: "Ver benchmark salarial",
              section: "benchmark" as Section,
            },
            {
              color: "#2EC4B6",
              shadow: "rgba(46,196,182,0.18)",
              icon: TrendingUp,
              badge: "Presión de mercado",
              metric: "+47%",
              metricSub: "aumento de avisos de empleo",
              title: "Tensión en el mercado laboral",
              desc: "El mercado compite activamente por los mismos perfiles que tienes, especialmente garzones y ayudantes.",
              bullets: ["Garzón/a: 47 avisos · tensión 88/100", "Prob. oferta activa al talento: 78%", "Bartender: tendencia salarial +4.6%"],
              cta: "Ver presión de mercado",
              section: "mercado" as Section,
            },
            {
              color: "#A78BFA",
              shadow: "rgba(167,139,250,0.18)",
              icon: Scale,
              badge: "Cumplimiento legal",
              metric: "3",
              metricSub: "normativas vigentes activas",
              title: "Obligaciones laborales 2024–2025",
              desc: "Nuevas leyes exigen ajustes en protocolos internos. Incumplir implica multas y riesgo reputacional.",
              bullets: ["Ley Karin vigente desde ago. 2024", "Transparencia Salarial · Ley 21.561", "Jornada 40 horas · implementación gradual"],
              cta: "Ver cumplimiento legal",
              section: "cumplimiento" as Section,
            },
          ].map((card, i) => (
            <motion.div
              key={card.section}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.42, ease: E }}
              onClick={() => switchSection(card.section)}
              className="relative rounded-2xl p-6 cursor-pointer group overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.08)`,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              whileHover={{ scale: 1.015, boxShadow: `0 0 32px ${card.shadow}` }}
            >
              {/* top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: card.color }} />
              {/* corner glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${card.shadow} 0%, transparent 65%)` }} />

              <div className="flex items-start justify-between mb-4">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: `${card.color}18`, color: card.color, border: `1px solid ${card.color}30`, fontFamily: "var(--font-space-mono)" }}
                >
                  <card.icon size={11} /> {card.badge}
                </span>
                <ArrowRight size={15} style={{ color: card.color, opacity: 0.6, marginTop: "2px" }} className="group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-4xl font-bold tabular-nums mb-0.5" style={{ color: card.color, fontFamily: "var(--font-space-mono)" }}>
                {card.metric}
              </p>
              <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginBottom: "12px", fontFamily: "var(--font-space-mono)" }}>
                {card.metricSub}
              </p>

              <h3 className="text-base font-bold text-white mb-1.5">{card.title}</h3>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, marginBottom: "16px" }}>{card.desc}</p>

              <ul className="space-y-1.5 mb-5">
                {card.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>
                    <span style={{ color: card.color, marginTop: "2px", flexShrink: 0 }}>›</span> {b}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-1.5" style={{ fontSize: "0.74rem", color: card.color, fontWeight: 600 }}>
                {card.cta} <ChevronRight size={13} />
              </div>
            </motion.div>
          ))}
        </div>
        </>)}

        {activeSection === "benchmark" && (<>

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
        </>)}

        {/* ── Bandas salariales ── */}
        {activeSection === "bandas" && (<section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 01b · Bandas salariales
          </p>
          <h2 className="text-lg font-bold text-white mb-1">¿Cuánto paga el mercado — y de dónde viene ese número?</h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
            Tres fuentes distintas para cada cargo: la encuesta oficial INE, lo que ofrecen los avisos laborales activos, y los sueldos declarados por usuarios de RemuneraLab. El diamante blanco es la posición de tu empresa.
          </p>

          {/* Context chips + leyenda fuentes */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {(["Gastronomía · Turismo", "Región Valparaíso", "Empresa 11–25 trab."] as const).map(c => (
                <span key={c} className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: "rgba(0,194,255,0.07)", border: "1px solid rgba(0,194,255,0.14)", color: "rgba(0,194,255,0.55)", fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}>
                  {c}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {([
                { color: "#00B4D8", label: "ESI INE 2024" },
                { color: "#F7C948", label: "Avisos 90d" },
                { color: "#8568f3", label: "RemuneraLab" },
              ] as const).map(s => (
                <span key={s.label} className="flex items-center gap-1.5"
                  style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.40)", fontFamily: "var(--font-space-mono)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
              <span className="flex items-center gap-1.5"
                style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.50)", fontFamily: "var(--font-space-mono)" }}>
                <span className="w-2 h-2 rotate-45 inline-block" style={{ background: "rgba(255,255,255,0.8)" }} />
                Empresa
              </span>
            </div>
          </div>

          {/* Summary row */}
          {(() => {
            const sobreEsi    = BANDAS.filter(b => b.empresa >= b.esi.p50).length;
            const sobreAvisos = BANDAS.filter(b => b.empresa >= b.avisos.p50).length;
            const sobreRl     = BANDAS.filter(b => b.empresa >= b.rl.p50).length;
            return (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {([
                  { label: "Sobre P50 ESI INE",    n: sobreEsi,    total: BANDAS.length, color: "#00B4D8" },
                  { label: "Sobre P50 Avisos 90d",  n: sobreAvisos, total: BANDAS.length, color: "#F7C948" },
                  { label: "Sobre P50 RemuneraLab", n: sobreRl,     total: BANDAS.length, color: "#8568f3" },
                ] as const).map(k => (
                  <div key={k.label} className="rounded-xl p-4 border border-white/8 bg-white/4">
                    <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: k.color, lineHeight: 1 }}>
                      {k.n}<span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.30)" }}>/{k.total}</span>
                    </p>
                    <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.32)", marginTop: "5px", lineHeight: 1.4 }}>{k.label}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Cargo cards */}
          <div className="space-y-2">
            {BANDAS.map((b, i) => {
              const isOpen = bandasOpen === i;
              const esiDiff    = ((b.empresa - b.esi.p50)    / b.esi.p50)    * 100;
              const avisosDiff = ((b.empresa - b.avisos.p50) / b.avisos.p50) * 100;
              const rlDiff     = ((b.empresa - b.rl.p50)     / b.rl.p50)     * 100;
              const avgDiff    = (esiDiff + avisosDiff + rlDiff) / 3;
              const statusColor = avgDiff >= 0 ? "#06D6A0" : avgDiff >= -5 ? "#F7C948" : "#FF4D5A";
              const statusLabel = avgDiff >= 0 ? "Sobre mediana" : avgDiff >= -5 ? "En borde" : "Bajo mediana";

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, ease: E }}
                  className="rounded-xl border border-white/8 bg-white/4 overflow-hidden">

                  {/* Header */}
                  <button className="w-full px-5 py-4 text-left hover:bg-white/3 transition-colors"
                    onClick={() => setBandasOpen(isOpen ? null : i)}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-semibold text-white" style={{ fontSize: "0.88rem" }}>{b.cargo}</span>
                        {b.n > 1 && <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-space-mono)" }}>×{b.n}</span>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Mini 3-dot source preview */}
                        <div className="hidden sm:flex items-center gap-1">
                          {([
                            { color: "#00B4D8", diff: esiDiff },
                            { color: "#F7C948", diff: avisosDiff },
                            { color: "#8568f3", diff: rlDiff },
                          ] as const).map((s, si) => (
                            <span key={si} className="text-xs font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.60rem", color: s.diff >= 0 ? s.color : s.diff >= -5 ? "#F7C948" : "#FF4D5A" }}>
                              {s.diff > 0 ? "+" : ""}{s.diff.toFixed(0)}%
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                          style={{ fontSize: "0.65rem", background: `${statusColor}14`, color: statusColor }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                          {statusLabel}
                        </span>
                        <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "rgba(255,255,255,0.50)" }}>
                          {fmtCLP(b.empresa)}
                        </span>
                        {isOpen ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded band chart */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                        <div className="px-5 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <BandChart b={b} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Data quality note */}
          <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(0,180,216,0.04)", border: "1px solid rgba(0,180,216,0.10)" }}>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
              <strong className="text-[#00B4D8]">Fuentes:</strong> ESI INE 2024 (Encuesta Suplementaria de Ingresos, muestra nacional expandida) ·
              Avisos laborales: portales Trabajando.cl + Computrabajo, medianas de los últimos 90 días en Región Valparaíso ·
              RemuneraLab: sueldos declarados por usuarios con ≥10 observaciones por cargo. Los percentiles se calculan sin ajuste por jornada.
              <span className="ml-1 text-white/20">Comparación filtrada por sector Gastronomía · Turismo y Hotelería.</span>
            </p>
          </div>
        </section>)}

        {/* ── M02 — Dotación mensual ── */}
        {activeSection === "dotacion" && (<section className="mb-8">
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
        </section>)}

        {/* ── M03 — Riesgo de rotación núcleo ── */}
        {activeSection === "rotacion" && (<section className="mb-8">
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
        </section>)}

        {/* ── M04 — Presión de mercado ── */}
        {activeSection === "mercado" && (<section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 04 · Presión de mercado
          </p>
          <h2 className="text-lg font-bold text-white mb-1">¿Cómo te está afectando el mercado hoy?</h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>
            Cruzamos los avisos activos de los últimos 90 días con las brechas salariales de tu equipo. Resultado: el índice de tensión y la probabilidad real de que ese cargo reciba una oferta mejor antes de fin de semestre.
          </p>

          {/* 3 summary KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {([
              { label: "Cargos con alta presión", valor: "3 de 6",       sub: "Garzón · Ayudante · Bartender",            color: "#FF4D5A" },
              { label: "Cargo más expuesto",       valor: "Ayud. Cocina", sub: "Tensión 88/100 · 78% prob. oferta",         color: "#F7C948" },
              { label: "Mayor brecha salarial",    valor: "−$73.000",     sub: "Ayudante Cocina vs. mediana de avisos /mes", color: "#FF8C42" },
            ] as const).map(k => (
              <div key={k.label} className="rounded-xl p-4 border border-white/8 bg-white/4">
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(255,255,255,0.30)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.05rem", color: k.color, lineHeight: 1.15 }}>{k.valor}</p>
                <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.28)", marginTop: "5px" }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Per-position cards */}
          <div className="space-y-3 mb-5">
            {MERCADO_IMPACT.map((m, i) => {
              const isAlta  = m.nivel === "alta";
              const isMedia = m.nivel === "media";
              const nivelColor = isAlta ? "#FF4D5A" : isMedia ? "#F7C948" : "#06D6A0";
              const nivelBg    = isAlta ? "rgba(255,77,90,0.10)" : isMedia ? "rgba(247,201,72,0.10)" : "rgba(6,214,160,0.08)";
              const nivelLabel = isAlta ? "Alta presión" : isMedia ? "Presión media" : "Presión baja";
              const probColor  = m.probOferta >= 65 ? "#FF4D5A" : m.probOferta >= 40 ? "#F7C948" : "#06D6A0";
              const probBg     = m.probOferta >= 65 ? "rgba(255,77,90,0.10)" : m.probOferta >= 40 ? "rgba(247,201,72,0.10)" : "rgba(6,214,160,0.08)";
              const tensColor  = m.tensionIdx >= 70 ? "#FF4D5A" : m.tensionIdx >= 45 ? "#F7C948" : "#06D6A0";
              const gapAbs     = m.med90d ? Math.abs(m.empresa - m.med90d) : 0;

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: E }}
                  className="rounded-xl border p-5"
                  style={{ background: isAlta ? "rgba(255,77,90,0.02)" : "rgba(255,255,255,0.02)", borderColor: isAlta ? "rgba(255,77,90,0.14)" : "rgba(255,255,255,0.07)" }}>

                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-white" style={{ fontSize: "0.9rem" }}>{m.cargo}</span>
                        <span style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-space-mono)" }}>×{m.n_empresa} en equipo</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold"
                          style={{ fontSize: "0.66rem", background: nivelBg, color: nivelColor }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: nivelColor }} />
                          {nivelLabel}
                        </span>
                        {m.nivel === "baja" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                            style={{ fontSize: "0.62rem", background: "rgba(6,214,160,0.08)", color: "#06D6A0", border: "1px solid rgba(6,214,160,0.15)" }}>
                            ✦ Ventana de oportunidad
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p style={{ fontSize: "0.58rem", fontFamily: "var(--font-space-mono)", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>
                        Prob. oferta externa · 90d
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full font-bold"
                        style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.95rem", background: probBg, color: probColor }}>
                        {m.probOferta}%
                      </span>
                    </div>
                  </div>

                  {/* Tension bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <p style={{ fontSize: "0.58rem", fontFamily: "var(--font-space-mono)", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Índice de tensión de mercado</p>
                      <p style={{ fontSize: "0.72rem", fontFamily: "var(--font-space-mono)", color: tensColor, fontWeight: 700 }}>{m.tensionIdx}/100</p>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{ width: `${m.tensionIdx}%`, background: `linear-gradient(90deg,${tensColor}88,${tensColor})` }} />
                    </div>
                  </div>

                  {/* Data grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Avisos */}
                    <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: "0.53rem", fontFamily: "var(--font-space-mono)", color: "rgba(255,255,255,0.26)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Avisos activos · últimos 90d</p>
                      <div className="flex items-end gap-2 mb-1">
                        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.5rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1 }}>{m.avisos90d}</p>
                        <span className="mb-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold"
                          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", background: m.avisosTrend >= 0 ? "rgba(255,77,90,0.10)" : "rgba(6,214,160,0.10)", color: m.avisosTrend >= 0 ? "#FF4D5A" : "#06D6A0" }}>
                          {m.avisosTrend >= 0 ? "▲" : "▼"} {Math.abs(m.avisosTrend).toFixed(1)}%
                        </span>
                      </div>
                      <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.25)" }}>vs. período anterior</p>
                    </div>

                    {/* Salary comparison */}
                    <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: "0.53rem", fontFamily: "var(--font-space-mono)", color: "rgba(255,255,255,0.26)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Sueldo empresa vs. mercado</p>
                      {m.med90d ? (<>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.38)" }}>Empresa</span>
                          <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.70rem", color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>{fmtCLP(m.empresa)}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.38)" }}>Mercado (med.)</span>
                          <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.70rem", color: "#00B4D8", fontWeight: 600 }}>{fmtCLP(m.med90d)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (m.empresa / m.med90d) * 100)}%`, background: m.salGap < -5 ? "#FF4D5A" : m.salGap < 0 ? "#F7C948" : "#06D6A0" }} />
                          </div>
                          <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-space-mono)", fontWeight: 700, color: m.salGap < -5 ? "#FF4D5A" : m.salGap < 0 ? "#F7C948" : "#06D6A0" }}>
                            {m.salGap > 0 ? "+" : ""}{m.salGap.toFixed(1)}%
                          </span>
                        </div>
                        {gapAbs > 0 && m.salGap < 0 && (
                          <p style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.22)", marginTop: "4px" }}>−{fmtCLP(gapAbs)}/mes vs. mediana de avisos</p>
                        )}
                      </>) : (
                        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)" }}>Sin datos suficientes</p>
                      )}
                    </div>
                  </div>

                  {/* Narrative */}
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, borderLeft: `3px solid ${nivelColor}30`, paddingLeft: "12px" }}>
                    {m.narrativa}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.22)" }}>
            Fuente: portales Trabajando.cl · Computrabajo · últimos 90 días (mar–may 2026). Índice de tensión calculado sobre avisos activos, tendencia y brecha salarial. Probabilidad de oferta: modelo estimativo.
          </p>
        </section>)}

        {/* ── Calculadora rotación ── */}
        {activeSection === "costo_rot" && (<section className="mb-8">

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Calculadora · Costo de rotación de personal
          </p>
          <h2 className="text-lg font-bold text-white mb-1">¿Cuánto le cuesta a tu empresa cada salida?</h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "24px", lineHeight: 1.6 }}>
            Cada cargo tiene un factor diferente según cuánto tarda en reemplazarse. Los factores van de{" "}
            <strong className="text-white">0.68× a 1.07×</strong> el sueldo mensual — muy por debajo del 1.5× anual
            que citan consultoras globales para cargos operativos.
          </p>

          {/* ── 3 métricas resumen ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Costo total 2026",  valor: fmtM(costoRotacion),                                                   sub: "9 salidas voluntarias estimadas",    color: "#FF4D5A" },
              { label: "Factor promedio",    valor: "1.0×",                                                                sub: "del sueldo mensual de referencia",   color: "#F7C948" },
              { label: "Ahorro potencial",   valor: fmtM(Math.round((9 - 20 * 0.25) / 9 * costoRotacion)),                sub: "si bajas de 45% → 25% rotación",    color: "#06D6A0" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4 border border-white/8 bg-white/4">
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(255,255,255,0.30)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.55rem", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.28)", marginTop: "5px" }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Cards por cargo ── */}
          <div className="space-y-3 mb-6">
            {COSTO_ROT.map((r, i) => {
              const isOpen = rotExpanded === i;
              const comps = [
                { nombre: "Curva aprendizaje", monto: r.curva_aprendizaje, color: "#FF4D5A", desc: "4–6 semanas al 65% de productividad del nuevo trabajador versus el que salió" },
                { nombre: "Vacante",           monto: r.vacante,           color: "#F7C948", desc: `${Math.round(r.vacante / (r.salario_ref / 30))} días con turno cubierto por hora extra o posición sin cubrir` },
                { nombre: "Trainer",           monto: r.trainer,           color: "#FF8C42", desc: "2 semanas de un trabajador senior a 80% de productividad por dedicarse a capacitar al nuevo" },
                { nombre: "Aviso laboral",     monto: r.aviso,             color: "#00B4D8", desc: "Publicación en Trabajando.cl, Computrabajo u otro portal durante el proceso de búsqueda" },
                { nombre: "Selección",         monto: r.seleccion,         color: "#2EC4B6", desc: "Horas de jefatura revisando CVs, coordinando y realizando entrevistas (estimado 8h × costo-hora)" },
                { nombre: "Documentación",     monto: r.documentacion,     color: "#06D6A0", desc: "Finiquito si aplica, contrato nuevo, alta en Previred, Caja de Compensación y AFP" },
              ].sort((a, b) => b.monto - a.monto);
              const factorColor = r.factor_meses >= 1.0 ? "#FF4D5A" : r.factor_meses >= 0.85 ? "#F7C948" : "#06D6A0";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: E }}
                  className="rounded-xl border border-white/8 bg-white/4 overflow-hidden">

                  {/* Header clickeable */}
                  <button className="w-full px-5 py-4 text-left hover:bg-white/3 transition-colors"
                    onClick={() => setRotExpanded(isOpen ? null : i)}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-white" style={{ fontSize: "0.92rem" }}>{r.categoria}</p>
                        <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.32)", marginTop: "2px" }}>
                          {r.n_salidas_estimadas} salida{r.n_salidas_estimadas > 1 ? "s" : ""} estimadas · Sueldo ref. {fmtCLP(r.salario_ref)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.9rem", color: factorColor }}>{r.factor_meses.toFixed(2)}× sueldo</p>
                          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.38)" }}>{fmtCLP(r.total)} por salida</p>
                        </div>
                        {isOpen ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                      </div>
                    </div>

                    {/* Barra de componentes apilada */}
                    <div className="flex h-2.5 rounded-full overflow-hidden mb-2" style={{ gap: "1px" }}>
                      {comps.map(c => (
                        <div key={c.nombre} className="h-full" style={{ width: `${Math.round(c.monto / r.total * 100)}%`, background: c.color }} />
                      ))}
                    </div>

                    {/* Leyenda compacta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-3">
                      {comps.map(c => (
                        <span key={c.nombre} className="flex items-center gap-1" style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.32)" }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                          {c.nombre} {Math.round(c.monto / r.total * 100)}%
                        </span>
                      ))}
                    </div>

                    {/* Costo anual */}
                    <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.30)" }}>Costo anual ({r.n_salidas_estimadas} salidas)</p>
                      <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.90rem", color: "#F7C948" }}>
                        {fmtCLP(r.total * r.n_salidas_estimadas)}
                      </p>
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                        <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

                          {/* ¿Por qué X× ? */}
                          <div className="rounded-lg px-4 py-3 mb-4" style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.14)" }}>
                            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                              <strong style={{ color: "#00C2FF" }}>¿Por qué {r.factor_meses.toFixed(2)}×?</strong>{" "}
                              La suma de los 6 componentes da {fmtCLP(r.total)}. Dividido por el sueldo de referencia
                              {" "}{fmtCLP(r.salario_ref)}: {fmtCLP(r.total)} ÷ {fmtCLP(r.salario_ref)} ={" "}
                              <strong className="text-white">{r.factor_meses.toFixed(2)} meses de sueldo</strong>.
                            </p>
                          </div>

                          {/* Filas de componentes */}
                          <div className="space-y-2">
                            {comps.map((c, j) => {
                              const pct = Math.round(c.monto / r.total * 100);
                              return (
                                <div key={j} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                                      <span className="font-semibold text-white" style={{ fontSize: "0.82rem" }}>{c.nombre}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.28)" }}>{pct}%</span>
                                      <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.80rem", color: c.color }}>{fmtCLP(c.monto)}</span>
                                    </div>
                                  </div>
                                  <div className="h-1 rounded-full mb-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color + "70" }} />
                                  </div>
                                  <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.32)", lineHeight: 1.55 }}>{c.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* ── Simulador de ahorro ── */}
          <div className="rounded-xl p-6 border border-white/8 bg-white/4 mb-4">
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "#06D6A0", letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: "4px" }}>
              Simulador de ahorro
            </p>
            <h3 className="font-bold text-white mb-1" style={{ fontSize: "1rem" }}>¿Cuánto ahorras si reduces la rotación?</h3>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", marginBottom: "20px" }}>
              Tu rotación voluntaria actual es <strong className="text-white">45%</strong> (9 salidas / 20 del núcleo).
              Mueve el slider para ver el impacto en el costo anual.
            </p>

            <div className="flex items-center gap-4 mb-5">
              <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.60rem", color: "rgba(255,255,255,0.32)", minWidth: "36px" }}>Meta</span>
              <input
                type="range" min={5} max={40} step={5} value={rotacionMeta}
                onChange={e => setRotacionMeta(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "#06D6A0" }}
              />
              <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.1rem", color: "#06D6A0", minWidth: "48px", textAlign: "right" }}>
                {rotacionMeta}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl p-4" style={{ background: "rgba(255,77,90,0.08)", border: "1px solid rgba(255,77,90,0.18)" }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Hoy · 45% rotación
                </p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.6rem", color: "#FF4D5A", lineHeight: 1 }}>{fmtM(costoRotacion)}</p>
                <p style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.28)", marginTop: "5px" }}>9 salidas · costo anual estimado</p>
              </div>
              {(() => {
                const metaExits = Math.round(20 * rotacionMeta / 100);
                const metaCosto = Math.round(metaExits / 9 * costoRotacion);
                const ahorro    = costoRotacion - metaCosto;
                return (
                  <div className="rounded-xl p-4" style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.18)" }}>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Meta · {rotacionMeta}% · {metaExits} salidas
                    </p>
                    <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.6rem", color: "#06D6A0", lineHeight: 1 }}>{fmtM(metaCosto)}</p>
                    <p style={{ fontSize: "0.68rem", color: "#06D6A0", marginTop: "5px", fontWeight: 600 }}>
                      Ahorro: {fmtM(ahorro)} / año
                    </p>
                  </div>
                );
              })()}
            </div>

            {rotacionMeta <= 30 && (
              <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.30)", marginBottom: "10px" }}>
                  Palancas clave para llegar al {rotacionMeta}%:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Convertir contratos a indefinido",        color: "#FF4D5A", show: true },
                    { label: "Ajuste salarial Ayudantes + Auxiliares",  color: "#FF4D5A", show: true },
                    { label: `Reajuste julio +${ICL.ir_sector}%`,       color: "#F7C948", show: true },
                    { label: "Contrato multi-temporada",                 color: "#00B4D8", show: rotacionMeta <= 25 },
                    { label: "Publicar bandas salariales internas",      color: "#06D6A0", show: rotacionMeta <= 20 },
                  ].filter(p => p.show).map((p, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: p.color + "18", color: p.color, border: `1px solid ${p.color}30` }}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nota metodología */}
          <div className="rounded-xl px-5 py-4 border-l-2" style={{ borderLeftColor: "rgba(0,180,216,0.35)", background: "rgba(0,180,216,0.04)" }}>
            <p style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
              <strong style={{ color: "rgba(255,255,255,0.55)" }}>Metodología:</strong>{" "}
              El factor 1.5× anual aplica a cargos profesionales especializados. Para operativos de gastronomía el
              costo real está entre 0.7 y 1.1 meses de sueldo. Los valores de aviso ($40k–$65k) se basan en tarifas
              de Trabajando.cl y Computrabajo. El costo de vacante supone 10 días promedio antes de cubrir la
              posición, calculado sobre jornada de 44h semanales a costo-hora del cargo.
            </p>
          </div>

        </section>)}

        {/* ── M06 — ICL ── */}
        {activeSection === "icl" && (<section className="mb-8">
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
        </section>)}

        {/* ── M07 — Brecha de género (nueva visualización) ── */}
        {activeSection === "brecha" && (<section className="mb-8">
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
        </section>)}

        {/* ── M08 — ENE Valparaíso ── */}
        {activeSection === "ene" && (<section className="mb-8">
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
        </section>)}

        {/* ── Cumplimiento laboral ── */}
        {activeSection === "cumplimiento" && (
        <section className="mb-8">
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#00C2FF", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 09 · Cumplimiento laboral
          </p>
          <h2 className="text-lg font-bold text-white mb-1">Radiografía preventiva</h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>
            Revisamos 3 áreas de cumplimiento clave. El objetivo no es alarmar — es anticipar antes de que aparezca un problema con la Dirección del Trabajo.
          </p>

          {/* Result banner */}
          <div className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4" style={{ background: "rgba(247,201,72,0.05)", border: "1px solid rgba(247,201,72,0.14)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(247,201,72,0.10)", border: "1px solid rgba(247,201,72,0.18)" }}>
              <Scale size={18} style={{ color: "#F7C948" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white" style={{ fontSize: "0.9rem" }}>Sin infracciones activas detectadas</p>
              <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                2 pilares en verde · 1 en ámbar · Revisar contratos a plazo fijo antes de julio 2026
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full" style={{ background: "#06D6A0", boxShadow: "0 0 6px rgba(6,214,160,0.5)" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#06D6A0", boxShadow: "0 0 6px rgba(6,214,160,0.5)" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#F7C948", boxShadow: "0 0 6px rgba(247,201,72,0.5)" }} />
            </div>
          </div>

          {/* 3 pillars */}
          {([
            {
              status: "verde" as const,
              num: "01",
              titulo: "Sueldos base vs. Ingreso Mínimo Mensual",
              ley: "Art. 44 Código del Trabajo · IMM vigente $500.000 / mes (nov. 2025)",
              hallazgo: "Los 20 trabajadores del núcleo superan el ingreso mínimo mensual. El sueldo más bajo es $554.000 (Auxiliar de Limpieza, jornada 40h), equivalente a $609.750 base 44h — 21.9% sobre el piso legal.",
              detalle: [
                { label: "IMM vigente 2026",          valor: "$500.000",       ok: true  },
                { label: "Salario mínimo en núcleo",  valor: "$554.000",       ok: true  },
                { label: "Margen sobre piso",         valor: "+10.8%",         ok: true  },
                { label: "Trabajadores en riesgo",    valor: "0 de 20",        ok: true  },
              ],
              accion: "Sin acción urgente. Monitorear decreto de reajuste IMM esperado para julio 2026 (históricamente +5–8%). Con un reajuste proyectado del 6%, el nuevo IMM sería ~$530.000 — todos los sueldos se mantienen en regla.",
              accionColor: "#06D6A0",
            },
            {
              status: "ambar" as const,
              num: "02",
              titulo: "Contratos a plazo fijo en núcleo estable",
              ley: "Art. 159 N°4 CT · Más de 1 año de renovación continua = indefinido de pleno derecho",
              hallazgo: "4 trabajadores del núcleo tienen contrato a plazo fijo: Diego L. (Ayudante Cocina), Francisca O. (Bodega), Fernanda F. y Vicente D. (Auxiliares). Si alguno supera 1 año de renovaciones continuas, el contrato se convierte en indefinido automáticamente — sin firma, sin acuerdo.",
              detalle: [
                { label: "Afectados en núcleo",         valor: "4 personas",         ok: false },
                { label: "Límite renovación (art. 159)", valor: "1 año continuo",     ok: false },
                { label: "Áreas afectadas",              valor: "Cocina + Apoyo",     ok: false },
                { label: "Costo de conversión",          valor: "$0 si es proactiva", ok: true  },
              ],
              accion: "Revisar fecha de inicio de cada contrato. Si alguno se aproxima a 12 meses de vigencia continua, convertirlo proactivamente a indefinido. El costo es cero y elimina el riesgo de demanda por desnaturalización de contrato (art. 161 CT) — un juicio laboral promedio supera los $3.000.000.",
              accionColor: "#F7C948",
            },
            {
              status: "verde" as const,
              num: "03",
              titulo: "Equidad de género — brecha salarial ajustada",
              ley: "Ley 20.348 · Art. 62 bis CT · Igualdad de remuneraciones por igual trabajo",
              hallazgo: "La brecha salarial ponderada del restaurante es de +1.4% (hombres sobre mujeres en cargos equivalentes), muy por debajo del umbral de alerta del 5% que activa una revisión DT. En nivel operativo calificado, las mujeres ganan en promedio 8.9% más — diferencial positivo documentable.",
              detalle: [
                { label: "Brecha global ajustada",  valor: "+1.4% (H > M)",           ok: true },
                { label: "Umbral revisión DT",      valor: ">5% en cargo equiv.",      ok: true },
                { label: "Jefaturas",               valor: "+1.0% (H > M)",            ok: true },
                { label: "Operativo calificado",    valor: "−8.9% (M gana más)",       ok: true },
              ],
              accion: "Sin acción urgente. Documentar las diferencias por razones objetivas: antigüedad, turno, propinas. Si la empresa supera 100 trabajadores, deberá elaborar el registro público de remuneraciones exigido por Ley 21.220.",
              accionColor: "#06D6A0",
            },
          ] as const).map((pillar, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: E }}
              className="rounded-xl border p-5 mb-4"
              style={{
                background: pillar.status === "ambar" ? "rgba(247,201,72,0.03)" : "rgba(6,214,160,0.02)",
                borderColor: pillar.status === "ambar" ? "rgba(247,201,72,0.15)" : "rgba(6,214,160,0.12)",
              }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: pillar.status === "ambar" ? "rgba(247,201,72,0.10)" : "rgba(6,214,160,0.08)" }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", fontWeight: 700, color: pillar.status === "ambar" ? "#F7C948" : "#06D6A0" }}>
                    {pillar.num}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold"
                      style={{ fontSize: "0.68rem", background: pillar.status === "ambar" ? "rgba(247,201,72,0.10)" : "rgba(6,214,160,0.08)", color: pillar.status === "ambar" ? "#F7C948" : "#06D6A0" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: pillar.status === "ambar" ? "#F7C948" : "#06D6A0" }} />
                      {pillar.status === "ambar" ? "Ámbar — revisar" : "Verde — en regla"}
                    </span>
                  </div>
                  <p className="font-semibold text-white" style={{ fontSize: "0.9rem" }}>{pillar.titulo}</p>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", marginTop: "4px" }}>{pillar.ley}</p>
                </div>
              </div>

              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: "16px" }}>{pillar.hallazgo}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {pillar.detalle.map((d, j) => (
                  <div key={j} className="rounded-lg px-3 py-2.5"
                    style={{ background: d.ok ? "rgba(6,214,160,0.05)" : "rgba(247,201,72,0.06)", border: `1px solid ${d.ok ? "rgba(6,214,160,0.12)" : "rgba(247,201,72,0.15)"}` }}>
                    <p style={{ fontSize: "0.53rem", fontFamily: "var(--font-space-mono)", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", lineHeight: 1.4 }}>{d.label}</p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: d.ok ? "#06D6A0" : "#F7C948" }}>{d.valor}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.025)", borderLeft: `3px solid ${pillar.accionColor}` }}>
                <p style={{ fontSize: "0.58rem", fontFamily: "var(--font-space-mono)", color: pillar.accionColor, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "5px" }}>
                  Acción recomendada
                </p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{pillar.accion}</p>
              </div>
            </motion.div>
          ))}

          <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(0,180,216,0.04)", border: "1px solid rgba(0,180,216,0.10)" }}>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
              <strong className="text-[#00B4D8]">Nota:</strong> Este análisis se basa en datos anonimizados proporcionados por la empresa y no reemplaza asesoría legal especializada.
              RemuneraLab actúa como herramienta de diagnóstico preventivo. Para validación jurídica, consultar con un abogado laboral o la Dirección del Trabajo (<strong className="text-white/40">www.dt.gob.cl</strong>).
            </p>
          </div>
        </section>)}

        {/* ── Recomendaciones ── */}
        {activeSection === "recomendaciones" && (<>
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
        </>)}
        </div>
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
