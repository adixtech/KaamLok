import { Link } from 'react-router-dom';
import {
  BookOpen, Award, Briefcase, TrendingUp, ArrowRight,
  Search, Bell, LogOut, FileText, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';

export function StudentDashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-ink-50">
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
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
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
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Welcome back, {user?.firstName || 'Student'}!
        </h1>
        <p className="mt-1.5 text-sm text-ink-500 text-pretty">
          Track your applications, continue learning, and get career-ready.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Active Programs" value="0" tone="bg-brand-50 text-brand-600" />
          <StatCard icon={<Award className="h-5 w-5" />} label="Certificates" value="0" tone="bg-teal-50 text-teal-600" />
          <StatCard icon={<Briefcase className="h-5 w-5" />} label="Applications" value="0" tone="bg-amber-50 text-amber-600" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Profile Views" value="0" tone="bg-emerald-50 text-emerald-600" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="text-sm font-bold text-ink-900">Recent Applications</h3>
            <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-ink-300" />
              <p className="mt-3 text-sm text-ink-500">No applications yet</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Browse Programs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="text-sm font-bold text-ink-900">Upcoming Deadlines</h3>
            <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-ink-300" />
              <p className="mt-3 text-sm text-ink-500">No upcoming deadlines</p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Explore Programs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <p className="mt-3 text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-500">{label}</p>
    </div>
  );
}
