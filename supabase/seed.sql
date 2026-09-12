-- ==============================================================================
-- DADOS DE SEED INICIAIS PARA TESTES E DEMONSTRAÇÃO (PORTUGUÊS)
-- ==============================================================================

-- 1. PERFIS
INSERT INTO perfis (id, nome, apelido, email, papel, genero, idade, altura, peso_atual, peso_objetivo, percentual_gordura, massa_muscular_kg, objetivo_fitness, nome_academia, horario_preferido_treino, meta_agua_diaria_ml, meta_calorias_diaria, meta_proteina_diaria_g, meta_carboidrato_diaria_g, meta_gordura_diaria_g)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Leonardo', 'Leo', 'leonardo@example.com', 'admin', 'male', 32, 178.0, 84.5, 75.0, 19.2, 63.8, 'lose_weight', 'Smart Fit Centro', '07:00', 3500, 2200, 170, 190, 55)
ON CONFLICT (id) DO NOTHING;

-- 2. TREINOS DO LEONARDO
INSERT INTO treinos (id, perfil_id, titulo, subtitulo, categoria, dias_da_semana, duracao_estimada_min, dificuldade, gerado_por_ia, ativo)
VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Treino A - Peito, Tríceps & Ombro', 'Foco em força no supino e hipertrofia de deltoides', 'Push', '{1, 4}', 55, 'intermediary', false, true),
('aaaaaaaa-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Treino B - Costas, Bíceps & Trapézio', 'Foco em largura de dorsais e pegada', 'Pull', '{2, 5}', 60, 'intermediary', false, true),
('aaaaaaaa-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Treino C - Pernas & Core (Adaptado Joelho)', 'Cuidado com sobrecarga patelar, ênfase em posteriores', 'Legs', '{3, 6}', 50, 'intermediary', true, true)
ON CONFLICT (id) DO NOTHING;

-- 3. EXERCÍCIOS DO TREINO A
INSERT INTO treino_exercicios (treino_id, nome, grupo_muscular, series, repeticoes_alvo, peso_padrao_kg, descanso_segundos, instrucoes_demonstracao, ordem)
VALUES
('aaaaaaaa-1111-1111-1111-111111111111', 'Supino Reto com Barra', 'Peito', 4, '8-10', 70.0, 90, 'Manter escápulas aduzidas e descer a barra com controle até o meio do peito.', 1),
('aaaaaaaa-1111-1111-1111-111111111111', 'Supino Inclinado com Halteres', 'Peito', 4, '10-12', 24.0, 75, 'Banco inclinado a 30 graus. Foco na porção clavicular.', 2),
('aaaaaaaa-1111-1111-1111-111111111111', 'Crucifixo na Polia (Crossover)', 'Peito', 3, '12-15', 15.0, 60, 'Manter cotovelos levemente flexionados, apertando o peito no pico.', 3),
('aaaaaaaa-1111-1111-1111-111111111111', 'Desenvolvimento Militar com Halteres', 'Ombro', 4, '8-10', 18.0, 90, 'Elevar os halteres sem bater no topo, mantendo abdômen travado.', 4),
('aaaaaaaa-1111-1111-1111-111111111111', 'Elevação Lateral na Polia', 'Ombro', 4, '12-15', 8.0, 60, 'Cabo na altura da coxa. Foco no deltoide lateral.', 5),
('aaaaaaaa-1111-1111-1111-111111111111', 'Tríceps Corda no Cross', 'Tríceps', 4, '12-15', 25.0, 60, 'Abrir a corda no final da extensão para máxima contração.', 6)
ON CONFLICT (id) DO NOTHING;

-- 4. SUPLEMENTOS & MISTURA PERSONALIZADA DO LEONARDO
INSERT INTO suplementos (id, perfil_id, nome, e_mistura_personalizada, dosagem, formula_receita, horario_recomendado, estoque_atual_doses, alerta_estoque_minimo, unidade, anotacoes)
VALUES
('bbbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Minha Mistura Personalizada Pré-Treino', true, '1 scoop (16g)', 'Creatina Monohidratada 5g + Beta-Alanina 3g + L-Citrulina 6g + Cafeína Anidra 200mg + Taurina 1g', '30 min antes do treino', 22, 7, 'doses', 'Fórmula manipulada para foco e pump sem pico excessivo de ansiedade.'),
('bbbbbbbb-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Vitamina D3 5000 UI', false, '1 cápsula (5000 UI)', 'Colecalciferol 5.000 UI + Vitamina K2 (MK-7) 100mcg', 'Pela manhã com refeição', 45, 10, 'cápsulas', 'Importante para saúde óssea e imunidade.'),
('bbbbbbbb-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Vitamina B12 (Metilcobalamina)', false, '1 pastilha sublingual (1000mcg)', 'Metilcobalamina 1.000mcg', 'Pela manhã em jejum', 28, 7, 'pastilhas', 'Suporte à energia celular e sistema nervoso.')
ON CONFLICT (id) DO NOTHING;

-- 5. HISTÓRICO DE LESÃO / MONITORAMENTO DO JOELHO DIREITO
INSERT INTO registro_lesoes (id, perfil_id, parte_corpo, nivel_dor, status, data_lesao, sintomas, exercicios_restritos, exercicios_recomendados, anotacoes_tratamento)
VALUES
('cccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Joelho Direito (Tendinopatia Patelar)', 2, 'monitoring', '2026-06-15', 'Leve pontada na desaceleração e agachamento profundo com carga alta.', '{"Agachamento Livre com carga máxima", "Leg Press pés muito baixos", "Salto pliométrico"}', '{"Cadeira Extensora isométrica 45s", "Agachamento Búlgaro com peso corporal", "Elevação Pélvica", "Mesa Flexora"}', 'Aplicação de gelo 15-20min pós treino + aquecimento prévio com elástico e mobilidade de tornozelo.')
ON CONFLICT (id) DO NOTHING;

-- 6. METAS
INSERT INTO metas (perfil_id, titulo, categoria, valor_atual, valor_objetivo, unidade, prazo, status)
VALUES
('11111111-1111-1111-1111-111111111111', 'Perder 9,5 kg (Chegar a 75 kg)', 'weight', 84.5, 75.0, 'kg', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Treinar 5x por semana', 'workout_frequency', 4, 5, 'dias/sem', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Beber 3,5L de água por dia', 'water', 2.8, 3.5, 'litros', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Dormir 7h30 por noite', 'sleep', 6.8, 7.5, 'horas', '2026-12-31', 'in_progress'),
('11111111-1111-1111-1111-111111111111', 'Atingir 10.000 passos diários', 'steps', 8200, 10000, 'passos', '2026-12-31', 'in_progress')
ON CONFLICT DO NOTHING;

-- 7. RESUMO INTELIGENTE DO DIA
INSERT INTO coach_resumos_diarios (perfil_id, data_resumo, saudacao, resumo_sono, tendencia_peso, recomendacao_treino, status_energia, conselho_hidratacao, lembrete_suplemento, progresso_metas, markdown_completo)
VALUES
('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 'Bom dia, Leonardo!', '✔ Dormiu 7h20 com boa recuperação.', '✔ Perdeu 600 g desde a última pesagem (84,5 kg).', '✔ Hoje é Treino A (Peito, Tríceps & Ombro).', '✔ Sua energia está em 8/10 (ótima para progressão de carga moderada).', '✔ Beba ao menos 1L de água até às 12h.', '✔ Tome sua mistura pré-treino 30 min antes de ir à Smart Fit.', '✔ Faltam apenas 2,8 kg para a sua primeira grande meta intermediária!', '### Resumo Inteligente do Dia\n\n**Bom dia, Leonardo!**\n- ✔ **Sono:** Dormiu 7h20 com sono profundo satisfatório.\n- ✔ **Evolução:** Perdeu 600 g nesta semana (84,5 kg).\n- ✔ **Treino:** Hoje é dia de Peito, Tríceps e Ombro.\n- ✔ **Joelho:** Joelho direito está estável (nível de dor 2/10). Fazer aquecimento articular.\n- ✔ **Suplemento:** Lembre-se de tomar a Mistura Personalizada 30 min antes do treino.')
ON CONFLICT (perfil_id, data_resumo) DO UPDATE SET markdown_completo = EXCLUDED.markdown_completo;