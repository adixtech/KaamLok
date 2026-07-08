import { useEffect, useState } from 'react';
import {
  GraduationCap, Building2, BookOpen, Briefcase, Users, TrendingUp,
  Activity, Server, Database, HardDrive, Mail, KeyRound,
  CheckCircle2, Clock, Ban, FileText,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminSkeleton, ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { DashboardStats } from '../../types/admin';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <AdminSkeleton key={i} className="h-32" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <ErrorState message={error || 'No data available'} onRetry={() => window.location.reload()} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Platform overview and system health</p>
      </div>

      {/* Students */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Students</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Total Students" value={stats.students.total} tone="bg-brand-50 text-brand-600" />
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Verified" value={stats.students.verified} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={stats.students.pending} tone="bg-amber-50 text-amber-600" />
          <StatCard icon={<Ban className="h-5 w-5" />} label="Blocked" value={stats.students.blocked} tone="bg-rose-50 text-rose-600" />
        </div>
      </div>

      {/* NGOs */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">NGOs</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Building2 className="h-5 w-5" />} label="Total NGOs" value={stats.ngos.total} tone="bg-teal-50 text-teal-600" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Approval" value={stats.ngos.pending} tone="bg-amber-50 text-amber-600" />
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Approved" value={stats.ngos.approved} tone="bg-emerald-50 text-emerald-600" />
          <StatCard icon={<Ban className="h-5 w-5" />} label="Blocked" value={stats.ngos.blocked} tone="bg-rose-50 text-rose-600" />
        </div>
      </div>

      {/* Platform */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Platform</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5" />} label="Total Courses" value={stats.courses.total} tone="bg-brand-50 text-brand-600" />
          <StatCard icon={<Briefcase className="h-5 w-5" />} label="Active Applications" value={stats.applications.active} tone="bg-amber-50 text-amber-600" />
          <StatCard icon={<Users className="h-5 w-5" />} label="Total Admins" value={stats.admins.total} tone="bg-ink-100 text-ink-600" />
          <StatCard icon={<Building2 className="h-5 w-5" />} label="CSR Companies" value={stats.companies.total} tone="bg-teal-50 text-teal-600" />
        </div>
      </div>

      {/* Logins */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">Login Activity</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Daily Logins" value={stats.logins.daily} tone="bg-brand-50 text-brand-600" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Weekly Logins" value={stats.logins.weekly} tone="bg-teal-50 text-teal-600" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Monthly Logins" value={stats.logins.monthly} tone="bg-amber-50 text-amber-600" />
        </div>
      </div>

      {/* System Health + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Health */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
            <Activity className="h-4 w-4 text-brand-600" />
            System Health
          </h3>
          <div className="space-y-3">
            <HealthRow icon={<Server className="h-4 w-4" />} label="Server Status" value={stats.systemHealth.server} />
            <HealthRow icon={<Database className="h-4 w-4" />} label="Database Status" value={stats.systemHealth.database} />
            <HealthRow icon={<HardDrive className="h-4 w-4" />} label="Storage Usage" value={`${stats.systemHealth.storage.used} / ${stats.systemHealth.storage.total} ${stats.systemHealth.storage.unit}`} />
            <HealthRow icon={<Mail className="h-4 w-4" />} label="Email Queue" value="Operational" />
            <HealthRow icon={<KeyRound className="h-4 w-4" />} label="OTP Requests" value="Normal" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
            <FileText className="h-4 w-4 text-brand-600" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {stats.recentActivities.length === 0 ? (
              <p className="py-4 text-center text-sm text-ink-400">No recent activity</p>
            ) : (
              stats.recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-ink-50 pb-3 last:border-0">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-500">
                    <Activity className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      {act.adminName} <span className="font-normal text-ink-500">{act.action.replace(/_/g, ' ')}</span>
                    </p>
                    <p className="truncate text-xs text-ink-400">{act.targetName}</p>
                  </div>
                  <AdminBadge tone={statusTone('active')}>{new Date(act.timestamp).toLocaleDateString()}</AdminBadge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function HealthRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-ink-600">
        <span className="text-ink-400">{icon}</span>
        {label}
      </div>
      <AdminBadge tone="success">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {value}
      </AdminBadge>
    </div>
  );
}
