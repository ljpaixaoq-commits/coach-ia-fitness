import React, { useState, useEffect, useRef } from 'react';
import { Profile, AICoachMessage, Workout, InjuryPainLog } from '../types';
import { WorkoutGoal } from '../lib/ai-coach';
import {
  Bot,
  Send,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  Loader2,
  ChevronRight,
  Dumbbell,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

interface AICoachViewProps {
  profile: Profile;
  messages: AICoachMessage[];
  todayWorkout?: Workout;
  injuries: InjuryPainLog[];
  onSendMessage: (message: string) => void;
  onGenerateWorkout: (goal: WorkoutGoal, count: number) => Promise<Workout[]>;
  onNavigateTab: (tab: string) => void;
}

type CoachMode = 'home' | 'create' | 'adjust' | 'improve' | 'chat';
type CreateStep = 'objective' | 'limitations' | 'details' | 'variations' | 'confirm';

const OBJECTIVES = [
  { id: 'lose_weight', label: 'Emagrecimento', desc: 'Perder gordura e queimar calorias', icon: TrendingUp, color: 'from-rose-500/20 to-rose-600/20 text-rose-300 border-rose-500/30' },
  { id: 'hypertrophy', label: 'Hipertrofia', desc: 'Ganhar massa muscular', icon: Dumbbell, color: 'from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30' },
  { id: 'endurance', label: 'Resistência', desc: 'Aumentar condicionamento aeróbico', icon: Sparkles, color: 'from-emerald-500/20 to-emerald-600/20 text-emerald-300 border-emerald-500/30' },
  { id: 'health', label: 'Saúde Geral', desc: 'Bem-estar e qualidade de vida', icon: ShieldCheck, color: 'from-purple-500/20 to-purple-600/20 text-purple-300 border-purple-500/30' }
];

const LIMITATIONS = [
  { id: 'knee', label: 'Problemas no Joelho', desc: 'Dor, instabilidade ou recuperação' },
  { id: 'back', label: 'Problemas na Coluna/Lombar', desc: 'Dor lombar ou na região das costas' },
  { id: 'shoulder', label: 'Problemas no Ombro', desc: 'Dor ou limitação de movimento' },
  { id: 'wrist', label: 'Punho/Mão', desc: 'Dor ou limitação ao segurar cargas' },
  { id: 'ankle', label: 'Tornozelo', desc: 'Contusões ou instabilidade' },
  { id: 'none', label: 'Nenhuma dificuldade', desc: 'Sem restrições físicas' }
];

const DIFFICULTIES_PRETTY: Record<string, string> = {
  knee: 'Problemas no Joelho',
  back: 'Coluna/Lombar',
  shoulder: 'Ombro',
  wrist: 'Punho/Mão',
  ankle: 'Tornozelo'
};

export const AICoachView: React.FC<AICoachViewProps> = ({
  profile,
  messages,
  todayWorkout,
  injuries,
  onSendMessage,
  onGenerateWorkout,
  onNavigateTab
}) => {
  const [mode, setMode] = useState<CoachMode>('home');
  const [inputText, setInputText] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Create Workout flow
  const [createStep, setCreateStep] = useState<CreateStep>('objective');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [numVariations, setNumVariations] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [generatedWorkouts, setGeneratedWorkouts] = useState<Workout[]>([]);
  const [selectedModel, setSelectedModel] = useState(0);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (pendingPrompt) {
      onSendMessage(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt]);

  const goCreate = () => {
    setMode('create');
    setCreateStep('objective');
    setObjectives([]);
    setLimitations([]);
    setGeneratedWorkouts([]);
    setNumVariations(2);
    setSelectedModel(0);
  };

  const startAdjust = () => {
    setMode('adjust');
    setPendingPrompt('Quero ajustar meu treino de hoje. Preciso de adaptações.');
  };

  const startImprove = () => {
    setMode('improve');
    setPendingPrompt('Quero melhorar meu treino. Como posso evoluir na progressão de cargas?');
  };

  const toggleLimitation = (id: string) => {
    if (id === 'none') {
      setLimitations(prev => prev.includes('none') ? [] : ['none']);
      return;
    }
    setLimitations(prev => {
      const withoutNone = prev.filter(l => l !== 'none');
      return withoutNone.includes(id)
        ? withoutNone.filter(l => l !== id)
        : [...withoutNone, id];
    });
  };

  const toggleObjective = (id: string) => {
    setObjectives(prev => {
      const next = prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id];
      return next;
    });
  };

  const selectAllObjectives = () => {
    setObjectives(prev => prev.length === OBJECTIVES.length ? [] : OBJECTIVES.map(o => o.id));
  };

  const handleGenerate = async () => {
    if (objectives.length === 0) return;
    setGenerating(true);
    try {
      const ws = await onGenerateWorkout({
        objective: objectives[0] as any,
        objectives: objectives as any,
        limitations: limitations.filter(l => l !== 'none').map(l => DIFFICULTIES_PRETTY[l] || l),
        daysPerWeek,
        sessionMinutes,
        experience
      }, numVariations);
      setGeneratedWorkouts(ws);
      setSelectedModel(0);
      setCreateStep('confirm');
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const gifClass = "w-4 h-4";

  // ── HOME SCREEN ──────────────────────────────────────────────
  if (mode === 'home') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 flex items-center justify-center shadow-glow-violet">
              <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Coach IA Pessoal</h2>
              <p className="text-xs text-slate-400">
                O que você deseja fazer hoje, {profile.nickname || profile.name}?
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={goCreate}
            className="p-5 rounded-2xl bg-dark-900 border border-blue-500/30 hover:border-blue-500/60 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Criar Treino</h3>
            <p className="text-xs text-slate-400">Gerar um novo plano de treino personalizado para o seu objetivo.</p>
            <div className="mt-3 flex items-center text-blue-400 text-xs font-bold">
              Começar agora <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>

          <button
            onClick={startAdjust}
            className="p-5 rounded-2xl bg-dark-900 border border-amber-500/30 hover:border-amber-500/60 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Ajustar Treino</h3>
            <p className="text-xs text-slate-400">Modificar o treino por dor, cansaço, tempo ou preferência.</p>
            <div className="mt-3 flex items-center text-amber-400 text-xs font-bold">
              Fazer ajustes <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>

          <button
            onClick={startImprove}
            className="p-5 rounded-2xl bg-dark-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Melhorar Treino</h3>
            <p className="text-xs text-slate-400">Evoluir na progressão de cargas e intensidade.</p>
            <div className="mt-3 flex items-center text-emerald-400 text-xs font-bold">
              Melhorar desempenho <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </button>
        </div>

        {/* Open Chat */}
        <button
          onClick={() => setMode('chat')}
          className="w-full p-4 rounded-2xl bg-dark-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Perguntar ao Coach IA</p>
              <p className="text-xs text-slate-400">Converse livremente sobre treino, nutrição e recuperação</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>

        {/* Go to today's workout */}
        {todayWorkout && (
          <button
            onClick={() => onNavigateTab('workouts')}
            className="w-full p-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 transition-all flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{todayWorkout.title}</p>
                <p className="text-xs text-slate-400">Ver treino de hoje e iniciar sessão</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-400" />
          </button>
        )}
      </div>
    );
  }

  // ── CREATE WORKOUT FLOW ──────────────────────────────────────
  if (mode === 'create') {
    return (
      <div className="space-y-5 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('home')} className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Criar Treino · Passo {createStep === 'objective' ? '1' : createStep === 'limitations' ? '2' : createStep === 'details' ? '3' : createStep === 'variations' ? '4' : '5'} de 5
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex space-x-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= (createStep === 'objective' ? 0 : createStep === 'limitations' ? 1 : createStep === 'details' ? 2 : createStep === 'variations' ? 3 : 4) ? 'bg-blue-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        {/* STEP 1: Objectives (multi-select) */}
        {createStep === 'objective' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Quais são seus objetivos?</h2>
                <p className="text-xs text-slate-400">Escolha 1, vários ou todos os objetivos. Isso personaliza os exercícios.</p>
              </div>
              <button
                onClick={selectAllObjectives}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                  objectives.length === OBJECTIVES.length
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-dark-850 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {objectives.length === OBJECTIVES.length ? 'Todos selecionados' : 'Selecionar todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OBJECTIVES.map((obj) => {
                const Icon = obj.icon;
                const selected = objectives.includes(obj.id);
                return (
                  <button
                    key={obj.id}
                    onClick={() => toggleObjective(obj.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${selected ? obj.color : 'bg-dark-900 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-r flex items-center justify-center ${selected ? obj.color : 'bg-dark-850'}`}>
                        <Icon className={`w-4.5 h-4.5 ${selected ? '' : 'text-slate-400'}`} />
                      </div>
                      {selected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <h3 className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-200'}`}>{obj.label}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{obj.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setMode('home')}
                className="px-4 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setCreateStep('limitations')}
                disabled={objectives.length === 0}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-40"
              >
                Continuar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Limitations */}
        {createStep === 'limitations' && objectives.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Você tem alguma dificuldade?</h2>
                <p className="text-xs text-slate-400">
                  Selecione todas as que se aplicam. Isso evita lesões e adapta os exercícios.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LIMITATIONS.map((lim) => {
                const isNone = lim.id === 'none';
                const selected = limitations.includes(lim.id);
                return (
                  <button
                    key={lim.id}
                    onClick={() => toggleLimitation(lim.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selected
                        ? isNone
                          ? 'bg-emerald-500/15 border-emerald-500/40'
                          : 'bg-rose-500/15 border-rose-500/40'
                        : 'bg-dark-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-200'}`}>{lim.label}</h3>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        selected ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                      }`}>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lim.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCreateStep('objective')}
                className="px-4 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setCreateStep('details')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                Continuar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Details */}
        {createStep === 'details' && objectives.length > 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Configurações do treino</h2>
              <p className="text-xs text-slate-400">Defina frequência, duração e seu nível de experiência.</p>
            </div>

            {/* Days per week */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Dias por semana</label>
              <div className="flex space-x-2">
                {[2, 3, 4, 5, 6].map(d => (
                  <button
                    key={d}
                    onClick={() => setDaysPerWeek(d)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                      daysPerWeek === d
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-dark-850 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Session duration */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Duração por sessão</label>
              <div className="flex space-x-2">
                {[30, 45, 60, 90].map(m => (
                  <button
                    key={m}
                    onClick={() => setSessionMinutes(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      sessionMinutes === m
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-dark-850 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Nível de experiência</label>
              <div className="flex space-x-2">
                {[
                  { id: 'beginner', label: 'Iniciante' },
                  { id: 'intermediate', label: 'Intermediário' },
                  { id: 'advanced', label: 'Avançado' }
                ].map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => setExperience(exp.id as any)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      experience === exp.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-dark-850 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCreateStep('limitations')}
                className="px-4 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setCreateStep('variations')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <Sparkles className={gifClass} />
                <span>Continuar</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Variations */}
        {createStep === 'variations' && objectives.length > 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-white">Quantos modelos de treino você quer?</h2>
              <p className="text-xs text-slate-400">Cada modelo terá os mesmos parâmetros, mas com exercícios diferentes para você variar.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setNumVariations(n)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    numVariations === n
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-300'
                      : 'bg-dark-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className={`text-2xl font-bold ${numVariations === n ? 'text-white' : 'text-slate-200'}`}>{n}</p>
                  <p className="text-[11px] font-semibold mt-0.5">modelos</p>
                  <p className={`text-[10px] text-slate-400 mt-1 ${numVariations === n ? 'text-blue-300' : ''}`}>
                    {n === 2 ? '2 treinos distintos' : n === 3 ? '3 treinos distintos' : '4 treinos distintos'}
                  </p>
                </button>
              ))}
            </div>

            {/* Objectives summary */}
            <div className="p-3.5 rounded-2xl bg-dark-900 border border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Resumo do treino</p>
              <div className="flex flex-wrap gap-1.5">
                {objectives.map(o => (
                  <span key={o} className="px-2 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                    {OBJECTIVES.find(ob => ob.id === o)?.label}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                {daysPerWeek} dias/semana · {sessionMinutes} min por sessão ·{" "}
                {experience === 'beginner' ? 'Iniciante' : experience === 'intermediate' ? 'Intermediário' : 'Avançado'}
                {limitations.length > 0 && ` · ${limitations.map(l => DIFFICULTIES_PRETTY[l] || l).join(', ')}`}
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setCreateStep('details')}
                className="px-4 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 className={gifClass + " animate-spin"} />
                    <span>Gerando {numVariations} modelos...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className={gifClass} />
                    <span>Gerar {numVariations} modelos de treino</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Confirmation */}
        {createStep === 'confirm' && generatedWorkouts.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  {generatedWorkouts.length > 1 ? `${generatedWorkouts.length} modelos de treino criados com sucesso!` : 'Treino criado com sucesso!'}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cada modelo foi salvo separadamente em "Meus Treinos".
              </p>
            </div>

            {generatedWorkouts.length > 1 && (
              <div className="flex space-x-2">
                {generatedWorkouts.map((w, wi) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedModel(wi)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      selectedModel === wi
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-dark-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Treino {wi + 1}</span>
                  </button>
                ))}
              </div>
            )}

            {generatedWorkouts[selectedModel] && (() => {
              const w = generatedWorkouts[selectedModel];
              return (
                <div key={w.id} className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{w.title}</h3>
                    {generatedWorkouts.length > 1 && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                        Treino {selectedModel + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{w.subtitle}</p>
                  <div className="space-y-2">
                    {w.exercises?.map((ex, i) => (
                      <div key={ex.id} className="flex items-center justify-between p-2.5 rounded-xl bg-dark-850 border border-slate-800">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{ex.name}</p>
                            <p className="text-[10px] text-slate-400">{ex.muscle_group}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-300 font-semibold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300">
                          {ex.sets} x {ex.reps_target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex space-x-2 pt-2">
              <button
                onClick={goCreate}
                className="flex-1 py-3 rounded-xl bg-dark-850 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition-colors"
              >
                Criar outro
              </button>
              <button
                onClick={() => onNavigateTab('workouts')}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Dumbbell className={gifClass} />
                <span>Ver meus treinos</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ADJUST / IMPROVE / CHAT (chat interface) ────────────────
  const isAdjust = mode === 'adjust';
  const isImprove = mode === 'improve';
  const chatTitle = isAdjust ? 'Ajustar Treino' : isImprove ? 'Melhorar Treino' : 'Conversar com o Coach';
  const chatColor = isAdjust ? 'text-amber-300' : isImprove ? 'text-emerald-300' : 'text-purple-400';

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={() => setMode('home')} className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 flex items-center justify-center shadow-glow-violet">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-base font-bold ${chatColor}`}>{chatTitle}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAdjust ? 'Informe o que precisa ser ajustado no seu treino' : isImprove ? 'Informe o que gostaria de melhorar' : `Conversando como ${profile.nickname || profile.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-dark-950/60 border border-slate-800/80 my-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                isUser ? 'bg-blue-600 text-white' : 'bg-purple-600/30 border border-purple-500/40 text-purple-300'
              }`}>
                {isUser ? profile.name.charAt(0) : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs lg:text-sm leading-relaxed space-y-2 ${
                isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-dark-850 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-line">{msg.message}</div>
                <div className="text-[10px] opacity-60 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!inputText.trim()) return;
          onSendMessage(inputText.trim());
          setInputText('');
        }}
        className="flex items-center space-x-2 pt-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isAdjust ? 'Ex: reduzir a carga hoje, estou dolorido...' : isImprove ? 'Ex: aumentar o peso no supino em 5kg...' : 'Pergunte ao Coach IA...'}
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