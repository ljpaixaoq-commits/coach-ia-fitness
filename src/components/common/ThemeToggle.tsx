import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="relative p-2 rounded-xl border transition-all duration-300 group
        bg-slate-100 border-slate-200 text-slate-600
        hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600
        dark:bg-dark-850 dark:border-slate-700 dark:text-slate-300
        dark:hover:bg-dark-800 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon
          className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${
            isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </div>
    </button>
  );
};
