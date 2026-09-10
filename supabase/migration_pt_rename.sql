-- ==============================================================================
-- MIGRAÇÃO: NOMENCLATURA DAS TABELAS EM PORTUGUÊS
-- Execute este script no Supabase > SQL Editor (após o deploy do novo código).
-- PRESERVA todos os dados: ALTER TABLE RENAME mantém linhas, FKs e índices.
-- Os relacionamentos (foreign keys) são atualizados automaticamente pelo
-- PostgreSQL (internamente apontam por OID, o nome é só exibição).
-- ==============================================================================

-- 1. RENOMEAR TABELAS
ALTER TABLE IF EXISTS profiles           RENAME TO perfis;
ALTER TABLE IF EXISTS user_accounts      RENAME TO contas_usuario;
ALTER TABLE IF EXISTS workouts           RENAME TO treinos;
ALTER TABLE IF EXISTS workout_exercises  RENAME TO treino_exercicios;
ALTER TABLE IF EXISTS workout_logs       RENAME TO registro_treinos;
ALTER TABLE IF EXISTS workout_log_sets   RENAME TO registro_treino_series;
ALTER TABLE IF EXISTS meals              RENAME TO refeicoes;
ALTER TABLE IF EXISTS meal_items         RENAME TO refeicao_itens;
ALTER TABLE IF EXISTS water_logs         RENAME TO registro_agua;
ALTER TABLE IF EXISTS supplements        RENAME TO suplementos;
ALTER TABLE IF EXISTS supplement_intakes RENAME TO suplemento_consumos;
ALTER TABLE IF EXISTS health_metrics     RENAME TO metricas_saude;
ALTER TABLE IF EXISTS injury_pain_logs   RENAME TO registro_lesoes;
ALTER TABLE IF EXISTS evolution_photos   RENAME TO fotos_evolucao;
ALTER TABLE IF EXISTS goals              RENAME TO metas;
ALTER TABLE IF EXISTS ai_coach_messages  RENAME TO coach_mensagens;
ALTER TABLE IF EXISTS ai_daily_summaries RENAME TO coach_resumos_diarios;

-- 2. COLUNA video_url em treino_exercicios
--    (o app grava o link do vídeo demo em "video_url"; antes só havia
--     "video_gif_url", o que impedia persistir o vídeo personalizado)
ALTER TABLE IF EXISTS treino_exercicios ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. VERIFICAÇÃO (deve listar as 17 tabelas em português)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;