import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  GraduationCap,
  Briefcase,
  Users,
  Star,
  MapPin,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Reveal } from '../Reveal';

const trustBadges = [
  { icon: ShieldCheck, label: 'Verified NGOs' },
  { icon: BadgeCheck, label: '100% Free Programs' },
  { icon: GraduationCap, label: 'Career Ready Training' },
  { icon: Briefcase, label: 'Placement Assistance' },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-40 lg:pb-28">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/80 via-ink-50 to-ink-50" />
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60" />
      <div className="absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="absolute -right-20 top-40 -z-10 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl animate-blob [animation-delay:3s]" />
      <div className="absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl animate-blob [animation-delay:6s]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Left: copy */}
        <div className="max-w-xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              India's Skill Development Discovery Platform
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl text-balance">
              Your Career Journey{' '}
              <span className="relative whitespace-nowrap">
                <span className="gradient-text">Starts Here.</span>
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-amber-400"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9C50 3 150 3 198 9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <h2 className="mt-6 text-lg font-semibold text-ink-700 sm:text-xl text-pretty">
              Find <span className="text-brand-700">FREE</span> Skill Development Programs from{' '}
              <span className="text-teal-600">Verified NGOs</span>.
            </h2>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg text-pretty">
              Discover training opportunities that prepare you for interviews, careers,
              communication, digital skills, IT, finance, retail, hospitality, and much more.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/get-started">
                <Button size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                  Explore Free Programs
                </Button>
              </Link>
              <Link to="/register/ngo">
                <Button size="lg" variant="white">
                  Partner as NGO
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-2">
              {trustBadges.map((b) => (
                <li key={b.label} className="flex items-center gap-2.5 text-sm font-medium text-ink-600">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                    <b.icon className="h-4 w-4" />
                  </span>
                  {b.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Right: illustration */}
        <Reveal delay={200} className="relative">
          <HeroIllustration />
        </Reveal>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto max-w-lg lg:max-w-none">
      {/* Main card */}
      <div className="relative rounded-4xl bg-gradient-to-br from-white to-brand-50/40 p-6 shadow-glow ring-1 ring-inset ring-brand-100/60 sm:p-8">
        {/* Window header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            kaamlok.in
          </span>
        </div>

        {/* Illustration scene */}
        <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-teal-500 p-6">
          <div className="absolute inset-0 bg-dots opacity-20" />
          {/* Sun / growth arc */}
          <svg className="absolute right-4 top-4 h-16 w-16 text-amber-300/80" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="14" fill="currentColor" opacity="0.5" />
            <path d="M32 6v6M32 52v6M6 32h6M52 32h6M14 14l4 4M46 46l4 4M50 14l-4 4M18 46l-4 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>

          {/* People */}
          <div className="relative grid grid-cols-3 gap-3">
            <PersonFigure tone="bg-amber-400" label="Mentor" />
            <PersonFigure tone="bg-white" label="Student" highlight />
            <PersonFigure tone="bg-teal-300" label="Grad" />
          </div>

          {/* Progress bars */}
          <div className="relative mt-5 space-y-2.5">
            <SkillBar label="Communication" pct={88} />
            <SkillBar label="Digital Skills" pct={72} />
            <SkillBar label="Interview Prep" pct={95} />
          </div>

          {/* Certificate */}
          <div className="relative mt-5 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold text-ink-900">Certificate of Completion</p>
              <p className="text-[11px] text-ink-500">Career-Ready Program · Verified</p>
            </div>
            <BadgeCheck className="h-5 w-5 text-teal-500" />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat icon={Users} value="500+" label="Enrolled" tone="text-brand-600 bg-brand-50" />
          <MiniStat icon={TrendingUp} value="92%" label="Placed" tone="text-teal-600 bg-teal-50" />
          <MiniStat icon={Star} value="4.9" label="Rating" tone="text-amber-600 bg-amber-50" />
        </div>
      </div>

      {/* Floating cards */}
      <FloatingCard
        className="-left-4 top-16 sm:-left-8"
        icon={<BadgeCheck className="h-4 w-4 text-teal-500" />}
        title="Verified NGO"
        subtitle="CSR Funded"
        delay="0s"
      />
      <FloatingCard
        className="-right-3 top-40 sm:-right-6"
        icon={<GraduationCap className="h-4 w-4 text-brand-600" />}
        title="Admission Open"
        subtitle="Batch 2026"
        delay="1.5s"
        tone="brand"
      />
      <FloatingCard
        className="-left-2 bottom-10 sm:-left-6"
        icon={<MapPin className="h-4 w-4 text-amber-600" />}
        title="Career Guidance"
        subtitle="1-on-1 Mentoring"
        delay="3s"
        tone="amber"
      />
    </div>
  );
}

function PersonFigure({
  tone,
  label,
  highlight = false,
}: {
  tone: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative grid h-16 w-16 place-items-center rounded-2xl ${tone} ${
          highlight ? 'ring-4 ring-white/60' : ''
        }`}
      >
        <div className="h-7 w-7 rounded-full bg-ink-800/80" />
        <div className="absolute bottom-1 h-5 w-10 rounded-t-xl bg-ink-800/80" />
      </div>
      <span className="text-[10px] font-semibold text-white/90">{label}</span>
    </div>
  );
}

function SkillBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/25">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-soft ring-1 ring-inset ring-ink-200/50">
      <span className={`mx-auto grid h-8 w-8 place-items-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-1.5 text-lg font-bold text-ink-900">{value}</p>
      <p className="text-[11px] font-medium text-ink-500">{label}</p>
    </div>
  );
}

function FloatingCard({
  className = '',
  icon,
  title,
  subtitle,
  delay = '0s',
  tone = 'teal',
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay?: string;
  tone?: 'teal' | 'brand' | 'amber';
}) {
  const ring =
    tone === 'brand' ? 'ring-brand-200' : tone === 'amber' ? 'ring-amber-200' : 'ring-teal-200';
  return (
    <div
      className={`absolute hidden animate-float-slow rounded-2xl bg-white/95 p-3 shadow-float ring-1 ring-inset backdrop-blur sm:flex sm:items-center sm:gap-2.5 ${ring} ${className}`}
      style={{ animationDelay: delay }}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-50">{icon}</span>
      <div>
        <p className="text-xs font-bold text-ink-900">{title}</p>
        <p className="text-[11px] text-ink-500">{subtitle}</p>
      </div>
    </div>
  );
}
