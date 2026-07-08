import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FileText, GraduationCap, Building2, Briefcase, BookOpen,
  TrendingUp, ShieldCheck, Download, FileSpreadsheet, FileType,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminButton } from '../../components/admin/AdminButton';
import { adminApi } from '../../services/adminApi';

type ReportType = 'students' | 'ngos' | 'applications' | 'courses' | 'growth' | 'verification';

const REPORTS: { type: ReportType; title: string; desc: string; icon: typeof GraduationCap; tone: string }[] = [
  { type: 'students', title: 'Students Report', desc: 'All registered students with profile details', icon: GraduationCap, tone: 'bg-brand-50 text-brand-600' },
  { type: 'ngos', title: 'NGOs Report', desc: 'All NGO partners with verification status', icon: Building2, tone: 'bg-teal-50 text-teal-600' },
  { type: 'applications', title: 'Applications Report', desc: 'Course applications and their statuses', icon: Briefcase, tone: 'bg-amber-50 text-amber-600' },
  { type: 'courses', title: 'Courses Report', desc: 'All courses with enrollment data', icon: BookOpen, tone: 'bg-brand-50 text-brand-600' },
  { type: 'growth', title: 'Growth Report', desc: 'User and platform growth analytics', icon: TrendingUp, tone: 'bg-emerald-50 text-emerald-600' },
  { type: 'verification', title: 'Verification Report', desc: 'NGO verification status summary', icon: ShieldCheck, tone: 'bg-rose-50 text-rose-600' },
];

export function ReportsPage() {
  const [exporting, setExporting] = useState<ReportType | null>(null);

  const fetchReportData = async (type: ReportType): Promise<Record<string, unknown>[]> => {
    switch (type) {
      case 'students': {
        const data = await adminApi.listStudents({ page: 1, limit: 1000 });
        return data.students as unknown as Record<string, unknown>[];
      }
      case 'ngos': {
        const data = await adminApi.listNGOs({ page: 1, limit: 1000 });
        return data.ngos as unknown as Record<string, unknown>[];
      }
      case 'applications': {
        const data = await adminApi.listApplications({ page: 1, limit: 1000 });
        return data.applications as unknown as Record<string, unknown>[];
      }
      case 'courses': {
        const data = await adminApi.listCourses({ page: 1, limit: 1000 });
        return data.courses as unknown as Record<string, unknown>[];
      }
      case 'growth': {
        const data = await adminApi.getAnalytics('monthly');
        return [
          ...data.userGrowth.map((d) => ({ category: 'User Growth', period: JSON.stringify(d._id), count: d.count })),
          ...data.ngoGrowth.map((d) => ({ category: 'NGO Growth', period: JSON.stringify(d._id), count: d.count })),
          ...data.applicationGrowth.map((d) => ({ category: 'Application Growth', period: JSON.stringify(d._id), count: d.count })),
        ];
      }
      case 'verification': {
        const data = await adminApi.listNGOs({ page: 1, limit: 1000 });
        return data.ngos.map((n) => ({ ngoName: n.ngoName, email: n.email, status: n.status, verificationStatus: n.verificationStatus })) as unknown as Record<string, unknown>[];
      }
    }
  };

  const exportCSV = async (type: ReportType) => {
    setExporting(type);
    try {
      const rows = await fetchReportData(type);
      if (rows.length === 0) {
        toast.error('No data to export');
        return;
      }
      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(','),
        ...rows.map((row) =>
          headers.map((h) => {
            const val = row[h];
            const str = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          }).join(',')
        ),
      ];
      const csv = csvLines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error((err as Error)?.message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  const placeholderExport = (format: string) => {
    toast.success(`${format} export coming soon`);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">Export platform data in various formats</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.type} className="flex flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:shadow-float">
              <div className="mb-4 flex items-start justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${report.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <FileText className="h-5 w-5 text-ink-300" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">{report.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-500">{report.desc}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <AdminButton size="sm" variant="secondary" onClick={() => exportCSV(report.type)} disabled={exporting === report.type}>
                  <Download className="h-3.5 w-3.5" /> CSV
                </AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => placeholderExport('Excel')}>
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
                </AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => placeholderExport('PDF')}>
                  <FileType className="h-3.5 w-3.5" /> PDF
                </AdminButton>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
