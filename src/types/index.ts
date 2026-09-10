export type UserRole = 'admin' | 'member' | 'spouse';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'moderate' | 'intense' | 'athlete';
export type FitnessGoal = 'lose_weight' | 'hypertrophy' | 'endurance' | 'health';

export interface Profile {
  id: string;
  user_id?: string;
  name: string;
  nickname?: string;
  email?: string;
  avatar_url?: string;
  role: UserRole;
  gender: Gender;
  age: number;
  height: number; // cm
  current_weight: number; // kg
  target_weight: number; // kg
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  gym_name?: string;
  preferred_training_time?: string;
  daily_water_target_ml: number;
  daily_calorie_target: number;
  daily_protein_target_g: number;
  daily_carb_target_g: number;
  daily_fat_target_g: number;
}

export type WorkoutCategory = 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Cardio' | 'Upper' | 'Lower';
export type ExerciseType = 'strength' | 'cardio' | 'isometric';

export interface ExerciseSet {
  set_number: number;
  reps_target: string;
  reps_completed?: number;
  weight_kg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  name: string;
  muscle_group: string;
  exercise_type: ExerciseType;
  sets: number;
  reps_target: string;
  default_weight_kg: number;
  duration_minutes?: number; // Para esteira, bike, escada
  rest_time_seconds: number;
  video_url?: string;
  video_gif_url?: string;
  demo_instructions?: string;
  order_index: number;
  completed?: boolean;
  sets_data?: ExerciseSet[];
}

export interface Workout {
  id: string;
  profile_id: string;
  title: string;
  subtitle?: string;
  category: WorkoutCategory;
  day_of_week: number[]; // 1=Seg, 7=Dom
  estimated_duration_min: number;
  difficulty: 'iniciante' | 'intermediary' | 'avancado';
  ai_generated?: boolean;
  is_active: boolean;
  notes?: string;
  exercises?: WorkoutExercise[];
}

export interface WorkoutLogSet {
  id: string;
  workout_log_id: string;
  exercise_name: string;
  set_number: number;
  reps_completed: number;
  weight_kg: number;
  is_pr?: boolean;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  profile_id: string;
  workout_id?: string;
  workout_title: string;
  started_at: string;
  completed_at?: string;
  duration_seconds: number;
  total_volume_kg: number;
  calories_burned?: number;
  rpe_effort?: number; // 1-10
  user_feedback?: string;
  ai_feedback?: string;
  sets?: WorkoutLogSet[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

export interface MealItem {
  id: string;
  meal_id: string;
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface Meal {
  id: string;
  profile_id: string;
  meal_type: MealType;
  title: string;
  consumed_at: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fats_g: number;
  notes?: string;
  items?: MealItem[];
}

export interface WaterLog {
  id: string;
  profile_id: string;
  amount_ml: number;
  logged_at: string;
}

export interface Supplement {
  id: string;
  profile_id: string;
  name: string;
  is_custom_blend: boolean;
  dosage: string;
  recipe_formula?: string;
  recommended_time: string;
  current_stock_doses: number;
  min_stock_alert: number;
  unit: string;
  notes?: string;
  is_active: boolean;
}

export interface SupplementIntake {
  id: string;
  profile_id: string;
  supplement_id: string;
  taken_at: string;
  notes?: string;
}

export interface HealthMetric {
  id: string;
  profile_id: string;
  measured_at: string;
  weight_kg?: number;
  bmi?: number;
  body_fat_pct?: number;
  muscle_mass_kg?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate_bpm?: number;
  blood_glucose_mg_dl?: number;
  sleep_hours?: number;
  sleep_quality?: number; // 1-5
  energy_level?: number; // 1-10
  chest_cm?: number;
  waist_cm?: number;
  abdomen_cm?: number;
  hips_cm?: number;
  right_arm_cm?: number;
  left_arm_cm?: number;
  right_thigh_cm?: number;
  left_thigh_cm?: number;
  notes?: string;
}

export interface InjuryPainLog {
  id: string;
  profile_id: string;
  body_part: string;
  pain_level: number; // 0-10
  status: 'active' | 'monitoring' | 'recovered';
  injury_date?: string;
  symptoms: string;
  restricted_exercises: string[];
  recommended_exercises: string[];
  treatment_notes?: string;
  logged_at: string;
}

export interface EvolutionPhoto {
  id: string;
  profile_id: string;
  photo_type: 'front' | 'side' | 'back';
  photo_url: string;
  weight_kg?: number;
  body_fat_pct?: number;
  taken_at: string;
  notes?: string;
}

export interface Goal {
  id: string;
  profile_id: string;
  title: string;
  category: 'weight' | 'workout_frequency' | 'water' | 'sleep' | 'steps' | 'nutrition';
  current_value: number;
  target_value: number;
  unit: string;
  deadline?: string;
  status: 'in_progress' | 'completed' | 'paused';
}

export interface AICoachMessage {
  id: string;
  profile_id: string;
  sender: 'user' | 'ai';
  message: string;
  intent_type?: 'energy_low' | 'injury_pain' | 'workout_too_heavy' | 'low_sleep' | 'nutrition_advice' | 'general';
  suggested_actions?: {
    action: string;
    label: string;
    details?: string;
  }[];
  created_at: string;
}

export interface AIDailySummary {
  id: string;
  profile_id: string;
  summary_date: string;
  greeting: string;
  sleep_summary: string;
  weight_trend: string;
  workout_recommendation: string;
  energy_status: string;
  hydration_advice: string;
  supplement_reminder: string;
  goal_milestone_progress: string;
  full_markdown: string;
}