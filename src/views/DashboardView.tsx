import React from 'react';
import { Profile, Workout, AIDailySummary, Goal } from '../types';
import { NavTab } from '../store/useAppStore';
import { getDynamicGreeting } from '../lib/ai-coach';
import {
  Sparkles,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Pill,
  TrendingDown,
  ArrowRight,
  Flame,
  HeartPulse,
  CheckCircle2,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

interface DashboardViewProps {
  profile: Profile;
  todayWorkout?: Workout;
  smartSummary: AIDailySummary;
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFats: number;
  todayWaterTotal: number;
  goals: Goal[];
  onNavigate: (tab: NavTab) => void;
  onAddWater: (ml: number) => void;
  onOpenSmartSummary: () => void;
  onTakeBlendDose: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  todayWorkout,
  smartSummary,
  todayCalories,
  todayProtein,
  todayCarbs,
  todayFats,
  todayWaterTotal,
  goals,
  onNavigate,
  onAddWater,
  onOpenSmartSummary,
  onTakeBlendDose
}) => {
  const name = profile.nickname || profile.name;
  const { greeting, period } = getDynamicGreeting(name);

  const weightProgressPct = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((87 - profile.current_weight) / (87 - profile.target_weight)) * 100
      )
    )
  );

  const waterPct = Math.min(100, Math.round((todayWaterTotal / profile.daily_water_target_ml) * 100));
  const caloriePct = Math.min(100, Math.round((todayCalories / profile.daily_calorie_target) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Saudação Dinâmica de Acordo com o Horário */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {period === 'manhã' && '☀️'}
              {period === 'tarde' && '🌤️'}
              {period === 'noite' && '🌙'}
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {greeting.split(',')[0]}, <span className="gradient-text-blue">{name}</span>!
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Foco hoje: <span className="text-slate-200 font-semibold">{todayWorkout ? todayWorkout.title : 'Descanso ativo & Recuperação'}</span>
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('workouts')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-blue flex items-center space-x-2 transition-all"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Iniciar Treino</span>
          </button>
          <button
            onClick={() => onNavigate('nutrition')}
            className="px-4 py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center space-x-2 transition-all"
          >
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            <span>Registrar Refeição</span>
          </button>
        </div>
      </div>

      {/* 2. Resumo Inteligente do Dia (O Grande Diferencial) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/40 via-dark-900 to-dark-950 border border-blue-500/30 p-5 lg:p-6 shadow-glow-blue">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-white flex items-center space-x-2">
                <span>Resumo Inteligente do Dia</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  IA Coach
                </span>
              </h3>
              <p className="text-xs text-slate-400">Análise holística de treino, recuperação, peso e suplementação</p>
            </div>
          </div>
          <button
            onClick={onOpenSmartSummary}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>Ver Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs lg:text-sm text-slate-300">
          <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{smartSummary.sleep_summary}</span>
            </div>
            <p className="text-slate-400 pl-5">{smartSummary.energy_status}</p>
          </div>

          <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{smartSummary.weight_trend}</span>
            </div>
            <p className="text-slate-400 pl-5">{smartSummary.goal_milestone_progress}</p>
          </div>

          <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
              <Dumbbell className="w-4 h-4" />
              <span>{smartSummary.workout_recommendation}</span>
            </div>
            <p className="text-slate-400 pl-5">Joelho direito monitorado: manter séries isométricas de aquecimento.</p>
          </div>

          <div className="p-3 rounded-xl bg-dark-850/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
              <Pill className="w-4 h-4" />
              <span>{smartSummary.supplement_reminder}</span>
            </div>
            <div className="flex items-center justify-between pl-5">
              <span className="text-slate-400">Estoque atual: 22 doses</span>
              <button
                onClick={onTakeBlendDose}
                className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold hover:bg-amber-500/30"
              >
                Tomar Agora
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Métricas Principais (Peso, Metas, Água, Calorias) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Card Peso */}
        <div
          onClick={() => onNavigate('evolution')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peso Atual</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-white">{profile.current_weight}</span>
            <span className="text-xs font-semibold text-slate-400">kg</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Meta: {profile.target_weight} kg</span>
              <span className="text-emerald-400 font-bold">{weightProgressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${weightProgressPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card Água */}
        <div className="glass-card p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Hidratação</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-white">{todayWaterTotal}</span>
            <span className="text-xs font-semibold text-slate-400">/ {profile.daily_water_target_ml} ml</span>
          </div>
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => onAddWater(250)}
              className="flex-1 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 transition-all"
            >
              +250ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="flex-1 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 transition-all"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Card Calorias */}
        <div
          onClick={() => onNavigate('nutrition')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calorias</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-white">{todayCalories}</span>
            <span className="text-xs font-semibold text-slate-400">/ {profile.daily_calorie_target} kcal</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Proteína: {todayProtein}g / {profile.daily_protein_target_g}g</span>
              <span className="text-amber-400 font-bold">{caloriePct}%</span>
            </div>
            <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all"
                style={{ width: `${caloriePct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card Saúde & Joelho */}
        <div
          onClick={() => onNavigate('health')}
          className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Saúde Articular</span>
            <HeartPulse className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-emerald-400">2 / 10</span>
            <span className="text-xs font-semibold text-slate-400">Dor Leve</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">Joelho Direito: Monitorando carga</p>
          <div className="pt-1 text-[11px] font-semibold text-blue-400 flex items-center space-x-1">
            <span>Ver Protocolo</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* 4. Treino de Hoje - Ficha Detalhada */}
      {todayWorkout && (
        <div className="glass-card rounded-2xl p-5 lg:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {todayWorkout.category}
                </span>
                <h3 className="text-lg font-bold text-white">{todayWorkout.title}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{todayWorkout.subtitle}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400">{todayWorkout.estimated_duration_min} min previstos</span>
              <button
                onClick={() => onNavigate('workouts')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-glow-blue"
              >
                Abrir Treino
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {todayWorkout.exercises?.map((ex, idx) => (
              <div
                key={ex.id}
                className="p-3 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200">
                    {idx + 1}. {ex.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {ex.exercise_type === 'cardio' ? (
                      <span className="text-cyan-400 font-semibold">{ex.duration_minutes || 20} min de cardio contínuo</span>
                    ) : (
                      <span>{ex.sets} séries × {ex.reps_target} • <strong className="text-blue-400">{ex.default_weight_kg}kg</strong></span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">{ex.rest_time_seconds ? `${ex.rest_time_seconds}s` : 'Cardio'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};