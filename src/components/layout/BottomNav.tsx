import React from 'react';
import { NavTab } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Dumbbell,
  Bot,
  UtensilsCrossed,
  Menu
} from 'lucide-react';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu
}) => {
  const mainTabs: { id: NavTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'workouts', label: 'Treino', icon: Dumbbell },
    { id: 'aicoach', label: 'Coach IA', icon: Bot },
    { id: 'nutrition', label: 'Dieta', icon: UtensilsCrossed }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-primary/95 backdrop-blur-lg border-t border-line px-2 py-1.5 flex items-center justify-around">
      {mainTabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Mais</span>
      </button>
    </div>
  );
};
