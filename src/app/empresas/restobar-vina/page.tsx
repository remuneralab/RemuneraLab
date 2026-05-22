"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell,
  LineChart, Line, ReferenceLine,
} from "recharts";
import {
  AlertTriangle, Users, DollarSign, TrendingUp, Lock, Info,
  RotateCcw, Scale, BarChart2, LayoutDashboard, ChevronRight,
} from "lucide-react";

// ─── Auth ────────────────────────────────────────────────────────────────────
const DEMO_PASSWORD = "restobar2025";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}
function fmtM(n: number) { return `$${(n / 1_000_000).toFixed(1)}M`; }
function fmtK(n: number) { return `$${(n / 1_000).toFixed(0)}k`; }

// ─── Tipos ───────────────────────────────────────────────────────────────────
type Area = "Cocina" | "Salón" | "Barra";
type Clasif = "ALTO" | "MEDIO" | "BAJO";
type Section = "resumen" | "rotacion" | "cumplimiento" | "mercado" | "bandas";

interface T {
  n: number; nombre: string; cargo: string; area: Area;
  pt: boolean; sexo: "F" | "M";
  sueldoBase: number; totalImponible: number;
  costoDesvinc: number; clasif: Clasif;
  antiguedad: number; antiguedadTxt: string;
  pasivoTotal: number; pctMercado: number;
}

// ─── Datos (planilla mayo 2025) ───────────────────────────────────────────────
const WORKERS: T[] = [
  { n:1,  nombre:"Carlos Muñoz Rojas",         cargo:"Jefe de Cocina",   area:"Cocina", pt:false, sexo:"M", sueldoBase:720000,  totalImponible:915000,  costoDesvinc:5128776, clasif:"ALTO",  antiguedad:4.08, antiguedadTxt:"4 años 1 mes",    pasivoTotal:4408776, pctMercado:28 },
  { n:2,  nombre:"Sebastián Lara Espinoza",     cargo:"Jefe de Cocina",   area:"Cocina", pt:false, sexo:"M", sueldoBase:720000,  totalImponible:915000,  costoDesvinc:3779976, clasif:"ALTO",  antiguedad:2.83, antiguedadTxt:"2 años 10 meses", pasivoTotal:3059976, pctMercado:28 },
  { n:3,  nombre:"Rodrigo Fuentes Cid",         cargo:"Cocinero",         area:"Cocina", pt:false, sexo:"M", sueldoBase:600000,  totalImponible:765000,  costoDesvinc:3526000, clasif:"ALTO",  antiguedad:3.25, antiguedadTxt:"3 años 3 meses",  pasivoTotal:2926000, pctMercado:38 },
  { n:4,  nombre:"Felipe Araya Morales",        cargo:"Cocinero",         area:"Cocina", pt:false, sexo:"M", sueldoBase:600000,  totalImponible:780000,  costoDesvinc:2249980, clasif:"MEDIO", antiguedad:1.83, antiguedadTxt:"1 año 10 meses",  pasivoTotal:1649980, pctMercado:38 },
  { n:5,  nombre:"Diego Contreras Pérez",       cargo:"Cocinero",         area:"Cocina", pt:false, sexo:"M", sueldoBase:600000,  totalImponible:780000,  costoDesvinc:1726000, clasif:"MEDIO", antiguedad:1.25, antiguedadTxt:"1 año 3 meses",   pasivoTotal:1126000, pctMercado:38 },
  { n:6,  nombre:"Javiera Rojas Soto",          cargo:"Ayudante Cocina",  area:"Cocina", pt:false, sexo:"F", sueldoBase:539000,  totalImponible:688750,  costoDesvinc:1820014, clasif:"MEDIO", antiguedad:1.58, antiguedadTxt:"1 año 7 meses",   pasivoTotal:1281014, pctMercado:25 },
  { n:7,  nombre:"Camila Torres Vega",          cargo:"Ayudante Cocina",  area:"Cocina", pt:false, sexo:"F", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:1482273, clasif:"MEDIO", antiguedad:1.17, antiguedadTxt:"1 año 2 meses",   pasivoTotal:943273,  pctMercado:25 },
  { n:8,  nombre:"Ignacio Herrera Díaz",        cargo:"Ayudante Cocina",  area:"Cocina", pt:false, sexo:"M", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:2359035, clasif:"MEDIO", antiguedad:2.25, antiguedadTxt:"2 años 3 meses",  pasivoTotal:1820035, pctMercado:25 },
  { n:9,  nombre:"Valentina Núñez Reyes",       cargo:"Copero/a",         area:"Cocina", pt:false, sexo:"F", sueldoBase:539000,  totalImponible:688750,  costoDesvinc:650395,  clasif:"BAJO",  antiguedad:0.42, antiguedadTxt:"5 meses",         pasivoTotal:111395,  pctMercado:52 },
  { n:10, nombre:"Bastián Flores Campos",       cargo:"Copero/a",         area:"Cocina", pt:false, sexo:"M", sueldoBase:539000,  totalImponible:688750,  costoDesvinc:628835,  clasif:"BAJO",  antiguedad:0.33, antiguedadTxt:"4 meses",         pasivoTotal:89835,   pctMercado:52 },
  { n:11, nombre:"Catalina Meza Lagos",         cargo:"Copero/a",         area:"Cocina", pt:false, sexo:"F", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:1952985, clasif:"MEDIO", antiguedad:1.75, antiguedadTxt:"1 año 9 meses",   pasivoTotal:1413985, pctMercado:52 },
  { n:12, nombre:"Marcela Salas Ibáñez",        cargo:"Jefe de Local",    area:"Salón",  pt:false, sexo:"F", sueldoBase:850000,  totalImponible:1062500, costoDesvinc:7120170, clasif:"ALTO",  antiguedad:4.92, antiguedadTxt:"4 años 11 meses", pasivoTotal:6270170, pctMercado:25 },
  { n:13, nombre:"Roberto Pizarro Mora",        cargo:"Jefe de Local",    area:"Salón",  pt:false, sexo:"M", sueldoBase:850000,  totalImponible:1077500, costoDesvinc:5525010, clasif:"ALTO",  antiguedad:3.67, antiguedadTxt:"3 años 8 meses",  pasivoTotal:4675010, pctMercado:25 },
  { n:14, nombre:"Andrea Castillo Bravo",       cargo:"Jefe de Garzones", area:"Salón",  pt:false, sexo:"F", sueldoBase:650000,  totalImponible:842500,  costoDesvinc:4062518, clasif:"ALTO",  antiguedad:3.50, antiguedadTxt:"3 años 6 meses",  pasivoTotal:3412518, pctMercado:37 },
  { n:15, nombre:"Fernando Lagos Sepúlveda",    cargo:"Jefe de Garzones", area:"Salón",  pt:false, sexo:"M", sueldoBase:650000,  totalImponible:842500,  costoDesvinc:2762533, clasif:"MEDIO", antiguedad:2.17, antiguedadTxt:"2 años 2 meses",  pasivoTotal:2112533, pctMercado:37 },
  { n:16, nombre:"Gonzalo Vera Figueroa",       cargo:"Cajero/a",         area:"Salón",  pt:false, sexo:"M", sueldoBase:570000,  totalImponible:727500,  costoDesvinc:3277519, clasif:"ALTO",  antiguedad:3.17, antiguedadTxt:"3 años 2 meses",  pasivoTotal:2707519, pctMercado:36 },
  { n:17, nombre:"Paola Medina Quiroz",         cargo:"Cajero/a",         area:"Salón",  pt:false, sexo:"F", sueldoBase:570000,  totalImponible:742500,  costoDesvinc:1852500, clasif:"MEDIO", antiguedad:1.50, antiguedadTxt:"1 año 6 meses",   pasivoTotal:1282500, pctMercado:36 },
  { n:18, nombre:"Nicolás Ramos Olivares",      cargo:"Garzonero/a",      area:"Salón",  pt:false, sexo:"M", sueldoBase:539000,  totalImponible:688750,  costoDesvinc:3773020, clasif:"ALTO",  antiguedad:4.00, antiguedadTxt:"4 años",          pasivoTotal:3234020, pctMercado:25 },
  { n:19, nombre:"Sofía Álvarez Tapia",         cargo:"Garzonero/a",      area:"Salón",  pt:false, sexo:"F", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:1413964, clasif:"MEDIO", antiguedad:1.08, antiguedadTxt:"1 año 1 mes",     pasivoTotal:874964,  pctMercado:25 },
  { n:20, nombre:"Matías Gutiérrez Torres",     cargo:"Garzonero/a",      area:"Salón",  pt:false, sexo:"M", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:1952985, clasif:"MEDIO", antiguedad:1.75, antiguedadTxt:"1 año 9 meses",   pasivoTotal:1413985, pctMercado:25 },
  { n:21, nombre:"Daniela Cortés Neira",        cargo:"Garzonero/a",      area:"Salón",  pt:false, sexo:"F", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:1550530, clasif:"MEDIO", antiguedad:1.25, antiguedadTxt:"1 año 3 meses",   pasivoTotal:1011530, pctMercado:25 },
  { n:22, nombre:"Tomás Espinoza Valdés",       cargo:"Garzonero/a",      area:"Salón",  pt:false, sexo:"M", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:2156010, clasif:"MEDIO", antiguedad:2.00, antiguedadTxt:"2 años",          pasivoTotal:1617010, pctMercado:25 },
  { n:23, nombre:"Isidora Molina Cerda",        cargo:"Garzonero/a",      area:"Salón",  pt:false, sexo:"F", sueldoBase:539000,  totalImponible:703750,  costoDesvinc:2628519, clasif:"MEDIO", antiguedad:2.58, antiguedadTxt:"2 años 7 meses",  pasivoTotal:2089519, pctMercado:25 },
  { n:24, nombre:"Renata Silva Poblete",        cargo:"Garzonero/a PT",   area:"Salón",  pt:true,  sexo:"F", sueldoBase:303450,  totalImponible:409312,  costoDesvinc:341887,  clasif:"BAJO",  antiguedad:0.25, antiguedadTxt:"3 meses",         pasivoTotal:38437,   pctMercado:55 },
  { n:25, nombre:"Alonso Jara Fuentes",         cargo:"Garzonero/a PT",   area:"Salón",  pt:true,  sexo:"M", sueldoBase:303450,  totalImponible:409312,  costoDesvinc:341887,  clasif:"BAJO",  antiguedad:0.25, antiguedadTxt:"3 meses",         pasivoTotal:38437,   pctMercado:55 },
  { n:26, nombre:"Esteban Carrasco Mondaca",    cargo:"Jefe de Barra",    area:"Barra",  pt:false, sexo:"M", sueldoBase:670000,  totalImponible:867500,  costoDesvinc:4272326, clasif:"ALTO",  antiguedad:3.58, antiguedadTxt:"3 años 7 meses",  pasivoTotal:3602326, pctMercado:33 },
  { n:27, nombre:"Valentín Moreno Acuña",       cargo:"Jefe de Barra",    area:"Barra",  pt:false, sexo:"M", sueldoBase:670000,  totalImponible:867500,  costoDesvinc:3182488, clasif:"ALTO",  antiguedad:2.50, antiguedadTxt:"2 años 6 meses",  pasivoTotal:2512488, pctMercado:33 },
  { n:28, nombre:"Fernanda Ojeda Yáñez",        cargo:"Bartender",        area:"Barra",  pt:false, sexo:"F", sueldoBase:570000,  totalImponible:727500,  costoDesvinc:3349700, clasif:"ALTO",  antiguedad:3.25, antiguedadTxt:"3 años 3 meses",  pasivoTotal:2779700, pctMercado:33 },
  { n:29, nombre:"Maximiliano Ríos Henríquez",  cargo:"Bartender",        area:"Barra",  pt:false, sexo:"M", sueldoBase:570000,  totalImponible:742500,  costoDesvinc:1995019, clasif:"MEDIO", antiguedad:1.67, antiguedadTxt:"1 año 8 meses",   pasivoTotal:1425019, pctMercado:33 },
  { n:30, nombre:"Antonia Vidal Contreras",     cargo:"Bartender",        area:"Barra",  pt:false, sexo:"F", sueldoBase:570000,  totalImponible:742500,  costoDesvinc:1567519, clasif:"MEDIO", antiguedad:1.17, antiguedadTxt:"1 año 2 meses",   pasivoTotal:997519,  pctMercado:33 },
  { n:31, nombre:"Héctor Peña Gallardo",        cargo:"Bartender",        area:"Barra",  pt:false, sexo:"M", sueldoBase:570000,  totalImponible:742500,  costoDesvinc:2065300, clasif:"MEDIO", antiguedad:1.75, antiguedadTxt:"1 año 9 meses",   pasivoTotal:1495300, pctMercado:33 },
];

const COSTO_EMPRESA = 24_493_853;
const PASIVO_TOTAL  = 62_420_773;
const PASIVO_COCINA = 18_830_269;
const PASIVO_SALON  = 30_778_152;
const PASIVO_BARRA  = 12_812_352;

const PROYECCION = [
  { mes:"May 25", pasivo:62_420_773 },
  { mes:"Jun 25", pasivo:64_535_317 },
  { mes:"Jul 25", pasivo:66_654_271 },
  { mes:"Ago 25", pasivo:68_773_224 },
  { mes:"Sep 25", pasivo:70_892_179 },
  { mes:"Oct 25", pasivo:73_011_133 },
  { mes:"Nov 25", pasivo:75_130_088 },
  { mes:"Dic 25", pasivo:77_788_043 },
  { mes:"Ene 26", pasivo:80_490_912 },
  { mes:"Feb 26", pasivo:83_306_600 },
  { mes:"Mar 26", pasivo:85_565_964 },
  { mes:"Abr 26", pasivo:87_825_324 },
  { mes:"May 26", pasivo:90_084_686 },
];

const BENCHMARK: Record<string, { p25:number; p50:number; p75:number }> = {
  "Jefe de Cocina":   { p25:700_000, p50:850_000, p75:1_050_000 },
  "Cocinero":         { p25:550_000, p50:650_000, p75:800_000 },
  "Ayudante Cocina":  { p25:539_000, p50:545_000, p75:660_000 },
  "Copero/a":         { p25:530_000, p50:530_000, p75:620_000 },
  "Jefe de Local":    { p25:850_000, p50:1_050_000, p75:1_350_000 },
  "Jefe de Garzones": { p25:590_000, p50:720_000, p75:900_000 },
  "Cajero/a":         { p25:539_000, p50:610_000, p75:750_000 },
  "Garzonero/a":      { p25:539_000, p50:580_000, p75:700_000 },
  "Garzonero/a PT":   { p25:539_000, p50:580_000, p75:700_000 },
  "Jefe de Barra":    { p25:620_000, p50:780_000, p75:980_000 },
  "Bartender":        { p25:539_000, p50:640_000, p75:800_000 },
};

// ─── Presión de mercado ───────────────────────────────────────────────────────
type PresionRow = {
  cargo: string; n_empresa: number; avisos90d: number; avisosTrend: number;
  med90d: number; empresa: number; salGap: number; tensionIdx: number;
  nivel: "alta" | "media-alta" | "media" | "baja"; narrativa: string;
};

const PRESION: PresionRow[] = [
  { cargo:"Garzonero/a",     n_empresa:8, avisos90d:52, avisosTrend:+34.0, med90d:600_000, empresa:539_000, salGap:-10.2, tensionIdx:88,
    nivel:"alta", narrativa:"52 avisos activos en la región compiten por el mismo perfil. Alta movilidad laboral. El mercado ofrece hasta $600k + propinas en locales premium del borde costero." },
  { cargo:"Jefe de Local",   n_empresa:2, avisos90d:6,  avisosTrend:+8.3,  med90d:1_100_000, empresa:850_000, salGap:-22.7, tensionIdx:85,
    nivel:"alta", narrativa:"Mayor brecha absoluta en jefaturas: $250k/mes bajo mediana de oferta activa. Perfil difícil de reponer — reemplazo toma 8–12 semanas mínimo en la región." },
  { cargo:"Bartender",       n_empresa:3, avisos90d:22, avisosTrend:+25.0, med90d:680_000, empresa:570_000, salGap:-16.2, tensionIdx:79,
    nivel:"alta", narrativa:"Demanda de bartenders creciendo 25% en 90 días. Especialización en coctelería de autor eleva las bandas hasta $800k en locales de la zona portuaria." },
  { cargo:"Jefe de Cocina",  n_empresa:2, avisos90d:12, avisosTrend:+14.3, med90d:950_000, empresa:720_000, salGap:-24.2, tensionIdx:78,
    nivel:"alta", narrativa:"Brecha de $230k/mes vs mediana de mercado. Perfil escaso en Valparaíso — reposición toma 8–12 semanas. Riesgo de fuga elevado en los próximos 6 meses." },
  { cargo:"Cocinero",        n_empresa:3, avisos90d:28, avisosTrend:+18.5, med90d:680_000, empresa:600_000, salGap:-11.8, tensionIdx:72,
    nivel:"alta", narrativa:"Brecha de $80k/mes en una plaza con oferta activa creciente. Alto riesgo de migración a los nuevos proyectos gastronómicos que se abren en la región." },
  { cargo:"Jefe de Barra",   n_empresa:2, avisos90d:9,  avisosTrend:+12.5, med90d:820_000, empresa:670_000, salGap:-18.3, tensionIdx:74,
    nivel:"media-alta", narrativa:"Mercado en crecimiento para jefaturas de barra. Brecha de $150k vs oferta activa. Perfil difícil de reponer sin período de adaptación al estilo del local." },
  { cargo:"Ayudante Cocina", n_empresa:3, avisos90d:38, avisosTrend:+29.0, med90d:560_000, empresa:539_000, salGap:-3.7,  tensionIdx:62,
    nivel:"media-alta", narrativa:"Brecha menor pero oferta abundante. 38 avisos activos facilitan la búsqueda activa. Retención a nivel IMM en un mercado con presión creciente." },
  { cargo:"Cajero/a",        n_empresa:2, avisos90d:14, avisosTrend:-5.0,  med90d:620_000, empresa:570_000, salGap:-8.1,  tensionIdx:42,
    nivel:"media", narrativa:"Demanda estable o en leve retroceso. Brecha manejable de $50k/mes. Riesgo moderado — perfil con menor movilidad que operativos de cocina o sala." },
  { cargo:"Copero/a",        n_empresa:3, avisos90d:8,  avisosTrend:+2.0,  med90d:545_000, empresa:539_000, salGap:-1.1,  tensionIdx:28,
    nivel:"baja", narrativa:"Mercado con poca actividad para este perfil. Brecha mínima de $6k/mes. Bajo riesgo de fuga inducida por oferta de mercado." },
];

// ─── Estilos ──────────────────────────────────────────────────────────────────
const MONO = { fontFamily: "var(--font-space-mono)" } as const;
const SANS = { fontFamily: "var(--font-dm-sans)" } as const;
const LABEL_CLS = "uppercase tracking-[0.18em] text-white/40 text-[0.6rem] block mb-2";
const CARD_CLS  = "rounded-xl border border-white/10 p-6";
const CLASIF_COLOR: Record<Clasif, string> = { ALTO:"#ef4444", MEDIO:"#f59e0b", BAJO:"#22c55e" };

// ─── Tooltip scatter ─────────────────────────────────────────────────────────
function ScatterTip({ active, payload }: { active?: boolean; payload?: { payload: T }[] }) {
  if (!active || !payload?.length) return null;
  const t = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/15 p-3 text-xs" style={{ background:"#1a0d3e", ...SANS }}>
      <p className="text-white font-semibold mb-1">{t.nombre}</p>
      <p className="text-white/50 mb-2">{t.cargo} · {t.area}</p>
      <div className="space-y-0.5">
        <p className="text-white/70">Costo desvinc.: <span className="text-white">{fmtM(t.costoDesvinc)}</span></p>
        <p className="text-white/70">Percentil mercado: <span className="text-white">P{t.pctMercado}</span></p>
        <p className="text-white/70">Antigüedad: <span className="text-white">{t.antiguedadTxt}</span></p>
      </div>
    </div>
  );
}

// ─── M01: Mapa de Riesgo ─────────────────────────────────────────────────────
function MapaRiesgo() {
  const alto  = WORKERS.filter(w => w.clasif === "ALTO");
  const medio = WORKERS.filter(w => w.clasif === "MEDIO");
  const bajo  = WORKERS.filter(w => w.clasif === "BAJO");
  return (
    <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <span className={LABEL_CLS} style={MONO}>Mapa de riesgo individual</span>
          <h2 className="text-white font-semibold text-lg" style={SANS}>Dispersión por Costo y Percentil</h2>
          <p className="text-white/40 text-sm mt-1" style={SANS}>
            Eje X: costo de desvinculación · Eje Y: percentil vs mercado ESI Valparaíso · Tamaño: antigüedad
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs shrink-0 ml-4" style={MONO}>
          {(["ALTO","MEDIO","BAJO"] as Clasif[]).map(c => (
            <span key={c} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: CLASIF_COLOR[c] }} />
              <span className="text-white/40">{c}</span>
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top:20, right:30, bottom:20, left:10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="costoDesvinc" type="number" name="Costo desvinc." domain={[0, 8_000_000]}
            tickFormatter={v => fmtM(v as number)}
            tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11, fontFamily:"var(--font-space-mono)" }}
            label={{ value:"Costo desvinculación →", position:"insideBottom", offset:-10, fill:"rgba(255,255,255,0.25)", fontSize:10, fontFamily:"var(--font-space-mono)" }}
          />
          <YAxis dataKey="pctMercado" type="number" name="Percentil mercado" domain={[0, 100]}
            tickFormatter={v => `P${v}`}
            tick={{ fill:"rgba(255,255,255,0.35)", fontSize:11, fontFamily:"var(--font-space-mono)" }}
            label={{ value:"Percentil →", angle:-90, position:"insideLeft", offset:15, fill:"rgba(255,255,255,0.25)", fontSize:10, fontFamily:"var(--font-space-mono)" }}
          />
          <ZAxis dataKey="antiguedad" range={[60, 400]} />
          <ReferenceLine y={50} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4"
            label={{ value:"Mediana mercado", position:"right", fill:"rgba(255,255,255,0.2)", fontSize:9, fontFamily:"var(--font-space-mono)" }} />
          <RTooltip content={<ScatterTip />} cursor={{ strokeDasharray:"3 3", stroke:"rgba(255,255,255,0.2)" }} />
          <Scatter data={alto}  fill="#ef4444" fillOpacity={0.85} />
          <Scatter data={medio} fill="#f59e0b" fillOpacity={0.85} />
          <Scatter data={bajo}  fill="#22c55e" fillOpacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-white/30 text-xs mt-2" style={MONO}>
        ⚠ Cuadrante crítico: inferior-derecho = costo alto + sueldo bajo · {alto.length} trabajadores en riesgo alto
      </p>
    </div>
  );
}

// ─── M02: Distribución vs Mercado ─────────────────────────────────────────────
function DistribucionMercado() {
  const cargos = [...new Set(WORKERS.map(w => w.cargo))];
  const data = cargos.map(cargo => {
    const group = WORKERS.filter(w => w.cargo === cargo);
    const avg = group.reduce((s,w) => s + w.sueldoBase, 0) / group.length;
    const bm = BENCHMARK[cargo] ?? { p25:539000, p50:600000, p75:750000 };
    return { cargo: cargo.replace("Garzonero/a", "Garzón/a").replace("Ayudante Cocina","Ay. Cocina"), avg, p50: bm.p50, n: group.length };
  });
  return (
    <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
      <span className={LABEL_CLS} style={MONO}>Sueldo base promedio por cargo</span>
      <h2 className="text-white font-semibold text-lg mb-1" style={SANS}>Empresa vs Mediana de Mercado</h2>
      <p className="text-white/40 text-sm mb-4" style={SANS}>ESI INE Valparaíso/Gastronomía 2024</p>
      <div className="flex gap-4 text-xs mb-3" style={MONO}>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background:"#8568f3" }} />Tu empresa</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1 inline-block bg-white/30" />Mediana mercado (P50)</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top:5, right:20, bottom:60, left:10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="cargo" tick={{ fill:"rgba(255,255,255,0.45)", fontSize:10, fontFamily:"var(--font-space-mono)" }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fill:"rgba(255,255,255,0.35)", fontSize:10, fontFamily:"var(--font-space-mono)" }} />
          <RTooltip
            formatter={(v, name) => [fmtCLP(Number(v)), name === "avg" ? "Tu empresa" : "Mediana mercado"]}
            contentStyle={{ background:"#1a0d3e", border:"1px solid rgba(133,104,243,0.2)", borderRadius:8, fontFamily:"var(--font-dm-sans)", fontSize:12 }}
            labelStyle={{ color:"rgba(255,255,255,0.6)" }}
          />
          <Bar dataKey="avg" name="avg" radius={[4,4,0,0]}>
            {data.map((d) => {
              const bm = BENCHMARK[d.cargo.replace("Garzón/a","Garzonero/a").replace("Ay. Cocina","Ayudante Cocina")] ?? { p50:580000 };
              const ratio = d.avg / bm.p50;
              const color = ratio >= 0.95 ? "#22c55e" : ratio >= 0.80 ? "#f59e0b" : "#ef4444";
              return <Cell key={d.cargo} fill={color} fillOpacity={0.85} />;
            })}
          </Bar>
          <Bar dataKey="p50" name="p50" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 p-3 rounded-lg text-xs" style={{ background:"rgba(133,104,243,0.08)", border:"1px solid rgba(133,104,243,0.15)", ...SANS }}>
        <span className="text-white/50">⚠ </span>
        <span className="text-white/60">Cargos de Salón excluyen propinas. INE y RemuneraLab no incluyen propinas en ingresos formales.</span>
      </div>
    </div>
  );
}

// ─── M03: Pasivo Laboral ─────────────────────────────────────────────────────
function PasivoLaboral() {
  return (
    <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
      <span className={LABEL_CLS} style={MONO}>Pasivo laboral acumulado</span>
      <h2 className="text-white font-semibold text-lg mb-4" style={SANS}>Proyección 12 meses</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([["Cocina", PASIVO_COCINA, "#f97316"], ["Salón", PASIVO_SALON, "#8568f3"], ["Barra", PASIVO_BARRA, "#22d3ee"]] as [string,number,string][]).map(([area, val, color]) => (
          <div key={area} className="rounded-lg p-4" style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${color}25` }}>
            <p className="text-xs mb-1 uppercase tracking-widest" style={{ color, ...MONO }}>{area}</p>
            <p className="text-white font-bold text-xl" style={SANS}>{fmtM(val)}</p>
            <p className="text-white/30 text-xs mt-1" style={MONO}>{Math.round(val / PASIVO_TOTAL * 100)}% del total</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-sm" style={SANS}>Proyección sin altas ni bajas</p>
        <p className="text-xs text-white/30" style={MONO}>+$3.01M/mes</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={PROYECCION} margin={{ top:5, right:20, bottom:5, left:10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="mes" tick={{ fill:"rgba(255,255,255,0.3)", fontSize:10, fontFamily:"var(--font-space-mono)" }} />
          <YAxis tickFormatter={v => fmtM(v as number)} tick={{ fill:"rgba(255,255,255,0.3)", fontSize:10, fontFamily:"var(--font-space-mono)" }} />
          <RTooltip
            formatter={(v) => [fmtCLP(Number(v)), "Pasivo total"]}
            contentStyle={{ background:"#1a0d3e", border:"1px solid rgba(133,104,243,0.2)", borderRadius:8, fontFamily:"var(--font-dm-sans)", fontSize:12 }}
          />
          <ReferenceLine x="Ene 26" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4"
            label={{ value:"2026", fill:"rgba(255,255,255,0.2)", fontSize:9 }} />
          <Line type="monotone" dataKey="pasivo" stroke="#8568f3" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-white/30 text-xs mt-3" style={MONO}>
        Total actual: <span className="text-white/60">{fmtM(PASIVO_TOTAL)}</span> → May 2026: <span className="text-amber-400/80">{fmtM(90_084_686)}</span> (+{fmtM(90_084_686 - PASIVO_TOTAL)})
      </p>
    </div>
  );
}

// ─── M04: Card SUE ────────────────────────────────────────────────────────────
function CardSUE() {
  const mujeres = WORKERS.filter(w => w.sexo === "F");
  const elegiblesEstimadas = 8;
  const sueldoPromElegibles = 570_000;
  const ahorroAnual = elegiblesEstimadas * sueldoPromElegibles * 0.20 * 12;
  return (
    <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
      <span className={LABEL_CLS} style={MONO}>SUE — Subsidio a la Contratación · Ley N°21.808</span>
      <h2 className="text-white font-semibold text-lg mb-1" style={SANS}>Ahorro Fiscal Potencial</h2>
      <p className="text-white/40 text-sm mb-5" style={SANS}>Vigente · SENCE verifica RSH automáticamente</p>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="rounded-lg p-4 text-center" style={{ background:"rgba(255,255,255,0.04)" }}>
          <p className="text-white font-bold text-2xl" style={SANS}>{mujeres.length}</p>
          <p className="text-white/40 text-xs mt-1" style={MONO}>Mujeres en planilla</p>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background:"rgba(133,104,243,0.1)", border:"1px solid rgba(133,104,243,0.2)" }}>
          <p className="text-white font-bold text-2xl" style={SANS}>~{elegiblesEstimadas}</p>
          <p className="text-white/40 text-xs mt-1" style={MONO}>Estimadas elegibles</p>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)" }}>
          <p className="text-green-400 font-bold text-2xl" style={SANS}>{fmtM(ahorroAnual)}</p>
          <p className="text-white/40 text-xs mt-1" style={MONO}>Ahorro fiscal/año</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-white/50 text-xs" style={MONO}>Mujeres identificadas por nombre:</p>
        <div className="flex flex-wrap gap-2">
          {mujeres.map(w => (
            <span key={w.n} className="text-xs px-2.5 py-1 rounded-full" style={{ background:"rgba(133,104,243,0.12)", border:"1px solid rgba(133,104,243,0.2)", color:"rgba(255,255,255,0.7)", fontFamily:"var(--font-dm-sans)" }}>
              {w.nombre.split(" ")[0]} · {w.cargo.split(" ").slice(0,2).join(" ")}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-lg p-3 text-xs" style={{ background:"rgba(247,201,72,0.06)", border:"1px solid rgba(247,201,72,0.15)", ...SANS }}>
        <p className="text-amber-400/80 font-semibold mb-1">⚠ Dato faltante para estimación completa</p>
        <p className="text-white/50">Esta planilla no incluye edades. Para calcular elegibilidad exacta (grupos 18–24 y mayores de 55) se requiere agregar columna <span className="text-white/70">año_nacimiento</span>.</p>
      </div>
    </div>
  );
}

// ─── M05: Cobertura Turnos ────────────────────────────────────────────────────
function AlertaCobertura() {
  const garzonesFT    = WORKERS.filter(w => w.cargo === "Garzonero/a" && !w.pt).length;
  const garzonesTotal = WORKERS.filter(w => w.cargo.startsWith("Garzonero")).length;
  return (
    <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
      <span className={LABEL_CLS} style={MONO}>Cobertura de turnos</span>
      <h2 className="text-white font-semibold text-lg mb-4" style={SANS}>Alerta de Dotación</h2>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-lg p-4" style={{ background:"rgba(255,255,255,0.04)" }}>
          <p className="text-white/40 text-xs mb-1" style={MONO}>Garzones actuales</p>
          <p className="text-white font-bold text-3xl" style={SANS}>{garzonesTotal}</p>
          <p className="text-white/30 text-xs mt-1" style={MONO}>{garzonesFT} FT · 2 PT</p>
        </div>
        <div className="rounded-lg p-4" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-red-400/70 text-xs mb-1" style={MONO}>Déficit estimado</p>
          <p className="text-red-400 font-bold text-3xl" style={SANS}>−2</p>
          <p className="text-white/30 text-xs mt-1" style={MONO}>turnos/semana sin cubrir</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg p-3" style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.12)" }}>
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-white/60 text-sm" style={SANS}>
            Turno Bloque B (14:00–23:00) queda con 2 garzones en vez de 4 los viernes y sábados — riesgo de servicio y sobreexigencia del equipo presente.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-lg p-3" style={{ background:"rgba(133,104,243,0.06)", border:"1px solid rgba(133,104,243,0.12)" }}>
          <Info size={15} className="text-purple-400 shrink-0 mt-0.5" />
          <p className="text-white/60 text-sm" style={SANS}>
            Contratar 1–2 garzones adicionales cuesta ~$539k–$1.1M/mes. El costo de no hacerlo: pérdida de mesas, errores de servicio y rotación acelerada del equipo actual.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Header ───────────────────────────────────────────────────────────────
function KPIRow() {
  const kpis = [
    { label:"Trabajadores",      value:"31",                  sub:"29 FT · 2 PT",            icon:<Users size={18} />,        color:"#8568f3" },
    { label:"Costo empresa/mes", value:fmtM(COSTO_EMPRESA),  sub:"incl. cotizaciones",       icon:<DollarSign size={18} />,   color:"#22d3ee" },
    { label:"Pasivo laboral",    value:fmtM(PASIVO_TOTAL),   sub:"acumulado a may 2025",     icon:<TrendingUp size={18} />,   color:"#f59e0b" },
    { label:"Exposición máxima", value:"$80.5M",              sub:"costo desvincular todo",   icon:<AlertTriangle size={18} />,color:"#ef4444" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map(k => (
        <div key={k.label} className={`${CARD_CLS} flex flex-col gap-2`} style={{ background:"rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-2" style={{ color: k.color }}>
            {k.icon}
            <span className="text-xs uppercase tracking-widest" style={{ ...MONO, color:"rgba(255,255,255,0.35)" }}>{k.label}</span>
          </div>
          <p className="text-white font-bold text-2xl leading-none" style={SANS}>{k.value}</p>
          <p className="text-white/30 text-xs" style={MONO}>{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const NAV = [
  { id: "rotacion"     as Section, label: "Rotación de Personal",     Icon: RotateCcw  },
  { id: "cumplimiento" as Section, label: "Cumplimiento y Subsidios", Icon: Scale      },
  { id: "mercado"      as Section, label: "Presión de Mercado",       Icon: TrendingUp },
  { id: "bandas"       as Section, label: "Bandas Salariales",        Icon: BarChart2  },
];

function Sidebar({ section, onSection }: { section: Section; onSection: (s: Section) => void }) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full flex-col"
      style={{ width:"240px", background:"rgba(10,5,28,0.98)", borderRight:"1px solid rgba(133,104,243,0.10)", zIndex:40 }}>
      <div className="px-6 py-5" style={{ borderBottom:"1px solid rgba(133,104,243,0.08)" }}>
        <Link href="/empresas">
          <span className="font-semibold text-white" style={{ ...SANS, fontSize:"1.1rem" }}>RemuneraLab</span>
        </Link>
        <p style={{ ...MONO, fontSize:"0.46rem", letterSpacing:"0.22em", color:"rgba(133,104,243,0.5)", textTransform:"uppercase", marginTop:"4px" }}>
          Demo empresarial
        </p>
      </div>
      <div className="px-6 py-3" style={{ borderBottom:"1px solid rgba(133,104,243,0.05)" }}>
        <p style={{ ...MONO, fontSize:"0.46rem", letterSpacing:"0.14em", color:"rgba(133,104,243,0.35)", textTransform:"uppercase", lineHeight:1.6 }}>
          Restobar Viña del Mar
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto py-3">
        <div onClick={() => onSection("resumen")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 cursor-pointer transition-all hover:brightness-110"
          style={{ background: section==="resumen" ? "rgba(133,104,243,0.14)" : "rgba(133,104,243,0.07)", border: section==="resumen" ? "1px solid rgba(133,104,243,0.35)" : "1px solid rgba(133,104,243,0.20)" }}>
          <LayoutDashboard size={14} style={{ color:"#8568f3", flexShrink:0 }} />
          <span style={{ ...SANS, fontSize:"0.82rem", color:"#a387f5", fontWeight:500 }}>Panel principal</span>
        </div>
        <div style={{ height:"1px", background:"rgba(255,255,255,0.05)", margin:"4px 4px 6px" }} />
        {NAV.map(({ id, label, Icon }) => {
          const active = section === id;
          return (
            <div key={id} onClick={() => onSection(id)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
              style={{ background: active ? "rgba(133,104,243,0.12)" : "transparent", border: active ? "1px solid rgba(133,104,243,0.18)" : "1px solid transparent" }}>
              <Icon size={14} style={{ color: active ? "#8568f3" : "rgba(255,255,255,0.22)", flexShrink:0 }} />
              <span style={{ ...SANS, fontSize:"0.82rem", color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.30)", fontWeight: active ? 500 : 400 }}>
                {label}
              </span>
            </div>
          );
        })}
      </nav>
      <div className="px-5 py-4" style={{ borderTop:"1px solid rgba(133,104,243,0.08)" }}>
        <span className="inline-block mb-2 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
          style={{ background:"rgba(133,104,243,0.12)", color:"#a387f5", border:"1px solid rgba(133,104,243,0.2)", ...MONO }}>
          Demo activa
        </span>
        <p style={{ ...MONO, fontSize:"0.46rem", letterSpacing:"0.14em", color:"rgba(133,104,243,0.25)", textTransform:"uppercase" }}>
          Mayo 2025 · Confidencial
        </p>
      </div>
    </aside>
  );
}

function MobileNav({ section, onSection }: { section: Section; onSection: (s: Section) => void }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40"
      style={{ background:"rgba(24,11,59,0.98)", borderBottom:"1px solid rgba(133,104,243,0.10)" }}>
      <div className="flex items-center justify-between px-5 h-12">
        <Link href="/empresas">
          <span className="font-semibold text-white" style={{ ...SANS, fontSize:"1.0rem" }}>RemuneraLab</span>
        </Link>
        <button onClick={() => onSection("resumen")} className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-semibold hover:opacity-80 transition-opacity"
          style={{ background:"rgba(133,104,243,0.12)", color:"#a387f5", border:"1px solid rgba(133,104,243,0.25)", ...SANS }}>
          <LayoutDashboard size={11} /> Panel
        </button>
      </div>
      <div className="flex overflow-x-auto px-2 pb-2 gap-1" style={{ borderTop:"1px solid rgba(133,104,243,0.06)" }}>
        {NAV.map(({ id, label, Icon }) => {
          const active = section === id;
          return (
            <button key={id} onClick={() => onSection(id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0"
              style={{ background: active ? "rgba(133,104,243,0.14)" : "transparent", border: active ? "1px solid rgba(133,104,243,0.2)" : "1px solid transparent", color: active ? "#a387f5" : "rgba(255,255,255,0.30)" }}>
              <Icon size={10} style={{ color: active ? "#8568f3" : "rgba(255,255,255,0.28)" }} />
              <span style={{ fontSize:"0.68rem", ...SANS }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sección: Panel principal ─────────────────────────────────────────────────
function VistaResumen({ onSection }: { onSection: (s: Section) => void }) {
  const alto = WORKERS.filter(w => w.clasif === "ALTO");
  const totalAlto = alto.reduce((s, w) => s + w.costoDesvinc, 0);
  const mujeres = WORKERS.filter(w => w.sexo === "F");
  const ahorroSUE = 8 * 570_000 * 0.20 * 12;

  const cards = [
    {
      section:"rotacion" as Section, color:"#ef4444",
      Icon: RotateCcw, label:"Rotación de Personal",
      metric:`${alto.length}`, metricSub:"trabajadores en riesgo ALTO",
      bullets:[`Exposición en finiquitos: ${fmtM(totalAlto)}`, "Calculadora de escenarios incluida", "10 cargos críticos identificados"],
      cta:"Ver calculadora de rotación",
    },
    {
      section:"cumplimiento" as Section, color:"#22c55e",
      Icon: Scale, label:"Cumplimiento y Subsidios",
      metric:fmtM(ahorroSUE), metricSub:"ahorro fiscal potencial/año (SUE)",
      bullets:[`${mujeres.length} mujeres en planilla · ~8 elegibles SUE`, "Ley Karin · vigente agosto 2024", "Jornada 40h: ajuste 2026 en preparación"],
      cta:"Ver cumplimiento legal",
    },
    {
      section:"mercado" as Section, color:"#f59e0b",
      Icon: TrendingUp, label:"Presión de Mercado",
      metric:"+34%", metricSub:"aumento avisos Garzonero/a (90d)",
      bullets:["Garzonero/a: 52 avisos activos · tensión 88/100", "Jefe de Cocina: −24.2% vs oferta mercado", "Bartender: +25% crecimiento demanda"],
      cta:"Ver presión de mercado",
    },
    {
      section:"bandas" as Section, color:"#8568f3",
      Icon: BarChart2, label:"Bandas Salariales",
      metric:"3", metricSub:"cargos con brecha >15% vs mercado",
      bullets:["Jefe de Local: empresa paga P25 vs mercado", "Garzonero/a: brecha −10% mediana", "Pasivo laboral: crece $3M/mes"],
      cta:"Ver bandas salariales",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
        <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color:"#8568f3", ...MONO }}>
          Panel principal · Mayo 2025
        </p>
        <h1 className="text-white font-semibold mb-1" style={{ fontSize:"clamp(1.4rem, 3vw, 1.9rem)", ...SANS }}>
          Restobar Viña del Mar
        </h1>
        <p className="text-white/40 text-sm" style={SANS}>
          31 trabajadores · Gastronomía · Región de Valparaíso · Período mayo 2025
        </p>
      </motion.div>
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.08 }}>
        <KPIRow />
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map((card, i) => (
          <motion.div key={card.section}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.12 + i * 0.08, duration:0.42 }}
            onClick={() => onSection(card.section)}
            className="relative rounded-2xl p-6 cursor-pointer group overflow-hidden"
            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", transition:"border-color 0.2s, box-shadow 0.2s" }}
            whileHover={{ scale:1.015, boxShadow:`0 0 32px ${card.color}25` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background:card.color }} />
            <div className="flex items-start justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background:`${card.color}18`, color:card.color, border:`1px solid ${card.color}30`, ...MONO }}>
                <card.Icon size={11} /> {card.label}
              </span>
              <ChevronRight size={15} style={{ color:card.color, opacity:0.6, marginTop:"2px" }} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-3xl font-bold tabular-nums mb-0.5" style={{ color:card.color, ...MONO }}>{card.metric}</p>
            <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.35)", ...MONO }}>{card.metricSub}</p>
            <ul className="space-y-1.5 mb-4">
              {card.bullets.map(b => (
                <li key={b} className="flex items-start gap-2 text-xs" style={{ color:"rgba(255,255,255,0.55)" }}>
                  <span style={{ color:card.color, flexShrink:0 }}>›</span> {b}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color:card.color }}>
              {card.cta} <ChevronRight size={13} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Sección: Rotación de Personal ───────────────────────────────────────────
function VistaRotacion() {
  const altoWorkers = WORKERS.filter(w => w.clasif === "ALTO").sort((a, b) => b.costoDesvinc - a.costoDesvinc);
  const medio = WORKERS.filter(w => w.clasif === "MEDIO");
  const bajo  = WORKERS.filter(w => w.clasif === "BAJO");
  const [nSalidas, setNSalidas] = useState(3);

  function costoReposicion(w: T) {
    if (w.cargo.includes("Jefe") || w.cargo === "Cocinero") return Math.round(w.sueldoBase * 0.6);
    return Math.round(w.sueldoBase * 0.4);
  }

  const selected       = altoWorkers.slice(0, nSalidas);
  const totalSeverance = selected.reduce((s, w) => s + w.costoDesvinc, 0);
  const totalRepos     = selected.reduce((s, w) => s + costoReposicion(w), 0);
  const totalCosto     = totalSeverance + totalRepos;
  const totalAltoExp   = altoWorkers.reduce((s, w) => s + w.costoDesvinc, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
        <span className={LABEL_CLS} style={MONO}>Calculadora de costos</span>
        <h2 className="text-white font-semibold text-xl" style={SANS}>Rotación de Personal</h2>
        <p className="text-white/40 text-sm mt-1" style={SANS}>
          Costo estimado por cargo: finiquito (Art. 163 CT) + costo de reposición (reclutamiento + capacitación)
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { clasif:"ALTO" as Clasif, workers:altoWorkers, exp:totalAltoExp, color:"#ef4444", bg:"rgba(239,68,68,0.06)", border:"rgba(239,68,68,0.15)" },
          { clasif:"MEDIO" as Clasif, workers:medio, exp:medio.reduce((s,w)=>s+w.costoDesvinc,0), color:"#f59e0b", bg:"rgba(245,158,11,0.06)", border:"rgba(245,158,11,0.15)" },
          { clasif:"BAJO" as Clasif, workers:bajo, exp:bajo.reduce((s,w)=>s+w.costoDesvinc,0), color:"#22c55e", bg:"rgba(34,197,94,0.06)", border:"rgba(34,197,94,0.15)" },
        ].map(({ clasif, workers, exp, color, bg, border }) => (
          <div key={clasif} className="rounded-xl p-4" style={{ background:bg, border:`1px solid ${border}` }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ ...MONO, color }}>Riesgo {clasif}</p>
            <p className="text-white font-bold text-2xl" style={SANS}>{workers.length}</p>
            <p className="text-white/40 text-xs mt-1" style={MONO}>{fmtM(exp)} exposición</p>
          </div>
        ))}
      </div>

      <MapaRiesgo />

      <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
        <span className={LABEL_CLS} style={MONO}>Simulador de escenarios · Riesgo ALTO</span>
        <h3 className="text-white font-semibold mb-4" style={SANS}>¿Cuánto costaría si rotan los trabajadores de mayor riesgo?</h3>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <p className="text-white/60 text-sm" style={SANS}>Salidas estimadas en 12 meses</p>
            <p className="text-white font-bold text-sm" style={MONO}>{nSalidas} de {altoWorkers.length} ALTO</p>
          </div>
          <input type="range" min={1} max={altoWorkers.length} value={nSalidas}
            onChange={e => setNSalidas(Number(e.target.value))}
            className="w-full" style={{ accentColor:"#8568f3" }}
          />
          <div className="flex justify-between text-xs text-white/25 mt-1" style={MONO}>
            <span>1 salida</span><span>{altoWorkers.length} salidas</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="rounded-lg p-4 text-center" style={{ background:"rgba(255,255,255,0.04)" }}>
            <p className="text-white font-bold text-lg" style={SANS}>{fmtM(totalSeverance)}</p>
            <p className="text-white/40 text-xs mt-1" style={MONO}>Finiquitos</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ background:"rgba(255,255,255,0.04)" }}>
            <p className="text-white font-bold text-lg" style={SANS}>{fmtM(totalRepos)}</p>
            <p className="text-white/40 text-xs mt-1" style={MONO}>Reposición</p>
          </div>
          <div className="rounded-lg p-4 text-center" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-red-400 font-bold text-lg" style={SANS}>{fmtM(totalCosto)}</p>
            <p className="text-white/40 text-xs mt-1" style={MONO}>Costo total</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3" style={MONO}>Trabajadores incluidos en el escenario</p>
          {selected.map(w => (
            <div key={w.n} className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(239,68,68,0.10)" }}>
              <div>
                <p className="text-white text-sm font-medium" style={SANS}>{w.nombre}</p>
                <p className="text-white/40 text-xs" style={MONO}>{w.cargo} · {w.area} · {w.antiguedadTxt}</p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-semibold text-sm" style={MONO}>{fmtM(w.costoDesvinc + costoReposicion(w))}</p>
                <p className="text-white/25 text-[10px]" style={MONO}>finiquito + reposición</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/20 text-xs text-center pb-2" style={MONO}>
        Finiquito: Art. 163 CT (indemnización años servicio + aviso previo) · Reposición: estimado reclutamiento + capacitación
      </p>
    </div>
  );
}

// ─── Sección: Cumplimiento Legal y Subsidios ──────────────────────────────────
function VistaCumplimiento() {
  const leyes = [
    {
      ley:"Ley N°21.643 — Ley Karin",
      vigencia:"Vigente desde agosto 2024",
      estado:"accion" as const,
      descripcion:"Obligación de protocolo de prevención, investigación y sanción del acoso laboral y sexual. Requiere designar persona responsable y actualizar el reglamento interno.",
      accion:"Verificar que el reglamento interno esté actualizado y el protocolo esté formalmente implementado.",
      riesgo:"Multa 10–150 UTM + responsabilidad civil solidaria",
    },
    {
      ley:"Ley N°21.561 — Transparencia Salarial",
      vigencia:"Vigente desde enero 2024",
      estado:"accion" as const,
      descripcion:"Empresas con 10+ trabajadores deben informar por escrito las remuneraciones al contratar y mantener registros igualitarios por género.",
      accion:"Asegurar que contratos y liquidaciones cumplan con el registro de remuneraciones equitativas por género.",
      riesgo:"Multa 5–50 UTM + acción judicial",
    },
    {
      ley:"Jornada 40 horas — Ley N°21.561",
      vigencia:"Reducción gradual 2024–2028 · Fase actual: 44h máx.",
      estado:"proceso" as const,
      descripcion:"Reducción de jornada máxima de 45 a 40 horas semanales de forma gradual. Fase 2026: máximo 42 horas semanales.",
      accion:"Revisar contratos con jornada 45h y preparar ajuste progresivo hacia 2026.",
      riesgo:"Incumplimiento = horas extras no compensadas + multa DT",
    },
    {
      ley:"SUE — Subsidio a la Contratación · Ley N°21.808",
      vigencia:"Vigente · SENCE verifica RSH automáticamente",
      estado:"oportunidad" as const,
      descripcion:"Subsidio del 20% del sueldo base de trabajadoras mujeres elegibles (tope 2.25×IMM = $529k). Costo cero para el empleador — el subsidio lo recibe la trabajadora.",
      accion:"Revisar elegibilidad de las 13 mujeres en planilla y gestionar el beneficio en SENCE.",
      riesgo:"Sin acción = pérdida de ahorro fiscal estimado en $10.7M/año",
    },
  ];

  const estadoConf = {
    accion:     { color:"#ef4444", label:"Requiere acción", bg:"rgba(239,68,68,0.06)",  border:"rgba(239,68,68,0.15)" },
    proceso:    { color:"#f59e0b", label:"En proceso",      bg:"rgba(245,158,11,0.06)", border:"rgba(245,158,11,0.15)" },
    oportunidad:{ color:"#22c55e", label:"Oportunidad",     bg:"rgba(34,197,94,0.06)",  border:"rgba(34,197,94,0.15)" },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
        <span className={LABEL_CLS} style={MONO}>Normativa laboral vigente</span>
        <h2 className="text-white font-semibold text-xl" style={SANS}>Cumplimiento Legal y Subsidios</h2>
        <p className="text-white/40 text-sm mt-1" style={SANS}>
          Leyes laborales activas con impacto directo en esta planilla · Mayo 2025
        </p>
      </motion.div>

      <div className="space-y-4">
        {leyes.map(ley => {
          const conf = estadoConf[ley.estado];
          return (
            <div key={ley.ley} className="rounded-xl p-5" style={{ background:conf.bg, border:`1px solid ${conf.border}` }}>
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <div>
                  <p className="text-white font-semibold text-sm" style={SANS}>{ley.ley}</p>
                  <p className="text-white/40 text-xs mt-0.5" style={MONO}>{ley.vigencia}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background:`${conf.color}15`, color:conf.color, border:`1px solid ${conf.color}30`, ...MONO }}>
                  {conf.label}
                </span>
              </div>
              <p className="text-white/55 text-sm mb-3" style={SANS}>{ley.descripcion}</p>
              <div className="rounded-lg p-3 mb-2" style={{ background:"rgba(255,255,255,0.03)" }}>
                <p className="text-xs font-semibold mb-1" style={{ ...MONO, color:conf.color }}>Acción requerida</p>
                <p className="text-white/60 text-sm" style={SANS}>{ley.accion}</p>
              </div>
              <p className="text-white/30 text-xs" style={MONO}>⚠ {ley.riesgo}</p>
            </div>
          );
        })}
      </div>

      <CardSUE />
      <AlertaCobertura />
    </div>
  );
}

// ─── Sección: Presión de Mercado ──────────────────────────────────────────────
function VistaPresionMercado() {
  const sorted = [...PRESION].sort((a, b) => b.tensionIdx - a.tensionIdx);
  const totalAvisos = sorted.reduce((s, r) => s + r.avisos90d, 0);
  const altaTension = sorted.filter(r => r.nivel === "alta").length;
  const maxBrecha   = sorted.reduce((max, r) => r.salGap < max ? r.salGap : max, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
        <span className={LABEL_CLS} style={MONO}>Análisis de mercado · Región Valparaíso</span>
        <h2 className="text-white font-semibold text-xl" style={SANS}>Presión de Mercado por Cargo</h2>
        <p className="text-white/40 text-sm mt-1" style={SANS}>
          Avisos de empleo activos últimos 90 días · Sector gastronomía · Fuente: JobPortals + RemuneraLab
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border border-white/10" style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)" }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ ...MONO, color:"#ef4444" }}>Tensión alta</p>
          <p className="text-white font-bold text-2xl" style={SANS}>{altaTension}</p>
          <p className="text-white/40 text-xs mt-1" style={MONO}>cargos en alerta</p>
        </div>
        <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ ...MONO, color:"#8568f3" }}>Avisos totales</p>
          <p className="text-white font-bold text-2xl" style={SANS}>{totalAvisos}</p>
          <p className="text-white/40 text-xs mt-1" style={MONO}>en 90 días región</p>
        </div>
        <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ ...MONO, color:"#f59e0b" }}>Mayor brecha</p>
          <p className="text-white font-bold text-2xl" style={SANS}>{maxBrecha.toFixed(1)}%</p>
          <p className="text-white/40 text-xs mt-1" style={MONO}>Jefe de Cocina</p>
        </div>
      </div>

      <div className={CARD_CLS} style={{ background:"rgba(255,255,255,0.03)" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={SANS}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                {["Cargo","Avisos 90d","Tendencia","Empresa","Mercado","Brecha","Tensión"].map(h => (
                  <th key={h} className="text-left py-3 pr-4 last:text-left text-right first:text-left" style={{ ...MONO, fontSize:"0.58rem", color:"rgba(255,255,255,0.30)", textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => {
                const nivelColor = row.nivel === "alta" ? "#ef4444" : row.nivel === "media-alta" ? "#f59e0b" : row.nivel === "media" ? "#eab308" : "#22c55e";
                const trendColor = row.avisosTrend >= 15 ? "#ef4444" : row.avisosTrend >= 0 ? "#f59e0b" : "#22c55e";
                return (
                  <tr key={row.cargo} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-3 pr-4">
                      <p className="text-white font-medium text-sm">{row.cargo}</p>
                      <p className="text-white/30" style={{ ...MONO, fontSize:"0.58rem" }}>{row.n_empresa} en planilla</p>
                    </td>
                    <td className="text-right py-3 pr-4 text-white font-medium text-sm" style={MONO}>{row.avisos90d}</td>
                    <td className="text-right py-3 pr-4 font-medium text-sm" style={{ ...MONO, color:trendColor }}>
                      {row.avisosTrend > 0 ? "+" : ""}{row.avisosTrend.toFixed(1)}%
                    </td>
                    <td className="text-right py-3 pr-4 text-white/60 text-sm" style={MONO}>{fmtK(row.empresa)}</td>
                    <td className="text-right py-3 pr-4 text-white/60 text-sm" style={MONO}>{fmtK(row.med90d)}</td>
                    <td className="text-right py-3 pr-4 font-semibold text-sm" style={{ ...MONO, color:"#ef4444" }}>{row.salGap.toFixed(1)}%</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ background:"rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full" style={{ width:`${row.tensionIdx}%`, background:nivelColor }} />
                        </div>
                        <span style={{ ...MONO, fontSize:"0.65rem", color:nivelColor }}>{row.tensionIdx}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-white/40 text-xs uppercase tracking-widest" style={MONO}>Cargos con tensión ≥ 70 — análisis detallado</p>
        {sorted.filter(r => r.tensionIdx >= 70).map(row => {
          const nivelColor = row.nivel === "alta" ? "#ef4444" : "#f59e0b";
          return (
            <div key={row.cargo} className="rounded-xl p-4" style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.10)" }}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <p className="text-white font-semibold text-sm" style={SANS}>{row.cargo}</p>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:`${nivelColor}15`, color:nivelColor, border:`1px solid ${nivelColor}30`, ...MONO }}>
                    Tensión {row.tensionIdx}/100
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(239,68,68,0.12)", color:"#ef4444", ...MONO }}>
                    Brecha {row.salGap.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-white/50 text-sm" style={SANS}>{row.narrativa}</p>
            </div>
          );
        })}
      </div>

      <p className="text-white/20 text-xs text-center pb-2" style={MONO}>
        Fuente: agregación avisos portales laborales + RemuneraLab · Valparaíso · Gastronomía · 90 días al 21 may 2025
      </p>
    </div>
  );
}

// ─── Sección: Bandas Salariales ───────────────────────────────────────────────
function VistaBandasSalariales() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}>
        <span className={LABEL_CLS} style={MONO}>Análisis de remuneraciones</span>
        <h2 className="text-white font-semibold text-xl" style={SANS}>Bandas Salariales por Cargo y Área</h2>
        <p className="text-white/40 text-sm mt-1" style={SANS}>
          Sueldo base interno vs mediana ESI INE Valparaíso/Gastronomía 2024 · Pasivo acumulado por área
        </p>
      </motion.div>
      <DistribucionMercado />
      <PasivoLaboral />
      <p className="text-white/20 text-xs text-center pb-2" style={MONO}>
        Propinas excluidas de todos los cálculos · Art. 42 letra e) CT: no son imponibles ni constituyen renta
      </p>
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === DEMO_PASSWORD) { onAuth(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background:"#180b3b" }}>
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background:"rgba(133,104,243,0.15)", border:"1px solid rgba(133,104,243,0.3)" }}>
            <Lock size={22} style={{ color:"#8568f3" }} />
          </div>
        </div>
        <h1 className="text-white text-center font-semibold text-xl mb-1" style={SANS}>Dashboard B2B · Demo</h1>
        <p className="text-white/40 text-center text-sm mb-8" style={SANS}>Restobar Viña del Mar · 31 trabajadores</p>
        <form onSubmit={submit} className="space-y-4">
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)}
            placeholder="Contraseña de acceso" autoFocus
            className="w-full px-4 py-3.5 rounded-lg border text-white placeholder:text-white/25 text-sm focus:outline-none transition-all"
            style={{ background:"rgba(255,255,255,0.05)", borderColor: err ? "#ef4444" : "rgba(255,255,255,0.1)", ...SANS }}
          />
          <button type="submit" className="w-full py-3.5 rounded-lg font-semibold text-white text-sm transition-opacity hover:opacity-90"
            style={{ background:"linear-gradient(135deg, #8568f3, #a387f5)", ...SANS }}>
            Acceder
          </button>
        </form>
        {err && <p className="text-red-400 text-center text-sm mt-3" style={SANS}>Contraseña incorrecta</p>}
      </motion.div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("resumen");

  function switchSection(s: Section) {
    setActiveSection(s);
    window.scrollTo({ top:0, behavior:"smooth" });
  }

  return (
    <div className="relative min-h-screen" style={{ background:"#180b3b" }}>
      <div className="pointer-events-none fixed -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{ background:"radial-gradient(circle, rgba(133,104,243,0.12) 0%, transparent 65%)" }} />
      <div className="pointer-events-none fixed -bottom-24 -left-24 w-[400px] h-[400px] rounded-full"
        style={{ background:"radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 65%)" }} />

      <MobileNav section={activeSection} onSection={switchSection} />
      <Sidebar   section={activeSection} onSection={switchSection} />

      <main className="relative z-10 lg:ml-[240px]">
        <div className="px-4 sm:px-6 pt-[140px] lg:pt-10 pb-14 max-w-5xl mx-auto">
          {activeSection === "resumen"      && <VistaResumen      onSection={switchSection} />}
          {activeSection === "rotacion"     && <VistaRotacion />}
          {activeSection === "cumplimiento" && <VistaCumplimiento />}
          {activeSection === "mercado"      && <VistaPresionMercado />}
          {activeSection === "bandas"       && <VistaBandasSalariales />}
        </div>
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function RestobarVina() {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  return <Dashboard />;
}
