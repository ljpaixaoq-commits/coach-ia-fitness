import React, { useEffect, useState, useMemo } from 'react';
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
  RefreshCw,
  Search,
  Pencil,
  X,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';

type FilterStatus = 'all' | 'active' | 'pending' | 'inactive' | 'expired';

function buildDate(day: string, month: string, year: string): { value: string; error: string | null } {
  const dd = parseInt(day, 10) || 0;
  const mm = parseInt(month, 10) || 0;
  const yyyy = year.length === 4 ? parseInt(year, 10) : 0;
  const fullYear = new Date().getFullYear();
  if (!dd || dd > 31) return { value: '', error: 'Informe um dia válido (1 a 31).' };
  if (!mm || mm > 12) return { value: '', error: 'Informe um mês válido (1 a 12).' };
  if (!yyyy || yyyy < 1900 || yyyy > fullYear) return { value: '', error: `Informe um ano válido (1900 a ${fullYear}).` };
  return { value: `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`, error: null };
}

const BirthDateFields: React.FC<{
  day: string;
  month: string;
  year: string;
  onDayChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
}> = ({ day, month, year, onDayChange, onMonthChange, onYearChange }) => {
  const fieldClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white text-sm text-center focus:outline-none focus:border-blue-500 transition-colors";
  const digitsOnly = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);
  return (
    <div>
      <div className="mb-1 text-xs text-slate-400">Data de nascimento</div>
      <div className="grid grid-cols-3 gap-2">
        <input className={fieldClass} type="text" inputMode="numeric" maxLength={2} required value={day} onChange={(e) => onDayChange(digitsOnly(e.target.value, 2))} placeholder="Dia" aria-label="Dia" />
        <input className={fieldClass} type="text" inputMode="numeric" maxLength={2} required value={month} onChange={(e) => onMonthChange(digitsOnly(e.target.value, 2))} placeholder="Mês" aria-label="Mês" />
        <input className={fieldClass} type="text" inputMode="numeric" maxLength={4} required value={year} onChange={(e) => onYearChange(digitsOnly(e.target.value, 4))} placeholder="Ano" aria-label="Ano" />
      </div>
    </div>
  );
};

interface AdminUsersViewProps {
  users: UserWithProfile[];
  isAdmin: boolean;
  onLoad: () => Promise<void>;
  onToggleActive: (accountId: string, isActive: boolean) => Promise<void>;
  onSetExpiration: (accountId: string, expiresAt: string | null, days?: number) => Promise<void>;
  onCreateUser?: (input: { name: string; cpf: string; birthDate: string; email?: string; nickname: string; avatarUrl?: string }, password: string) => Promise<void>;
  onUpdateUser?: (accountId: string, data: { name?: string; cpf?: string; birth_date?: string; email?: string; gender?: string; nickname?: string; avatar_url?: string }) => Promise<void>;
  onUpdatePassword?: (accountId: string, newPassword: string) => Promise<void>;
  error: string | null;
}

const EditUserModal: React.FC<{
  user: UserWithProfile;
  onSave: (data: { name?: string; cpf?: string; birth_date?: string; email?: string; nickname?: string; avatar_url?: string }) => Promise<void>;
  onSavePassword?: (newPassword: string) => Promise<void>;
  onClose: () => void;
}> = ({ user, onSave, onSavePassword, onClose }) => {
  const [name, setName] = useState(user.profile?.name || '');
  const [nickname, setNickname] = useState(user.profile?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(user.profile?.avatar_url || '');
  const [cpf, setCpf] = useState(user.profile?.cpf || '');
  const [birthDay, setBirthDay] = useState(user.profile?.birth_date?.split('-')[2] || '');
  const [birthMonth, setBirthMonth] = useState(user.profile?.birth_date?.split('-')[1] || '');
  const [birthYear, setBirthYear] = useState(user.profile?.birth_date?.split('-')[0] || '');
  const [email, setEmail] = useState(user.profile?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fmtCPF = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
    if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
  };

  const handleSave = async () => {
    setError('');
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) { setError('CPF deve ter 11 dígitos.'); return; }
    let birthDate = '';
    if (birthDay || birthMonth || birthYear) {
      const r = buildDate(birthDay, birthMonth, birthYear);
      if (r.error) { setError(r.error); return; }
      birthDate = r.value;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), nickname: nickname.trim(), avatar_url: avatarUrl || undefined, cpf: digits, birth_date: birthDate, email: email || undefined });
      setSuccess('Dados atualizados com sucesso!');
      setTimeout(() => onClose(), 1000);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    setError('');
    if (newPassword.length < 4) { setError('A senha deve ter ao menos 4 caracteres.'); return; }
    if (!onSavePassword) return;
    setSaving(true);
    try {
      await onSavePassword(newPassword);
      setSuccess('Senha atualizada com sucesso!');
      setShowPasswordField(false);
      setNewPassword('');
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Editar Usuário</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
        <p className="text-xs text-slate-400">Conta: {user.username}</p>
        {error && <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span></div>}
        {success && <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{success}</span></div>}
        <div className="space-y-3">
          <input className={inputClass} type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputClass} type="text" placeholder="Apelido" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <input className={inputClass} type="text" placeholder="URL do avatar (opcional)" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          <input className={inputClass} type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(fmtCPF(e.target.value))} />
          <BirthDateFields day={birthDay} month={birthMonth} year={birthYear} onDayChange={setBirthDay} onMonthChange={setBirthMonth} onYearChange={setBirthYear} />
          <input className={inputClass} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
          <span>Salvar Dados</span>
        </button>
        <div className="border-t border-slate-800 pt-4">
          {!showPasswordField ? (
            <button onClick={() => { setShowPasswordField(true); setError(''); setSuccess(''); }} className="w-full py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-slate-300 text-sm font-bold flex items-center justify-center space-x-2 hover:bg-dark-800 transition-colors">
              <Zap className="w-4 h-4" /><span>Alterar Senha</span>
            </button>
          ) : (
            <div className="space-y-3">
              <input className={inputClass} type="password" placeholder="Nova senha (min. 4)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="flex space-x-2">
                <button onClick={handlePasswordChange} disabled={saving || newPassword.length < 4} className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center space-x-1 disabled:opacity-60">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} <span>Atualizar Senha</span>
                </button>
                <button onClick={() => { setShowPasswordField(false); setNewPassword(''); }} className="px-3 py-2 rounded-xl bg-dark-850 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateUserModal: React.FC<{
  onSave: (input: { name: string; cpf: string; birthDate: string; email?: string; nickname: string; avatarUrl?: string }, password: string) => Promise<void>;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fmtCPF = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
    if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
    return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError('Informe o nome.'); return; }
    if (!nickname.trim()) { setError('Informe o apelido.'); return; }
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) { setError('CPF deve ter 11 dígitos.'); return; }
    const r = buildDate(birthDay, birthMonth, birthYear);
    if (r.error) { setError(r.error); return; }
    const birthDate = r.value;
    if (password.length < 4) { setError('A senha deve ter ao menos 4 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), nickname: nickname.trim(), avatarUrl: avatarUrl || undefined, cpf: digits, birthDate, email: email || undefined }, password);
      setSuccess('Usuário criado com sucesso!');
      setTimeout(() => onClose(), 1200);
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Novo Usuário</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
        {error && <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"><AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span></div>}
        {success && <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{success}</span></div>}
        <div className="space-y-3">
          <input className={inputClass} type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inputClass} type="text" placeholder="Apelido*" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <input className={inputClass} type="text" placeholder="URL do avatar (opcional)" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          <input className={inputClass} type="text" placeholder="CPF (somente números)" value={cpf} onChange={(e) => setCpf(fmtCPF(e.target.value))} />
          <BirthDateFields day={birthDay} month={birthMonth} year={birthYear} onDayChange={setBirthDay} onMonthChange={setBirthMonth} onYearChange={setBirthYear} />
          <input className={inputClass} type="email" placeholder="E-mail (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputClass} type="password" placeholder="Senha (min. 4)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className={inputClass} type="password" placeholder="Confirmar senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} <span>Criar Usuário</span>
        </button>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// MAIN ADMIN VIEW
// ────────────────────────────────────────────────────────────────
export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  isAdmin,
  onLoad,
  onToggleActive,
  onSetExpiration,
  onCreateUser,
  onUpdateUser,
  onUpdatePassword,
  error
}) => {
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [editingExpiration, setEditingExpiration] = useState<UserWithProfile | null>(null);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      onLoad().finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const today = new Date().toISOString().split('T')[0];

  const isExpired = (u: UserWithProfile) => !!(u.access_expires_at && u.access_expires_at < today);
  const isPending = (u: UserWithProfile) => !u.is_active && !u.last_login_at;
  const isInactive = (u: UserWithProfile) => !u.is_active && !!u.last_login_at;

  const counts = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active && !isExpired(u)).length,
    pending: users.filter(u => isPending(u)).length,
    inactive: users.filter(u => isInactive(u)).length,
    expired: users.filter(u => u.is_active && isExpired(u)).length
  }), [users, today]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (activeFilter === 'active') result = result.filter(u => u.is_active && !isExpired(u));
    else if (activeFilter === 'pending') result = result.filter(u => isPending(u));
    else if (activeFilter === 'inactive') result = result.filter(u => isInactive(u));
    else if (activeFilter === 'expired') result = result.filter(u => u.is_active && isExpired(u));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(u =>
        (u.profile?.name?.toLowerCase().includes(q)) ||
        (u.profile?.cpf?.includes(q)) ||
        (u.username.includes(q))
      );
    }
    return result;
  }, [users, activeFilter, searchQuery, today]);

  const FILTERS: { key: FilterStatus; label: string; count: number; activeColor: string; inactiveColor: string; icon: typeof Users }[] = [
    { key: 'all', label: 'Total de Contas', count: counts.total, activeColor: 'bg-blue-600/15 border-blue-500/30 text-blue-400', inactiveColor: 'bg-dark-900 border-slate-800 hover:border-slate-700', icon: Users },
    { key: 'active', label: 'Ativos e Válidos', count: counts.active, activeColor: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', inactiveColor: 'bg-dark-900 border-slate-800 hover:border-slate-700', icon: Power },
    { key: 'pending', label: 'Aguardando Aprovação', count: counts.pending, activeColor: 'bg-amber-500/15 border-amber-500/30 text-amber-400', inactiveColor: 'bg-dark-900 border-slate-800 hover:border-slate-700', icon: UserPlus },
    { key: 'inactive', label: 'Usuários Inativos', count: counts.inactive, activeColor: 'bg-slate-500/15 border-slate-400/30 text-slate-300', inactiveColor: 'bg-dark-900 border-slate-800 hover:border-slate-700', icon: ShieldCheck },
    { key: 'expired', label: 'Expirados', count: counts.expired, activeColor: 'bg-rose-500/15 border-rose-500/30 text-rose-400', inactiveColor: 'bg-dark-900 border-slate-800 hover:border-slate-700', icon: CalendarX },
  ];

  return (
    <div className="space-y-6 pb-16">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Administração de Usuários</h2>
          <p className="text-xs text-slate-400">Gerencie acessos, ativações e expirações de contas</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => { setLoading(true); onLoad().finally(() => setLoading(false)); }} className="p-2 rounded-xl bg-dark-850 border border-slate-700 text-slate-300 hover:text-white transition-colors" title="Recarregar lista">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          {onCreateUser && (
            <button onClick={() => setCreatingUser(true)} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors">
              <UserPlus className="w-4 h-4" /> <span>Novo Usuário</span>
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SUMMARY CARDS - CLICKABLE FILTERS
          ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const active = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`p-3 rounded-2xl border text-left transition-all ${active ? f.activeColor : f.inactiveColor}`}
              title={`Filtrar por ${f.label}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-current opacity-80">{f.label}</span>
                <Icon className="w-4 h-4 opacity-60" />
              </div>
              <p className="text-xl font-bold mt-1">{f.count}</p>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SEARCH BAR
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="w-full bg-dark-900 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors" title="Limpar busca">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* FILTER INFO */}
      {(activeFilter !== 'all' || searchQuery) && (
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>
            Exibindo {filteredUsers.length} de {users.length} usuários
            {activeFilter !== 'all' && ` · ${FILTERS.find(f => f.key === activeFilter)?.label}`}
            {searchQuery && ` · Busca: "${searchQuery}"`}
          </span>
          <button onClick={() => { setActiveFilter('all'); setSearchQuery(''); }} className="text-blue-400 hover:text-blue-300 font-medium">Limpar filtros</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          USER LIST
          ═══════════════════════════════════════════════════════════ */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando usuários...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 rounded-2xl bg-dark-900 border border-slate-800 text-center text-slate-400 text-sm">
          {users.length === 0 ? 'Nenhum usuário cadastrado ainda.' : 'Nenhum usuário encontrado com os filtros selecionados.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const expired = isExpired(user);
            const pending = isPending(user);
            const inactive = isInactive(user);
            const statusCls = pending
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : inactive
              ? 'bg-slate-500/10 text-slate-300 border-slate-400/30'
              : expired
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
            const statusText = pending ? 'Aguardando aprovação' : inactive ? 'Inativo' : expired ? 'Expirado' : 'Ativo';

            return (
              <div key={user.id} className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 overflow-hidden shrink-0">
                      {user.profile?.avatar_url ? (
                        <img src={user.profile.avatar_url} alt={user.profile.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                          {user.profile?.name?.charAt(0) || '?'}
                        </div>
                      )}
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

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${statusCls}`}>{statusText}</span>

                    {user.access_expires_at && (
                      <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-dark-850 border border-slate-700 text-slate-300 flex items-center space-x-1">
                        <CalendarX className="w-3 h-3" />
                        <span>Expira {new Date(user.access_expires_at).toLocaleDateString('pt-BR')}</span>
                      </span>
                    )}

                    {onUpdateUser && (
                      <button onClick={() => setEditingUser(user)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-dark-850 border border-slate-600 text-slate-300 hover:bg-dark-800 flex items-center space-x-1 transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> <span>Editar</span>
                      </button>
                    )}

                    <button
                      disabled={user.role === 'admin' && user.is_active}
                      onClick={() => onToggleActive(user.id, !user.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border flex items-center space-x-1 transition-colors ${user.is_active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' : 'bg-dark-850 border-slate-600 text-slate-400 hover:bg-dark-800'}`}
                      title={user.is_active ? 'Desativar acesso' : 'Ativar acesso'}
                    >
                      <Power className="w-3.5 h-3.5" /> <span>{user.is_active ? 'Desativar' : 'Ativar'}</span>
                    </button>

                    <button onClick={() => setEditingExpiration(user)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-dark-850 border border-slate-600 text-slate-300 hover:bg-dark-800 flex items-center space-x-1 transition-colors">
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

      {/* INFO */}
      <div className="p-3 rounded-xl bg-dark-900 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
        <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <span>Novos usuários criados pelo admin entram como <strong>ativos</strong>. Usuários com expiração vencida perdem o acesso automaticamente.</span>
      </div>

      {/* ═══ MODALS ═══ */}
      {editingUser && onUpdateUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(d) => onUpdateUser(editingUser.id, d)} onSavePassword={onUpdatePassword ? (pw) => onUpdatePassword(editingUser.id, pw) : undefined} />
      )}
      {creatingUser && onCreateUser && (
        <CreateUserModal onClose={() => setCreatingUser(false)} onSave={onCreateUser} />
      )}
      {editingExpiration && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <ExpirationModal user={editingExpiration} onClose={() => setEditingExpiration(null)} onSave={onSetExpiration} />
        </div>
      )}
    </div>
  );
};

// ── Expiration Sub-Modal ───────────────────────────────────────
const ExpirationModal: React.FC<{ user: UserWithProfile; onClose: () => void; onSave: (id: string, expiresAt: string | null, days?: number) => Promise<void> }> = ({ user, onClose, onSave }) => {
  const [mode, setMode] = useState<'none' | 'date' | 'days'>(user.access_expires_at ? 'date' : user.access_days ? 'days' : 'none');
  const [date, setDate] = useState(user.access_expires_at || '');
  const [days, setDays] = useState(user.access_days?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    try {
      if (mode === 'none') await onSave(user.id, null);
      else if (mode === 'date') await onSave(user.id, date || null);
      else await onSave(user.id, null, parseInt(days, 10) || 0);
      onClose();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="bg-dark-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Expiração de Acesso</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
      </div>
      <p className="text-xs text-slate-400">{user.profile?.name} · {user.profile?.cpf}</p>
      <div className="space-y-2">
        {[{ m: 'none', l: 'Sem expiração (contínuo)' }, { m: 'date', l: 'Data de expiração' }, { m: 'days', l: 'Dias de acesso' }].map(o => (
          <label key={o.m} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input type="radio" name="exp" checked={mode === o.m} onChange={() => setMode(o.m as any)} />
            <span>{o.l}</span>
          </label>
        ))}
        {mode === 'date' && <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />}
        {mode === 'days' && <input type="number" min={1} className={inputClass} value={days} onChange={(e) => setDays(e.target.value)} placeholder="Ex: 30" />}
      </div>
      <button onClick={handle} disabled={saving} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />} <span>Salvar</span>
      </button>
    </div>
  );
};
