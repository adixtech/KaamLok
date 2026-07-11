import { useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  BarChart3, TrendingUp, Users, CheckCircle2, XCircle, BookOpen,
  Download, ChevronDown, Target,
  PieChart, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { ngoApi } from '../../services/ngoApi';
import type { NGOAnalytics, Course } from '../../types/ngo';
import { FullScreenLoader } from '../../components/ui/Loading';
import toast from 'react-hot-toast';

type Period = '7d' | '30d' | '90d' | '1y';
type ChartType = 'applications' | 'courses' | 'status' | 'seats';

export function NGOAnalyticsPage() {
  const [analytics, setAnalytics] = useState<NGOAnalytics | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('30d');
  const [activeChart, setActiveChart] = useState<ChartType>('applications');
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, coursesRes] = await Promise.all([
        ngoApi.getAnalytics(period),
        ngoApi.listCourses({ limit: 100 }),
      ]);
      setAnalytics(analyticsRes);
      setCourses(coursesRes.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportToCSV = async () => {
    setExporting(true);
    try {
      if (!analytics) return;

      const rows = [
        ['Report Type', 'Key', 'Value'],
        ...analytics.statusDistribution.map((s) => ['Status Distribution', s._id, s.count.toString()]),
        ...analytics.courseStats.map((c) => ['Course Stats', c._id, `${c.count},${c.totalSeats},${c.filled}`]),
      ];

      const csvContent = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ngo-analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success('Analytics exported to CSV');
    } catch {
      toast.error('Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Excel export feature - coming soon with backend integration');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('PDF export feature - coming soon with backend integration');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <FullScreenLoader label="Loading analytics..." />;
  if (error || !analytics) {
    return (
      <NGOLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{error || 'Failed to load analytics'}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </NGOLayout>
    );
  }

  const totalApplications = analytics.statusDistribution.reduce((sum, s) => sum + s.count, 0);
  const selectedCount = analytics.statusDistribution.find((s) => s._id === 'selected')?.count || 0;
  const selectionRate = totalApplications > 0 ? Math.round((selectedCount / totalApplications) * 100) : 0;

  const totalSeats = analytics.courseStats.reduce((sum, c) => sum + c.totalSeats, 0);
  const filledSeats = analytics.courseStats.reduce((sum, c) => sum + c.filled, 0);
  const fillRate = totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;

  return (
    <NGOLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-ink-500">Track performance and gain insights</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PeriodSelect value={period} onChange={(v) => setPeriod(v as Period)} />
          <div className="group relative">
            <button
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-float ring-1 ring-ink-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={exportToCSV}
                className="block w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                Export as CSV
              </button>
              <button
                onClick={exportToExcel}
                className="block w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                Export as Excel (Coming Soon)
              </button>
              <button
                onClick={exportToPDF}
                className="block w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                Export as PDF (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Total Applications"
          value={totalApplications}
          trend={12}
          tone="bg-brand-50 text-brand-600"
        />
        <MetricCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Selection Rate"
          value={`${selectionRate}%`}
          trend={5}
          tone="bg-teal-50 text-teal-600"
        />
        <MetricCard
          icon={<Target className="h-5 w-5" />}
          label="Seats Filled"
          value={`${fillRate}%`}
          trend={8}
          tone="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Active Courses"
          value={courses.length}
          tone="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Chart Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'applications', label: 'Applications Trend', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'courses', label: 'Course Performance', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'status', label: 'Status Distribution', icon: <PieChart className="h-4 w-4" /> },
          { id: 'seats', label: 'Seat Utilization', icon: <Target className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id as ChartType)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeChart === tab.id
                ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-500'
                : 'bg-white text-ink-600 hover:bg-ink-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
          <h3 className="font-bold text-ink-900">
            {activeChart === 'applications' && 'Applications Over Time'}
            {activeChart === 'courses' && 'Course-wise Applications'}
            {activeChart === 'status' && 'Application Status Distribution'}
            {activeChart === 'seats' && 'Seat Fill Rate by Course'}
          </h3>

          <div className="mt-6">
            {activeChart === 'applications' && (
              <ApplicationsChart data={analytics.applicationsGrowth} />
            )}
            {activeChart === 'courses' && (
              <CourseBarChart data={analytics.courseStats} />
            )}
            {activeChart === 'status' && (
              <StatusChart data={analytics.statusDistribution} />
            )}
            {activeChart === 'seats' && <SeatsChart data={analytics.courseStats} />}
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-4">
          {/* Status Breakdown */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="font-bold text-ink-900">Status Breakdown</h3>
            <div className="mt-4 space-y-3">
              {analytics.statusDistribution.map((status) => {
                const percentage = totalApplications > 0
                  ? Math.round((status.count / totalApplications) * 100)
                  : 0;
                return (
                  <div key={status._id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink-700">{status._id.replace('_', ' ')}</span>
                        <span className="text-ink-500">{status.count}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-ink-500">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Courses */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="font-bold text-ink-900">Popular Courses</h3>
            <div className="mt-4 space-y-3">
              {analytics.courseStats
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((course, idx) => (
                  <div key={course._id} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{course._id}</p>
                      <p className="text-xs text-ink-500">
                        {course.count} applications · {course.filled}/{course.totalSeats} seats
                      </p>
                    </div>
                  </div>
                ))}
              {analytics.courseStats.length === 0 && (
                <p className="py-4 text-center text-sm text-ink-400">No courses yet</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-brand-600 p-6 text-white">
            <h3 className="font-bold">Need More Insights?</h3>
            <p className="mt-1 text-sm text-white/80">
              Export detailed reports or schedule a monthly digest email.
            </p>
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30"
            >
              <Download className="h-4 w-4" />
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </NGOLayout>
  );
}

function PeriodSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-ink-200 bg-white py-2 px-4 pr-10 text-sm font-medium text-ink-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="90d">Last 90 Days</option>
        <option value="1y">Last Year</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-extrabold text-ink-900">{value}</p>
        <p className="mt-1 text-xs text-ink-500">{label}</p>
      </div>
    </div>
  );
}

function ApplicationsChart({
  data,
}: {
  data: { _id: Record<string, number>; count: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-400">
        No data for selected period
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((item, i) => {
        const height = (item.count / maxCount) * 100;
        const dateLabel = item._id?.year && item._id?.month
          ? `${item._id.month}/${item._id.year}`
          : `Day ${i + 1}`;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-ink-600">{item.count}</span>
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-brand-500"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <span className="text-[10px] text-ink-400">{dateLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function CourseBarChart({ data }: { data: { _id: string; count: number; totalSeats: number; filled: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-400">
        No course data available
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((course, i) => {
        const width = (course.count / maxCount) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 truncate text-xs font-medium text-ink-700">{course._id}</span>
            <div className="min-w-0 flex-1">
              <div className="h-6 overflow-hidden rounded-lg bg-ink-100">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-teal-500 to-brand-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-ink-600">{course.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatusChart({ data }: { data: { _id: string; count: number }[] }) {
  const colors = [
    'bg-brand-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-ink-500',
    'bg-purple-500',
  ];

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-400">
        No status data available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-8 overflow-hidden rounded-lg">
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div
              key={item._id}
              className={`${colors[i % colors.length]}`}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {data.map((item, i) => (
          <div key={item._id} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`} />
            <span className="text-xs text-ink-600">{item._id.replace('_', ' ')}</span>
            <span className="text-xs font-medium text-ink-900">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeatsChart({ data }: { data: { _id: string; totalSeats: number; filled: number; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-400">
        No seat data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((course, i) => {
        const fillRate = course.totalSeats > 0 ? (course.filled / course.totalSeats) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 truncate text-xs font-medium text-ink-700">{course._id}</span>
            <div className="min-w-0 flex-1">
              <div className="flex h-6 overflow-hidden rounded-lg bg-ink-100">
                <div
                  className="bg-teal-500"
                  style={{ width: `${fillRate}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-ink-600">
              {course.filled}/{course.totalSeats}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default NGOAnalyticsPage;
