import React, { useState } from 'react';
import { InjuryPainLog, HealthMetric } from '../types';
import {
  HeartPulse,
  Activity,
  AlertCircle,
  Plus,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface HealthViewProps {
  injuries: InjuryPainLog[];
  healthMetrics: HealthMetric[];
  onUpdatePainLevel: (id: string, level: number) => void;
  onAddInjury: (injury: Omit<InjuryPainLog, 'id' | 'profile_id'>) => void;
}

export const HealthView: React.FC<HealthViewProps> = ({
  injuries,
  healthMetrics,
  onUpdatePainLevel,
  onAddInjury
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bodyPart, setBodyPart] = useState('');
  const [pain, setPain] = useState(3);
  const [symptoms, setSymptoms] = useState('');
  const [treatment, setTreatment] = useState('');

  const knee = injuries.find((i) => i.body_part.toLowerCase().includes('joelho')) || injuries[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyPart) return;

    onAddInjury({
      body_part: bodyPart,
      pain_level: pain,
      status: 'monitoring',
      symptoms,
      treatment_notes: treatment,
      restricted_exercises: ['Sobrecarga extrema'],
      recommended_exercises: ['Isometria', 'Mobilidade'],
      logged_at: new Date().toISOString()
    });

    setIsModalOpen(false);
    setBodyPart('');
    setPain(3);
    setSymptoms('');
    setTreatment('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <HeartPulse className="w-6 h-6 text-rose-400" />
            <span>Saúde & Histórico Articular</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento contínuo de dores, lesões (ex: joelho direito), pressão arterial e exames.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-rose transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Lesão / Dor</span>
        </button>
      </div>

      {/* 1. DESTAQUE: ACOMPANHAMENTO DO JOELHO DIREITO */}
      {knee && (
        <div className="glass-card rounded-2xl p-6 border border-rose-500/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Monitoramento Ativo
                </span>
                <span className="text-xs text-slate-400">Início: {knee.injury_date || 'Junho/2026'}</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">{knee.body_part}</h3>
              <p className="text-xs text-slate-300">{knee.symptoms}</p>
            </div>

            {/* Slider / Escala de Dor 0-10 */}
            <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-2 min-w-[260px]">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Nível de Dor Hoje:</span>
                <span className={knee.pain_level > 5 ? 'text-rose-400' : 'text-emerald-400'}>
                  {knee.pain_level} / 10 ({knee.pain_level === 0 ? 'Sem dor' : knee.pain_level <= 3 ? 'Leve' : 'Moderada'})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={knee.pain_level}
                onChange={(e) => onUpdatePainLevel(knee.id, parseInt(e.target.value, 10))}
                aria-label="Nível de dor hoje"
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 (Sem dor)</span>
                <span>5 (Moderada)</span>
                <span>10 (Intensa)</span>
              </div>
            </div>
          </div>

          {/* Diretrizes de Treino & Cuidados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Exercícios Restritos / Proibidos</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                {knee.restricted_exercises?.map((re, idx) => (
                  <li key={idx}>{re}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Protocolo de Fortalecimento Seguro</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                {knee.recommended_exercises?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {knee.treatment_notes && (
            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
              <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Observações de Tratamento:</strong> {knee.treatment_notes}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. SINAIS VITAIS (Pressão e Glicemia) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">Pressão Arterial</div>
          <div className="text-xl font-extrabold text-white">118 / 78 mmHg</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Ótima / Normotenso</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">Glicemia em Jejum</div>
          <div className="text-xl font-extrabold text-white">89 mg/dL</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Excelente controle metabólico</div>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400">Frequência Cardíaca Repouso</div>
          <div className="text-xl font-extrabold text-white">58 bpm</div>
          <div className="text-[11px] text-blue-400 font-semibold">Bom condicionamento aeróbico</div>
        </div>
      </div>

      {/* Modal Add Injury */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Registrar Dor / Lesão</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Local do Corpo*</label>
                <input
                  type="text"
                  required
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                  placeholder="Ex: Ombro Esquerdo ou Lombar"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nível Inicial de Dor (0 a 10): {pain}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pain}
                  onChange={(e) => setPain(parseInt(e.target.value, 10))}
                  aria-label="Nível inicial de dor"
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sintomas / Movimentos que incomodam</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Ex: Dor ao fazer desenvolvimento..."
                  rows={2}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tratamento / Cuidados</label>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Ex: Gelo pós treino + alongamento"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-dark-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 shadow-glow-rose"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
