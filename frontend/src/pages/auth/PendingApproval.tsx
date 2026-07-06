import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Mail, ArrowRight, LogOut } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Pending Approval page shown to NGOs whose verificationStatus !== 'approved'.
 */
export function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/60 via-ink-50 to-ink-50" />
      <div className="absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl animate-blob" />
      <div className="absolute -right-20 bottom-20 -z-10 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl animate-blob [animation-delay:3s]" />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Logo />
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-100 hover:text-brand-700"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </header>

      <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-12 text-center sm:px-6 lg:pt-20">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-amber-50 text-amber-600 shadow-soft ring-1 ring-inset ring-amber-200">
          <Clock className="h-10 w-10" />
        </span>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl text-balance">
          Your NGO is pending verification
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-500 text-pretty">
          Thank you for registering{user?.ngoName ? `, ${user.ngoName}` : ''}. Our team is reviewing
          your application. You'll receive an email at{' '}
          <span className="font-semibold text-ink-700">{user?.email || 'your registered email'}</span>{' '}
          once your NGO is approved and dashboard access is granted.
        </p>

        <div className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-card ring-1 ring-inset ring-ink-200/50">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-400">Verification timeline</h3>
          <ul className="mt-4 space-y-3">
            {[
              { label: 'Registration submitted', done: true },
              { label: 'NGO registration number validated', done: true },
              { label: 'Official email verified', done: true },
              { label: 'CSR funding eligibility confirmed', done: false },
              { label: 'Dashboard access granted', done: false },
            ].map((step, i) => (
              <li key={step.label} className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                    step.done
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-ink-100 text-ink-400'
                  }`}
                >
                  {step.done ? <ShieldCheck className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`text-sm font-medium ${step.done ? 'text-ink-700' : 'text-ink-400'}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="white" icon={<Mail className="h-4 w-4" />}>
            Contact Support
          </Button>
          <Link to="/">
            <Button variant="ghost" iconRight={<ArrowRight className="h-4 w-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-xs text-ink-400">
          Verification usually takes 2–3 business days. Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
