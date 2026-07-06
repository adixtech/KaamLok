import { LogOut, Bell, Search, TrendingUp, BookOpen, Award, Briefcase, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Minimal dashboard shell shared by all three role dashboards.
 * In production these would be full feature pages; here they serve as
 * authenticated route targets that prove the auth flow works end-to-end.
 */
function DashboardShell({
  greeting,
  subtitle,
  stats,
  accent,
}: {
  greeting: string;
  subtitle: string;
  stats: { icon: typeof TrendingUp; label: string; value: string; tone: string }[];
  accent: string;
}) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-ink-200/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                placeholder="Search programs, NGOs..."
                className="w-64 rounded-2xl border border-ink-200 bg-ink-50/60 py-2.5 pl-9 pr-4 text-sm font-medium text-ink-700 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-2">
              <span className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${accent} text-sm font-bold text-white`}>
                {user?.firstName?.[0] || 'U'}
              </span>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-ink-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-ink-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{greeting}</h1>
        <p className="mt-1.5 text-sm text-ink-500 text-pretty">{subtitle}</p>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-2xl font-extrabold text-ink-900">{s.value}</p>
              <p className="text-xs font-medium text-ink-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Placeholder content */}
        <div className="mt-8 rounded-3xl border-2 border-dashed border-ink-200 bg-white/50 p-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <BookOpen className="h-7 w-7" />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink-900">Dashboard coming soon</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-ink-500 text-pretty">
            This is a protected route proving your authentication works. The full dashboard
            with programs, applications, and analytics will be built next.
          </p>
          <Button variant="secondary" className="mt-5" iconRight={<ArrowRight className="h-4 w-4" />}>
            Explore Programs
          </Button>
        </div>
      </main>
    </div>
  );
}

export function StudentDashboard() {
  const { user } = useAuth();
  return (
    <DashboardShell
      greeting={`Welcome back, ${user?.firstName || 'Student'}!`}
      subtitle="Track your applications, continue learning, and get career-ready."
      accent="from-brand-500 to-teal-500"
      stats={[
        { icon: BookOpen, label: 'Active Programs', value: '3', tone: 'bg-brand-50 text-brand-600' },
        { icon: Award, label: 'Certificates', value: '2', tone: 'bg-teal-50 text-teal-600' },
        { icon: Briefcase, label: 'Applications', value: '7', tone: 'bg-amber-50 text-amber-600' },
        { icon: TrendingUp, label: 'Profile Views', value: '124', tone: 'bg-emerald-50 text-emerald-600' },
      ]}
    />
  );
}

export function NGODashboard() {
  const { user } = useAuth();
  return (
    <DashboardShell
      greeting={`Welcome, ${user?.ngoName || user?.firstName || 'NGO'}!`}
      subtitle="Manage your programs, review applications, and track placement impact."
      accent="from-teal-500 to-brand-600"
      stats={[
        { icon: BookOpen, label: 'Active Programs', value: '12', tone: 'bg-teal-50 text-teal-600' },
        { icon: Briefcase, label: 'Applications', value: '248', tone: 'bg-brand-50 text-brand-600' },
        { icon: Award, label: 'Students Trained', value: '1,420', tone: 'bg-amber-50 text-amber-600' },
        { icon: TrendingUp, label: 'Placement Rate', value: '87%', tone: 'bg-emerald-50 text-emerald-600' },
      ]}
    />
  );
}

export function AdminDashboard() {
  return (
    <DashboardShell
      greeting="Admin Control Center"
      subtitle="Verify NGOs, manage programs, and monitor platform integrity."
      accent="from-ink-700 to-ink-900"
      stats={[
        { icon: BookOpen, label: 'Total Programs', value: '150', tone: 'bg-brand-50 text-brand-600' },
        { icon: Briefcase, label: 'Pending NGOs', value: '8', tone: 'bg-amber-50 text-amber-600' },
        { icon: Award, label: 'Verified NGOs', value: '50', tone: 'bg-teal-50 text-teal-600' },
        { icon: TrendingUp, label: 'Active Users', value: '15.2K', tone: 'bg-emerald-50 text-emerald-600' },
      ]}
    />
  );
}
