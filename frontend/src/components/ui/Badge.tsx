import { type ReactNode } from 'react';

type Tone = 'brand' | 'teal' | 'amber' | 'neutral' | 'success';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export function Badge({
  children,
  tone = 'brand',
  icon,
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
