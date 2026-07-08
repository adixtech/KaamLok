import { type ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: string;
  trend?: { value: string; up: boolean };
  subtitle?: string;
};

export function StatCard({ icon, label, value, tone = 'bg-brand-50 text-brand-600', trend, subtitle }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:shadow-float">
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-bold ${trend.up ? 'text-emerald-600' : 'text-rose-500'}`}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={trend.up ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
            </svg>
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      {subtitle && <p className="mt-0.5 text-[11px] text-ink-400">{subtitle}</p>}
    </div>
  );
}
