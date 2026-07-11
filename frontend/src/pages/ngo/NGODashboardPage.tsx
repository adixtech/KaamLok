import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, CheckCircle2, XCircle, Clock, TrendingUp,
  Calendar, ArrowRight, PlusCircle, Briefcase, FileText, AlertCircle,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { NGOStatCard } from '../../components/ngo/NGOStatCard';
import { ngoApi } from '../../services/ngoApi';
import type { NGODashboardStats, Application } from '../../types/ngo';
import { FullScreenLoader } from '../../components/ui/Loading';

export function NGODashboardPage() {
  const [stats, setStats] = useState<NGODashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ngoApi.getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullScreenLoader label="Loading dashboard..." />;
  if (error || !stats) {
    return (
      <NGOLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      </NGOLayout>
    );
  }

  const seatFillPercentage = stats.seats.total > 0
    ? Math.round((stats.seats.filled / stats.seats.total) * 100)
    : 0;

  return (
    <NGOLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Welcome back! Here's your organization overview.</p>
        </div>
        <Link
          to="/ngo/courses/create"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-teal-700"
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NGOStatCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Total Courses"
          value={stats.courses.total}
          tone="bg-teal-50 text-teal-600"
        />
        <NGOStatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Active Courses"
          value={stats.courses.active}
          tone="bg-brand-50 text-brand-600"
        />
        <NGOStatCard
          icon={<FileText className="h-5 w-5" />}
          label="Draft Courses"
          value={stats.courses.draft}
          tone="bg-amber-50 text-amber-600"
        />
        <NGOStatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Closed Courses"
          value={stats.courses.closed}
          tone="bg-ink-100 text-ink-600"
        />
      </div>

      {/* Applications Overview */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Applications</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <NGOStatCard
            icon={<Briefcase className="h-5 w-5" />}
            label="Total Received"
            value={stats.applications.received}
            tone="bg-brand-50 text-brand-600"
          />
          <NGOStatCard
            icon={<Clock className="h-5 w-5" />}
            label="Pending Review"
            value={stats.applications.pending}
            tone="bg-amber-50 text-amber-600"
          />
          <NGOStatCard
            icon={<Users className="h-5 w-5" />}
            label="Shortlisted"
            value={stats.applications.shortlisted}
            tone="bg-teal-50 text-teal-600"
          />
          <NGOStatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Selected"
            value={stats.applications.selected}
            tone="bg-emerald-50 text-emerald-600"
          />
          <NGOStatCard
            icon={<XCircle className="h-5 w-5" />}
            label="Rejected"
            value={stats.applications.rejected}
            tone="bg-rose-50 text-rose-600"
          />
          <NGOStatCard
            icon={<Clock className="h-5 w-5" />}
            label="Waitlisted"
            value={stats.applications.waitlisted}
            tone="bg-ink-100 text-ink-600"
          />
        </div>
      </div>

      {/* Seats Overview */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Seats Overview</h2>
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">Seat Utilization</p>
              <p className="mt-1 text-3xl font-extrabold text-ink-900">{seatFillPercentage}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-500">Filled / Total</p>
              <p className="mt-1 text-xl font-bold text-ink-900">
                {stats.seats.filled} / {stats.seats.total}
              </p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-brand-600 transition-all duration-500"
              style={{ width: `${seatFillPercentage}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-ink-500">
            <span>Available: {stats.seats.available}</span>
            <span>Filled: {stats.seats.filled}</span>
          </div>
        </div>
      </div>

      {/* Applications Trend Chart */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Applications Trend (Last 7 Days)</h2>
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
          {stats.applicationsTrend.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No application data yet</p>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {stats.applicationsTrend.map((day, i) => {
                const maxCount = Math.max(...stats.applicationsTrend.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-ink-600">{day.count}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-brand-500" style={{ height: `${height}%`, minHeight: '4px' }} />
                    <span className="text-[10px] text-ink-400">{day._id.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-900">Recent Applications</h3>
            <Link to="/ngo/applications" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recentApplications.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No applications yet</p>
            ) : (
              stats.recentApplications.slice(0, 5).map((app) => (
                <RecentApplicationRow key={app._id} application={app} />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-900">Upcoming Deadlines</h3>
            <Link to="/ngo/courses" className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No upcoming deadlines</p>
            ) : (
              stats.upcomingDeadlines.slice(0, 5).map((deadline) => (
                <DeadlineRow key={deadline._id} deadline={deadline} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            to="/ngo/courses/create"
            icon={<PlusCircle className="h-5 w-5" />}
            label="Create Course"
            description="Publish a new training program"
            tone="bg-teal-50 text-teal-600"
          />
          <QuickActionCard
            to="/ngo/applications"
            icon={<Briefcase className="h-5 w-5" />}
            label="Review Applications"
            description={`${stats.applications.pending} pending review`}
            tone="bg-brand-50 text-brand-600"
          />
          <QuickActionCard
            to="/ngo/profile"
            icon={<FileText className="h-5 w-5" />}
            label="Edit Organization"
            description="Update your profile"
            tone="bg-amber-50 text-amber-600"
          />
          <QuickActionCard
            to="/ngo/analytics"
            icon={<TrendingUp className="h-5 w-5" />}
            label="Download Report"
            description="Export analytics data"
            tone="bg-ink-100 text-ink-600"
          />
        </div>
      </div>
    </NGOLayout>
  );
}

function RecentApplicationRow({ application }: { application: Application }) {
  const student = typeof application.studentId === 'object' ? application.studentId : null;
  const course = typeof application.courseId === 'object' ? application.courseId : null;

  const statusTone: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    under_review: 'bg-brand-50 text-brand-700',
    shortlisted: 'bg-teal-50 text-teal-700',
    selected: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-rose-50 text-rose-700',
    waitlisted: 'bg-ink-100 text-ink-700',
    interview_scheduled: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="flex items-center gap-3 border-b border-ink-50 pb-3 last:border-0">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xs font-bold text-white">
        {student?.firstName?.[0] || '?'}{student?.lastName?.[0] || ''}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {student?.firstName} {student?.lastName}
        </p>
        <p className="truncate text-xs text-ink-500">{course?.title || 'Unknown Course'}</p>
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusTone[application.status] || 'bg-ink-100 text-ink-700'}`}>
        {application.status.replace('_', ' ')}
      </span>
    </div>
  );
}

function DeadlineRow({ deadline }: { deadline: { _id: string; title: string; applicationEnd: string; daysLeft: number; seatsAvailable: number } }) {
  const urgencyTone = deadline.daysLeft <= 1
    ? 'text-rose-600'
    : deadline.daysLeft <= 3
      ? 'text-amber-600'
      : 'text-ink-500';

  return (
    <div className="flex items-center gap-3 border-b border-ink-50 pb-3 last:border-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
        <Calendar className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">{deadline.title}</p>
        <p className="text-xs text-ink-500">{deadline.seatsAvailable} seats remaining</p>
      </div>
      <span className={`text-right text-sm font-semibold ${urgencyTone}`}>
        {deadline.daysLeft === 0 ? 'Today' : `${deadline.daysLeft}d`}
      </span>
    </div>
  );
}

function QuickActionCard({
  to,
  icon,
  label,
  description,
  tone,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  tone: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:shadow-float hover:-translate-y-0.5"
    >
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900 group-hover:text-teal-600">{label}</p>
        <p className="text-xs text-ink-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
    </Link>
  );
}
