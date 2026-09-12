-- ==============================================================================
-- COACH IA PESSOAL - SCHEMA COMPLETO SUPABASE (POSTGRESQL)
-- Nomenclatura das tabelas E colunas em português
-- IDs são TEXT (o app gera IDs textuais como 'wkt-ai-...', 'ex-ai-...')
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PERFIS DE USUÁRIOS (Suporte a Família / Múltiplos Perfis)
CREATE TABLE IF NOT EXISTS perfis (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome TEXT NOT NULL,
    apelido TEXT,
    email TEXT,
    telefone TEXT,
    url_avatar TEXT,
    papel TEXT DEFAULT 'member', -- 'admin', 'member'
    genero TEXT, -- 'male', 'female', 'other'
    idade INTEGER,
    altura NUMERIC(5,2), -- em cm (ex: 178.5)
    peso_atual NUMERIC(5,2), -- em kg
    peso_objetivo NUMERIC(5,2), -- em kg
    percentual_gordura NUMERIC(4,1), -- ex: 18.5%
    massa_muscular_kg NUMERIC(5,2), -- ex: 64.2 kg
    nivel_atividade TEXT, -- 'sedentary', 'moderate', 'intense', 'athlete'
    objetivo_fitness TEXT, -- 'lose_weight', 'hypertrophy', 'endurance', 'health'
    nome_academia TEXT,
    horario_preferido_treino TEXT, -- ex: '06:30' ou '19:00'
    meta_agua_diaria_ml INTEGER DEFAULT 3000,
    meta_calorias_diaria INTEGER DEFAULT 2200,
    meta_proteina_diaria_g INTEGER DEFAULT 160,
    meta_carboidrato_diaria_g INTEGER DEFAULT 200,
    meta_gordura_diaria_g INTEGER DEFAULT 60,
    cpf TEXT,
    data_nascimento DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONTAS DE USUÁRIO (Login/Acesso - separada dos dados pessoais)
CREATE TABLE IF NOT EXISTS contas_usuario (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL UNIQUE,
    nome_usuario TEXT NOT NULL UNIQUE,
    hash_senha TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member'
    ativo BOOLEAN NOT NULL DEFAULT FALSE,
    acesso_expira_em DATE,
    dias_acesso INTEGER,
    ultimo_login_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_contas_usuario_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 3. TREINOS (Fichas / Planos de Treino)
CREATE TABLE IF NOT EXISTS treinos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    categoria TEXT NOT NULL, -- 'Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Upper', 'Lower'
    dias_da_semana INTEGER[], -- Array de dias: [1, 3, 5] (1 = Seg, 7 = Dom)
    duracao_estimada_min INTEGER DEFAULT 60,
    dificuldade TEXT DEFAULT 'intermediary',
    gerado_por_ia BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    concluido BOOLEAN DEFAULT FALSE, -- indica se o treino já foi finalizado
    ultima_conclusao_em TIMESTAMP WITH TIME ZONE, -- quando foi realizado pela última vez
    anotacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_treinos_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 4. EXERCÍCIOS DE CADA TREINO
CREATE TABLE IF NOT EXISTS treino_exercicios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    treino_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    grupo_muscular TEXT NOT NULL,
    series INTEGER NOT NULL DEFAULT 4,
    repeticoes_alvo TEXT NOT NULL DEFAULT '8-12',
    peso_padrao_kg NUMERIC(6,2) DEFAULT 0,
    descanso_segundos INTEGER DEFAULT 90,
    url_video_gif TEXT,
    url_video TEXT, -- link do vídeo de demonstração (YouTube ou próprio)
    instrucoes_demonstracao TEXT,
    ordem INTEGER DEFAULT 0,
    concluido BOOLEAN DEFAULT FALSE, -- indica se o exercício foi finalizado
    dados_series JSONB, -- séries do exercício (numero_serie, repeticoes_alvo, peso_kg, concluido)
    tipo_exercicio TEXT DEFAULT 'strength',
    duracao_minutos INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_treino_exercicios_treino FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
);

-- 5. HISTÓRICO DE TREINOS REALIZADOS
CREATE TABLE IF NOT EXISTS registro_treinos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    treino_id TEXT,
    titulo_treino TEXT NOT NULL,
    iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    concluido_em TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,
    volume_total_kg NUMERIC(10,2) DEFAULT 0,
    calorias_queimadas INTEGER,
    esforco_rpe INTEGER CHECK (esforco_rpe >= 1 AND esforco_rpe <= 10),
    feedback_usuario TEXT,
    feedback_ia TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_treinos_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE,
    CONSTRAINT fk_registro_treinos_treino FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE SET NULL
);

-- 6. SÉRIES DETALHADAS DO HISTÓRICO DE TREINO
CREATE TABLE IF NOT EXISTS registro_treino_series (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    registro_treino_id TEXT NOT NULL,
    nome_exercicio TEXT NOT NULL,
    numero_serie INTEGER NOT NULL,
    repeticoes_realizadas INTEGER NOT NULL,
    peso_kg NUMERIC(6,2) NOT NULL,
    e_recorde_pessoal BOOLEAN DEFAULT FALSE,
    anotacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_series_log FOREIGN KEY (registro_treino_id) REFERENCES registro_treinos(id) ON DELETE CASCADE
);

-- 7. ALIMENTAÇÃO (Refeições Diárias)
CREATE TABLE IF NOT EXISTS refeicoes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    tipo_refeicao TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'
    titulo TEXT NOT NULL,
    consumida_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_calorias INTEGER DEFAULT 0,
    total_proteina_g NUMERIC(6,1) DEFAULT 0,
    total_carboidratos_g NUMERIC(6,1) DEFAULT 0,
    total_gorduras_g NUMERIC(6,1) DEFAULT 0,
    anotacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_refeicoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 8. ITENS DE CADA REFEIÇÃO
CREATE TABLE IF NOT EXISTS refeicao_itens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    refeicao_id TEXT NOT NULL,
    nome_alimento TEXT NOT NULL,
    porcao_g NUMERIC(6,1) NOT NULL,
    calorias INTEGER NOT NULL,
    proteina_g NUMERIC(6,1) NOT NULL,
    carboidratos_g NUMERIC(6,1) NOT NULL,
    gorduras_g NUMERIC(6,1) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_refeicao_itens_refeicao FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id) ON DELETE CASCADE
);

-- 9. INGESTÃO DE ÁGUA
CREATE TABLE IF NOT EXISTS registro_agua (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    quantidade_ml INTEGER NOT NULL,
    registrado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_agua_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 10. SUPLEMENTOS & MISTURA PERSONALIZADA
CREATE TABLE IF NOT EXISTS suplementos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    e_mistura_personalizada BOOLEAN DEFAULT FALSE,
    dosagem TEXT NOT NULL,
    formula_receita TEXT,
    horario_recomendado TEXT,
    estoque_atual_doses INTEGER DEFAULT 30,
    alerta_estoque_minimo INTEGER DEFAULT 7,
    unidade TEXT DEFAULT 'doses',
    anotacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_suplementos_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 11. CONSUMO DE SUPLEMENTOS (HISTÓRICO)
CREATE TABLE IF NOT EXISTS suplemento_consumos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    suplemento_id TEXT NOT NULL,
    tomado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    anotacoes TEXT,
    CONSTRAINT fk_suplemento_consumos_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE,
    CONSTRAINT fk_suplemento_consumos_suplemento FOREIGN KEY (suplemento_id) REFERENCES suplementos(id) ON DELETE CASCADE
);

-- 12. SAÚDE & MÉTRICAS CLÍNICAS
CREATE TABLE IF NOT EXISTS metricas_saude (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    medido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    peso_kg NUMERIC(5,2),
    imc NUMERIC(4,1),
    percentual_gordura NUMERIC(4,1),
    massa_muscular_kg NUMERIC(5,2),
    pressao_sistolica INTEGER,
    pressao_diastolica INTEGER,
    frequencia_cardiaca_bpm INTEGER,
    glicemia_mg_dl NUMERIC(5,1),
    horas_sono NUMERIC(4,2),
    qualidade_sono INTEGER,
    nivel_energia INTEGER,
    peito_cm NUMERIC(5,1),
    cintura_cm NUMERIC(5,1),
    abdome_cm NUMERIC(5,1),
    quadril_cm NUMERIC(5,1),
    braco_direito_cm NUMERIC(5,1),
    braco_esquerdo_cm NUMERIC(5,1),
    coxa_direita_cm NUMERIC(5,1),
    coxa_esquerda_cm NUMERIC(5,1),
    anotacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_metricas_saude_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 13. LESÕES, DORES E HISTÓRICO CLÍNICO (Ex: Joelho Direito)
CREATE TABLE IF NOT EXISTS registro_lesoes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    parte_corpo TEXT NOT NULL,
    nivel_dor INTEGER NOT NULL CHECK (nivel_dor >= 0 AND nivel_dor <= 10),
    status TEXT DEFAULT 'monitoring',
    data_lesao DATE,
    sintomas TEXT,
    exercicios_restritos TEXT[],
    exercicios_recomendados TEXT[],
    anotacoes_tratamento TEXT,
    registrado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_registro_lesoes_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 14. FOTOS DE EVOLUÇÃO FÍSICA
CREATE TABLE IF NOT EXISTS fotos_evolucao (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    tipo_foto TEXT NOT NULL,
    url_foto TEXT NOT NULL,
    peso_kg NUMERIC(5,2),
    percentual_gordura NUMERIC(4,1),
    tirada_em DATE NOT NULL DEFAULT CURRENT_DATE,
    anotacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_fotos_evolucao_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 15. METAS E HÁBITOS
CREATE TABLE IF NOT EXISTS metas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    valor_atual NUMERIC(10,2) NOT NULL DEFAULT 0,
    valor_objetivo NUMERIC(10,2) NOT NULL,
    unidade TEXT NOT NULL,
    prazo DATE,
    status TEXT DEFAULT 'in_progress',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_metas_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 16. INTERAÇÕES COM O COACH IA (Chat & Recomendações)
CREATE TABLE IF NOT EXISTS coach_mensagens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    remetente TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo_intencao TEXT,
    acoes_sugeridas JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_coach_mensagens_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- 17. RESUMOS INTELIGENTES DO DIA
CREATE TABLE IF NOT EXISTS coach_resumos_diarios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    perfil_id TEXT NOT NULL,
    data_resumo DATE NOT NULL DEFAULT CURRENT_DATE,
    saudacao TEXT NOT NULL,
    resumo_sono TEXT,
    tendencia_peso TEXT,
    recomendacao_treino TEXT,
    status_energia TEXT,
    conselho_hidratacao TEXT,
    lembrete_suplemento TEXT,
    progresso_metas TEXT,
    markdown_completo TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unico_resumo_perfil_dia UNIQUE (perfil_id, data_resumo),
    CONSTRAINT fk_coach_resumos_diarios_perfil FOREIGN KEY (perfil_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_treinos_perfil ON treinos(perfil_id);
CREATE INDEX IF NOT EXISTS idx_registro_treinos_perfil ON registro_treinos(perfil_id);
CREATE INDEX IF NOT EXISTS idx_refeicoes_perfil_data ON refeicoes(perfil_id, consumida_em);
CREATE INDEX IF NOT EXISTS idx_agua_perfil_data ON registro_agua(perfil_id, registrado_em);
CREATE INDEX IF NOT EXISTS idx_saude_perfil_data ON metricas_saude(perfil_id, medido_em);
CREATE INDEX IF NOT EXISTS idx_lesoes_perfil ON registro_lesoes(perfil_id);
CREATE INDEX IF NOT EXISTS idx_fotos_perfil ON fotos_evolucao(perfil_id);
CREATE INDEX IF NOT EXISTS idx_metas_perfil ON metas(perfil_id);
CREATE INDEX IF NOT EXISTS idx_coach_mensagens_perfil ON coach_mensagens(perfil_id);

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