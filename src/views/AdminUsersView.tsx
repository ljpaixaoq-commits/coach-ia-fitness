import React, { useEffect, useState } from 'react';
import { UserWithProfile } from '../lib/db';
import {
  ShieldCheck,
  UserPlus,
  Zap,
  Loader2,
  CalendarX,
  CheckSquare,
  Power,
  Users,
  RefreshCw
} from 'lucide-react';

interface AdminUsersViewProps {
  users: UserWithProfile[];
  isAdmin: boolean;
  onLoad: () => Promise<void>;
  onToggleActive: (accountId: string, isActive: boolean) => Promise<void>;
  onSetExpiration: (accountId: string, expiresAt: string | null, days?: number) => Promise<void>;
  error: string | null;
}

interface ExpirationEditorProps {
  user: UserWithProfile;
  onSave: (expiresAt: string | null, days?: number) => Promise<void>;
  onClose: () => void;
}

const ExpirationEditor: React.FC<ExpirationEditorProps> = ({ user, onSave, onClose }) => {
  const [mode, setMode] = useState<'date' | 'days' | 'none'>(
    user.access_expires_at ? 'date' : (user.access_days ? 'days' : 'none')
  );
  const [date, setDate] = useState(user.access_expires_at || '');
  const [days, setDays] = useState(user.access_days?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (mode === 'none') {
        await onSave(null);
      } else if (mode === 'date') {
        await onSave(date || null);
      } else {
        await onSave(null, parseInt(days, 10) || 0);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Expiração de Acesso</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
        <p className="text-xs text-slate-400">
          {user.profile?.name} · {user.profile?.cpf}
        </p>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input type="radio" name="exp" checked={mode === 'none'} onChange={() => setMode('none')} />
            <span>Sem expiração (acesso contínuo)</span>
          </label>
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input type="radio" name="exp" checked={mode === 'date'} onChange={() => setMode('date')} />
            <span>Data de expiração</span>
          </label>
          {mode === 'date' && (
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          )}
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input type="radio" name="exp" checked={mode === 'days'} onChange={() => setMode('days')} />
            <span>Quantidade de dias de acesso</span>
          </label>
          {mode === 'days' && (
            <input type="number" min={1} className={inputClass} value={days} onChange={(e) => setDays(e.target.value)} placeholder="Ex: 30" />
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
          <span>Salvar</span>
        </button>
      </div>
    </div>
  );
};

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  isAdmin,
  onLoad,
  onToggleActive,
  onSetExpiration,
  error
}) => {
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      onLoad().finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const today = new Date().toISOString().split('T')[0];

  const isExpired = (u: UserWithProfile) => !!(u.access_expires_at && u.access_expires_at < today);

  const activeCount = users.filter(u => u.is_active && !isExpired(u)).length;
  const pendingCount = users.filter(u => !u.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Administração de Usuários</h2>
          <p className="text-xs text-slate-400">Gerencie acessos, ativações e expirações de contas</p>
        </div>
        <button
          onClick={() => { setLoading(true); onLoad().finally(() => setLoading(false)); }}
          className="p-2 rounded-xl bg-dark-850 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Recarregar lista"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">{error}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total de contas</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-dark-900 border border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Ativos e válidos</span>
            <Power className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-dark-900 border border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Aguardando aprovação</span>
            <UserPlus className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Users List */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando usuários...
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 rounded-2xl bg-dark-900 border border-slate-800 text-center text-slate-400 text-sm">
          Nenhum usuário cadastrado ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const expired = isExpired(user);
            const statusColor = !user.is_active
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : expired
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
            const statusLabel = !user.is_active ? 'Inativo' : expired ? 'Expirado' : 'Ativo';

            return (
              <div key={user.id} className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Identity */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {user.profile?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold text-white">{user.profile?.name || 'Sem nome'}</p>
                        {user.role === 'admin' && (
                          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <ShieldCheck className="w-3 h-3" /> ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">CPF: {user.profile?.cpf || user.username}</p>
                      <p className="text-[11px] text-slate-500">
                        Última entrada: {user.last_login_at ? new Date(user.last_login_at).toLocaleString('pt-BR') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${statusColor}`}>{statusLabel}</span>

                    {user.access_expires_at && (
                      <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-dark-850 border border-slate-700 text-slate-300 flex items-center space-x-1">
                        <CalendarX className="w-3 h-3" />
                        <span>Expira em {new Date(user.access_expires_at).toLocaleDateString('pt-BR')}</span>
                      </span>
                    )}

                    {/* Toggle Active */}
                    <button
                      disabled={user.role === 'admin' && user.is_active}
                      onClick={() => onToggleActive(user.id, !user.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border flex items-center space-x-1 transition-colors ${
                        user.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          : 'bg-dark-850 border-slate-600 text-slate-400 hover:bg-dark-800'
                      }`}
                      title={user.is_active ? 'Desativar acesso' : 'Ativar acesso'}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{user.is_active ? 'Desativar' : 'Ativar'}</span>
                    </button>

                    {/* Expiration */}
                    <button
                      onClick={() => setEditingUser(user)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-dark-850 border border-slate-600 text-slate-300 hover:bg-dark-800 flex items-center space-x-1 transition-colors'
                        "
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{user.access_expires_at || user.access_days ? 'Editar expiração' : 'Definir expiração'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info note */}
      <div className="p-3 rounded-xl bg-dark-900 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
        <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <span>
          Novos usuários entram como <strong>inativos</strong> e passam por aprovação. Usuários com expiração vencida
          não conseguem acessar o sistema até que um administrador renove o acesso.
        </span>
      </div>

      {editingUser && (
        <ExpirationEditor
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(expiresAt, days) => onSetExpiration(editingUser.id, expiresAt, days)}
        />
      )}
    </div>
  );
};