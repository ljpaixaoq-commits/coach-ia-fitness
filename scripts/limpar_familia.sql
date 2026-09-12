-- ==============================================================================
-- LIMPEZA DEFINITIVA DA MARIANA EM PRODUÇÃO
-- Regra de ouro: apaga SÓ o pai (perfis.id = Mari), e as 13+ FKs com
-- "ON DELETE CASCADE" do schema limpam TODAS as linhas dela em cascata
-- (contas_usuario, treinos, treino_exercicios, registro_treinos,
--  registro_treino_series, refeicoes, refeicao_itens, registro_agua,
--  suplementos, suplemento_consumos, metricas_saude, registro_lesoes,
--  fotos_evolucao, metas, coach_mensagens, coach_resumos_diarios).
--
-- COMO RODAR (com sua DATABASE_URL de produção):
--   psql "postgresql://postgres.coachiafitness:[SUA_SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres" -f scripts\limpar_familia.sql
-- ==============================================================================

\set ON_ERROR_STOP on
\set QUIET off

\echo '=== ANTES: perfis em produção ==='
\echo '----------------------------------------------------------------------'
SELECT id, nome, apelido, email, papel FROM perfis ORDER BY papel, nome;

\echo ''
\echo '=== CONTAGEM (para provar que existem dados da Mariana) ==='
SELECT
  (SELECT COUNT(*) FROM contas_usuario      WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS contas_usuario,
  (SELECT COUNT(*) FROM treinos             WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS treinos,
  (SELECT COUNT(*) FROM treino_exercicios   WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS treino_exercicios,
  (SELECT COUNT(*) FROM registro_treinos    WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS registro_treinos,
  (SELECT COUNT(*) FROM refeicoes           WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS refeicoes,
  (SELECT COUNT(*) FROM refeicao_itens      WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS refeicao_itens,
  (SELECT COUNT(*) FROM registro_agua       WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS registro_agua,
  (SELECT COUNT(*) FROM suplementos         WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS suplementos,
  (SELECT COUNT(*) FROM suplemento_consumos WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS suplemento_consumos,
  (SELECT COUNT(*) FROM metricas_saude     WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS metricas_saude,
  (SELECT COUNT(*) FROM registro_lesoes     WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS registro_lesoes,
  (SELECT COUNT(*) FROM fotos_evolucao      WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS fotos_evolucao,
  (SELECT COUNT(*) FROM metas               WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS metas,
  (SELECT COUNT(*) FROM coach_mensagens     WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS coach_mensagens,
  (SELECT COUNT(*) FROM coach_resumos_diarios WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS coach_resumos_diarios;

\echo ''
\echo '=== EXECUTANDO DELETE EM CASCATA (pai perfis.id -> filhas ON DELETE CASCADE) ==='
\echo '----------------------------------------------------------------------'
BEGIN;
DELETE FROM perfis WHERE id = '22222222-2222-2222-2222-222222222222';
-- Defesa extra: também remove qualquer perfil remanescente com papel spouse.
DELETE FROM perfis WHERE papel = 'spouse';
COMMIT;

\echo ''
\echo '=== DEPOIS: perfis em produção (deve sobrar SÓ o Leonardo) ==='
SELECT id, nome, apelido, email, papel FROM perfis ORDER BY nome;

\echo ''
\echo '=== VERIFICAÇÃO FINAL: contagem da Mariana (todas devem ser 0) ==='
SELECT
  (SELECT COUNT(*) FROM contas_usuario      WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS contas_usuario,
  (SELECT COUNT(*) FROM treinos             WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS treinos,
  (SELECT COUNT(*) FROM treino_exercicios   WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS treino_exercicios,
  (SELECT COUNT(*) FROM registro_treinos    WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS registro_treinos,
  (SELECT COUNT(*) FROM refeicoes           WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS refeicoes,
  (SELECT COUNT(*) FROM refeicao_itens      WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS refeicao_itens,
  (SELECT COUNT(*) FROM registro_agua       WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS registro_agua,
  (SELECT COUNT(*) FROM suplementos         WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS suplementos,
  (SELECT COUNT(*) FROM suplemento_consumos WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS suplemento_consumos,
  (SELECT COUNT(*) FROM metricas_saude     WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS metricas_saude,
  (SELECT COUNT(*) FROM registro_lesoes     WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS registro_lesoes,
  (SELECT COUNT(*) FROM fotos_evolucao      WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS fotos_evolucao,
  (SELECT COUNT(*) FROM metas               WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS metas,
  (SELECT COUNT(*) FROM coach_mensagens     WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS coach_mensagens,
  (SELECT COUNT(*) FROM coach_resumos_diarios WHERE perfil_id = '22222222-2222-2222-2222-222222222222') AS coach_resumos_diarios;

\echo ''
\echo '=== DONE: se "DEPOIS" mostrou só Leonardo e a contagem final é toda 0 → limpo ✓ ==='
