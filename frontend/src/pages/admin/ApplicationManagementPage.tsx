import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { AdminButton } from '../../components/admin/AdminButton';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { ApplicationItem, Pagination } from '../../types/admin';

const STATUSES = ['', 'pending', 'accepted', 'rejected', 'shortlisted', 'waitlist'];
const STATUS_OPTIONS = ['pending', 'accepted', 'rejected', 'shortlisted', 'waitlist'];

export function ApplicationManagementPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editApp, setEditApp] = useState<ApplicationItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listApplications({ page, limit: 10, status });
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const openStatusModal = (app: ApplicationItem) => {
    setEditApp(app);
    setNewStatus(app.status);
    setNotes(app.notes || '');
  };

  const updateStatus = async () => {
    if (!editApp) return;
    setBusy(true);
    try {
      await adminApi.updateApplicationStatus(editApp._id, newStatus, notes);
      toast.success('Status updated');
      setEditApp(null);
      fetchApplications();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  const studentName = (app: ApplicationItem) => typeof app.studentId === 'string' ? app.studentId : `${app.studentId.firstName} ${app.studentId.lastName}`;
  const studentEmail = (app: ApplicationItem) => typeof app.studentId === 'string' ? '' : app.studentId.email;
  const courseTitle = (app: ApplicationItem) => typeof app.courseId === 'string' ? app.courseId : app.courseId.title;

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchApplications} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Application Management</h1>
        <p className="mt-1 text-sm text-ink-500">Review and update student applications</p>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400">
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
        </select>
      </div>

      <AdminTable
        loading={loading}
        data={applications as unknown as Record<string, unknown>[]}
        rowKey={(a) => (a as unknown as ApplicationItem)._id}
        emptyMessage="No applications found"
        columns={[
          { key: 'student', header: 'Student', render: (a) => { const x = a as unknown as ApplicationItem; return (
            <div>
              <p className="font-semibold text-ink-900">{studentName(x)}</p>
              <p className="text-xs text-ink-400">{studentEmail(x)}</p>
            </div>
          ); } },
          { key: 'course', header: 'Course', render: (a) => courseTitle(a as unknown as ApplicationItem) },
          { key: 'status', header: 'Status', render: (a) => { const x = a as unknown as ApplicationItem; return <AdminBadge tone={statusTone(x.status)}>{x.status}</AdminBadge>; } },
          { key: 'createdAt', header: 'Created', render: (a) => new Date((a as unknown as ApplicationItem).createdAt).toLocaleDateString() },
          {
            key: 'actions', header: 'Actions', className: 'text-right',
            render: (a) => (
              <button
                onClick={() => openStatusModal(a as unknown as ApplicationItem)}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                Update Status
                <ChevronDown className="h-3 w-3" />
              </button>
            ),
          },
        ]}
      />

      <div className="mt-4">
        <AdminPagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
      </div>

      {/* Status Update Modal */}
      <AdminModal
        open={!!editApp}
        onClose={() => setEditApp(null)}
        title="Update Application Status"
        footer={
          <>
            <button onClick={() => setEditApp(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <AdminButton onClick={updateStatus} disabled={busy}>{busy ? 'Updating...' : 'Update'}</AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-ink-500">Student: <span className="font-semibold text-ink-900">{editApp ? studentName(editApp) : ''}</span></p>
            <p className="text-sm text-ink-500">Course: <span className="font-semibold text-ink-900">{editApp ? courseTitle(editApp) : ''}</span></p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-400">Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="admin-input">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-400">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes..." className="admin-input" />
          </div>
        </div>
      </AdminModal>
    </AdminLayout>
  );
}
