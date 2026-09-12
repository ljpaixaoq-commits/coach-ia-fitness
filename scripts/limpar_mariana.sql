-- ==============================================================================
-- LIMPEZA PRODUÇÃO — Remove qualquer resíduo da Mariana (ex-esposa/família)
-- Modo single-user: resta apenas o perfil do Leonardo.
-- Idempotente: pode rodar quantas vezes precisar.
--
-- EXECUTAR:
--   psql "SUA_DATABASE_URL_AQUI" -f limpar_mariana.sql
-- ==============================================================================

BEGIN;

-- 1. Remove a Mariana (cascata pelas FKs: contas_usuario, treinos, refeicoes,
--    suplementos, fotos, metas, etc — todas com ON DELETE CASCADE).
DELETE FROM perfis WHERE id = '22222222-2222-2222-2222-222222222222';

-- 2. Garante que NENHUM perfil fora do Leonardo sobreviva (defesa extra caso
--    o id da Mariana tenha sido diferente em algum ambiente).
DELETE FROM perfis WHERE id <> '11111111-1111-1111-1111-111111111111';

-- 3. Reseed limpo (só o Leonardo). Idempotente via ON CONFLICT DO NOTHING.
INSERT INTO perfis (id, nome, apelido, email, papel, genero, idade, altura, peso_atual, peso_objetivo, percentual_gordura, massa_muscular_kg, objetivo_fitness, nome_academia, horario_preferido_treino, meta_agua_diaria_ml, meta_calorias_diaria, meta_proteina_diaria_g, meta_carboidrato_diaria_g, meta_gordura_diaria_g)
VALUES
('11111111-1111-1111-1111-111111111111', 'Leonardo', 'Leo', 'leonardo@example.com', 'admin', 'male', 32, 178.0, 84.5, 75.0, 19.2, 63.8, 'lose_weight', 'Smart Fit Centro', '07:00', 3500, 2200, 170, 190, 55)
ON CONFLICT (id) DO NOTHING;

-- 4. Verificação: deve retornar 1 linha (só Leonardo) e 0 "papel" familiais.
SELECT id, nome, apelido, papel FROM perfis;
SELECT COUNT(*) AS perfis_restantes FROM perfis;
SELECT COUNT(*) AS papel_nao_member FROM perfis WHERE papel NOT IN ('admin', 'member');

COMMIT;
