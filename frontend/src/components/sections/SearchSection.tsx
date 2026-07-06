import { useState } from 'react';
import { Search, MapPin, GraduationCap, Building2, ArrowRight, X } from 'lucide-react';
import { Reveal } from '../Reveal';

const quickFilters = [
  '10th Pass',
  '12th Pass',
  'Graduate',
  'Diploma',
  'Online',
  'Offline',
  'Hybrid',
  'IT',
  'Retail',
  'Healthcare',
  'Finance',
  'Hospitality',
];

export function SearchSection() {
  const [active, setActive] = useState<string[]>(['12th Pass', 'Online']);
  const [query, setQuery] = useState('');

  const toggle = (f: string) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  return (
    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-5xl">
        <div className="rounded-4xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/60 sm:p-7">
          {/* Search bar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by course or skill..."
                className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 py-3.5 pl-12 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
              <FieldSelect icon={MapPin} label="City" options={['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Jaipur']} />
              <FieldSelect icon={GraduationCap} label="Eligibility" options={['10th Pass', '12th Pass', 'Graduate', 'Diploma']} />
              <FieldSelect icon={Building2} label="NGO" options={['All NGOs', 'Pratham', 'Smile Foundation', 'Lakshya']} />
            </div>
            <button className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-700 hover:shadow-float">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          {/* Quick filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Quick Filters
            </span>
            {quickFilters.map((f) => {
              const on = active.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => toggle(f)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    on
                      ? 'bg-brand-600 text-white shadow-soft'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {on && <X className="h-3 w-3" />}
                  {f}
                </button>
              );
            })}
            {active.length > 0 && (
              <button
                onClick={() => setActive([])}
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Clear all
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FieldSelect({
  icon: Icon,
  label,
  options,
}: {
  icon: typeof MapPin;
  label: string;
  options: string[];
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <select
        aria-label={label}
        className="w-full appearance-none rounded-2xl border border-ink-200 bg-ink-50/60 py-3 pl-9 pr-8 text-sm font-medium text-ink-700 transition-colors focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-auto"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
