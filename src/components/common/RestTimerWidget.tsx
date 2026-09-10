import React from 'react';
import { Timer, X, Plus } from 'lucide-react';

interface RestTimerWidgetProps {
  secondsRemaining: number;
  onAddSeconds: (sec: number) => void;
  onCancel: () => void;
}

export const RestTimerWidget: React.FC<RestTimerWidgetProps> = ({
  secondsRemaining,
  onAddSeconds,
  onCancel
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 bg-dark-900/95 backdrop-blur-lg border border-blue-500/40 rounded-2xl p-4 shadow-2xl flex items-center space-x-4 shadow-glow-blue animate-bounce">
      <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
        <Timer className="w-6 h-6 animate-pulse" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Tempo de Descanso</div>
        <div className="text-2xl font-black text-white font-mono">{formatTime(secondsRemaining)}</div>
      </div>
      <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-800">
        <button
          onClick={() => onAddSeconds(30)}
          className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-slate-200 flex items-center space-x-1"
          title="Adicionar 30 segundos"
        >
          <Plus className="w-3 h-3" />
          <span>30s</span>
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
          title="Fechar cronômetro"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
