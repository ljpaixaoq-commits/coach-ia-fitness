import { Profile, Workout, WorkoutExercise, InjuryPainLog, HealthMetric, AIDailySummary } from '../types';

export function getDynamicGreeting(name: string): { greeting: string; period: string } {
  const hour = new Date().getHours();
  let prefix = 'Bom dia';
  let period = 'manhã';

  if (hour >= 12 && hour < 18) {
    prefix = 'Boa tarde';
    period = 'tarde';
  } else if (hour >= 18) {
    prefix = 'Boa noite';
    period = 'noite';
  }

  return {
    greeting: `${prefix}, ${name}!`,
    period
  };
}

export interface AICoachResponse {
  message: string;
  intent: 'energy_low' | 'injury_pain' | 'workout_too_heavy' | 'low_sleep' | 'nutrition_advice' | 'general' | 'remove_exercise' | 'remove_exercise_not_found' | 'review_fatigue' | 'review_pain' | 'progression_advice' | 'workout_adjust';
  suggestedActions?: {
    action: string;
    label: string;
    details?: string;
    workoutId?: string;
    exerciseId?: string;
    exerciseName?: string;
  }[];
}

export function generateSmartDailySummary(
  profile: Profile,
  todayWorkout?: Workout,
  lastHealthMetric?: HealthMetric,
  kneeInjury?: InjuryPainLog
): AIDailySummary {
  const name = profile.nickname || profile.name;
  const { greeting } = getDynamicGreeting(name);
  const weightLoss = profile.current_weight - profile.target_weight;
  const weightDistance = Math.abs(weightLoss).toFixed(1);
  const sleep = lastHealthMetric?.sleep_hours ? `${lastHealthMetric.sleep_hours}h` : '7h20';
  const energy = lastHealthMetric?.energy_level || 8;

  const sleepSummary = `✔ Dormiu ${sleep} (${energy >= 7 ? 'boa recuperação muscular' : 'recuperação moderada'}).`;
  const weightTrend = `✔ Peso atual: ${profile.current_weight} kg (Meta: ${profile.target_weight} kg).`;
  const workoutRec = todayWorkout
    ? `✔ Hoje é ${todayWorkout.title}.`
    : `✔ Dia de descanso ativo ou cardio leve recomendado.`;
  const energyStatus = `✔ Nível de energia avaliado em ${energy}/10. ${energy < 7 ? 'Sugiro focar na técnica e cadência hoje.' : 'Excelente dia para progressão de cargas!'}`;
  const hydrationAdvice = `✔ Meta de hidratação: ${(profile.daily_water_target_ml / 1000).toFixed(1)}L (Beba 1L até 12h).`;
  const supplementReminder = `✔ Tome sua Mistura Personalizada 30 min antes do treino.`;
  const goalProgress = `✔ Você está a apenas ${weightDistance} kg da sua meta final (${profile.target_weight} kg)!`;

  const markdown = `
### Resumo Inteligente do Dia 🤖⚡

**${greeting}**
${sleepSummary}
${weightTrend}
${workoutRec}
${kneeInjury && kneeInjury.pain_level > 0 ? `✔ **Alerta Joelho:** Nível de dor ${kneeInjury.pain_level}/10. Mantenha os exercícios isométricos.` : ''}
${energyStatus}
${hydrationAdvice}
${supplementReminder}
${goalProgress}
  `.trim();

  return {
    id: `summary-${new Date().toISOString().split('T')[0]}`,
    profile_id: profile.id,
    summary_date: new Date().toISOString().split('T')[0],
    greeting,
    sleep_summary: sleepSummary,
    weight_trend: weightTrend,
    workout_recommendation: workoutRec,
    energy_status: energyStatus,
    hydration_advice: hydrationAdvice,
    supplement_reminder: supplementReminder,
    goal_milestone_progress: goalProgress,
    full_markdown: markdown
  };
}

export function processAICoachPrompt(
  prompt: string,
  profile: Profile,
  todayWorkout?: Workout,
  injuryLogs: InjuryPainLog[] = [],
  allWorkouts: Workout[] = []
): AICoachResponse {
  const lower = prompt.toLowerCase();
  const name = profile.nickname || profile.name;
  const { greeting } = getDynamicGreeting(name);
  const kneeLog = injuryLogs.find(i => i.body_part.toLowerCase().includes('joelho'));
  const todayExercises = todayWorkout?.exercises || [];
  const workoutPool = (allWorkouts.length > 0 ? allWorkouts : todayWorkout ? [todayWorkout] : [])
    .filter(w => w.exercises && w.exercises.length > 0);

  // ── Ajuste: remover um exercício específico ─────────────────
  const wantsRemove = /retirar|remover|excluir|abandonar|tirar (?:do treino|esse|este|desse|deste|o |um )|quero tirar|não gosto|nao gosto/.test(lower);
  if (wantsRemove && workoutPool.length > 0) {
    const hit = workoutPool.flatMap((w, wi) =>
      (w.exercises || []).map(e => ({ w, wi, e }))
    ).find(x => x.e.name && lower.includes(x.e.name.toLowerCase()));
    if (hit) {
      const { w, wi, e } = hit;
      const isToday = w.id === todayWorkout?.id;
      const workoutDesc = isToday ? 'da sua ficha de hoje' : `do seu **Treino ${wi + 1}**`;
      return {
        intent: 'remove_exercise',
        message: `${greeting} Entendi! Vou **remover o "${e.name}"** ${workoutDesc} e incluir **outro exercício equivalente no lugar** (se possível do mesmo grupo muscular **${e.muscle_group}**), mantendo seu treino completo. Clique no botão abaixo para eu aplicar.`,
        suggestedActions: [
          { action: 'remove_exercise', label: `🗑️ Remover "${e.name}"${isToday ? ' do treino de hoje' : ` do Treino ${wi + 1}`}`, details: 'Remove o exercício e inclui um equivalente no lugar.', workoutId: w.id, exerciseId: e.id, exerciseName: e.name },
          { action: 'list_exercises', label: '👀 Ver exercícios do treino', details: 'Relembrar os exercícios da ficha.' }
        ]
      };
    }
    const overview = workoutPool.map((w, wi) =>
      `**Treino ${wi + 1}${w.id === todayWorkout?.id ? ' (hoje)' : ''}:** ${(w.exercises || []).map(e => e.name).join(' · ')}`
    ).join('\n');
    return {
      intent: 'remove_exercise_not_found',
      message: `${greeting} Não encontrei esse exercício em nenhum dos seus **${workoutPool.length} treinos**. Estes são os exercícios que você tem:\n\n${overview}\n\nMe diga **qual exercício** (e de **qual treino**) você quer que eu remova.`,
      suggestedActions: [
        { action: 'list_exercises', label: '👀 Ver exercícios do treino', details: 'Relembrar os exercícios da ficha.' }
      ]
    };
  }

  // ── Ajuste: muito cansado(a) ou muitas dores → revisar treino ──
  const veryTired = /muito cansad|muitíssimo cansad|cansad(í|i)ssimo|exausto|exausta|sem forças|sem forcas|derrubad/.test(lower);
  const lotsOfPain = /muitas dores|muita dor|muito dolorid|dores fortes|dor forte|dor intensa/.test(lower);
  if (veryTired || lotsOfPain) {
    const cause = veryTired ? 'de cansaço' : 'de dor';
    return {
      intent: veryTired ? 'review_fatigue' : 'review_pain',
      message: `${greeting} Pelo que você relatou ${cause}, vou **realizar uma revisão no seu treino** para aliviar o impacto e proteger o seu corpo. A revisão vai:\n\n1. **Reduzir as cargas em ~20%** em todos os exercícios de hoje;\n2. **Aumentar o descanso entre as séries**;\n3. Recomendar priorizar a **técnica** sobre o peso.\n\nQuer que eu **aplique a revisão** agora?`,
      suggestedActions: [
        { action: 'apply_review', label: '📋 Aplicar revisão no treino (cargas -20%)', details: 'Reduz as cargas e aumenta o descanso do treino de hoje.', workoutId: todayWorkout?.id },
        { action: 'increase_water', label: '💧 Registrar +500ml de Água', details: 'Hidratação ajuda no cansaço e na recuperação.' },
        { action: 'log_pain', label: '📝 Registrar estado de hoje', details: 'Abrir a aba Saúde e registrar como você está.' }
      ]
    };
  }

  // ── Dúvidas de progressão de cargas ─────────────────────────
  const wantsProgression = /progress|progredir|evoluir|carga\b|peso\b|subir carga|subir peso|levantar mais|quanto pesar/.test(lower);
  if (wantsProgression) {
    return {
      intent: 'progression_advice',
      message: `${greeting} Sobre **progressão de cargas**, aqui vai minha orientação:\n\n1. **Aumente aos poucos:** suba 2,5–5 kg (ou ~5%) apenas quando concluir todas as séries com técnica limpa;\n2. **Reserve 1–2 repetições (RIR):** não treine até a falha em todas as séries;\n3. **Anote os pesos:** registre na aba Treinos para acompanhar a evolução;\n4. **Alimentação:** para ter energia para progredir, mantenha a meta de **${profile.daily_protein_target_g}g de proteína** e **${profile.daily_calorie_target} kcal**.\n\nSe quiser, abro seu treino de hoje para conferir os pesos atuais.`,
      suggestedActions: [
        { action: 'start_workout', label: '🏋️ Abrir treino de hoje', details: 'Ver cargas atuais e ajustar.' },
        { action: 'view_nutrition', label: '🥗 Ver metas de alimentação', details: 'Conferir calorias e proteínas do plano.' }
      ]
    };
  }

  // ── Intent genérico de ajustar o treino ─────────────────────
  const wantsAdjust = /\bajustar\b|\bajuste\b|adaptar|adapta|modificar o treino|revisar treino/.test(lower);
  if (wantsAdjust) {
    const hasWorkout = todayExercises.length > 0;
    return {
      intent: 'workout_adjust',
      message: `${greeting} ${
        hasWorkout
          ? `Para **ajustar o seu treino de hoje** (**${todayWorkout?.title || 'Treino do dia'}**)`
          : '**Ainda não há treino salvo.** Posso te ajudar a criar um em **Criar Treino**.'
      }, me diga como prefere:\n\n• **Remover um exercício** — me diga qual não te agradou;\n• **Cansaço ou dores** — aplico uma **revisão** reduzindo as cargas em 20%;\n• **Dúvidas de progressão ou alimentação** — recebo orientações aqui mesmo.\n\nToque em **"👀 Ver minha ficha atual"** abaixo para relembrar os exercícios. Como prefere ajustar?`,
      suggestedActions: [
        { action: 'list_exercises', label: '👀 Ver minha ficha atual', details: 'Listar os exercícios do treino de hoje.' },
        { action: 'apply_review', label: '📋 Revisar treino (cargas -20%)', details: 'Reduz as cargas para aliviar cansaço ou dor.', workoutId: todayWorkout?.id },
        { action: 'view_nutrition', label: '🥗 Dúvidas de alimentação', details: 'Conferir metas e registro de refeições.' }
      ]
    };
  }

  if (lower.includes('sem energia') || lower.includes('pouca energia') || lower.includes('cansado') || lower.includes('fadiga')) {
    return {
      intent: 'energy_low',
      message: `${greeting} Compreendo como você se sente. Treinar em dias de menor disposição faz parte do processo, mas adaptamos o treino estrategicamente:\n\n1. **Redução de Volume:** Reduza 1 série de cada exercício hoje e foque em 8-10 repetições com cadência controlada.\n2. **Descanso entre séries:** Aumente o descanso para 90-120 segundos no cronômetro.\n3. **Hidratação:** Beba 500ml de água gelada antes de começar.\n4. **Mistura Pré-Treino:** Tome sua dose personalizada 30 minutos antes para ativação neural.\n5. **Se a energia estiver abaixo de 4/10:** Faça apenas 20 min de esteira leve e mobilidade.`,
      suggestedActions: [
        { action: 'apply_review', label: '📉 Reduzir Cargas em 20%', details: 'Revisa o treino de hoje para dias de fadiga.', workoutId: todayWorkout?.id },
        { action: 'increase_water', label: '💧 Registrar +500ml de Água', details: 'Hidratação rápida para recuperação.' }
      ]
    };
  }

  if (lower.includes('joelho') || lower.includes('dor no joelho') || lower.includes('articula')) {
    const painText = kneeLog ? `(Seu histórico registra dor nível ${kneeLog.pain_level}/10)` : '';
    return {
      intent: 'injury_pain',
      message: `Atenção total ao seu joelho direito ${painText}!\n\nPara proteger os tendões e ligamentos:\n\n1. **Exercícios Proibidos Hoje:** Evite agachamento livre profundo e leg press com os pés baixos na plataforma.\n2. **Substituições Seguras:**\n   - Cadeira extensora isométrica (sustentar 45s a 60 graus);\n   - Mesa flexora para foco em posteriores;\n   - Elevação pélvica e panturrilha em pé.\n3. **Pós-Treino:** Aplique gelo por 20 minutos com compressa.\n4. **Aquecimento:** Faça 5 minutos de bicicleta ergométrica leve antes da musculação.`,
      suggestedActions: [
        { action: 'log_pain', label: '📝 Atualizar Nível de Dor no Registro', details: 'Abrir a aba Saúde e registrar a dor de hoje.' }
      ]
    };
  }

  if (lower.includes('pesado') || lower.includes('muito pesado') || lower.includes('dolorido') || lower.includes('dor muscular')) {
    return {
      intent: 'workout_too_heavy',
      message: `Se a sessão foi muito intensa, nosso foco é **Recuperação e Supercompensação Muscular**:\n\n1. **Nutrição:** Aumente a ingestão de carboidratos complexos (arroz, batata, aveia) na próxima refeição para repor glicogênio e garanta 35-40g de proteína.\n2. **Eletrólitos & Água:** Beba 750ml de água nas próximas duas horas.\n3. **Sono:** Durma pelo menos 7h30 a 8h esta noite para pico de síntese proteica.\n4. **Amanhã:** Programe descanso ou treino de grupo muscular não sinérgico.`,
      suggestedActions: [
        { action: 'add_protein_snack', label: '🍗 Registrar Refeição Pós-Treino', details: 'Abrir a aba Alimentação para registrar a refeição.' },
        { action: 'apply_review', label: '📋 Reduzir cargas para a próxima sessão', details: 'Deixa o próximo treino mais leve para recuperação.', workoutId: todayWorkout?.id }
      ]
    };
  }

  if (lower.includes('dormi') || lower.includes('horas') || lower.includes('sono') || lower.includes('insônia')) {
    return {
      intent: 'low_sleep',
      message: `Noites com pouco sono afetam a coordenação neural e elevam o cortisol. Recomendações para hoje:\n\n1. **Sem Recordes de Carga (PRs):** Treine com 70% a 75% da sua carga normal, deixando 2 repetições em reserva (RIR 2).\n2. **Técnica:** Mantenha postura impecável em todos os movimentos.\n3. **Cafeína Consciente:** Tome a mistura pré-treino somente até às 16h para não prejudicar o sono de hoje.\n4. **Hidratação:** Redobre a ingestão de líquidos durante todo o dia.`,
      suggestedActions: [
        { action: 'apply_review', label: '⚙️ Ativar Modo Treino Seguro', details: 'Reduz as cargas em 20% para treinar com mais cuidado.', workoutId: todayWorkout?.id }
      ]
    };
  }

  if (lower.includes('alimenta') || lower.includes('comer') || lower.includes('dieta') || lower.includes('suplement') || lower.includes('mistura')) {
    return {
      intent: 'nutrition_advice',
      message: `Para o seu objetivo de **${profile.fitness_goal === 'lose_weight' ? 'Emagrecimento com Definição' : 'Hipertrofia'}**, aqui está o plano nutricional:\n\n- **Calorias Alvo:** ${profile.daily_calorie_target} kcal\n- **Proteínas:** ${profile.daily_protein_target_g}g (${(profile.daily_protein_target_g / profile.current_weight).toFixed(1)}g por kg de peso)\n- **Água:** ${(profile.daily_water_target_ml/1000).toFixed(1)}L ao longo do dia.\n- **Mistura Personalizada:** Tome 30 minutos antes do início do treino para máxima absorção.`,
      suggestedActions: [
        { action: 'view_nutrition', label: '🥗 Abrir Registro de Alimentação', details: 'Ver calorias e macronutrientes restantes.' },
        { action: 'take_blend', label: '🧪 Registrar Dose da Mistura', details: 'Descontar 1 dose do estoque.' }
      ]
    };
  }

  return {
    intent: 'general',
    message: `${greeting} Como seu Coach IA Pessoal, estou monitorando seu treino, nutrição, estoque da Mistura e a recuperação do seu joelho direito.\n\nPeso atual: **${profile.current_weight} kg** (Meta: **${profile.target_weight} kg**).\n\nComo posso orientar você agora? Fique à vontade para me avisar sobre dores, cansaço, progressão de cargas ou dúvidas sobre sua alimentação.`,
    suggestedActions: [
      { action: 'start_workout', label: '🏋️ Iniciar Treino de Hoje', details: 'Abrir ficha e cronômetro de descanso.' },
      { action: 'view_summary', label: '📊 Ver Resumo Inteligente do Dia', details: 'Visão detalhada das métricas de hoje.' }
    ]
  };
}

// ── Workout Generator ──────────────────────────────────────────

export type ObjectiveKey = 'lose_weight' | 'hypertrophy' | 'endurance' | 'health';

export interface WorkoutGoal {
  objective: ObjectiveKey;
  objectives?: ObjectiveKey[];
  limitations: string[];
  daysPerWeek: number;
  sessionMinutes: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
}

interface ExerciseTemplate {
  name: string;
  muscle: string;
  type: 'strength' | 'cardio' | 'isometric';
  sets: number;
  reps: string;
  rest: number;
  kneeSafe: boolean;
  demo_instructions: string;
  video_url?: string;
}

const EXERCISE_DB: Record<string, ExerciseTemplate[]> = {
  chest: [
    { name: 'Supino Reto com Barra', muscle: 'Peito', type: 'strength', sets: 4, reps: '8-12', rest: 90, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=8UiTPNj66AU', demo_instructions: 'Deite no banco com o olhar abaixo da barra. Escápulas firmes, desça a barra até a linha do peito e empurre sem travar o cotovelo.' },
    { name: 'Supino Inclinado com Halteres', muscle: 'Peito', type: 'strength', sets: 4, reps: '10-12', rest: 90, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=oqIhIInoIo0', demo_instructions: 'Banco a 30-45°. Cotovelos a 45° do tronco, desça os halteres até a linha do peitoral e empurre para cima com controle.' },
    { name: 'Crucifixo na Máquina', muscle: 'Peito', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=O_FwRxa-hJo', demo_instructions: 'Ajuste o assento para pegar na altura do peitoral. Faça o movimento de abraço mantendo os cotovelos levemente flexionados.' },
    { name: 'Crossover', muscle: 'Peito', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=E3aha5zhlc0', demo_instructions: 'Polias acima dos ombros, tronco levemente à frente. Puxe as mãos em arco até a frente do abdômen contraindo o peito.' },
    { name: 'Flexão de Braços', muscle: 'Peito', type: 'strength', sets: 3, reps: '10-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=Azw6BZ8-wSM', demo_instructions: 'Corpo alinhado, mãos na largura dos ombros. Desça até o peito quase tocar o chão e suba controlando.' }
  ],
  back: [
    { name: 'Puxada Frontal', muscle: 'Costas', type: 'strength', sets: 4, reps: '10-12', rest: 90, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=XxQNTzaXeH0', demo_instructions: 'Sente com o tronco ereto. Puxe a barra em direção à parte superior do peito, levando as escápulas para trás.' },
    { name: 'Remada Curvada', muscle: 'Costas', type: 'strength', sets: 4, reps: '8-12', rest: 90, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=mqeBlb7lVfM', demo_instructions: 'Pés afastados e tronco inclinado ~45° com a coluna neutra. Puxe a barra em direção ao abdômen com os cotovelos perto do corpo.' },
    { name: 'Remada Unilateral', muscle: 'Costas', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=SUvZiVClLKw', demo_instructions: 'Uma mão apoiada no banco, a outra segura o halter. Puxe o cotovelo em direção ao quadril mantendo o tronco estável.' },
    { name: 'Pulldown', muscle: 'Costas', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=2L5bcSEpEYo', demo_instructions: 'Pegada média ou supinada. Puxe a barra em direção ao peito mantendo os cotovelos próximos ao corpo.' },
    { name: 'Encolhimento (Trapézio)', muscle: 'Costas', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=AdkMdSoRVPE', demo_instructions: 'Em pé com halteres, eleve os ombros em direção às orelhas, segure 1 segundo e desça sem rotacionar.' }
  ],
  shoulders: [
    { name: 'Desenvolvimento com Halteres', muscle: 'Ombros', type: 'strength', sets: 4, reps: '8-12', rest: 90, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=1WDYtgF0vQ8', demo_instructions: 'Sentado com encosto, halteres na altura dos ombros. Empurre para cima sem travar os cotovelos e desça controlado.' },
    { name: 'Elevação Lateral', muscle: 'Ombros', type: 'strength', sets: 4, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=4VLsc8i99jo', demo_instructions: 'Cotovelos levemente flexionados, eleve os braços até a altura dos ombros e desça devagar, sem balançar o tronco.' },
    { name: 'Elevação Frontal', muscle: 'Ombros', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=jhxLYSm_P-k', demo_instructions: 'Com halteres à frente das coxas, eleve até a linha dos olhos e desça controlado, sem impulso.' },
    { name: 'Face Pull', muscle: 'Ombros', type: 'strength', sets: 3, reps: '15-20', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=kYMTJAx_dTM', demo_instructions: 'Corda na polia na altura dos olhos. Puxe em direção ao rosto abrindo as mãos e contraindo as escápulas.' },
    { name: 'Crucifixo Inverso', muscle: 'Ombros', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=NdvAiM9qGu0', demo_instructions: 'Tronco inclinado à frente, braços com leve flexão. Abra os braços para trás contraindo ombros posteriores e costas.' }
  ],
  legs: [
    { name: 'Agachamento Livre', muscle: 'Pernas', type: 'strength', sets: 4, reps: '8-12', rest: 120, kneeSafe: false, video_url: 'https://www.youtube.com/watch?v=6ppjJrbrW7g', demo_instructions: 'Barra apoiada no trapézio, pés na largura do quadril. Desça levando o quadril para trás com o peito erguido e suba empurrando pelo calcanhar.' },
    { name: 'Leg Press 45°', muscle: 'Pernas', type: 'strength', sets: 4, reps: '10-12', rest: 90, kneeSafe: false, video_url: 'https://www.youtube.com/watch?v=waAxlYvtCcI', demo_instructions: 'Pés na plataforma na largura dos ombros. Desça até os joelhos chegarem a ~90° sem descolar a lombar do encosto.' },
    { name: 'Cadeira Extensora', muscle: 'Quadríceps', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=el3oHblB5DM', demo_instructions: 'Ajuste o eixo na altura dos tornozelos. Estenda os joelhos até o fim, contraia o quadríceps e volte controlado.' },
    { name: 'Mesa Flexora', muscle: 'Posterior', type: 'strength', sets: 4, reps: '10-12', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=4vK5sG3yC_0', demo_instructions: 'Deitado de bruços com o eixo nos calcanhares. Flexione os joelhos aproximando os pés do glúteo, sem levantar o quadril.' },
    { name: 'Panturrilha em Pé', muscle: 'Panturrilha', type: 'strength', sets: 4, reps: '15-20', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=pJ4JFIajxFs', demo_instructions: 'Com a parte anterior dos pés no apoio, desça os calcanhares e suba na ponta dos pés até o máximo.' },
    { name: 'Elevação Pélvica', muscle: 'Glúteos', type: 'strength', sets: 4, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=Y0CalyZrWcc', demo_instructions: 'Deitado no chão com os joelhos flexionados. Empurre o quadril para cima contraindo os glúteos no topo e desça.' },
    { name: 'Isometria de Quadríceps', muscle: 'Quadríceps', type: 'isometric', sets: 3, reps: '45s', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=SPwQwJyXKn0', demo_instructions: 'Sentado com a perna estendida, sustente a contração máxima do quadríceps sem soltar a tensão por 45 segundos.' },
    { name: 'Avanço com Halteres', muscle: 'Pernas', type: 'strength', sets: 3, reps: '10 cada', rest: 60, kneeSafe: false, video_url: 'https://www.youtube.com/watch?v=aJkCqPwE6j8', demo_instructions: 'Passada à frente com o tronco ereto. Desça até o joelho de trás quase tocar o chão e volte empurrando pelo calcanhar.' }
  ],
  arms: [
    { name: 'Rosca Direta com Barra', muscle: 'Bíceps', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=Et1wgGMGW8w', demo_instructions: 'Cotovelos fixos ao lado do corpo. Eleve a barra até a altura do peito e desça controlado, sem balançar o tronco.' },
    { name: 'Rosca Alternada', muscle: 'Bíceps', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=nJxbtI4C1bU', demo_instructions: 'Alterne os braços flexionando o cotovelo com supinação no topo, controlando a descida.' },
    { name: 'Tríceps Pulley', muscle: 'Tríceps', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=KhK5HWJfsrQ', demo_instructions: 'Cotovelos fixos ao lado do corpo. Puxe a corda para baixo até estender totalmente os braços no fim do movimento.' },
    { name: 'Tríceps Testa', muscle: 'Tríceps', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=Lc4MwP7vP2g', demo_instructions: 'Deitado, halteres ou barra acima da testa. Flexione os cotovelos baixando até a testa e estenda sem abrir os cotovelos.' },
    { name: 'Mergulho entre Bancos', muscle: 'Tríceps', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=jH9RXQjbXqs', demo_instructions: 'Mãos apoiadas num banco, corpo à frente. Flexione os cotovelos descendo e suba sem abrir os cotovelos para os lados.' }
  ],
  core: [
    { name: 'Prancha Frontal', muscle: 'Core', type: 'isometric', sets: 3, reps: '45s', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=Yu0wjtD5FkU', demo_instructions: 'Cotovelos sob os ombros, corpo em linha reta, glúteo contraído e abdômen ativado. Não suba nem deixe cair o quadril.' },
    { name: 'Abdominal Crunch', muscle: 'Core', type: 'strength', sets: 4, reps: '15-20', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=O0pIQ2UqeCY', demo_instructions: 'Deitado com as mãos na cabeça (sem puxar). Contraia o abdômen elevando os ombros e volte controlado.' },
    { name: 'Elevação de Pernas', muscle: 'Core', type: 'strength', sets: 3, reps: '12-15', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=AvfE-knN7_M', demo_instructions: 'Deitado com as mãos sob o glúteo. Eleve as pernas estendidas até ~90° e desça sem encostar no chão.' },
    { name: 'Russian Twist', muscle: 'Core', type: 'strength', sets: 3, reps: '20 total', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=4AFJrgd7HkU', demo_instructions: 'Sentado com o tronco inclinado. Gire o tronco levando as mãos para cada lado, mantendo os pés apoiados ou elevados.' },
    { name: 'Prancha Lateral', muscle: 'Core', type: 'isometric', sets: 3, reps: '30s cada', rest: 45, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=2NjO5KrlVEM', demo_instructions: 'De lado com o antebraço sob o ombro. Eleve o quadril mantendo o corpo em linha reta, sem deixar cair.' }
  ],
  cardio: [
    { name: 'Esteira (Caminhada/Rotação)', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '20 min', rest: 0, kneeSafe: false, video_url: 'https://www.youtube.com/watch?v=9Djqtsfa2yI', demo_instructions: 'Caminhe com progressão de ritmo, mantendo a postura ereta e os braços soltos. Ajuste a duração conforme seu condicionamento.' },
    { name: 'Bicicleta Ergométrica', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '15 min', rest: 0, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=B7FF5kCiqoU', demo_instructions: 'Ajuste o banco na altura do quadril. Pedale com cadência constante, sem sobrecarregar os joelhos.' },
    { name: 'Elíptico', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '15 min', rest: 0, kneeSafe: false, video_url: 'https://www.youtube.com/watch?v=e5TCoLgPGAI', demo_instructions: 'Postura ereta segurando as alças. Mova as pernas e braços com fluidez e ritmo constante.' },
    { name: 'Remador', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '10 min', rest: 0, kneeSafe: true, video_url: 'https://www.youtube.com/watch?v=acvBTy4sRKM', demo_instructions: 'Empurre com as pernas, incline o tronco puxando a alça até o abdômen e retorne controlado.' }
  ]
};

function mapTemplateToExercise(ex: ExerciseTemplate, setsMultiplier: number, order: number): WorkoutExercise {
  const sets = Math.round(ex.sets * setsMultiplier);
  return {
    id: `ex-ai-${Date.now()}-${order}`,
    workout_id: '',
    name: ex.name,
    muscle_group: ex.muscle,
    exercise_type: ex.type,
    sets,
    reps_target: ex.reps,
    default_weight_kg: 0,
    duration_minutes: ex.type === 'cardio' ? parseInt(ex.reps) || 15 : undefined,
    rest_time_seconds: ex.rest,
    video_url: ex.video_url,
    demo_instructions: ex.demo_instructions,
    order_index: order,
    completed: false,
    sets_data: Array.from({ length: sets }, (_, i) => ({
      set_number: i + 1,
      reps_target: ex.reps,
      weight_kg: 0,
      completed: false
    }))
  };
}

const MUSCLE_FAMILIES: Record<string, string[]> = {
  chest: ['Peito'],
  back: ['Costas', 'Trapézio'],
  shoulders: ['Ombros'],
  legs: ['Pernas', 'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha'],
  arms: ['Bíceps', 'Tríceps'],
  core: ['Core'],
  cardio: ['Cardio']
};

function pickSubstitutePool(pool: ExerciseTemplate[], excludeNames: string[]): ExerciseTemplate | null {
  return pool.find(t => !excludeNames.some(n => n.toLowerCase() === t.name.toLowerCase())) || null;
}

export function suggestSubstituteExercise(
  muscleGroup: string,
  excludeNames: string[],
  workoutId: string
): WorkoutExercise | null {
  const target = muscleGroup.toLowerCase();

  // Fase 1: mesmo músculo (ex.: Peito → outro exercício de Peito)
  for (const pool of Object.values(EXERCISE_DB)) {
    const t = pool.find(t => t.muscle.toLowerCase() === target && !excludeNames.some(n => n.toLowerCase() === t.name.toLowerCase()));
    if (t) {
      const ex = mapTemplateToExercise(t, 1, 0);
      ex.workout_id = workoutId;
      return ex;
    }
  }

  // Fase 2: mesmo grupo muscular do treino (família)
  for (const [family, muscles] of Object.entries(MUSCLE_FAMILIES)) {
    if (muscles.some(m => m.toLowerCase() === target)) {
      const t = pickSubstitutePool(EXERCISE_DB[family] || [], excludeNames);
      if (t) {
        const ex = mapTemplateToExercise(t, 1, 0);
        ex.workout_id = workoutId;
        return ex;
      }
      break;
    }
  }

  // Fase 3: qualquer exercício do banco que ainda não esteja na ficha
  for (const pool of Object.values(EXERCISE_DB)) {
    const t = pickSubstitutePool(pool, excludeNames);
    if (t) {
      const ex = mapTemplateToExercise(t, 1, 0);
      ex.workout_id = workoutId;
      return ex;
    }
  }

  return null;
}

export function enrichExerciseFromTemplate(ex: WorkoutExercise): WorkoutExercise {
  for (const group of Object.values(EXERCISE_DB)) {
    const t = group.find(g => g.name === ex.name);
    if (t) {
      return {
        ...ex,
        video_url: ex.video_url || t.video_url,
        demo_instructions: ex.demo_instructions || t.demo_instructions
      };
    }
  }
  return ex;
}

function buildExercises(groups: string[], limitations: string[], experience: 'beginner' | 'intermediate' | 'advanced', sessionMinutes: number): WorkoutExercise[] {
  const hasKneeIssue = limitations.some(l => l.toLowerCase().includes('joelho') || l.toLowerCase().includes('knee'));
  const hasBackIssue = limitations.some(l => l.toLowerCase().includes('coluna') || l.toLowerCase().includes('costa') || l.toLowerCase().includes('lombar'));

  const setsMultiplier = experience === 'beginner' ? 0.75 : experience === 'advanced' ? 1.25 : 1;

  const exercises: WorkoutExercise[] = [];
  let order = 0;

  for (const group of groups) {
    const pool = EXERCISE_DB[group] || [];
    const filtered = pool.filter(ex => {
      if (hasKneeIssue && !ex.kneeSafe) return false;
      if (hasBackIssue && (ex.name.includes('Curvada') || ex.name.includes('Remada Curvada'))) return false;
      return true;
    });

    const count = group === 'cardio' ? 1 : experience === 'beginner' ? 2 : 3;
    const selected = filtered.slice(0, count);

    for (const ex of selected) {
      exercises.push(mapTemplateToExercise(ex, setsMultiplier, order++));
    }
  }

  return exercises;
}

// ── Group-shuffled exercise builder for variations ────────────
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildExercisesShuffled(groups: string[], limitations: string[], experience: 'beginner' | 'intermediate' | 'advanced', sessionMinutes: number, seed: number): WorkoutExercise[] {
  const hasKneeIssue = limitations.some(l => l.toLowerCase().includes('joelho') || l.toLowerCase().includes('knee'));
  const hasBackIssue = limitations.some(l => l.toLowerCase().includes('coluna') || l.toLowerCase().includes('costa') || l.toLowerCase().includes('lombar'));

  const setsMultiplier = experience === 'beginner' ? 0.75 : experience === 'advanced' ? 1.25 : 1;

  const exercises: WorkoutExercise[] = [];
  let order = 0;

  for (const group of groups) {
    const pool = EXERCISE_DB[group] || [];
    const filtered = pool.filter(ex => {
      if (hasKneeIssue && !ex.kneeSafe) return false;
      if (hasBackIssue && (ex.name.includes('Curvada') || ex.name.includes('Remada Curvada'))) return false;
      return true;
    });

    const count = group === 'cardio' ? 1 : experience === 'beginner' ? 2 : 3;
    const shuffled = shuffleWithSeed(filtered, seed + order);
    const selected = shuffled.slice(0, count);

    for (const ex of selected) {
      exercises.push(mapTemplateToExercise(ex, setsMultiplier, order++));
    }
  }

  return exercises;
}

export const OBJECTIVE_NAMES: Record<string, string> = {
  lose_weight: 'Emagrecimento',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistência',
  health: 'Saúde'
};

const DIFF_NAMES: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado'
};

const CATEGORY_MAP: Record<string, string> = {
  chest: 'Push', back: 'Pull', shoulders: 'Push', legs: 'Legs', arms: 'Pull', core: 'Full Body', cardio: 'Cardio'
};

const GROUP_MAP: Record<string, string[][]> = {
  2: [['chest', 'back'], ['legs', 'cardio']],
  3: [['chest', 'shoulders'], ['back', 'arms'], ['legs', 'cardio']],
  4: [['chest', 'arms'], ['back', 'shoulders'], ['legs', 'core'], ['cardio', 'core']],
  5: [['chest', 'core'], ['back', 'arms'], ['legs'], ['shoulders', 'core'], ['cardio', 'arms']],
  6: [['chest'], ['back'], ['legs'], ['shoulders', 'arms'], ['legs', 'core'], ['cardio', 'core']]
};

function buildWorkoutResult(
  goal: WorkoutGoal,
  profile: Profile,
  variationIndex: number,
  suffix: string,
  dayGroupsOverride?: string[][]
): { workout: Omit<Workout, 'id'>; exercises: WorkoutExercise[]; description: string } {
  const daysToUse = Math.max(2, Math.min(6, goal.daysPerWeek));
  const dayGroups = dayGroupsOverride || GROUP_MAP[daysToUse] || GROUP_MAP[3];

  const primaryObjective = goal.objectives?.[0] || goal.objective;
  const allObjectiveNames = (goal.objectives || [goal.objective]).map(o => OBJECTIVE_NAMES[o] || o);
  const objectiveLabel = allObjectiveNames.length > 1
    ? allObjectiveNames.join(' + ')
    : allObjectiveNames[0];

  const primaryGroups = dayGroups[variationIndex % dayGroups.length] || dayGroups[0] || ['chest'];
  const category = (CATEGORY_MAP[primaryGroups[0]] || 'Full Body') as any;

  const exercises = buildExercisesShuffled(primaryGroups, goal.limitations, goal.experience, goal.sessionMinutes, variationIndex * 1000 + 42);

  // Cardio: garante um exercício de cardio para objetivos de emagrecimento,
  // resistência ou saúde quando o treino ainda não incluiu nenhum.
  const wantsCardio = primaryObjective === 'lose_weight' || primaryObjective === 'endurance' || primaryObjective === 'health';
  if (wantsCardio && !exercises.some(ex => ex.exercise_type === 'cardio')) {
    const hasKneeIssue = goal.limitations.some(l => l.toLowerCase().includes('joelho') || l.toLowerCase().includes('knee'));
    const cardioPool = EXERCISE_DB.cardio.filter(ex => !hasKneeIssue || ex.kneeSafe);
    const picked = cardioPool[variationIndex % cardioPool.length] || cardioPool[0];
    if (picked) exercises.push(mapTemplateToExercise(picked, 1, exercises.length));
  }

  const totalExercises = exercises.length;
  const estimatedDuration = exercises.reduce((acc, ex) => acc + (ex.sets * 3) + (ex.rest_time_seconds / 60), 0);

  const limitationsText = goal.limitations.length > 0
    ? `\n\n**Restrições consideradas:** ${goal.limitations.join(', ')}`
    : '';

  const description = `Treino gerado automaticamente pelo Coach IA.\n\n**Objetivo:** ${objectiveLabel}${suffix ? `\n**Variação:** ${suffix}` : ''}\n**Nível:** ${DIFF_NAMES[goal.experience]}\n**Frequência:** ${daysToUse}x por semana\n**Sessão:** ~${Math.round(estimatedDuration)} min${limitationsText}\n\n**Exercícios (${totalExercises}):**\n${exercises.map((ex, i) => `${i + 1}. ${ex.name} (${ex.sets}x${ex.reps_target})`).join('\n')}`;

  return {
    workout: {
      profile_id: profile.id,
      title: `Treino ${objectiveLabel}${suffix ? ` - ${suffix}` : ''} - ${DIFF_NAMES[goal.experience]}`,
      subtitle: `${daysToUse}x por semana · ~${Math.round(estimatedDuration)} min`,
      category,
      day_of_week: [],
      estimated_duration_min: Math.round(estimatedDuration),
      difficulty: goal.experience === 'beginner' ? 'iniciante' : goal.experience === 'advanced' ? 'avancado' : 'intermediary',
      ai_generated: true,
      is_active: true,
      notes: description
    },
    exercises,
    description
  };
}

export function generateWorkout(goal: WorkoutGoal, profile: Profile): { workout: Omit<Workout, 'id'>; exercises: WorkoutExercise[]; description: string } {
  return buildWorkoutResult(goal, profile, 0, '');
}

export function generateVariation(goal: WorkoutGoal, profile: Profile, variationIndex: number): { workout: Omit<Workout, 'id'>; exercises: WorkoutExercise[]; description: string } {
  const suffix = `Variação ${variationIndex + 1}`;
  return buildWorkoutResult(goal, profile, variationIndex, suffix);
}