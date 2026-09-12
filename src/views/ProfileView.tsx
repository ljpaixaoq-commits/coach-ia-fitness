import React, { useRef, useState } from 'react';
import { Profile } from '../types';
import { User, Shield, Calendar, Building, Clock, Droplets, Phone, Mail, Pencil, X, Save, Scale, Target, Camera, Trash2 } from 'lucide-react';
import { uploadAvatar, deleteAvatar } from '../lib/db';

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
  const [gymName, setGymName] = useState(activeProfile.gym_name || '');
  const [preferredTime, setPreferredTime] = useState(activeProfile.preferred_training_time || '07:00');
  const [dailyWater, setDailyWater] = useState(String(activeProfile.daily_water_target_ml || 3000));
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName(activeProfile.name);
    setNickname(activeProfile.nickname || '');
    setEmail(activeProfile.email || '');
    setPhone(activeProfile.phone || '');
    setAge(String(activeProfile.age || ''));
    setHeight(String(activeProfile.height || ''));

    setGymName(activeProfile.gym_name || '');
    setPreferredTime(activeProfile.preferred_training_time || '07:00');
    setDailyWater(String(activeProfile.daily_water_target_ml || 3000));
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !onUpdate) return;
    setAvatarLoading(true);
    try {
      const url = await uploadAvatar(file, activeProfile.id);
      await deleteAvatar(activeProfile.avatar_url);
      await onUpdate({ ...activeProfile, avatar_url: url });
    } catch (err: any) {
      console.error('Erro ao atualizar foto:', err);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!onUpdate) return;
    setAvatarLoading(true);
    try {
      await deleteAvatar(activeProfile.avatar_url);
      await onUpdate({ ...activeProfile, avatar_url: '' });
    } catch (err: any) {
      console.error('Erro ao remover foto:', err);
    } finally {
      setAvatarLoading(false);
    }
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
      current_weight: activeProfile.current_weight,
      target_weight: activeProfile.target_weight,
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
              <span>{activeProfile.role === 'admin' ? 'Admin' : 'Usuário'}</span>
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

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {avatarLoading ? (
            <span className="flex items-center space-x-2 text-xs text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>Enviando foto...</span>
            </span>
          ) : (
            <>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{activeProfile.avatar_url ? 'Trocar foto' : 'Escolher foto'}</span>
              </button>
              {activeProfile.avatar_url && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover foto</span>
                </button>
              )}
            </>
          )}
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} aria-label="Trocar foto do perfil" />
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
                <div className="p-3 rounded-xl bg-dark-850 border border-slate-700">
                  <span className="text-slate-400 block mb-1">Peso Atual (kg)</span>
                  <span className="text-sm font-bold text-white flex items-center space-x-1">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeProfile.current_weight || 'Não registrado'}</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-dark-850 border border-slate-700">
                  <span className="text-slate-400 block mb-1">Peso Objetivo (kg)</span>
                  <span className="text-sm font-bold text-white flex items-center space-x-1">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeProfile.target_weight || 'Não definido'}</span>
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Para ajustar seu peso, use a aba <span className="text-emerald-400 font-semibold">Peso &amp; Evolução</span> no menu lateral.
              </p>

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
