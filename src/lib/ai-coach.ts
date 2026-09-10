import { Profile, Workout, InjuryPainLog, HealthMetric, AIDailySummary } from '../types';

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