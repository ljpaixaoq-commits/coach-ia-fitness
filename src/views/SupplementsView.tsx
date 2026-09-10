import React, { useState } from 'react';
import { Supplement } from '../types';
import {
  Pill,
  Sparkles,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Package,
  Layers
} from 'lucide-react';

interface SupplementsViewProps {
  supplements: Supplement[];
  onTakeDose: (id: string) => void;
  onAddSupplement: (supp: Omit<Supplement, 'id' | 'profile_id'>) => void;
}

export const SupplementsView: React.FC<SupplementsViewProps> = ({
  supplements,
  onTakeDose,
  onAddSupplement
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [recipe, setRecipe] = useState('');
  const [time, setTime] = useState('');
  const [stock, setStock] = useState('30');
  const [isCustom, setIsCustom] = useState(false);

  const customBlend = supplements.find((s) => s.is_custom_blend);
  const otherSupplements = supplements.filter((s) => !s.is_custom_blend);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;

    onAddSupplement({
      name,
      dosage,
      recipe_formula: recipe || undefined,
      recommended_time: time || 'Horário habitual',
      current_stock_doses: parseInt(stock, 10) || 30,
      min_stock_alert: 7,
      unit: 'doses',
      is_custom_blend: isCustom,
      is_active: true
    });

    setIsModalOpen(false);
    setName('');
    setDosage('');
    setRecipe('');
    setTime('');
    setStock('30');
    setIsCustom(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Pill className="w-6 h-6 text-amber-400" />
            <span>Suplementos & Mistura Personalizada</span>
          </h2>
          <p className="text-xs text-slate-400">
            Fórmula manipulada sob medida, controle de estoque inteligente e vitaminas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-amber transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Suplemento</span>
        </button>
      </div>

      {/* 1. SEÇÃO EXCLUSIVA: SUA MISTURA PERSONALIZADA */}
      {customBlend && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-dark-900 to-dark-950 border border-amber-500/40 p-6 shadow-glow-amber space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Fórmula Exclusiva
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{customBlend.recommended_time}</span>
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">{customBlend.name}</h3>
              </div>
            </div>

            {/* Action Take Dose */}
            <button
              onClick={() => onTakeDose(customBlend.id)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar Dose Ingerida</span>
            </button>
          </div>

          {/* Receita da Mistura */}
          <div className="p-4 rounded-xl bg-dark-850/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Receita & Composição da Mistura</span>
              </span>
              <span className="text-amber-400">{customBlend.dosage}</span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed bg-dark-900 p-3 rounded-lg border border-slate-800">
              {customBlend.recipe_formula || 'Creatina 5g + Beta-Alanina 3g + L-Citrulina 6g + Cafeína 200mg + Taurina 1g'}
            </p>
          </div>

          {/* Estoque & Alertas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 space-y-1">
              <div className="text-slate-400">Estoque Atual</div>
              <div className="text-lg font-black text-white">{customBlend.current_stock_doses} doses</div>
              <div className="text-[11px] text-slate-500">Suficiente para ~{customBlend.current_stock_doses} dias</div>
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 space-y-1">
              <div className="text-slate-400">Status de Reposição</div>
              {customBlend.current_stock_doses <= customBlend.min_stock_alert ? (
                <div className="text-rose-400 font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Estoque Baixo! Pedir nova receita</span>
                </div>
              ) : (
                <div className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Estoque Seguro</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-dark-850 border border-slate-800 space-y-1">
              <div className="text-slate-400">Alerta de Consumo</div>
              <div className="text-amber-300 font-semibold">Tomar 30min pré-treino</div>
              <div className="text-[11px] text-slate-500">Potencializa vasodilatação e foco</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OUTROS SUPLEMENTOS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Vitaminas & Outros Suplementos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {otherSupplements.map((supp) => (
            <div
              key={supp.id}
              className="p-4 rounded-2xl bg-dark-850 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-white">{supp.name}</h4>
                  <span className="text-xs font-semibold text-blue-400">{supp.dosage}</span>
                </div>
                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{supp.recommended_time}</span>
                </p>
                {supp.recipe_formula && (
                  <p className="text-[11px] text-slate-400 italic">{supp.recipe_formula}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Estoque: <strong className="text-white">{supp.current_stock_doses} {supp.unit}</strong></span>
                <button
                  onClick={() => onTakeDose(supp.id)}
                  className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-slate-200"
                >
                  Tomar Dose
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Supplement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Adicionar Suplemento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome do Suplemento*</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Vitamina D3 ou Fórmula Personalizada"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dosagem Diária*</label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Ex: 1 cápsula ou 1 scoop (15g)"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Receita / Composição (se manipulado)</label>
                <textarea
                  value={recipe}
                  onChange={(e) => setRecipe(e.target.value)}
                  placeholder="Ex: Creatina 5g + Beta-Alanina 3g..."
                  rows={2}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Horário de Ingestão</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ex: Pela manhã"
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Estoque Inicial (doses)</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isCustom"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="rounded text-amber-500 bg-dark-800"
                />
                <label htmlFor="isCustom" className="text-slate-300">É a Mistura Personalizada exclusiva?</label>
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
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-glow-amber"
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
