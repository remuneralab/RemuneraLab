-- Tabla: public.sabe_ciuo_mapping
-- Clasificador CIUO-08 SABE (SENCE) — mapeo cargo_titulo → ciuo4
-- Poblar con: python scripts/ingest_sabe_ciuo.py

CREATE TABLE IF NOT EXISTS public.sabe_ciuo_mapping (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ciuo4        int         NOT NULL,
    cargo_titulo text        NOT NULL,
    cargo_norm   text        NOT NULL,   -- versión normalizada (sin tildes, minúsculas)
    nombre_ciuo4 text,                   -- descripción oficial del grupo CIUO4
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (ciuo4, cargo_norm)
);

-- Índice para búsquedas fuzzy por cargo normalizado
CREATE INDEX IF NOT EXISTS idx_sabe_ciuo_cargo_norm
    ON public.sabe_ciuo_mapping (cargo_norm);

-- Índice para lookup por código CIUO4
CREATE INDEX IF NOT EXISTS idx_sabe_ciuo_ciuo4
    ON public.sabe_ciuo_mapping (ciuo4);

-- RLS desactivado (tabla de referencia interna, sin datos de usuarios)
ALTER TABLE public.sabe_ciuo_mapping DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.sabe_ciuo_mapping IS
    'Clasificador CIUO-08.CL SABE (SENCE). Mapa cargo_titulo → ciuo4. Fuente: clasificador_ciuo08cl_sabe.xlsx';
