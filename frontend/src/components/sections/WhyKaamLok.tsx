import {
  ShieldCheck,
  BadgeIndianRupee,
  Compass,
  Cpu,
  MessageSquare,
  Briefcase,
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified NGOs',
    desc: 'Every partner NGO is background-checked and reviewed, so you only apply to genuine, trusted programs.',
    tone: 'brand',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Completely Free',
    desc: 'All programs are 100% free, funded through corporate CSR initiatives. No hidden fees, ever.',
    tone: 'teal',
  },
  {
    icon: Compass,
    title: 'Career Guidance',
    desc: 'Get 1-on-1 mentoring from industry professionals who help you choose and plan the right path.',
    tone: 'amber',
  },
  {
    icon: Cpu,
    title: 'Industry Skills',
    desc: 'Learn the skills employers actually hire for — IT, retail, finance, hospitality, and more.',
    tone: 'brand',
  },
  {
    icon: MessageSquare,
    title: 'Interview Preparation',
    desc: 'Mock interviews, resume building, and communication training that make you interview-ready.',
    tone: 'teal',
  },
  {
    icon: Briefcase,
    title: 'Placement Assistance',
    desc: 'Dedicated placement support connects you with hiring partners after you complete training.',
    tone: 'amber',
  },
];

const toneMap = {
  brand: { bg: 'bg-brand-50', text: 'text-brand-600', ring: 'group-hover:ring-brand-200', glow: 'group-hover:shadow-float' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'group-hover:ring-teal-200', glow: 'group-hover:shadow-float' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:ring-amber-200', glow: 'group-hover:shadow-float' },
};

export function WhyKaamLok() {
  return (
    <section id="about" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-50 to-brand-50/40" />
      <div className="absolute right-0 top-20 -z-10 h-72 w-72 rounded-full bg-teal-200/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why KaamLok"
          title={
            <>
              Built for trust.{' '}
              <span className="gradient-text">Designed for your future.</span>
            </>
          }
          description="We remove the guesswork from finding free training. Every program on KaamLok is verified, funded, and focused on real career outcomes."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const t = toneMap[f.tone as keyof typeof toneMap];
            return (
              <Reveal key={f.title} delay={i * 70}>
                <article
                  className={`group h-full rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 ${t.ring} ${t.glow}`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${t.bg} ${t.text} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <f.icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Learn more
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
