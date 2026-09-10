import { supabase, isSupabaseConfigured } from './supabase';
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
  AICoachMessage
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
    supabase.from('profiles').select('*'),
    supabase.from('workouts').select('*'),
    supabase.from('workout_exercises').select('*'),
    supabase.from('meals').select('*'),
    supabase.from('meal_items').select('*'),
    supabase.from('water_logs').select('*'),
    supabase.from('supplements').select('*'),
    supabase.from('health_metrics').select('*'),
    supabase.from('injury_pain_logs').select('*'),
    supabase.from('evolution_photos').select('*'),
    supabase.from('goals').select('*'),
    supabase.from('ai_coach_messages').select('*')
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
      order_index: ex.order_index || 0
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
    const { error } = await supabase.from('profiles').upsert(
      data.profiles.map(p => ({ ...p })),
      { onConflict: 'id' }
    );
    if (error) { console.error('Seed profiles:', error); return false; }

    for (const w of data.workouts) {
      const { exercises, ...workoutData } = w;
      await supabase.from('workouts').upsert(workoutData, { onConflict: 'id' });
      if (exercises?.length) {
        await supabase.from('workout_exercises').upsert(
          exercises.map(ex => ({
            ...ex,
            exercise_type: ex.exercise_type || 'strength'
          })),
          { onConflict: 'id' }
        );
      }
    }

    for (const m of data.meals) {
      const { items, ...mealData } = m;
      await supabase.from('meals').upsert(mealData, { onConflict: 'id' });
      if (items?.length) {
        await supabase.from('meal_items').upsert(items, { onConflict: 'id' });
      }
    }

    await supabase.from('supplements').upsert(data.supplements, { onConflict: 'id' });
    await supabase.from('goals').upsert(data.goals, { onConflict: 'id' });

    if (data.waterLogs.length) {
      await supabase.from('water_logs').insert(data.waterLogs.map(w => ({
        profile_id: w.profile_id,
        amount_ml: w.amount_ml,
        logged_at: w.logged_at
      })));
    }
    if (data.healthMetrics.length) {
      await supabase.from('health_metrics').insert(data.healthMetrics);
    }
    if (data.injuries.length) {
      await supabase.from('injury_pain_logs').insert(data.injuries);
    }
    if (data.photos.length) {
      await supabase.from('evolution_photos').insert(data.photos);
    }
    if (data.messages.length) {
      await supabase.from('ai_coach_messages').insert(data.messages);
    }

    return true;
  } catch (e) {
    console.error('Seed error:', e);
    return false;
  }
}

// ── Generic Upsert Helper ──────────────────────────────────────
async function upsert(table: string, data: Record<string, any>) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from(table).upsert(data, { onConflict: 'id' });
  if (error) console.error(`Upsert ${table}:`, error);
}

async function insert(table: string, data: Record<string, any> | Record<string, any>[]) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from(table).insert(data);
  if (error) console.error(`Insert ${table}:`, error);
}

async function remove(table: string, id: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`Delete ${table}:`, error);
}

// ── Profile Sync ───────────────────────────────────────────────
export function syncProfile(p: Profile) {
  upsert('profiles', p);
}

// ── Workout Sync ───────────────────────────────────────────────
export function syncWorkout(w: Workout) {
  const { exercises, ...data } = w;
  upsert('workouts', { ...data, day_of_week: data.day_of_week || [] });
}

export function syncWorkoutExercise(ex: WorkoutExercise) {
  upsert('workout_exercises', ex);
}

// ── Meal Sync ──────────────────────────────────────────────────
export function syncMeal(m: Meal) {
  const { items, ...data } = m;
  upsert('meals', data);
}

export function syncMealItem(item: MealItem) {
  upsert('meal_items', item);
}

// ── Water Sync ─────────────────────────────────────────────────
export function syncWaterLog(log: WaterLog) {
  insert('water_logs', { profile_id: log.profile_id, amount_ml: log.amount_ml, logged_at: log.logged_at });
}

// ── Supplement Sync ────────────────────────────────────────────
export function syncSupplement(s: Supplement) {
  upsert('supplements', s);
}

// ── Health Metric Sync ─────────────────────────────────────────
export function syncHealthMetric(h: HealthMetric) {
  insert('health_metrics', h);
}

// ── Injury Sync ────────────────────────────────────────────────
export function syncInjury(i: InjuryPainLog) {
  upsert('injury_pain_logs', i);
}

// ── Photo Sync ─────────────────────────────────────────────────
export function syncPhoto(p: EvolutionPhoto) {
  insert('evolution_photos', p);
}

// ── Goal Sync ──────────────────────────────────────────────────
export function syncGoal(g: Goal) {
  upsert('goals', g);
}

// ── AI Message Sync ────────────────────────────────────────────
export function syncMessage(m: AICoachMessage) {
  insert('ai_coach_messages', m);
}
