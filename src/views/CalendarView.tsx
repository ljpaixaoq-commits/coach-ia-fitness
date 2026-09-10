import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Dumbbell, UtensilsCrossed, Scale, Moon } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState('Setembro 2026');

  // Days of month demo grid
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Completed workouts days: 1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29
  const workoutDays = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29];
  const weightDays = [5, 15, 25];
  const restDays = [2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 21, 23, 25, 27, 28, 30];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-blue-400" />
            <span>Calendário de Consistência</span>
          </h2>
          <p className="text-xs text-slate-400">
            Visão mensal de treinos realizados, pesagens, refeições e dias de descanso.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-dark-850 border border-slate-800 rounded-xl px-3 py-1.5">
          <button className="text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-bold text-white px-2">{currentMonth}</span>
          <button className="text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">Treino Concluído</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-slate-300">Pesagem Registrada</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-300">Dieta 100% no Plano</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-dark-700"></div>
          <span className="text-slate-400">Descanso / Off</span>
        </div>
      </div>

      {/* Month Grid */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => {
            const hasWorkout = workoutDays.includes(day);
            const hasWeight = weightDays.includes(day);
            const isToday = day === 9;

            return (
              <div
                key={day}
                className={`min-h-[75px] rounded-xl p-2 flex flex-col justify-between border transition-all ${
                  isToday
                    ? 'bg-blue-600/20 border-blue-500 shadow-glow-blue'
                    : 'bg-dark-850/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>{day}</span>
                  {isToday && <span className="text-[9px] font-extrabold text-blue-400">HOJE</span>}
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {hasWorkout && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" title="Treino realizado"></span>
                  )}
                  {hasWeight && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Pesagem registrada"></span>
                  )}
                  <span className="w-2 h-2 rounded-full bg-purple-500" title="Nutrição completa"></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
