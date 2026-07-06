import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, BadgeCheck, GraduationCap, Briefcase, Users } from 'lucide-react';
import { Logo } from '../Logo';

type Side = 'student' | 'ngo' | 'admin' | 'otp' | 'forgot' | 'reset';

const sideContent: Record<
  Side,
  { title: string; subtitle: string; points: { icon: typeof ShieldCheck; text: string }[]; tone: string }
> = {
  student: {
    title: 'Your career journey starts here',
    subtitle: 'Join 15,000+ students discovering free, verified skill programs across India.',
    points: [
      { icon: GraduationCap, text: 'Free career-ready training programs' },
      { icon: BadgeCheck, text: 'Verified NGOs, fully CSR-funded' },
      { icon: Briefcase, text: 'Placement assistance after completion' },
    ],
    tone: 'from-brand-600 via-brand-700 to-teal-600',
  },
  ngo: {
    title: 'Reach the right students, faster',
    subtitle: 'List your free programs on India\'s skill development discovery platform and get matched applicants.',
    points: [
      { icon: Users, text: 'Reach verified, eligible students' },
      { icon: ShieldCheck, text: 'Transparent verification process' },
      { icon: BadgeCheck, text: 'Showcase your impact and placements' },
    ],
    tone: 'from-teal-600 via-teal-700 to-brand-700',
  },
  admin: {
    title: 'Secure admin access',
    subtitle: 'Manage NGOs, programs, and platform integrity from a single dashboard.',
    points: [
      { icon: ShieldCheck, text: 'Role-based access control' },
      { icon: BadgeCheck, text: 'Audit-ready verification tools' },
    ],
    tone: 'from-ink-800 via-ink-900 to-brand-900',
  },
  otp: {
    title: 'Verify your email',
    subtitle: 'A 6-digit code keeps your KaamLok account secure. Check your inbox — it expires in 5 minutes.',
    points: [
      { icon: ShieldCheck, text: 'Email verification required' },
      { icon: BadgeCheck, text: 'Protects against fake accounts' },
    ],
    tone: 'from-brand-600 via-brand-700 to-teal-600',
  },
  forgot: {
    title: 'Reset your password',
    subtitle: 'We\'ll send a one-time code to your registered email so you can set a new password securely.',
    points: [
      { icon: ShieldCheck, text: 'OTP-based secure reset' },
      { icon: BadgeCheck, text: 'Never share your password' },
    ],
    tone: 'from-amber-500 via-amber-600 to-brand-700',
  },
  reset: {
    title: 'Create a new password',
    subtitle: 'Choose a strong password you haven\'t used before. Your account security matters to us.',
    points: [
      { icon: ShieldCheck, text: 'Encrypted password storage' },
      { icon: BadgeCheck, text: 'Strength meter guides you' },
    ],
    tone: 'from-teal-600 via-teal-700 to-brand-700',
  },
};

type Props = {
  side: Side;
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
};

/**
 * Split-screen auth layout: branded gradient panel on the left,
 * white form area on the right. Matches KaamLok's premium design.
 */
export function AuthLayout({ side, children, title, subtitle, showBack, backTo = '/', backLabel = 'Back to home' }: Props) {
  const s = sideContent[side];
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: branded panel */}
      <aside className={`relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br ${s.tone} p-10 lg:flex`}>
        <div className="absolute inset-0 bg-dots opacity-10" />
        <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-blob [animation-delay:4s]" />

        <div className="relative">
          <Logo dark />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight text-white text-balance">{s.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 text-pretty">{s.subtitle}</p>
          <ul className="mt-8 space-y-3">
            {s.points.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20 backdrop-blur">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs font-medium text-white/60">
          © {new Date().getFullYear()} KaamLok · Learn. Grow. Get Career Ready.
        </div>
      </aside>

      {/* Right: form area */}
      <main className="relative flex flex-col bg-ink-50 px-5 py-8 sm:px-8">
        {/* Mobile logo */}
        <div className="flex items-center justify-between lg:hidden">
          <Logo />
          {showBack && (
            <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          )}
        </div>

        <div className="hidden lg:block">
          {showBack && (
            <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl text-balance">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-ink-500 text-pretty">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
