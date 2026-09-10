const SALT = 'coach-ia-fitness-salt-2026';

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  return sha256(`${SALT}:${password}`);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const candidate = await hashPassword(password);
  return candidate === hash;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCPF(cpf: string): boolean {
  const c = onlyDigits(cpf);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;

  const calcDigit = (slice: string): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(c[i], 10) * (slice.length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcDigit(c.slice(0, 9));
  if (d1 !== parseInt(c[9], 10)) return false;

  const d2 = calcDigit(c.slice(0, 10));
  return d2 === parseInt(c[10], 10);
}