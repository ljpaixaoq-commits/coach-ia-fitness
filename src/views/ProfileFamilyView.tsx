import React, { useState } from 'react';
import { Profile } from '../types';
import {
  Users,
  UserPlus,
  Shield,
  Dumbbell,
  Target,
  Clock,
  Building,
  CheckCircle2,
  Sparkles,
  Edit2
} from 'lucide-react';

interface ProfileFamilyViewProps {
  profiles: Profile[];
  activeProfile: Profile;
  onSwitchProfile: (id: string) => void;
  onAddProfile: (profile: Profile) => void;
  onUpdateProfile: (profile: Profile) => void;
}

export const ProfileFamilyView: React.FC<ProfileFamilyViewProps> = ({
  profiles,
  activeProfile,
  onSwitchProfile,
  onAddProfile,
  onUpdateProfile
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'spouse' | 'member'>('spouse');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [age, setAge] = useState('30');
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('62');
  const [targetWeight, setTargetWeight] = useState('58');
  const [fitnessGoal, setFitnessGoal] = useState<'lose_weight' | 'hypertrophy'>('hypertrophy');

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newProf: Profile = {
      id: `prof-${Date.now()}`,
      name,
      nickname: nickname || name.split(' ')[0],
      role,
      gender,
      age: parseInt(age, 10) || 30,
      height: parseFloat(height) || 165,
      current_weight: parseFloat(weight) || 60,
      target_weight: parseFloat(targetWeight) || 55,
      activity_level: 'moderate',
      fitness_goal: fitnessGoal,
      gym_name: 'Smart Fit Centro',
      preferred_training_time: '18:30',
      daily_water_target_ml: 2500,
      daily_calorie_target: 1900,
      daily_protein_target_g: 130,
      daily_carb_target_g: 190,
      daily_fat_target_g: 50
    };

    onAddProfile(newProf);
    setIsAddModalOpen(false);
    setName('');
    setNickname('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Perfis & Gestão Familiar</span>
          </h2>
          <p className="text-xs text-slate-400">
            Cada membro da família possui treinos, metas, histórico de peso e coach IA totalmente separados.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-blue transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Adicionar Membro da Família</span>
        </button>
      </div>

      {/* 1. Perfis Disponíveis (Alternador) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const isActive = p.id === activeProfile.id;
          return (
            <div
              key={p.id}
              onClick={() => onSwitchProfile(p.id)}
              className={`glass-card rounded-2xl p-5 cursor-pointer transition-all border ${
                isActive
                  ? 'border-blue-500 bg-blue-950/20 shadow-glow-blue'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-base font-bold shadow-md">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>{p.name}</span>
                      {isActive && (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          Ativo
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 capitalize">{p.role === 'admin' ? 'Titular' : p.role === 'spouse' ? 'Esposa' : 'Membro'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Peso Atual / Meta</span>
                  <span className="font-bold text-white">{p.current_weight}kg → {p.target_weight}kg</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Objetivo</span>
                  <span className="font-bold text-blue-400">
                    {p.fitness_goal === 'lose_weight' ? 'Emagrecimento' : 'Hipertrofia'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Dados do Perfil Ativo */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Configurações do Perfil: {activeProfile.name}</span>
          </h3>
          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Dados Sincronizados</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Idade / Altura</span>
            <span className="text-sm font-bold text-white">{activeProfile.age} anos • {activeProfile.height} cm</span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Academia / Unidade</span>
            <span className="text-sm font-bold text-white">{activeProfile.gym_name || 'Smart Fit Centro'}</span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Horário de Treino Habitual</span>
            <span className="text-sm font-bold text-white">{activeProfile.preferred_training_time || '07:00'}</span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Meta de Água Diária</span>
            <span className="text-sm font-bold text-cyan-400">{activeProfile.daily_water_target_ml} ml</span>
          </div>
        </div>
      </div>

      {/* Modal Add Profile */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Novo Perfil de Membro</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome Completo*</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Parentesco</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    aria-label="Parentesco"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="spouse">Esposa / Cônjuge</option>
                    <option value="member">Membro da Família</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Gênero</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    aria-label="Gênero"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="female">Feminino</option>
                    <option value="male">Masculino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Idade</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Peso Alvo / Meta (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Objetivo</label>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value as any)}
                    aria-label="Objetivo físico"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="hypertrophy">Hipertrofia & Tônus</option>
                    <option value="lose_weight">Emagrecimento</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-glow-blue"
                >
                  Criar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
