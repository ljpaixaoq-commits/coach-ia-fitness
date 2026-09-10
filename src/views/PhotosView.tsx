import React, { useState } from 'react';
import { EvolutionPhoto } from '../types';
import { Camera, Plus, ArrowLeftRight } from 'lucide-react';

interface PhotosViewProps {
  photos: EvolutionPhoto[];
  onAddPhoto: (photo: Omit<EvolutionPhoto, 'id' | 'profile_id'>) => void;
}

export const PhotosView: React.FC<PhotosViewProps> = ({ photos, onAddPhoto }) => {
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back'>('front');
  const [selectedPhoto1, setSelectedPhoto1] = useState<EvolutionPhoto | null>(photos[0] || null);
  const [selectedPhoto2, setSelectedPhoto2] = useState<EvolutionPhoto | null>(photos[1] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newWeight, setNewWeight] = useState('84.5');
  const [newNotes, setNewNotes] = useState('');

  const filteredPhotos = photos.filter((p) => p.photo_type === photoType);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    onAddPhoto({
      photo_type: photoType,
      photo_url: newUrl,
      weight_kg: parseFloat(newWeight) || 84.5,
      taken_at: new Date().toISOString().split('T')[0],
      notes: newNotes
    });

    setIsModalOpen(false);
    setNewUrl('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Camera className="w-6 h-6 text-purple-400" />
            <span>Evolução Física & Fotos</span>
          </h2>
          <p className="text-xs text-slate-400">
            Comparação lado a lado por data (Frente, Lado e Costas).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 shadow-glow-violet transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Foto</span>
        </button>
      </div>

      {/* Selector: Frente / Lado / Costas */}
      <div className="flex items-center space-x-2">
        {(['front', 'side', 'back'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setPhotoType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              photoType === type
                ? 'bg-purple-600 text-white shadow-glow-violet'
                : 'bg-dark-850 hover:bg-dark-800 text-slate-400 border border-slate-800'
            }`}
          >
            {type === 'front' ? 'Frente' : type === 'side' ? 'Lado' : 'Costas'}
          </button>
        ))}
      </div>

      {/* Comparação Antes vs Depois */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-purple-400" />
            <span>Comparador Visual Antes / Depois</span>
          </h3>
          <span className="text-xs text-purple-400 font-semibold">Modo Comparação Ativo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Foto 1 (Antes) */}
          <div className="p-3 rounded-2xl bg-dark-900 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">Foto Inicial (Antes)</span>
              <span className="text-blue-400 font-bold">{selectedPhoto1?.taken_at} • {selectedPhoto1?.weight_kg}kg</span>
            </div>
            <div className="aspect-[3/4] bg-dark-950 rounded-xl overflow-hidden relative">
              {selectedPhoto1?.photo_url ? (
                <img
                  src={selectedPhoto1.photo_url}
                  alt="Antes"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Sem foto</div>
              )}
            </div>
          </div>

          {/* Foto 2 (Depois) */}
          <div className="p-3 rounded-2xl bg-dark-900 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">Foto Atual (Depois)</span>
              <span className="text-emerald-400 font-bold">{selectedPhoto2?.taken_at} • {selectedPhoto2?.weight_kg}kg</span>
            </div>
            <div className="aspect-[3/4] bg-dark-950 rounded-xl overflow-hidden relative">
              {selectedPhoto2?.photo_url ? (
                <img
                  src={selectedPhoto2.photo_url}
                  alt="Depois"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Sem foto</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Galeria de Fotos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Todas as Fotos Registradas</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPhotos.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPhoto2(p)}
              className="glass-card p-2 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all space-y-1.5"
            >
              <div className="aspect-[3/4] bg-dark-900 rounded-lg overflow-hidden">
                <img src={p.photo_url} alt="Evolução" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 px-1">
                <span>{p.taken_at}</span>
                <span className="text-white font-bold">{p.weight_kg}kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Adicionar Foto de Evolução</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">URL da Imagem / Foto*</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Peso no Dia (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observações</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: 4 semanas de dieta concluídas"
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
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 shadow-glow-violet"
                >
                  Salvar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
