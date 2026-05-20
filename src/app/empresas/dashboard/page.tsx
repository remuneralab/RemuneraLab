"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart2, TrendingUp, TrendingDown, DollarSign,
  Users, MapPin, FileBarChart2, Upload, LogOut, Loader2,
  Download, CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { EmpresaB2B } from "@/lib/b2b-auth";
import BenchmarkView from "./BenchmarkView";
import PresionView   from "./PresionView";
import DriftView     from "./DriftView";
import ICLView       from "./ICLView";
import BrechaView    from "./BrechaView";
import ENEView       from "./ENEView";

const E = [0.16, 1, 0.3, 1] as const;

const REGIONES_CL = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo",
  "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío",
  "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
] as const;

type CargoCSV = {
  cargo: string;
  salario_min_clp: number;
  salario_max_clp: number;
  region: string;
  horas_semana: number; // 42 = jornada completa (Ley 21.561, vigente abril 2026); <42 = part-time
};

type CSVError = { fila: number; campo: string; mensaje: string };

const TEMPLATE_ROWS: CargoCSV[] = [
  { cargo: "Técnico en Mantención Electromecánica",           salario_min_clp:  882000, salario_max_clp: 1536000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Técnico en Manejo de Residuos Industriales",      salario_min_clp:  920000, salario_max_clp: 1521000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Técnico en Sistemas de Control Industrial",       salario_min_clp:  845000, salario_max_clp: 1494000, region: "Los Lagos",     horas_semana: 42 },
  { cargo: "Técnico en Operación de Planta de Celulosa",      salario_min_clp:  885000, salario_max_clp: 1552000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Técnico en Laboratorio de Calidad",               salario_min_clp:  923000, salario_max_clp: 1531000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Ingeniero de Procesos Industriales",              salario_min_clp: 1384000, salario_max_clp: 2293000, region: "Maule",         horas_semana: 42 },
  { cargo: "Profesional de Planificación Forestal",           salario_min_clp: 1243000, salario_max_clp: 2160000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Profesional de Seguridad Industrial",             salario_min_clp: 1256000, salario_max_clp: 2159000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Ingeniero de Calidad y Laboratorio",              salario_min_clp: 1285000, salario_max_clp: 2334000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Ingeniero de Sistemas de Información",            salario_min_clp: 1327000, salario_max_clp: 2224000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Ingeniero de Mantención de Equipos",              salario_min_clp: 1315000, salario_max_clp: 2212000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Analista de Control de Gestión",                  salario_min_clp: 1341000, salario_max_clp: 2294000, region: "Los Ríos",      horas_semana: 42 },
  { cargo: "Analista de Gestión de Personas",                 salario_min_clp: 1214000, salario_max_clp: 2364000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Profesional de Medio Ambiente y Certificaciones", salario_min_clp: 1298000, salario_max_clp: 2209000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Analista de Operaciones Logísticas",              salario_min_clp: 1301000, salario_max_clp: 2310000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Especialista Senior en Calidad de Madera",        salario_min_clp: 2224000, salario_max_clp: 3485000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Operador de Línea de Producción de Tableros",     salario_min_clp:  759000, salario_max_clp: 1337000, region: "Maule",         horas_semana: 42 },
  { cargo: "Operador de Caldera Industrial",                  salario_min_clp:  795000, salario_max_clp: 1282000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Ingeniero Senior de Automatización Industrial",   salario_min_clp: 2201000, salario_max_clp: 3442000, region: "Maule",         horas_semana: 42 },
  { cargo: "Operador de Procesadora de Madera",               salario_min_clp:  777000, salario_max_clp: 1296000, region: "Maule",         horas_semana: 42 },
  { cargo: "Vigilante de Predio Forestal",                    salario_min_clp:  557000, salario_max_clp: 1155000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Secretaria Ejecutiva de Gerencia",                salario_min_clp:  653000, salario_max_clp: 1070000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Conductor de Camión Forestal",                    salario_min_clp:  541000, salario_max_clp:  793000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Operario de Aplicación de Herbicidas",            salario_min_clp:  546000, salario_max_clp:  766000, region: "Los Ríos",      horas_semana: 42 },
  { cargo: "Operador de Motosierra",                          salario_min_clp:  553000, salario_max_clp:  801000, region: "Maule",         horas_semana: 42 },
  { cargo: "Asistente de Sistemas e Informática",             salario_min_clp:  400000, salario_max_clp:  560000, region: "Metropolitana", horas_semana: 22 },
  { cargo: "Operador de Grúa Horquilla Industrial",           salario_min_clp:  593000, salario_max_clp: 1367000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Mecánico de Vehículos de Faena",                  salario_min_clp:  590000, salario_max_clp: 1258000, region: "Maule",         horas_semana: 42 },
  { cargo: "Trabajador de Plantación Forestal",               salario_min_clp:  555000, salario_max_clp: 1045000, region: "Los Lagos",     horas_semana: 42 },
  { cargo: "Auxiliar de Bodega Industrial",                   salario_min_clp:  564000, salario_max_clp:  759000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Operador de Cosechadora Forestal",                salario_min_clp:  748000, salario_max_clp: 1234000, region: "Los Lagos",     horas_semana: 42 },
  { cargo: "Auxiliar de Servicios Generales en Planta",       salario_min_clp:  296000, salario_max_clp:  450000, region: "Maule",         horas_semana: 22 },
  { cargo: "Conductor de Camión Maderero Certificado",        salario_min_clp:  590000, salario_max_clp: 1220000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Trabajador de Mantención de Caminos Forestales",  salario_min_clp:  567000, salario_max_clp:  768000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Auxiliar de Mantención en Faena",                 salario_min_clp:  540000, salario_max_clp:  777000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Ingeniero Senior de Mantenimiento Industrial",    salario_min_clp: 1980000, salario_max_clp: 3292000, region: "Maule",         horas_semana: 42 },
  { cargo: "Trabajador de Cosecha Manual",                    salario_min_clp:  549000, salario_max_clp:  777000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Ingeniero Senior de Proyectos de Capital",        salario_min_clp: 2017000, salario_max_clp: 3630000, region: "Maule",         horas_semana: 42 },
  { cargo: "Mecánico de Equipos Pesados Forestales",          salario_min_clp:  700000, salario_max_clp: 1256000, region: "Maule",         horas_semana: 42 },
  { cargo: "Electricista Industrial de Planta",               salario_min_clp:  649000, salario_max_clp: 1328000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Soldador Industrial Certificado",                 salario_min_clp:  738000, salario_max_clp: 1381000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Especialista Senior en Cadena de Suministro",     salario_min_clp: 2106000, salario_max_clp: 3391000, region: "Maule",         horas_semana: 42 },
  { cargo: "Supervisor de Seguridad en Faena",                salario_min_clp:  649000, salario_max_clp: 1505000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Asistente de Comunicaciones Corporativas",        salario_min_clp:  655000, salario_max_clp: 1103000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Ingeniero Senior de Planificación Forestal",      salario_min_clp: 1885000, salario_max_clp: 3225000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Ingeniero Senior de Medio Ambiente",              salario_min_clp: 2002000, salario_max_clp: 3220000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Supervisor de Cosecha Mecanizada",                salario_min_clp:  870000, salario_max_clp: 1455000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Supervisor de Plantaciones",                      salario_min_clp:  914000, salario_max_clp: 1500000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Analista Senior de Planificación Financiera",     salario_min_clp: 2049000, salario_max_clp: 3359000, region: "Los Ríos",      horas_semana: 42 },
  { cargo: "Ingeniero Senior de Procesos de Celulosa",        salario_min_clp: 2258000, salario_max_clp: 3445000, region: "La Araucanía",  horas_semana: 42 },
  { cargo: "Asistente de Compras y Abastecimiento",           salario_min_clp:  651000, salario_max_clp: 1040000, region: "Maule",         horas_semana: 42 },
  { cargo: "Especialista Senior en Silvicultura",             salario_min_clp: 2177000, salario_max_clp: 3253000, region: "Los Ríos",      horas_semana: 42 },
  { cargo: "Asistente Contable",                              salario_min_clp:  675000, salario_max_clp: 1016000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Asistente de Operaciones Logísticas",             salario_min_clp:  676000, salario_max_clp: 1047000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Supervisor de Faena Forestal",                    salario_min_clp:  704000, salario_max_clp: 1381000, region: "Maule",         horas_semana: 42 },
  { cargo: "Asistente de Planificación Forestal",             salario_min_clp:  691000, salario_max_clp: 1144000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Supervisor de Transporte Forestal",               salario_min_clp:  649000, salario_max_clp: 1479000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Asistente de Recursos Humanos",                   salario_min_clp:  760000, salario_max_clp: 1011000, region: "Maule",         horas_semana: 42 },
  { cargo: "Asistente de Administración y Finanzas",          salario_min_clp:  689000, salario_max_clp: 1005000, region: "Metropolitana", horas_semana: 42 },
  { cargo: "Coordinador Administrativo de Faena",             salario_min_clp:  697000, salario_max_clp: 1155000, region: "Biobío",        horas_semana: 42 },
  { cargo: "Gerente de Operaciones Forestales",               salario_min_clp: 7500000, salario_max_clp:10000000, region: "Metropolitana", horas_semana: 42 },
];

function downloadTemplate() {
  const header = "cargo,salario_min_clp,salario_max_clp,region,horas_semana";
  const rows = TEMPLATE_ROWS.map(r =>
    `${r.cargo},${r.salario_min_clp},${r.salario_max_clp},${r.region},${r.horas_semana}`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arauco_cargos_remuneralab.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): { cargos: CargoCSV[]; errors: CSVError[] } {
  const lines = text.trim().split(/\r?\n/);
  const errors: CSVError[] = [];
  const cargos: CargoCSV[] = [];

  if (lines.length < 2) {
    errors.push({ fila: 0, campo: "archivo", mensaje: "El archivo está vacío o solo contiene el encabezado." });
    return { cargos, errors };
  }

  const header = lines[0].split(",").map(h => h.trim().toLowerCase());
  const required = ["cargo", "salario_min_clp", "salario_max_clp", "region"];
  for (const col of required) {
    if (!header.includes(col)) {
      errors.push({ fila: 0, campo: col, mensaje: `Falta la columna obligatoria "${col}".` });
    }
  }
  if (errors.length) return { cargos, errors };

  const idx = (col: string) => header.indexOf(col);
  const hasHoras = header.includes("horas_semana");

  for (let i = 1; i < lines.length; i++) {
    const fila = i + 1;
    const cols = lines[i].split(",").map(c => c.trim());

    const cargo = cols[idx("cargo")] ?? "";
    const rawMin = cols[idx("salario_min_clp")] ?? "";
    const rawMax = cols[idx("salario_max_clp")] ?? "";
    const region = cols[idx("region")] ?? "";
    const rawHoras = hasHoras ? (cols[idx("horas_semana")] ?? "") : "";

    if (!cargo) {
      errors.push({ fila, campo: "cargo", mensaje: `Fila ${fila}: el campo "cargo" no puede estar vacío.` });
      continue;
    }

    const min = Number(rawMin.replace(/\D/g, ""));
    const max = Number(rawMax.replace(/\D/g, ""));

    if (!rawMin || isNaN(min) || min <= 0) {
      errors.push({ fila, campo: "salario_min_clp", mensaje: `Fila ${fila}: "salario_min_clp" debe ser un número entero positivo en CLP (ej: 1200000).` });
      continue;
    }
    if (!rawMax || isNaN(max) || max <= 0) {
      errors.push({ fila, campo: "salario_max_clp", mensaje: `Fila ${fila}: "salario_max_clp" debe ser un número entero positivo en CLP (ej: 1800000).` });
      continue;
    }
    if (min >= max) {
      errors.push({ fila, campo: "salario_min_clp", mensaje: `Fila ${fila}: "salario_min_clp" (${min.toLocaleString("es-CL")}) debe ser menor que "salario_max_clp" (${max.toLocaleString("es-CL")}).` });
      continue;
    }
    if (!region) {
      errors.push({ fila, campo: "region", mensaje: `Fila ${fila}: el campo "region" no puede estar vacío.` });
      continue;
    }
    if (!REGIONES_CL.some(r => r.toLowerCase() === region.toLowerCase())) {
      errors.push({ fila, campo: "region", mensaje: `Fila ${fila}: región "${region}" no reconocida. Use el nombre oficial (ej: "Metropolitana", "Valparaíso").` });
      continue;
    }

    const horas = rawHoras === "" ? 42 : Number(rawHoras);
    if (rawHoras !== "" && (isNaN(horas) || horas < 1 || horas > 42)) {
      errors.push({ fila, campo: "horas_semana", mensaje: `Fila ${fila}: "horas_semana" debe ser un número entre 1 y 42. Para jornada completa use 42 o deje vacío.` });
      continue;
    }

    const minLegal = Math.round(539_000 * (horas / 42));
    if (min < minLegal) {
      errors.push({ fila, campo: "salario_min_clp", mensaje: `Fila ${fila}: salario_min_clp (${min.toLocaleString("es-CL")}) está bajo el mínimo legal proporcional para ${horas}h/semana ($${minLegal.toLocaleString("es-CL")}). Verifique el dato.` });
      continue;
    }

    const regionNorm = REGIONES_CL.find(r => r.toLowerCase() === region.toLowerCase())!;
    cargos.push({ cargo, salario_min_clp: min, salario_max_clp: max, region: regionNorm, horas_semana: horas });
  }

  return { cargos, errors };
}

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}
const C = {
  abismo:   "#0A0F1E",
  nocturno: "#1C2438",
  electric: "#00C2FF",
  teal:     "#00E5C4",
  amber:    "#F5A623",
};

function diasRestantes(fechaFin: string | null): number | null {
  if (!fechaFin) return null;
  const diff = new Date(fechaFin).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function fmtFecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

const MODULOS = [
  {
    num: "01",
    title: "¿Estoy pagando bien?",
    desc:  "Compara tus sueldos con lo que paga el mercado en cada región y cargo.",
    icon:  BarChart2,
    color: C.electric,
    href:  null,
    activo: true,
    tag:   "Disponible",
  },
  {
    num: "02",
    title: "¿Hay competencia por mis cargos?",
    desc:  "Ve cuántas empresas están buscando los mismos perfiles que tú.",
    icon:  TrendingUp,
    color: C.teal,
    href:  null,
    activo: true,
    tag:   "Disponible",
  },
  {
    num: "03",
    title: "¿Están subiendo los sueldos?",
    desc:  "Cómo han cambiado los sueldos del mercado en los últimos 3 meses.",
    icon:  TrendingDown,
    color: C.teal,
    href:  null,
    activo: true,
    tag:   "Disponible",
  },
  {
    num: "04",
    title: "Costo real de contratar",
    desc:  "Cuánto ha variado el costo laboral en tu sector según el INE.",
    icon:  DollarSign,
    color: C.amber,
    href:  null,
    activo: true,
    tag:   "Disponible",
  },
  {
    num: "05",
    title: "Brecha salarial de género",
    desc:  "Diferencia salarial entre hombres y mujeres en tu industria.",
    icon:  Users,
    color: "#A78BFA",
    href:  null,
    activo: true,
    tag:   "Disponible",
  },
  {
    num: "06",
    title: "¿Hay talento disponible?",
    desc:  "Qué tan fácil es contratar en tu región según la tasa de desempleo.",
    icon:  MapPin,
    color: "#F472B6",
    href:  null,
    activo: true,
    tag:   "Disponible",
  },

] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [empresa,   setEmpresa]   = useState<EmpresaB2B | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [step,      setStep]      = useState("Iniciando…");
  const [cargos,    setCargos]    = useState<CargoCSV[]>([]);
  const [csvErrors, setCsvErrors] = useState<CSVError[]>([]);
  const [csvFile,   setCsvFile]   = useState<string>("");
  const [showPanel,     setShowPanel]     = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [showPresion,   setShowPresion]   = useState(false);
  const [showDrift,     setShowDrift]     = useState(false);
  const [showICL,       setShowICL]       = useState(false);
  const [showBrecha,    setShowBrecha]    = useState(false);
  const [showENE,       setShowENE]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setCsvErrors([{ fila: 0, campo: "archivo", mensaje: "Solo se aceptan archivos .csv" }]);
      setCargos([]);
      setCsvFile(file.name);
      setShowPanel(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCSV(text);
      setCargos(result.cargos);
      setCsvErrors(result.errors);
      setCsvFile(file.name);
      setShowPanel(true);
      // Persistir cargos válidos para que sobrevivan recargas de página
      if (result.cargos.length > 0) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user?.id) {
            try {
              localStorage.setItem(
                `rl_cargos_${session.user.id}`,
                JSON.stringify({ cargos: result.cargos, file: file.name })
              );
            } catch { /* ignore */ }
          }
        });
      }
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  useEffect(() => {
    async function init() {
      try {
        setStep("Verificando sesión…");
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

        if (sessionErr) {
          setInitError(`Error de sesión: ${sessionErr.message}`);
          setLoading(false);
          return;
        }

        const user = session?.user ?? null;
        if (!user) {
          setStep("Sin sesión activa — redirigiendo al login…");
          setTimeout(() => router.replace("/empresas/login"), 1500);
          return;
        }

        setStep(`Sesión OK (${user.email}) — buscando empresa…`);

        const { data, error } = await supabase
          .from("empresas_b2b")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          setInitError(`Error al buscar empresa: ${error.message} (code: ${error.code})`);
          setLoading(false);
          return;
        }
        if (!data) {
          setInitError("No se encontró cuenta de empresa para este usuario. ¿Completaste el registro?");
          setLoading(false);
          return;
        }
        if (data.estado !== "activo") {
          setStep(`Estado: ${data.estado} — redirigiendo a términos legales…`);
          setTimeout(() => router.replace("/empresas/legal"), 1500);
          return;
        }

        setEmpresa(data as EmpresaB2B);

        // Restaurar cargos: primero localStorage, si no hay → plantilla demo
        let restoredFromStorage = false;
        try {
          const saved = localStorage.getItem(`rl_cargos_${user.id}`);
          if (saved) {
            const parsed: { cargos: CargoCSV[]; file: string } = JSON.parse(saved);
            if (parsed.cargos?.length > 0) {
              setCargos(parsed.cargos);
              setCsvFile(parsed.file ?? "");
              restoredFromStorage = true;
            }
          }
        } catch { /* localStorage puede estar deshabilitado */ }

        if (!restoredFromStorage) {
          setCargos(TEMPLATE_ROWS);
          setCsvFile("plantilla_demo.csv");
        }

        setLoading(false);
      } catch (err) {
        setInitError(err instanceof Error ? err.message : "Error inesperado al cargar el dashboard.");
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      try { localStorage.removeItem(`rl_cargos_${session.user.id}`); } catch { /* ignore */ }
    }
    await supabase.auth.signOut();
    router.replace("/empresas");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: C.abismo }}>
        <Loader2 size={28} className="animate-spin" style={{ color: C.electric }} />
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: "#ffffff", textAlign: "center", maxWidth: "400px", padding: "0 24px" }}>
          {step}
        </p>
      </div>
    );
  }

  if (initError || !empresa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ background: C.abismo }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
          {initError ?? "No se encontró tu cuenta de empresa."}
        </p>
        <div className="flex gap-3">
          <a
            href="/empresas/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(0,194,255,0.1)", color: C.electric, border: "1px solid rgba(0,194,255,0.25)", fontFamily: "var(--font-dm-sans)" }}
          >
            Iniciar sesión
          </a>
          <a
            href="/empresas/registro"
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(0,229,196,0.08)", color: C.teal, border: "1px solid rgba(0,229,196,0.2)", fontFamily: "var(--font-dm-sans)" }}
          >
            Registrarse
          </a>
        </div>
      </div>
    );
  }

  const dias = diasRestantes(empresa?.fecha_fin_demo ?? null);

  if (showBenchmark && empresa) {
    return (
      <AnimatePresence mode="wait">
        <BenchmarkView
          key="benchmark"
          cargos={cargos}
          sector={empresa.sector}
          razonSocial={empresa.razon_social}
          onClose={() => setShowBenchmark(false)}
        />
      </AnimatePresence>
    );
  }

  if (showPresion && empresa) {
    return (
      <AnimatePresence mode="wait">
        <PresionView
          key="presion"
          cargos={cargos}
          sector={empresa.sector}
          razonSocial={empresa.razon_social}
          onClose={() => setShowPresion(false)}
        />
      </AnimatePresence>
    );
  }

  if (showDrift && empresa) {
    return (
      <AnimatePresence mode="wait">
        <DriftView
          key="drift"
          cargos={cargos}
          sector={empresa.sector}
          razonSocial={empresa.razon_social}
          onClose={() => setShowDrift(false)}
        />
      </AnimatePresence>
    );
  }

  if (showICL && empresa) {
    return (
      <AnimatePresence mode="wait">
        <ICLView
          key="icl"
          sector={empresa.sector}
          razonSocial={empresa.razon_social}
          onClose={() => setShowICL(false)}
        />
      </AnimatePresence>
    );
  }

  if (showBrecha && empresa) {
    return (
      <AnimatePresence mode="wait">
        <BrechaView
          key="brecha"
          cargos={cargos}
          sector={empresa.sector}
          razonSocial={empresa.razon_social}
          onClose={() => setShowBrecha(false)}
        />
      </AnimatePresence>
    );
  }

  if (showENE && empresa) {
    return (
      <AnimatePresence mode="wait">
        <ENEView
          key="ene"
          cargos={cargos}
          razonSocial={empresa.razon_social}
          onClose={() => setShowENE(false)}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.abismo }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 sticky top-0 flex items-center justify-between px-6 h-16 border-b border-white/6"
        style={{ background: "rgba(10,15,30,0.95)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-4">
          <a
            href="/empresas"
            className="hover:text-[#00C2FF] transition-colors text-white"
            style={{ fontFamily: "var(--font-dm-serif)", fontSize: "1.2rem", fontStyle: "italic" }}
          >
            RemuneraLab
          </a>
          <span
            className="px-2.5 py-0.5 rounded"
            style={{
              fontFamily:    "var(--font-space-mono)",
              fontSize:      "0.5rem",
              letterSpacing: "0.15em",
              color:         C.teal,
              background:    "rgba(0,229,196,0.1)",
              border:        "1px solid rgba(0,229,196,0.2)",
            }}
          >
            ENTERPRISE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/empresas/reporte"
            className="inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded text-sm hover:opacity-90 transition-opacity"
            style={{
              background: "rgba(0,194,255,0.1)",
              color:      C.electric,
              border:     "1px solid rgba(0,194,255,0.2)",
              fontFamily: "var(--font-dm-sans)",
              fontSize:   "0.78rem",
            }}
          >
            <FileBarChart2 size={13} /> Reporte ejecutivo
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 hover:text-white/60 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 py-10">

        {/* Bienvenida + demo badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <p
              style={{
                fontFamily:    "var(--font-space-mono)",
                fontSize:      "0.58rem",
                color:         "rgba(255,255,255,0.3)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom:  "6px",
              }}
            >
              Dashboard · {empresa?.sector}
            </p>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {empresa?.razon_social}
            </h1>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
              {empresa?.nombre_contacto} · {empresa?.cargo_contacto}
            </p>
          </div>

          <div
            className="rounded-xl px-5 py-4 text-right shrink-0"
            style={{
              background: dias !== null && dias <= 14
                ? "rgba(245,166,35,0.08)"
                : "rgba(0,229,196,0.06)",
              border: dias !== null && dias <= 14
                ? "1px solid rgba(245,166,35,0.2)"
                : "1px solid rgba(0,229,196,0.15)",
            }}
          >
            <p
              style={{
                fontFamily:    "var(--font-space-mono)",
                fontSize:      "0.55rem",
                color:         dias !== null && dias <= 14 ? C.amber : C.teal,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom:  "4px",
              }}
            >
              Demo activa
            </p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{
                fontFamily: "var(--font-space-mono)",
                color:      dias !== null && dias <= 14 ? C.amber : C.teal,
              }}
            >
              {dias ?? "—"} días
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
              Vence {fmtFecha(empresa?.fecha_fin_demo ?? null)}
            </p>
          </div>
        </motion.div>

        {/* CSV upload banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: E, delay: 0.05 }}
          className="rounded-xl mb-3"
          style={{ border: "1px solid rgba(0,194,255,0.15)" }}
        >
          <div
            className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "rgba(0,194,255,0.05)", borderRadius: showPanel ? "0.75rem 0.75rem 0 0" : "0.75rem" }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,194,255,0.1)", border: "1px solid rgba(0,194,255,0.2)" }}
              >
                {cargos.length > 0
                  ? <CheckCircle2 size={16} style={{ color: C.teal }} />
                  : <Upload size={16} style={{ color: C.electric }} />
                }
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem" }}>
                  {cargos.length > 0
                    ? <>{csvFile} — <span style={{ color: C.teal }}>{cargos.length} cargos listos</span></>
                    : "Sube la planilla con los cargos de tu empresa"
                  }
                </p>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                  {cargos.length > 0
                    ? "Análisis de competencia y tendencias de sueldos activados."
                    : "Personaliza los análisis con tu nómina. Descarga el ejemplo si no tienes el formato."
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Descargar plantilla */}
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1.5 font-semibold px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  background: "rgba(0,229,196,0.08)",
                  color:      C.teal,
                  border:     "1px solid rgba(0,229,196,0.2)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize:   "0.78rem",
                }}
              >
                <Download size={12} /> Plantilla
              </button>

              {/* Subir CSV */}
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 font-semibold px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{
                  background: "rgba(0,194,255,0.1)",
                  color:      C.electric,
                  border:     "1px solid rgba(0,194,255,0.25)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize:   "0.78rem",
                }}
              >
                <Upload size={12} /> {cargos.length > 0 ? "Reemplazar" : "Subir CSV"}
              </button>
            </div>
          </div>

          {/* Panel resultado */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden", borderTop: "1px solid rgba(0,194,255,0.1)" }}
              >
                <div className="p-5" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "0 0 0.75rem 0.75rem" }}>
                  <div className="flex items-center justify-between mb-4">
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        fontSize:   "0.6rem",
                        letterSpacing: "0.15em",
                        color:      csvErrors.length ? C.amber : C.teal,
                      }}
                    >
                      {csvErrors.length
                        ? `${csvErrors.length} ERROR${csvErrors.length > 1 ? "ES" : ""} ENCONTRADO${csvErrors.length > 1 ? "S" : ""}`
                        : `${cargos.length} CARGOS VÁLIDOS`
                      }
                    </p>
                    <button
                      onClick={() => setShowPanel(false)}
                      style={{ color: "rgba(255,255,255,0.3)" }}
                      className="hover:text-white/60 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {csvErrors.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {csvErrors.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 rounded-lg px-3 py-2"
                          style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)" }}
                        >
                          <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: C.amber }} />
                          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.5" }}>
                            {err.mensaje}
                          </p>
                        </div>
                      ))}
                      {cargos.length > 0 && (
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>
                          {cargos.length} filas válidas se cargaron igualmente. Las filas con error fueron omitidas.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            {["Cargo", "Salario mín.", "Salario máx.", "Región", "Jornada"].map(h => (
                              <th
                                key={h}
                                className="text-left pb-2 pr-4"
                                style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.52rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cargos.map((c, i) => (
                            <tr
                              key={i}
                              style={{ borderBottom: i < cargos.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                            >
                              <td className="py-2 pr-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>{c.cargo}</td>
                              <td className="py-2 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: C.teal }}>{fmtCLP(c.salario_min_clp)}</td>
                              <td className="py-2 pr-4 tabular-nums" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.78rem", color: C.teal }}>{fmtCLP(c.salario_max_clp)}</td>
                              <td className="py-2 pr-4" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>{c.region}</td>
                              <td className="py-2" style={{ fontFamily: "var(--font-space-mono)", fontSize: "0.72rem", color: c.horas_semana < 42 ? "#F7C948" : "rgba(255,255,255,0.3)" }}>
                                {c.horas_semana < 42 ? `${c.horas_semana}h PT` : "44h"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Spacer */}
        <div className="mb-5" />

        {/* Módulos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULOS.map((m, i) => {
            const isM01 = m.num === "01";
            const isM02 = m.num === "02";
            const isM03 = m.num === "03";
            const isM04 = m.num === "04";
            const isM05 = m.num === "05";
            const isM06 = m.num === "06";
            const clickable = isM01 || isM02 || isM03 || isM04 || isM05 || isM06;
            const handleClick = isM01
              ? () => { if (cargos.length > 0) setShowBenchmark(true); else fileRef.current?.click(); }
              : isM02
              ? () => { if (cargos.length > 0) setShowPresion(true); else fileRef.current?.click(); }
              : isM03
              ? () => { if (cargos.length > 0) setShowDrift(true); else fileRef.current?.click(); }
              : isM04
              ? () => setShowICL(true)
              : isM05
              ? () => setShowBrecha(true)
              : isM06
              ? () => setShowENE(true)
              : undefined;

            return (
            <motion.div
              key={m.num}
              onClick={handleClick}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: E, delay: 0.08 + i * 0.06 }}
              className={`rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden transition-all${clickable ? " hover:brightness-110 cursor-pointer" : ""}`}
              style={{
                background:  C.nocturno,
                border:      `1px solid rgba(255,255,255,${m.activo ? "0.08" : "0.05"})`,
                opacity:     m.activo ? 1 : 0.65,
                cursor:      clickable ? "pointer" : "default",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(to right, ${m.color}${m.activo ? "60" : "30"}, transparent)` }} />

              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${m.color}12`, border: `1px solid ${m.color}25` }}
                >
                  <m.icon size={15} style={{ color: m.color }} />
                </div>
                <span
                  style={{
                    fontFamily:    "var(--font-space-mono)",
                    fontSize:      "0.5rem",
                    letterSpacing: "0.12em",
                    padding:       "3px 8px",
                    borderRadius:  "3px",
                    background:    `${m.color}12`,
                    color:         m.color,
                    border:        `1px solid ${m.color}25`,
                  }}
                >
                  {m.tag}
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontFamily:    "var(--font-space-mono)",
                    fontSize:      "0.52rem",
                    color:         "rgba(255,255,255,0.2)",
                    letterSpacing: "0.1em",
                    display:       "block",
                    marginBottom:  "6px",
                  }}
                >
                  {m.num}
                </span>
                <h3
                  className="font-bold text-white"
                  style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem" }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize:   "0.8rem",
                    color:      "rgba(255,255,255,0.4)",
                    lineHeight: "1.6",
                    marginTop:  "6px",
                  }}
                >
                  {m.desc}
                </p>
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-white/6 flex flex-wrap items-center gap-6">
          <a
            href="/empresas/reporte"
            className="inline-flex items-center gap-2 text-sm hover:text-white/70 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(255,255,255,0.35)" }}
          >
            <FileBarChart2 size={13} /> Reporte ejecutivo imprimible
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm hover:text-white/70 transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(255,255,255,0.35)" }}
          >
            Ver benchmark para un cargo puntual
          </a>
        </div>
      </main>
    </div>
  );
}
