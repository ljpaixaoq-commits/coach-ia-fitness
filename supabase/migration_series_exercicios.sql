-- Persiste as séries (conjuntos) de cada exercício.
-- Correção: ao sair do sistema e acessar novamente, os treinos apareciam sem as séries,
-- pois o banco não guardava o sets_data (número de séries, reps e peso por série).

ALTER TABLE treino_exercicios ADD COLUMN IF NOT EXISTS sets_data JSONB;

-- Backfill: registra o sets_data das séries de exercícios já existentes
-- a partir do número de séries (sets) e do alvo de repetições.
UPDATE treino_exercicios
SET sets_data = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'set_number', s,
      'reps_target', treino_exercicios.reps_target,
      'weight_kg', treino_exercicios.default_weight_kg,
      'completed', false
    ) ORDER BY s
  )
  FROM generate_series(1, GREATEST(1, treino_exercicios.sets)) AS s
)
WHERE sets_data IS NULL;