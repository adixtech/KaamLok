import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Award, Bookmark, Calendar, Search, ArrowRight,
  CheckCircle2, Clock, TrendingUp, Bell, BookOpen, Star,
  ChevronRight, AlertCircle, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/studentApi';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Skeleton } from '../../components/ui/Loading';
import type { StudentDashboardStats, ApplicationWithCourse } from '../../types/student';

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Applied' },
  under_review: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Under Review' },
  shortlisted: { bg: 'bg-teal-50', text: 'text-teal-700', label: 'Shortlisted' },
  interview_scheduled: { bg: 'bg-brand-50', text: 'text-brand-700', label: 'Interview Scheduled' },
  selected: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Selected' },
  rejected: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Not Selected' },
  waitlisted: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Waitlisted' },
  withdrawn: { bg: 'bg-ink-100', text: 'text-ink-500', label: 'Withdrawn' },
};

export function StudentDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ApplicationWithCourse[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<ApplicationWithCourse[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<{ applicationId: string; course: unknown; daysLeft: number }[]>([]);
  const [profileScore, setProfileScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [dashData, profileData] = await Promise.all([
          studentApi.getDashboardStats(),
          studentApi.getProfile(),
        ]);
        if (active) {
          setStats(dashData.stats);
          setRecentActivity(dashData.recentActivity);
          setUpcomingInterviews(dashData.upcomingInterviews);
          setUpcomingDeadlines(dashData.upcomingDeadlines);
          setProfileScore(profileData.profileCompletionScore);
        }
      } catch {
        // silently fail — show empty states
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const statCards = [
    { icon: FileText, label: 'Applications', value: stats?.totalApplications ?? 0, to: '/student/applications', tone: 'bg-brand-50 text-brand-600' },
    { icon: Star, label: 'Active', value: stats?.activeApplications ?? 0, to: '/student/applications', tone: 'bg-amber-50 text-amber-600' },
    { icon: Award, label: 'Certificates', value: stats?.certificates ?? 0, to: '/student/certificates', tone: 'bg-teal-50 text-teal-600' },
    { icon: Bookmark, label: 'Saved', value: stats?.savedCourses ?? 0, to: '/student/saved', tone: 'bg-emerald-50 text-emerald-600' },
  ];

  const journeySteps = [
    { key: 'profile', label: 'Profile Created', done: true, icon: CheckCircle2 },
    { key: 'applied', label: 'Applied', done: (stats?.totalApplications ?? 0) > 0, icon: FileText },
    { key: 'shortlisted', label: 'Shortlisted', done: false, icon: Star },
    { key: 'interview', label: 'Interview', done: false, icon: Calendar },
    { key: 'training', label: 'Training', done: false, icon: GraduationCap },
    { key: 'certificate', label: 'Certificate', done: (stats?.certificates ?? 0) > 0, icon: Award },
  ];

  return (
    <StudentLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Welcome back, {user?.firstName || 'Student'}!
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Track your applications, discover new programs, and advance your career.
        </p>
      </div>

      {/* Profile completion banner */}
      {!loading && profileScore < 80 && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Complete Your Profile — {profileScore}% done</p>
              <p className="text-xs text-amber-700">A complete profile increases your chances of being selected.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 sm:w-32">
              <div className="h-2 overflow-hidden rounded-full bg-amber-200">
                <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${profileScore}%` }} />
              </div>
            </div>
            <Link to="/student/profile">
              <button className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700">
                Complete Profile
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Link key={s.label} to={s.to}>
              <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:-translate-y-0.5 hover:shadow-float">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-extrabold text-ink-900">{s.value}</p>
                <p className="text-xs font-medium text-ink-500">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Career Journey */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <TrendingUp className="h-4 w-4 text-brand-600" />
          Career Journey
        </h2>
        <div className="mt-5 flex flex-wrap gap-2 sm:gap-0">
          {journeySteps.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 ${step.done ? 'opacity-100' : 'opacity-40'}`}>
                <span className={`grid h-10 w-10 place-items-center rounded-full ${step.done ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'}`}>
                  <step.icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold text-ink-600 whitespace-nowrap">{step.label}</span>
              </div>
              {i < journeySteps.length - 1 && (
                <div className={`mx-1 h-0.5 w-6 sm:w-12 ${step.done ? 'bg-brand-400' : 'bg-ink-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <Clock className="h-4 w-4 text-brand-600" />
              Recent Activity
            </h2>
            <Link to="/student/applications" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-10 w-10 text-ink-300" />
              <p className="mt-2 text-sm text-ink-500">No applications yet</p>
              <Link to="/student/discover">
                <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Browse Programs <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((app) => {
                const badge = STATUS_BADGE[app.status] || STATUS_BADGE.pending;
                return (
                  <div key={app._id} className="flex items-center gap-3 rounded-xl bg-ink-50 p-3 ring-1 ring-ink-100">
                    {app.course?.thumbnail ? (
                      <img src={app.course.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50">
                        <BookOpen className="h-5 w-5 text-brand-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {app.course?.title || 'Unknown Course'}
                      </p>
                      <p className="truncate text-xs text-ink-400">{app.course?.ngoName}</p>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming Interviews */}
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <Calendar className="h-4 w-4 text-brand-600" />
              Upcoming Interviews
            </h2>
            {loading ? <Skeleton className="mt-3 h-24 rounded-xl" /> : upcomingInterviews.length === 0 ? (
              <p className="mt-3 text-xs text-ink-400">No upcoming interviews</p>
            ) : (
              <div className="mt-3 space-y-2">
                {upcomingInterviews.map((app) => (
                  <div key={app._id} className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100">
                    <p className="text-sm font-semibold text-ink-900 truncate">{app.course?.title}</p>
                    <p className="text-xs text-brand-600">
                      {app.interview?.scheduledAt
                        ? new Date(app.interview.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'Date TBD'}
                    </p>
                    <p className="mt-1 text-xs text-ink-500 capitalize">{app.interview?.mode} interview</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <Clock className="h-4 w-4 text-rose-500" />
              Upcoming Deadlines
            </h2>
            {loading ? <Skeleton className="mt-3 h-24 rounded-xl" /> : upcomingDeadlines.length === 0 ? (
              <p className="mt-3 text-xs text-ink-400">No pending deadlines</p>
            ) : (
              <div className="mt-3 space-y-2">
                {upcomingDeadlines.map((d, i) => {
                  const c = d.course as { title?: string };
                  return (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
                      <p className="text-xs font-semibold text-ink-900 truncate flex-1">{c?.title}</p>
                      <span className={`ml-2 shrink-0 text-xs font-bold ${d.daysLeft <= 1 ? 'text-rose-600' : 'text-orange-600'}`}>
                        {d.daysLeft <= 0 ? 'Today!' : `${d.daysLeft}d left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h2 className="text-sm font-bold text-ink-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/student/discover', icon: Search, label: 'Browse Programs', color: 'text-brand-600 bg-brand-50' },
                { to: '/student/applications', icon: FileText, label: 'My Applications', color: 'text-amber-600 bg-amber-50' },
                { to: '/student/profile', icon: Bell, label: 'Update Profile', color: 'text-teal-600 bg-teal-50' },
              ].map((action) => (
                <Link key={action.to} to={action.to} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-ink-700">{action.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-ink-300" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
