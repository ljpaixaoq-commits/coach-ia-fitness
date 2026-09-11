-- ==============================================================================
-- MIGRAÇÃO: HISTÓRICO DE TREINOS REALIZADOS
-- Execute este script no Supabase > SQL Editor.
-- PRESERVA todos os dados: ADD COLUMN apenas adiciona a coluna (nullable).
-- ==============================================================================

-- 1. TREINOS: guarda quando o treino foi realizado pela última vez
ALTER TABLE IF EXISTS public.treinos
    ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMP WITH TIME ZONE;

-- 2. ATUALIZAR O CACHE DE SCHEMA DO PostgREST
NOTIFY pgrst, 'reload schema';