import { BadgeCheck, ArrowRight, Users, BookOpen } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';

type NGO = {
  name: string;
  initials: string;
  desc: string;
  programs: number;
  students: string;
  tone: 'brand' | 'teal' | 'amber' | 'rose' | 'emerald';
  focus: string;
};

const ngos: NGO[] = [
  {
    name: 'Pratham Education Foundation',
    initials: 'PE',
    desc: 'One of India\'s largest NGOs, delivering quality education and skilling to millions of youth since 1994.',
    programs: 24,
    students: '8,200+',
    tone: 'brand',
    focus: 'IT · Retail · Digital',
  },
  {
    name: 'Smile Foundation',
    initials: 'SF',
    desc: 'Empowering underprivileged youth through livelihood, education, and healthcare programs across 25 states.',
    programs: 18,
    students: '5,400+',
    tone: 'teal',
    focus: 'Healthcare · Hospitality',
  },
  {
    name: 'Lakshya Foundation',
    initials: 'LF',
    desc: 'Mentor-driven skilling for first-generation learners, bridging the gap between education and employment.',
    programs: 12,
    students: '3,100+',
    tone: 'amber',
    focus: 'Digital · Finance',
  },
  {
    name: 'Anudip Foundation',
    initials: 'AF',
    desc: 'Market-aligned skill training and placement for rural and semi-urban youth in technology and services.',
    programs: 16,
    students: '4,800+',
    tone: 'rose',
    focus: 'IT · BPO · Retail',
  },
];

const toneMap = {
  brand: 'from-brand-500 to-brand-700',
  teal: 'from-teal-500 to-teal-700',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
  emerald: 'from-emerald-500 to-emerald-700',
};

export function NGOPartners() {
  return (
    <section id="ngos" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/40 to-ink-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured NGO Partners"
          title={
            <>
              Trusted NGOs, <span className="gradient-text">verified impact</span>
            </>
          }
          description="We partner with India's most respected NGOs — each one vetted for quality, transparency, and real placement outcomes."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ngos.map((n, i) => (
            <Reveal key={n.name} delay={i * 80}>
              <article className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${toneMap[n.tone]} text-lg font-extrabold text-white shadow-soft`}
                  >
                    {n.initials}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-ink-900">{n.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{n.desc}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {n.focus.split(' · ').map((t) => (
                    <span key={t} className="rounded-lg bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-600">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-ink-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Programs</span>
                    </div>
                    <p className="mt-0.5 text-lg font-bold text-ink-900">{n.programs}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-ink-400">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Trained</span>
                    </div>
                    <p className="mt-0.5 text-lg font-bold text-ink-900">{n.students}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button variant="primary" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
            Partner as NGO
          </Button>
          <Button variant="white" size="lg">
            View All NGOs
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
