import { ArrowRight, MapPin, Clock, GraduationCap, Users, BadgeCheck } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';

type Program = {
  title: string;
  ngo: string;
  location: string;
  duration: string;
  eligibility: string;
  seats: number;
  total: number;
  image: string;
  tag: string;
  tone: 'brand' | 'teal' | 'amber';
};

const programs: Program[] = [
  {
    title: 'Full-Stack Web Development',
    ngo: 'Pratham Education Foundation',
    location: 'Mumbai · Hybrid',
    duration: '6 Months',
    eligibility: '12th Pass',
    seats: 24,
    total: 40,
    image: 'https://images.pexels.com/photos/4709285/pexels-photo-4709285.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag: 'IT',
    tone: 'brand',
  },
  {
    title: 'Retail & Customer Service',
    ngo: 'Smile Foundation',
    location: 'Delhi · Offline',
    duration: '3 Months',
    eligibility: '10th Pass',
    seats: 12,
    total: 35,
    image: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag: 'Retail',
    tone: 'teal',
  },
  {
    title: 'Digital Marketing & SEO',
    ngo: 'Lakshya Foundation',
    location: 'Bengaluru · Online',
    duration: '4 Months',
    eligibility: 'Graduate',
    seats: 8,
    total: 30,
    image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag: 'Digital',
    tone: 'amber',
  },
  {
    title: 'Hospitality & Hotel Management',
    ngo: 'Anudip Foundation',
    location: 'Pune · Offline',
    duration: '5 Months',
    eligibility: 'Diploma',
    seats: 18,
    total: 25,
    image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag: 'Hospitality',
    tone: 'brand',
  },
  {
    title: 'Financial Accounting (Tally)',
    ngo: 'Pratham Education Foundation',
    location: 'Jaipur · Hybrid',
    duration: '3 Months',
    eligibility: '12th Pass',
    seats: 30,
    total: 40,
    image: 'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag: 'Finance',
    tone: 'teal',
  },
  {
    title: 'Healthcare Assistant Program',
    ngo: 'Smile Foundation',
    location: 'Chennai · Offline',
    duration: '6 Months',
    eligibility: '10th Pass',
    seats: 5,
    total: 20,
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
    tag: 'Healthcare',
    tone: 'amber',
  },
];

const toneMap = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function FeaturedPrograms() {
  return (
    <section id="programs" className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Programs"
          title={
            <>
              Handpicked programs to{' '}
              <span className="gradient-text">launch your career</span>
            </>
          }
          description="Every program is run by a verified NGO and fully funded through CSR — so you learn career-ready skills at zero cost."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <ProgramCard program={p} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <Button variant="secondary" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
            View All Programs
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

function ProgramCard({ program: p }: { program: Program }) {
  const pct = Math.round((p.seats / p.total) * 100);
  const left = p.total - p.seats;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
      <div className="relative h-44 overflow-hidden">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset backdrop-blur ${toneMap[p.tone]}`}
        >
          {p.tag}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 backdrop-blur">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-700">
          {p.title}
        </h3>
        <p className="mt-1 text-sm font-medium text-ink-500">{p.ngo}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Meta icon={MapPin} label={p.location} />
          <Meta icon={Clock} label={p.duration} />
          <Meta icon={GraduationCap} label={p.eligibility} />
          <Meta icon={Users} label={`${left} seats left`} />
        </div>

        {/* Seats progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink-500">
            <span>Seats filled</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <span className="text-xs font-semibold text-ink-400">100% Free · CSR Funded</span>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 hover:shadow-soft">
            Apply
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-500">
      <Icon className="h-3.5 w-3.5 text-ink-400" />
      {label}
    </span>
  );
}
