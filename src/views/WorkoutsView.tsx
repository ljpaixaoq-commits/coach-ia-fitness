import React, { useState } from 'react';
import { Workout, WorkoutExercise, WorkoutLog, WorkoutResult } from '../types';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Circle,
  Timer,
  Info,
  Flame,
  Plus,
  Sparkles,
  Save,
  Video,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  Pencil,
  Link as LinkIcon,
  X,
  Clock,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkoutsViewProps {
  workouts: Workout[];
  lastWorkoutLog: WorkoutLog | null;
  workoutResult: WorkoutResult | null;
  onToggleExercise: (workoutId: string, exerciseId: string) => void;
  onToggleSet: (workoutId: string, exerciseId: string, setNumber: number) => void;
  onToggleWorkout: (workoutId: string) => void;
  onUpdateWeight: (workoutId: string, exerciseId: string, newWeightKg: number) => void;
  onUpdateSetWeight: (workoutId: string, exerciseId: string, setNumber: number, newWeightKg: number) => void;
  onUpdateDuration: (workoutId: string, exerciseId: string, newDurationMin: number) => void;
  onUpdateVideo: (workoutId: string, exerciseId: string, videoUrl: string) => void;
  onStartRestTimer: (seconds: number) => void;
  cardioTimer: { workoutId: string; exerciseId: string; endsAt: number } | null;
  cardioRemaining: number | null;
  onStartCardioTimer: (workoutId: string, exerciseId: string, durationSeconds: number) => void;
  onStopCardioTimer: () => void;
  onAskAIForAdaptation: (prompt: string) => void;
  onConfirmWorkoutResult: () => void;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  workouts,
  lastWorkoutLog,
  workoutResult,
  onToggleExercise,
  onToggleSet,
  onToggleWorkout,
  onUpdateWeight,
  onUpdateSetWeight,
  onUpdateDuration,
  onUpdateVideo,
  onStartRestTimer,
  cardioTimer,
  cardioRemaining,
  onStartCardioTimer,
  onStopCardioTimer,
  onAskAIForAdaptation,
  onConfirmWorkoutResult
}) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    workouts[0]?.id || ''
  );
  const [activeVideoModal, setActiveVideoModal] = useState<WorkoutExercise | null>(null);
  const [tempWeights, setTempWeights] = useState<Record<string, string>>({});
  const [editingSetWeightKey, setEditingSetWeightKey] = useState<string | null>(null);
  const [tempSetWeight, setTempSetWeight] = useState<string>('');
  const [editingDurationExId, setEditingDurationExId] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState<string>('');
  const [editingVideoExId, setEditingVideoExId] = useState<string | null>(null);
  const [tempVideoUrl, setTempVideoUrl] = useState<string>('');
  const [showPendingFinalize, setShowPendingFinalize] = useState(false);

  const getWorkoutTabLabel = (w: Workout, index: number): string => {
    if (w.ai_generated) {
      const aiIndex = workouts.filter(k => k.ai_generated).findIndex(k => k.id === w.id);
      return aiIndex >= 0 ? `Treino ${aiIndex + 1}` : `Treino ${index + 1}`;
    }
    return w.title.split(' - ')[0];
  };

  const currentWorkout = workouts.find((w) => w.id === selectedWorkoutId) || workouts[0];

  const lastLoggedWorkout = lastWorkoutLog
    ? workouts.find(w => w.id === lastWorkoutLog.workout_id)
    : undefined;
  const lastWorkoutLabel = lastLoggedWorkout
    ? getWorkoutTabLabel(lastLoggedWorkout, workouts.indexOf(lastLoggedWorkout))
    : (lastWorkoutLog?.workout_title || 'Treino realizado');

  const totalExercises = currentWorkout?.exercises?.length || 0;
  const completedExercises = currentWorkout?.exercises?.filter((e) => e.completed).length || 0;
  const progressPct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const handleSetClick = (workoutId: string, ex: WorkoutExercise, setNumber: number) => {
    onToggleSet(workoutId, ex.id, setNumber);

    // If this was the last unchecked set, trigger confetti celebratory effect
    const uncheckedSets = (ex.sets_data || []).filter(s => !s.completed && s.set_number !== setNumber);
    if (uncheckedSets.length === 0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      // Start rest timer automatically after a set!
      if (ex.rest_time_seconds > 0) {
        onStartRestTimer(ex.rest_time_seconds);
      }
    }
  };

  const handleSaveWeight = (workoutId: string, exerciseId: string) => {
    const val = parseFloat(tempWeights[exerciseId] ?? '');
    if (!isNaN(val) && val >= 0) {
      onUpdateWeight(workoutId, exerciseId, val);
      setTempWeights(prev => ({ ...prev, [exerciseId]: String(val) }));
    }
  };

  const startEditSetWeight = (exerciseId: string, setNumber: number, currentWeight: number) => {
    setEditingSetWeightKey(`${exerciseId}#${setNumber}`);
    setTempSetWeight(String(currentWeight));
  };

  const handleSaveSetWeight = (workoutId: string, exerciseId: string, setNumber: number) => {
    const val = parseFloat(tempSetWeight);
    if (!isNaN(val) && val >= 0) {
      onUpdateSetWeight(workoutId, exerciseId, setNumber, val);
    }
    setEditingSetWeightKey(null);
  };

  const handleSaveDuration = (workoutId: string, exerciseId: string) => {
    const val = parseInt(tempDuration, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateDuration(workoutId, exerciseId, val);
      setEditingDurationExId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}min ${s}s`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  };

  const cardioSeconds = (ex: WorkoutExercise): number => {
    const mins = ex.duration_minutes || parseFloat((ex.reps_target || '').match(/(\d+)/)?.[1] || '20');
    return Math.max(1, Math.round(mins * 60));
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleConfirmResult = () => {
    if (workoutResult) {
      const idx = workouts.findIndex(w => w.id === workoutResult.workoutId);
      const next = workouts[(idx + 1) % workouts.length];
      if (next) setSelectedWorkoutId(next.id);
    }
    onConfirmWorkoutResult();
  };

  const handleFinalizeClick = () => {
    if (!currentWorkout) return;
    const pending = (currentWorkout.exercises || []).filter(e => !e.completed).length;
    if (pending > 0) {
      setShowPendingFinalize(true);
    } else {
      onToggleWorkout(currentWorkout.id);
    }
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`;
    }
    return url;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header & Workout Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Dumbbell className="w-6 h-6 text-blue-400" />
            <span>Treinos, Séries & Progressão de Carga</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhe série por série, visualize vídeos de execução, registre a evolução de carga e controle o tempo de cardio.
          </p>
        </div>

        {/* Workout Tabs / Fichas */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {workouts.map((w, wi) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkoutId(w.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedWorkoutId === w.id
                  ? 'bg-blue-600 text-white shadow-glow-blue'
                  : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border border-slate-800'
              }`}
            >
              {getWorkoutTabLabel(w, wi)}
              {w.id === lastWorkoutLog?.workout_id && (
                <span className="ml-1.5 text-[10px] font-black text-emerald-400" title="Último treino realizado">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 1.5 Histórico: último treino realizado */}
      {lastWorkoutLog && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-dark-850/80 border border-slate-800 px-4 py-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="font-bold">Último treino realizado:</span>
            <span className="font-black text-white">{lastWorkoutLabel}</span>
            <span className="text-slate-500">· {formatDate(lastWorkoutLog.completed_at)}</span>
          </div>
          <div className="flex items-center space-x-4 ml-auto text-slate-400">
            <span>⚖️ <b className="text-white">{lastWorkoutLog.total_volume_kg} kg</b> volume</span>
            <span>⏱️ <b className="text-white">{formatDuration(lastWorkoutLog.duration_seconds)}</b></span>
          </div>
        </div>
      )}

      {/* 2. Workout Hero Card */}
      {currentWorkout && (
        <div className="glass-card rounded-2xl p-5 lg:p-6 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentWorkout.category}
                </span>
                {currentWorkout.ai_generated && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Adaptado por IA</span>
                  </span>
                )}
                {currentWorkout.is_completed && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Finalizado</span>
                  </span>
                )}
                <span className="text-xs text-slate-400">{currentWorkout.estimated_duration_min} minutos estimados</span>
              </div>
              <h3 className="text-xl font-black text-white">{currentWorkout.title}</h3>
              <p className="text-xs text-slate-400">{currentWorkout.subtitle}</p>
              {lastWorkoutLog && currentWorkout.id === lastWorkoutLog.workout_id && (
                <p className="text-[11px] text-amber-400/90 mt-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Este foi o último treino realizado. Você pode repeti-lo ou escolher outra ficha.</span>
                </p>
              )}
            </div>

            {/* Progress & AI Action */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">Progresso da Sessão</div>
                <div className="text-lg font-black text-emerald-400">{completedExercises}/{totalExercises} exercícios ({progressPct}%)</div>
              </div>
              <button
                onClick={handleFinalizeClick}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  currentWorkout.is_completed
                    ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-glow-emerald'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{currentWorkout.is_completed ? 'Treino Finalizado ✔' : 'Finalizar Treino'}</span>
              </button>
              <button
                onClick={() => onAskAIForAdaptation(`Estou realizando o ${currentWorkout.title}. Gostaria de sugestão para trocar algum exercício ou ajustar cargas hoje.`)}
                className="px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir Ajuste à IA</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-dark-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 3. Exercise List with Sets & Video */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
          <span>Exercícios da Sessão</span>
          <span className="text-xs normal-case text-slate-500 font-normal">Defina a carga no campo para aplicar em todas as séries · ou ajuste o peso direto em cada série</span>
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {currentWorkout?.exercises?.map((ex, idx) => {
            const isCardio = ex.exercise_type === 'cardio';
            const isCardioRunning = isCardio && cardioTimer?.exerciseId === ex.id;

            return (
              <div
                key={ex.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ex.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-dark-850/95 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Exercise Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-start space-x-3">
                    {/* Checkbox Geral de Exercício */}
                    <button
                      onClick={() => onToggleExercise(currentWorkout.id, ex.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      title={ex.completed ? 'Marcar exercício como pendente' : 'Concluir todas as séries'}
                    >
                      {ex.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                        <h5
                          className={`text-base font-bold ${
                            ex.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {ex.name}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCardio ? 'bg-cyan-500/20 text-cyan-300' : 'bg-dark-800 text-slate-300'
                        }`}>
                          {ex.muscle_group}
                        </span>
                        {ex.completed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Finalizado ✔
                          </span>
                        )}
                      </div>

                      {ex.demo_instructions && (
                        <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">
                          💡 {ex.demo_instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Video and Rest Timer Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {ex.video_url && (
                      <button
                        onClick={() => setActiveVideoModal(ex)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-glow-violet"
                        title="Ver vídeo demonstrativo do exercício"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver Vídeo</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (editingVideoExId === ex.id) {
                          setEditingVideoExId(null);
                        } else {
                          setEditingVideoExId(ex.id);
                          setTempVideoUrl(ex.video_url || '');
                        }
                      }}
                      className="p-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-400 hover:text-blue-300 text-xs font-bold flex items-center space-x-1 transition-all"
                      title={ex.video_url ? 'Editar vídeo demonstrativo' : 'Adicionar vídeo demonstrativo'}
                    >
                      {ex.video_url
                        ? <Pencil className="w-3.5 h-3.5" />
                        : <LinkIcon className="w-3.5 h-3.5" />}
                    </button>

                    {!isCardio && ex.rest_time_seconds > 0 && (
                      <button
                        onClick={() => onStartRestTimer(ex.rest_time_seconds)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center space-x-1"
                        title="Iniciar cronômetro de descanso"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>{ex.rest_time_seconds}s</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Video URL Editor */}
                {editingVideoExId === ex.id && (
                  <div className="mt-3 p-3 rounded-xl bg-dark-900 border border-slate-700 space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400">
                      <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vídeo demonstrativo (cole um link do YouTube)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tempVideoUrl}
                        onChange={(e) => setTempVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 bg-dark-850 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => {
                          onUpdateVideo(currentWorkout.id, ex.id, tempVideoUrl.trim());
                          setEditingVideoExId(null);
                        }}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1"
                        title="Salvar link do vídeo"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Salvar</span>
                      </button>
                      <button
                        onClick={() => setEditingVideoExId(null)}
                        className="p-2 rounded-lg bg-dark-850 border border-slate-700 text-slate-400 hover:text-white"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Body: CARDIO MODE or STRENGTH SET-BY-SET TRACKER */}
                <div className="pt-3">
                  {isCardio ? (
                    // CARDIO TIME MODE
                    <div className="p-4 rounded-xl bg-dark-900 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Exercício Baseado em Tempo</span>
                        <div className="text-xl font-black text-white">
                          {ex.duration_minutes || 20} minutos de atividade
                        </div>
                        <p className="text-xs text-slate-400">Cardio sem repetições. Ajuste a duração abaixo conforme sua evolução:</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {editingDurationExId === ex.id ? (
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              value={tempDuration}
                              onChange={(e) => setTempDuration(e.target.value)}
                              placeholder="minutos"
                              className="w-20 bg-dark-850 border border-cyan-500 rounded-lg px-2 py-1 text-sm text-white font-bold text-center"
                            />
                            <span className="text-xs text-slate-400">min</span>
                            <button
                              onClick={() => handleSaveDuration(currentWorkout.id, ex.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                              title="Salvar novo tempo de cardio"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingDurationExId(ex.id);
                              setTempDuration(String(ex.duration_minutes || 20));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-xs font-bold text-slate-300 border border-slate-700 flex items-center space-x-1"
                          >
                            <span>Ajustar Duração</span>
                          </button>
                        )}

                        {isCardioRunning ? (
                          <div className="flex items-center space-x-2">
                            <div className="px-3 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/60 text-cyan-200 font-black text-sm tabular-nums flex items-center space-x-1.5 shadow-glow-cyan">
                              <Timer className="w-4 h-4 animate-pulse" />
                              <span>{formatCountdown(cardioRemaining ?? 0)}</span>
                            </div>
                            <button
                              onClick={onStopCardioTimer}
                              className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white transition-all"
                              title="Parar o cronômetro de cardio"
                            >
                              Parar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onStartCardioTimer(currentWorkout.id, ex.id, cardioSeconds(ex))}
                            disabled={ex.completed}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                              ex.completed
                                ? 'bg-emerald-600 text-white shadow-glow-emerald cursor-default'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-glow-cyan'
                            }`}
                          >
                            {ex.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                            <span>{ex.completed ? 'Cardio Concluído ✔' : `Iniciar (${formatDuration(cardioSeconds(ex))})`}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // STRENGTH SET-BY-SET TRACKER
                    <div className="space-y-3">
                      {/* Carga padrão: aplica em todas as séries */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-dark-900/60 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Carga Padrão Atual:</span>
                          <span className="text-sm font-black text-blue-400">{ex.default_weight_kg} kg</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={tempWeights[ex.id] ?? String(ex.default_weight_kg)}
                            onChange={(e) => setTempWeights(prev => ({ ...prev, [ex.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveWeight(currentWorkout.id, ex.id);
                            }}
                            placeholder="Nova carga"
                            className="w-20 bg-dark-850 border border-slate-600 focus:border-blue-500 rounded-lg px-2 py-1 text-xs text-white font-bold text-center outline-none transition-colors"
                            title="Digite a carga e aplique em todas as séries"
                          />
                          <span className="text-slate-400">kg</span>
                          <button
                            onClick={() => handleSaveWeight(currentWorkout.id, ex.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1 transition-all shadow-sm"
                            title="Aplicar esta carga em todas as séries"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Aplicar em todas</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Sets Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {ex.sets_data?.map((set) => {
                          const isEditingWeight = editingSetWeightKey === `${ex.id}#${set.set_number}`;
                          return (
                            <div
                              key={set.set_number}
                              onClick={() => handleSetClick(currentWorkout.id, ex, set.set_number)}
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                                set.completed
                                  ? 'bg-emerald-600/25 border-emerald-500 text-white shadow-glow-emerald scale-[1.02]'
                                  : 'bg-dark-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-dark-850'
                              }`}
                            >
                              <div className="flex items-center space-x-1 text-xs font-bold">
                                <span>Série {set.set_number}</span>
                                {set.completed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </div>

                              {isEditingWeight ? (
                                <div
                                  className="flex items-center space-x-1 mt-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={tempSetWeight}
                                    onChange={(e) => setTempSetWeight(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveSetWeight(currentWorkout.id, ex.id, set.set_number);
                                    }}
                                    className="w-16 bg-dark-850 border border-blue-500 rounded-lg px-1.5 py-0.5 text-sm text-white font-bold text-center outline-none"
                                    autoFocus
                                  />
                                  <span className="text-[10px] text-slate-400">kg</span>
                                  <button
                                    onClick={() => handleSaveSetWeight(currentWorkout.id, ex.id, set.set_number)}
                                    className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                                    title="Salvar carga desta série"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditSetWeight(ex.id, set.set_number, set.weight_kg);
                                  }}
                                  className="text-sm font-black mt-0.5 inline-flex items-center space-x-1 hover:text-blue-300 transition-colors"
                                  title="Editar carga desta série"
                                >
                                  <span>{set.weight_kg} kg</span>
                                  <Pencil className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                                </button>
                              )}

                              <div className="text-[11px] text-slate-400">
                                {set.reps_target} reps
                              </div>
                              <div className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                set.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-dark-800 text-slate-400'
                              }`}>
                                {set.completed ? 'Concluída' : 'Tocar p/ Concluir'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Video Demonstration Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{activeVideoModal.muscle_group}</span>
                <h3 className="text-lg font-black text-white">{activeVideoModal.name}</h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Video Player Embed */}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative">
              {getYoutubeEmbedUrl(activeVideoModal.video_url) ? (
                <iframe
                  src={getYoutubeEmbedUrl(activeVideoModal.video_url)!}
                  title={activeVideoModal.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center space-y-2">
                  <Video className="w-8 h-8 text-slate-600" />
                  <span>Vídeo demonstrativo para {activeVideoModal.name}</span>
                </div>
              )}
            </div>

            {/* Instruções rápidas */}
            {activeVideoModal.demo_instructions && (
              <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{activeVideoModal.demo_instructions}</p>
              </div>
            )}

            <div className="flex gap-3">
              {activeVideoModal.video_url && (
                <a
                  href={activeVideoModal.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir no YouTube</span>
                </a>
              )}
              <button
                onClick={() => setActiveVideoModal(null)}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-violet"
              >
                Entendido, voltar ao treino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Aviso de exercícios pendentes ao finalizar */}
      {showPendingFinalize && currentWorkout && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-black text-white">Exercícios pendentes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ainda existem <b className="text-amber-300">{((currentWorkout.exercises || []).filter(e => !e.completed).length)} exercício(s)</b> não concluído(s) neste treino. Deseja finalizar mesmo assim?
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowPendingFinalize(false)}
                className="flex-1 py-3 rounded-xl bg-dark-850 border border-slate-700 hover:bg-dark-800 text-slate-200 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowPendingFinalize(false);
                  onToggleWorkout(currentWorkout.id);
                }}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-glow-amber"
              >
                Finalizar mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Resumo do Treino Finalizado */}
      {workoutResult && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-emerald-500/40 rounded-3xl p-6 lg:p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Treino Finalizado! 🎉</h3>
              <p className="text-xs text-slate-400">{workoutResult.workoutTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-dark-850 border border-slate-700 text-center space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Peso Total</div>
                <div className="text-2xl font-black text-emerald-400">{workoutResult.totalVolumeKg} kg</div>
                <div className="text-[10px] text-slate-500">volume levantado</div>
              </div>
              <div className="p-4 rounded-2xl bg-dark-850 border border-slate-700 text-center space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tempo</div>
                <div className="text-2xl font-black text-blue-400">{formatDuration(workoutResult.durationSeconds)}</div>
                <div className="text-[10px] text-slate-500">de treino</div>
              </div>
            </div>

            <button
              onClick={handleConfirmResult}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-glow-emerald transition-all"
            >
              Confirmar e Ir para o Próximo Treino →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};