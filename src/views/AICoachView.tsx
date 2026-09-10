import React, { useState, useRef, useEffect } from 'react';
import { Profile, AICoachMessage, Workout, InjuryPainLog } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Activity,
  HeartPulse,
  Moon,
  ShieldCheck,
  ChevronRight,
  Flame
} from 'lucide-react';

interface AICoachViewProps {
  profile: Profile;
  messages: AICoachMessage[];
  todayWorkout?: Workout;
  injuries: InjuryPainLog[];
  onSendMessage: (message: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  profile,
  messages,
  todayWorkout,
  injuries,
  onSendMessage,
  onNavigateTab
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickChips = [
    { label: 'Hoje estou sem energia', icon: Zap, color: 'from-amber-500/20 to-amber-600/20 text-amber-300 border-amber-500/30' },
    { label: 'Meu joelho está doendo', icon: HeartPulse, color: 'from-rose-500/20 to-rose-600/20 text-rose-300 border-rose-500/30' },
    { label: 'O treino foi muito pesado', icon: Flame, color: 'from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-500/30' },
    { label: 'Dormi apenas 5 horas', icon: Moon, color: 'from-indigo-500/20 to-indigo-600/20 text-indigo-300 border-indigo-500/30' },
    { label: 'Como ajustar minha alimentação hoje?', icon: Sparkles, color: 'from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30' }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)] pb-12">
      {/* 1. Header do Chat */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 flex items-center justify-center shadow-glow-violet">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Coach IA Pessoal</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Adaptando treinos para {profile.nickname || profile.name} • Foco: {profile.fitness_goal === 'lose_weight' ? 'Emagrecimento' : 'Hipertrofia'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Chips Prompt Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 shrink-0 max-w-full">
        {quickChips.map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <button
              key={idx}
              onClick={() => onSendMessage(chip.label)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 whitespace-nowrap bg-gradient-to-r transition-all hover:scale-105 ${chip.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-dark-950/60 border border-slate-800/80 my-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600/30 border border-purple-500/40 text-purple-300'
                }`}
              >
                {isUser ? profile.name.charAt(0) : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs lg:text-sm leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-dark-850 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.message}</div>

                {/* Suggested Action Buttons if generated by IA */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ações Recomendadas pela IA:
                    </span>
                    {msg.suggested_actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.action.includes('water') || act.action.includes('nutrition')) onNavigateTab('nutrition');
                          else if (act.action.includes('load') || act.action.includes('workout')) onNavigateTab('workouts');
                          else if (act.action.includes('blend')) onNavigateTab('supplements');
                          else if (act.action.includes('knee') || act.action.includes('pain')) onNavigateTab('health');
                          else onNavigateTab('dashboard');
                        }}
                        className="px-3 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 border border-slate-700 text-xs font-bold text-blue-400 flex items-center justify-between text-left transition-all"
                      >
                        <div>
                          <div>{act.label}</div>
                          {act.details && <div className="text-[10px] font-normal text-slate-400">{act.details}</div>}
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] opacity-60 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* 4. Chat Input Form */}
      <form onSubmit={handleSend} className="flex items-center space-x-2 pt-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Pergunte ao Coach IA (ex: 'Estou com dor no joelho', 'Como adaptar o treino?')..."
          className="flex-1 bg-dark-900 border border-slate-800 rounded-xl px-4 py-3 text-xs lg:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-glow-blue"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
