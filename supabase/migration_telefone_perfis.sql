-- ==========================================================================
-- MIGRATION: TELÉFONE NO PERFIL DO USUÁRIO
-- Adiciona a coluna `telefone` à tabela `perfis` (uma por usuário).
-- Idempotente: pode rodar quantas vezes quiser sem erro.
-- ==========================================================================
ALTER TABLE IF EXISTS perfis
    ADD COLUMN IF NOT EXISTS telefone TEXT;
