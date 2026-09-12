import React, { useState } from 'react';
import { Profile } from '../types';
import { User, Shield, Calendar, Building, Clock, Droplets, Phone, Mail, Pencil, X, Save } from 'lucide-react';

interface ProfileViewProps {
  activeProfile: Profile;
  onUpdate?: (p: Profile) => Promise<void> | void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ activeProfile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activeProfile.name);
  const [nickname, setNickname] = useState(activeProfile.nickname || '');
  const [email, setEmail] = useState(activeProfile.email || '');
  const [phone, setPhone] = useState(activeProfile.phone || '');
  const [age, setAge] = useState(String(activeProfile.age || ''));
  const [height, setHeight] = useState(String(activeProfile.height || ''));
  const [currentWeight, setCurrentWeight] = useState(String(activeProfile.current_weight || ''));
  const [targetWeight, setTargetWeight] = useState(String(activeProfile.target_weight || ''));
  const [gymName, setGymName] = useState(activeProfile.gym_name || '');
  const [preferredTime, setPreferredTime] = useState(activeProfile.preferred_training_time || '07:00');
  const [dailyWater, setDailyWater] = useState(String(activeProfile.daily_water_target_ml || 3000));

  const resetForm = () => {
    setName(activeProfile.name);
    setNickname(activeProfile.nickname || '');
    setEmail(activeProfile.email || '');
    setPhone(activeProfile.phone || '');
    setAge(String(activeProfile.age || ''));
    setHeight(String(activeProfile.height || ''));
    setCurrentWeight(String(activeProfile.current_weight || ''));
    setTargetWeight(String(activeProfile.target_weight || ''));
    setGymName(activeProfile.gym_name || '');
    setPreferredTime(activeProfile.preferred_training_time || '07:00');
    setDailyWater(String(activeProfile.daily_water_target_ml || 3000));
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    await onUpdate({
      ...activeProfile,
      name,
      nickname: nickname || undefined,
      email: email || undefined,
      phone: phone || undefined,
      age: parseInt(age, 10) || activeProfile.age,
      height: parseFloat(height) || activeProfile.height,
      current_weight: parseFloat(currentWeight) || activeProfile.current_weight,
      target_weight: parseFloat(targetWeight) || activeProfile.target_weight,
      gym_name: gymName || undefined,
      preferred_training_time: preferredTime,
      daily_water_target_ml: parseInt(dailyWater, 10) || activeProfile.daily_water_target_ml
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-400" />
            <span>Perfil</span>
          </h2>
          <p className="text-xs text-slate-400">
            Seu espaço pessoal: dados da sua conta e preferências de treino e nutrição.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsEditing(true);
          }}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Editar</span>
        </button>
      </div>

      {/* Dados do Perfil */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Dados do Perfil: {activeProfile.name}</h3>
          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
            <Save className="w-3.5 h-3.5" />
            <span>Sincronizado</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 overflow-hidden shrink-0">
            {activeProfile.avatar_url ? (
              <img src={activeProfile.avatar_url} alt={activeProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {activeProfile.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{activeProfile.nickname || activeProfile.name}</p>
            <p className="text-xs text-slate-400 capitalize flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeProfile.role === 'admin' ? 'Titular' : 'Membro'}</span>
            </p>
            {activeProfile.email && (
              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeProfile.email}</span>
              </p>
            )}
            {activeProfile.phone && (
              <p className="text-xs text-emerald-400 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeProfile.phone}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Idade / Altura</span>
            <span className="text-sm font-bold text-white flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeProfile.age} anos • {activeProfile.height} cm</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Academia / Unidade</span>
            <span className="text-sm font-bold text-white flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeProfile.gym_name || 'Smart Fit Centro'}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Horário de Treino Habitual</span>
            <span className="text-sm font-bold text-white flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeProfile.preferred_training_time || '07:00'}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-dark-850 border border-slate-800">
            <span className="text-slate-500 block">Meta de Água Diária</span>
            <span className="text-sm font-bold text-cyan-400 flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeProfile.daily_water_target_ml} ml</span>
            </span>
          </div>
        </div>

        {/* Telefone em destaque */}
        <div className="p-3 rounded-xl bg-dark-850 border border-emerald-900/50">
          <span className="text-slate-500 block">Telefone</span>
          <span className="text-sm font-bold text-white flex items-center space-x-1">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeProfile.phone || 'Não cadastrado'}</span>
          </span>
          {!activeProfile.phone && (
            <span className="text-xs text-slate-500 mt-1 block">
              Use o botão Editar acima para cadastrar seu número de telefone.
            </span>
          )}
        </div>
      </div>

      {/* Modal Editar */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Editar Perfil</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-slate-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Apelido</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Como você gosta de ser chamado"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Peso Objetivo (kg)</label>
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Academia / Unidade</label>
                <input
                  type="text"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Horário de Treino</label>
                  <input
                    type="time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Meta de Água (ml)</label>
                  <input
                    type="number"
                    value={dailyWater}
                    onChange={(e) => setDailyWater(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
