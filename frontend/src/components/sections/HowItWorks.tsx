import {
  UserPlus,
  Search,
  Send,
  ShieldCheck,
  CheckCircle2,
  PlayCircle,
  Award,
  Briefcase,
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';

const steps = [
  { icon: UserPlus, title: 'Create Profile', desc: 'Sign up and tell us about your education, goals, and interests in under 2 minutes.' },
  { icon: Search, title: 'Discover Programs', desc: 'Browse verified, free programs matched to your eligibility and preferred location.' },
  { icon: Send, title: 'Apply', desc: 'Submit a simple application to the programs that fit your career goals — no paperwork.' },
  { icon: ShieldCheck, title: 'NGO Verification', desc: 'The partner NGO reviews your application and confirms your eligibility.' },
  { icon: CheckCircle2, title: 'Admission Confirmation', desc: 'Get your admission confirmed and receive joining details on your dashboard.' },
  { icon: PlayCircle, title: 'Training Begins', desc: 'Start attending classes — online, offline, or hybrid — and build real skills.' },
  { icon: Award, title: 'Career Ready', desc: 'Complete the program, earn a verified certificate, and sharpen interview skills.' },
  { icon: Briefcase, title: 'Placement Support', desc: 'Get connected with hiring partners and start your career journey.' },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title={
            <>
              From sign-up to <span className="gradient-text">first paycheck</span>
            </>
          }
          description="A clear, guided path — eight simple steps take you from creating a profile to landing placement support."
        />

        <div className="relative mt-16">
          {/* Vertical line (desktop) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-brand-200 via-teal-200 to-amber-200 lg:block" />

          <ol className="space-y-4 lg:space-y-0">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <Reveal key={s.title} delay={i * 60}>
                  <li
                    className={`relative flex flex-col gap-4 lg:flex-row lg:items-center ${
                      left ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Card */}
                    <div className="lg:w-[calc(50%-3rem)]">
                      <div className="group rounded-3xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-float hover:ring-brand-200">
                        <div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 text-white shadow-soft">
                            <s.icon className="h-5 w-5" strokeWidth={2} />
                          </span>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wide text-brand-500">
                              Step {i + 1}
                            </span>
                            <h3 className="text-base font-bold text-ink-900">{s.title}</h3>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-ink-500">{s.desc}</p>
                      </div>
                    </div>

                    {/* Node */}
                    <div className="absolute left-1/2 top-6 hidden -translate-x-1/2 lg:block">
                      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-brand-700 shadow-soft ring-4 ring-ink-50">
                        {i + 1}
                        <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-brand-300/40" />
                      </span>
                    </div>

                    {/* Spacer for the other half */}
                    <div className="hidden lg:block lg:w-[calc(50%-3rem)]" />
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
