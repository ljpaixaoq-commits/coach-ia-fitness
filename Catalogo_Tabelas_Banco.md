# CATÁLOGO DE TABELAS DO BANCO DE DADOS

# Coach IA Pessoal - Visão Geral das Tabelas e Relacionamentos

Este documento descreve as 17 tabelas do banco Supabase (PostgreSQL), com a função de cada uma, as colunas que a compõem e os relacionamentos entre elas. O detalhamento coluna a coluna (função, tipo, campo do aplicativo que alimenta cada coluna) está no documento Catalogo_Colunas_Banco.

Nomenclatura de relacionamento:
- "FK -> tabela.coluna": a tabela possui uma chave estrangeira que aponta para aquela coluna.
- "Referenciada por tabela.coluna": outra tabela possui uma FK apontando para esta.

A nomenclatura das tabelas e colunas está em português (ver migration supabase/migration_colunas_pt.sql).

---

# 1. PERFIS - Dados pessoais e objetivos de cada membro da família

Função: armazena os perfis de usuários (Leonardo...) com dados pessoais, metas corporais e configurações diárias (água, calorias, macros). É a tabela central: praticamente todas as outras tabelas apontam para ela.

Colunas: id (TEXT PK), nome, apelido, email, url_avatar, papel, genero, idade, altura, peso_atual, peso_objetivo, percentual_gordura, massa_muscular_kg, nivel_atividade, objetivo_fitness, nome_academia, horario_preferido_treino, meta_agua_diaria_ml, meta_calorias_diaria, meta_proteina_diaria_g, meta_carboidrato_diaria_g, meta_gordura_diaria_g, cpf, data_nascimento, criado_em, atualizado_em.

Relacionamento: Referenciada por contas_usuario.perfil_id, treinos.perfil_id, registro_treinos.perfil_id, refeicoes.perfil_id, registro_agua.perfil_id, suplementos.perfil_id, suplemento_consumos.perfil_id, metricas_saude.perfil_id, registro_lesoes.perfil_id, fotos_evolucao.perfil_id, metas.perfil_id, coach_mensagens.perfil_id e coach_resumos_diarios.perfil_id (todas 1:N, ON DELETE CASCADE).

---

# 2. CONTAS_USUARIO - Credenciais de login e controle de acesso

Função: separa os dados de login (usuário/senha, status, expiração) dos dados pessoais. Um perfil (perfis) possui no máximo uma conta de acesso.

Colunas: id (TEXT PK), perfil_id (UNIQUE), nome_usuario (UNIQUE), hash_senha, papel, ativo, acesso_expira_em, dias_acesso, ultimo_login_em, criado_em, atualizado_em.

Relacionamento: FK -> perfis.id (1:1, ON DELETE CASCADE).

---

# 3. TREINOS - Fichas / planos de treino

Função: guarda as fichas de treino de cada perfil (Push, Pull, Legs, etc.), com categoria, duração, dificuldade e status de conclusão. As fichas podem ser manuais (seed) ou geradas pelo Coach IA.

Colunas: id (TEXT PK), perfil_id, titulo, subtitulo, categoria, dias_da_semana (INTEGER[]), duracao_estimada_min, dificuldade, gerado_por_ia, ativo, concluido, ultima_conclusao_em, anotacoes, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE). Referenciada por treino_exercicios.treino_id e registro_treinos.treino_id.

---

# 4. TREINO_EXERCICIOS - Exercícios de cada treino

Função: fornece os exercícios (nome, músculo, séries, repetições, carga, vídeo, instruções) que pertencem a uma ficha (treinos), inclusive as séries executadas em dados_series (JSONB).

Colunas: id (TEXT PK), treino_id, nome, grupo_muscular, series, repeticoes_alvo, peso_padrao_kg, descanso_segundos, url_video_gif, url_video, instrucoes_demonstracao, ordem, concluido, dados_series (JSONB), tipo_exercicio, duracao_minutos, criado_em.

Relacionamento: FK -> treinos.id (1:N, ON DELETE CASCADE).

---

# 5. REGISTRO_TREINOS - Histórico de treinos realizados

Função: registra cada sessão de treino concluída (início/fim, duração, volume total) para consulta e estatística.

Colunas: id (TEXT PK), perfil_id, treino_id, titulo_treino, iniciado_em, concluido_em, duracao_segundos, volume_total_kg, calorias_queimadas, esforco_rpe, feedback_usuario, feedback_ia, criado_em.

Relacionamento: FK -> perfis.id (1:N, CASCADE); FK -> treinos.id (1:N, ON DELETE SET NULL). Referenciada por registro_treino_series.registro_treino_id.

---

# 6. REGISTRO_TREINO_SERIES - Séries detalhadas do histórico de treino

Função: entidade pensada para detalhar série a série cada treino realizado. ATENÇÃO: hoje o aplicativo não grava nesta tabela; a execução por série fica em treino_exercicios.dados_series. A tabela foi mantida no schema para uso futuro.

Colunas: id (TEXT PK), registro_treino_id, nome_exercicio, numero_serie, repeticoes_realizadas, peso_kg, e_recorde_pessoal, anotacoes, criado_em.

Relacionamento: FK -> registro_treinos.id (1:N, ON DELETE CASCADE).

---

# 7. REFEICOES - Refeições diárias

Função: registra as refeições do dia por perfil, com tipo, título e totais de calorias e macronutrientes.

Colunas: id (TEXT PK), perfil_id, tipo_refeicao, titulo, consumida_em, total_calorias, total_proteina_g, total_carboidratos_g, total_gorduras_g, anotacoes, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE). Referenciada por refeicao_itens.refeicao_id.

---

# 8. REFEICAO_ITENS - Itens de cada refeição

Função: entidade pensada para detalhar os alimentos de cada refeição (nome, porção, calorias, macros). ATENÇÃO: hoje o aplicativo não grava nesta tabela - a tela Nutrição preenche os totais diretamente em refeicoes. Mantida para uso futuro.

Colunas: id (TEXT PK), refeicao_id, nome_alimento, porcao_g, calorias, proteina_g, carboidratos_g, gorduras_g, criado_em.

Relacionamento: FK -> refeicoes.id (1:N, ON DELETE CASCADE).

---

# 9. REGISTRO_AGUA - Ingestão de água

Função: registra cada consumo de água do dia (quanto e quando) para controle da meta diária.

Colunas: id (TEXT PK), perfil_id, quantidade_ml, registrado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE).

---

# 10. SUPLEMENTOS - Suplementos e mistura personalizada

Função: cadastra os suplementos do perfil (nome, dosagem, estoque, horário), inclusive a Mistura Personalizada Pré-Treino.

Colunas: id (TEXT PK), perfil_id, nome, e_mistura_personalizada, dosagem, formula_receita, horario_recomendado, estoque_atual_doses, alerta_estoque_minimo, unidade, anotacoes, ativo, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE). Referenciada por suplemento_consumos.suplemento_id.

---

# 11. SUPLEMENTO_CONSUMOS - Consumo de suplementos (histórico)

Função: entidade pensada para o histórico de doses ingeridas de cada suplemento. ATENÇÃO: hoje o aplicativo não grava nesta tabela - o botão "Tomar Dose" apenas reduz o estoque em suplementos. Mantida para uso futuro.

Colunas: id (TEXT PK), perfil_id, suplemento_id, tomado_em, anotacoes.

Relacionamento: FK -> perfis.id (1:N, CASCADE); FK -> suplementos.id (1:N, ON DELETE CASCADE).

---

# 12. METRICAS_SAUDE - Saúde e métricas clínicas

Função: registra medições do dia (peso, IMC, gordura, massa, medidas corporais) para acompanhamento da evolução.

Colunas: id (TEXT PK), perfil_id, medido_em, peso_kg, imc, percentual_gordura, massa_muscular_kg, pressao_sistolica, pressao_diastolica, frequencia_cardiaca_bpm, glicemia_mg_dl, horas_sono, qualidade_sono, nivel_energia, peito_cm, cintura_cm, abdome_cm, quadril_cm, braco_direito_cm, braco_esquerdo_cm, coxa_direita_cm, coxa_esquerda_cm, anotacoes, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE).

---

# 13. REGISTRO_LESOES - Lesões, dores e histórico clínico

Função: registra lesões/dores (ex: tendinopatia patelar no joelho direito) com nível de dor, restrições e exercícios recomendados - usado pelo Coach IA para adaptar treinos.

Colunas: id (TEXT PK), perfil_id, parte_corpo, nivel_dor (check 0-10), status, data_lesao, sintomas, exercicios_restritos (TEXT[]), exercicios_recomendados (TEXT[]), anotacoes_tratamento, registrado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE).

---

# 14. FOTOS_EVOLUCAO - Fotos de evolução física

Função: armazena as fotos de evolução (frente/lado/costas) com data e peso do dia.

Colunas: id (TEXT PK), perfil_id, tipo_foto, url_foto, peso_kg, percentual_gordura, tirada_em, anotacoes, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE).

---

# 15. METAS - Metas e hábitos

Função: acompanha metas (peso, frequência de treino, água, sono, passos, nutrição) com valor atual, valor alvo e unidade.

Colunas: id (TEXT PK), perfil_id, titulo, categoria, valor_atual, valor_objetivo, unidade, prazo, status, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE).

---

# 16. COACH_MENSAGENS - Interações com o Coach IA (chat)

Função: guarda o histórico de mensagens do chat com o Coach IA (usuário e IA) e suas ações sugeridas.

Colunas: id (TEXT PK), perfil_id, remetente, mensagem, tipo_intencao, acoes_sugeridas (JSONB), criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE).

---

# 17. COACH_RESUMOS_DIARIOS - Resumos inteligentes do dia

Função: guarda o resumo diário gerado pela IA (saudação, sono, peso, treino recomendado, energia, hidratação, suplemento e progresso de metas). Um resumo por perfil por dia. ATENÇÃO: hoje a IA gera o resumo em memória (lib/ai-coach.ts) e o aplicativo não persiste nesta tabela - mantida para uso futuro.

Colunas: id (TEXT PK), perfil_id, data_resumo, saudacao, resumo_sono, tendencia_peso, recomendacao_treino, status_energia, conselho_hidratacao, lembrete_suplemento, progresso_metas, markdown_completo, criado_em.

Relacionamento: FK -> perfis.id (1:N, ON DELETE CASCADE). Restrição UNIQUE (perfil_id, data_resumo).

---

# Resumo geral dos relacionamentos (chaves estrangeiras)

- contas_usuario.perfil_id -> perfis.id (1:1, CASCADE)
- treinos.perfil_id -> perfis.id (1:N, CASCADE)
- treino_exercicios.treino_id -> treinos.id (1:N, CASCADE)
- registro_treinos.perfil_id -> perfis.id (1:N, CASCADE)
- registro_treinos.treino_id -> treinos.id (1:N, SET NULL)
- registro_treino_series.registro_treino_id -> registro_treinos.id (1:N, CASCADE)
- refeicoes.perfil_id -> perfis.id (1:N, CASCADE)
- refeicao_itens.refeicao_id -> refeicoes.id (1:N, CASCADE)
- registro_agua.perfil_id -> perfis.id (1:N, CASCADE)
- suplementos.perfil_id -> perfis.id (1:N, CASCADE)
- suplemento_consumos.perfil_id -> perfis.id (1:N, CASCADE)
- suplemento_consumos.suplemento_id -> suplementos.id (1:N, CASCADE)
- metricas_saude.perfil_id -> perfis.id (1:N, CASCADE)
- registro_lesoes.perfil_id -> perfis.id (1:N, CASCADE)
- fotos_evolucao.perfil_id -> perfis.id (1:N, CASCADE)
- metas.perfil_id -> perfis.id (1:N, CASCADE)
- coach_mensagens.perfil_id -> perfis.id (1:N, CASCADE)
- coach_resumos_diarios.perfil_id -> perfis.id (1:N, CASCADE)

# Índices das tabelas

- idx_treinos_perfil: treinos(perfil_id)
- idx_registro_treinos_perfil: registro_treinos(perfil_id)
- idx_refeicoes_perfil_data: refeicoes(perfil_id, consumida_em)
- idx_agua_perfil_data: registro_agua(perfil_id, registrado_em)
- idx_saude_perfil_data: metricas_saude(perfil_id, medido_em)
- idx_lesoes_perfil: registro_lesoes(perfil_id)
- idx_fotos_perfil: fotos_evolucao(perfil_id)
- idx_metas_perfil: metas(perfil_id)
- idx_coach_mensagens_perfil: coach_mensagens(perfil_id)

# Observações gerais

- Todas as tabelas têm RLS (Row Level Security) habilitada, com políticas públicas de leitura/escrita configuradas para o funcionamento do aplicativo.
- Todas as chaves primárias e estrangeiras são TEXT (o app gera IDs textuais).
- Views analíticas opcionais: v_daily_dashboard_summary e v_workout_performance (definidas em scripts/setup-supabase.js), criadas porém não utilizadas pelo aplicativo.