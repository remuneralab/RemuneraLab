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
function fmtK(n: number) {
  return `$${Math.round(n / 1000)}k`;
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

// Lookup: costo de reemplazar UN empleado de un cargo dado (from COSTO_ROT, fallback a "Otros")
const COSTO_REEMPLAZO_MAP: Record<string, number> = {
  "Ayudante de Cocina":  622_000,
  "Garzón/a Senior":     757_000,
  "Bartender":           805_000,
  "Auxiliar de Limpieza":380_000,
  "Encargado de Bodega": 640_000,
};
function costoReemplazo(cargo: string): number {
  return COSTO_REEMPLAZO_MAP[cargo] ?? COSTO_ROT.find(r => r.categoria === "Otros cargos núcleo")?.total ?? 640_000;
}

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
const TS = { background: "#ffffff", border: "1px solid #e5e2de", borderRadius: "8px", fontSize: "0.78rem", color: "#1c1c1a", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };

function TipDotacion({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const row = DOTACION.find(d => d.mes === label);
  return (
    <div style={TS} className="p-3 text-xs">
      <p className="font-bold text-[#041635] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-[#75777f]">{p.name === "nucleo" ? "Núcleo" : "Variable"}:</span>
          <span className="font-bold text-[#1c1c1a]">{p.value}</span>
        </div>
      ))}
      {row && <p className="text-[#9a9a9a] mt-2 pt-2 border-t border-[#e5e2de]">Costo empleador: {fmtM(row.costoEmpl)}</p>}
    </div>
  );
}

function TipBenchmark({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TS} className="p-3 text-xs">
      <p className="font-bold text-[#041635] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="text-[#75777f]">{p.name}:</span>
          <span className="font-bold text-[#1c1c1a]">{fmtCLP(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function estadoColor(e: "Óptimo" | "Alerta" | "Riesgo") {
  return {
    Óptimo: { bg: "rgba(42,125,79,0.10)", text: "#2a7d4f", dot: "#2a7d4f" },
    Alerta: { bg: "rgba(131,85,0,0.10)", text: "#835500", dot: "#835500" },
    Riesgo: { bg: "rgba(186,26,26,0.10)",  text: "#ba1a1a", dot: "#ba1a1a" },
  }[e];
}

function riesgoColor(r: number) {
  if (r >= 65) return { bar: "bg-[#ba1a1a]",  text: "text-[#ba1a1a]",  badge: "bg-[rgba(186,26,26,0.08)] text-[#ba1a1a]",    label: "Crítico"  };
  if (r >= 45) return { bar: "bg-[#835500]",  text: "text-[#835500]",  badge: "bg-[rgba(131,85,0,0.08)] text-[#835500]",     label: "Alto"     };
  if (r >= 25) return { bar: "bg-[#835500]",  text: "text-[#835500]",  badge: "bg-[rgba(131,85,0,0.06)] text-[#835500]",     label: "Moderado" };
  return              { bar: "bg-[#2a7d4f]",  text: "text-[#2a7d4f]",  badge: "bg-[rgba(42,125,79,0.08)] text-[#2a7d4f]",   label: "Bajo"     };
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
    { key: "esi",    label: "ESI INE 2024",      color: "#041635", data: b.esi    },
    { key: "avisos", label: "Avisos lab. 90d",    color: "#835500", data: b.avisos },
    { key: "rl",     label: "RemuneraLab",        color: "#374668", data: b.rl    },
  ];

  return (
    <div className="mt-4 space-y-4">
      {sources.map(({ key, label, color, data }) => {
        const p25p = pct(data.p25);
        const p50p = pct(data.p50);
        const p75p = pct(data.p75);
        const diff = ((b.empresa - data.p50) / data.p50) * 100;
        const dc   = diff < -5 ? "#ba1a1a" : diff < 0 ? "#835500" : "#2a7d4f";
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span style={{ fontSize: "0.6rem", color: "#75777f", fontFamily: "var(--font-space-mono)" }}>{label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "0.58rem", color: "#aaaaaa", fontFamily: "var(--font-space-mono)" }}>
                  P25 {fmtCLP(data.p25)} · P50 {fmtCLP(data.p50)} · P75 {fmtCLP(data.p75)}
                </span>
                <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.64rem", fontWeight: 700, color: dc }}>
                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="relative h-5">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full" style={{ background: "#eae8e4" }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full"
                style={{ left: `${p25p}%`, width: `${p75p - p25p}%`, background: `${color}18`, border: `1px solid ${color}28` }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{ left: `${p50p}%`, background: color, zIndex: 2 }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                style={{ left: `${empPct}%`, background: "#1c1c1a", zIndex: 3 }} />
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-2" style={{ borderTop: "1px solid #e5e2de" }}>
        {([
          { sym: "●", label: "P50 fuente", c: "#9a9a9a" },
          { sym: "◆", label: `Empresa · ${fmtCLP(b.empresa)}`, c: "#44474e" },
        ] as const).map(l => (
          <span key={l.label} style={{ fontSize: "0.58rem", color: l.c, fontFamily: "var(--font-space-mono)" }}>
            {l.sym}  {l.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.56rem", color: "#aaaaaa", fontFamily: "var(--font-space-mono)" }}>
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
      style={{ width: "240px", background: "#041635", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 40 }}
    >
      <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span className="font-bold italic text-white" style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.2rem" }}>RemuneraLab</span>
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.46rem", letterSpacing: "0.22em", color: "rgba(255,183,77,0.65)", textTransform: "uppercase", marginTop: "4px" }}>
          Demo empresarial
        </p>
      </div>
      <div className="px-6 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.46rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", lineHeight: 1.6 }}>
          {EMPRESA}
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto py-3">

        {/* ── Acceso al panel principal ── */}
        <div
          onClick={() => onSection("resumen")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all hover:brightness-110 cursor-pointer"
          style={{
            background: section === "resumen" ? "rgba(255,183,77,0.15)" : "rgba(255,255,255,0.04)",
            border: section === "resumen" ? "1px solid rgba(255,183,77,0.4)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <LayoutDashboard size={14} style={{ color: "#FFB74D", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "#FFB74D", fontWeight: 500 }}>
            Panel principal
          </span>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 4px 6px" }} />

        {NAV.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSection(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
              style={{
                background: active ? "rgba(255,183,77,0.12)" : "transparent",
                border: active ? "1px solid rgba(255,183,77,0.3)" : "1px solid transparent",
              }}
            >
              <Icon size={14} style={{ color: active ? "#FFB74D" : "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: active ? "#ffffff" : "rgba(255,255,255,0.4)", fontWeight: active ? 500 : 400 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <span
          className="inline-block mb-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,183,77,0.15)", color: "#FFB74D", border: "1px solid rgba(255,183,77,0.3)", fontFamily: "var(--font-space-mono)" }}
        >
          Demo activa
        </span>
        <a
          href="/empresas/reporte"
          className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
          style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.46rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}
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
      style={{ background: "#041635", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center justify-between px-5 h-12">
        <span className="font-bold italic text-white" style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.1rem" }}>RemuneraLab</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSection("resumen")}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(255,183,77,0.15)", color: "#FFB74D", border: "1px solid rgba(255,183,77,0.3)" }}
          >
            <LayoutDashboard size={11} /> Panel principal
          </button>
          <a
            href="/empresas/reporte"
            className="text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            Imprimir
          </a>
        </div>
      </div>
      <div className="flex overflow-x-auto px-2 pb-2 gap-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {NAV.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSection(item.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0"
              style={{
                background: active ? "rgba(255,183,77,0.12)" : "transparent",
                border: active ? "1px solid rgba(255,183,77,0.3)" : "1px solid transparent",
                color: active ? "#FFB74D" : "rgba(255,255,255,0.4)",
              }}
            >
              <Icon size={10} style={{ color: active ? "#FFB74D" : "rgba(255,255,255,0.3)" }} />
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fcf9f5" }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: E }}
        className={`relative z-10 w-full max-w-sm ${shake ? "animate-shake" : ""}`}
        style={shake ? { animation: "shake 0.4s ease" } : {}}
      >
        <div className="text-center mb-8">
          <p className="font-bold italic mb-2" style={{ fontFamily: "var(--font-dm-serif)", color: "#041635", fontSize: "1.6rem" }}>
            RemuneraLab
          </p>
          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "rgba(4,22,53,0.4)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Demo empresarial · Acceso restringido
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#ffffff", border: "1px solid #e5e2de" }}>
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(4,22,53,0.08)", border: "1px solid #c5c6cf" }}>
              <Lock size={20} style={{ color: "#041635" }} />
            </div>
          </div>
          <h1 className="text-[#1c1c1a] text-center font-bold mb-1" style={{ fontSize: "1.15rem" }}>Acceso al demo</h1>
          <p className="text-center mb-6" style={{ fontSize: "0.78rem", color: "#75777f" }}>
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
                className="w-full px-4 py-3.5 pr-11 rounded-lg text-white text-sm placeholder:text-[#9a9a9a] transition-all focus:outline-none"
                style={{
                  background: "#e5e2de",
                  border: err ? "1px solid #ba1a1a" : "1px solid #c5c6cf",
                }}
              />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-white/60 transition-colors">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <AnimatePresence>
              {err && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-xs" style={{ color: "#ba1a1a" }}>
                  Contraseña incorrecta
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: "#041635", color: "#ffffff" }}
            >
              <ArrowRight size={16} /> Ingresar al dashboard
            </button>
          </form>
        </div>

        <p className="text-center mt-5" style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>
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
  const [benchExpand, setBenchExpand] = useState(false);
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
    <div className="relative min-h-screen" style={{ background: "#fcf9f5", fontFamily: "var(--font-dm-sans)" }}>
      {/* Glows */}

      <MobileNav section={activeSection} onSection={switchSection} />
      <Sidebar section={activeSection} onSection={switchSection} />

      <main className="relative z-10 lg:ml-[240px]">
        <div className="px-4 sm:px-6 pt-[100px] lg:pt-8 pb-12 max-w-5xl mx-auto">

        {activeSection === "resumen" && (<>

        {/* ── Vista General ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }}
          className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1c1a]">Vista General</h1>
            <p style={{ fontSize: "0.85rem", color: "#75777f", marginTop: "2px" }}>
              {FECHA} · 20 colaboradores activos
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a", border: "1px solid rgba(186,26,26,0.18)" }}>
            <AlertTriangle size={13} /> 2 alertas activas
          </span>
        </motion.div>

        {/* ─── Alerta principal ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, ease: E }}
          className="rounded-xl p-5 mb-6 flex items-start justify-between gap-4 flex-wrap"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1c1c1a] mb-1" style={{ fontSize: "1rem" }}>
              Tu Ayudante de Cocina y tus Garzones están bajo el mercado
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
              <span style={{ fontSize: "0.82rem", color: "#44474e" }}>
                Ayudante Cocina paga <strong>{fmtCLP(587_000)}</strong> · Mercado <strong>{fmtCLP(650_000)}</strong>
              </span>
              <span style={{ fontSize: "0.82rem", color: "#44474e" }}>
                Garzón paga <strong>{fmtCLP(710_000)}</strong> · Mercado <strong>{fmtCLP(720_000)}</strong>
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p style={{ fontSize: "0.72rem", color: "#75777f", marginBottom: "2px" }}>Reemplazar los 2 Ayudantes de Cocina</p>
            <p className="font-bold text-[#ba1a1a]" style={{ fontSize: "1.5rem", lineHeight: 1 }}>{fmtM(2 * costoReemplazo("Ayudante de Cocina"))}</p>
            <button onClick={() => switchSection("costo_rot")}
              className="inline-flex items-center gap-1 mt-1 hover:underline"
              style={{ fontSize: "0.75rem", color: "#041635", fontWeight: 600 }}>
              ¿Cómo se calcula? <ChevronRight size={11} />
            </button>
          </div>
        </motion.div>

        {/* ─── Estado del equipo ─── */}
        <p className="font-semibold text-[#1c1c1a] mb-3" style={{ fontSize: "0.9rem" }}>Estado de tu equipo</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(["Garzón/a Senior","Bartender","Cocinero de Partida","Ayudante de Cocina"] as const).map((cargo, i) => {
            const b = BENCHMARK.find(x => x.cargo === cargo)!;
            const col = estadoColor(b.estado);
            const gap = b.empresa - b.p50;
            return (
              <motion.div key={cargo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, ease: E }}
                onClick={() => switchSection("benchmark")}
                className="rounded-xl p-4 bg-white border border-[#e5e2de] cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-1 mb-3">
                  <p className="font-semibold text-[#1c1c1a] leading-snug" style={{ fontSize: "0.8rem" }}>{b.cargo}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                    style={{ background: col.bg, color: col.text }}>
                    {b.estado}
                  </span>
                </div>
                <p className="font-bold text-[#1c1c1a] tabular-nums" style={{ fontSize: "1.1rem" }}>{fmtCLP(b.empresa)}</p>
                <p style={{ fontSize: "0.72rem", color: "#75777f", marginTop: "2px" }}>Mercado {fmtCLP(b.p50)}</p>
                <p className="font-semibold tabular-nums mt-1.5" style={{ fontSize: "0.75rem", color: gap >= 0 ? "#2a7d4f" : "#ba1a1a" }}>
                  {gap >= 0 ? "+" : ""}{fmtCLP(Math.abs(gap))}/mes {gap >= 0 ? "sobre" : "bajo"} mercado
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── ¿Qué te conviene hacer? ─── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, ease: E }}
          className="rounded-xl border border-[#e5e2de] bg-white p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <p className="font-semibold text-[#1c1c1a]">¿Qué te conviene hacer con el Ayudante de Cocina?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              {
                title: "Ajustar el sueldo ahora",
                desc: "Subir $63.000/mes cierra la brecha con el mercado. Para los 2 ayudantes el sobrecosto es $126.000/mes — menos del 1% de tu nómina mensual.",
                detalle: `Evita ${fmtM(2 * costoReemplazo("Ayudante de Cocina"))} en reemplazos`,
                recomienda: true,
                section: "benchmark" as Section,
              },
              {
                title: "No hacer nada",
                desc: `Con 78% de probabilidad de oferta externa en 90 días, perder a ambos antes de enero es el escenario más probable. Reemplazar a cada uno cuesta ${fmtK(costoReemplazo("Ayudante de Cocina"))}.`,
                detalle: `Riesgo: ${fmtM(2 * costoReemplazo("Ayudante de Cocina"))} (×2 Ayudantes)`,
                recomienda: false,
                section: "costo_rot" as Section,
              },
              {
                title: "Formalizar los contratos",
                desc: "Ambos están en plazo fijo. Pasar a indefinido reduce el score de riesgo de 78→45 y mejora la percepción de estabilidad laboral sin costo salarial adicional.",
                detalle: "Sin costo adicional",
                recomienda: false,
                section: "rotacion" as Section,
              },
              {
                title: "Comunicar las bandas internas",
                desc: "El 84% renuncia porque no sabe si está bien pagado. Publicar internamente el P50 de mercado tiene efecto inmediato en la intención de búsqueda activa.",
                detalle: "Sin costo · Efecto inmediato",
                recomienda: false,
                section: "recomendaciones" as Section,
              },
            ]).map((opt, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.06, ease: E }}
                onClick={() => switchSection(opt.section)}
                className="rounded-lg p-4 cursor-pointer group transition-all"
                style={{
                  background: opt.recomienda ? "rgba(131,85,0,0.05)" : "#f6f3ef",
                  border: `1px solid ${opt.recomienda ? "#835500" : "#e5e2de"}`,
                }}>
                {opt.recomienda && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-2"
                    style={{ background: "rgba(131,85,0,0.12)", color: "#835500" }}>
                    ✦ Recomendado
                  </span>
                )}
                <p className="font-semibold text-[#1c1c1a] mb-1" style={{ fontSize: "0.88rem" }}>{opt.title}</p>
                <p style={{ fontSize: "0.78rem", color: "#75777f", lineHeight: 1.55, marginBottom: "10px" }}>{opt.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ fontSize: "0.75rem", color: opt.recomienda ? "#835500" : "#44474e" }}>
                    {opt.detalle}
                  </span>
                  <ChevronRight size={13} style={{ color: "#9a9a9a" }} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Dato del sector ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, ease: E }}
          className="rounded-xl p-4 border border-[#e5e2de] flex items-start gap-3"
          style={{ background: "#f6f3ef" }}>
          <TrendingDown size={16} style={{ color: "#835500", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ fontSize: "0.82rem", color: "#44474e", lineHeight: 1.65 }}>
            <strong className="text-[#041635]">Dato del sector:</strong> En gastronomía Valparaíso la rotación de Ayudantes de Cocina promedia cada 18 meses. Perder uno en peak de temporada (diciembre–enero) implica hasta 3 meses de curva de aprendizaje. El mejor momento para retener es antes de la alta temporada — no después.
          </p>
        </motion.div>

        </>)}

        {activeSection === "benchmark" && (<>

        {/* ── Diagnóstico en una línea ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Sueldos vs. mercado</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>
            {FECHA} · {REGION}
          </p>
        </motion.div>

        {/* ── Resumen de situación ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              3 cargos están bajo el mercado. Ajustarlos cuesta <span className="text-[#2a7d4f]">$232k/mes</span> — reemplazar a los 5 en riesgo te costaría <span className="text-[#ba1a1a]">{fmtM(costoReemplazo("Ayudante de Cocina")*2 + costoReemplazo("Encargado de Bodega") + costoReemplazo("Auxiliar de Limpieza")*2)}</span>.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              Ayudante de Cocina · Encargado de Bodega · Auxiliar de Limpieza
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {([
              { n: riesgos, label: "Acción urgente", color: "#ba1a1a", bg: "rgba(186,26,26,0.08)" },
              { n: alertas, label: "Monitorear",     color: "#835500", bg: "rgba(131,85,0,0.08)" },
              { n: optimos, label: "Sin cambios",    color: "#2a7d4f", bg: "rgba(42,125,79,0.08)" },
            ]).map(s => (
              <div key={s.label} className="text-center rounded-lg px-4 py-2" style={{ background: s.bg }}>
                <p className="font-bold tabular-nums text-xl" style={{ color: s.color }}>{s.n}</p>
                <p style={{ fontSize: "0.65rem", color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── BLOQUE 1: Acción inmediata (Riesgo) ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <p className="font-semibold text-[#1c1c1a]">Acción inmediata — {riesgos} cargos bajo el percentil 25</p>
          </div>
          <div className="space-y-3">
            {BENCHMARK.filter(b => b.estado === "Riesgo").map((b, i) => {
              const gap       = b.p50 - b.empresa;
              const costoAj   = gap * b.n;
              const cReempl   = costoReemplazo(b.cargo);
              return (
                <motion.div key={b.cargo} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.06, ease: E }}
                  className="rounded-xl bg-white border border-[#e5e2de] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.92rem" }}>{b.cargo}</span>
                        {b.n > 1 && <span style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>×{b.n} personas</span>}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>
                          Bajo mercado
                        </span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "#44474e" }}>
                        Pagás <strong className="text-[#1c1c1a]">{fmtCLP(b.empresa)}</strong>
                        {" · "}Mercado P50 <strong className="text-[#1c1c1a]">{fmtCLP(b.p50)}</strong>
                        {" · "}Diferencia <strong className="text-[#ba1a1a]">−{fmtCLP(gap)}/mes</strong> por persona
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0 flex-wrap">
                      <div className="text-center rounded-lg px-3 py-2" style={{ background: "rgba(42,125,79,0.07)", border: "1px solid rgba(42,125,79,0.15)" }}>
                        <p className="font-bold tabular-nums" style={{ fontSize: "0.88rem", color: "#2a7d4f" }}>+{fmtCLP(costoAj)}/mes</p>
                        <p style={{ fontSize: "0.62rem", color: "#2a7d4f" }}>costo de ajustar</p>
                      </div>
                      <div className="text-center rounded-lg px-3 py-2" style={{ background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.12)" }}>
                        <p className="font-bold tabular-nums" style={{ fontSize: "0.88rem", color: "#ba1a1a" }}>{fmtK(cReempl)}</p>
                        <p style={{ fontSize: "0.62rem", color: "#ba1a1a" }}>costo si se va uno</p>
                      </div>
                    </div>
                  </div>
                  {/* Desglose compacto del costo de reemplazo */}
                  <div className="rounded-lg px-3 py-2.5 flex flex-wrap items-center justify-between gap-2"
                    style={{ background: "#f6f3ef", border: "1px solid #e5e2de" }}>
                    <p style={{ fontSize: "0.72rem", color: "#75777f" }}>
                      ≈ {(cReempl / b.empresa).toFixed(2)}× sueldo mensual · aviso + selección + vacante + curva de aprendizaje
                    </p>
                    <button
                      onClick={() => switchSection("costo_rot")}
                      className="flex items-center gap-1 hover:opacity-70 transition-opacity shrink-0"
                      style={{ fontSize: "0.72rem", color: "#041635", fontWeight: 600 }}>
                      Ver cómo se calcula <ChevronRight size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── BLOQUE 2: Monitorear (Alerta) ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#835500]" />
            <p className="font-semibold text-[#1c1c1a]">Monitorear — {alertas} cargos en zona de borde</p>
          </div>
          <div className="rounded-xl bg-white border border-[#e5e2de] p-4">
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginBottom: "12px" }}>
              Están cerca del mercado pero si los sueldos siguen subiendo, en 6 meses pueden pasar a riesgo. No requieren acción hoy, pero sí seguimiento.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BENCHMARK.filter(b => b.estado === "Alerta").map(b => {
                const gap = b.p50 - b.empresa;
                return (
                  <div key={b.cargo} className="flex items-center justify-between rounded-lg px-3 py-2.5"
                    style={{ background: "#f6f3ef" }}>
                    <div>
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.84rem" }}>{b.cargo}</span>
                      {b.n > 1 && <span className="ml-1.5 text-[#9a9a9a]" style={{ fontSize: "0.7rem" }}>×{b.n}</span>}
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums font-semibold" style={{ fontSize: "0.82rem", color: gap > 0 ? "#835500" : "#2a7d4f" }}>
                        {gap > 0 ? `−${fmtCLP(gap)}` : `+${fmtCLP(Math.abs(gap))}`}/mes
                      </p>
                      <p style={{ fontSize: "0.62rem", color: "#9a9a9a" }}>vs. P50 mercado</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── BLOQUE 3: Sin acción requerida (Óptimo) ── */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a7d4f]" />
            <p className="font-semibold text-[#1c1c1a]">Sin acción requerida — {optimos} cargos en posición competitiva</p>
          </div>
          <div className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5 items-center">
            {BENCHMARK.filter(b => b.estado === "Óptimo").map(b => (
              <span key={b.cargo} className="flex items-center gap-1.5" style={{ fontSize: "0.82rem", color: "#44474e" }}>
                <CheckCircle2 size={13} style={{ color: "#2a7d4f", flexShrink: 0 }} />
                <span className="font-semibold text-[#1c1c1a]">{b.cargo}</span>
                <span className="text-[#9a9a9a]">{fmtCLP(b.empresa)} · P{b.percentil}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Ver datos completos (colapsable) ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, ease: E }}>
          <button
            onClick={() => setBenchExpand(v => !v)}
            className="flex items-center gap-2 mb-3 hover:opacity-70 transition-opacity"
            style={{ fontSize: "0.82rem", color: "#75777f", fontWeight: 600 }}>
            {benchExpand ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {benchExpand ? "Ocultar tabla completa" : "Ver tabla completa con todos los datos"}
          </button>

          <AnimatePresence>
            {benchExpand && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                <div className="flex justify-end mb-2">
                  <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#f0ede9" }}>
                    {(["table", "chart"] as const).map(t => (
                      <button key={t} onClick={() => setBenchTab(t)}
                        className="px-3 py-1 rounded text-xs font-semibold transition-all"
                        style={benchTab === t ? { background: "#ffffff", color: "#041635", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : { color: "#75777f" }}>
                        {t === "table" ? "Tabla" : "Gráfico"}
                      </button>
                    ))}
                  </div>
                </div>

                {benchTab === "table" ? (
                  <div className="rounded-xl overflow-hidden border border-[#e5e2de] mb-3">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: "#f6f3ef", borderBottom: "1px solid #e5e2de" }}>
                          {["Cargo", "P25", "P50 mercado", "P75", "Sueldo empresa", "Percentil", "Estado"].map(h => (
                            <th key={h} className="px-4 py-3 text-left"
                              style={{ fontSize: "0.65rem", color: "#75777f", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {BENCHMARK.map((b, i) => {
                          const col = estadoColor(b.estado);
                          return (
                            <tr key={i} style={{ borderBottom: "1px solid #eae8e4" }} className="hover:bg-[#f6f3ef] transition-colors">
                              <td className="px-4 py-3 font-semibold text-[#1c1c1a]" style={{ fontSize: "0.82rem" }}>
                                {b.cargo}
                                {b.n > 1 && <span className="ml-2 text-[#9a9a9a] text-xs font-normal">×{b.n}</span>}
                              </td>
                              <td className="px-4 py-3 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "#9a9a9a" }}>{fmtCLP(b.p25)}</td>
                              <td className="px-4 py-3 tabular-nums font-semibold text-[#1c1c1a]" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem" }}>{fmtCLP(b.p50)}</td>
                              <td className="px-4 py-3 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: "#9a9a9a" }}>{fmtCLP(b.p75)}</td>
                              <td className="px-4 py-3 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: b.empresa >= b.p50 ? "#2a7d4f" : b.empresa >= b.p25 ? "#835500" : "#ba1a1a" }}>
                                {fmtCLP(b.empresa)}
                              </td>
                              <td className="px-4 py-3 tabular-nums font-bold" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: col.text }}>P{b.percentil}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: col.bg, color: col.text }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: col.dot }} />{b.estado}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#e5e2de] bg-white p-5 h-[320px] mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={BENCHMARK} barCategoryGap="25%" barGap={3} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e2de" vertical={false} />
                        <XAxis dataKey="cargo" axisLine={false} tickLine={false}
                          tick={{ fontSize: 9, fill: "#75777f", angle: -35, textAnchor: "end" }} interval={0} />
                        <YAxis axisLine={false} tickLine={false}
                          tick={{ fontSize: 10, fill: "#75777f" }} tickFormatter={fmtAxis} width={62} />
                        <Tooltip content={<TipBenchmark />} cursor={{ fill: "rgba(4,22,53,0.03)" }} />
                        <Bar dataKey="p50"     name="P50 mercado" fill="rgba(4,22,53,0.15)" radius={[3,3,0,0]} barSize={14} />
                        <Bar dataKey="empresa" name="Empresa"     fill="#041635"             radius={[3,3,0,0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>
                  Benchmark ESI 2024 INE · CIUO-08 · Sector gastronomía + hotelería · Región de {REGION}.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        </>)}

        {/* ── Bandas salariales ── */}
        {activeSection === "bandas" && (<section className="mb-8">

        {/* Diagnóstico en una línea */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Bandas salariales</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · 3 fuentes · {REGION}</p>
        </motion.div>

        {/* Decisión clave */}
        {(() => {
          const bajoPorLasTres = BANDAS.filter(b => b.empresa < b.esi.p50 && b.empresa < b.avisos.p50 && b.empresa < b.rl.p50);
          return bajoPorLasTres.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
              className="rounded-xl p-5 mb-7"
              style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
              <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
                {bajoPorLasTres.length} cargo{bajoPorLasTres.length > 1 ? "s están" : " está"} sistemáticamente bajo la mediana en las 3 fuentes.
                Ajustar ahora es más barato que reemplazar.
              </p>
              <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
                {bajoPorLasTres.map(b => b.cargo).join(" · ")}
              </p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
              className="rounded-xl p-4 mb-7 flex items-center gap-3"
              style={{ background: "rgba(42,125,79,0.04)", border: "1px solid rgba(42,125,79,0.15)", borderLeft: "4px solid #2a7d4f" }}>
              <CheckCircle2 size={16} style={{ color: "#2a7d4f", flexShrink: 0 }} />
              <p style={{ fontSize: "0.9rem", color: "#1c1c1a", fontWeight: 600 }}>
                Ningún cargo está bajo la mediana en las 3 fuentes simultáneamente. Posición sólida.
              </p>
            </motion.div>
          );
        })()}

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 01b · Bandas salariales
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-1">¿Cuánto paga el mercado — y de dónde viene ese número?</h2>
          <p style={{ fontSize: "0.82rem", color: "#75777f", marginBottom: "20px" }}>
            Tres fuentes distintas para cada cargo: la encuesta oficial INE, lo que ofrecen los avisos laborales activos, y los sueldos declarados por usuarios de RemuneraLab. El diamante negro es la posición de tu empresa.
          </p>

          {/* Context chips + leyenda fuentes */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {(["Gastronomía · Turismo", "Región Valparaíso", "Empresa 11–25 trab."] as const).map(c => (
                <span key={c} className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: "rgba(4,22,53,0.05)", border: "1px solid #c5c6cf", color: "#44474e", fontFamily: "var(--font-space-mono)", fontSize: "0.58rem" }}>
                  {c}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {([
                { color: "#041635", label: "ESI INE 2024" },
                { color: "#835500", label: "Avisos 90d" },
                { color: "#374668", label: "RemuneraLab" },
              ] as const).map(s => (
                <span key={s.label} className="flex items-center gap-1.5"
                  style={{ fontSize: "0.62rem", color: "#75777f", fontFamily: "var(--font-space-mono)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
              <span className="flex items-center gap-1.5"
                style={{ fontSize: "0.62rem", color: "#44474e", fontFamily: "var(--font-space-mono)" }}>
                <span className="w-2 h-2 rotate-45 inline-block" style={{ background: "#1c1c1a" }} />
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
                  { label: "Sobre P50 ESI INE",    n: sobreEsi,    total: BANDAS.length, color: "#041635" },
                  { label: "Sobre P50 Avisos 90d",  n: sobreAvisos, total: BANDAS.length, color: "#835500" },
                  { label: "Sobre P50 RemuneraLab", n: sobreRl,     total: BANDAS.length, color: "#374668" },
                ] as const).map(k => (
                  <div key={k.label} className="rounded-xl p-4 border border-[#e5e2de] bg-white">
                    <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: k.color, lineHeight: 1 }}>
                      {k.n}<span style={{ fontSize: "0.8rem", color: "#75777f" }}>/{k.total}</span>
                    </p>
                    <p style={{ fontSize: "0.62rem", color: "#75777f", marginTop: "5px", lineHeight: 1.4 }}>{k.label}</p>
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
              const statusColor = avgDiff >= 0 ? "#2a7d4f" : avgDiff >= -5 ? "#835500" : "#ba1a1a";
              const statusLabel = avgDiff >= 0 ? "Sobre mediana" : avgDiff >= -5 ? "En borde" : "Bajo mediana";

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, ease: E }}
                  className="rounded-xl border border-[#e5e2de] bg-white overflow-hidden">

                  {/* Header */}
                  <button className="w-full px-5 py-4 text-left hover:bg-transparent transition-colors"
                    onClick={() => setBandasOpen(isOpen ? null : i)}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.88rem" }}>{b.cargo}</span>
                        {b.n > 1 && <span style={{ fontSize: "0.65rem", color: "#9a9a9a", fontFamily: "var(--font-space-mono)" }}>×{b.n}</span>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Mini 3-dot source preview */}
                        <div className="hidden sm:flex items-center gap-1">
                          {([
                            { color: "#041635", diff: esiDiff },
                            { color: "#835500", diff: avisosDiff },
                            { color: "#374668", diff: rlDiff },
                          ] as const).map((s, si) => (
                            <span key={si} className="text-xs font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.60rem", color: s.diff >= 0 ? s.color : s.diff >= -5 ? "#835500" : "#ba1a1a" }}>
                              {s.diff > 0 ? "+" : ""}{s.diff.toFixed(0)}%
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                          style={{ fontSize: "0.65rem", background: `${statusColor}14`, color: statusColor }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                          {statusLabel}
                        </span>
                        <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#44474e" }}>
                          {fmtCLP(b.empresa)}
                        </span>
                        {isOpen ? <ChevronUp size={13} className="text-[#9a9a9a]" /> : <ChevronDown size={13} className="text-[#9a9a9a]" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded band chart */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                        <div className="px-5 pb-5" style={{ borderTop: "1px solid #e5e2de" }}>
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
          <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(4,22,53,0.03)", border: "1px solid #e5e2de" }}>
            <p style={{ fontSize: "0.72rem", color: "#75777f", lineHeight: 1.65 }}>
              <strong className="text-[#041635]">Fuentes:</strong> ESI INE 2024 (Encuesta Suplementaria de Ingresos, muestra nacional expandida) ·
              Avisos laborales: portales Trabajando.cl + Computrabajo, medianas de los últimos 90 días en Región Valparaíso ·
              RemuneraLab: sueldos declarados por usuarios con ≥10 observaciones por cargo. Los percentiles se calculan sin ajuste por jornada.
              <span className="ml-1 text-white/20">Comparación filtrada por sector Gastronomía · Turismo y Hotelería.</span>
            </p>
          </div>
        </section>)}

        {/* ── M02 — Dotación mensual ── */}
        {activeSection === "dotacion" && (<section className="mb-8">

        {/* Decisión clave */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Dotación y masa salarial</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · Evolución mensual 2026</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "#f6f3ef", border: "1px solid #e5e2de", borderLeft: "4px solid #835500" }}>
          <TrendingDown size={16} style={{ color: "#835500", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p className="font-semibold text-[#1c1c1a] mb-0.5" style={{ fontSize: "0.9rem" }}>
              El peak de julio duplica el personal variable. Contratar con 6 semanas de anticipación reduce el costo por vacante en un 40%.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#75777f" }}>
              Núcleo estable: 20 personas · Variable estacional: hasta 12 adicionales en temporada alta (enero, julio)
            </p>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 02 · Dotación y masa salarial
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-4">Evolución mensual 2026 — Núcleo + Personal variable</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Dotación */}
            <div className="rounded-xl border border-[#e5e2de] bg-white p-5">
              <p className="text-xs font-semibold text-[#75777f] mb-4">Personas por mes</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DOTACION} barCategoryGap="20%" barGap={2} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e2de" vertical={false} />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#75777f" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#75777f" }} domain={[0, 35]} />
                    <Tooltip content={<TipDotacion />} cursor={{ fill: "#ffffff" }} />
                    <Bar dataKey="nucleo"   name="nucleo"   fill="#041635" radius={[3,3,0,0]} barSize={12} stackId="a" />
                    <Bar dataKey="variable" name="variable" fill="rgba(4,22,53,0.2)" radius={[3,3,0,0]} barSize={12} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-3 text-xs">
                {[{ color: "#041635", label: "Núcleo (20)" }, { color: "rgba(4,22,53,0.25)", label: "Variable" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                    <span style={{ color: "#75777f" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Costo empleador mensual */}
            <div className="rounded-xl border border-[#e5e2de] bg-white p-5">
              <p className="text-xs font-semibold text-[#75777f] mb-4">Costo total empleador mensual</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DOTACION} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e2de" vertical={false} />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#75777f" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#75777f" }} tickFormatter={fmtAxis} width={58} domain={[25_000_000, 45_000_000]} />
                    <Tooltip formatter={(v: unknown) => typeof v === "number" ? fmtCLP(v) : String(v)} cursor={{ stroke: "rgba(4,22,53,0.08)" }} contentStyle={TS} labelStyle={{ color: "#041635", fontWeight: 700 }} />
                    <ReferenceLine y={33_826_550} stroke="rgba(131,85,0,0.5)" strokeDasharray="4 4" label={{ value: "Promedio", position: "right", fill: "#835500", fontSize: 9 }} />
                    <Line dataKey="costoEmpl" name="Costo empleador" stroke="#2a7d4f" strokeWidth={2} dot={{ fill: "#2a7d4f", r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "#75777f" }}>
                <span className="w-5 h-0.5 bg-[#2a7d4f] rounded" />
                <span>Costo mensual · Promedio anual {fmtM(totalAnualCosto / 12)}</span>
              </div>
            </div>
          </div>
        </section>)}

        {/* ── M03 — Riesgo de rotación núcleo ── */}
        {activeSection === "rotacion" && (<section className="mb-8">

        {/* Diagnóstico en una línea */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Riesgo de rotación</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · 20 trabajadores del núcleo</p>
        </motion.div>

        {/* Resumen de situación */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              {criticos} personas con riesgo crítico. Si se van antes de enero, el costo de reemplazo supera <span className="text-[#ba1a1a]">$4.5M</span>.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              Diego B. y Diego L. (Ayudantes Cocina) · Fernanda F. y Vicente D. (Auxiliares) · Francisca O. (Bodega)
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {([
              { n: NUCLEO.filter(x => x.riesgo >= 65).length, label: "Crítico",  color: "#ba1a1a", bg: "rgba(186,26,26,0.08)"  },
              { n: NUCLEO.filter(x => x.riesgo >= 45 && x.riesgo < 65).length, label: "Alto", color: "#835500", bg: "rgba(131,85,0,0.08)"  },
              { n: NUCLEO.filter(x => x.riesgo < 45).length,  label: "Bajo",     color: "#2a7d4f", bg: "rgba(42,125,79,0.08)"  },
            ]).map(s => (
              <div key={s.label} className="text-center rounded-lg px-4 py-2" style={{ background: s.bg }}>
                <p className="font-bold tabular-nums text-xl" style={{ color: s.color }}>{s.n}</p>
                <p style={{ fontSize: "0.65rem", color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BLOQUE 1: Acción inmediata — Crítico (65+) */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <p className="font-semibold text-[#1c1c1a]">Acción esta semana — {NUCLEO.filter(x => x.riesgo >= 65).length} en riesgo crítico</p>
          </div>
          <div className="space-y-3">
            {NUCLEO.filter(n => n.riesgo >= 65).sort((a, b) => b.riesgo - a.riesgo).map((n, i) => {
              const bench = BENCHMARK.find(b => b.cargo === n.cargo);
              const gap   = bench ? bench.p50 - n.salario : 0;
              return (
                <motion.div key={n.nombre} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.06, ease: E }}
                  className="rounded-xl bg-white border border-[#e5e2de] p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: n.sexo === "F" ? "rgba(255,100,200,0.12)" : "rgba(4,22,53,0.07)" }}>
                        <Users size={12} style={{ color: n.sexo === "F" ? "#FF64C8" : "#041635" }} />
                      </div>
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.92rem" }}>{n.nombre}</span>
                      <span style={{ fontSize: "0.75rem", color: "#75777f" }}>{n.cargo}</span>
                      {n.contrato === "Plazo fijo" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(186,26,26,0.10)", color: "#ba1a1a" }}>Plazo fijo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                      {n.factores.map(f => (
                        <span key={f} style={{ fontSize: "0.75rem", color: "#835500" }}>· {f}</span>
                      ))}
                    </div>
                    {gap > 0 && (
                      <p style={{ fontSize: "0.78rem", color: "#44474e", marginTop: "4px" }}>
                        Paga <strong>{fmtCLP(n.salario)}</strong> · Mercado P50 <strong>{fmtCLP(n.salario + gap)}</strong> · brecha <strong className="text-[#ba1a1a]">−{fmtCLP(gap)}/mes</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#e5e2de] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ba1a1a] rounded-full" style={{ width: `${n.riesgo}%` }} />
                      </div>
                      <span className="font-bold text-[#ba1a1a] tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.88rem" }}>{n.riesgo}/100</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>Crítico</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* BLOQUE 2: Monitorear — Alto (45-64) */}
        {NUCLEO.filter(n => n.riesgo >= 45 && n.riesgo < 65).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, ease: E }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#835500]" />
              <p className="font-semibold text-[#1c1c1a]">Monitorear — {NUCLEO.filter(n => n.riesgo >= 45 && n.riesgo < 65).length} en riesgo alto</p>
            </div>
            <div className="rounded-xl bg-white border border-[#e5e2de] p-4">
              <p style={{ fontSize: "0.82rem", color: "#44474e", marginBottom: "12px" }}>
                No requieren acción inmediata pero cualquier oferta externa en los próximos 90 días puede inclinar la balanza.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NUCLEO.filter(n => n.riesgo >= 45 && n.riesgo < 65).sort((a, b) => b.riesgo - a.riesgo).map(n => (
                  <div key={n.nombre} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "#f6f3ef" }}>
                    <div>
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.84rem" }}>{n.nombre}</span>
                      <span className="ml-2 text-[#9a9a9a]" style={{ fontSize: "0.72rem" }}>{n.cargo}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.82rem", color: "#835500" }}>{n.riesgo}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* BLOQUE 3: Sin acción — Bajo/Moderado */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a7d4f]" />
            <p className="font-semibold text-[#1c1c1a]">Sin acción requerida — {NUCLEO.filter(n => n.riesgo < 45).length} con riesgo bajo o moderado</p>
          </div>
          <div className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3 flex flex-wrap gap-x-5 gap-y-1.5 items-center">
            {NUCLEO.filter(n => n.riesgo < 45).sort((a, b) => a.riesgo - b.riesgo).map(n => (
              <span key={n.nombre} className="flex items-center gap-1.5" style={{ fontSize: "0.82rem", color: "#44474e" }}>
                <CheckCircle2 size={13} style={{ color: "#2a7d4f", flexShrink: 0 }} />
                <span className="font-semibold text-[#1c1c1a]">{n.nombre}</span>
                <span className="text-[#9a9a9a]">{n.riesgo}/100</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Ver tabla completa colapsable */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.56, ease: E }}>
          <button
            onClick={() => setExpandedNucleo(expandedNucleo === -1 ? null : -1)}
            className="flex items-center gap-2 mb-3 hover:opacity-70 transition-opacity"
            style={{ fontSize: "0.82rem", color: "#75777f", fontWeight: 600 }}>
            {expandedNucleo === -1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expandedNucleo === -1 ? "Ocultar tabla completa" : "Ver los 20 trabajadores"}
          </button>
          <AnimatePresence>
            {expandedNucleo === -1 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                <div className="space-y-2">
                  {[...NUCLEO].sort((a, b) => b.riesgo - a.riesgo).map((n, i) => {
                    const rc = riesgoColor(n.riesgo);
                    return (
                      <div key={i} className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3 flex items-center gap-3 flex-wrap">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: n.sexo === "F" ? "rgba(255,100,200,0.12)" : "rgba(4,22,53,0.07)" }}>
                          <Users size={12} style={{ color: n.sexo === "F" ? "#FF64C8" : "#041635" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.82rem" }}>{n.nombre}</span>
                            <span style={{ fontSize: "0.70rem", color: "#75777f" }}>{n.cargo}</span>
                            {n.contrato === "Plazo fijo" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>PF</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-24 h-1.5 bg-[#e5e2de] rounded-full overflow-hidden">
                              <div className={`h-full ${rc.bar} rounded-full`} style={{ width: `${n.riesgo}%` }} />
                            </div>
                            <span className={`font-bold tabular-nums text-xs ${rc.text}`} style={{ fontFamily: "var(--font-space-mono)" }}>{n.riesgo}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rc.badge}`}>{rc.label}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-[#1c1c1a] tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem" }}>{fmtCLP(n.salario)}</p>
                          <p style={{ fontSize: "0.62rem", color: "#9a9a9a" }}>{n.experiencia}a · {n.area}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3" style={{ fontSize: "0.68rem", color: "#9a9a9a" }}>
                  Score compuesto: brecha salarial vs P50, tipo de contrato, antigüedad, jornada y factores de liquidez del cargo.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        </section>)}

        {/* ── M04 — Presión de mercado ── */}
        {activeSection === "mercado" && (<section className="mb-8">

        {/* Diagnóstico en una línea */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Presión de mercado</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · Avisos laborales últimos 90 días · Región Valparaíso</p>
        </motion.div>

        {/* Alerta principal */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              El mercado está compitiendo activamente por tu Ayudante de Cocina y Garzón Senior ahora mismo.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              3 cargos con alta presión · tensión 82–88/100 · probabilidad de oferta externa 55–78% en 90 días
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {([
              { n: MERCADO_IMPACT.filter(m => m.nivel === "alta").length,  label: "Alta presión", color: "#ba1a1a", bg: "rgba(186,26,26,0.08)"  },
              { n: MERCADO_IMPACT.filter(m => m.nivel === "media").length, label: "Media",        color: "#835500", bg: "rgba(131,85,0,0.08)"  },
              { n: MERCADO_IMPACT.filter(m => m.nivel === "baja").length,  label: "Baja",         color: "#2a7d4f", bg: "rgba(42,125,79,0.08)"  },
            ]).map(s => (
              <div key={s.label} className="text-center rounded-lg px-4 py-2" style={{ background: s.bg }}>
                <p className="font-bold tabular-nums text-xl" style={{ color: s.color }}>{s.n}</p>
                <p style={{ fontSize: "0.65rem", color: s.color, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BLOQUE 1: Alta presión — Acción inmediata */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
            <p className="font-semibold text-[#1c1c1a]">Acción urgente — {MERCADO_IMPACT.filter(m => m.nivel === "alta").length} cargos con alta presión de mercado</p>
          </div>
          <div className="space-y-3">
            {MERCADO_IMPACT.filter(m => m.nivel === "alta").map((m, i) => {
              const probColor = m.probOferta >= 65 ? "#ba1a1a" : "#835500";
              const probBg    = m.probOferta >= 65 ? "rgba(186,26,26,0.08)" : "rgba(131,85,0,0.08)";
              const gapAbs    = m.med90d ? Math.abs(m.empresa - m.med90d) : 0;
              return (
                <motion.div key={m.cargo} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.16 + i * 0.06, ease: E }}
                  className="rounded-xl bg-white border border-[#e5e2de] p-4 flex flex-wrap items-start justify-between gap-4"
                  style={{ borderLeft: "3px solid #ba1a1a" }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.92rem" }}>{m.cargo}</span>
                      <span style={{ fontSize: "0.72rem", color: "#9a9a9a" }}>×{m.n_empresa} en equipo</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold"
                        style={{ fontSize: "0.65rem", background: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>
                        Alta presión · {m.avisos90d} avisos activos
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.65, borderLeft: "3px solid rgba(186,26,26,0.2)", paddingLeft: "10px" }}>
                      {m.narrativa}
                    </p>
                    {gapAbs > 0 && m.salGap < 0 && (
                      <p style={{ fontSize: "0.75rem", color: "#835500", marginTop: "8px", fontWeight: 600 }}>
                        ↳ Brecha salarial: −{fmtCLP(gapAbs)}/mes vs. mercado — ajustar ahora cuesta menos que reemplazar
                      </p>
                    )}
                  </div>
                  <div className="text-center rounded-lg px-4 py-2 shrink-0" style={{ background: probBg }}>
                    <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.4rem", color: probColor, lineHeight: 1 }}>{m.probOferta}%</p>
                    <p style={{ fontSize: "0.60rem", color: probColor, fontWeight: 600, marginTop: "3px" }}>prob. oferta · 90d</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* BLOQUE 2: Monitorear — Media */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease: E }} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#835500]" />
            <p className="font-semibold text-[#1c1c1a]">Monitorear — {MERCADO_IMPACT.filter(m => m.nivel === "media").length} cargos con presión moderada</p>
          </div>
          <div className="rounded-xl bg-white border border-[#e5e2de] p-4">
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginBottom: "12px" }}>
              Mercado activo pero no agresivo. Mantén sueldos ajustados y monitorea la tendencia trimestral de avisos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MERCADO_IMPACT.filter(m => m.nivel === "media").map(m => (
                <div key={m.cargo} className="rounded-lg p-3" style={{ background: "#f6f3ef" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.84rem" }}>{m.cargo}</span>
                    <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#835500", fontWeight: 700 }}>{m.probOferta}%</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#75777f", lineHeight: 1.5 }}>{m.narrativa}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* BLOQUE 3: Sin acción — Baja + ventana de oportunidad */}
        {MERCADO_IMPACT.filter(m => m.nivel === "baja").length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, ease: E }} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2a7d4f]" />
              <p className="font-semibold text-[#1c1c1a]">Ventana de oportunidad — presión baja</p>
            </div>
            <div className="rounded-xl border border-[#e5e2de] bg-white px-4 py-3">
              {MERCADO_IMPACT.filter(m => m.nivel === "baja").map(m => (
                <div key={m.cargo} className="flex items-start gap-3">
                  <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full font-semibold shrink-0"
                    style={{ fontSize: "0.65rem", background: "rgba(42,125,79,0.08)", color: "#2a7d4f" }}>
                    ✦ {m.cargo}
                  </span>
                  <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.6 }}>{m.narrativa}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <p style={{ fontSize: "0.66rem", color: "#aaaaaa" }}>
          Fuente: portales Trabajando.cl · Computrabajo · últimos 90 días (mar–may 2026). Índice de tensión calculado sobre avisos activos, tendencia y brecha salarial. Probabilidad de oferta: modelo estimativo.
        </p>

        </section>)}

        {/* ── Calculadora rotación ── */}
        {activeSection === "costo_rot" && (<section className="mb-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Costo de rotación</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · Desglose por cargo · 9 salidas estimadas 2026</p>
        </motion.div>

        {/* Myth-busting box */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-4"
          style={{ background: "rgba(4,22,53,0.03)", border: "1px solid #c5c6cf" }}>
          <p className="font-bold text-[#041635] mb-3" style={{ fontSize: "0.88rem" }}>
            ¿Por qué no son millones? — Cómo calculamos el costo de reemplazar a alguien
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {([
              { label: "Aviso laboral",        monto: "40–65k",  desc: "Portal de empleo" },
              { label: "Selección",             monto: "30–65k",  desc: "Horas jefatura" },
              { label: "Documentación",         monto: "20–25k",  desc: "Contrato + alta" },
              { label: "Días sin cubrir",       monto: "100–215k",desc: "Vacante operativa" },
              { label: "Curva aprendizaje",     monto: "150–345k",desc: "4–6 semanas al 65%" },
              { label: "Trainer",               monto: "40–95k",  desc: "Senior capacitando" },
            ]).map(c => (
              <div key={c.label} className="rounded-lg p-2.5" style={{ background: "#ffffff", border: "1px solid #e5e2de" }}>
                <p className="font-semibold text-[#041635]" style={{ fontSize: "0.72rem" }}>{c.label}</p>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: "#835500", fontWeight: 700 }}>{c.monto}</p>
                <p style={{ fontSize: "0.60rem", color: "#9a9a9a" }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.6 }}>
            <strong className="text-[#1c1c1a]">Total por salida: $380k–$805k</strong> según el cargo.
            Es entre <strong>0.7 y 1.1 meses de sueldo</strong> — no los 3–6 meses que citan consultoras grandes
            (esas cifras aplican a cargos profesionales especializados, no a operativos de gastronomía).
            Lo que duele no es una sola salida: es que se van 9 en un año.
          </p>
        </motion.div>

        {/* Resumen costo anual */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              9 salidas en 2026 = <span className="text-[#ba1a1a]">{fmtM(COSTOROTACION_REAL)}</span> en costos acumulados.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              Ahorro posible con ajustes salariales + contratos: ~<span className="font-semibold text-[#2a7d4f]">{fmtM(COSTOROTACION_REAL * 0.55)}</span>
            </p>
          </div>
          <div className="text-center rounded-lg px-5 py-3 shrink-0" style={{ background: "rgba(186,26,26,0.08)" }}>
            <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.6rem", color: "#ba1a1a", lineHeight: 1 }}>{fmtM(COSTOROTACION_REAL)}</p>
            <p style={{ fontSize: "0.62rem", color: "#ba1a1a", fontWeight: 600, marginTop: "3px" }}>costo anual estimado</p>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Calculadora · Costo de rotación de personal
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-1">¿Cuánto le cuesta a tu empresa cada salida?</h2>
          <p style={{ fontSize: "0.82rem", color: "#75777f", marginBottom: "24px", lineHeight: 1.6 }}>
            Cada cargo tiene un factor diferente según cuánto tarda en reemplazarse. Los factores van de{" "}
            <strong className="text-[#1c1c1a]">0.68× a 1.07×</strong> el sueldo mensual — muy por debajo del 1.5× anual
            que citan consultoras globales para cargos operativos.
          </p>

          {/* ── 3 métricas resumen ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Costo total 2026",  valor: fmtM(costoRotacion),                                                   sub: "9 salidas voluntarias estimadas",    color: "#ba1a1a" },
              { label: "Factor promedio",    valor: "1.0×",                                                                sub: "del sueldo mensual de referencia",   color: "#835500" },
              { label: "Ahorro potencial",   valor: fmtM(Math.round((9 - 20 * 0.25) / 9 * costoRotacion)),                sub: "si bajas de 45% → 25% rotación",    color: "#2a7d4f" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4 border border-[#e5e2de] bg-white">
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "#75777f", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.55rem", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ fontSize: "0.62rem", color: "#9a9a9a", marginTop: "5px" }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Cards por cargo ── */}
          <div className="space-y-3 mb-6">
            {COSTO_ROT.map((r, i) => {
              const isOpen = rotExpanded === i;
              const comps = [
                { nombre: "Curva aprendizaje", monto: r.curva_aprendizaje, color: "#ba1a1a", desc: "4–6 semanas al 65% de productividad del nuevo trabajador versus el que salió" },
                { nombre: "Vacante",           monto: r.vacante,           color: "#835500", desc: `${Math.round(r.vacante / (r.salario_ref / 30))} días con turno cubierto por hora extra o posición sin cubrir` },
                { nombre: "Trainer",           monto: r.trainer,           color: "#835500", desc: "2 semanas de un trabajador senior a 80% de productividad por dedicarse a capacitar al nuevo" },
                { nombre: "Aviso laboral",     monto: r.aviso,             color: "#041635", desc: "Publicación en Trabajando.cl, Computrabajo u otro portal durante el proceso de búsqueda" },
                { nombre: "Selección",         monto: r.seleccion,         color: "#1e477b", desc: "Horas de jefatura revisando CVs, coordinando y realizando entrevistas (estimado 8h × costo-hora)" },
                { nombre: "Documentación",     monto: r.documentacion,     color: "#2a7d4f", desc: "Finiquito si aplica, contrato nuevo, alta en Previred, Caja de Compensación y AFP" },
              ].sort((a, b) => b.monto - a.monto);
              const factorColor = r.factor_meses >= 1.0 ? "#ba1a1a" : r.factor_meses >= 0.85 ? "#835500" : "#2a7d4f";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: E }}
                  className="rounded-xl border border-[#e5e2de] bg-white overflow-hidden">

                  {/* Header clickeable */}
                  <button className="w-full px-5 py-4 text-left hover:bg-transparent transition-colors"
                    onClick={() => setRotExpanded(isOpen ? null : i)}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.92rem" }}>{r.categoria}</p>
                        <p style={{ fontSize: "0.68rem", color: "#75777f", marginTop: "2px" }}>
                          {r.n_salidas_estimadas} salida{r.n_salidas_estimadas > 1 ? "s" : ""} estimadas · Sueldo ref. {fmtCLP(r.salario_ref)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.9rem", color: factorColor }}>{r.factor_meses.toFixed(2)}× sueldo</p>
                          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "#75777f" }}>{fmtCLP(r.total)} por salida</p>
                        </div>
                        {isOpen ? <ChevronUp size={14} className="text-[#9a9a9a]" /> : <ChevronDown size={14} className="text-[#9a9a9a]" />}
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
                        <span key={c.nombre} className="flex items-center gap-1" style={{ fontSize: "0.58rem", color: "#75777f" }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                          {c.nombre} {Math.round(c.monto / r.total * 100)}%
                        </span>
                      ))}
                    </div>

                    {/* Costo anual */}
                    <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid #e5e2de" }}>
                      <p style={{ fontSize: "0.68rem", color: "#75777f" }}>Costo anual ({r.n_salidas_estimadas} salidas)</p>
                      <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.90rem", color: "#835500" }}>
                        {fmtCLP(r.total * r.n_salidas_estimadas)}
                      </p>
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                        <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid #e5e2de" }}>

                          {/* ¿Por qué X× ? */}
                          <div className="rounded-lg px-4 py-3 mb-4" style={{ background: "#f0ede9", border: "1px solid #e5e2de" }}>
                            <p style={{ fontSize: "0.72rem", color: "#44474e", lineHeight: 1.65 }}>
                              <strong style={{ color: "#041635" }}>¿Por qué {r.factor_meses.toFixed(2)}×?</strong>{" "}
                              La suma de los 6 componentes da {fmtCLP(r.total)}. Dividido por el sueldo de referencia
                              {" "}{fmtCLP(r.salario_ref)}: {fmtCLP(r.total)} ÷ {fmtCLP(r.salario_ref)} ={" "}
                              <strong className="text-[#1c1c1a]">{r.factor_meses.toFixed(2)} meses de sueldo</strong>.
                            </p>
                          </div>

                          {/* Filas de componentes */}
                          <div className="space-y-2">
                            {comps.map((c, j) => {
                              const pct = Math.round(c.monto / r.total * 100);
                              return (
                                <div key={j} className="rounded-lg p-3" style={{ background: "#ffffff", border: "1px solid #eae8e4" }}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                                      <span className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.82rem" }}>{c.nombre}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", color: "#9a9a9a" }}>{pct}%</span>
                                      <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.80rem", color: c.color }}>{fmtCLP(c.monto)}</span>
                                    </div>
                                  </div>
                                  <div className="h-1 rounded-full mb-1.5" style={{ background: "#eae8e4" }}>
                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color + "70" }} />
                                  </div>
                                  <p style={{ fontSize: "0.66rem", color: "#75777f", lineHeight: 1.55 }}>{c.desc}</p>
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
          <div className="rounded-xl p-6 border border-[#e5e2de] bg-white mb-4">
            <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "#2a7d4f", letterSpacing: "0.20em", textTransform: "uppercase", marginBottom: "4px" }}>
              Simulador de ahorro
            </p>
            <h3 className="font-bold text-[#1c1c1a] mb-1" style={{ fontSize: "1rem" }}>¿Cuánto ahorras si reduces la rotación?</h3>
            <p style={{ fontSize: "0.78rem", color: "#75777f", marginBottom: "20px" }}>
              Tu rotación voluntaria actual es <strong className="text-[#1c1c1a]">45%</strong> (9 salidas / 20 del núcleo).
              Mueve el slider para ver el impacto en el costo anual.
            </p>

            <div className="flex items-center gap-4 mb-5">
              <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.60rem", color: "#75777f", minWidth: "36px" }}>Meta</span>
              <input
                type="range" min={5} max={40} step={5} value={rotacionMeta}
                onChange={e => setRotacionMeta(Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "#2a7d4f" }}
              />
              <span className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.1rem", color: "#2a7d4f", minWidth: "48px", textAlign: "right" }}>
                {rotacionMeta}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl p-4" style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(255,77,90,0.18)" }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "#75777f", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Hoy · 45% rotación
                </p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.6rem", color: "#ba1a1a", lineHeight: 1 }}>{fmtM(costoRotacion)}</p>
                <p style={{ fontSize: "0.64rem", color: "#9a9a9a", marginTop: "5px" }}>9 salidas · costo anual estimado</p>
              </div>
              {(() => {
                const metaExits = Math.round(20 * rotacionMeta / 100);
                const metaCosto = Math.round(metaExits / 9 * costoRotacion);
                const ahorro    = costoRotacion - metaCosto;
                return (
                  <div className="rounded-xl p-4" style={{ background: "rgba(42,125,79,0.08)", border: "1px solid rgba(6,214,160,0.18)" }}>
                    <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.50rem", color: "#75777f", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Meta · {rotacionMeta}% · {metaExits} salidas
                    </p>
                    <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.6rem", color: "#2a7d4f", lineHeight: 1 }}>{fmtM(metaCosto)}</p>
                    <p style={{ fontSize: "0.68rem", color: "#2a7d4f", marginTop: "5px", fontWeight: 600 }}>
                      Ahorro: {fmtM(ahorro)} / año
                    </p>
                  </div>
                );
              })()}
            </div>

            {rotacionMeta <= 30 && (
              <div className="pt-4" style={{ borderTop: "1px solid #e5e2de" }}>
                <p style={{ fontSize: "0.64rem", color: "#75777f", marginBottom: "10px" }}>
                  Palancas clave para llegar al {rotacionMeta}%:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Convertir contratos a indefinido",        color: "#ba1a1a", show: true },
                    { label: "Ajuste salarial Ayudantes + Auxiliares",  color: "#ba1a1a", show: true },
                    { label: `Reajuste julio +${ICL.ir_sector}%`,       color: "#835500", show: true },
                    { label: "Contrato multi-temporada",                 color: "#041635", show: rotacionMeta <= 25 },
                    { label: "Publicar bandas salariales internas",      color: "#2a7d4f", show: rotacionMeta <= 20 },
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
          <div className="rounded-xl px-5 py-4 border-l-2" style={{ borderLeftColor: "rgba(4,22,53,0.25)", background: "rgba(4,22,53,0.03)" }}>
            <p style={{ fontSize: "0.70rem", color: "#75777f", lineHeight: 1.7 }}>
              <strong style={{ color: "#44474e" }}>Metodología:</strong>{" "}
              El factor 1.5× anual aplica a cargos profesionales especializados. Para operativos de gastronomía el
              costo real está entre 0.7 y 1.1 meses de sueldo. Los valores de aviso ($40k–$65k) se basan en tarifas
              de Trabajando.cl y Computrabajo. El costo de vacante supone 10 días promedio antes de cubrir la
              posición, calculado sobre jornada de 44h semanales a costo-hora del cargo.
            </p>
          </div>

        </section>)}

        {/* ── M06 — ICL ── */}
        {activeSection === "icl" && (<section className="mb-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Costo laboral</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · INE EMRCL {ICL.trimestre}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "rgba(131,85,0,0.04)", border: "1px solid rgba(131,85,0,0.15)", borderLeft: "4px solid #835500" }}>
          <AlertTriangle size={16} style={{ color: "#835500", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p className="font-semibold text-[#1c1c1a] mb-0.5" style={{ fontSize: "0.9rem" }}>
              Reajuste de julio confirmado: +{ICL.ir_sector}% para contratos indefinidos del núcleo.
              Aplícalo en julio o arriesgas conflictos laborales y rotación por expectativas no cumplidas.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#75777f" }}>
              Impacto en nómina: ~+$560k/mes · +$6.7M/año · Alineado con IR sectorial +{ICL.ir_sector}%
            </p>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 06 · Costo laboral — INE EMRCL
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-4">Índice de Costo Laboral · Turismo y Servicios · {ICL.trimestre}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: `ICL Turismo/Servicios · ${ICL.trimestre}`, valor: `+${ICL.icl_sector}%`, sub: `vs Nacional +${ICL.icl_nac}%`, color: "#ba1a1a", bg: "rgba(186,26,26,0.08)", border: "rgba(186,26,26,0.15)" },
              { label: `IR Turismo/Servicios · ${ICL.trimestre}`,  valor: `+${ICL.ir_sector}%`,  sub: `vs Nacional +${ICL.ir_nac}%`,  color: "#835500", bg: "rgba(131,85,0,0.08)", border: "rgba(247,201,72,0.2)" },
              { label: "IPC · referencia inflación",                 valor: `+${ICL.ipc}%`,         sub: "Banco Central · T1 2026",     color: "#041635", bg: "#f0ede9", border: "rgba(4,22,53,0.1)" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-5" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "#75777f", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "2rem", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ fontSize: "0.7rem", color: "#75777f", marginTop: "6px" }}>{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 border border-[#e5e2de] bg-white">
            <p style={{ fontSize: "0.8rem", color: "#44474e", lineHeight: 1.65 }}>
              <strong className="text-[#1c1c1a]">Lectura:</strong> El ICL turismo (+{ICL.icl_sector}%) supera al IPC (+{ICL.ipc}%) en 0.1 pp.
              El reajuste de julio (+4%) para contratos indefinidos está alineado con el IR sectorial (+{ICL.ir_sector}%) — decisión correcta.
              El presupuesto de RRHH 2027 debe contemplar mínimo <strong className="text-[#1c1c1a]">+{ICL.icl_sector}%</strong> de ajuste base por persona para no deteriorar el poder adquisitivo del equipo núcleo.
            </p>
          </div>
        </section>)}

        {/* ── M07 — Brecha de género (nueva visualización) ── */}
        {activeSection === "brecha" && (<section className="mb-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Brecha de género</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · Gap salarial ajustado por nivel jerárquico</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{ background: "rgba(42,125,79,0.04)", border: "1px solid rgba(42,125,79,0.15)", borderLeft: "4px solid #2a7d4f" }}>
          <CheckCircle2 size={16} style={{ color: "#2a7d4f", flexShrink: 0 }} />
          <div>
            <p className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.9rem" }}>
              Sin riesgo regulatorio. Brecha ponderada {GAP_POND}% — bajo el umbral de revisión DT (5%).
            </p>
            <p style={{ fontSize: "0.78rem", color: "#75777f", marginTop: "2px" }}>
              Sin acción requerida hoy. Documentar diferencias por antigüedad si alguien pregunta.
            </p>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 07 · Brecha de género salarial
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-5">Gap salarial interno por nivel jerárquico · {EMPRESA}</h2>

          <div className="space-y-5 mb-4">
            {BRECHA.map((b, i) => {
              const absGap   = Math.abs(b.gap);
              const favMujer = b.gap < 0;
              const gapColor = absGap >= 15 ? "#ba1a1a" : absGap >= 8 ? "#835500" : "#2a7d4f";
              const senal    = absGap >= 15 ? "Zona de riesgo" : absGap >= 8 ? "Vigilar" : favMujer ? "Favorable mujer" : "Bajo brecha";
              const hWidth   = Math.round((b.hombre / maxBrechaVal) * 100);
              const mWidth   = Math.round((b.mujer  / maxBrechaVal) * 100);
              return (
                <div key={i} className="rounded-xl p-4 border border-[#e5e2de] bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.82rem" }}>{b.nivel}</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: gapColor + "18", color: gapColor }}>
                      {favMujer ? "−" : "+"}{absGap.toFixed(1)}% · {senal}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {/* Hombre */}
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.65rem", color: "#041635", fontFamily: "var(--font-space-mono)", minWidth: "48px" }}>Hombre</span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#eae8e4" }}>
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${hWidth}%`, background: "#041635" }}>
                        </div>
                      </div>
                      <span className="tabular-nums font-bold text-[#1c1c1a] shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", minWidth: "84px", textAlign: "right" }}>
                        {fmtCLP(b.hombre)}
                      </span>
                    </div>
                    {/* Mujer */}
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.65rem", color: "#FF64C8", fontFamily: "var(--font-space-mono)", minWidth: "48px" }}>Mujer</span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#eae8e4" }}>
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${mWidth}%`, background: "#FF64C8" }}>
                        </div>
                      </div>
                      <span className="tabular-nums font-bold text-[#1c1c1a] shrink-0" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.75rem", minWidth: "84px", textAlign: "right" }}>
                        {fmtCLP(b.mujer)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl p-4 border-l-2 bg-white" style={{ borderLeftColor: "#2a7d4f" }}>
            <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.6 }}>
              <strong className="text-[#1c1c1a]">Gap ponderado: {GAP_POND}% — Bajo brecha.</strong>{" "}
              El equipo del restaurante muestra equidad remuneracional notable: en el nivel operativo calificado (garzones/cocineros),
              las mujeres ganan un 8.9% más que los hombres, reflejando mayor antigüedad promedio femenina en sala.
              Sin riesgo regulatorio bajo Ley 21.719.
            </p>
          </div>
        </section>)}

        {/* ── M08 — ENE Valparaíso ── */}
        {activeSection === "ene" && (<section className="mb-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Mercado laboral</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · INE ENE oct.–dic. 2024 · {REGION}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "rgba(131,85,0,0.04)", border: "1px solid rgba(131,85,0,0.15)", borderLeft: "4px solid #835500" }}>
          <AlertTriangle size={16} style={{ color: "#835500", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p className="font-semibold text-[#1c1c1a] mb-0.5" style={{ fontSize: "0.9rem" }}>
              Publica las vacantes de temporada alta con 45–60 días de anticipación. Valparaíso tiene el mercado laboral más ajustado de la región.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#75777f" }}>
              Desocupación Valparaíso {ENE_VALPO}% — {(ENE_VALPO - ENE_NAC).toFixed(1)} pp bajo la media nacional · Próximo peak: diciembre–enero
            </p>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 08 · Mercado laboral regional
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-4">Desocupación en {REGION} · INE ENE oct.–dic. 2024</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: `Tasa desocupación ${REGION}`, valor: `${ENE_VALPO}%`,       sub: "oct.–dic. 2024",        color: "#835500", bg: "rgba(131,85,0,0.08)", border: "rgba(247,201,72,0.2)" },
              { label: "Nacional",                     valor: `${ENE_NAC}%`,          sub: "promedio país",          color: "#041635", bg: "#f0ede9", border: "rgba(4,22,53,0.1)" },
              { label: "Tendencia regional",           valor: `${ENE_TENDENCIA} pp`,  sub: "vs trimestre anterior",  color: "#2a7d4f", bg: "rgba(42,125,79,0.08)", border: "rgba(6,214,160,0.2)" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-5" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.55rem", color: "#75777f", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>{k.label}</p>
                <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.8rem", color: k.color, lineHeight: 1 }}>{k.valor}</p>
                <p style={{ fontSize: "0.68rem", color: "#75777f", marginTop: "6px" }}>{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 border border-[#e5e2de] bg-white">
            <p style={{ fontSize: "0.8rem", color: "#44474e", lineHeight: 1.65 }}>
              <strong className="text-[#1c1c1a]">Contexto:</strong> Valparaíso opera 0.6 pp bajo la media nacional, lo que indica
              <strong className="text-[#835500]"> mercado laboral relativamente ajustado</strong> en la región.
              En temporada alta (enero, julio), la competencia por garzones y ayudantes de cocina es alta —
              Viña del Mar concentra además la mayor densidad de restaurantes de la Quinta Región.
              Implicancia: captar personal estacional requiere publicar vacantes con 45–60 días de anticipación y ofrecer condiciones competitivas.
            </p>
          </div>
        </section>)}

        {/* ── Cumplimiento laboral ── */}
        {activeSection === "cumplimiento" && (
        <section className="mb-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Cumplimiento laboral</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · Diagnóstico preventivo · 3 áreas</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-4 mb-6 flex items-start gap-3"
          style={{ background: "rgba(131,85,0,0.04)", border: "1px solid rgba(131,85,0,0.15)", borderLeft: "4px solid #835500" }}>
          <AlertTriangle size={16} style={{ color: "#835500", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p className="font-semibold text-[#1c1c1a] mb-0.5" style={{ fontSize: "0.9rem" }}>
              1 acción antes de julio: revisar los 4 contratos a plazo fijo del núcleo antes de que lleguen al año de renovación continua.
            </p>
            <p style={{ fontSize: "0.78rem", color: "#75777f" }}>
              Costo de conversión a indefinido: $0 · Costo de un juicio laboral si no actúas: +$3.000.000
            </p>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Módulo 09 · Cumplimiento laboral
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-1">Radiografía preventiva</h2>
          <p style={{ fontSize: "0.82rem", color: "#75777f", marginBottom: "24px" }}>
            Revisamos 3 áreas de cumplimiento clave. El objetivo no es alarmar — es anticipar antes de que aparezca un problema con la Dirección del Trabajo.
          </p>

          {/* Result banner */}
          <div className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4" style={{ background: "rgba(247,201,72,0.05)", border: "1px solid rgba(247,201,72,0.14)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(131,85,0,0.10)", border: "1px solid rgba(247,201,72,0.18)" }}>
              <Scale size={18} style={{ color: "#835500" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.9rem" }}>Sin infracciones activas detectadas</p>
              <p style={{ fontSize: "0.74rem", color: "#75777f", marginTop: "2px" }}>
                2 pilares en verde · 1 en ámbar · Revisar contratos a plazo fijo antes de julio 2026
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full" style={{ background: "#2a7d4f", boxShadow: "0 0 6px rgba(6,214,160,0.5)" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#2a7d4f", boxShadow: "0 0 6px rgba(6,214,160,0.5)" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#835500", boxShadow: "0 0 6px rgba(247,201,72,0.5)" }} />
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
              accionColor: "#2a7d4f",
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
              accionColor: "#835500",
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
              accionColor: "#2a7d4f",
            },
          ] as const).map((pillar, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, ease: E }}
              className="rounded-xl border p-5 mb-4"
              style={{
                background: pillar.status === "ambar" ? "rgba(247,201,72,0.03)" : "rgba(6,214,160,0.02)",
                borderColor: pillar.status === "ambar" ? "rgba(247,201,72,0.15)" : "rgba(42,125,79,0.10)",
              }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: pillar.status === "ambar" ? "rgba(131,85,0,0.10)" : "rgba(42,125,79,0.08)" }}>
                  <span style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.65rem", fontWeight: 700, color: pillar.status === "ambar" ? "#835500" : "#2a7d4f" }}>
                    {pillar.num}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold"
                      style={{ fontSize: "0.68rem", background: pillar.status === "ambar" ? "rgba(131,85,0,0.10)" : "rgba(42,125,79,0.08)", color: pillar.status === "ambar" ? "#835500" : "#2a7d4f" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: pillar.status === "ambar" ? "#835500" : "#2a7d4f" }} />
                      {pillar.status === "ambar" ? "Ámbar — revisar" : "Verde — en regla"}
                    </span>
                  </div>
                  <p className="font-semibold text-[#1c1c1a]" style={{ fontSize: "0.9rem" }}>{pillar.titulo}</p>
                  <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", color: "#9a9a9a", letterSpacing: "0.08em", marginTop: "4px" }}>{pillar.ley}</p>
                </div>
              </div>

              <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.65, marginBottom: "16px" }}>{pillar.hallazgo}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {pillar.detalle.map((d, j) => (
                  <div key={j} className="rounded-lg px-3 py-2.5"
                    style={{ background: d.ok ? "rgba(6,214,160,0.05)" : "rgba(247,201,72,0.06)", border: `1px solid ${d.ok ? "rgba(42,125,79,0.10)" : "rgba(247,201,72,0.15)"}` }}>
                    <p style={{ fontSize: "0.53rem", fontFamily: "var(--font-space-mono)", color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", lineHeight: 1.4 }}>{d.label}</p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: d.ok ? "#2a7d4f" : "#835500" }}>{d.valor}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg px-4 py-3" style={{ background: "rgba(4,22,53,0.03)", borderLeft: `3px solid ${pillar.accionColor}` }}>
                <p style={{ fontSize: "0.58rem", fontFamily: "var(--font-space-mono)", color: pillar.accionColor, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "5px" }}>
                  Acción recomendada
                </p>
                <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.65 }}>{pillar.accion}</p>
              </div>
            </motion.div>
          ))}

          <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(4,22,53,0.03)", border: "1px solid #e5e2de" }}>
            <p style={{ fontSize: "0.72rem", color: "#75777f", lineHeight: 1.65 }}>
              <strong className="text-[#041635]">Nota:</strong> Este análisis se basa en datos anonimizados proporcionados por la empresa y no reemplaza asesoría legal especializada.
              RemuneraLab actúa como herramienta de diagnóstico preventivo. Para validación jurídica, consultar con un abogado laboral o la Dirección del Trabajo (<strong className="text-white/40">www.dt.gob.cl</strong>).
            </p>
          </div>
        </section>)}

        {/* ── Recomendaciones ── */}
        {activeSection === "recomendaciones" && (<>
        <section className="mb-8">

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: E }} className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1a] mb-1">Plan de acción</h1>
          <p style={{ fontSize: "0.88rem", color: "#75777f" }}>{FECHA} · 5 palancas ordenadas por urgencia y retorno</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, ease: E }}
          className="rounded-xl p-5 mb-7 flex flex-wrap items-center justify-between gap-4"
          style={{ background: "rgba(186,26,26,0.04)", border: "1px solid rgba(186,26,26,0.18)", borderLeft: "4px solid #ba1a1a" }}>
          <div>
            <p className="font-bold text-[#1c1c1a]" style={{ fontSize: "1rem" }}>
              Hay 2 acciones que no cuestan nada y pueden reducir tu rotación a la mitad.
            </p>
            <p style={{ fontSize: "0.82rem", color: "#44474e", marginTop: "4px" }}>
              Convertir contratos a indefinido + publicar bandas salariales internas · Costo: $0 · Impacto: inmediato
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0 text-right">
            <div>
              <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.3rem", color: "#ba1a1a", lineHeight: 1 }}>{fmtM(costoRotacion)}</p>
              <p style={{ fontSize: "0.62rem", color: "#ba1a1a" }}>costo rotación anual hoy</p>
            </div>
            <div>
              <p className="font-bold tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "1.0rem", color: "#2a7d4f" }}>−{fmtM(costoRotacion * 0.55)}</p>
              <p style={{ fontSize: "0.62rem", color: "#2a7d4f" }}>ahorro con plan completo</p>
            </div>
          </div>
        </motion.div>

          <p style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.58rem", color: "#041635", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>
            Plan de acción
          </p>
          <h2 className="text-lg font-bold text-[#1c1c1a] mb-2">5 palancas por urgencia y retorno</h2>
          <p className="text-sm mb-6" style={{ color: "#75777f" }}>
            Costo estimado de rotación anual: <strong className="text-[#1c1c1a]">{fmtM(costoRotacion)}</strong> ·
            Ahorro proyectado con plan completo: <strong style={{ color: "#2a7d4f" }}>~{fmtM(costoRotacion * 0.55)}</strong>
          </p>

          <div className="space-y-4">
            {RECS.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-[#e5e2de] bg-white p-5 flex gap-5">
                <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: r.color + "22", color: r.color, fontFamily: "var(--font-space-mono)", border: `1px solid ${r.color}30` }}>
                  {r.num}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1c1c1a] mb-2" style={{ fontSize: "0.9rem" }}>{r.titulo}</p>
                  <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.65 }} className="mb-4">{r.texto}</p>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#e5e2de]">
                    {[
                      { label: "Costo",    v: r.costo,    c: "#44474e" },
                      { label: "Evita",    v: r.evita,    c: "#ba1a1a" },
                      { label: "Ganancia", v: r.ganancia, c: "#2a7d4f" },
                    ].map(d => (
                      <div key={d.label}>
                        <p style={{ fontSize: "0.55rem", fontFamily: "var(--font-space-mono)", color: "#75777f", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>{d.label}</p>
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
          <div className="rounded-xl p-5 border" style={{ background: "#f0ede9", borderColor: "rgba(4,22,53,0.1)" }}>
            <div className="flex items-start gap-3">
              <Shield size={18} style={{ color: "#041635", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p className="font-semibold text-[#1c1c1a] mb-1">Ley 21.719 — Protección de Datos · Vigencia 1 dic. 2026</p>
                <p style={{ fontSize: "0.78rem", color: "#44474e", lineHeight: 1.6 }}>
                  Esta demo procesa solo datos agregados y anonimizados. No contiene RUTs, nombres reales ni información de trabajadores identificables.
                  El restaurante no tiene empleados únicos por cargo con riesgo de re-identificación (mínimo 2 personas por cargo analizado).
                  Recomendación para plan pagado: firmar DPA antes de cargar planilla real con identificadores personales.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-2xl p-8 text-center border border-[#e5e2de] bg-white mb-4">
          <p className="font-bold text-[#1c1c1a] text-xl mb-2">¿Listo para activar el plan completo?</p>
          <p style={{ fontSize: "0.85rem", color: "#75777f", marginBottom: "20px" }}>
            Esta demo expira en 60 días. El plan pagado incluye alertas semanales, actualización en tiempo real y diagnóstico personalizado con tu planilla real.
          </p>
          <a href="/empresas#contacto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: "#041635", color: "#ffffff" }}>
            Contactar al equipo RemuneraLab <ArrowRight size={15} />
          </a>
        </section>

        {/* Pie */}
        <p className="text-center pb-8" style={{ fontSize: "0.68rem", color: "#9a9a9a" }}>
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
