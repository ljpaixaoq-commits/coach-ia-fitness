import React from 'react';
import { Profile } from '../../types';
import { NavTab } from '../../store/useAppStore';
import { Users, Sparkles, Bell, ShieldCheck, Flame, LogOut } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  activeProfile: Profile;
  activeTab: NavTab;
  onOpenSmartSummary: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentUserName?: string;
  isAdmin?: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  activeTab,
  onOpenSmartSummary,
  theme,
  onToggleTheme,
  currentUserName,
  isAdmin,
  onLogout
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
            {activeTab === 'profile' && 'Perfil'}
          </p>
        </div>
      </div>

      {/* Right Controls: Theme Toggle + Smart Summary Button + Family Profile Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {isAdmin && (
          <span className="hidden md:flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMIN</span>
          </span>
        )}

        <button
          onClick={onOpenSmartSummary}
          className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 flex items-center space-x-1.5 transition-all shadow-glow-blue"
          title="Ver Resumo Inteligente do Dia"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span className="hidden md:inline">Resumo do Dia</span>
        </button>

        {/* Current User (static) */}
        <div className="flex items-center space-x-2 bg-dark-850 border border-line rounded-xl px-2.5 py-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 overflow-hidden shrink-0">
            {activeProfile.avatar_url ? (
              <img src={activeProfile.avatar_url} alt={activeProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {activeProfile.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-white">
              {activeProfile.nickname || activeProfile.name}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="p-2.5 rounded-xl bg-dark-850 border border-line text-content-muted hover:text-rose-400 hover:border-rose-500/40 transition-all"
          title={currentUserName ? `Sair de ${currentUserName}` : 'Sair'}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
