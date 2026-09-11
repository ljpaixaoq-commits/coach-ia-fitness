import React from 'react';
import { NavTab } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Dumbbell,
  Bot,
  TrendingUp,
  UtensilsCrossed,
  Pill,
  HeartPulse,
  Camera,
  Target,
  CalendarDays,
  Users,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, isAdmin }) => {
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'workouts', label: 'Treinos', icon: Dumbbell, badge: 'Hoje' },
    { id: 'aicoach', label: 'Coach IA', icon: Bot, badge: 'IA' },
    { id: 'evolution', label: 'Peso & Evolução', icon: TrendingUp, badge: null },
    { id: 'nutrition', label: 'Alimentação', icon: UtensilsCrossed, badge: null },
    { id: 'supplements', label: 'Suplementos', icon: Pill, badge: null },
    { id: 'health', label: 'Saúde', icon: HeartPulse, badge: 'Atenção' },
    { id: 'photos', label: 'Fotos Corporais', icon: Camera, badge: null },
    { id: 'goals', label: 'Metas', icon: Target, badge: null },
    { id: 'calendar', label: 'Calendário', icon: CalendarDays, badge: null },
    { id: 'profile', label: 'Perfil & Família', icon: Users, badge: null }
  ];

  if (isAdmin) {
    baseItems.push({ id: 'admin', label: 'Administração', icon: ShieldCheck, badge: null } as any);
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-dark-950 border-r border-line/80 p-4 space-y-6 shrink-0 min-h-screen">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-content-muted">Módulos do Sistema</p>
        <nav className="space-y-1 pt-2">
          {baseItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.id === 'admin'
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-glow-blue font-semibold'
                      : 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-glow-blue font-semibold'
                    : 'text-content-muted hover:text-content-secondary hover:bg-dark-850 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : item.id === 'admin' ? 'text-amber-400' : 'text-content-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.badge === 'IA'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : item.badge === 'Atenção'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Supabase Status Pill */}
      <div className="mt-auto pt-4 border-t border-line/80">
        <div className="p-3 rounded-xl bg-dark-900 border border-line space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-muted font-medium">Conexão Supabase</span>
            <span className="flex items-center text-emerald-400 font-semibold space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sincronizado</span>
            </span>
          </div>
          <p className="text-[11px] text-content-muted leading-tight">
            Seus dados locais e nuvem estão integrados com RLS ativo.
          </p>
        </div>
      </div>
    </aside>
  );
};
