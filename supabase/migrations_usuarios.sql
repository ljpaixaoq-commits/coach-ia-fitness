-- ==============================================================================
-- MIGRAÇÃO - SISTEMA DE LOGIN / USUÁRIOS (NOMENCLATURA EM PORTUGUÊS)
-- Execute este script no Supabase > SQL Editor
-- ==============================================================================

-- 1. NOVAS COLUNAS NA TABELA PERFIS (CPF e data de nascimento para reset de senha)
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. TABELA DE CONTAS DE USUÁRIO (separada dos dados pessoais)
CREATE TABLE IF NOT EXISTS contas_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES perfis(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    access_expires_at DATE,
    access_days INTEGER,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contas_usuario_perfil ON contas_usuario(profile_id);
CREATE INDEX IF NOT EXISTS idx_contas_usuario_username ON contas_usuario(username);

-- 3. ROW LEVEL SECURITY
ALTER TABLE contas_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura publica contas_usuario" ON contas_usuario FOR SELECT USING (true);
CREATE POLICY "Permitir escrita publica contas_usuario" ON contas_usuario FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao publica contas_usuario" ON contas_usuario FOR UPDATE USING (true);