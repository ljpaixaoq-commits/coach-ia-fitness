-- Garante que todas as colunas que o app grava em treinos/treino_exercicios
-- existam no banco (idempotente, seguro rodar mais de uma vez).
-- Correção: treinos novos gerados pelo Coach IA podem não persistir quando
-- o banco de produção foi criado antes dessas colunas existirem.

ALTER TABLE treinos ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'intermediary';
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS estimated_duration_min INTEGER DEFAULT 60;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE treinos ADD COLUMN IF NOT EXISTS day_of_week INTEGER[] DEFAULT '{}';

ALTER TABLE treino_exercicios ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'strength';
ALTER TABLE treino_exercicios ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE treino_exercicios ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;