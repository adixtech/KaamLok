import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

type Tone = 'brand' | 'teal' | 'amber';

const toneMap: Record<Tone, { ring: string; icon: string; glow: string; text: string }> = {
  brand: {
    ring: 'hover:ring-brand-200',
    icon: 'from-brand-500 to-brand-700',
    glow: 'group-hover:shadow-float',
    text: 'text-brand-600',
  },
  teal: {
    ring: 'hover:ring-teal-200',
    icon: 'from-teal-500 to-teal-700',
    glow: 'group-hover:shadow-float',
    text: 'text-teal-600',
  },
  amber: {
    ring: 'hover:ring-amber-200',
    icon: 'from-amber-400 to-amber-600',
    glow: 'group-hover:shadow-float',
    text: 'text-amber-600',
  },
};

type Props = {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
  tone: Tone;
  secure?: boolean;
  delay?: number;
};

/**
 * Interactive role-selection card used on the GetStarted page.
 */
export function RoleCard({ to, icon, title, description, cta, tone, secure, delay = 0 }: Props) {
  const t = toneMap[tone];
  return (
    <Link
      to={to}
      className="group relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${t.icon} text-white shadow-soft transition-transform duration-300 group-hover:scale-110`}
      >
        {icon}
      </span>

      <h3 className="mt-5 text-xl font-bold text-ink-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500 text-pretty">{description}</p>

      <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
        <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${t.text}`}>
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
        {secure && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-500">
            <ShieldCheck className="h-3 w-3" />
            Secure
          </span>
        )}
      </div>
    </Link>
  );
}
