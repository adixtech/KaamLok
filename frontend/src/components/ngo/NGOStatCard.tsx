import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  tone?: string;
  trend?: { value: number; direction: 'up' | 'down' };
}

export function NGOStatCard({ icon, label, value, tone = 'bg-brand-50 text-brand-600', trend }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        {icon}
      </span>
      <div className="mt-3 flex items-end gap-2">
        <p className="text-2xl font-extrabold text-ink-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.direction === 'up' ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}
