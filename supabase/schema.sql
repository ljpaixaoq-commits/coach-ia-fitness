-- ==============================================================================
-- COACH IA PESSOAL - SCHEMA COMPLETO SUPABASE (POSTGRESQL)
-- Nomenclatura das tabelas em português
-- IDs são TEXT (o app gera IDs textuais como 'wkt-ai-...', 'ex-ai-...')
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PERFIS DE USUÁRIOS (Suporte a Família / Múltiplos Perfis)
CREATE TABLE IF NOT EXISTS perfis (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    nickname TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member', -- 'admin', 'member', 'spouse'
    gender TEXT, -- 'male', 'female', 'other'
    age INTEGER,
    height NUMERIC(5,2), -- em cm (ex: 178.5)
    current_weight NUMERIC(5,2), -- em kg
    target_weight NUMERIC(5,2), -- em kg
    body_fat_percentage NUMERIC(4,1), -- ex: 18.5%
    muscle_mass_kg NUMERIC(5,2), -- ex: 64.2 kg
    activity_level TEXT, -- 'sedentary', 'moderate', 'intense', 'athlete'
    fitness_goal TEXT, -- 'lose_weight', 'hypertrophy', 'endurance', 'health'
    gym_name TEXT,
    preferred_training_time TEXT, -- ex: '06:30' ou '19:00'
    daily_water_target_ml INTEGER DEFAULT 3000,
    daily_calorie_target INTEGER DEFAULT 2200,
    daily_protein_target_g INTEGER DEFAULT 160,
    daily_carb_target_g INTEGER DEFAULT 200,
    daily_fat_target_g INTEGER DEFAULT 60,
    cpf TEXT,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONTAS DE USUÁRIO (Login/Acesso - separada dos dados pessoais)
CREATE TABLE IF NOT EXISTS contas_usuario (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    access_expires_at DATE,
    access_days INTEGER,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_contas_usuario_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 3. TREINOS (Fichas / Planos de Treino)
CREATE TABLE IF NOT EXISTS treinos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL, -- 'Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Upper', 'Lower'
    day_of_week INTEGER[], -- Array de dias: [1, 3, 5] (1 = Seg, 7 = Dom)
    estimated_duration_min INTEGER DEFAULT 60,
    difficulty TEXT DEFAULT 'intermediary',
    ai_generated BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE, -- indica se o treino já foi finalizado
    last_completed_at TIMESTAMP WITH TIME ZONE, -- quando foi realizado pela última vez
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_treinos_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 4. EXERCÍCIOS DE CADA TREINO
CREATE TABLE IF NOT EXISTS treino_exercicios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workout_id TEXT NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 4,
    reps_target TEXT NOT NULL DEFAULT '8-12',
    default_weight_kg NUMERIC(6,2) DEFAULT 0,
    rest_time_seconds INTEGER DEFAULT 90,
    video_gif_url TEXT,
    video_url TEXT, -- link do vídeo de demonstração (YouTube ou próprio)
    demo_instructions TEXT,
    order_index INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE, -- indica se o exercício foi finalizado
    sets_data JSONB, -- séries do exercício (set_number, reps_target, weight_kg, completed)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_treino_exercicios_treino FOREIGN KEY (workout_id) REFERENCES treinos(id) ON DELETE CASCADE
);

-- 5. HISTÓRICO DE TREINOS REALIZADOS
CREATE TABLE IF NOT EXISTS registro_treinos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    workout_id TEXT,
    workout_title TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    total_volume_kg NUMERIC(10,2) DEFAULT 0,
    calories_burned INTEGER,
    rpe_effort INTEGER CHECK (rpe_effort >= 1 AND rpe_effort <= 10),
    user_feedback TEXT,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_treinos_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE,
    CONSTRAINT fk_registro_treinos_treino FOREIGN KEY (workout_id) REFERENCES treinos(id) ON DELETE SET NULL
);

-- 6. SÉRIES DETALHADAS DO HISTÓRICO DE TREINO
CREATE TABLE IF NOT EXISTS registro_treino_series (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    workout_log_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    is_pr BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_series_log FOREIGN KEY (workout_log_id) REFERENCES registro_treinos(id) ON DELETE CASCADE
);

-- 7. ALIMENTAÇÃO (Refeições Diárias)
CREATE TABLE IF NOT EXISTS refeicoes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
    title TEXT NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_calories INTEGER DEFAULT 0,
    total_protein_g NUMERIC(6,1) DEFAULT 0,
    total_carbs_g NUMERIC(6,1) DEFAULT 0,
    total_fats_g NUMERIC(6,1) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_refeicoes_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 8. ITENS DE CADA REFEIÇÃO
CREATE TABLE IF NOT EXISTS refeicao_itens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    meal_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    portion_g NUMERIC(6,1) NOT NULL,
    calories INTEGER NOT NULL,
    protein_g NUMERIC(6,1) NOT NULL,
    carbs_g NUMERIC(6,1) NOT NULL,
    fats_g NUMERIC(6,1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_refeicao_itens_refeicao FOREIGN KEY (meal_id) REFERENCES refeicoes(id) ON DELETE CASCADE
);

-- 9. INGESTÃO DE ÁGUA
CREATE TABLE IF NOT EXISTS registro_agua (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    amount_ml INTEGER NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_agua_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 10. SUPLEMENTOS & MISTURA PERSONALIZADA
CREATE TABLE IF NOT EXISTS suplementos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    is_custom_blend BOOLEAN DEFAULT FALSE,
    dosage TEXT NOT NULL,
    recipe_formula TEXT,
    recommended_time TEXT,
    current_stock_doses INTEGER DEFAULT 30,
    min_stock_alert INTEGER DEFAULT 7,
    unit TEXT DEFAULT 'doses',
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_suplementos_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 11. CONSUMO DE SUPLEMENTOS (HISTÓRICO)
CREATE TABLE IF NOT EXISTS suplemento_consumos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    supplement_id TEXT NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT fk_suplemento_consumos_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE,
    CONSTRAINT fk_suplemento_consumos_suplemento FOREIGN KEY (supplement_id) REFERENCES suplementos(id) ON DELETE CASCADE
);

-- 12. SAÚDE & MÉTRICAS CLÍNICAS
CREATE TABLE IF NOT EXISTS metricas_saude (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight_kg NUMERIC(5,2),
    bmi NUMERIC(4,1),
    body_fat_pct NUMERIC(4,1),
    muscle_mass_kg NUMERIC(5,2),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate_bpm INTEGER,
    blood_glucose_mg_dl NUMERIC(5,1),
    sleep_hours NUMERIC(4,2),
    sleep_quality INTEGER,
    energy_level INTEGER,
    chest_cm NUMERIC(5,1),
    waist_cm NUMERIC(5,1),
    abdomen_cm NUMERIC(5,1),
    hips_cm NUMERIC(5,1),
    right_arm_cm NUMERIC(5,1),
    left_arm_cm NUMERIC(5,1),
    right_thigh_cm NUMERIC(5,1),
    left_thigh_cm NUMERIC(5,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_metricas_saude_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 13. LESÕES, DORES E HISTÓRICO CLÍNICO (Ex: Joelho Direito)
CREATE TABLE IF NOT EXISTS registro_lesoes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    body_part TEXT NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
    status TEXT DEFAULT 'monitoring',
    injury_date DATE,
    symptoms TEXT,
    restricted_exercises TEXT[],
    recommended_exercises TEXT[],
    treatment_notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_lesoes_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 14. FOTOS DE EVOLUÇÃO FÍSICA
CREATE TABLE IF NOT EXISTS fotos_evolucao (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    photo_type TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    weight_kg NUMERIC(5,2),
    body_fat_pct NUMERIC(4,1),
    taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_fotos_evolucao_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 15. METAS E HÁBITOS
CREATE TABLE IF NOT EXISTS metas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    current_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    target_value NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    deadline DATE,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_metas_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 16. INTERAÇÕES COM O COACH IA (Chat & Recomendações)
CREATE TABLE IF NOT EXISTS coach_mensagens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    intent_type TEXT,
    suggested_actions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_coach_mensagens_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 17. RESUMOS INTELIGENTES DO DIA
CREATE TABLE IF NOT EXISTS coach_resumos_diarios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    profile_id TEXT NOT NULL,
    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
    greeting TEXT NOT NULL,
    sleep_summary TEXT,
    weight_trend TEXT,
    workout_recommendation TEXT,
    energy_status TEXT,
    hydration_advice TEXT,
    supplement_reminder TEXT,
    goal_milestone_progress TEXT,
    full_markdown TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unico_resumo_perfil_dia UNIQUE (profile_id, summary_date),
    CONSTRAINT fk_coach_resumos_diarios_perfil FOREIGN KEY (profile_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_treinos_perfil ON treinos(profile_id);
CREATE INDEX IF NOT EXISTS idx_registro_treinos_perfil ON registro_treinos(profile_id);
CREATE INDEX IF NOT EXISTS idx_refeicoes_perfil_data ON refeicoes(profile_id, consumed_at);
CREATE INDEX IF NOT EXISTS idx_agua_perfil_data ON registro_agua(profile_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_saude_perfil_data ON metricas_saude(profile_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_lesoes_perfil ON registro_lesoes(profile_id);
CREATE INDEX IF NOT EXISTS idx_fotos_perfil ON fotos_evolucao(profile_id);
CREATE INDEX IF NOT EXISTS idx_metas_perfil ON metas(profile_id);
CREATE INDEX IF NOT EXISTS idx_coach_mensagens_perfil ON coach_mensagens(profile_id);

-- RLS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treino_exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_treinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_treino_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE refeicao_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_agua ENABLE ROW LEVEL SECURITY;
ALTER TABLE suplementos ENABLE ROW LEVEL SECURITY;
ALTER TABLE suplemento_consumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_lesoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_evolucao ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_resumos_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso total contas_usuario" ON contas_usuario FOR ALL USING (true);

CREATE POLICY "Permitir acesso publico perfis" ON perfis FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico treinos" ON treinos FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico treino_exercicios" ON treino_exercicios FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico registro_treinos" ON registro_treinos FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico registro_treino_series" ON registro_treino_series FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico refeicoes" ON refeicoes FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico refeicao_itens" ON refeicao_itens FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico registro_agua" ON registro_agua FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico suplementos" ON suplementos FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico suplemento_consumos" ON suplemento_consumos FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico metricas_saude" ON metricas_saude FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico registro_lesoes" ON registro_lesoes FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico fotos_evolucao" ON fotos_evolucao FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico metas" ON metas FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico coach_mensagens" ON coach_mensagens FOR ALL USING (true);
CREATE POLICY "Permitir acesso publico coach_resumos_diarios" ON coach_resumos_diarios FOR ALL USING (true);