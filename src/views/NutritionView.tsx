import React, { useState } from 'react';
import { Profile, Meal, MealType } from '../types';
import {
  UtensilsCrossed,
  Plus,
  Droplets,
  Flame,
  PieChart,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface NutritionViewProps {
  profile: Profile;
  meals: Meal[];
  todayCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFats: number;
  todayWaterTotal: number;
  onAddMeal: (meal: Omit<Meal, 'id' | 'profile_id'>) => void;
  onAddWater: (ml: number) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  profile,
  meals,
  todayCalories,
  todayProtein,
  todayCarbs,
  todayFats,
  todayWaterTotal,
  onAddMeal,
  onAddWater
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealTitle, setMealTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealTitle || !calories) return;

    onAddMeal({
      meal_type: mealType,
      title: mealTitle,
      consumed_at: new Date().toISOString(),
      total_calories: parseInt(calories, 10),
      total_protein_g: protein ? parseFloat(protein) : 0,
      total_carbs_g: carbs ? parseFloat(carbs) : 0,
      total_fats_g: fats ? parseFloat(fats) : 0
    });

    setIsModalOpen(false);
    setMealTitle('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  const waterPct = Math.min(100, Math.round((todayWaterTotal / profile.daily_water_target_ml) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
            <span>Alimentação & Hidratação</span>
          </h2>
          <p className="text-xs text-slate-400">
            Controle de macronutrientes, calorias diárias e ingestão de água.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-emerald transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Refeição</span>
        </button>
      </div>

      {/* Macros Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calorias</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{todayCalories}</div>
          <div className="text-[11px] text-slate-400">Meta: {profile.daily_calorie_target} kcal</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Proteínas</span>
            <Flame className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-blue-400">{todayProtein}g</div>
          <div className="text-[11px] text-slate-400">Meta: {profile.daily_protein_target_g}g</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Carboidratos</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{todayCarbs}g</div>
          <div className="text-[11px] text-slate-400">Meta: {profile.daily_carb_target_g}g</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gorduras</span>
            <Flame className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">{todayFats}g</div>
          <div className="text-[11px] text-slate-400">Meta: {profile.daily_fat_target_g}g</div>
        </div>
      </div>

      {/* Water Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Consumo de Água Diário</h3>
              <p className="text-xs text-slate-400">{todayWaterTotal} ml de {profile.daily_water_target_ml} ml ({waterPct}%)</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onAddWater(250)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold border border-cyan-500/30"
            >
              +250 ml
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold border border-cyan-500/30"
            >
              +500 ml
            </button>
          </div>
        </div>

        <div className="w-full h-3 bg-dark-850 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${waterPct}%` }}
          ></div>
        </div>
      </div>

      {/* Meal Logs */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Refeições de Hoje</h3>
        <div className="space-y-3">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="p-4 rounded-2xl bg-dark-850 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-dark-800 text-slate-400">
                    {meal.meal_type}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{meal.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-amber-400">{meal.total_calories} kcal</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Proteína: <strong className="text-blue-400">{meal.total_protein_g}g</strong></span>
                <span>Carboidratos: <strong className="text-emerald-400">{meal.total_carbs_g}g</strong></span>
                <span>Gorduras: <strong className="text-purple-400">{meal.total_fats_g}g</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Meal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Cadastrar Refeição</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tipo de Refeição</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  aria-label="Tipo de refeição"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="breakfast">Café da Manhã</option>
                  <option value="lunch">Almoço</option>
                  <option value="dinner">Jantar</option>
                  <option value="snack">Lanche</option>
                  <option value="pre_workout">Pré-Treino</option>
                  <option value="post_workout">Pós-Treino</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Título da Refeição*</label>
                <input
                  type="text"
                  required
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                  placeholder="Ex: Frango com Batata Doce"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Calorias (kcal)*</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="Ex: 500"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Proteínas (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="Ex: 40"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Carboidratos (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gorduras (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="Ex: 12"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-glow-emerald"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
