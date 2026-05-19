// Presión de mercado y drift salarial — basado en registros_avisos (últimos 180 días)
import { supabase } from "./supabase";

const PRESION_MIN = 3;
const DRIFT_MIN   = 3;

function mediana(vals: number[]): number {
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface MercadoResult {
  presion: {
    n_region:   number;
    n_nacional: number;
    nivel:      "ciuo4" | "ciuo2" | "industria";
    fuentes:    string[];
  } | null;
  drift: {
    mediana_reciente: number;
    mediana_anterior: number;
    pct_cambio:       number;
    n_reciente:       number;
    nivel:            "ciuo4" | "ciuo2" | "industria";
  } | null;
}

export async function calcularMercado(
  ciuo_codigo: string | null,
  industria:   string,
  region:      string,
): Promise<MercadoResult> {
  const now      = Date.now();
  const cut90    = new Date(now - 90  * 86_400_000);
  const since180 = new Date(now - 180 * 86_400_000).toISOString();
  const since3d  = new Date(now -   3 * 86_400_000).toISOString();
  const ciuo2    = ciuo_codigo?.slice(0, 2) ?? null;

  let presion: MercadoResult["presion"] = null;
  let drift:   MercadoResult["drift"]   = null;

  const levels: Array<"ciuo4" | "ciuo2" | "industria"> = [
    ...(ciuo_codigo ? ["ciuo4" as const] : []),
    ...(ciuo2       ? ["ciuo2" as const] : []),
    "industria",
  ];

  for (const nivel of levels) {
    if (presion && drift) break;

    let q = supabase
      .from("registros_avisos")
      .select("region, salario_mid, created_at, fuente")
      .gte("created_at", since180)
      .gte("last_seen_at", since3d);

    if (nivel === "ciuo4" && ciuo_codigo) {
      q = q.eq("ciuo4", ciuo_codigo);
    } else if (nivel === "ciuo2" && ciuo2) {
      q = q.like("ciuo4", `${ciuo2}%`);
    } else {
      q = q.eq("industria", industria);
    }

    const { data } = await q;
    if (!data || data.length === 0) continue;

    const recientes  = data.filter(r => new Date(r.created_at) >= cut90);
    const anteriores = data.filter(r => new Date(r.created_at) <  cut90);

    if (!presion && recientes.length >= PRESION_MIN) {
      presion = {
        n_region:   recientes.filter(r => r.region === region).length,
        n_nacional: recientes.length,
        nivel,
        fuentes: [...new Set(
          recientes.map(r => (r as { fuente?: string }).fuente).filter((f): f is string => Boolean(f))
        )],
      };
    }

    if (!drift) {
      const sR = recientes .filter(r => r.salario_mid && r.salario_mid > 0).map(r => r.salario_mid as number);
      const sA = anteriores.filter(r => r.salario_mid && r.salario_mid > 0).map(r => r.salario_mid as number);
      if (sR.length >= DRIFT_MIN && sA.length >= DRIFT_MIN) {
        const mr = mediana(sR);
        const ma = mediana(sA);
        drift = {
          mediana_reciente: mr,
          mediana_anterior: ma,
          pct_cambio:       ((mr - ma) / ma) * 100,
          n_reciente:       sR.length,
          nivel,
        };
      }
    }
  }

  return { presion, drift };
}
