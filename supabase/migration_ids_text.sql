-- ==============================================================================
-- COACH IA PESSOAL - MIGRAÇÃO: IDs DE UUID PARA TEXT
-- Motivo: o app gera IDs textuais (ex: 'wkt-ai-...', 'ex-ai-...', 'msg-ai-...').
-- Com colunas UUID, toda escrita do app falhava silenciosamente.
-- Esta migração converte todas as colunas id (PK) e as FK (profile_id, workout_id,
-- workout_log_id, meal_id, supplement_id) para TEXT, preservando dados e re-criando
-- as chaves estrangeiras com nomes canônicos.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. REMOVER TODAS AS CHAVES ESTRANGEIRAS (necessário antes de ALTER TYPE)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname, conrelid::regclass::text AS tbl
        FROM pg_constraint
        WHERE contype = 'f' AND connamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
    END LOOP;
END $$;

-- 2. CONVERTER COLUNAS ID E FK PARA TEXT (com default automático apenas nos PKs)
DO $$
DECLARE
    c RECORD;
BEGIN
    FOR c IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name IN ('id','profile_id','workout_id','workout_log_id','meal_id','supplement_id')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT', c.table_name, c.column_name);
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE TEXT USING %I::text', c.table_name, c.column_name, c.column_name);
        IF c.column_name = 'id' THEN
            EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT gen_random_uuid()::text', c.table_name, c.column_name);
        END IF;
    END LOOP;
END $$;

-- 3. RECRIAR AS CHAVES ESTRANGEIRAS (nomes canônicos)
ALTER TABLE public.contas_usuario
    ADD CONSTRAINT fk_contas_usuario_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.treinos
    ADD CONSTRAINT fk_treinos_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.treino_exercicios
    ADD CONSTRAINT fk_treino_exercicios_treino FOREIGN KEY (workout_id) REFERENCES public.treinos(id) ON DELETE CASCADE;

ALTER TABLE public.registro_treinos
    ADD CONSTRAINT fk_registro_treinos_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;
ALTER TABLE public.registro_treinos
    ADD CONSTRAINT fk_registro_treinos_treino FOREIGN KEY (workout_id) REFERENCES public.treinos(id) ON DELETE SET NULL;

ALTER TABLE public.registro_treino_series
    ADD CONSTRAINT fk_registro_series_log FOREIGN KEY (workout_log_id) REFERENCES public.registro_treinos(id) ON DELETE CASCADE;

ALTER TABLE public.refeicoes
    ADD CONSTRAINT fk_refeicoes_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.refeicao_itens
    ADD CONSTRAINT fk_refeicao_itens_refeicao FOREIGN KEY (meal_id) REFERENCES public.refeicoes(id) ON DELETE CASCADE;

ALTER TABLE public.registro_agua
    ADD CONSTRAINT fk_registro_agua_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.suplementos
    ADD CONSTRAINT fk_suplementos_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.suplemento_consumos
    ADD CONSTRAINT fk_suplemento_consumos_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;
ALTER TABLE public.suplemento_consumos
    ADD CONSTRAINT fk_suplemento_consumos_suplemento FOREIGN KEY (supplement_id) REFERENCES public.suplementos(id) ON DELETE CASCADE;

ALTER TABLE public.metricas_saude
    ADD CONSTRAINT fk_metricas_saude_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.registro_lesoes
    ADD CONSTRAINT fk_registro_lesoes_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.fotos_evolucao
    ADD CONSTRAINT fk_fotos_evolucao_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.metas
    ADD CONSTRAINT fk_metas_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.coach_mensagens
    ADD CONSTRAINT fk_coach_mensagens_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

ALTER TABLE public.coach_resumos_diarios
    ADD CONSTRAINT fk_coach_resumos_diarios_perfil FOREIGN KEY (profile_id) REFERENCES public.perfis(id) ON DELETE CASCADE;

-- 4. ATUALIZAR O CACHE DE SCHEMA DO PostgREST
NOTIFY pgrst, 'reload schema';