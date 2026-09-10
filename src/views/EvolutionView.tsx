import React, { useState } from 'react';
import { Profile, HealthMetric } from '../types';
import {
  TrendingDown,
  Activity,
  Ruler,
  Plus,
  Scale,
  Calendar,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface EvolutionViewProps {
  profile: Profile;
  healthMetrics: HealthMetric[];
  onAddMetric: (metric: Omit<HealthMetric, 'id' | 'profile_id'>) => void;
}

export const EvolutionView: React.FC<EvolutionViewProps> = ({
  profile,
  healthMetrics,
  onAddMetric
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newFatPct, setNewFatPct] = useState('');
  const [newMuscle, setNewMuscle] = useState('');
  const [newChest, setNewChest] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newArm, setNewArm] = useState('');
  const [newThigh, setNewThigh] = useState('');

  // Prepare chart data
  const chartData = healthMetrics.map((hm) => ({
    date: hm.measured_at.slice(5), // MM-DD
    peso: hm.weight_kg,
    gordura: hm.body_fat_pct,
    musculo: hm.muscle_mass_kg
  }));

  const latestMetric = healthMetrics[healthMetrics.length - 1];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    const weightNum = parseFloat(newWeight);
    const heightM = profile.height / 100;
    const bmiCalculated = parseFloat((weightNum / (heightM * heightM)).toFixed(1));

    onAddMetric({
      measured_at: new Date().toISOString().split('T')[0],
      weight_kg: weightNum,
      bmi: bmiCalculated,
      body_fat_pct: newFatPct ? parseFloat(newFatPct) : undefined,
      muscle_mass_kg: newMuscle ? parseFloat(newMuscle) : undefined,
      chest_cm: newChest ? parseFloat(newChest) : undefined,
      waist_cm: newWaist ? parseFloat(newWaist) : undefined,
      right_arm_cm: newArm ? parseFloat(newArm) : undefined,
      right_thigh_cm: newThigh ? parseFloat(newThigh) : undefined
    });

    setIsModalOpen(false);
    setNewWeight('');
    setNewFatPct('');
    setNewMuscle('');
    setNewChest('');
    setNewWaist('');
    setNewArm('');
    setNewThigh('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Scale className="w-6 h-6 text-emerald-400" />
            <span>Peso & Evolução Corporal</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento de peso, IMC, percentual de gordura, massa magra e circunferências.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-emerald transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Pesagem</span>
        </button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">Peso Atual</div>
          <div className="text-2xl font-extrabold text-white">{profile.current_weight} kg</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Meta: {profile.target_weight} kg</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">IMC (Índice de Massa)</div>
          <div className="text-2xl font-extrabold text-white">{latestMetric?.bmi || 26.7}</div>
          <div className="text-[11px] text-blue-400 font-semibold">Faixa Saudável</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">% Gordura Atual</div>
          <div className="text-2xl font-extrabold text-amber-400">{profile.body_fat_percentage || 19.2}%</div>
          <div className="text-[11px] text-emerald-400 font-semibold">↓ -2.3% no período</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">Massa Muscular</div>
          <div className="text-2xl font-extrabold text-purple-400">{profile.muscle_mass_kg || 63.8} kg</div>
          <div className="text-[11px] text-purple-300 font-semibold">↑ Ganho de 1.3 kg</div>
        </div>
      </div>

      {/* 3. Interactive Chart (Recharts) */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Curva de Evolução de Peso & Composição</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Últimos registros</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-dark-900)',
                  borderColor: 'var(--color-dark-700)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: 'var(--color-content-primary)'
                }}
              />
              <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="musculo" name="Massa Magra (kg)" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Table of Circumferences */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Ruler className="w-4 h-4 text-emerald-400" />
          <span>Histórico de Medidas Corporais</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-dark-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Peso</th>
                <th className="p-3">Tórax</th>
                <th className="p-3">Cintura</th>
                <th className="p-3">Braço D.</th>
                <th className="p-3">Coxa D.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {healthMetrics.map((m) => (
                <tr key={m.id} className="hover:bg-dark-850">
                  <td className="p-3 font-semibold text-white">{m.measured_at}</td>
                  <td className="p-3 text-blue-400 font-bold">{m.weight_kg} kg</td>
                  <td className="p-3">{m.chest_cm || '-'} cm</td>
                  <td className="p-3 text-emerald-400">{m.waist_cm || '-'} cm</td>
                  <td className="p-3">{m.right_arm_cm || '-'} cm</td>
                  <td className="p-3">{m.right_thigh_cm || '-'} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Pesagem */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Registrar Nova Pesagem</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Peso Atual (kg)*</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Ex: 84.2"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">% de Gordura</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFatPct}
                    onChange={(e) => setNewFatPct(e.target.value)}
                    placeholder="Ex: 18.9"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Massa Muscular (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMuscle}
                    onChange={(e) => setNewMuscle(e.target.value)}
                    placeholder="Ex: 64.0"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    placeholder="Ex: 85.5"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Braço Direito (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newArm}
                    onChange={(e) => setNewArm(e.target.value)}
                    placeholder="Ex: 39.5"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-slate-300 font-bold hover:bg-dark-750"
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
