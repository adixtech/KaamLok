import { useEffect, useState, useCallback, type FormEvent, type ReactNode } from 'react';
import {
  Calendar, Video, MapPin, Phone, Clock, Users, CheckCircle2,
  XCircle, AlertCircle, ChevronDown, Search, Eye,
  X, Edit2,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { ngoApi } from '../../services/ngoApi';
import type { Application, InterviewMode } from '../../types/ngo';
import { FullScreenLoader } from '../../components/ui/Loading';
import toast from 'react-hot-toast';

type FilterStatus = 'upcoming' | 'completed' | 'all';

interface InterviewFilters {
  status: FilterStatus;
  courseId: string;
  search: string;
}

export function InterviewsPage() {
  const [interviews, setInterviews] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InterviewFilters>({
    status: 'upcoming',
    courseId: '',
    search: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.courseId) params.courseId = filters.courseId;

      const res = await ngoApi.getInterviews(params as Parameters<typeof ngoApi.getInterviews>[0]);
      let filtered = res.interviews;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter((app) => {
          const student = typeof app.studentId === 'object' ? app.studentId : null;
          const course = typeof app.courseId === 'object' ? app.courseId : null;
          return (
            student?.firstName?.toLowerCase().includes(q) ||
            student?.lastName?.toLowerCase().includes(q) ||
            student?.email?.toLowerCase().includes(q) ||
            course?.title?.toLowerCase().includes(q)
          );
        });
      }

      setInterviews(filtered);
      setPagination((p) => ({ ...p, total: res.pagination.total, pages: res.pagination.pages }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const openScheduleModal = (app: Application) => {
    setSelectedApp(app);
    setShowScheduleModal(true);
  };

  const openDetailModal = (app: Application) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowScheduleModal(false);
    setShowDetailModal(false);
    setSelectedApp(null);
  };

  const handleScheduleSuccess = () => {
    closeModal();
    fetchInterviews();
    toast.success('Interview scheduled successfully');
  };

  const handleCompleteSuccess = () => {
    closeModal();
    fetchInterviews();
    toast.success('Interview completed');
  };

  const stats = {
    upcoming: interviews.filter((a) => a.interview?.scheduledAt && !a.interview.completed).length,
    completed: interviews.filter((a) => a.interview?.completed).length,
    total: interviews.length,
  };

  return (
    <NGOLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Interviews</h1>
          <p className="mt-1 text-sm text-ink-500">Schedule and manage student interviews</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Calendar className="h-5 w-5" />} label="Upcoming" value={stats.upcoming} tone="bg-teal-50 text-teal-600" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={stats.completed} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total" value={stats.total} tone="bg-ink-100 text-ink-600" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or course..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="flex gap-2">
          <FilterDropdown
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v as FilterStatus }))}
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
              { value: 'all', label: 'All' },
            ]}
          />
        </div>
      </div>

      {/* Interviews List */}
      {loading ? (
        <FullScreenLoader label="Loading interviews..." />
      ) : error ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h3 className="mt-4 text-lg font-bold text-ink-900">{error}</h3>
          <button
            onClick={fetchInterviews}
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <Calendar className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-lg font-bold text-ink-900">No Interviews Found</h3>
          <p className="mt-1 text-sm text-ink-500">
            {filters.status === 'upcoming'
              ? 'No upcoming interviews scheduled.'
              : filters.status === 'completed'
                ? 'No completed interviews yet.'
                : 'Schedule interviews from the Applications page.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((app) => (
            <InterviewCard
              key={app._id}
              application={app}
              onView={() => openDetailModal(app)}
              onReschedule={() => openScheduleModal(app)}
              onComplete={() => openDetailModal(app)}
            />
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedApp && (
        <ScheduleInterviewModal
          application={selectedApp}
          onClose={closeModal}
          onSuccess={handleScheduleSuccess}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <InterviewDetailModal
          application={selectedApp}
          onClose={closeModal}
          onComplete={handleCompleteSuccess}
        />
      )}
    </NGOLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="text-xl font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-ink-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-ink-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

function InterviewCard({
  application,
  onView,
  onReschedule,
  onComplete,
}: {
  application: Application;
  onView: () => void;
  onReschedule: () => void;
  onComplete: () => void;
}) {
  const student = typeof application.studentId === 'object' ? application.studentId : null;
  const course = typeof application.courseId === 'object' ? application.courseId : null;
  const interview = application.interview;

  const isUpcoming = interview?.scheduledAt && !interview.completed;
  const isCompleted = interview?.completed;

  const scheduledDate = interview?.scheduledAt ? new Date(interview.scheduledAt) : null;
  const isToday = scheduledDate?.toDateString() === new Date().toDateString();
  const isPast = scheduledDate && scheduledDate < new Date() && !interview?.completed;

  const modeIcon = {
    online: <Video className="h-4 w-4" />,
    offline: <MapPin className="h-4 w-4" />,
    phone: <Phone className="h-4 w-4" />,
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-brand-500 text-lg font-bold text-white">
            {student?.firstName?.[0] || '?'}{student?.lastName?.[0] || ''}
          </span>
          <div>
            <p className="font-semibold text-ink-900">
              {student?.firstName} {student?.lastName}
            </p>
            <p className="text-sm text-ink-500">{course?.title || 'Unknown Course'}</p>
            <p className="text-xs text-ink-400">{student?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isUpcoming && (
            <>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isToday ? 'bg-amber-50 text-amber-700' :
                isPast ? 'bg-rose-50 text-rose-700' :
                'bg-teal-50 text-teal-700'
              }`}>
                <Clock className="h-3.5 w-3.5" />
                {isToday ? 'Today' : isPast ? 'Overdue' : 'Scheduled'}
              </span>
              {interview?.mode && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {modeIcon[interview.mode]}
                  {interview.mode.charAt(0).toUpperCase() + interview.mode.slice(1)}
                </span>
              )}
            </>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
      </div>

      {interview?.scheduledAt && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-ink-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ink-400" />
            <span className="text-sm font-medium text-ink-700">
              {new Date(interview.scheduledAt).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ink-400" />
            <span className="text-sm font-medium text-ink-700">
              {new Date(interview.scheduledAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {interview.meetingLink && (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              <Video className="h-4 w-4" />
              Join Meeting
            </a>
          )}
          {interview.location && (
            <span className="flex items-center gap-1.5 text-sm text-ink-600">
              <MapPin className="h-4 w-4" />
              {interview.location}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </button>
        {isUpcoming && (
          <button
            onClick={onReschedule}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Reschedule
          </button>
        )}
        {isUpcoming && !interview?.completed && (
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete
          </button>
        )}
      </div>
    </div>
  );
}

function ScheduleInterviewModal({
  application,
  onClose,
  onSuccess,
}: {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const student = typeof application.studentId === 'object' ? application.studentId : null;
  const course = typeof application.courseId === 'object' ? application.courseId : null;
  const existingInterview = application.interview;

  const [formData, setFormData] = useState({
    scheduledAt: existingInterview?.scheduledAt
      ? new Date(existingInterview.scheduledAt).toISOString().slice(0, 16)
      : '',
    mode: (existingInterview?.mode || 'online') as InterviewMode,
    location: existingInterview?.location || '',
    meetingLink: existingInterview?.meetingLink || '',
    notes: existingInterview?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.scheduledAt) errs.scheduledAt = 'Date and time required';
    if (formData.mode === 'online' && !formData.meetingLink) {
      errs.meetingLink = 'Meeting link required for online interviews';
    }
    if (formData.mode === 'offline' && !formData.location) {
      errs.location = 'Venue required for offline interviews';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await ngoApi.scheduleInterview(application._id, {
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        mode: formData.mode,
        location: formData.location || undefined,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
      });
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">
            {existingInterview?.scheduledAt ? 'Reschedule Interview' : 'Schedule Interview'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink-50 p-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-brand-500 text-sm font-bold text-white">
            {student?.firstName?.[0] || '?'}{student?.lastName?.[0] || ''}
          </span>
          <div>
            <p className="font-medium text-ink-900">{student?.firstName} {student?.lastName}</p>
            <p className="text-xs text-ink-500">{course?.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData((f) => ({ ...f, scheduledAt: e.target.value }))}
              className={`mt-1 w-full rounded-xl border ${errors.scheduledAt ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.scheduledAt && <p className="mt-1 text-xs text-rose-600">{errors.scheduledAt}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700">Interview Mode *</label>
            <div className="mt-2 flex gap-3">
              {(['online', 'offline', 'phone'] as InterviewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData((f) => ({ ...f, mode }))}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    formData.mode === mode
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {mode === 'online' && <Video className="h-4 w-4" />}
                  {mode === 'offline' && <MapPin className="h-4 w-4" />}
                  {mode === 'phone' && <Phone className="h-4 w-4" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {formData.mode === 'online' && (
            <div>
              <label className="block text-sm font-medium text-ink-700">Meeting Link *</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => setFormData((f) => ({ ...f, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className={`mt-1 w-full rounded-xl border ${errors.meetingLink ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
              />
              {errors.meetingLink && <p className="mt-1 text-xs text-rose-600">{errors.meetingLink}</p>}
            </div>
          )}

          {formData.mode === 'offline' && (
            <div>
              <label className="block text-sm font-medium text-ink-700">Venue *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
                placeholder="Training Center, 123 Main St..."
                className={`mt-1 w-full rounded-xl border ${errors.location ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
              />
              {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Any specific instructions or notes..."
              className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : existingInterview?.scheduledAt ? 'Reschedule' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InterviewDetailModal({
  application,
  onClose,
  onComplete,
}: {
  application: Application;
  onClose: () => void;
  onComplete: () => void;
}) {
  const student = typeof application.studentId === 'object' ? application.studentId : null;
  const course = typeof application.courseId === 'object' ? application.courseId : null;
  const interview = application.interview;

  const [outcome, setOutcome] = useState<'selected' | 'rejected'>('selected');
  const [feedback, setFeedback] = useState(interview?.feedback || '');
  const [loading, setLoading] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await ngoApi.completeInterview(application._id, {
        outcome,
        feedback: feedback || undefined,
      });
      onComplete();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Interview Details</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Candidate Info */}
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-ink-50 p-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-brand-500 text-lg font-bold text-white">
            {student?.firstName?.[0] || '?'}{student?.lastName?.[0] || ''}
          </span>
          <div>
            <p className="text-lg font-semibold text-ink-900">{student?.firstName} {student?.lastName}</p>
            <p className="text-sm text-ink-500">{student?.email}</p>
            {student?.phone && <p className="text-sm text-ink-500">{student.phone}</p>}
          </div>
        </div>

        {/* Course Info */}
        <div className="mt-4 rounded-xl border border-ink-200 p-4">
          <p className="text-xs font-medium uppercase text-ink-400">Applied for</p>
          <p className="mt-1 font-semibold text-ink-900">{course?.title}</p>
        </div>

        {/* Interview Details */}
        {interview && (
          <div className="mt-4 space-y-3">
            <h3 className="font-semibold text-ink-900">Interview Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-ink-400" />
                <span className="text-ink-700">
                  {interview.scheduledAt
                    ? new Date(interview.scheduledAt).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Not scheduled'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-ink-400" />
                <span className="text-ink-700">
                  {interview.scheduledAt
                    ? new Date(interview.scheduledAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {interview.mode === 'online' && <Video className="h-4 w-4 text-ink-400" />}
                {interview.mode === 'offline' && <MapPin className="h-4 w-4 text-ink-400" />}
                {interview.mode === 'phone' && <Phone className="h-4 w-4 text-ink-400" />}
                <span className="text-ink-700">
                  {interview.mode ? interview.mode.charAt(0).toUpperCase() + interview.mode.slice(1) : '-'}
                </span>
              </div>
            </div>
            {interview.meetingLink && (
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Video className="h-4 w-4" />
                {interview.meetingLink}
              </a>
            )}
            {interview.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-ink-400" />
                <span className="text-ink-700">{interview.location}</span>
              </div>
            )}
            {interview.notes && (
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs font-medium uppercase text-ink-400">Notes</p>
                <p className="mt-1 text-sm text-ink-700">{interview.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Status Timeline */}
        <div className="mt-6">
          <h3 className="font-semibold text-ink-900">Application Timeline</h3>
          <div className="mt-3 space-y-2">
            {application.statusHistory.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  idx === application.statusHistory.length - 1
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-ink-100 text-ink-500'
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-900">{entry.status.replace('_', ' ')}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(entry.changedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Interview Form */}
        {!interview?.completed && (
          <div className="mt-6 border-t border-ink-100 pt-4">
            <button
              onClick={() => setShowCompleteForm(!showCompleteForm)}
              className="flex w-full items-center justify-between rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark Interview Complete
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showCompleteForm ? 'rotate-180' : ''}`} />
            </button>

            {showCompleteForm && (
              <div className="mt-4 space-y-4 rounded-xl border border-ink-200 p-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700">Interview Outcome *</label>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOutcome('selected')}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                        outcome === 'selected'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => setOutcome('rejected')}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                        outcome === 'rejected'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Add interview feedback..."
                    className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Interview'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback from completed interview */}
        {interview?.completed && interview.feedback && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase text-emerald-600">Interview Feedback</p>
            <p className="mt-1 text-sm text-emerald-900">{interview.feedback}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewsPage;
