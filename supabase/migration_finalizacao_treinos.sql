-- ==============================================================================
-- MIGRAÇÃO: COLUNAS DE FINALIZAÇÃO DE TREINOS E EXERCÍCIOS
-- Execute este script no Supabase > SQL Editor.
-- PRESERVA todos os dados: ADD COLUMN apenas adiciona a coluna com default FALSE.
-- ==============================================================================

-- 1. TREINOS: indica se o treino foi finalizado
ALTER TABLE IF EXISTS public.treinos
    ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- 2. EXERCÍCIOS DE CADA TREINO: indica se o exercício foi finalizado
ALTER TABLE IF EXISTS public.treino_exercicios
    ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- 3. ATUALIZAR O CACHE DE SCHEMA DO PostgREST
NOTIFY pgrst, 'reload schema';