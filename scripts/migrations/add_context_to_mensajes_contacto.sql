-- Agrega columnas de contexto a mensajes_contacto
-- Ejecutar en Supabase SQL Editor

ALTER TABLE mensajes_contacto
  ADD COLUMN IF NOT EXISTS cargo     text,
  ADD COLUMN IF NOT EXISTS industria text,
  ADD COLUMN IF NOT EXISTS region    text;

-- ─── Conteo de feedback "¿Te fue útil?" ──────────────────────────────────────
-- Corre este SELECT para ver cuántos respondieron Sí / No / Comentario

SELECT
  CASE
    WHEN mensaje LIKE '[RATING: SÍ]%'  THEN '👍 Sí'
    WHEN mensaje LIKE '[RATING: NO]%'  THEN '👎 No'
    WHEN mensaje LIKE '[COMENTARIO]%'  THEN '💬 Comentario'
    ELSE 'Otro'
  END                          AS tipo,
  COUNT(*)                     AS total,
  COUNT(DISTINCT url_origen)   AS urls_distintas,
  COUNT(CASE WHEN cargo IS NOT NULL THEN 1 END) AS con_cargo
FROM mensajes_contacto
WHERE mensaje LIKE '[RATING%' OR mensaje LIKE '[COMENTARIO%'
GROUP BY 1
ORDER BY 2 DESC;

-- ─── Detalle por cargo ────────────────────────────────────────────────────────
SELECT
  cargo,
  industria,
  region,
  SUM(CASE WHEN mensaje LIKE '[RATING: SÍ]%' THEN 1 ELSE 0 END) AS si,
  SUM(CASE WHEN mensaje LIKE '[RATING: NO]%' THEN 1 ELSE 0 END) AS no,
  COUNT(*) AS total
FROM mensajes_contacto
WHERE mensaje LIKE '[RATING%'
GROUP BY cargo, industria, region
ORDER BY total DESC;
