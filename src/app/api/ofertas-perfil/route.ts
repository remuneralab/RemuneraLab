export const runtime = 'edge';

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Words too generic to use as cargo search keyword
const STOPWORDS = new Set([
  // Prepositions / articles
  "de", "del", "la", "el", "en", "y", "a", "o", "un", "una", "los", "las",
  "para", "con", "por", "al", "se", "es",
  // Seniority / modifiers
  "sr", "jr", "semi", "senior", "junior",
  // Generic role prefixes — alone don't identify the occupation
  // (e.g. "Ingeniero en Prevención de Riesgos" → keyword = "prevención", not "ingeniero")
  "ingeniero", "ingeniera", "analista", "jefe", "jefa", "gerente",
  "coordinador", "coordinadora", "asistente", "tecnico", "tecnica",
  "especialista", "encargado", "encargada", "supervisor", "supervisora",
  "operador", "operadora", "director", "directora", "ejecutivo", "ejecutiva",
  "consultor", "consultora", "profesional", "operario", "operaria",
  "auxiliar", "subgerente", "administrador", "administradora",
]);

function extractKeyword(cargo: string): string | null {
  const words = cargo
    .toLowerCase()
    .split(/[\s/,.()\-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
  return words[0] ?? null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cargo    = searchParams.get("cargo") ?? "";
  const industria = searchParams.get("industria") ?? "";
  const region   = searchParams.get("region") ?? "";

  const SELECT = "id, cargo_original, industria, region, salario_mid, url_aviso, modalidad, fecha_publicacion_texto, created_at";
  const LIMIT  = 15;

  // Try: industria + region + cargo keyword
  const keyword = extractKeyword(cargo);

  let query = supabase
    .from("registros_avisos")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (industria) query = query.eq("industria", industria);
  if (region)    query = query.eq("region", region);
  if (keyword)   query = query.ilike("cargo_original", `%${keyword}%`);

  const { data: dataFull, count: countFull } = await query;

  // Nivel 1: industria + region + keyword → resultado exacto
  if ((countFull ?? 0) >= 1 && dataFull && dataFull.length > 0) {
    return NextResponse.json({ ofertas: dataFull, total: countFull ?? dataFull.length });
  }

  // Nivel 2: keyword + region (sin filtro de industria) — mismo oficio, misma región
  if (keyword && region) {
    const q2 = supabase
      .from("registros_avisos")
      .select(SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(LIMIT)
      .eq("region", region)
      .ilike("cargo_original", `%${keyword}%`);
    const { data: d2, count: c2 } = await q2;
    if ((c2 ?? 0) >= 1 && d2 && d2.length > 0) {
      return NextResponse.json({ ofertas: d2, total: c2 ?? d2.length });
    }
  }

  // Nivel 3: keyword sin restricciones geográficas/sectoriales — oficio a nivel nacional
  if (keyword) {
    const q3 = supabase
      .from("registros_avisos")
      .select(SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(LIMIT)
      .ilike("cargo_original", `%${keyword}%`);
    const { data: d3, count: c3 } = await q3;
    if ((c3 ?? 0) >= 1 && d3 && d3.length > 0) {
      return NextResponse.json({ ofertas: d3, total: c3 ?? d3.length });
    }
  }

  // Nivel 4 (último recurso): industria + region sin keyword
  // Solo aplica si no se pudo extraer un keyword del cargo — evita mostrar empleos
  // totalmente ajenos al oficio (ej: un prevencionista viendo ofertas de desarrollador
  // solo por coincidir en industria/región).
  if (keyword) {
    return NextResponse.json({ ofertas: [], total: 0 });
  }

  let fallbackQuery = supabase
    .from("registros_avisos")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (industria) fallbackQuery = fallbackQuery.eq("industria", industria);
  if (region)    fallbackQuery = fallbackQuery.eq("region", region);

  const { data: dataFallback, count: countFallback } = await fallbackQuery;

  return NextResponse.json({
    ofertas: dataFallback ?? [],
    total: countFallback ?? 0,
  });
}
