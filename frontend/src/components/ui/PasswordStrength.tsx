import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

type Rule = { label: string; test: (v: string) => boolean };

const rules: Rule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /\d/.test(v) },
  { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function score(password: string) {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

const levels = [
  { label: 'Too weak', color: 'bg-rose-400', text: 'text-rose-600' },
  { label: 'Weak', color: 'bg-amber-400', text: 'text-amber-600' },
  { label: 'Good', color: 'bg-teal-400', text: 'text-teal-600' },
  { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' },
  { label: 'Very strong', color: 'bg-brand-600', text: 'text-brand-600' },
];

/**
 * Password strength meter with live rule checklist.
 */
export function PasswordStrength({ password }: { password: string }) {
  const s = useMemo(() => score(password), [password]);
  const level = s === 0 ? levels[0] : levels[Math.min(s, 4)];
  const pct = (s / 4) * 100;

  if (!password) return null;

  return (
    <div className="mt-3 rounded-2xl bg-ink-50/80 p-3.5 ring-1 ring-inset ring-ink-200/60">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-500">Password strength</span>
        <span className={`text-xs font-bold ${level.text}`}>{level.label}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${level.color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <li
              key={r.label}
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                ok ? 'text-emerald-600' : 'text-ink-400'
              }`}
            >
              <span
                className={`grid h-3.5 w-3.5 place-items-center rounded-full ${
                  ok ? 'bg-emerald-100 text-emerald-600' : 'bg-ink-200 text-ink-400'
                }`}
              >
                {ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
