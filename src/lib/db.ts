import { supabase, isSupabaseConfigured } from './supabase';
import { hashPassword, verifyPassword, onlyDigits, isValidCPF } from './auth';
import { compressImageFile } from './image';
import {
  Profile,
  Workout,
  WorkoutExercise,
  WorkoutLog,
  Meal,
  MealItem,
  WaterLog,
  Supplement,
  HealthMetric,
  InjuryPainLog,
  EvolutionPhoto,
  Goal,
  AICoachMessage,
  UserAccount
} from '../types';

export interface AllData {
  profiles: Profile[];
  workouts: Workout[];
  workoutLogs: WorkoutLog[];
  meals: Meal[];
  waterLogs: WaterLog[];
  supplements: Supplement[];
  healthMetrics: HealthMetric[];
  injuries: InjuryPainLog[];
  photos: EvolutionPhoto[];
  goals: Goal[];
  messages: AICoachMessage[];
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ── Mapeadores: linha do banco (colunas em português) -> objetos internos ──
function mapProfile(p: any): Profile {
  return {
    id: p.id,
    name: p.nome,
    nickname: p.apelido,
    email: p.email,
    phone: p.telefone,
    cpf: p.cpf,
    birth_date: p.data_nascimento,
    avatar_url: p.url_avatar,
    role: p.papel,
    gender: p.genero,
    age: p.idade,
    height: p.altura,
    current_weight: p.peso_atual,
    target_weight: p.peso_objetivo,
    body_fat_percentage: p.percentual_gordura,
    muscle_mass_kg: p.massa_muscular_kg,
    activity_level: p.nivel_atividade,
    fitness_goal: p.objetivo_fitness,
    gym_name: p.nome_academia,
    preferred_training_time: p.horario_preferido_treino,
    daily_water_target_ml: p.meta_agua_diaria_ml,
    daily_calorie_target: p.meta_calorias_diaria,
    daily_protein_target_g: p.meta_proteina_diaria_g,
    daily_carb_target_g: p.meta_carboidrato_diaria_g,
    daily_fat_target_g: p.meta_gordura_diaria_g
  };
}

function mapWorkoutExercise(ex: any, setsData: any): WorkoutExercise {
  return {
    id: ex.id,
    workout_id: ex.treino_id,
    name: ex.nome,
    muscle_group: ex.grupo_muscular,
    exercise_type: ex.tipo_exercicio || 'strength',
    sets: ex.series,
    reps_target: ex.repeticoes_alvo,
    default_weight_kg: ex.peso_padrao_kg || 0,
    duration_minutes: ex.duracao_minutos,
    rest_time_seconds: ex.descanso_segundos || 90,
    video_url: ex.url_video,
    video_gif_url: ex.url_video_gif,
    demo_instructions: ex.instrucoes_demonstracao,
    order_index: ex.ordem || 0,
    completed: ex.concluido ?? false,
    sets_data: setsData
  };
}

function parseExerciseSets(ex: any): any {
  let setsData = Array.isArray(ex.dados_series)
    ? ex.dados_series
    : typeof ex.dados_series === 'string'
      ? safeJsonParse(ex.dados_series, [])
      : null;

  if (!setsData || setsData.length === 0) {
    const setCount = Math.max(1, ex.series || 0);
    setsData = Array.from({ length: setCount }, (_, i) => ({
      set_number: i + 1,
      reps_target: ex.repeticoes_alvo || '',
      weight_kg: ex.peso_padrao_kg || 0,
      completed: false
    }));
  }

  return setsData;
}

function mapWorkout(w: any, exercises: WorkoutExercise[]): Workout {
  return {
    id: w.id,
    profile_id: w.perfil_id,
    title: w.titulo,
    subtitle: w.subtitulo,
    category: w.categoria,
    day_of_week: Array.isArray(w.dias_da_semana) ? w.dias_da_semana : [],
    estimated_duration_min: w.duracao_estimada_min,
    difficulty: w.dificuldade,
    ai_generated: w.gerado_por_ia,
    is_active: w.ativo,
    is_completed: w.concluido ?? false,
    last_completed_at: w.ultima_conclusao_em,
    notes: w.anotacoes,
    exercises
  };
}

function mapWorkoutLog(l: any): WorkoutLog {
  return {
    id: l.id,
    profile_id: l.perfil_id,
    workout_id: l.treino_id,
    workout_title: l.titulo_treino,
    started_at: l.iniciado_em,
    completed_at: l.concluido_em,
    duration_seconds: l.duracao_segundos || 0,
    total_volume_kg: l.volume_total_kg || 0,
    calories_burned: l.calorias_queimadas,
    rpe_effort: l.esforco_rpe,
    user_feedback: l.feedback_usuario,
    ai_feedback: l.feedback_ia,
    sets: []
  };
}

function mapMealItem(item: any): MealItem {
  return {
    id: item.id,
    meal_id: item.refeicao_id,
    food_name: item.nome_alimento,
    portion_g: item.porcao_g,
    calories: item.calorias,
    protein_g: item.proteina_g,
    carbs_g: item.carboidratos_g,
    fats_g: item.gorduras_g
  };
}

function mapMeal(m: any, items: MealItem[]): Meal {
  return {
    id: m.id,
    profile_id: m.perfil_id,
    meal_type: m.tipo_refeicao,
    title: m.titulo,
    consumed_at: m.consumida_em,
    total_calories: m.total_calorias,
    total_protein_g: m.total_proteina_g,
    total_carbs_g: m.total_carboidratos_g,
    total_fats_g: m.total_gorduras_g,
    notes: m.anotacoes,
    items
  };
}

function mapWaterLog(w: any): WaterLog {
  return {
    id: w.id,
    profile_id: w.perfil_id,
    amount_ml: w.quantidade_ml,
    logged_at: w.registrado_em
  };
}

function mapSupplement(s: any): Supplement {
  return {
    id: s.id,
    profile_id: s.perfil_id,
    name: s.nome,
    is_custom_blend: s.e_mistura_personalizada || false,
    dosage: s.dosagem,
    recipe_formula: s.formula_receita,
    recommended_time: s.horario_recomendado,
    current_stock_doses: s.estoque_atual_doses || 30,
    min_stock_alert: s.alerta_estoque_minimo || 7,
    unit: s.unidade || 'doses',
    notes: s.anotacoes,
    is_active: s.ativo !== false
  };
}

function mapHealthMetric(h: any): HealthMetric {
  return {
    id: h.id,
    profile_id: h.perfil_id,
    measured_at: h.medido_em,
    weight_kg: h.peso_kg,
    bmi: h.imc,
    body_fat_pct: h.percentual_gordura,
    muscle_mass_kg: h.massa_muscular_kg,
    systolic_bp: h.pressao_sistolica,
    diastolic_bp: h.pressao_diastolica,
    heart_rate_bpm: h.frequencia_cardiaca_bpm,
    blood_glucose_mg_dl: h.glicemia_mg_dl,
    sleep_hours: h.horas_sono,
    sleep_quality: h.qualidade_sono,
    energy_level: h.nivel_energia,
    chest_cm: h.peito_cm,
    waist_cm: h.cintura_cm,
    abdomen_cm: h.abdome_cm,
    hips_cm: h.quadril_cm,
    right_arm_cm: h.braco_direito_cm,
    left_arm_cm: h.braco_esquerdo_cm,
    right_thigh_cm: h.coxa_direita_cm,
    left_thigh_cm: h.coxa_esquerda_cm,
    notes: h.anotacoes
  };
}

function mapInjury(i: any): InjuryPainLog {
  return {
    id: i.id,
    profile_id: i.perfil_id,
    body_part: i.parte_corpo,
    pain_level: i.nivel_dor,
    status: i.status || 'monitoring',
    injury_date: i.data_lesao,
    symptoms: i.sintomas || '',
    restricted_exercises: Array.isArray(i.exercicios_restritos) ? i.exercicios_restritos : [],
    recommended_exercises: Array.isArray(i.exercicios_recomendados) ? i.exercicios_recomendados : [],
    treatment_notes: i.anotacoes_tratamento,
    logged_at: i.registrado_em
  };
}

function mapPhoto(p: any): EvolutionPhoto {
  return {
    id: p.id,
    profile_id: p.perfil_id,
    photo_type: p.tipo_foto,
    photo_url: p.url_foto,
    weight_kg: p.peso_kg,
    body_fat_pct: p.percentual_gordura,
    taken_at: p.tirada_em,
    notes: p.anotacoes
  };
}

function mapGoal(g: any): Goal {
  return {
    id: g.id,
    profile_id: g.perfil_id,
    title: g.titulo,
    category: g.categoria,
    current_value: g.valor_atual,
    target_value: g.valor_objetivo,
    unit: g.unidade,
    deadline: g.prazo,
    status: g.status || 'in_progress'
  };
}

function mapMessage(m: any): AICoachMessage {
  return {
    id: m.id,
    profile_id: m.perfil_id,
    sender: m.remetente,
    message: m.mensagem,
    intent_type: m.tipo_intencao,
    suggested_actions: m.acoes_sugeridas,
    created_at: m.criado_em
  };
}

function mapAccount(a: any): UserAccount {
  return {
    id: a.id,
    profile_id: a.perfil_id,
    username: a.nome_usuario,
    password_hash: a.hash_senha,
    role: a.papel,
    is_active: a.ativo,
    access_expires_at: a.acesso_expira_em,
    access_days: a.dias_acesso,
    last_login_at: a.ultimo_login_em,
    created_at: a.criado_em,
    updated_at: a.atualizado_em
  };
}

// ── Mapeadores: objetos internos -> colunas do banco (português) ──
function toProfileColumns(p: Profile): Record<string, any> {
  return {
    id: p.id,
    nome: p.name,
    apelido: p.nickname,
    email: p.email,
    telefone: p.phone,
    cpf: p.cpf,
    data_nascimento: p.birth_date,
    url_avatar: p.avatar_url,
    papel: p.role,
    genero: p.gender,
    idade: p.age,
    altura: p.height,
    peso_atual: p.current_weight,
    peso_objetivo: p.target_weight,
    percentual_gordura: p.body_fat_percentage,
    massa_muscular_kg: p.muscle_mass_kg,
    nivel_atividade: p.activity_level,
    objetivo_fitness: p.fitness_goal,
    nome_academia: p.gym_name,
    horario_preferido_treino: p.preferred_training_time,
    meta_agua_diaria_ml: p.daily_water_target_ml,
    meta_calorias_diaria: p.daily_calorie_target,
    meta_proteina_diaria_g: p.daily_protein_target_g,
    meta_carboidrato_diaria_g: p.daily_carb_target_g,
    meta_gordura_diaria_g: p.daily_fat_target_g
  };
}

function toWorkoutColumns(w: Workout): Record<string, any> {
  return {
    id: w.id,
    perfil_id: w.profile_id,
    titulo: w.title,
    subtitulo: w.subtitle,
    categoria: w.category,
    dias_da_semana: w.day_of_week || [],
    duracao_estimada_min: w.estimated_duration_min,
    dificuldade: w.difficulty || 'intermediary',
    gerado_por_ia: w.ai_generated ?? false,
    ativo: w.is_active ?? true,
    concluido: w.is_completed ?? false,
    ultima_conclusao_em: w.last_completed_at ?? null,
    anotacoes: w.notes
  };
}

function toWorkoutExerciseColumns(ex: WorkoutExercise): Record<string, any> {
  return {
    id: ex.id,
    treino_id: ex.workout_id,
    nome: ex.name,
    grupo_muscular: ex.muscle_group,
    tipo_exercicio: ex.exercise_type || 'strength',
    series: ex.sets,
    repeticoes_alvo: ex.reps_target,
    peso_padrao_kg: ex.default_weight_kg,
    duracao_minutos: ex.duration_minutes,
    descanso_segundos: ex.rest_time_seconds,
    url_video: ex.video_url,
    url_video_gif: ex.video_gif_url,
    instrucoes_demonstracao: ex.demo_instructions,
    ordem: ex.order_index,
    concluido: ex.completed ?? false,
    dados_series: ex.sets_data ?? null
  };
}

function toWorkoutLogColumns(l: WorkoutLog): Record<string, any> {
  return {
    id: l.id,
    perfil_id: l.profile_id,
    treino_id: l.workout_id,
    titulo_treino: l.workout_title,
    iniciado_em: l.started_at,
    concluido_em: l.completed_at,
    duracao_segundos: l.duration_seconds,
    volume_total_kg: l.total_volume_kg,
    calorias_queimadas: l.calories_burned,
    esforco_rpe: l.rpe_effort,
    feedback_usuario: l.user_feedback,
    feedback_ia: l.ai_feedback
  };
}

function toMealColumns(m: Meal): Record<string, any> {
  return {
    id: m.id,
    perfil_id: m.profile_id,
    tipo_refeicao: m.meal_type,
    titulo: m.title,
    consumida_em: m.consumed_at,
    total_calorias: m.total_calories,
    total_proteina_g: m.total_protein_g,
    total_carboidratos_g: m.total_carbs_g,
    total_gorduras_g: m.total_fats_g,
    anotacoes: m.notes
  };
}

function toMealItemColumns(item: MealItem): Record<string, any> {
  return {
    id: item.id,
    refeicao_id: item.meal_id,
    nome_alimento: item.food_name,
    porcao_g: item.portion_g,
    calorias: item.calories,
    proteina_g: item.protein_g,
    carboidratos_g: item.carbs_g,
    gorduras_g: item.fats_g
  };
}

function toWaterLogColumns(w: WaterLog): Record<string, any> {
  return {
    id: w.id,
    perfil_id: w.profile_id,
    quantidade_ml: w.amount_ml,
    registrado_em: w.logged_at
  };
}

function toSupplementColumns(s: Supplement): Record<string, any> {
  return {
    id: s.id,
    perfil_id: s.profile_id,
    nome: s.name,
    e_mistura_personalizada: s.is_custom_blend || false,
    dosagem: s.dosage,
    formula_receita: s.recipe_formula,
    horario_recomendado: s.recommended_time,
    estoque_atual_doses: s.current_stock_doses,
    alerta_estoque_minimo: s.min_stock_alert,
    unidade: s.unit,
    anotacoes: s.notes,
    ativo: s.is_active
  };
}

function toHealthMetricColumns(h: HealthMetric): Record<string, any> {
  return {
    id: h.id,
    perfil_id: h.profile_id,
    medido_em: h.measured_at,
    peso_kg: h.weight_kg,
    imc: h.bmi,
    percentual_gordura: h.body_fat_pct,
    massa_muscular_kg: h.muscle_mass_kg,
    pressao_sistolica: h.systolic_bp,
    pressao_diastolica: h.diastolic_bp,
    frequencia_cardiaca_bpm: h.heart_rate_bpm,
    glicemia_mg_dl: h.blood_glucose_mg_dl,
    horas_sono: h.sleep_hours,
    qualidade_sono: h.sleep_quality,
    nivel_energia: h.energy_level,
    peito_cm: h.chest_cm,
    cintura_cm: h.waist_cm,
    abdome_cm: h.abdomen_cm,
    quadril_cm: h.hips_cm,
    braco_direito_cm: h.right_arm_cm,
    braco_esquerdo_cm: h.left_arm_cm,
    coxa_direita_cm: h.right_thigh_cm,
    coxa_esquerda_cm: h.left_thigh_cm,
    anotacoes: h.notes
  };
}

function toInjuryColumns(i: InjuryPainLog): Record<string, any> {
  return {
    id: i.id,
    perfil_id: i.profile_id,
    parte_corpo: i.body_part,
    nivel_dor: i.pain_level,
    status: i.status,
    data_lesao: i.injury_date,
    sintomas: i.symptoms,
    exercicios_restritos: i.restricted_exercises,
    exercicios_recomendados: i.recommended_exercises,
    anotacoes_tratamento: i.treatment_notes
  };
}

function toPhotoColumns(p: EvolutionPhoto): Record<string, any> {
  return {
    id: p.id,
    perfil_id: p.profile_id,
    tipo_foto: p.photo_type,
    url_foto: p.photo_url,
    peso_kg: p.weight_kg,
    percentual_gordura: p.body_fat_pct,
    tirada_em: p.taken_at,
    anotacoes: p.notes
  };
}

function toGoalColumns(g: Goal): Record<string, any> {
  return {
    id: g.id,
    perfil_id: g.profile_id,
    titulo: g.title,
    categoria: g.category,
    valor_atual: g.current_value,
    valor_objetivo: g.target_value,
    unidade: g.unit,
    prazo: g.deadline,
    status: g.status
  };
}

function toMessageColumns(m: AICoachMessage): Record<string, any> {
  return {
    id: m.id,
    perfil_id: m.profile_id,
    remetente: m.sender,
    mensagem: m.message,
    tipo_intencao: m.intent_type,
    acoes_sugeridas: m.suggested_actions
  };
}

// ── Load All Data ──────────────────────────────────────────────
export async function loadAllData(): Promise<AllData | null> {
  if (!isSupabaseConfigured()) return null;

  const [
    profilesRes,
    workoutsRes,
    exercisesRes,
    workoutLogsRes,
    mealsRes,
    mealItemsRes,
    waterRes,
    supplementsRes,
    healthRes,
    injuriesRes,
    photosRes,
    goalsRes,
    messagesRes
  ] = await Promise.all([
    supabase.from('perfis').select('*'),
    supabase.from('treinos').select('*'),
    supabase.from('treino_exercicios').select('*'),
    supabase.from('registro_treinos').select('*'),
    supabase.from('refeicoes').select('*'),
    supabase.from('refeicao_itens').select('*'),
    supabase.from('registro_agua').select('*'),
    supabase.from('suplementos').select('*'),
    supabase.from('metricas_saude').select('*'),
    supabase.from('registro_lesoes').select('*'),
    supabase.from('fotos_evolucao').select('*'),
    supabase.from('metas').select('*'),
    supabase.from('coach_mensagens').select('*')
  ]);

  if (profilesRes.error) { console.error('Load profiles:', profilesRes.error); return null; }

  const exercisesByWorkout = new Map<string, WorkoutExercise[]>();
  (exercisesRes.data || []).forEach((ex: any) => {
    if (!exercisesByWorkout.has(ex.treino_id)) exercisesByWorkout.set(ex.treino_id, []);
    exercisesByWorkout.get(ex.treino_id)!.push(mapWorkoutExercise(ex, parseExerciseSets(ex)));
  });

  const itemsByMeal = new Map<string, MealItem[]>();
  (mealItemsRes.data || []).forEach((item: any) => {
    if (!itemsByMeal.has(item.refeicao_id)) itemsByMeal.set(item.refeicao_id, []);
    itemsByMeal.get(item.refeicao_id)!.push(mapMealItem(item));
  });

  const workouts: Workout[] = (workoutsRes.data || []).map((w: any) =>
    mapWorkout(w, (exercisesByWorkout.get(w.id) || []).sort((a, b) => a.order_index - b.order_index))
  );

  const meals: Meal[] = (mealsRes.data || []).map((m: any) => mapMeal(m, itemsByMeal.get(m.id) || []));

  return {
    profiles: (profilesRes.data || []).map(mapProfile),
    workouts,
    workoutLogs: (workoutLogsRes.data || []).map(mapWorkoutLog),
    meals,
    waterLogs: (waterRes.data || []).map(mapWaterLog),
    supplements: (supplementsRes.data || []).map(mapSupplement),
    healthMetrics: (healthRes.data || []).map(mapHealthMetric),
    injuries: (injuriesRes.data || []).map(mapInjury),
    photos: (photosRes.data || []).map(mapPhoto),
    goals: (goalsRes.data || []).map(mapGoal),
    messages: (messagesRes.data || []).map(mapMessage)
  };
}

// ── Seed Initial Data ──────────────────────────────────────────
export async function seedInitialData(data: AllData): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('perfis').upsert(
      data.profiles.map(p => toProfileColumns(p)),
      { onConflict: 'id' }
    );
    if (error) { console.error('Seed profiles:', error); return false; }

    for (const w of data.workouts) {
      await supabase.from('treinos').upsert(toWorkoutColumns(w), { onConflict: 'id' });
      if (w.exercises?.length) {
        await supabase.from('treino_exercicios').upsert(
          w.exercises.map(ex => toWorkoutExerciseColumns(ex)),
          { onConflict: 'id' }
        );
      }
    }

    for (const m of data.meals) {
      await supabase.from('refeicoes').upsert(toMealColumns(m), { onConflict: 'id' });
      if (m.items?.length) {
        await supabase.from('refeicao_itens').upsert(m.items.map(toMealItemColumns), { onConflict: 'id' });
      }
    }

    await supabase.from('suplementos').upsert(data.supplements.map(toSupplementColumns), { onConflict: 'id' });
    await supabase.from('metas').upsert(data.goals.map(toGoalColumns), { onConflict: 'id' });

    if (data.waterLogs.length) {
      await supabase.from('registro_agua').insert(data.waterLogs.map(toWaterLogColumns));
    }
    if (data.healthMetrics.length) {
      await supabase.from('metricas_saude').insert(data.healthMetrics.map(toHealthMetricColumns));
    }
    if (data.injuries.length) {
      await supabase.from('registro_lesoes').insert(data.injuries.map(toInjuryColumns));
    }
    if (data.photos.length) {
      await supabase.from('fotos_evolucao').insert(data.photos.map(toPhotoColumns));
    }
    if (data.messages.length) {
      await supabase.from('coach_mensagens').insert(data.messages.map(toMessageColumns));
    }

    return true;
  } catch (e) {
    console.error('Seed error:', e);
    return false;
  }
}

// ── Generic Upsert Helper ──────────────────────────────────────
async function upsert(table: string, data: Record<string, any>) {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from(table).upsert(data, { onConflict: 'id' });
  if (error) console.error(`Upsert ${table}:`, error);
  return error ?? null;
}

async function insert(table: string, data: Record<string, any> | Record<string, any>[]) {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from(table).insert(data);
  if (error) console.error(`Insert ${table}:`, error);
  return error ?? null;
}

async function remove(table: string, id: string) {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`Delete ${table}:`, error);
  return error ?? null;
}

// ── Profile Sync ───────────────────────────────────────────────
export function syncProfile(p: Profile) {
  return upsert('perfis', toProfileColumns(p));
}

// ── Avatar Storage (Supabase Storage, bucket `avatars`) ────────
export const AVATAR_BUCKET = 'avatars';

export async function uploadAvatar(file: File, profileId: string): Promise<string> {
  if (!isSupabaseConfigured()) return URL.createObjectURL(file);
  const optimized = await compressImageFile(file);
  const ext = (optimized.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${profileId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, optimized, { upsert: true, contentType: optimized.type || 'image/jpeg' });
  if (error) throw new Error('Erro ao enviar foto: ' + error.message);
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function avatarStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length).split('?')[0];
}

export async function deleteAvatar(url: string | null | undefined): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const path = avatarStoragePath(url);
  if (!path) return;
  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

export async function updateProfileAvatarUrl(profileId: string, url: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from('perfis').update({ url_avatar: url }).eq('id', profileId);
  if (error) throw new Error('Erro ao salvar foto: ' + error.message);
}

// ── Workout Sync ───────────────────────────────────────────────
export function syncWorkout(w: Workout) {
  return upsert('treinos', toWorkoutColumns(w));
}

export function syncWorkoutExercise(ex: WorkoutExercise) {
  return upsert('treino_exercicios', toWorkoutExerciseColumns(ex));
}

export function deleteWorkout(id: string) {
  return deleteWorkouts([id]);
}

export async function deleteWorkouts(ids: string[]) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('treino_exercicios')
    .delete()
    .in('treino_id', ids);
  if (error) console.error('Delete treino_exercicios:', error);
  return Promise.all(ids.map((id) => remove('treinos', id)));
}

// ── Workout Log Sync (Histórico de treinos realizados) ────────
export function syncWorkoutLog(log: WorkoutLog) {
  return insert('registro_treinos', toWorkoutLogColumns(log));
}

// ── Meal Sync ──────────────────────────────────────────────────
export function syncMeal(m: Meal) {
  upsert('refeicoes', toMealColumns(m));
}

export function syncMealItem(item: MealItem) {
  upsert('refeicao_itens', toMealItemColumns(item));
}

// ── Water Sync ─────────────────────────────────────────────────
export function syncWaterLog(log: WaterLog) {
  insert('registro_agua', toWaterLogColumns(log));
}

// ── Supplement Sync ────────────────────────────────────────────
export function syncSupplement(s: Supplement) {
  upsert('suplementos', toSupplementColumns(s));
}

// ── Health Metric Sync ─────────────────────────────────────────
export function syncHealthMetric(h: HealthMetric) {
  insert('metricas_saude', toHealthMetricColumns(h));
}

// ── Injury Sync ────────────────────────────────────────────────
export function syncInjury(i: InjuryPainLog) {
  upsert('registro_lesoes', toInjuryColumns(i));
}

// ── Photo Sync ─────────────────────────────────────────────────
export function syncPhoto(p: EvolutionPhoto) {
  insert('fotos_evolucao', toPhotoColumns(p));
}

// ── Goal Sync ──────────────────────────────────────────────────
export function syncGoal(g: Goal) {
  upsert('metas', toGoalColumns(g));
}

// ── AI Message Sync ────────────────────────────────────────────
export function syncMessage(m: AICoachMessage) {
  insert('coach_mensagens', toMessageColumns(m));
}

// ── AUTH ───────────────────────────────────────────────────────

export interface LoginResult {
  account: UserAccount;
  profile: Profile;
}

export async function loginUser(username: string, password: string): Promise<LoginResult> {
  const cpf = onlyDigits(username);
  if (!isValidCPF(cpf)) throw new Error('CPF inválido.');

  const { data: account, error } = await supabase
    .from('contas_usuario')
    .select('*')
    .eq('nome_usuario', cpf)
    .maybeSingle();

  if (error) throw new Error('Erro ao consultar usuário: ' + error.message);
  if (!account) throw new Error('Usuário não encontrado. Verifique o CPF ou faça o cadastro.');

  const ok = await verifyPassword(password, account.hash_senha);
  if (!ok) throw new Error('Senha incorreta.');

  if (!account.ativo) throw new Error('Usuário inativo. Aguarde aprovação do administrador.');

  const today = new Date().toISOString().split('T')[0];
  if (account.acesso_expira_em && account.acesso_expira_em < today) {
    throw new Error('Acesso expirado. Entre em contato com o administrador.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', account.perfil_id)
    .maybeSingle();

  if (profileError || !profile) throw new Error('Perfil vinculado não encontrado.');

  await supabase.from('contas_usuario').update({ ultimo_login_em: new Date().toISOString() }).eq('id', account.id);

  const mappedAccount = mapAccount(account);
  return {
    account: { ...mappedAccount, last_login_at: new Date().toISOString() },
    profile: mapProfile(profile)
  };
}

export interface RegisterInput {
  name: string;
  email?: string;
  cpf: string;
  birthDate: string;
  gender?: string;
  role?: 'member' | 'admin';
  nickname?: string;
  avatarUrl?: string;
  avatarFile?: File | null;
  phone?: string;
}

export async function registerUser(input: RegisterInput, password: string): Promise<string | null> {
  const cpf = onlyDigits(input.cpf);
  if (!isValidCPF(cpf)) throw new Error('CPF inválido.');
  if (!input.name.trim()) throw new Error('Informe o nome.');
  if (!input.nickname?.trim()) throw new Error('Informe o apelido.');
  if (!input.birthDate) throw new Error('Informe a data de nascimento.');
  if (password.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');

  const { data: existing } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('nome_usuario', cpf)
    .maybeSingle();
  if (existing) throw new Error('CPF já cadastrado.');

  const passwordHash = await hashPassword(password);

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .insert({
      nome: input.name.trim(),
      apelido: input.nickname!.trim(),
      email: input.email || null,
      url_avatar: input.avatarUrl || null,
      telefone: input.phone || null,
      cpf,
      data_nascimento: input.birthDate,
      papel: input.role || 'member',
      genero: input.gender || 'other',
      idade: calcAge(input.birthDate),
      altura: 0,
      peso_atual: 0,
      peso_objetivo: 0,
      nivel_atividade: 'moderate',
      objetivo_fitness: 'health',
      meta_agua_diaria_ml: 3000,
      meta_calorias_diaria: 2200,
      meta_proteina_diaria_g: 160,
      meta_carboidrato_diaria_g: 200,
      meta_gordura_diaria_g: 60
    })
    .select()
    .single();

  if (profileError) throw new Error('Erro ao criar perfil: ' + profileError.message);

  const { error } = await supabase.from('contas_usuario').insert({
    perfil_id: profile.id,
    nome_usuario: cpf,
    hash_senha: passwordHash,
    papel: input.role || 'member',
    ativo: false
  });

  if (error) throw new Error('Erro ao criar conta: ' + error.message);

  return profile.id;
}

export async function resetPasswordByCpf(cpf: string, birthDate: string, newPassword: string): Promise<void> {
  const c = onlyDigits(cpf);
  if (!isValidCPF(c)) throw new Error('CPF inválido.');
  if (!birthDate) throw new Error('Informe a data de nascimento.');
  if (newPassword.length < 4) throw new Error('A nova senha deve ter ao menos 4 caracteres.');

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('id')
    .eq('cpf', c)
    .eq('data_nascimento', birthDate)
    .maybeSingle();

  if (profileError) throw new Error('Erro ao consultar dados: ' + profileError.message);
  if (!profile) throw new Error('CPF e data de nascimento não correspondem a nenhum usuário.');

  const { data: account } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('perfil_id', profile.id)
    .maybeSingle();

  if (!account) throw new Error('Usuário não possui conta de acesso registrada.');

  const passwordHash = await hashPassword(newPassword);

  const { error } = await supabase
    .from('contas_usuario')
    .update({ hash_senha: passwordHash, atualizado_em: new Date().toISOString() })
    .eq('id', account.id);

  if (error) throw new Error('Erro ao redefinir senha: ' + error.message);
}

export interface UserWithProfile extends UserAccount {
  profile: Profile | null;
}

export async function listUsers(): Promise<UserWithProfile[]> {
  const { data: accounts, error } = await supabase
    .from('contas_usuario')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) throw new Error('Erro ao listar usuários: ' + error.message);

  const { data: profiles, error: profileError } = await supabase.from('perfis').select('*');
  if (profileError) throw new Error('Erro ao consultar perfis: ' + profileError.message);

  const profileMap = new Map<string, Profile>((profiles || []).map((p: Profile) => [p.id, mapProfile(p)]));

  return (accounts || []).map(a => ({
    ...mapAccount(a),
    profile: profileMap.get(a.perfil_id) || null
  }));
}

export async function setUserActive(accountId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('contas_usuario')
    .update({ ativo: isActive, atualizado_em: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw new Error('Erro ao atualizar usuário: ' + error.message);
}

export async function setUserExpiration(accountId: string, expiresAt: string | null, days?: number): Promise<void> {
  let accessExpiresAt = expiresAt;
  if (days && days > 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    accessExpiresAt = d.toISOString().split('T')[0];
  }
  const { error } = await supabase
    .from('contas_usuario')
    .update({ acesso_expira_em: accessExpiresAt, dias_acesso: days || null, atualizado_em: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw new Error('Erro ao definir expiração: ' + error.message);
}

export async function ensureAdminAccount(cpf: string, birthDate: string, password: string): Promise<void> {
  const c = onlyDigits(cpf);
  if (!isSupabaseConfigured()) return;

  const { data: existingAccount } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('nome_usuario', c)
    .maybeSingle();
  if (existingAccount) return;

  const { data: profiles } = await supabase.from('perfis').select('*').order('criado_em').limit(1);
  const adminProfile = (profiles || [])[0];
  if (!adminProfile) return;

  await supabase
    .from('perfis')
    .update({ cpf: c, data_nascimento: birthDate })
    .eq('id', adminProfile.id);

  const passwordHash = await hashPassword(password);

  await supabase.from('contas_usuario').upsert({
    perfil_id: adminProfile.id,
    nome_usuario: c,
    hash_senha: passwordHash,
    papel: 'admin',
    ativo: true
  });
}

// ── Validate Reset Identity (CPF + birth date) ─────────────────
export async function validateResetIdentity(cpf: string, birthDate: string): Promise<{ account_id: string; profile_name: string }> {
  const c = onlyDigits(cpf);
  if (!isValidCPF(c)) throw new Error('CPF inválido.');
  if (!birthDate) throw new Error('Informe a data de nascimento.');

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('id, nome')
    .eq('cpf', c)
    .eq('data_nascimento', birthDate)
    .maybeSingle();

  if (profileError) throw new Error('Erro ao consultar dados: ' + profileError.message);
  if (!profile) throw new Error('CPF e data de nascimento não correspondem a nenhum usuário.');

  const { data: account } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('perfil_id', profile.id)
    .maybeSingle();

  if (!account) throw new Error('Usuário não possui conta de acesso registrada.');

  return { account_id: account.id, profile_name: profile.nome };
}

// ── Admin: Create User ─────────────────────────────────────────
export async function registerUserAdmin(input: RegisterInput, password: string): Promise<string | null> {
  const cpf = onlyDigits(input.cpf);
  if (!isValidCPF(cpf)) throw new Error('CPF inválido.');
  if (!input.name.trim()) throw new Error('Informe o nome.');
  if (!input.nickname?.trim()) throw new Error('Informe o apelido.');
  if (!input.birthDate) throw new Error('Informe a data de nascimento.');
  if (password.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');

  const { data: existing } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('nome_usuario', cpf)
    .maybeSingle();
  if (existing) throw new Error('CPF já cadastrado.');

  const passwordHash = await hashPassword(password);

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .insert({
      nome: input.name.trim(),
      apelido: input.nickname!.trim(),
      email: input.email || null,
      url_avatar: input.avatarUrl || null,
      telefone: input.phone || null,
      cpf,
      data_nascimento: input.birthDate,
      papel: 'member',
      genero: input.gender || 'other',
      idade: calcAge(input.birthDate),
      altura: 0,
      peso_atual: 0,
      peso_objetivo: 0,
      nivel_atividade: 'moderate',
      objetivo_fitness: 'health',
      meta_agua_diaria_ml: 3000,
      meta_calorias_diaria: 2200,
      meta_proteina_diaria_g: 160,
      meta_carboidrato_diaria_g: 200,
      meta_gordura_diaria_g: 60
    })
    .select()
    .single();

  if (profileError) throw new Error('Erro ao criar perfil: ' + profileError.message);

  const { error } = await supabase.from('contas_usuario').insert({
    perfil_id: profile.id,
    nome_usuario: cpf,
    hash_senha: passwordHash,
    papel: 'member',
    ativo: true
  });

  if (error) throw new Error('Erro ao criar conta: ' + error.message);

  return profile.id;
}

// ── Admin: Update User Profile ─────────────────────────────────
export async function updateUserProfileAdmin(
  accountId: string,
  data: { name?: string; cpf?: string; birth_date?: string; email?: string; gender?: string; nickname?: string; avatar_url?: string }
): Promise<void> {
  // Get the perfil_id from the account
  const { data: account, error: accError } = await supabase
    .from('contas_usuario')
    .select('perfil_id')
    .eq('id', accountId)
    .maybeSingle();

  if (accError || !account) throw new Error('Conta não encontrada.');

  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.nome = data.name.trim();
  if (data.nickname !== undefined) updates.apelido = data.nickname.trim();
  if (data.avatar_url !== undefined) updates.url_avatar = data.avatar_url || null;
  if (data.email !== undefined) updates.email = data.email || null;
  if (data.gender !== undefined) updates.genero = data.gender;
  if (data.birth_date !== undefined) {
    updates.data_nascimento = data.birth_date;
    updates.idade = calcAge(data.birth_date);
  }
  if (data.cpf !== undefined) {
    const c = onlyDigits(data.cpf);
    if (!isValidCPF(c)) throw new Error('CPF inválido.');
    // Check if CPF is already used by another account
    const { data: existingProfile } = await supabase
      .from('perfis')
      .select('id')
      .eq('cpf', c)
      .maybeSingle();
    if (existingProfile && existingProfile.id !== account.perfil_id) {
      throw new Error('CPF já está em uso por outro usuário.');
    }
    updates.cpf = c;
    // Also update the nome_usuario in contas_usuario
    await supabase.from('contas_usuario').update({ nome_usuario: c }).eq('id', accountId);
  }

  if (Object.keys(updates).length === 0) return;

  updates.atualizado_em = new Date().toISOString();

  const { error } = await supabase
    .from('perfis')
    .update(updates)
    .eq('id', account.perfil_id);

  if (error) throw new Error('Erro ao atualizar perfil: ' + error.message);
}

// ── Admin: Update User Password ────────────────────────────────
export async function updateUserPasswordAdmin(accountId: string, newPassword: string): Promise<void> {
  if (newPassword.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');
  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase
    .from('contas_usuario')
    .update({ hash_senha: passwordHash, atualizado_em: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw new Error('Erro ao atualizar senha: ' + error.message);
}

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}