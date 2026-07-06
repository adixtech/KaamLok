import { Link } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { RoleCard } from '../../components/auth/RoleCard';
import { Reveal } from '../../components/Reveal';

/**
 * GetStarted — role selection page.
 * Three interactive cards route to Student, NGO, or Admin auth flows.
 */
export function GetStarted() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-50">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/80 via-ink-50 to-ink-50" />
      <div className="absolute inset-0 -z-10 bg-grid mask-fade-b opacity-50" />
      <div className="absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl animate-blob" />
      <div className="absolute -right-20 top-40 -z-10 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl animate-blob [animation-delay:3s]" />

      {/* Top bar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-brand-700"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to home
        </Link>
      </header>

      {/* Hero copy */}
      <div className="mx-auto max-w-3xl px-4 pt-8 text-center sm:px-6 sm:pt-12 lg:pt-16">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Get started in under 2 minutes
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl text-balance">
            Choose how you want to <span className="gradient-text">join KaamLok</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg text-pretty">
            Whether you're a student looking for free career training, an NGO reaching new learners,
            or an admin managing the platform — there's a path for you.
          </p>
        </Reveal>
      </div>

      {/* Role cards */}
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-4 sm:px-6 lg:mt-16 lg:grid-cols-3 lg:px-8">
        <Reveal delay={0}>
          <RoleCard
            to="/register/student"
            tone="brand"
            icon={<GraduationCap className="h-7 w-7" strokeWidth={2.2} />}
            title="I'm a Student"
            description="Discover free, verified skill development programs funded by CSR and get career-ready with placement support."
            cta="Continue as Student"
          />
        </Reveal>
        <Reveal delay={100}>
          <RoleCard
            to="/register/ngo"
            tone="teal"
            icon={<Building2 className="h-7 w-7" strokeWidth={2.2} />}
            title="I'm an NGO"
            description="List your free training programs, reach verified students across India, and showcase your placement impact."
            cta="Continue as NGO"
          />
        </Reveal>
        <Reveal delay={200}>
          <RoleCard
            to="/login/admin"
            tone="amber"
            icon={<ShieldCheck className="h-7 w-7" strokeWidth={2.2} />}
            title="I'm an Admin"
            description="Securely access the KaamLok admin dashboard to verify NGOs, manage programs, and monitor platform integrity."
            cta="Secure Admin Login"
            secure
          />
        </Reveal>
      </div>

      {/* Already have account */}
      <Reveal delay={300}>
        <p className="mt-12 text-center text-sm font-medium text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
