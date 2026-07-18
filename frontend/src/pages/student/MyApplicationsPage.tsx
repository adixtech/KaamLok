import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, AlertCircle, ChevronLeft, ChevronRight, BookOpen,
  Calendar, MessageSquare, CheckCircle2, Clock, Mail, Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import type { ApplicationWithCourse } from '../../types/student';

const STATUS_CONFIG: Record<string, { bg: string; text: string; ring: string; label: string; icon: typeof CheckCircle2 }> = {
  pending:             { bg: 'bg-amber-50',  text: 'text-amber-700',  ring: 'ring-amber-200', label: 'Applied', icon: Clock },
  under_review:        { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-200',  label: 'Under Review', icon: FileText },
  shortlisted:         { bg: 'bg-teal-50',   text: 'text-teal-700',   ring: 'ring-teal-200',  label: 'Shortlisted', icon: CheckCircle2 },
  interview_scheduled: { bg: 'bg-brand-50',  text: 'text-brand-700',  ring: 'ring-brand-200', label: 'Interview Scheduled', icon: Calendar },
  selected:            { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Selected', icon: CheckCircle2 },
  rejected:            { bg: 'bg-rose-50',   text: 'text-rose-700',   ring: 'ring-rose-200',  label: 'Not Selected', icon: AlertCircle },
  waitlisted:          { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200', label: 'Waitlisted', icon: Clock },
  withdrawn:           { bg: 'bg-ink-100',   text: 'text-ink-500',   ring: 'ring-ink-200',   label: 'Withdrawn', icon: AlertCircle },
};

const STATUS_TIMELINE = ['pending', 'under_review', 'shortlisted', 'interview_scheduled', 'selected'];

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { applications: data, pagination } = await studentApi.getMyApplications({
        page, limit: 10, status: statusFilter || undefined,
      });
      setApplications(data);
      setTotalPages(pagination.pages);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawingId(appId);
    try {
      await studentApi.withdrawApplication(appId);
      toast.success('Application withdrawn');
      fetchApplications();
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message || 'Failed to withdraw');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">My Applications</h1>
        <p className="mt-1 text-sm text-ink-500">Track all your course applications and their current status.</p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[{ label: 'All', value: '' }, ...ALL_STATUSES.map((s) => ({ label: STATUS_CONFIG[s].label, value: s }))].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === tab.value ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <p className="font-semibold text-rose-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchApplications}>Try Again</Button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <FileText className="h-12 w-12 text-ink-300" />
          <p className="text-lg font-semibold text-ink-600">No applications {statusFilter ? `with "${STATUS_CONFIG[statusFilter]?.label}" status` : 'yet'}</p>
          <Link to="/student/discover">
            <Button variant="primary" size="sm">Browse Programs</Button>
          </Link>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="space-y-4">
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === app._id;
            const canWithdraw = ['pending', 'under_review'].includes(app.status);

            return (
              <div key={app._id} className="rounded-2xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50">
                {/* Card header */}
                <div className="flex items-start gap-4 p-5">
                  {app.course?.thumbnail ? (
                    <img src={app.course.thumbnail} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-50">
                      <BookOpen className="h-7 w-7 text-brand-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          to={app.course?.slug ? `/courses/${app.course.slug}` : '#'}
                          className="text-base font-bold text-ink-900 hover:text-brand-700 transition-colors"
                        >
                          {app.course?.title || 'Unknown Course'}
                        </Link>
                        <p className="mt-0.5 text-sm text-ink-500">{app.course?.ngoName || app.ngo?.ngoName}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
                        <config.icon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                      {app.course?.mode && (
                        <span className="rounded-lg bg-ink-100 px-2 py-0.5 font-medium text-ink-600 capitalize">
                          {app.course.mode}
                        </span>
                      )}
                      {app.course?.category && (
                        <span className="rounded-lg bg-brand-50 px-2 py-0.5 font-medium text-brand-600">
                          {app.course.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline progress (non-terminal statuses) */}
                {!['rejected', 'withdrawn'].includes(app.status) && (
                  <div className="mx-5 mb-4">
                    <div className="flex items-center justify-between">
                      {STATUS_TIMELINE.map((s, i) => {
                        const sIdx = STATUS_TIMELINE.indexOf(app.status);
                        const isActive = s === app.status;
                        const isDone = STATUS_TIMELINE.indexOf(s) < sIdx || (app.status === 'selected' && s === 'selected');
                        const isReached = isDone || isActive;
                        return (
                          <div key={s} className="flex flex-1 items-center">
                            <div className={`flex flex-col items-center gap-1 ${isReached ? 'opacity-100' : 'opacity-30'}`}>
                              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${isActive ? 'bg-brand-600 text-white ring-2 ring-brand-200' : isDone ? 'bg-emerald-500 text-white' : 'bg-ink-100 text-ink-400'}`}>
                                {isDone ? '✓' : i + 1}
                              </span>
                              <span className="hidden text-[9px] font-medium text-ink-400 text-center sm:block max-w-[48px]">
                                {STATUS_CONFIG[s]?.label}
                              </span>
                            </div>
                            {i < STATUS_TIMELINE.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 ${isDone ? 'bg-emerald-400' : 'bg-ink-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : app._id)}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                    {app.course?.slug && (
                      <Link to={`/courses/${app.course.slug}`} className="text-sm font-semibold text-ink-500 hover:text-ink-700">
                        View Course
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/student/messages" className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message NGO
                    </Link>
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawingId === app._id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-ink-100 px-5 py-5 space-y-4 bg-ink-50/50">
                    {/* Interview info */}
                    {app.status === 'interview_scheduled' && app.interview && (
                      <div className="rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
                        <p className="text-sm font-bold text-brand-800 mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Interview Details
                        </p>
                        <div className="grid gap-2 text-sm text-brand-700">
                          {app.interview.scheduledAt && (
                            <p>Date: {new Date(app.interview.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
                          )}
                          <p>Mode: <span className="capitalize font-semibold">{app.interview.mode}</span></p>
                          {app.interview.location && <p>Location: {app.interview.location}</p>}
                          {app.interview.meetingLink && (
                            <a href={app.interview.meetingLink} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                              Join Meeting Link
                            </a>
                          )}
                          {app.interview.notes && <p className="text-xs text-brand-600">Note: {app.interview.notes}</p>}
                        </div>
                      </div>
                    )}

                    {/* Coordinator contact */}
                    {app.course?.contact && (
                      <div>
                        <p className="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2">Coordinator Contact</p>
                        <div className="flex flex-wrap gap-4 text-sm text-ink-600">
                          <span className="font-semibold">{app.course.contact.coordinatorName}</span>
                          {app.course.contact.coordinatorEmail && (
                            <a href={`mailto:${app.course.contact.coordinatorEmail}`} className="flex items-center gap-1.5 hover:text-brand-600">
                              <Mail className="h-3.5 w-3.5" /> {app.course.contact.coordinatorEmail}
                            </a>
                          )}
                          {app.course.contact.coordinatorPhone && (
                            <a href={`tel:${app.course.contact.coordinatorPhone}`} className="flex items-center gap-1.5 hover:text-brand-600">
                              <Phone className="h-3.5 w-3.5" /> {app.course.contact.coordinatorPhone}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NGO notes */}
                    {app.ngoNotes && (
                      <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Note from NGO</p>
                        <p className="text-sm text-amber-700">{app.ngoNotes}</p>
                      </div>
                    )}

                    {/* Status history */}
                    {app.statusHistory && app.statusHistory.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-ink-700 uppercase tracking-wide mb-2">Status History</p>
                        <div className="space-y-2">
                          {app.statusHistory.map((h, i) => {
                            const hConfig = STATUS_CONFIG[h.status];
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${hConfig?.bg} ${hConfig?.text}`}>
                                  {i + 1}
                                </span>
                                <div>
                                  <span className="text-xs font-semibold text-ink-800">{hConfig?.label || h.status}</span>
                                  <span className="ml-2 text-xs text-ink-400">
                                    {new Date(h.changedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                  </span>
                                  {h.note && <span className="ml-2 text-xs text-ink-500">— {h.note}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="px-4 text-sm font-semibold text-ink-700">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </StudentLayout>
  );
}
