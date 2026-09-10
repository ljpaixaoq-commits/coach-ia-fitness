-- ==============================================================================
-- DADOS DE SEED INICIAIS PARA TESTES E DEMONSTRAÇÃO
-- ==============================================================================

-- 1. PERFIS
INSERT INTO profiles (id, name, nickname, email, role, gender, age, height, current_weight, target_weight, body_fat_percentage, muscle_mass_kg, fitness_goal, gym_name, preferred_training_time, daily_water_target_ml, daily_calorie_target, daily_protein_target_g, daily_carb_target_g, daily_fat_target_g)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Leonardo', 'Leo', 'leonardo@example.com', 'admin', 'male', 32, 178.0, 84.5, 75.0, 19.2, 63.8, 'lose_weight', 'Smart Fit Centro', '07:00', 3500, 2200, 170, 190, 55),
('22222222-2222-2222-2222-222222222222', 'Mariana', 'Mari', 'mariana@example.com', 'spouse', 'female', 30, 165.0, 62.0, 58.0, 24.5, 41.2, 'hypertrophy', 'Smart Fit Centro', '18:30', 2500, 1800, 120, 180, 45)
ON CONFLICT (id) DO NOTHING;

-- 2. TREINOS DO LEONARDO
INSERT INTO workouts (id, profile_id, title, subtitle, category, day_of_week, estimated_duration_min, difficulty, ai_generated, is_active)
VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Treino A - Peito, Tríceps & Ombro', 'Foco em força no supino e hipertrofia de deltoides', 'Push', '{1, 4}', 55, 'intermediary', false, true),
('aaaaaaaa-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Treino B - Costas, Bíceps & Trapézio', 'Foco em largura de dorsais e pegada', 'Pull', '{2, 5}', 60, 'intermediary', false, true),
('aaaaaaaa-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Treino C - Pernas & Core (Adaptado Joelho)', 'Cuidado com sobrecarga patelar, ênfase em posteriores', 'Legs', '{3, 6}', 50, 'intermediary', true, true)
ON CONFLICT (id) DO NOTHING;

-- 3. EXERCÍCIOS DO TREINO A
INSERT INTO workout_exercises (workout_id, name, muscle_group, sets, reps_target, default_weight_kg, rest_time_seconds, demo_instructions, order_index)
VALUES
('aaaaaaaa-1111-1111-1111-111111111111', 'Supino Reto com Barra', 'Peito', 4, '8-10', 70.0, 90, 'Manter escápulas aduzidas e descer a barra com controle até o meio do peito.', 1),
('aaaaaaaa-1111-1111-1111-111111111111', 'Supino Inclinado com Halteres', 'Peito', 4, '10-12', 24.0, 75, 'Banco inclinado a 30 graus. Foco na porção clavicular.', 2),
('aaaaaaaa-1111-1111-1111-111111111111', 'Crucifixo na Polia (Crossover)', 'Peito', 3, '12-15', 15.0, 60, 'Manter cotovelos levemente flexionados, apertando o peito no pico.', 3),
('aaaaaaaa-1111-1111-1111-111111111111', 'Desenvolvimento Militar com Halteres', 'Ombro', 4, '8-10', 18.0, 90, 'Elevar os halteres sem bater no topo, mantendo abdômen travado.', 4),
('aaaaaaaa-1111-1111-1111-111111111111', 'Elevação Lateral na Polia', 'Ombro', 4, '12-15', 8.0, 60, 'Cabo na altura da coxa. Foco no deltoide lateral.', 5),
('aaaaaaaa-1111-1111-1111-111111111111', 'Tríceps Corda no Cross', 'Tríceps', 4, '12-15', 25.0, 60, 'Abrir a corda no final da extensão para máxima contração.', 6)
ON CONFLICT (id) DO NOTHING;

-- 4. SUPLEMENTOS & MISTURA PERSONALIZADA DO LEONARDO
INSERT INTO supplements (id, profile_id, name, is_custom_blend, dosage, recipe_formula, recommended_time, current_stock_doses, min_stock_alert, unit, notes)
VALUES
('bbbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Minha Mistura Personalizada Pré-Treino', true, '1 scoop (16g)', 'Creatina Monohidratada 5g + Beta-Alanina 3g + L-Citrulina 6g + Cafeína Anidra 200mg + Taurina 1g', '30 min antes do treino', 22, 7, 'doses', 'Fórmula manipulada para foco e pump sem pico excessivo de ansiedade.'),
('bbbbbbbb-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Vitamina D3 5000 UI', false, '1 cápsula (5000 UI)', 'Colecalciferol 5.000 UI + Vitamina K2 (MK-7) 100mcg', 'Pela manhã com refeição', 45, 10, 'cápsulas', 'Importante para saúde óssea e imunidade.'),
('bbbbbbbb-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Vitamina B12 (Metilcobalamina)', false, '1 pastilha sublingual (1000mcg)', 'Metilcobalamina 1.000mcg', 'Pela manhã em jejum', 28, 7, 'pastilhas', 'Suporte à energia celular e sistema nervoso.')
ON CONFLICT (id) DO NOTHING;

-- 5. HISTÓRICO DE LESÃO / MONITORAMENTO DO JOELHO DIREITO
INSERT INTO injury_pain_logs (id, profile_id, body_part, pain_level, status, injury_date, symptoms, restricted_exercises, recommended_exercises, treatment_notes)
VALUES
('cccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Joelho Direito (Tendinopatia Patelar)', 2, 'monitoring', '2026-06-15', 'Leve pontada na desaceleração e agachamento profundo com carga alta.', '{"Agachamento Livre com carga máxima", "Leg Press pés muito baixos", "Salto pliométrico"}', '{"Cadeira Extensora isométrica 45s", "Agachamento Búlgaro com peso corporal", "Elevação Pélvica", "Mesa Flexora"}', 'Aplicação de gelo 15-20min pós treino + aquecimento prévio com elástico e mobilidade de tornozelo.')
ON CONFLICT (id) DO NOTHING;

-- 6. METAS
INSERT INTO goals (profile_id, title, category, current_value, target_value, unit, deadline, status)
VALUES
('11111111-1111-1111-1111-111111111111', 'Perder 9,5 kg (Chegar a 75 kg)', 'weight', 84.5, 75.0, 'kg', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Treinar 5x por semana', 'workout_frequency', 4, 5, 'dias/sem', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Beber 3,5L de água por dia', 'water', 2.8, 3.5, 'litros', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Dormir 7h30 por noite', 'sleep', 6.8, 7.5, 'horas', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Atingir 10.000 passos diários', 'steps', 8200, 10000, 'passos', '2026-12-31', 'in_progress')
ON CONFLICT DO NOTHING;

-- 7. RESUMO INTELIGENTE DO DIA
INSERT INTO ai_daily_summaries (profile_id, summary_date, greeting, sleep_summary, weight_trend, workout_recommendation, energy_status, hydration_advice, supplement_reminder, goal_milestone_progress, full_markdown)
VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'Bom dia, Leonardo!', '✔ Dormiu 7h20 com boa recuperação.', '✔ Perdeu 600 g desde a última pesagem (84,5 kg).', '✔ Hoje é Treino A (Peito, Tríceps & Ombro).', '✔ Sua energia está em 8/10 (ótima para progressão de carga moderada).', '✔ Beba ao menos 1L de água até às 12h.', '✔ Tome sua mistura pré-treino 30 min antes de ir à Smart Fit.', '✔ Faltam apenas 2,8 kg para a sua primeira grande meta intermediária!', '### Resumo Inteligente do Dia\n\n**Bom dia, Leonardo!**\n- ✔ **Sono:** Dormiu 7h20 com sono profundo satisfatório.\n- ✔ **Evolução:** Perdeu 600 g nesta semana (84,5 kg).\n- ✔ **Treino:** Hoje é dia de Peito, Tríceps e Ombro.\n- ✔ **Joelho:** Joelho direito está estável (nível de dor 2/10). Fazer aquecimento articular.\n- ✔ **Suplemento:** Lembre-se de tomar a Mistura Personalizada 30 min antes do treino.')
ON CONFLICT (profile_id, summary_date) DO UPDATE SET full_markdown = EXCLUDED.full_markdown;
