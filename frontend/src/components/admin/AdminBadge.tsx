import { type ReactNode } from 'react';

type Tone = 'brand' | 'teal' | 'amber' | 'neutral' | 'success' | 'danger' | 'warning';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function AdminBadge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case 'active':
    case 'approved':
    case 'published':
    case 'accepted':
      return 'success';
    case 'pending':
    case 'draft':
    case 'waitlist':
      return 'amber';
    case 'blocked':
    case 'rejected':
    case 'suspended':
    case 'archived':
      return 'danger';
    case 'shortlisted':
      return 'brand';
    default:
      return 'neutral';
  }
}
