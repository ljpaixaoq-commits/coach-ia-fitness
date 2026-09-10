-- ==============================================================================
-- MIGRAÇÃO - SISTEMA DE LOGIN / USUÁRIOS
-- Execute este script no Supabase > SQL Editor
-- ==============================================================================

-- 1. NOVAS COLUNAS NA TABELA PROFILES (CPF e data de nascimento para reset de senha)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2. TABELA DE CONTAS DE USUÁRIO (separada dos dados pessoais)
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_user_accounts_profile ON user_accounts(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON user_accounts(username);

-- 3. ROW LEVEL SECURITY
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for user_accounts" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public write for user_accounts" ON user_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for user_accounts" ON user_accounts FOR UPDATE USING (true);