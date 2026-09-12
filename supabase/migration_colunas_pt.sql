-- ==============================================================================
-- MIGRAÇÃO: NOMENCLATURA DAS COLUNAS EM PORTUGUÊS
-- Execute este script no Supabase > SQL Editor (após o deploy do novo código).
-- PRESERVA todos os dados: ALTER TABLE RENAME COLUMN mantém linhas, valores,
-- foreign keys, índices e constraints (o PostgreSQL atualiza as referências
-- internamente pelo OID).
-- 100% IDEMPOTENTE: cada coluna só é renomeada se a antiga existir e a nova
-- ainda não existir. Pode rodar mais de uma vez sem erro.
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM (VALUES
        -- 1. PERFIS
        ('perfis', 'name', 'nome'),
        ('perfis', 'nickname', 'apelido'),
        ('perfis', 'avatar_url', 'url_avatar'),
        ('perfis', 'role', 'papel'),
        ('perfis', 'gender', 'genero'),
        ('perfis', 'age', 'idade'),
        ('perfis', 'height', 'altura'),
        ('perfis', 'current_weight', 'peso_atual'),
        ('perfis', 'target_weight', 'peso_objetivo'),
        ('perfis', 'body_fat_percentage', 'percentual_gordura'),
        ('perfis', 'muscle_mass_kg', 'massa_muscular_kg'),
        ('perfis', 'activity_level', 'nivel_atividade'),
        ('perfis', 'fitness_goal', 'objetivo_fitness'),
        ('perfis', 'gym_name', 'nome_academia'),
        ('perfis', 'preferred_training_time', 'horario_preferido_treino'),
        ('perfis', 'daily_water_target_ml', 'meta_agua_diaria_ml'),
        ('perfis', 'daily_calorie_target', 'meta_calorias_diaria'),
        ('perfis', 'daily_protein_target_g', 'meta_proteina_diaria_g'),
        ('perfis', 'daily_carb_target_g', 'meta_carboidrato_diaria_g'),
        ('perfis', 'daily_fat_target_g', 'meta_gordura_diaria_g'),
        ('perfis', 'birth_date', 'data_nascimento'),
        ('perfis', 'created_at', 'criado_em'),
        ('perfis', 'updated_at', 'atualizado_em'),

        -- 2. CONTAS_USUARIO
        ('contas_usuario', 'profile_id', 'perfil_id'),
        ('contas_usuario', 'username', 'nome_usuario'),
        ('contas_usuario', 'password_hash', 'hash_senha'),
        ('contas_usuario', 'role', 'papel'),
        ('contas_usuario', 'is_active', 'ativo'),
        ('contas_usuario', 'access_expires_at', 'acesso_expira_em'),
        ('contas_usuario', 'access_days', 'dias_acesso'),
        ('contas_usuario', 'last_login_at', 'ultimo_login_em'),
        ('contas_usuario', 'created_at', 'criado_em'),
        ('contas_usuario', 'updated_at', 'atualizado_em'),

        -- 3. TREINOS
        ('treinos', 'profile_id', 'perfil_id'),
        ('treinos', 'title', 'titulo'),
        ('treinos', 'subtitle', 'subtitulo'),
        ('treinos', 'category', 'categoria'),
        ('treinos', 'day_of_week', 'dias_da_semana'),
        ('treinos', 'estimated_duration_min', 'duracao_estimada_min'),
        ('treinos', 'difficulty', 'dificuldade'),
        ('treinos', 'ai_generated', 'gerado_por_ia'),
        ('treinos', 'is_active', 'ativo'),
        ('treinos', 'is_completed', 'concluido'),
        ('treinos', 'last_completed_at', 'ultima_conclusao_em'),
        ('treinos', 'notes', 'anotacoes'),
        ('treinos', 'created_at', 'criado_em'),

        -- 4. TREINO_EXERCICIOS
        ('treino_exercicios', 'workout_id', 'treino_id'),
        ('treino_exercicios', 'name', 'nome'),
        ('treino_exercicios', 'muscle_group', 'grupo_muscular'),
        ('treino_exercicios', 'sets', 'series'),
        ('treino_exercicios', 'reps_target', 'repeticoes_alvo'),
        ('treino_exercicios', 'default_weight_kg', 'peso_padrao_kg'),
        ('treino_exercicios', 'rest_time_seconds', 'descanso_segundos'),
        ('treino_exercicios', 'video_gif_url', 'url_video_gif'),
        ('treino_exercicios', 'video_url', 'url_video'),
        ('treino_exercicios', 'demo_instructions', 'instrucoes_demonstracao'),
        ('treino_exercicios', 'order_index', 'ordem'),
        ('treino_exercicios', 'is_completed', 'concluido'),
        ('treino_exercicios', 'sets_data', 'dados_series'),
        ('treino_exercicios', 'exercise_type', 'tipo_exercicio'),
        ('treino_exercicios', 'duration_minutes', 'duracao_minutos'),
        ('treino_exercicios', 'created_at', 'criado_em'),

        -- 5. REGISTRO_TREINOS
        ('registro_treinos', 'profile_id', 'perfil_id'),
        ('registro_treinos', 'workout_id', 'treino_id'),
        ('registro_treinos', 'workout_title', 'titulo_treino'),
        ('registro_treinos', 'started_at', 'iniciado_em'),
        ('registro_treinos', 'completed_at', 'concluido_em'),
        ('registro_treinos', 'duration_seconds', 'duracao_segundos'),
        ('registro_treinos', 'total_volume_kg', 'volume_total_kg'),
        ('registro_treinos', 'calories_burned', 'calorias_queimadas'),
        ('registro_treinos', 'rpe_effort', 'esforco_rpe'),
        ('registro_treinos', 'user_feedback', 'feedback_usuario'),
        ('registro_treinos', 'ai_feedback', 'feedback_ia'),
        ('registro_treinos', 'created_at', 'criado_em'),

        -- 6. REGISTRO_TREINO_SERIES
        ('registro_treino_series', 'workout_log_id', 'registro_treino_id'),
        ('registro_treino_series', 'exercise_name', 'nome_exercicio'),
        ('registro_treino_series', 'set_number', 'numero_serie'),
        ('registro_treino_series', 'reps_completed', 'repeticoes_realizadas'),
        ('registro_treino_series', 'weight_kg', 'peso_kg'),
        ('registro_treino_series', 'is_pr', 'e_recorde_pessoal'),
        ('registro_treino_series', 'notes', 'anotacoes'),
        ('registro_treino_series', 'created_at', 'criado_em'),

        -- 7. REFEICOES
        ('refeicoes', 'profile_id', 'perfil_id'),
        ('refeicoes', 'meal_type', 'tipo_refeicao'),
        ('refeicoes', 'title', 'titulo'),
        ('refeicoes', 'consumed_at', 'consumida_em'),
        ('refeicoes', 'total_calories', 'total_calorias'),
        ('refeicoes', 'total_protein_g', 'total_proteina_g'),
        ('refeicoes', 'total_carbs_g', 'total_carboidratos_g'),
        ('refeicoes', 'total_fats_g', 'total_gorduras_g'),
        ('refeicoes', 'notes', 'anotacoes'),
        ('refeicoes', 'created_at', 'criado_em'),

        -- 8. REFEICAO_ITENS
        ('refeicao_itens', 'meal_id', 'refeicao_id'),
        ('refeicao_itens', 'food_name', 'nome_alimento'),
        ('refeicao_itens', 'portion_g', 'porcao_g'),
        ('refeicao_itens', 'calories', 'calorias'),
        ('refeicao_itens', 'protein_g', 'proteina_g'),
        ('refeicao_itens', 'carbs_g', 'carboidratos_g'),
        ('refeicao_itens', 'fats_g', 'gorduras_g'),
        ('refeicao_itens', 'created_at', 'criado_em'),

        -- 9. REGISTRO_AGUA
        ('registro_agua', 'profile_id', 'perfil_id'),
        ('registro_agua', 'amount_ml', 'quantidade_ml'),
        ('registro_agua', 'logged_at', 'registrado_em'),

        -- 10. SUPLEMENTOS
        ('suplementos', 'profile_id', 'perfil_id'),
        ('suplementos', 'name', 'nome'),
        ('suplementos', 'is_custom_blend', 'e_mistura_personalizada'),
        ('suplementos', 'dosage', 'dosagem'),
        ('suplementos', 'recipe_formula', 'formula_receita'),
        ('suplementos', 'recommended_time', 'horario_recomendado'),
        ('suplementos', 'current_stock_doses', 'estoque_atual_doses'),
        ('suplementos', 'min_stock_alert', 'alerta_estoque_minimo'),
        ('suplementos', 'unit', 'unidade'),
        ('suplementos', 'notes', 'anotacoes'),
        ('suplementos', 'is_active', 'ativo'),
        ('suplementos', 'created_at', 'criado_em'),

        -- 11. SUPLEMENTO_CONSUMOS
        ('suplemento_consumos', 'profile_id', 'perfil_id'),
        ('suplemento_consumos', 'supplement_id', 'suplemento_id'),
        ('suplemento_consumos', 'taken_at', 'tomado_em'),
        ('suplemento_consumos', 'notes', 'anotacoes'),

        -- 12. METRICAS_SAUDE
        ('metricas_saude', 'profile_id', 'perfil_id'),
        ('metricas_saude', 'measured_at', 'medido_em'),
        ('metricas_saude', 'weight_kg', 'peso_kg'),
        ('metricas_saude', 'bmi', 'imc'),
        ('metricas_saude', 'body_fat_pct', 'percentual_gordura'),
        ('metricas_saude', 'muscle_mass_kg', 'massa_muscular_kg'),
        ('metricas_saude', 'systolic_bp', 'pressao_sistolica'),
        ('metricas_saude', 'diastolic_bp', 'pressao_diastolica'),
        ('metricas_saude', 'heart_rate_bpm', 'frequencia_cardiaca_bpm'),
        ('metricas_saude', 'blood_glucose_mg_dl', 'glicemia_mg_dl'),
        ('metricas_saude', 'sleep_hours', 'horas_sono'),
        ('metricas_saude', 'sleep_quality', 'qualidade_sono'),
        ('metricas_saude', 'energy_level', 'nivel_energia'),
        ('metricas_saude', 'chest_cm', 'peito_cm'),
        ('metricas_saude', 'waist_cm', 'cintura_cm'),
        ('metricas_saude', 'abdomen_cm', 'abdome_cm'),
        ('metricas_saude', 'hips_cm', 'quadril_cm'),
        ('metricas_saude', 'right_arm_cm', 'braco_direito_cm'),
        ('metricas_saude', 'left_arm_cm', 'braco_esquerdo_cm'),
        ('metricas_saude', 'right_thigh_cm', 'coxa_direita_cm'),
        ('metricas_saude', 'left_thigh_cm', 'coxa_esquerda_cm'),
        ('metricas_saude', 'notes', 'anotacoes'),
        ('metricas_saude', 'created_at', 'criado_em'),

        -- 13. REGISTRO_LESOES
        ('registro_lesoes', 'profile_id', 'perfil_id'),
        ('registro_lesoes', 'body_part', 'parte_corpo'),
        ('registro_lesoes', 'pain_level', 'nivel_dor'),
        ('registro_lesoes', 'injury_date', 'data_lesao'),
        ('registro_lesoes', 'symptoms', 'sintomas'),
        ('registro_lesoes', 'restricted_exercises', 'exercicios_restritos'),
        ('registro_lesoes', 'recommended_exercises', 'exercicios_recomendados'),
        ('registro_lesoes', 'treatment_notes', 'anotacoes_tratamento'),
        ('registro_lesoes', 'logged_at', 'registrado_em'),

        -- 14. FOTOS_EVOLUCAO
        ('fotos_evolucao', 'profile_id', 'perfil_id'),
        ('fotos_evolucao', 'photo_type', 'tipo_foto'),
        ('fotos_evolucao', 'photo_url', 'url_foto'),
        ('fotos_evolucao', 'weight_kg', 'peso_kg'),
        ('fotos_evolucao', 'body_fat_pct', 'percentual_gordura'),
        ('fotos_evolucao', 'taken_at', 'tirada_em'),
        ('fotos_evolucao', 'notes', 'anotacoes'),
        ('fotos_evolucao', 'created_at', 'criado_em'),

        -- 15. METAS
        ('metas', 'profile_id', 'perfil_id'),
        ('metas', 'title', 'titulo'),
        ('metas', 'category', 'categoria'),
        ('metas', 'current_value', 'valor_atual'),
        ('metas', 'target_value', 'valor_objetivo'),
        ('metas', 'unit', 'unidade'),
        ('metas', 'deadline', 'prazo'),
        ('metas', 'created_at', 'criado_em'),

        -- 16. COACH_MENSAGENS
        ('coach_mensagens', 'profile_id', 'perfil_id'),
        ('coach_mensagens', 'sender', 'remetente'),
        ('coach_mensagens', 'message', 'mensagem'),
        ('coach_mensagens', 'intent_type', 'tipo_intencao'),
        ('coach_mensagens', 'suggested_actions', 'acoes_sugeridas'),
        ('coach_mensagens', 'created_at', 'criado_em'),

        -- 17. COACH_RESUMOS_DIARIOS
        ('coach_resumos_diarios', 'profile_id', 'perfil_id'),
        ('coach_resumos_diarios', 'summary_date', 'data_resumo'),
        ('coach_resumos_diarios', 'greeting', 'saudacao'),
        ('coach_resumos_diarios', 'sleep_summary', 'resumo_sono'),
        ('coach_resumos_diarios', 'weight_trend', 'tendencia_peso'),
        ('coach_resumos_diarios', 'workout_recommendation', 'recomendacao_treino'),
        ('coach_resumos_diarios', 'energy_status', 'status_energia'),
        ('coach_resumos_diarios', 'hydration_advice', 'conselho_hidratacao'),
        ('coach_resumos_diarios', 'supplement_reminder', 'lembrete_suplemento'),
        ('coach_resumos_diarios', 'goal_milestone_progress', 'progresso_metas'),
        ('coach_resumos_diarios', 'full_markdown', 'markdown_completo'),
        ('coach_resumos_diarios', 'created_at', 'criado_em')
    ) AS t(tabela, coluna_antiga, coluna_nova)
    LOOP
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = r.tabela
              AND column_name = r.coluna_antiga
        ) AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = r.tabela
              AND column_name = r.coluna_nova
        ) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', r.tabela, r.coluna_antiga, r.coluna_nova);
        END IF;
    END LOOP;
END $$;

-- ==============================================================================
-- VERIFICAÇÃO (lista todas as colunas em português por tabela)
-- ==============================================================================
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ATUALIZAR O CACHE DE SCHEMA DO PostgREST
NOTIFY pgrst, 'reload schema';