import React from 'react';
import { AIDailySummary, Profile } from '../../types';
import { Sparkles, X, CheckCircle2, Dumbbell, Droplets, Pill, Target, Moon, Flame } from 'lucide-react';

interface SmartSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AIDailySummary;
  profile: Profile;
}

export const SmartSummaryModal: React.FC<SmartSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  profile
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-gradient-to-br from-dark-900 via-dark-950 to-dark-950 border border-blue-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-glow-blue space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 shadow-glow-blue flex items-center justify-center">
              <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white">{summary.greeting}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Diferencial IA
                </span>
              </div>
              <p className="text-xs text-slate-400">Resumo Inteligente do Dia compilado pelo seu Coach IA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Points List */}
        <div className="space-y-3 text-xs lg:text-sm text-slate-200">
          <div className="p-4 rounded-2xl bg-dark-850/80 border border-slate-800 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
              <Moon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white">Sono & Recuperação Neural</div>
              <div className="text-slate-300">{summary.sleep_summary}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-slate-800 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 mt-0.5">
              <Target className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white">Balanço de Peso & Meta</div>
              <div className="text-slate-300">{summary.weight_trend}</div>
              <div className="text-slate-400 text-xs">{summary.goal_milestone_progress}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-slate-800 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 mt-0.5">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white">Diretriz do Treino de Hoje</div>
              <div className="text-slate-300">{summary.workout_recommendation}</div>
              <div className="text-slate-400 text-xs">{summary.energy_status}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-slate-800 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white">Hidratação Sugerida</div>
              <div className="text-slate-300">{summary.hydration_advice}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-850/80 border border-slate-800 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
              <Pill className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-white">Mistura Personalizada & Suplementação</div>
              <div className="text-slate-300">{summary.supplement_reminder}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-glow-blue transition-all"
        >
          Excelente, vamos começar o dia!
        </button>
      </div>
    </div>
  );
};
