  import { useEffect, useState, useCallback, type FormEvent } from 'react';
  import toast from 'react-hot-toast';
  import {
    Search, Users, CheckCircle2, XCircle,
    Eye, AlertCircle, Mail, Phone,
    MapPin, Video,  X, 
  } from 'lucide-react';
  import { NGOLayout } from '../../components/ngo/NGOLayout';
  import { ngoApi } from '../../services/ngoApi';
  import type { Application, ApplicationStatus, Pagination, InterviewMode } from '../../types/ngo';
  import { STATUS_LABELS } from '../../types/ngo';
  import { FullScreenLoader } from '../../components/ui/Loading';

  type PipelineTab = Exclude<ApplicationStatus, 'withdrawn'>;

  const STATUS_CONFIG: Record<PipelineTab, { label: string; color: string; bg: string }> = {
    pending: { label: 'New', color: 'text-amber-700', bg: 'bg-amber-50' },
    under_review: { label: 'Under Review', color: 'text-brand-700', bg: 'bg-brand-50' },
    shortlisted: { label: 'Shortlisted', color: 'text-teal-700', bg: 'bg-teal-50' },
    interview_scheduled: { label: 'Interview', color: 'text-purple-700', bg: 'bg-purple-50' },
    selected: { label: 'Selected', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    rejected: { label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-50' },
    waitlisted: { label: 'Waitlist', color: 'text-ink-700', bg: 'bg-ink-100' },
  };

  export function StudentApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [activeTab, setActiveTab] = useState<PipelineTab>('pending');
    const [search, setSearch] = useState('');
    const [courseId, _setCourseId] = useState<string>('');
    const [page, setPage] = useState(1);

    // Application detail modal
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    // Action modal
    const [actionApp, setActionApp] = useState<Application | null>(null);
    const [actionType, setActionType] = useState<string | null>(null);
    const [actionNote, setActionNote] = useState('');
    const [processing, setProcessing] = useState(false);

    // Interview scheduling modal
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [interviewApp, setInterviewApp] = useState<Application | null>(null);

    const fetchApplications = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ngoApi.listApplications({
          page,
          limit: 20,
          status: activeTab,
          search: search || undefined,
          courseId: courseId || undefined,
        });
        setApplications(data.applications);
        setPagination(data.pagination);
      } catch (err) {
        setError((err as Error)?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    }, [page, activeTab, search, courseId]);

    useEffect(() => {
      fetchApplications();
    }, [fetchApplications]);

    const handleAction = async () => {
      if (!actionApp || !actionType) return;
      setProcessing(true);
      try {
        switch (actionType) {
          case 'review':
            await ngoApi.startReviewApplication(actionApp._id, actionNote);
            toast.success('Application marked as under review');
            break;
          case 'shortlist':
            await ngoApi.shortlistApplication(actionApp._id, actionNote);
            toast.success('Application shortlisted');
            break;
          case 'reject':
            await ngoApi.rejectApplication(actionApp._id, actionNote);
            toast.success('Application rejected');
            break;
          case 'select':
            await ngoApi.selectApplication(actionApp._id, actionNote);
            toast.success('Student selected');
            break;
          case 'waitlist':
            await ngoApi.waitlistApplication(actionApp._id, actionNote);
            toast.success('Application waitlisted');
            break;
          case 'interview':
            setInterviewApp(actionApp);
            setShowInterviewModal(true);
            setActionApp(null);
            return;
        }
        fetchApplications();
      } catch (err) {
        toast.error((err as Error)?.message || 'Action failed');
      } finally {
        setProcessing(false);
        setActionApp(null);
        setActionType(null);
        setActionNote('');
      }
    };

    const openAction = (app: Application, action: string) => {
      setActionApp(app);
      setActionType(action);
      setActionNote('');
    };

    if (error) {
      return (
        <NGOLayout>
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <p className="mt-4 text-lg font-semibold text-ink-900">{error}</p>
            <button onClick={() => fetchApplications()} className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
              Retry
            </button>
          </div>
        </NGOLayout>
      );
    }

    const tabs: PipelineTab[] = ['pending', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'waitlisted'];

    return (
      <NGOLayout>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Student Applications</h1>
          <p className="mt-1 text-sm text-ink-500">Review and manage student applications for your courses</p>
        </div>

        {/* Pipeline Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {tabs.map(tab => {
              const config = STATUS_CONFIG[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? `${config.bg} ${config.color} ring-2 ring-offset-2 ring-inset`
                      : 'bg-white text-ink-500 hover:bg-ink-50'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student name or email..."
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* Applications Grid */}
        {loading ? (
          <FullScreenLoader label="Loading applications..." />
        ) : applications.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
            <Users className="mx-auto h-12 w-12 text-ink-300" />
            <h3 className="mt-4 text-lg font-bold text-ink-900">No applications</h3>
            <p className="mt-1 text-sm text-ink-500">No applications found in this category.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map(app => (
              <ApplicationCard
                key={app._id}
                application={app}
                onView={() => setSelectedApp(app)}
                onAction={openAction}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-ink-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={pagination.page === pagination.pages}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Application Detail Modal */}
        {selectedApp && (
          <ApplicationDetailModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
            onAction={(action) => {
              setSelectedApp(null);
              openAction(selectedApp, action);
            }}
          />
        )}

        {/* Action Confirmation Modal */}
        {actionApp && actionType && (
          <ActionModal
            application={actionApp}
            action={actionType}
            note={actionNote}
            setNote={setActionNote}
            processing={processing}
            onConfirm={handleAction}
            onClose={() => { setActionApp(null); setActionType(null); setActionNote(''); }}
          />
        )}

        {/* Interview Scheduling Modal */}
        {showInterviewModal && interviewApp && (
          <InterviewScheduleModal
            application={interviewApp}
            onClose={() => {
              setShowInterviewModal(false);
              setInterviewApp(null);
            }}
            onSuccess={() => {
              setShowInterviewModal(false);
              setInterviewApp(null);
              fetchApplications();
            }}
          />
        )}
      </NGOLayout>
    );
  }

  function ApplicationCard({
    application,
    onView,
    onAction,
  }: {
    application: Application;
    onView: () => void;
    onAction: (app: Application, action: string) => void;
  }) {
    const student = typeof application.studentId === 'object' ? application.studentId : null;
    const course = typeof application.courseId === 'object' ? application.courseId : null;

    return (
      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
              {student?.firstName?.[0] || '?'}{student?.lastName?.[0] || ''}
            </span>
            <div>
              <p className="font-semibold text-ink-900">{student?.firstName} {student?.lastName}</p>
              <p className="text-xs text-ink-500">{student?.email}</p>
            </div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CONFIG[application.status as PipelineTab]?.bg || 'bg-ink-100'} ${STATUS_CONFIG[application.status as PipelineTab]?.color || 'text-ink-600'}`}>
            {STATUS_LABELS[application.status]}
          </span>
        </div>

        <div className="mt-3 rounded-lg bg-ink-50 p-2.5">
          <p className="truncate text-xs font-medium text-ink-600">{course?.title || 'Course'}</p>
        </div>

        {application.studentProfile && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {application.studentProfile.education && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {application.studentProfile.education}
              </span>
            )}
            {application.studentProfile.city && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                <MapPin className="h-3 w-3" />
                {application.studentProfile.city}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
          <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
          <button onClick={onView} className="inline-flex items-center gap-1 font-medium text-teal-600 hover:text-teal-700">
            <Eye className="h-3.5 w-3.5" /> View
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex gap-2 border-t border-ink-100 pt-3">
          {application.status === 'pending' && (
            <>
              <button onClick={() => onAction(application, 'review')} className="flex-1 rounded-lg bg-brand-50 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                Review
              </button>
              <button onClick={() => onAction(application, 'reject')} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {application.status === 'under_review' && (
            <>
              <button onClick={() => onAction(application, 'shortlist')} className="flex-1 rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
                Shortlist
              </button>
              <button onClick={() => onAction(application, 'reject')} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          {application.status === 'shortlisted' && (
            <>
              <button onClick={() => onAction(application, 'interview')} className="flex-1 rounded-lg bg-purple-50 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100">
                Schedule Interview
              </button>
              <button onClick={() => onAction(application, 'reject')} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}

          {application.status === 'interview_scheduled' && (
            <>
              <button onClick={() => onAction(application, 'select')} className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" /> Select
              </button>
              <button onClick={() => onAction(application, 'reject')} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  function ApplicationDetailModal({
    application,
    onClose,
    onAction,
  }: {
    application: Application;
    onClose: () => void;
    onAction: (action: string) => void;
  }) {
    const student = typeof application.studentId === 'object' ? application.studentId : null;
    const course = typeof application.courseId === 'object' ? application.courseId : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-float">
          <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
            <h3 className="text-lg font-bold text-ink-900">Application Details</h3>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100">
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Student Info */}
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-xl font-bold text-white">
                {student?.firstName?.[0] || '?'}{student?.lastName?.[0] || ''}
              </span>
              <div>
                <p className="text-xl font-bold text-ink-900">{student?.firstName} {student?.lastName}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {student?.email}</span>
                  {student?.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {student.phone}</span>}
                </div>
                {application.studentProfile && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700">{application.studentProfile.education}</span>
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-600">{application.studentProfile.city}, {application.studentProfile.state}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Course */}
            <div className="mt-6 rounded-xl bg-ink-50 p-4">
              <p className="text-xs font-bold uppercase text-ink-400">Applied For</p>
              <p className="mt-1 font-semibold text-ink-900">{course?.title}</p>
            </div>

            {/* Message */}
            {application.message && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-ink-400">Message to NGO</p>
                <p className="mt-1 text-sm text-ink-700">{application.message}</p>
              </div>
            )}

            {/* Skills */}
            {application.studentProfile?.skills && application.studentProfile.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-ink-400">Skills</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {application.studentProfile.skills.map(skill => (
                    <span key={skill} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase text-ink-400">Status History</p>
              <div className="mt-3 space-y-2">
                {application.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${i === application.statusHistory.length - 1 ? 'bg-teal-500 text-white' : 'bg-ink-100 text-ink-500'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{STATUS_LABELS[h.status]}</p>
                      <p className="text-xs text-ink-400">{new Date(h.changedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-ink-100 px-6 py-4">
            <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100">
              Close
            </button>
            {application.status !== 'selected' && application.status !== 'rejected' && (
              <button
                onClick={() => onAction('shortlist')}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Move to Next Stage
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function ActionModal({
    application,
    action,
    note,
    setNote,
    processing,
    onConfirm,
    onClose,
  }: {
    application: Application;
    action: string;
    note: string;
    setNote: (n: string) => void;
    processing: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }) {
    const actionConfig: Record<string, { title: string; message: string; confirmLabel: string; danger: boolean; requireNote: boolean }> = {
      review: { title: 'Start Review', message: 'Mark this application as under review?', confirmLabel: 'Review', danger: false, requireNote: false },
      shortlist: { title: 'Shortlist', message: 'Add this applicant to the shortlist?', confirmLabel: 'Shortlist', danger: false, requireNote: false },
      reject: { title: 'Reject Application', message: 'Reject this application? The student will be notified.', confirmLabel: 'Reject', danger: true, requireNote: true },
      select: { title: 'Select Student', message: 'Select this student for the course? A seat will be reserved.', confirmLabel: 'Select', danger: false, requireNote: false },
      waitlist: { title: 'Add to Waitlist', message: 'Add this applicant to the waitlist?', confirmLabel: 'Waitlist', danger: false, requireNote: false },
      interview: { title: 'Schedule Interview', message: 'Schedule an interview with this applicant.', confirmLabel: 'Schedule', danger: false, requireNote: false },
    };

    const config = actionConfig[action];
    if (!config) return null;

    const student = typeof application.studentId === 'object' ? application.studentId : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-float">
          <h3 className="text-lg font-bold text-ink-900">{config.title}</h3>
          <p className="mt-2 text-sm text-ink-600">{config.message}</p>

          <div className="mt-4 rounded-xl bg-ink-50 p-3">
            <p className="text-sm font-semibold text-ink-900">{student?.firstName} {student?.lastName}</p>
            <p className="text-xs text-ink-500">{student?.email}</p>
          </div>

          {config.requireNote && (
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Reason (required)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Enter reason for rejection..."
                className="w-full rounded-xl border border-ink-200 bg-ink-50 p-3 text-sm text-ink-700 outline-none focus:border-teal-400"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={processing || (config.requireNote && !note.trim())}
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

  function InterviewScheduleModal({
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

    const [formData, setFormData] = useState({
      scheduledAt: '',
      mode: 'online' as InterviewMode,
      location: '',
      meetingLink: '',
      notes: '',
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
        toast.success('Interview scheduled successfully');
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
            <h2 className="text-lg font-bold text-ink-900">Schedule Interview</h2>
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
                rows={2}
                placeholder="Any specific instructions for the candidate..."
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
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

