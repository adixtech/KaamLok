import { useEffect, useState } from 'react';
import {
  BarChart3,
  GraduationCap,
  Building2,
  Briefcase,
  TrendingUp,
  MapPin,
} from 'lucide-react';

import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { AnalyticsData } from '../../types/admin';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const PERIODS: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('monthly');

  useEffect(() => {
    setLoading(true);
    adminApi.getAnalytics(period)
      .then(setData)
      .catch((err) => setError((err as Error)?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={() => setPeriod('monthly')} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Analytics</h1>
          <p className="mt-1 text-sm text-ink-500">Platform growth and engagement metrics</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-ink-200">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                period === p ? 'bg-brand-600 text-white' : 'text-ink-500 hover:bg-ink-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-ink-200/60" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Total Students" value={data.totals.students} tone="bg-brand-50 text-brand-600" />
            <StatCard icon={<Building2 className="h-5 w-5" />} label="Total NGOs" value={data.ngoGrowth.reduce((sum, d) => sum + d.count, 0)} tone="bg-teal-50 text-teal-600" />
            <StatCard icon={<Briefcase className="h-5 w-5" />} label="Total Applications" value={data.applicationGrowth.reduce((sum, d) => sum + d.count, 0)} tone="bg-amber-50 text-amber-600" />
          </div>

          {/* Charts */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <BarChartCard title="User Growth" icon={<TrendingUp className="h-4 w-4 text-brand-600" />} data={data.userGrowth} tone="bg-brand-500" />
            <BarChartCard title="NGO Growth" icon={<Building2 className="h-4 w-4 text-teal-600" />} data={data.ngoGrowth} tone="bg-teal-500" />
            <BarChartCard title="Application Growth" icon={<Briefcase className="h-4 w-4 text-amber-600" />} data={data.applicationGrowth} tone="bg-amber-500" />
          </div>

          {/* Lists */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Course Popularity */}
            <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                Course Popularity
              </h3>
              <div className="space-y-3">
                {data.coursePopularity.length === 0 ? (
                  <p className="py-4 text-center text-sm text-ink-400">No data available</p>
                ) : (
                  data.coursePopularity.slice(0, 10).map((c, i) => {
                    const max = data.coursePopularity[0].count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-32 truncate text-sm font-medium text-ink-700">{c._id}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${(c.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ink-500">{c.count}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* State-wise Distribution */}
            <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
                <MapPin className="h-4 w-4 text-teal-600" />
                State-wise Distribution
              </h3>
              <div className="space-y-3">
                {data.stateWise.length === 0 ? (
                  <p className="py-4 text-center text-sm text-ink-400">No data available</p>
                ) : (
                  data.stateWise.slice(0, 10).map((s, i) => {
                    const max = data.stateWise[0].count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-32 truncate text-sm font-medium text-ink-700">{s._id}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${(s.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ink-500">{s.count}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function BarChartCard({ title, icon, data, tone }: { title: string; icon: React.ReactNode; data: { _id: Record<string, number>; count: number }[]; tone: string }) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 0;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
        {icon}
        {title}
      </h3>
      <div className="flex h-40 items-end justify-between gap-1.5">
        {data.length === 0 ? (
          <p className="w-full text-center text-sm text-ink-400">No data</p>
        ) : (
          data.slice(-12).map((d, i) => {
            const label = String(Object.values(d._id)[0] || '');
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end justify-center" style={{ height: '120px' }}>
                  <div
                    className={`w-full rounded-t-md ${tone} transition-all`}
                    style={{ height: `${max > 0 ? (d.count / max) * 100 : 0}%`, minHeight: '4px' }}
                    title={`${label}: ${d.count}`}
                  />
                </div>
                <span className="truncate text-[10px] text-ink-400" style={{ maxWidth: '40px' }}>{label}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
