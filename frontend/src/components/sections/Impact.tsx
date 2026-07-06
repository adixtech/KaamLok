import { Users, BookOpen, Building2, Award } from 'lucide-react';
import { useReveal, useCountUp } from '../../hooks/useReveal';
import { Reveal } from '../Reveal';

const stats = [
  { icon: Users, value: 15000, suffix: '+', label: 'Students', tone: 'brand' },
  { icon: BookOpen, value: 150, suffix: '+', label: 'Programs', tone: 'teal' },
  { icon: Building2, value: 50, suffix: '+', label: 'Verified NGOs', tone: 'amber' },
  { icon: Award, value: 5000, suffix: '+', label: 'Career Success Stories', tone: 'emerald' },
];

const toneMap = {
  brand: 'from-brand-500 to-brand-700',
  teal: 'from-teal-500 to-teal-700',
  amber: 'from-amber-400 to-amber-600',
  emerald: 'from-emerald-500 to-emerald-700',
};

function formatNumber(n: number) {
  return n.toLocaleString('en-IN');
}

export function Impact() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.3 });
  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            ref={ref}
            className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 via-brand-700 to-teal-600 p-8 shadow-glow sm:p-12 lg:p-16"
          >
            <div className="absolute inset-0 bg-dots opacity-10" />
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />

            <div className="relative text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur">
                Our Impact So Far
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl md:text-[2.75rem] md:leading-[1.1] text-balance">
                Numbers that tell <span className="text-amber-300">real stories</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg text-pretty">
                Every number represents a student who found a path, a skill, and a career — at zero cost.
              </p>
            </div>

            <div className="relative mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {stats.map((s, i) => (
                <Counter key={s.label} stat={s} start={visible} delay={i * 150} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Counter({
  stat,
  start,
  delay,
}: {
  stat: (typeof stats)[number];
  start: boolean;
  delay: number;
}) {
  const value = useCountUp(stat.value, 2000, start);
  return (
    <div
      className="text-center opacity-0 transition-opacity duration-500"
      style={{ opacity: start ? 1 : 0, transitionDelay: `${delay}ms` }}
    >
      <span
        className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${toneMap[stat.tone as keyof typeof toneMap]} text-white shadow-soft`}
      >
        <stat.icon className="h-7 w-7" strokeWidth={2} />
      </span>
      <p className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
        {formatNumber(value)}{stat.suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-brand-100">{stat.label}</p>
    </div>
  );
}
