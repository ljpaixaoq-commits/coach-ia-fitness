import { Profile, Workout, WorkoutExercise, InjuryPainLog, HealthMetric, AIDailySummary } from '../types';

export function getDynamicGreeting(name: string): { greeting: string; period: string } {
  const hour = new Date().getHours();
  let prefix = 'Bom dia';
  let period = 'manhã';

  if (hour >= 12 && hour < 18) {
    prefix = 'Boa tarde';
    period = 'tarde';
  } else if (hour >= 18 || hour < 5) {
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
  intent: 'energy_low' | 'injury_pain' | 'workout_too_heavy' | 'low_sleep' | 'nutrition_advice' | 'general';
  suggestedActions?: {
    action: string;
    label: string;
    details?: string;
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
  injuryLogs: InjuryPainLog[] = []
): AICoachResponse {
  const lower = prompt.toLowerCase();
  const name = profile.nickname || profile.name;
  const { greeting } = getDynamicGreeting(name);
  const kneeLog = injuryLogs.find(i => i.body_part.toLowerCase().includes('joelho'));

  if (lower.includes('sem energia') || lower.includes('pouca energia') || lower.includes('cansado') || lower.includes('fadiga')) {
    return {
      intent: 'energy_low',
      message: `${greeting} Compreendo como você se sente. Treinar em dias de menor disposição faz parte do processo, mas adaptamos o treino estrategicamente:\n\n1. **Redução de Volume:** Reduza 1 série de cada exercício hoje e foque em 8-10 repetições com cadência controlada.\n2. **Descanso entre séries:** Aumente o descanso para 90-120 segundos no cronômetro.\n3. **Hidratação:** Beba 500ml de água gelada antes de começar.\n4. **Mistura Pré-Treino:** Tome sua dose personalizada 30 minutos antes para ativação neural.\n5. **Se a energia estiver abaixo de 4/10:** Faça apenas 20 min de esteira leve e mobilidade.`,
      suggestedActions: [
        { action: 'reduce_load', label: '📉 Reduzir Cargas em 20%', details: 'Ajusta automaticamente as cargas sugeridas para hoje.' },
        { action: 'swap_cardio', label: '🚶 Trocar por Cardio Leve & Mobilidade', details: 'Converte a sessão em recuperação ativa.' },
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
        { action: 'swap_knee_safe', label: '🛡️ Aplicar Ficha Knee-Safe (Sem impacto)', details: 'Substitui exercícios de impacto por isometria.' },
        { action: 'log_pain', label: '📝 Atualizar Nível de Dor no Registro', details: 'Registra a dor de hoje no histórico de saúde.' }
      ]
    };
  }

  if (lower.includes('pesado') || lower.includes('muito pesado') || lower.includes('dolorido') || lower.includes('dor muscular')) {
    return {
      intent: 'workout_too_heavy',
      message: `Se a sessão foi muito intensa, nosso foco é **Recuperação e Supercompensação Muscular**:\n\n1. **Nutrição:** Aumente a ingestão de carboidratos complexos (arroz, batata, aveia) na próxima refeição para repor glicogênio e garanta 35-40g de proteína.\n2. **Eletrólitos & Água:** Beba 750ml de água nas próximas duas horas.\n3. **Sono:** Durma pelo menos 7h30 a 8h esta noite para pico de síntese proteica.\n4. **Amanhã:** Programe descanso ou treino de grupo muscular não sinérgico.`,
      suggestedActions: [
        { action: 'add_protein_snack', label: '🍗 Registrar Refeição Pós-Treino', details: 'Adicionar shake ou refeição de recuperação.' },
        { action: 'set_rest_day', label: '🛌 Marcar Amanhã como Descanso', details: 'Ajusta o cronograma semanal.' }
      ]
    };
  }

  if (lower.includes('dormi') || lower.includes('horas') || lower.includes('sono') || lower.includes('insônia')) {
    return {
      intent: 'low_sleep',
      message: `Noites com pouco sono afetam a coordenação neural e elevam o cortisol. Recomendações para hoje:\n\n1. **Sem Recordes de Carga (PRs):** Treine com 70% a 75% da sua carga normal, deixando 2 repetições em reserva (RIR 2).\n2. **Técnica:** Mantenha postura impecável em todos os movimentos.\n3. **Cafeína Consciente:** Tome a mistura pré-treino somente até às 16h para não prejudicar o sono de hoje.\n4. **Hidratação:** Redobre a ingestão de líquidos durante todo o dia.`,
      suggestedActions: [
        { action: 'safety_mode', label: '⚙️ Ativar Modo Treino Seguro', details: 'Prioriza cadência e evita falha excêntrica.' },
        { action: 'log_sleep', label: '🌙 Registrar Horas de Sono', details: 'Atualiza o registro de saúde.' }
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

export interface WorkoutGoal {
  objective: 'lose_weight' | 'hypertrophy' | 'endurance' | 'health';
  limitations: string[];
  daysPerWeek: number;
  sessionMinutes: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
}

const EXERCISE_DB: Record<string, { name: string; muscle: string; type: 'strength' | 'cardio' | 'isometric'; sets: number; reps: string; rest: number; kneeSafe: boolean }[]> = {
  chest: [
    { name: 'Supino Reto com Barra', muscle: 'Peito', type: 'strength', sets: 4, reps: '8-12', rest: 90, kneeSafe: true },
    { name: 'Supino Inclinado com Halteres', muscle: 'Peito', type: 'strength', sets: 4, reps: '10-12', rest: 90, kneeSafe: true },
    { name: 'Crucifixo na Máquina', muscle: 'Peito', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Crossover', muscle: 'Peito', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Flexão de Braços', muscle: 'Peito', type: 'strength', sets: 3, reps: '10-15', rest: 60, kneeSafe: true }
  ],
  back: [
    { name: 'Puxada Frontal', muscle: 'Costas', type: 'strength', sets: 4, reps: '10-12', rest: 90, kneeSafe: true },
    { name: 'Remada Curvada', muscle: 'Costas', type: 'strength', sets: 4, reps: '8-12', rest: 90, kneeSafe: true },
    { name: 'Remada Unilateral', muscle: 'Costas', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true },
    { name: 'Pulldown', muscle: 'Costas', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Encolhimento (Trapézio)', muscle: 'Costas', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true }
  ],
  shoulders: [
    { name: 'Desenvolvimento com Halteres', muscle: 'Ombros', type: 'strength', sets: 4, reps: '8-12', rest: 90, kneeSafe: true },
    { name: 'Elevação Lateral', muscle: 'Ombros', type: 'strength', sets: 4, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Elevação Frontal', muscle: 'Ombros', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Face Pull', muscle: 'Ombros', type: 'strength', sets: 3, reps: '15-20', rest: 60, kneeSafe: true },
    { name: 'Crucifixo Inverso', muscle: 'Ombros', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true }
  ],
  legs: [
    { name: 'Agachamento Livre', muscle: 'Pernas', type: 'strength', sets: 4, reps: '8-12', rest: 120, kneeSafe: false },
    { name: 'Leg Press 45°', muscle: 'Pernas', type: 'strength', sets: 4, reps: '10-12', rest: 90, kneeSafe: false },
    { name: 'Cadeira Extensora', muscle: 'Quadríceps', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Mesa Flexora', muscle: 'Posterior', type: 'strength', sets: 4, reps: '10-12', rest: 60, kneeSafe: true },
    { name: 'Panturrilha em Pé', muscle: 'Panturrilha', type: 'strength', sets: 4, reps: '15-20', rest: 45, kneeSafe: true },
    { name: 'Elevação Pélvica', muscle: 'Glúteos', type: 'strength', sets: 4, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Isometria de Quadríceps', muscle: 'Quadríceps', type: 'isometric', sets: 3, reps: '45s', rest: 45, kneeSafe: true },
    { name: 'Avanço com Halteres', muscle: 'Pernas', type: 'strength', sets: 3, reps: '10 cada', rest: 60, kneeSafe: false }
  ],
  arms: [
    { name: 'Rosca Direta com Barra', muscle: 'Bíceps', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true },
    { name: 'Rosca Alternada', muscle: 'Bíceps', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true },
    { name: 'Tríceps Pulley', muscle: 'Tríceps', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true },
    { name: 'Tríceps Testa', muscle: 'Tríceps', type: 'strength', sets: 3, reps: '10-12', rest: 60, kneeSafe: true },
    { name: 'Mergulho entre Bancos', muscle: 'Tríceps', type: 'strength', sets: 3, reps: '12-15', rest: 60, kneeSafe: true }
  ],
  core: [
    { name: 'Prancha Frontal', muscle: 'Core', type: 'isometric', sets: 3, reps: '45s', rest: 45, kneeSafe: true },
    { name: 'Abdominal Crunch', muscle: 'Core', type: 'strength', sets: 4, reps: '15-20', rest: 45, kneeSafe: true },
    { name: 'Elevação de Pernas', muscle: 'Core', type: 'strength', sets: 3, reps: '12-15', rest: 45, kneeSafe: true },
    { name: 'Russian Twist', muscle: 'Core', type: 'strength', sets: 3, reps: '20 total', rest: 45, kneeSafe: true },
    { name: 'Prancha Lateral', muscle: 'Core', type: 'isometric', sets: 3, reps: '30s cada', rest: 45, kneeSafe: true }
  ],
  cardio: [
    { name: 'Esteira (Caminhada/Rotação)', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '20 min', rest: 0, kneeSafe: false },
    { name: 'Bicicleta Ergométrica', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '15 min', rest: 0, kneeSafe: true },
    { name: 'Elíptico', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '15 min', rest: 0, kneeSafe: false },
    { name: 'Remador', muscle: 'Cardio', type: 'cardio', sets: 1, reps: '10 min', rest: 0, kneeSafe: true }
  ]
};

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
      const sets = Math.round(ex.sets * setsMultiplier);
      exercises.push({
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
        order_index: order++,
        completed: false,
        sets_data: Array.from({ length: sets }, (_, i) => ({
          set_number: i + 1,
          reps_target: ex.reps,
          weight_kg: 0,
          completed: false
        }))
      });
    }
  }

  return exercises;
}

export function generateWorkout(goal: WorkoutGoal, profile: Profile): { workout: Omit<Workout, 'id'>; exercises: WorkoutExercise[]; description: string } {
  const groupMap: Record<string, string[][]> = {
    2: [['chest', 'back'], ['legs', 'core']],
    3: [['chest', 'shoulders'], ['back', 'arms'], ['legs', 'core']],
    4: [['chest', 'arms'], ['back', 'shoulders'], ['legs', 'core'], ['cardio', 'core']],
    5: [['chest', 'core'], ['back', 'arms'], ['legs'], ['shoulders', 'core'], ['cardio', 'arms']],
    6: [['chest'], ['back'], ['legs'], ['shoulders', 'arms'], ['legs', 'core'], ['cardio', 'core']]
  };

  const daysToUse = Math.max(2, Math.min(6, goal.daysPerWeek));
  const dayGroups = groupMap[daysToUse] || groupMap[3];

  const categoryMap: Record<string, string> = {
    chest: 'Push', back: 'Pull', shoulders: 'Push', legs: 'Legs', arms: 'Pull', core: 'Full Body', cardio: 'Cardio'
  };

  const objectiveNames: Record<string, string> = {
    lose_weight: 'Emagrecimento',
    hypertrophy: 'Hipertrofia',
    endurance: 'Resistência',
    health: 'Saúde'
  };

  const diffNames: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado'
  };

  const primaryGroups = dayGroups[0] || ['chest'];
  const category = (categoryMap[primaryGroups[0]] || 'Full Body') as any;

  const exercises = buildExercises(primaryGroups, goal.limitations, goal.experience, goal.sessionMinutes);

  const totalExercises = exercises.length;
  const estimatedDuration = exercises.reduce((acc, ex) => acc + (ex.sets * 3) + (ex.rest_time_seconds / 60), 0);

  const limitationsText = goal.limitations.length > 0
    ? `\n\n**Restrições consideradas:** ${goal.limitations.join(', ')}`
    : '';

  const description = `Treino gerado automaticamente pelo Coach IA.\n\n**Objetivo:** ${objectiveNames[goal.objective]}\n**Nível:** ${diffNames[goal.experience]}\n**Frequência:** ${daysToUse}x por semana\n**Sessão:** ~${Math.round(estimatedDuration)} min${limitationsText}\n\n**Exercícios (${totalExercises}):**\n${exercises.map((ex, i) => `${i + 1}. ${ex.name} (${ex.sets}x${ex.reps_target})`).join('\n')}`;

  return {
    workout: {
      profile_id: profile.id,
      title: `Treino ${objectiveNames[goal.objective]} - ${diffNames[goal.experience]}`,
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