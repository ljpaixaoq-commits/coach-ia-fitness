# CATÁLOGO DE COLUNAS DO BANCO DE DADOS

# Coach IA Pessoal - Colunas, Funções, Alimentação e Relacionamentos

Este documento detalha cada coluna das 17 tabelas do banco Supabase (PostgreSQL): tipo, função de cada uma, qual campo do aplicativo alimenta a coluna e, quando existir, o relacionamento com outra tabela/coluna. A visão geral das tabelas está no documento Catalogo_Tabelas_Banco.

Legenda de alimentação:
- "Gerado automaticamente": preenchido pelo próprio aplicativo (ID, data/hora, cálculo) ou pelo banco (default).
- "Não alimentado": a coluna existe no schema, mas nenhuma tela/função do aplicativo grava valor nela hoje (reservada para uso futuro).

Legenda de relacionamento:
- "FK -> tabela.coluna": coluna é chave estrangeira que aponta para aquela coluna da outra tabela.
- "Referenciada por tabela.coluna": coluna é destino de uma chave estrangeira vinda daquela tabela.
- "Sem relacionamento": coluna não participa de nenhuma chave estrangeira.

A nomenclatura das tabelas e colunas está em português (ver migration supabase/migration_colunas_pt.sql). As propriedades internas do aplicativo continuam em inglês (ex: profile_id, name) - este documento mostra a correspondência entre as colunas do banco e os campos do aplicativo.

---

# 1. PERFIS - Dados pessoais e objetivos de cada membro da família

Função da tabela: armazena os perfis de usuários (Leonardo...) com dados pessoais, metas corporais e configurações diárias (água, calorias, macros). É a tabela central: praticamente todas as outras tabelas apontam para ela.

- id (TEXT, PK) - Identificador único do perfil. Gerado automaticamente (UUID textual). Relacionamento: Referenciada por contas_usuario.perfil_id, treinos.perfil_id, registro_treinos.perfil_id, refeicoes.perfil_id, registro_agua.perfil_id, suplementos.perfil_id, suplemento_consumos.perfil_id, metricas_saude.perfil_id, registro_lesoes.perfil_id, fotos_evolucao.perfil_id, metas.perfil_id, coach_mensagens.perfil_id e coach_resumos_diarios.perfil_id.
- nome (TEXT) - Nome completo do perfil. Alimentação: campo "Nome completo" na tela de Cadastro (AuthView), "Nome Completo*" no modal Família (ProfileFamilyView), "Novo Usuário"/"Editar" no painel Admin (AdminUsersView). Relacionamento: Sem relacionamento.
- apelido (TEXT) - Apelido/primeiro nome usado pelo Coach IA nas saudações. Alimentação: modal Família (quando não informado, vira o primeiro nome), dados de exemplo (seed). Relacionamento: Sem relacionamento.

- telefone (TEXT) - N�mero de telefone do titular (ex: '(11) 99999-9999'). Alimenta��o: aba Perfil, campo "Telefone".
- url_avatar (TEXT) - URL da foto do perfil. Alimentação: Não alimentado por nenhuma tela (não há upload de avatar no aplicativo). Relacionamento: Sem relacionamento.
- papel (TEXT) - Papel do usuário: 'admin', 'member' ou 'spouse'. Alimentação: "Parentesco" no modal Família, cadastro de usuário no Admin, primeiro usuário vira 'admin' (ensureAdminAccount). Relacionamento: Sem relacionamento.
- genero (TEXT) - Gênero ('male', 'female', 'other'). Alimentação: "Gênero" no modal Família; default 'other' no cadastro. Relacionamento: Sem relacionamento.
- idade (INTEGER) - Idade em anos. Alimentação: calculada automaticamente a partir da data de nascimento (calcAge) no cadastro/edição; campo manual "Idade" no modal Família. Relacionamento: Sem relacionamento.
- altura (NUMERIC(5,2)) - Altura em centímetros (ex: 178.5). Alimentação: campo "Altura (cm)" no modal Família; default 0 no cadastro. Relacionamento: Sem relacionamento.
- peso_atual (NUMERIC(5,2)) - Peso atual em kg. Alimentação: campo "Peso (kg)" no modal Família; atualizado automaticamente quando o usuário registra uma métrica de saúde com peso (addHealthMetric em useAppStore). Relacionamento: Sem relacionamento.
- peso_objetivo (NUMERIC(5,2)) - Peso alvo em kg. Alimentação: campo "Peso Alvo / Meta (kg)" no modal Família. Relacionamento: Sem relacionamento.
- percentual_gordura (NUMERIC(4,1)) - Percentual de gordura corporal. Alimentação: apenas dados de exemplo (seed); no dia a dia o aplicativo grava a gordura em metricas_saude.percentual_gordura. Relacionamento: Sem relacionamento.
- massa_muscular_kg (NUMERIC(5,2)) - Massa muscular em kg. Alimentação: apenas dados de exemplo (seed); no dia a dia é registrada em metricas_saude.massa_muscular_kg. Relacionamento: Sem relacionamento.
- nivel_atividade (TEXT) - Nível de atividade: 'sedentary', 'moderate', 'intense', 'athlete'. Alimentação: valor fixo 'moderate' no modal Família e no cadastro. Relacionamento: Sem relacionamento.
- objetivo_fitness (TEXT) - Objetivo principal: 'lose_weight', 'hypertrophy', 'endurance', 'health'. Alimentação: "Objetivo" no modal Família; default 'health' no cadastro. Relacionamento: Sem relacionamento.
- nome_academia (TEXT) - Academia frequentada. Alimentação: valor fixo 'Smart Fit Centro' no modal Família; dados de exemplo (seed). Relacionamento: Sem relacionamento.
- horario_preferido_treino (TEXT) - Horário preferido para treinar (ex: '06:30'). Alimentação: valor fixo '18:30' no modal Família; dados de exemplo (seed). Relacionamento: Sem relacionamento.
- meta_agua_diaria_ml (INTEGER) - Meta diária de água em ml. Alimentação: valor fixo no modal Família; default 3000 no cadastro. Relacionamento: Sem relacionamento.
- meta_calorias_diaria (INTEGER) - Meta diária de calorias (kcal). Alimentação: valor fixo no modal Família; default 2200 no cadastro. Relacionamento: Sem relacionamento.
- meta_proteina_diaria_g (INTEGER) - Meta diária de proteínas em gramas. Alimentação: valor fixo no modal Família; default 160 no cadastro. Relacionamento: Sem relacionamento.
- meta_carboidrato_diaria_g (INTEGER) - Meta diária de carboidratos em gramas. Alimentação: valor fixo no modal Família; default 200 no cadastro. Relacionamento: Sem relacionamento.
- meta_gordura_diaria_g (INTEGER) - Meta diária de gorduras em gramas. Alimentação: valor fixo no modal Família; default 60 no cadastro. Relacionamento: Sem relacionamento.
- cpf (TEXT) - CPF do usuário (usado como login e na recuperação de senha). Alimentação: campo "CPF" na tela de Cadastro, Login e Admin. Relacionamento: Sem relacionamento.
- data_nascimento (DATE) - Data de nascimento (usada na validação do reset de senha). Alimentação: campo de data nos modais do Admin; nos dados de exemplo (seed). Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação do registro. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.
- atualizado_em (TIMESTAMPTZ) - Data/hora da última atualização. Alimentação: preenchido pelo aplicativo nas edições de perfil (updateUserProfileAdmin). Relacionamento: Sem relacionamento.

---

# 2. CONTAS_USUARIO - Credenciais de login e controle de acesso

Função da tabela: separa os dados de login (usuário/senha, status, expiração) dos dados pessoais. Um perfil (perfis) possui no máximo uma conta de acesso.

- id (TEXT, PK) - Identificador único da conta. Gerado automaticamente (UUID textual). Relacionamento: Sem relacionamento.
- perfil_id (TEXT, UNIQUE) - Perfil dono da conta. Alimentação: gerado automaticamente ao criar a conta (registerUser, registerUserAdmin, ensureAdminAccount). Relacionamento: FK -> perfis.id (1:1, ON DELETE CASCADE).
- nome_usuario (TEXT, UNIQUE) - Nome de usuário; no aplicativo é sempre o CPF sem pontuação. Alimentação: cadastro/login (AuthView) e Admin. Relacionamento: Sem relacionamento.
- hash_senha (TEXT) - Senha criptografada (SHA-256 + salt via hashPassword). Alimentação: gerada automaticamente no cadastro, reset de senha, criação por admin e troca de senha. Nunca é gravada em texto puro. Relacionamento: Sem relacionamento.
- papel (TEXT) - Papel da conta: 'admin' ou 'member'. Alimentação: 'admin' para a primeira conta criada (ensureAdminAccount); 'member' no cadastro e na criação pelo Admin. Relacionamento: Sem relacionamento.
- ativo (BOOLEAN) - Status ativo/inativo (inativo = aguardando aprovação ou bloqueado). Alimentação: auto-cadastro grava false; criação pelo Admin grava true; botão "Ativar/Desativar" no painel Admin (setUserActive) alterna o valor. Relacionamento: Sem relacionamento.
- acesso_expira_em (DATE) - Data limite de acesso. Alimentação: modal "Expiração de Acesso" no painel Admin (setUserExpiration). Relacionamento: Sem relacionamento.
- dias_acesso (INTEGER) - Quantidade de dias de acesso concedidos (base para calcular a expiração). Alimentação: campo "Dias de acesso" no modal "Expiração de Acesso" do Admin. Relacionamento: Sem relacionamento.
- ultimo_login_em (TIMESTAMPTZ) - Data/hora do último login com sucesso. Alimentação: preenchido automaticamente no login (loginUser). Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.
- atualizado_em (TIMESTAMPTZ) - Data/hora da última atualização. Alimentação: preenchido pelo aplicativo em reset de senha, ativar/desativar, expiração e troca de senha. Relacionamento: Sem relacionamento.

---

# 3. TREINOS - Fichas / planos de treino

Função da tabela: guarda as fichas de treino de cada perfil (Push, Pull, Legs, etc.), com categoria, duração, dificuldade e status de conclusão. As fichas podem ser manuais (seed) ou geradas pelo Coach IA.

- id (TEXT, PK) - Identificador único do treino. Gerado automaticamente (manual 'w-1' no seed; 'wkt-ai-...' quando gerado pela IA). Relacionamento: Referenciada por treino_exercicios.treino_id e registro_treinos.treino_id.
- perfil_id (TEXT) - Perfil dono do treino. Alimentação: gerado automaticamente a partir do perfil ativo (activeProfile.id). Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- titulo (TEXT) - Título do treino (ex: "Treino A - Peito, Tríceps & Ombro"). Alimentação: dados de exemplo (seed) ou gerado pelo Coach IA a partir do assistente de 5 passos na tela AICoach (objetivos, limitações, dias/sessão/nível). Não há campo manual de título na WorkoutsView. Relacionamento: Sem relacionamento.
- subtitulo (TEXT) - Subtítulo/resumo (ex: "3x por semana · ~60 min"). Alimentação: seed ou gerado pelo Coach IA. Relacionamento: Sem relacionamento.
- categoria (TEXT) - Categoria do treino: 'Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Upper', 'Lower'. Alimentação: seed ou derivada pelo Coach IA do grupo muscular principal (CATEGORY_MAP). Relacionamento: Sem relacionamento.
- dias_da_semana (INTEGER[]) - Dias da semana de treino (1=Seg a 7=Dom). Alimentação: apenas dados de exemplo (seed); o gerador IA grava array vazio []. Nenhuma tela edita diretamente. Relacionamento: Sem relacionamento.
- duracao_estimada_min (INTEGER) - Duração estimada em minutos. Alimentação: seed ou calculada pelo Coach IA a partir dos exercícios (soma de séries e descanso). Relacionamento: Sem relacionamento.
- dificuldade (TEXT) - Nível de dificuldade: 'iniciante', 'intermediary', 'avancado'. Alimentação: seed ou campo "Nível de experiência" do assistente de criação do Coach IA. Relacionamento: Sem relacionamento.
- gerado_por_ia (BOOLEAN) - Indica se a ficha foi criada pelo Coach IA (rótulo "Adaptado por IA"). Alimentação: sempre true para fichas geradas pela IA; false/ausente para fichas manuais. Relacionamento: Sem relacionamento.
- ativo (BOOLEAN) - Se a ficha está ativa. Alimentação: sempre true no seed e na geração IA; não há chave de ativação em tela. Relacionamento: Sem relacionamento.
- concluido (BOOLEAN) - Se o treino já foi finalizado. Alimentação: botão "Finalizar Treino" na WorkoutsView, auto-conclusão ao terminar o último exercício e reset ao confirmar o resultado. Relacionamento: Sem relacionamento.
- ultima_conclusao_em (TIMESTAMPTZ) - Quando o treino foi realizado pela última vez. Alimentação: timestamp automático ao finalizar o treino (finalizeWorkout). Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Descrição da ficha (objetivo, restrições, exercícios) em markdown. Alimentação: gerada pelo Coach IA; não há campo manual. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 4. TREINO_EXERCICIOS - Exercícios de cada treino

Função da tabela: fornece os exercícios (nome, músculo, séries, repetições, carga, vídeo, instruções) que pertencem a uma ficha (treinos), inclusive as séries executadas em dados_series (JSONB).

- id (TEXT, PK) - Identificador único do exercício. Gerado automaticamente (seed 'e-...'; IA 'ex-ai-...'). Relacionamento: Sem relacionamento.
- treino_id (TEXT) - Treino (ficha) a que o exercício pertence. Alimentação: gerado automaticamente ao associar os exercícios à ficha (seed e geração IA). Relacionamento: FK -> treinos.id (ON DELETE CASCADE).
- nome (TEXT) - Nome do exercício (ex: "Supino Reto com Barra"). Alimentação: seed ou banco de exercícios do Coach IA (EXERCISE_DB). Relacionamento: Sem relacionamento.
- grupo_muscular (TEXT) - Grupo muscular trabalhado (Peito, Ombro, Tríceps...). Alimentação: seed ou template do Coach IA. Relacionamento: Sem relacionamento.
- series (INTEGER) - Número de séries. Alimentação: seed ou gerado pelo Coach IA com multiplicador por nível de experiência (0.75/1/1.25). Relacionamento: Sem relacionamento.
- repeticoes_alvo (TEXT) - Alvo de repetições (ex: '8-12', '45s', '20 min'). Alimentação: seed ou template da IA; no modo cardio é atualizado junto com a duração ("X min"). Relacionamento: Sem relacionamento.
- peso_padrao_kg (NUMERIC(6,2)) - Carga padrão em kg. Alimentação: campo "Carga Padrão Atual" na WorkoutsView, com botão "Aplicar em todas" que propaga para todas as séries de dados_series. Relacionamento: Sem relacionamento.
- descanso_segundos (INTEGER) - Tempo de descanso em segundos. Alimentação: seed ou template da IA; usado pelo cronômetro de descanso (RestTimerWidget) após cada série. Relacionamento: Sem relacionamento.
- url_video_gif (TEXT) - URL de GIF demonstrativo. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- url_video (TEXT) - Link do vídeo demonstrativo (YouTube ou próprio). Alimentação: seed/template da IA e campo editável "Vídeo demonstrativo (cole um link do YouTube)" na WorkoutsView. Relacionamento: Sem relacionamento.
- instrucoes_demonstracao (TEXT) - Instruções/execução do exercício. Alimentação: seed ou template da IA; exibido como dica (icone de luz) na WorkoutsView. Relacionamento: Sem relacionamento.
- ordem (INTEGER) - Ordem do exercício dentro da ficha. Alimentação: seed ou ordem de geração da IA; usado para ordenar os exercícios na tela. Relacionamento: Sem relacionamento.
- concluido (BOOLEAN) - Se o exercício foi finalizado. Alimentação: checkbox do exercício na WorkoutsView, auto-conclusão quando todas as séries terminam e término do timer de cardio. Relacionamento: Sem relacionamento.
- dados_series (JSONB) - Séries do exercício (numero_serie, repeticoes_alvo, peso_kg, concluido). Alimentação: geradas automaticamente ao criar o exercício; atualizadas por toque na série (concluir/desmarcar), edição de peso série a série, "Aplicar em todas" e ajuste de cardio. É aqui que o aplicativo realmente guarda a execução por série. Relacionamento: Sem relacionamento.
- tipo_exercicio (TEXT) - Tipo: 'strength', 'cardio' ou 'isometric'. Alimentação: seed ou template da IA; define o modo de execução (força vs. cardio) na WorkoutsView. Relacionamento: Sem relacionamento.
- duracao_minutos (INTEGER) - Duração em minutos (apenas exercícios de cardio). Alimentação: seed/template da IA e botão "Ajustar Duração" na WorkoutsView (modo cardio). Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 5. REGISTRO_TREINOS - Histórico de treinos realizados

Função da tabela: registra cada sessão de treino concluída (início/fim, duração, volume total) para consulta e estatística.

- id (TEXT, PK) - Identificador único do registro. Gerado automaticamente ('log-...'). Relacionamento: Referenciada por registro_treino_series.registro_treino_id.
- perfil_id (TEXT) - Perfil que realizou o treino. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- treino_id (TEXT) - Treino (ficha) realizada. Alimentação: gerado automaticamente ao finalizar a ficha. Relacionamento: FK -> treinos.id (ON DELETE SET NULL).
- titulo_treino (TEXT) - Título do treino no momento da execução (foto do título, usado no rótulo "Último treino realizado"). Alimentação: automático ao finalizar. Relacionamento: Sem relacionamento.
- iniciado_em (TIMESTAMPTZ) - Início da sessão. Alimentação: automático - gravado na primeira interação (primeira série, primeiro checkbox ou start do cardio). Relacionamento: Sem relacionamento.
- concluido_em (TIMESTAMPTZ) - Fim da sessão. Alimentação: automático ao clicar em "Finalizar Treino" ou ao completar todos os exercícios. Relacionamento: Sem relacionamento.
- duracao_segundos (INTEGER) - Duração total em segundos. Alimentação: calculada automaticamente ao finalizar (início menos fim; fallback para a duração estimada se não houve interação). Relacionamento: Sem relacionamento.
- volume_total_kg (NUMERIC(10,2)) - Volume total levantado (soma de peso x repeticoes das séries concluídas). Alimentação: calculado automaticamente ao finalizar o treino (computeTotalVolume). Relacionamento: Sem relacionamento.
- calorias_queimadas (INTEGER) - Calorias gastas. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- esforco_rpe (INTEGER) - Nível de esforço percebido (1 a 10). Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- feedback_usuario (TEXT) - Feedback/observação do usuário. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- feedback_ia (TEXT) - Feedback/comentário do Coach IA. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 6. REGISTRO_TREINO_SERIES - Séries detalhadas do histórico de treino

Função da tabela: entidade pensada para detalhar série a série cada treino realizado. ATENÇÃO: hoje o aplicativo não grava nesta tabela; a execução por série fica em treino_exercicios.dados_series. A tabela foi mantida no schema para uso futuro.

- id (TEXT, PK) - Identificador único da série. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- registro_treino_id (TEXT) - Registro de treino realizado a que pertence a série. Alimentação: Não alimentado. Relacionamento: FK -> registro_treinos.id (ON DELETE CASCADE).
- nome_exercicio (TEXT) - Nome do exercício executado. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- numero_serie (INTEGER) - Número da série. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- repeticoes_realizadas (INTEGER) - Repetições efetivamente realizadas. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- peso_kg (NUMERIC(6,2)) - Peso usado na série. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- e_recorde_pessoal (BOOLEAN) - Se a série foi recorde pessoal. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Anotações da série. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 7. REFEICOES - Refeições diárias

Função da tabela: registra as refeições do dia por perfil, com tipo, título e totais de calorias e macronutrientes.

- id (TEXT, PK) - Identificador único da refeição. Gerado automaticamente ('meal-...'). Relacionamento: Referenciada por refeicao_itens.refeicao_id.
- perfil_id (TEXT) - Perfil dono da refeição. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- tipo_refeicao (TEXT) - Tipo: 'breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout'. Alimentação: campo "Tipo de Refeição" (seleção) na tela Nutrição (NutritionView). Relacionamento: Sem relacionamento.
- titulo (TEXT) - Título/descrição da refeição. Alimentação: campo "Título da Refeição*" na tela Nutrição. Relacionamento: Sem relacionamento.
- consumida_em (TIMESTAMPTZ) - Data/hora em que foi consumida. Alimentação: automático (data/hora atual ao salvar). Relacionamento: Sem relacionamento.
- total_calorias (INTEGER) - Total de calorias (kcal). Alimentação: campo "Calorias (kcal)*" na tela Nutrição. Relacionamento: Sem relacionamento.
- total_proteina_g (NUMERIC(6,1)) - Total de proteínas (g). Alimentação: campo "Proteínas (g)" na tela Nutrição. Relacionamento: Sem relacionamento.
- total_carboidratos_g (NUMERIC(6,1)) - Total de carboidratos (g). Alimentação: campo "Carboidratos (g)" na tela Nutrição. Relacionamento: Sem relacionamento.
- total_gorduras_g (NUMERIC(6,1)) - Total de gorduras (g). Alimentação: campo "Gorduras (g)" na tela Nutrição. Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Observações da refeição. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 8. REFEICAO_ITENS - Itens de cada refeição

Função da tabela: entidade pensada para detalhar os alimentos de cada refeição (nome, porção, calorias, macros). ATENÇÃO: hoje o aplicativo não grava nesta tabela - a tela Nutrição preenche os totais diretamente em refeicoes. Mantida para uso futuro.

- id (TEXT, PK) - Identificador único do item. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- refeicao_id (TEXT) - Refeição a que o item pertence. Alimentação: Não alimentado. Relacionamento: FK -> refeicoes.id (ON DELETE CASCADE).
- nome_alimento (TEXT) - Nome do alimento. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- porcao_g (NUMERIC(6,1)) - Porção em gramas. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- calorias (INTEGER) - Calorias do alimento. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- proteina_g (NUMERIC(6,1)) - Proteínas do alimento (g). Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- carboidratos_g (NUMERIC(6,1)) - Carboidratos do alimento (g). Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- gorduras_g (NUMERIC(6,1)) - Gorduras do alimento (g). Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 9. REGISTRO_AGUA - Ingestão de água

Função da tabela: registra cada consumo de água do dia (quanto e quando) para controle da meta diária.

- id (TEXT, PK) - Identificador único do registro. Gerado automaticamente ('wtr-...'). Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil que registrou a água. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- quantidade_ml (INTEGER) - Quantidade de água em ml. Alimentação: botões "+250 ml" e "+500 ml" na tela Nutrição. Relacionamento: Sem relacionamento.
- registrado_em (TIMESTAMPTZ) - Data/hora em que foi registrado. Alimentação: automático (data/hora atual ao registrar). Relacionamento: Sem relacionamento.

---

# 10. SUPLEMENTOS - Suplementos e mistura personalizada

Função da tabela: cadastra os suplementos do perfil (nome, dosagem, estoque, horário), inclusive a Mistura Personalizada Pré-Treino.

- id (TEXT, PK) - Identificador único do suplemento. Gerado automaticamente ('supp-...'). Relacionamento: Referenciada por suplemento_consumos.suplemento_id.
- perfil_id (TEXT) - Perfil dono do suplemento. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- nome (TEXT) - Nome do suplemento. Alimentação: campo "Nome do Suplemento*" na tela Suplementos (SupplementsView). Relacionamento: Sem relacionamento.
- e_mistura_personalizada (BOOLEAN) - Se é a mistura personalizada exclusiva. Alimentação: checkbox "É a Mistura Personalizada exclusiva?" na tela Suplementos. Relacionamento: Sem relacionamento.
- dosagem (TEXT) - Dosagem diária (ex: "1 scoop (16g)"). Alimentação: campo "Dosagem Diária*" na tela Suplementos. Relacionamento: Sem relacionamento.
- formula_receita (TEXT) - Receita/composição da mistura manipulada. Alimentação: campo "Receita / Composição (se manipulado)" na tela Suplementos. Relacionamento: Sem relacionamento.
- horario_recomendado (TEXT) - Horário recomendado de ingestão. Alimentação: campo "Horário de Ingestão" na tela Suplementos (padrão "Horário habitual" se vazio). Relacionamento: Sem relacionamento.
- estoque_atual_doses (INTEGER) - Estoque atual em doses. Alimentação: campo "Estoque Inicial (doses)" ao cadastrar; o botão "Tomar Dose" decresce o estoque (takeSupplementDose). Relacionamento: Sem relacionamento.
- alerta_estoque_minimo (INTEGER) - Estoque mínimo para alerta de reposição. Alimentação: valor fixo 7 na tela Suplementos (sem campo próprio). Relacionamento: Sem relacionamento.
- unidade (TEXT) - Unidade do estoque (ex: 'doses', 'cápsulas'). Alimentação: valor fixo 'doses' na tela Suplementos (sem campo próprio). Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Observações sobre o suplemento. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- ativo (BOOLEAN) - Se o suplemento está ativo. Alimentação: valor fixo true ao criar na tela Suplementos (sem chave de ativação). Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 11. SUPLEMENTO_CONSUMOS - Consumo de suplementos (histórico)

Função da tabela: entidade pensada para o histórico de doses ingeridas de cada suplemento. ATENÇÃO: hoje o aplicativo não grava nesta tabela - o botão "Tomar Dose" apenas reduz o estoque em suplementos. Mantida para uso futuro.

- id (TEXT, PK) - Identificador único do consumo. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil que consumiu o suplemento. Alimentação: Não alimentado. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- suplemento_id (TEXT) - Suplemento consumido. Alimentação: Não alimentado. Relacionamento: FK -> suplementos.id (ON DELETE CASCADE).
- tomado_em (TIMESTAMPTZ) - Data/hora em que foi tomado. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Observações do consumo. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.

---

# 12. METRICAS_SAUDE - Saúde e métricas clínicas

Função da tabela: registra medições do dia (peso, IMC, gordura, massa, medidas corporais) para acompanhamento da evolução.

- id (TEXT, PK) - Identificador único da medição. Gerado automaticamente ('hm-...'). Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil da medição. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- medido_em (TIMESTAMPTZ) - Data/hora da medição. Alimentação: automático (data de hoje ao registrar na tela Evolução). Relacionamento: Sem relacionamento.
- peso_kg (NUMERIC(5,2)) - Peso medido (kg). Alimentação: campo "Peso Atual (kg)*" na tela Evolução (EvolutionView); também espelha o peso atual do perfil. Relacionamento: Sem relacionamento.
- imc (NUMERIC(4,1)) - Índice de Massa Corporal. Alimentação: calculado automaticamente (peso / altura²) ao registrar na tela Evolução. Relacionamento: Sem relacionamento.
- percentual_gordura (NUMERIC(4,1)) - Percentual de gordura. Alimentação: campo "% de Gordura" na tela Evolução. Relacionamento: Sem relacionamento.
- massa_muscular_kg (NUMERIC(5,2)) - Massa muscular (kg). Alimentação: campo "Massa Muscular (kg)" na tela Evolução. Relacionamento: Sem relacionamento.
- pressao_sistolica (INTEGER) - Pressão arterial sistólica. Alimentação: Não alimentado por nenhuma tela (exibido como valor fixo na tela Saúde). Relacionamento: Sem relacionamento.
- pressao_diastolica (INTEGER) - Pressão arterial diastólica. Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- frequencia_cardiaca_bpm (INTEGER) - Frequência cardíaca (bpm). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- glicemia_mg_dl (NUMERIC(5,1)) - Glicemia (mg/dL). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- horas_sono (NUMERIC(4,2)) - Horas de sono da noite. Alimentação: Não alimentado por nenhuma tela (usado pela IA no resumo diário com fallback). Relacionamento: Sem relacionamento.
- qualidade_sono (INTEGER) - Qualidade do sono (1 a 5). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- nivel_energia (INTEGER) - Nível de energia (1 a 10). Alimentação: Não alimentado por nenhuma tela (usado pela IA no resumo diário com fallback). Relacionamento: Sem relacionamento.
- peito_cm (NUMERIC(5,1)) - Medida do peito (cm). Alimentação: campo previsto na tela Evolução, mas hoje sem input vinculado (value fica vazio). Relacionamento: Sem relacionamento.
- cintura_cm (NUMERIC(5,1)) - Medida da cintura (cm). Alimentação: campo "Cintura (cm)" na tela Evolução. Relacionamento: Sem relacionamento.
- abdome_cm (NUMERIC(5,1)) - Medida do abdome (cm). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- quadril_cm (NUMERIC(5,1)) - Medida do quadril (cm). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- braco_direito_cm (NUMERIC(5,1)) - Medida do braço direito (cm). Alimentação: campo "Braço Direito (cm)" na tela Evolução. Relacionamento: Sem relacionamento.
- braco_esquerdo_cm (NUMERIC(5,1)) - Medida do braço esquerdo (cm). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- coxa_direita_cm (NUMERIC(5,1)) - Medida da coxa direita (cm). Alimentação: campo previsto na tela Evolução, mas hoje sem input vinculado (value fica vazio). Relacionamento: Sem relacionamento.
- coxa_esquerda_cm (NUMERIC(5,1)) - Medida da coxa esquerda (cm). Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Observações da medição. Alimentação: Não alimentado por nenhuma tela. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 13. REGISTRO_LESOES - Lesões, dores e histórico clínico

Função da tabela: registra lesões/dores (ex: tendinopatia patelar no joelho direito) com nível de dor, restrições e exercícios recomendados - usado pelo Coach IA para adaptar treinos.

- id (TEXT, PK) - Identificador único do registro. Gerado automaticamente ('inj-...'). Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil dono do registro. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- parte_corpo (TEXT) - Local do corpo afetado (ex: "Joelho Direito"). Alimentação: campo "Local do Corpo*" na tela Saúde (HealthView). Relacionamento: Sem relacionamento.
- nivel_dor (INTEGER, check 0-10) - Nível de dor na escala 0 a 10. Alimentação: slider "Nível Inicial de Dor (0 a 10)" na tela Saúde; também atualizado pelo slider de destaque do lesão. Relacionamento: Sem relacionamento.
- status (TEXT) - Status do acompanhamento: 'active', 'monitoring', 'recovered'. Alimentação: valor fixo 'monitoring' ao criar na tela Saúde. Relacionamento: Sem relacionamento.
- data_lesao (DATE) - Data da lesão/início. Alimentação: Não alimentado por nenhuma tela (exibido com fallback). Relacionamento: Sem relacionamento.
- sintomas (TEXT) - Sintomas / movimentos que incomodam. Alimentação: campo "Sintomas / Movimentos que incomodam" na tela Saúde. Relacionamento: Sem relacionamento.
- exercicios_restritos (TEXT[]) - Exercícios que devem ser evitados. Alimentação: valor fixo ['Sobrecarga extrema'] ao criar na tela Saúde. Relacionamento: Sem relacionamento.
- exercicios_recomendados (TEXT[]) - Exercícios recomendados. Alimentação: valor fixo ['Isometria', 'Mobilidade'] ao criar na tela Saúde. Relacionamento: Sem relacionamento.
- anotacoes_tratamento (TEXT) - Tratamento / cuidados. Alimentação: campo "Tratamento / Cuidados" na tela Saúde. Relacionamento: Sem relacionamento.
- registrado_em (TIMESTAMPTZ) - Data/hora do registro. Alimentação: automático (data/hora atual ao registrar). Relacionamento: Sem relacionamento.

---

# 14. FOTOS_EVOLUCAO - Fotos de evolução física

Função da tabela: armazena as fotos de evolução (frente/lado/costas) com data e peso do dia.

- id (TEXT, PK) - Identificador único da foto. Gerado automaticamente ('photo-...'). Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil dono da foto. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- tipo_foto (TEXT) - Ângulo da foto: 'front', 'side' ou 'back'. Alimentação: seletor "Frente / Lado / Costas" na tela Fotos (PhotosView). Relacionamento: Sem relacionamento.
- url_foto (TEXT) - URL da imagem/foto. Alimentação: campo "URL da Imagem / Foto*" (input de URL) na tela Fotos. Relacionamento: Sem relacionamento.
- peso_kg (NUMERIC(5,2)) - Peso no dia da foto (kg). Alimentação: campo "Peso no Dia (kg)" na tela Fotos. Relacionamento: Sem relacionamento.
- percentual_gordura (NUMERIC(4,1)) - Percentual de gordura no registro da foto. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- tirada_em (DATE) - Data em que a foto foi tirada/registrada. Alimentação: automático (data de hoje ao salvar). Relacionamento: Sem relacionamento.
- anotacoes (TEXT) - Observações da foto. Alimentação: campo "Observações" na tela Fotos. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 15. METAS - Metas e hábitos

Função da tabela: acompanha metas (peso, frequência de treino, água, sono, passos, nutrição) com valor atual, valor alvo e unidade.

- id (TEXT, PK) - Identificador único da meta. Gerado automaticamente ('goal-...'). Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil dono da meta. Alimentação: gerado automaticamente a partir do perfil ativo. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- titulo (TEXT) - Título da meta (ex: "Perder 9,5 kg"). Alimentação: campo "Título da Meta*" na tela Metas (GoalsView). Relacionamento: Sem relacionamento.
- categoria (TEXT) - Categoria: 'weight', 'workout_frequency', 'water', 'sleep', 'steps', 'nutrition'. Alimentação: campo "Categoria" (seleção) na tela Metas. Relacionamento: Sem relacionamento.
- valor_atual (NUMERIC(10,2)) - Valor atual da meta. Alimentação: campo "Valor Atual" na tela Metas. Relacionamento: Sem relacionamento.
- valor_objetivo (NUMERIC(10,2)) - Valor alvo da meta. Alimentação: campo "Valor Alvo (Meta)*" na tela Metas. Relacionamento: Sem relacionamento.
- unidade (TEXT) - Unidade de medida (ex: 'kg', 'litros', 'horas', 'passos'). Alimentação: campo "Unidade" na tela Metas (padrão 'kg'). Relacionamento: Sem relacionamento.
- prazo (DATE) - Prazo/data limite da meta. Alimentação: Não alimentado por nenhuma tela (campo reservado). Relacionamento: Sem relacionamento.
- status (TEXT) - Status: 'in_progress', 'completed', 'paused'. Alimentação: valor fixo 'in_progress' ao criar na tela Metas. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 16. COACH_MENSAGENS - Interações com o Coach IA (chat)

Função da tabela: guarda o histórico de mensagens do chat com o Coach IA (usuário e IA) e suas ações sugeridas.

- id (TEXT, PK) - Identificador único da mensagem. Alimentação: gerado pelo aplicativo ao enviar/responder no chat. Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil que conversou com a IA. Alimentação: gerado automaticamente a partir do perfil ativo (sendAICoachMessage). Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- remetente (TEXT) - Quem enviou: 'user' ou 'ai'. Alimentação: automático no envio de mensagem do usuário e na resposta do Coach IA. Relacionamento: Sem relacionamento.
- mensagem (TEXT) - Texto da mensagem. Alimentação: campo de texto do chat na tela Coach IA (AICoachView) e texto gerado pela IA. Relacionamento: Sem relacionamento.
- tipo_intencao (TEXT) - Intenção detectada na resposta: 'energy_low', 'injury_pain', 'workout_too_heavy', 'low_sleep', 'nutrition_advice', 'general'. Alimentação: gerado pelo motor da IA (processAICoachPrompt). Relacionamento: Sem relacionamento.
- acoes_sugeridas (JSONB) - Ações sugeridas pela IA (ação, rótulo e detalhes). Alimentação: gerado pelo motor da IA. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora da mensagem. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# 17. COACH_RESUMOS_DIARIOS - Resumos inteligentes do dia

Função da tabela: guarda o resumo diário gerado pela IA (saudação, sono, peso, treino recomendado, energia, hidratação, suplemento e progresso de metas). ATENÇÃO: hoje a IA gera o resumo em memória (lib/ai-coach.ts) e o aplicativo não persiste nesta tabela - mantida para uso futuro (um resumo por perfil por dia).

- id (TEXT, PK) - Identificador único do resumo. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- perfil_id (TEXT) - Perfil dono do resumo. Alimentação: Não alimentado. Relacionamento: FK -> perfis.id (ON DELETE CASCADE).
- data_resumo (DATE) - Data do resumo (chave junto com o perfil). Alimentação: Não alimentado. Relacionamento: Sem relacionamento (participa do UNIQUE perfil_id + data_resumo).
- saudacao (TEXT) - Saudação do dia (ex: "Bom dia, Leonardo!"). Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- resumo_sono (TEXT) - Resumo do sono. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- tendencia_peso (TEXT) - Tendência do peso. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- recomendacao_treino (TEXT) - Recomendação de treino do dia. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- status_energia (TEXT) - Status de energia. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- conselho_hidratacao (TEXT) - Conselho de hidratação. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- lembrete_suplemento (TEXT) - Lembrete de suplemento. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- progresso_metas (TEXT) - Progresso das metas. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- markdown_completo (TEXT) - Resumo completo em markdown. Alimentação: Não alimentado. Relacionamento: Sem relacionamento.
- criado_em (TIMESTAMPTZ) - Data/hora de criação. Alimentação: default do banco (NOW()). Relacionamento: Sem relacionamento.

---

# Resumo dos relacionamentos (chaves estrangeiras)

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

# Colunas do schema não alimentadas pelo aplicativo hoje (importantes para manutenção)

- perfis: url_avatar, percentual_gordura, massa_muscular_kg (só seed)
- treino_exercicios: url_video_gif
- registro_treinos: calorias_queimadas, esforco_rpe, feedback_usuario, feedback_ia
- registro_treino_series: tabela inteira (execução por série fica em treino_exercicios.dados_series)
- refeicao_itens: tabela inteira (totais gravados direto em refeicoes)
- suplemento_consumos: tabela inteira (botão "Tomar Dose" só reduz estoque)
- metricas_saude: pressao_sistolica, pressao_diastolica, frequencia_cardiaca_bpm, glicemia_mg_dl, horas_sono, qualidade_sono, nivel_energia, abdome_cm, quadril_cm, braco_esquerdo_cm, coxa_esquerda_cm, anotacoes (peito_cm e coxa_direita_cm previstos, mas sem input vinculado)
- registro_lesoes: data_lesao
- refeicoes: anotacoes
- suplementos: anotacoes
- fotos_evolucao: percentual_gordura
- metas: prazo
- coach_resumos_diarios: tabela inteira (resumo gerado e exibido, não persistido)