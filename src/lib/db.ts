import { supabase, isSupabaseConfigured } from './supabase';
import { hashPassword, verifyPassword, onlyDigits, isValidCPF } from './auth';
import {
  Profile,
  Workout,
  WorkoutExercise,
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
  meals: Meal[];
  waterLogs: WaterLog[];
  supplements: Supplement[];
  healthMetrics: HealthMetric[];
  injuries: InjuryPainLog[];
  photos: EvolutionPhoto[];
  goals: Goal[];
  messages: AICoachMessage[];
}

// ── Load All Data ──────────────────────────────────────────────
export async function loadAllData(): Promise<AllData | null> {
  if (!isSupabaseConfigured()) return null;

  const [
    profilesRes,
    workoutsRes,
    exercisesRes,
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
    if (!exercisesByWorkout.has(ex.workout_id)) exercisesByWorkout.set(ex.workout_id, []);
    exercisesByWorkout.get(ex.workout_id)!.push({
      id: ex.id,
      workout_id: ex.workout_id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      exercise_type: ex.exercise_type || 'strength',
      sets: ex.sets,
      reps_target: ex.reps_target,
      default_weight_kg: ex.default_weight_kg || 0,
      duration_minutes: ex.duration_minutes,
      rest_time_seconds: ex.rest_time_seconds || 90,
      video_url: ex.video_url,
      video_gif_url: ex.video_gif_url,
      demo_instructions: ex.demo_instructions,
      order_index: ex.order_index || 0,
      completed: ex.is_completed ?? false
    });
  });

  const itemsByMeal = new Map<string, MealItem[]>();
  (mealItemsRes.data || []).forEach((item: any) => {
    if (!itemsByMeal.has(item.meal_id)) itemsByMeal.set(item.meal_id, []);
    itemsByMeal.get(item.meal_id)!.push({
      id: item.id,
      meal_id: item.meal_id,
      food_name: item.food_name,
      portion_g: item.portion_g,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fats_g: item.fats_g
    });
  });

  const workouts: Workout[] = (workoutsRes.data || []).map((w: any) => ({
    ...w,
    is_completed: w.is_completed ?? false,
    day_of_week: Array.isArray(w.day_of_week) ? w.day_of_week : [],
    exercises: (exercisesByWorkout.get(w.id) || []).sort((a, b) => a.order_index - b.order_index)
  }));

  const meals: Meal[] = (mealsRes.data || []).map((m: any) => ({
    ...m,
    items: itemsByMeal.get(m.id) || []
  }));

  return {
    profiles: profilesRes.data || [],
    workouts,
    meals,
    waterLogs: (waterRes.data || []).map((w: any) => ({
      id: w.id,
      profile_id: w.profile_id,
      amount_ml: w.amount_ml,
      logged_at: w.logged_at
    })),
    supplements: (supplementsRes.data || []).map((s: any) => ({
      id: s.id,
      profile_id: s.profile_id,
      name: s.name,
      is_custom_blend: s.is_custom_blend || false,
      dosage: s.dosage,
      recipe_formula: s.recipe_formula,
      recommended_time: s.recommended_time,
      current_stock_doses: s.current_stock_doses || 30,
      min_stock_alert: s.min_stock_alert || 7,
      unit: s.unit || 'doses',
      notes: s.notes,
      is_active: s.is_active !== false
    })),
    healthMetrics: (healthRes.data || []).map((h: any) => ({
      id: h.id,
      profile_id: h.profile_id,
      measured_at: h.measured_at,
      weight_kg: h.weight_kg,
      bmi: h.bmi,
      body_fat_pct: h.body_fat_pct,
      muscle_mass_kg: h.muscle_mass_kg,
      systolic_bp: h.systolic_bp,
      diastolic_bp: h.diastolic_bp,
      heart_rate_bpm: h.heart_rate_bpm,
      blood_glucose_mg_dl: h.blood_glucose_mg_dl,
      sleep_hours: h.sleep_hours,
      sleep_quality: h.sleep_quality,
      energy_level: h.energy_level,
      chest_cm: h.chest_cm,
      waist_cm: h.waist_cm,
      abdomen_cm: h.abdomen_cm,
      hips_cm: h.hips_cm,
      right_arm_cm: h.right_arm_cm,
      left_arm_cm: h.left_arm_cm,
      right_thigh_cm: h.right_thigh_cm,
      left_thigh_cm: h.left_thigh_cm,
      notes: h.notes
    })),
    injuries: (injuriesRes.data || []).map((i: any) => ({
      id: i.id,
      profile_id: i.profile_id,
      body_part: i.body_part,
      pain_level: i.pain_level,
      status: i.status || 'monitoring',
      injury_date: i.injury_date,
      symptoms: i.symptoms || '',
      restricted_exercises: Array.isArray(i.restricted_exercises) ? i.restricted_exercises : [],
      recommended_exercises: Array.isArray(i.recommended_exercises) ? i.recommended_exercises : [],
      treatment_notes: i.treatment_notes,
      logged_at: i.logged_at
    })),
    photos: (photosRes.data || []).map((p: any) => ({
      id: p.id,
      profile_id: p.profile_id,
      photo_type: p.photo_type,
      photo_url: p.photo_url,
      weight_kg: p.weight_kg,
      body_fat_pct: p.body_fat_pct,
      taken_at: p.taken_at,
      notes: p.notes
    })),
    goals: (goalsRes.data || []).map((g: any) => ({
      id: g.id,
      profile_id: g.profile_id,
      title: g.title,
      category: g.category,
      current_value: g.current_value,
      target_value: g.target_value,
      unit: g.unit,
      deadline: g.deadline,
      status: g.status || 'in_progress'
    })),
    messages: (messagesRes.data || []).map((m: any) => ({
      id: m.id,
      profile_id: m.profile_id,
      sender: m.sender,
      message: m.message,
      intent_type: m.intent_type,
      suggested_actions: m.suggested_actions,
      created_at: m.created_at
    }))
  };
}

// ── Seed Initial Data ──────────────────────────────────────────
export async function seedInitialData(data: AllData): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('perfis').upsert(
      data.profiles.map(p => ({ ...p })),
      { onConflict: 'id' }
    );
    if (error) { console.error('Seed profiles:', error); return false; }

    for (const w of data.workouts) {
      const { exercises, ...workoutData } = w;
      await supabase.from('treinos').upsert(workoutData, { onConflict: 'id' });
      if (exercises?.length) {
        await supabase.from('treino_exercicios').upsert(
          exercises.map(ex => {
            const { completed, sets_data, ...exerciseColumns } = ex;
            return {
              ...exerciseColumns,
              exercise_type: ex.exercise_type || 'strength',
              is_completed: completed ?? false
            };
          }),
          { onConflict: 'id' }
        );
      }
    }

    for (const m of data.meals) {
      const { items, ...mealData } = m;
      await supabase.from('refeicoes').upsert(mealData, { onConflict: 'id' });
      if (items?.length) {
        await supabase.from('refeicao_itens').upsert(items, { onConflict: 'id' });
      }
    }

    await supabase.from('suplementos').upsert(data.supplements, { onConflict: 'id' });
    await supabase.from('metas').upsert(data.goals, { onConflict: 'id' });

    if (data.waterLogs.length) {
      await supabase.from('registro_agua').insert(data.waterLogs.map(w => ({
        profile_id: w.profile_id,
        amount_ml: w.amount_ml,
        logged_at: w.logged_at
      })));
    }
    if (data.healthMetrics.length) {
      await supabase.from('metricas_saude').insert(data.healthMetrics);
    }
    if (data.injuries.length) {
      await supabase.from('registro_lesoes').insert(data.injuries);
    }
    if (data.photos.length) {
      await supabase.from('fotos_evolucao').insert(data.photos);
    }
    if (data.messages.length) {
      await supabase.from('coach_mensagens').insert(data.messages);
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
  return upsert('perfis', p);
}

// ── Workout Sync ───────────────────────────────────────────────
export function syncWorkout(w: Workout) {
  const { id, profile_id, title, subtitle, category, day_of_week, estimated_duration_min, difficulty, ai_generated, is_active, is_completed, notes } = w;
  return upsert('treinos', {
    id, profile_id, title, subtitle, category,
    day_of_week: day_of_week || [],
    estimated_duration_min,
    difficulty: difficulty || 'intermediary',
    ai_generated: ai_generated ?? false,
    is_active: is_active ?? true,
    is_completed: is_completed ?? false,
    notes
  });
}

export function syncWorkoutExercise(ex: WorkoutExercise) {
  const { id, workout_id, name, muscle_group, sets, reps_target, default_weight_kg, rest_time_seconds, video_url, video_gif_url, demo_instructions, order_index, completed } = ex;
  return upsert('treino_exercicios', {
    id, workout_id, name, muscle_group, sets, reps_target, default_weight_kg, rest_time_seconds,
    video_url, video_gif_url, demo_instructions, order_index,
    is_completed: completed ?? false
  });
}

export function deleteWorkout(id: string) {
  return remove('treinos', id);
}

export function deleteWorkouts(ids: string[]) {
  return Promise.all(ids.map((id) => remove('treinos', id)));
}

// ── Meal Sync ──────────────────────────────────────────────────
export function syncMeal(m: Meal) {
  const { items, ...data } = m;
  upsert('refeicoes', data);
}

export function syncMealItem(item: MealItem) {
  upsert('refeicao_itens', item);
}

// ── Water Sync ─────────────────────────────────────────────────
export function syncWaterLog(log: WaterLog) {
  insert('registro_agua', { profile_id: log.profile_id, amount_ml: log.amount_ml, logged_at: log.logged_at });
}

// ── Supplement Sync ────────────────────────────────────────────
export function syncSupplement(s: Supplement) {
  upsert('suplementos', s);
}

// ── Health Metric Sync ─────────────────────────────────────────
export function syncHealthMetric(h: HealthMetric) {
  insert('metricas_saude', h);
}

// ── Injury Sync ────────────────────────────────────────────────
export function syncInjury(i: InjuryPainLog) {
  upsert('registro_lesoes', i);
}

// ── Photo Sync ─────────────────────────────────────────────────
export function syncPhoto(p: EvolutionPhoto) {
  insert('fotos_evolucao', p);
}

// ── Goal Sync ──────────────────────────────────────────────────
export function syncGoal(g: Goal) {
  upsert('metas', g);
}

// ── AI Message Sync ────────────────────────────────────────────
export function syncMessage(m: AICoachMessage) {
  insert('coach_mensagens', m);
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
    .eq('username', cpf)
    .maybeSingle();

  if (error) throw new Error('Erro ao consultar usuário: ' + error.message);
  if (!account) throw new Error('Usuário não encontrado. Verifique o CPF ou faça o cadastro.');

  const ok = await verifyPassword(password, account.password_hash);
  if (!ok) throw new Error('Senha incorreta.');

  if (!account.is_active) throw new Error('Usuário inativo. Aguarde aprovação do administrador.');

  const today = new Date().toISOString().split('T')[0];
  if (account.access_expires_at && account.access_expires_at < today) {
    throw new Error('Acesso expirado. Entre em contato com o administrador.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', account.profile_id)
    .maybeSingle();

  if (profileError || !profile) throw new Error('Perfil vinculado não encontrado.');

  await supabase.from('contas_usuario').update({ last_login_at: new Date().toISOString() }).eq('id', account.id);

  return { account: { ...account, last_login_at: new Date().toISOString() }, profile };
}

export interface RegisterInput {
  name: string;
  email?: string;
  cpf: string;
  birthDate: string;
  gender?: string;
  role?: 'admin' | 'member' | 'spouse';
}

export async function registerUser(input: RegisterInput, password: string): Promise<void> {
  const cpf = onlyDigits(input.cpf);
  if (!isValidCPF(cpf)) throw new Error('CPF inválido.');
  if (!input.name.trim()) throw new Error('Informe o nome.');
  if (!input.birthDate) throw new Error('Informe a data de nascimento.');
  if (password.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');

  const { data: existing } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('username', cpf)
    .maybeSingle();
  if (existing) throw new Error('CPF já cadastrado.');

  const passwordHash = await hashPassword(password);

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .insert({
      name: input.name.trim(),
      email: input.email || null,
      cpf,
      birth_date: input.birthDate,
      role: input.role || 'member',
      gender: input.gender || 'other',
      age: calcAge(input.birthDate),
      height: 0,
      current_weight: 0,
      target_weight: 0,
      activity_level: 'moderate',
      fitness_goal: 'health',
      daily_water_target_ml: 3000,
      daily_calorie_target: 2200,
      daily_protein_target_g: 160,
      daily_carb_target_g: 200,
      daily_fat_target_g: 60
    })
    .select()
    .single();

  if (profileError) throw new Error('Erro ao criar perfil: ' + profileError.message);

  const { error } = await supabase.from('contas_usuario').insert({
    profile_id: profile.id,
    username: cpf,
    password_hash: passwordHash,
    role: input.role || 'member',
    is_active: false
  });

  if (error) throw new Error('Erro ao criar conta: ' + error.message);
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
    .eq('birth_date', birthDate)
    .maybeSingle();

  if (profileError) throw new Error('Erro ao consultar dados: ' + profileError.message);
  if (!profile) throw new Error('CPF e data de nascimento não correspondem a nenhum usuário.');

  const { data: account } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!account) throw new Error('Usuário não possui conta de acesso registrada.');

  const passwordHash = await hashPassword(newPassword);

  const { error } = await supabase
    .from('contas_usuario')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
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
    .order('created_at', { ascending: false });

  if (error) throw new Error('Erro ao listar usuários: ' + error.message);

  const { data: profiles, error: profileError } = await supabase.from('perfis').select('*');
  if (profileError) throw new Error('Erro ao consultar perfis: ' + profileError.message);

  const profileMap = new Map<string, Profile>((profiles || []).map((p: Profile) => [p.id, p]));

  return (accounts || []).map(a => ({
    ...a,
    profile: profileMap.get(a.profile_id) || null
  }));
}

export async function setUserActive(accountId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('contas_usuario')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
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
    .update({ access_expires_at: accessExpiresAt, access_days: days || null, updated_at: new Date().toISOString() })
    .eq('id', accountId);
  if (error) throw new Error('Erro ao definir expiração: ' + error.message);
}

export async function ensureAdminAccount(cpf: string, birthDate: string, password: string): Promise<void> {
  const c = onlyDigits(cpf);
  if (!isSupabaseConfigured()) return;

  const { data: existingAccount } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('username', c)
    .maybeSingle();
  if (existingAccount) return;

  const { data: profiles } = await supabase.from('perfis').select('*').order('created_at').limit(1);
  const adminProfile = (profiles || [])[0];
  if (!adminProfile) return;

  await supabase
    .from('perfis')
    .update({ cpf: c, birth_date: birthDate })
    .eq('id', adminProfile.id);

  const passwordHash = await hashPassword(password);

  await supabase.from('contas_usuario').upsert({
    profile_id: adminProfile.id,
    username: c,
    password_hash: passwordHash,
    role: 'admin',
    is_active: true
  });
}

// ── Validate Reset Identity (CPF + birth date) ─────────────────
export async function validateResetIdentity(cpf: string, birthDate: string): Promise<{ account_id: string; profile_name: string }> {
  const c = onlyDigits(cpf);
  if (!isValidCPF(c)) throw new Error('CPF inválido.');
  if (!birthDate) throw new Error('Informe a data de nascimento.');

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .select('id, name')
    .eq('cpf', c)
    .eq('birth_date', birthDate)
    .maybeSingle();

  if (profileError) throw new Error('Erro ao consultar dados: ' + profileError.message);
  if (!profile) throw new Error('CPF e data de nascimento não correspondem a nenhum usuário.');

  const { data: account } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!account) throw new Error('Usuário não possui conta de acesso registrada.');

  return { account_id: account.id, profile_name: profile.name };
}

// ── Admin: Create User ─────────────────────────────────────────
export async function registerUserAdmin(input: RegisterInput, password: string): Promise<void> {
  const cpf = onlyDigits(input.cpf);
  if (!isValidCPF(cpf)) throw new Error('CPF inválido.');
  if (!input.name.trim()) throw new Error('Informe o nome.');
  if (!input.birthDate) throw new Error('Informe a data de nascimento.');
  if (password.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');

  const { data: existing } = await supabase
    .from('contas_usuario')
    .select('id')
    .eq('username', cpf)
    .maybeSingle();
  if (existing) throw new Error('CPF já cadastrado.');

  const passwordHash = await hashPassword(password);

  const { data: profile, error: profileError } = await supabase
    .from('perfis')
    .insert({
      name: input.name.trim(),
      email: input.email || null,
      cpf,
      birth_date: input.birthDate,
      role: 'member',
      gender: input.gender || 'other',
      age: calcAge(input.birthDate),
      height: 0,
      current_weight: 0,
      target_weight: 0,
      activity_level: 'moderate',
      fitness_goal: 'health',
      daily_water_target_ml: 3000,
      daily_calorie_target: 2200,
      daily_protein_target_g: 160,
      daily_carb_target_g: 200,
      daily_fat_target_g: 60
    })
    .select()
    .single();

  if (profileError) throw new Error('Erro ao criar perfil: ' + profileError.message);

  const { error } = await supabase.from('contas_usuario').insert({
    profile_id: profile.id,
    username: cpf,
    password_hash: passwordHash,
    role: 'member',
    is_active: true
  });

  if (error) throw new Error('Erro ao criar conta: ' + error.message);
}

// ── Admin: Update User Profile ─────────────────────────────────
export async function updateUserProfileAdmin(
  accountId: string,
  data: { name?: string; cpf?: string; birth_date?: string; email?: string; gender?: string }
): Promise<void> {
  // Get the profile_id from the account
  const { data: account, error: accError } = await supabase
    .from('contas_usuario')
    .select('profile_id')
    .eq('id', accountId)
    .maybeSingle();

  if (accError || !account) throw new Error('Conta não encontrada.');

  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.email !== undefined) updates.email = data.email || null;
  if (data.gender !== undefined) updates.gender = data.gender;
  if (data.birth_date !== undefined) {
    updates.birth_date = data.birth_date;
    updates.age = calcAge(data.birth_date);
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
    if (existingProfile && existingProfile.id !== account.profile_id) {
      throw new Error('CPF já está em uso por outro usuário.');
    }
    updates.cpf = c;
    // Also update the username in user_accounts
    await supabase.from('contas_usuario').update({ username: c }).eq('id', accountId);
  }

  if (Object.keys(updates).length === 0) return;

  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('perfis')
    .update(updates)
    .eq('id', account.profile_id);

  if (error) throw new Error('Erro ao atualizar perfil: ' + error.message);
}

// ── Admin: Update User Password ────────────────────────────────
export async function updateUserPasswordAdmin(accountId: string, newPassword: string): Promise<void> {
  if (newPassword.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');
  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase
    .from('contas_usuario')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
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
