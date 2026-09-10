-- ==============================================================================
-- COACH IA PESSOAL - SCHEMA COMPLETO SUPABASE (POSTGRESQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS (Suporte a Família / Múltiplos Perfis)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 2. TABELA DE CONTAS DE USUÁRIO (Login/Acesso - separada dos dados pessoais)
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    access_expires_at DATE,
    access_days INTEGER,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE TREINOS (Fichas / Planos de Treino)
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL, -- 'Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Upper', 'Lower'
    day_of_week INTEGER[], -- Array de dias: [1, 3, 5] (1 = Seg, 7 = Dom)
    estimated_duration_min INTEGER DEFAULT 60,
    difficulty TEXT DEFAULT 'intermediary',
    ai_generated BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE EXERCÍCIOS DO TREINO
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 4,
    reps_target TEXT NOT NULL DEFAULT '8-12',
    default_weight_kg NUMERIC(6,2) DEFAULT 0,
    rest_time_seconds INTEGER DEFAULT 90,
    video_gif_url TEXT,
    demo_instructions TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE HISTÓRICO DE TREINOS REALIZADOS
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    workout_title TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    total_volume_kg NUMERIC(10,2) DEFAULT 0,
    calories_burned INTEGER,
    rpe_effort INTEGER CHECK (rpe_effort >= 1 AND rpe_effort <= 10),
    user_feedback TEXT,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE SÉRIES DETALHADAS DO HISTÓRICO DE TREINO
CREATE TABLE IF NOT EXISTS workout_log_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_log_id UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    is_pr BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE ALIMENTAÇÃO (Refeições Diárias)
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
    title TEXT NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_calories INTEGER DEFAULT 0,
    total_protein_g NUMERIC(6,1) DEFAULT 0,
    total_carbs_g NUMERIC(6,1) DEFAULT 0,
    total_fats_g NUMERIC(6,1) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE ITENS DE CADA REFEIÇÃO
CREATE TABLE IF NOT EXISTS meal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    portion_g NUMERIC(6,1) NOT NULL,
    calories INTEGER NOT NULL,
    protein_g NUMERIC(6,1) NOT NULL,
    carbs_g NUMERIC(6,1) NOT NULL,
    fats_g NUMERIC(6,1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA DE INGESTÃO DE ÁGUA
CREATE TABLE IF NOT EXISTS water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE SUPLEMENTOS & MISTURA PERSONALIZADA
CREATE TABLE IF NOT EXISTS supplements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE CONSUMO DE SUPLEMENTOS (HISTÓRICO)
CREATE TABLE IF NOT EXISTS supplement_intakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    supplement_id UUID NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 11. TABELA DE SAÚDE & MÉTRICAS CLÍNICAS
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABELA DE LESÕES, DORES E HISTÓRICO CLÍNICO (Ex: Joelho Direito)
CREATE TABLE IF NOT EXISTS injury_pain_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body_part TEXT NOT NULL,
    pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
    status TEXT DEFAULT 'monitoring',
    injury_date DATE,
    symptoms TEXT,
    restricted_exercises TEXT[],
    recommended_exercises TEXT[],
    treatment_notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TABELA DE FOTOS DE EVOLUÇÃO FÍSICA
CREATE TABLE IF NOT EXISTS evolution_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    photo_type TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    weight_kg NUMERIC(5,2),
    body_fat_pct NUMERIC(4,1),
    taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABELA DE METAS E HÁBITOS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    current_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    target_value NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL,
    deadline DATE,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. TABELA DE INTERAÇÕES COM O COACH IA (Chat & Recomendações)
CREATE TABLE IF NOT EXISTS ai_coach_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    intent_type TEXT,
    suggested_actions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. TABELA DE RESUMOS INTELIGENTES DO DIA
CREATE TABLE IF NOT EXISTS ai_daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    CONSTRAINT unique_profile_daily_summary UNIQUE (profile_id, summary_date)
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_workouts_profile ON workouts(profile_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_profile ON workout_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_meals_profile_date ON meals(profile_id, consumed_at);
CREATE INDEX IF NOT EXISTS idx_water_profile_date ON water_logs(profile_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_health_profile_date ON health_metrics(profile_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_injuries_profile ON injury_pain_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_photos_profile ON evolution_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_goals_profile ON goals(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_profile ON ai_coach_messages(profile_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_log_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_pain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read-write for user_accounts" ON user_accounts FOR ALL USING (true);

CREATE POLICY "Allow public read-write for profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow public read-write for workouts" ON workouts FOR ALL USING (true);
CREATE POLICY "Allow public read-write for workout_exercises" ON workout_exercises FOR ALL USING (true);
CREATE POLICY "Allow public read-write for workout_logs" ON workout_logs FOR ALL USING (true);
CREATE POLICY "Allow public read-write for workout_log_sets" ON workout_log_sets FOR ALL USING (true);
CREATE POLICY "Allow public read-write for meals" ON meals FOR ALL USING (true);
CREATE POLICY "Allow public read-write for meal_items" ON meal_items FOR ALL USING (true);
CREATE POLICY "Allow public read-write for water_logs" ON water_logs FOR ALL USING (true);
CREATE POLICY "Allow public read-write for supplements" ON supplements FOR ALL USING (true);
CREATE POLICY "Allow public read-write for supplement_intakes" ON supplement_intakes FOR ALL USING (true);
CREATE POLICY "Allow public read-write for health_metrics" ON health_metrics FOR ALL USING (true);
CREATE POLICY "Allow public read-write for injury_pain_logs" ON injury_pain_logs FOR ALL USING (true);
CREATE POLICY "Allow public read-write for evolution_photos" ON evolution_photos FOR ALL USING (true);
CREATE POLICY "Allow public read-write for goals" ON goals FOR ALL USING (true);
CREATE POLICY "Allow public read-write for ai_coach_messages" ON ai_coach_messages FOR ALL USING (true);
CREATE POLICY "Allow public read-write for ai_daily_summaries" ON ai_daily_summaries FOR ALL USING (true);
