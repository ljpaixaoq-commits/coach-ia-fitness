import React, { useState } from 'react';
import { Flame, Loader2, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, CalendarDays, Phone } from 'lucide-react';
import { formatCPF, formatPhone, onlyDigits } from '../lib/auth';

interface AuthViewProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (input: {
    name: string;
    email?: string;
    cpf: string;
    birthDate: string;
    gender?: string;
    nickname?: string;
    avatarUrl?: string;
    phone?: string;
  }, password: string) => Promise<void>;
  onResetPassword: (cpf: string, birthDate: string, newPassword: string) => Promise<void>;
  onValidateReset?: (cpf: string, birthDate: string) => Promise<{ account_id: string; profile_name: string }>;
  authBusy: boolean;
  authError: string | null;
}

type Mode = 'login' | 'register' | 'reset';
type ResetStep = 'identity' | 'new_password';

const BirthDateFields: React.FC<{
  day: string;
  month: string;
  year: string;
  onDayChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
}> = ({ day, month, year, onDayChange, onMonthChange, onYearChange }) => {
  const fieldClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-center focus:outline-none focus:border-blue-500 transition-colors";
  return (
    <div>
      <label className="mb-1.5 flex items-center space-x-1.5 text-xs text-slate-500">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>Data de nascimento</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        <input
          className={fieldClass}
          type="text"
          inputMode="numeric"
          maxLength={2}
          required
          value={day}
          onChange={(e) => onDayChange(onlyDigits(e.target.value).slice(0, 2))}
          placeholder="Dia"
          aria-label="Dia"
        />
        <input
          className={fieldClass}
          type="text"
          inputMode="numeric"
          maxLength={2}
          required
          value={month}
          onChange={(e) => onMonthChange(onlyDigits(e.target.value).slice(0, 2))}
          placeholder="Mês"
          aria-label="Mês"
        />
        <input
          className={fieldClass}
          type="text"
          inputMode="numeric"
          maxLength={4}
          required
          value={year}
          onChange={(e) => onYearChange(onlyDigits(e.target.value).slice(0, 4))}
          placeholder="Ano"
          aria-label="Ano"
        />
      </div>
    </div>
  );
};

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegister,
  onResetPassword,
  onValidateReset,
  authBusy,
  authError
}) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reset flow state
  const [resetStep, setResetStep] = useState<ResetStep>('identity');
  const [resetAccountId, setResetAccountId] = useState<string | null>(null);
  const [resetUserName, setResetUserName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (mode === 'login') {
      setPending(true);
      try {
        await onLogin(username, password);
      } catch (err) {
        // error already set in store
      } finally {
        setPending(false);
      }
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setSuccess(null);
        return;
      }
      const birthDate = buildBirthDate();
      if (!birthDate) return;
      setPending(true);
      try {
        await onRegister({ name, email, cpf: username, birthDate, nickname, avatarUrl, phone }, password);
        setSuccess('Cadastro realizado! Sua conta será analisada pelo administrador e ativada em breve.');
        setMode('login');
        setPassword(''); setConfirmPassword(''); setName(''); setNickname(''); setAvatarUrl(''); setEmail(''); setBirthDay(''); setBirthMonth(''); setBirthYear(''); setPhone(''); setUsername('');
      } catch (err) {
        // error already set in store
      } finally {
        setPending(false);
      }
      return;
    }

    if (mode === 'reset') {
      if (resetStep === 'identity') {
        // Step 1: Validate CPF + birth date
        if (!onValidateReset) return;
        const birthDate = buildBirthDate();
        if (!birthDate) return;
        setPending(true);
        try {
          const result = await onValidateReset(username, birthDate);
          setResetAccountId(result.account_id);
          setResetUserName(result.profile_name);
          setResetStep('new_password');
        } catch (err) {
          // error already set in store
        } finally {
          setPending(false);
        }
        return;
      }

      // Step 2: Set new password
      if (password !== confirmPassword) return;
      const birthDate = buildBirthDate();
      if (!birthDate) return;
      setPending(true);
      try {
        await onResetPassword(username, birthDate, password);
        setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
        setMode('login');
        setPassword(''); setConfirmPassword(''); setBirthDay(''); setBirthMonth(''); setBirthYear(''); setUsername(''); setFormError(null);
        setResetStep('identity'); setResetAccountId(null); setResetUserName('');
      } catch (err) {
        // error already set in store
      } finally {
        setPending(false);
      }
    }
  };

  const goTo = (m: Mode) => {
    setMode(m);
    setSuccess(null);
    setFormError(null);
    setPassword('');
    setConfirmPassword('');
    setName('');
    setNickname('');
    setAvatarUrl('');
    setEmail('');
    setBirthDay('');
    setBirthMonth('');
    setBirthYear('');
    setUsername('');
    setResetStep('identity');
    setResetAccountId(null);
    setResetUserName('');
  };

  const buildBirthDate = (): string => {
    const dd = parseInt(birthDay, 10) || 0;
    const mm = parseInt(birthMonth, 10) || 0;
    const yyyy = birthYear.length === 4 ? parseInt(birthYear, 10) : 0;
    const fullYear = new Date().getFullYear();
    if (!dd || dd > 31) { setFormError('Informe um dia válido (1 a 31).'); return ''; }
    if (!mm || mm > 12) { setFormError('Informe um mês válido (1 a 12).'); return ''; }
    if (!yyyy || yyyy < 1900 || yyyy > fullYear) { setFormError(`Informe um ano válido (1900 a ${fullYear}).`); return ''; }
    return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  };

  const inputClass = "w-full bg-dark-850 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-glow-blue">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
              <Flame className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Coach IA Pessoal</h1>
            <p className="text-sm text-content-muted">Treino, Saúde & Evolução Inteligente</p>
          </div>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl">
          {/* Mode Tabs */}
          <div className="flex items-center justify-between mb-6 text-xs font-bold">
            {mode !== 'login' && (
              <button onClick={() => goTo('login')} className="flex items-center space-x-1 text-content-muted hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}
            <span className="text-content-muted uppercase tracking-wider">
              {mode === 'login' ? 'Acesso à plataforma' : mode === 'register' ? 'Criar nova conta' : resetStep === 'identity' ? 'Validar identidade' : 'Criar nova senha'}
            </span>
          </div>

          {authError && (
            <div className="mb-4 flex items-start space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {formError && (
            <div className="mb-4 flex items-start space-x-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CPF field - always visible */}
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                className={inputClass + " pl-10"}
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(formatCPF(e.target.value))}
                placeholder="CPF (somente números)"
                disabled={mode === 'reset' && resetStep === 'new_password'}
              />
            </div>

            {/* Register fields */}
            {mode === 'register' && (
              <>
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                />
                <input
                  className={inputClass}
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Apelido (como quer ser chamado)"
                />
                <input
                  className={inputClass}
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="URL do avatar (opcional)"
                />
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail (opcional)"
                />
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    className={inputClass + " pl-10"}
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                {/* Register: Birth date - required by the API for new users */}
                <BirthDateFields
                  day={birthDay}
                  month={birthMonth}
                  year={birthYear}
                  onDayChange={setBirthDay}
                  onMonthChange={setBirthMonth}
                  onYearChange={setBirthYear}
                />
              </>
            )}

            {/* Reset: Birth date - only in identity step */}
            {mode === 'reset' && resetStep === 'identity' && (
              <BirthDateFields
                day={birthDay}
                month={birthMonth}
                year={birthYear}
                onDayChange={setBirthDay}
                onMonthChange={setBirthMonth}
                onYearChange={setBirthYear}
              />
            )}

            {/* Password fields - login, register, and reset new_password step */}
            {mode === 'login' && (
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  className={inputClass + " pl-10"}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  minLength={4}
                />
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    className={inputClass + " pl-10"}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crie uma senha (min. 4 caracteres)"
                    minLength={4}
                  />
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    className={inputClass + " pl-10"}
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar senha"
                    minLength={4}
                  />
                </div>
              </>
            )}

            {mode === 'reset' && resetStep === 'new_password' && (
              <>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  Identidade validada! Olá, <strong>{resetUserName}</strong>. Defina sua nova senha abaixo.
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    className={inputClass + " pl-10"}
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nova senha (min. 4 caracteres)"
                    minLength={4}
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    className={inputClass + " pl-10"}
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nova senha"
                    minLength={4}
                  />
                </div>
              </>
            )}

            {password !== confirmPassword && confirmPassword && mode !== 'login' && (
              <p className="text-xs text-rose-400">As senhas não coincidem.</p>
            )}

            <button
              type="submit"
              disabled={authBusy || pending || (mode !== 'login' && mode === 'register' && password !== confirmPassword) || (mode === 'reset' && resetStep === 'new_password' && password !== confirmPassword)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authBusy || pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <span>
                  {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Solicitar cadastro' : resetStep === 'identity' ? 'Validar identidade' : 'Redefinir senha'}
                </span>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted">
            {mode === 'login' ? (
              <>
                <button onClick={() => goTo('reset')} className="flex items-center space-x-1 hover:text-blue-400 transition-colors py-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Esqueci minha senha</span>
                </button>
                <button onClick={() => goTo('register')} className="hover:text-emerald-400 transition-colors py-1">
                  Não tem conta? <span className="font-bold">Cadastre-se</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-center">
                {mode === 'register'
                  ? 'Novos usuários iniciam como inativos, aguardando aprovação do administrador.'
                  : resetStep === 'identity'
                  ? 'Informe o CPF e a data de nascimento corretos para validar sua identidade.'
                  : 'Crie uma nova senha para acessar sua conta.'}
              </span>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-content-muted mt-6">
          © 2026 Coach IA Pessoal · Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
};