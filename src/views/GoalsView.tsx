import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Plus, CheckCircle2, TrendingUp, Award, Clock } from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'profile_id'>) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, onAddGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Goal['category']>('weight');
  const [currentVal, setCurrentVal] = useState('');
  const [targetVal, setTargetVal] = useState('');
  const [unit, setUnit] = useState('kg');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetVal) return;

    onAddGoal({
      title,
      category,
      current_value: parseFloat(currentVal) || 0,
      target_value: parseFloat(targetVal),
      unit,
      status: 'in_progress'
    });

    setIsModalOpen(false);
    setTitle('');
    setCurrentVal('');
    setTargetVal('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Target className="w-6 h-6 text-blue-400" />
            <span>Metas & Hábitos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe o progresso de peso, frequência de treino, hidratação, sono e passos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-blue transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Meta</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isDecrease = goal.category === 'weight';
          let pct = 0;
          if (isDecrease) {
            // e.g. from 87 to 75
            pct = Math.min(100, Math.max(0, Math.round(((87 - goal.current_value) / (87 - goal.target_value)) * 100)));
          } else {
            pct = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
          }

          return (
            <div
              key={goal.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {goal.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{goal.title}</h3>
                </div>
                <span className="text-lg font-black text-emerald-400">{pct}%</span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Atual: <strong className="text-white">{goal.current_value} {goal.unit}</strong></span>
                  <span>Alvo: <strong className="text-blue-400">{goal.target_value} {goal.unit}</strong></span>
                </div>
                <div className="w-full h-2.5 bg-dark-850 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>

              {goal.deadline && (
                <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Prazo: {goal.deadline}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Criar Nova Meta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título da Meta*</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Beber 3,5L de água por dia"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    aria-label="Categoria da meta"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="weight">Peso</option>
                    <option value="workout_frequency">Treinos/Semana</option>
                    <option value="water">Água</option>
                    <option value="sleep">Sono</option>
                    <option value="steps">Passos</option>
                    <option value="nutrition">Nutrição</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex: kg, litros, passos"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Valor Atual</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentVal}
                    onChange={(e) => setCurrentVal(e.target.value)}
                    placeholder="Ex: 84.5"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Valor Alvo (Meta)*</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    placeholder="Ex: 75.0"
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
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-glow-blue"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
