import React from 'react';
import { Profile } from '../../types';
import { NavTab } from '../../store/useAppStore';
import { Users, Sparkles, Bell, ShieldCheck, Flame } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  activeProfile: Profile;
  profiles: Profile[];
  onSwitchProfile: (id: string) => void;
  activeTab: NavTab;
  onOpenSmartSummary: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  profiles,
  onSwitchProfile,
  activeTab,
  onOpenSmartSummary,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface-primary/90 backdrop-blur-md border-b border-line/80 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand & Page Context */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-glow-blue">
          <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
            <Flame className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Coach IA Pessoal</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO v2.0
            </span>
          </div>
          <p className="text-xs text-content-muted capitalize">
            {activeTab === 'dashboard' && 'Painel Geral & Resumo do Dia'}
            {activeTab === 'workouts' && 'Fichas de Treino & Execução'}
            {activeTab === 'aicoach' && 'Assistente & Inteligência Adaptativa'}
            {activeTab === 'evolution' && 'Métricas Corporais & Gráficos'}
            {activeTab === 'nutrition' && 'Nutrição, Calorias & Hidratação'}
            {activeTab === 'supplements' && 'Fórmula Manipulada & Estoque'}
            {activeTab === 'health' && 'Monitoramento Clínico & Joelho'}
            {activeTab === 'photos' && 'Linha do Tempo Visual'}
            {activeTab === 'goals' && 'Metas & Hábitos'}
            {activeTab === 'calendar' && 'Calendário de Consistência'}
            {activeTab === 'profile' && 'Perfis & Gestão Familiar'}
          </p>
        </div>
      </div>

      {/* Right Controls: Theme Toggle + Smart Summary Button + Family Profile Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        <button
          onClick={onOpenSmartSummary}
          className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 flex items-center space-x-1.5 transition-all shadow-glow-blue"
          title="Ver Resumo Inteligente do Dia"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="hidden md:inline">Resumo do Dia</span>
        </button>

        {/* Profile Switcher */}
        <div className="flex items-center space-x-2 bg-dark-850 border border-line rounded-xl px-2.5 py-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {activeProfile.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <select
              value={activeProfile.id}
              onChange={(e) => onSwitchProfile(e.target.value)}
              aria-label="Selecionar perfil"
              className="bg-transparent text-xs font-semibold text-content-secondary focus:outline-none cursor-pointer pr-1"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-dark-900 text-white">
                  {p.nickname || p.name} ({p.role === 'admin' ? 'Titular' : 'Família'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
