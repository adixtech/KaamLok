import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search, Plus, Eye, Edit2, Copy, Pause, Play, 
  Archive, Trash2,  BookOpen, 
  Users, MapPin, AlertCircle, Download, 
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { ngoApi } from '../../services/ngoApi';
import type { Course, CourseStatus, Pagination } from '../../types/ngo';
import { DISPLAY_STATUS_LABELS } from '../../types/ngo';
import { FullScreenLoader } from '../../components/ui/Loading';

type SortField = 'createdAt' | 'title' | 'applicationsCount' | 'filledSeats';
type SortOrder = 'asc' | 'desc';

const STATUS_OPTIONS: { value: CourseStatus | ''; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

export function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | ''>('');
  const sortBy: SortField = 'createdAt';
  const sortOrder: SortOrder = 'desc';
  const [page, setPage] = useState(1);

  // Action states
  const [actionCourse, setActionCourse] = useState<Course | null>(null);
  const [actionType, setActionType] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ngoApi.listCourses({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleAction = async () => {
    if (!actionCourse || !actionType) return;
    setProcessing(true);
    try {
      switch (actionType) {
        case 'pause':
          await ngoApi.pauseCourse(actionCourse._id);
          toast.success('Course paused');
          break;
        case 'resume':
          await ngoApi.resumeCourse(actionCourse._id);
          toast.success('Course resumed');
          break;
        case 'close':
          await ngoApi.closeCourse(actionCourse._id);
          toast.success('Course closed');
          break;
        case 'archive':
          await ngoApi.archiveCourse(actionCourse._id);
          toast.success('Course archived');
          break;
        case 'duplicate':
          await ngoApi.duplicateCourse(actionCourse._id);
          toast.success('Course duplicated');
          break;
        case 'delete':
          await ngoApi.deleteCourse(actionCourse._id);
          toast.success('Course deleted');
          break;
      }
      fetchCourses();
    } catch (err) {
      toast.error((err as Error)?.message || 'Action failed');
    } finally {
      setProcessing(false);
      setActionCourse(null);
      setActionType(null);
    }
  };

  const openAction = (course: Course, action: string) => {
    setActionCourse(course);
    setActionType(action);
  };

  const closeAction = () => {
    setActionCourse(null);
    setActionType(null);
  };

  const exportApplicants = async (course: Course) => {
    setExporting(true);
    try {
      const res = await ngoApi.listApplications({ courseId: course._id, limit: 1000 });
      const applications = res.applications;

      if (applications.length === 0) {
        toast.error('No applicants to export');
        return;
      }

      const headers = ['Name', 'Email', 'Phone', 'Status', 'Applied Date', 'City', 'State', 'Education', 'Skills'];
      const rows = applications.map((app) => {
        const student = typeof app.studentId === 'object' ? app.studentId : null;
        return [
          `${student?.firstName || ''} ${student?.lastName || ''}`,
          student?.email || '',
          student?.phone || '',
          app.status,
          new Date(app.createdAt).toLocaleDateString(),
          app.studentProfile?.city || '',
          app.studentProfile?.state || '',
          app.studentProfile?.education || '',
          app.studentProfile?.skills?.join('; ') || '',
        ].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_applicants_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success(`Exported ${applications.length} applicants`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export applicants');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return (
      <NGOLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Retry
          </button>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">My Courses</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your training programs</p>
        </div>
        <Link
          to="/ngo/courses/create"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
            placeholder="Search courses..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as CourseStatus | ''); setPage(1); }}
          className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={fetchCourses}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Search
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <FullScreenLoader label="Loading courses..." />
      ) : courses.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <BookOpen className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-lg font-bold text-ink-900">No courses found</h3>
          <p className="mt-1 text-sm text-ink-500">Create your first course to get started.</p>
          <Link
            to="/ngo/courses/create"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Create Course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-ink-100 bg-ink-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Seats</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Applications</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-ink-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {courses.map(course => (
                  <CourseRow
                    key={course._id}
                    course={course}
                    onAction={openAction}
                      onView={() => navigate(`/courses/${course.slug}`)}
                    onEdit={() => navigate(`/ngo/courses/${course._id}/edit`)}
                    onExport={exportApplicants}
                    exporting={exporting}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3">
              <p className="text-sm text-ink-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        pagination.page === pageNum
                          ? 'bg-teal-600 text-white'
                          : 'text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page === pagination.pages}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Modal */}
      {actionCourse && actionType && (
        <ActionModal
          course={actionCourse}
          action={actionType}
          processing={processing}
          onConfirm={handleAction}
          onClose={closeAction}
        />
      )}
    </NGOLayout>
  );
}

function CourseRow({
  course,
  onAction,
  onView,
   onEdit,
  onExport,
  exporting,
}: {
  course: Course;
  onAction: (course: Course, action: string) => void;
  onView: () => void;
  onEdit: () => void;
  onExport: (course: Course) => void;
  exporting: boolean;
}) {
  const statusTone: Record<string, string> = {
    draft: 'bg-ink-100 text-ink-700',
    published: 'bg-emerald-50 text-emerald-700',
    paused: 'bg-amber-50 text-amber-700',
    closed: 'bg-rose-50 text-rose-700',
    archived: 'bg-ink-200 text-ink-600',
  };

  return (
    <tr className="hover:bg-ink-50/50">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt="" className="h-12 w-12 rounded-xl object-cover" />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-brand-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{course.title}</p>
            <p className="truncate text-xs text-ink-500">{course.category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-600">
          <MapPin className="h-4 w-4" />
          {course.mode}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm">
          <p className="font-semibold text-ink-900">{course.filledSeats}/{course.totalSeats}</p>
          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${(course.filledSeats / course.totalSeats) * 100}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Users className="h-4 w-4 text-ink-400" />
          {course.applicationsCount}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[course.status] || 'bg-ink-100 text-ink-700'}`}>
          {DISPLAY_STATUS_LABELS[course.displayStatus] || course.status}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-ink-500">
        {new Date(course.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onView} title="View" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={onEdit} title="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600">
            <Edit2 className="h-4 w-4" />
          </button>
          {course.applicationsCount > 0 && (
            <button
              onClick={() => onExport(course)}
              disabled={exporting}
              title="Export Applicants"
              className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-teal-50 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => onAction(course, 'duplicate')} title="Duplicate" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600">
            <Copy className="h-4 w-4" />
          </button>
          {course.status === 'published' && (
            <button onClick={() => onAction(course, 'pause')} title="Pause" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-amber-50 hover:text-amber-600">
              <Pause className="h-4 w-4" />
            </button>
          )}
          {course.status === 'paused' && (
            <button onClick={() => onAction(course, 'resume')} title="Resume" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-emerald-50 hover:text-emerald-600">
              <Play className="h-4 w-4" />
            </button>
          )}
          {course.status !== 'archived' && course.status !== 'draft' && (
            <button onClick={() => onAction(course, 'archive')} title="Archive" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600">
              <Archive className="h-4 w-4" />
            </button>
          )}
          {course.status === 'draft' && (
            <button onClick={() => onAction(course, 'delete')} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function ActionModal({
  course,
  action,
  processing,
  onConfirm,
  onClose,
}: {
  course: Course;
  action: string;
  processing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const actionConfig: Record<string, { title: string; message: string; confirmLabel: string; danger: boolean }> = {
    pause: { title: 'Pause Course', message: 'This will temporarily hide the course from public view. Students cannot apply while paused.', confirmLabel: 'Pause', danger: false },
    resume: { title: 'Resume Course', message: 'This will make the course visible publicly again.', confirmLabel: 'Resume', danger: false },
    close: { title: 'Close Course', message: 'This will permanently close the course. Applications will no longer be accepted.', confirmLabel: 'Close', danger: true },
    archive: { title: 'Archive Course', message: 'This will archive the course. It will no longer appear in search but data is preserved.', confirmLabel: 'Archive', danger: true },
    duplicate: { title: 'Duplicate Course', message: 'This will create a copy of this course as a draft.', confirmLabel: 'Duplicate', danger: false },
    delete: { title: 'Delete Course', message: 'This action cannot be undone. All course data will be permanently removed.', confirmLabel: 'Delete', danger: true },
  };

  const config = actionConfig[action];
  if (!config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-float">
        <h3 className="text-lg font-bold text-ink-900">{config.title}</h3>
        <p className="mt-2 text-sm text-ink-600">{config.message}</p>
        <div className="mt-4 rounded-xl bg-ink-50 p-3">
          <p className="text-sm font-semibold text-ink-900">{course.title}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={processing}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
              config.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
            } disabled:opacity-60`}
          >
            {processing ? 'Processing...' : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

