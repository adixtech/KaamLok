import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Eye, Ban, RotateCcw, Trash2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { StudentListItem, Pagination } from '../../types/admin';

type Action =
  | { type: 'block'; student: StudentListItem }
  | { type: 'reactivate'; student: StudentListItem }
  | { type: 'delete'; student: StudentListItem }
  | null;

const STATUSES = ['', 'active', 'pending', 'blocked'];

export function StudentManagementPage() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewStudent, setViewStudent] = useState<StudentListItem | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listStudents({ page, limit: 10, search, status, state: stateFilter, city: cityFilter });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, stateFilter, cityFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const applySearch = () => { setPage(1); fetchStudents(); };
  const closeAction = () => { setAction(null); setReason(''); };

  const runAction = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const { id } = action.student;
      switch (action.type) {
        case 'block': await adminApi.blockStudent(id, reason); break;
        case 'reactivate': await adminApi.reactivateStudent(id); break;
        case 'delete': await adminApi.deleteStudent(id, reason); break;
      }
      toast.success(`${action.type} succeeded`);
      closeAction();
      fetchStudents();
    } catch (err) {
      toast.error((err as Error)?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const actionConfig: Record<string, { title: string; message: string; label: string; danger: boolean; needReason: boolean }> = {
    block: { title: 'Block Student', message: 'Block this student? They will lose access to the platform.', label: 'Block', danger: true, needReason: true },
    reactivate: { title: 'Reactivate Student', message: 'Reactivate this student? Access will be restored.', label: 'Reactivate', danger: false, needReason: false },
    delete: { title: 'Delete Student', message: 'Permanently delete this student? This cannot be undone.', label: 'Delete', danger: true, needReason: true },
  };

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchStudents} /></AdminLayout>;
  }

  const cfg = action ? actionConfig[action.type] : null;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Student Management</h1>
        <p className="mt-1 text-sm text-ink-500">Manage student accounts and profiles</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400">
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
        </select>
        <input value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setPage(1); }} placeholder="State" className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400" />
        <input value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(1); }} placeholder="City" className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400" />
        <AdminButton size="md" onClick={applySearch}>Search</AdminButton>
      </div>

      {/* Table */}
      <AdminTable
        loading={loading}
        data={students as unknown as Record<string, unknown>[]}
        rowKey={(s) => (s as unknown as StudentListItem).id}
        emptyMessage="No students found"
        columns={[
          { key: 'name', header: 'Name', render: (s) => { const x = s as unknown as StudentListItem; return <span className="font-semibold text-ink-900">{x.firstName} {x.lastName}</span>; } },
          { key: 'email', header: 'Email', render: (s) => (s as unknown as StudentListItem).email },
          { key: 'phone', header: 'Phone', render: (s) => (s as unknown as StudentListItem).phone },
          { key: 'education', header: 'Education', render: (s) => (s as unknown as StudentListItem).education },
          { key: 'city', header: 'City', render: (s) => (s as unknown as StudentListItem).city },
          { key: 'state', header: 'State', render: (s) => (s as unknown as StudentListItem).state },
          { key: 'status', header: 'Status', render: (s) => { const x = s as unknown as StudentListItem; return <AdminBadge tone={statusTone(x.status)}>{x.status}</AdminBadge>; } },
          { key: 'createdAt', header: 'Created', render: (s) => new Date((s as unknown as StudentListItem).createdAt).toLocaleDateString() },
          {
            key: 'actions', header: 'Actions', className: 'text-right',
            render: (s) => { const x = s as unknown as StudentListItem; return (
              <div className="flex items-center justify-end gap-1">
                <IconBtn title="View" onClick={() => setViewStudent(x)}><Eye className="h-4 w-4" /></IconBtn>
                <IconBtn title="Block" onClick={() => setAction({ type: 'block', student: x })}><Ban className="h-4 w-4 text-amber-600" /></IconBtn>
                <IconBtn title="Reactivate" onClick={() => setAction({ type: 'reactivate', student: x })}><RotateCcw className="h-4 w-4 text-teal-600" /></IconBtn>
                <IconBtn title="Delete" onClick={() => setAction({ type: 'delete', student: x })}><Trash2 className="h-4 w-4 text-rose-500" /></IconBtn>
              </div>
            ); },
          },
        ]}
      />

      <div className="mt-4">
        <AdminPagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
      </div>

      {/* View Modal */}
      <AdminModal open={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Details" size="lg">
        {viewStudent && (
          <div className="space-y-3">
            <DetailRow label="Name" value={`${viewStudent.firstName} ${viewStudent.lastName}`} />
            <DetailRow label="Email" value={viewStudent.email} />
            <DetailRow label="Phone" value={viewStudent.phone} />
            <DetailRow label="Education" value={viewStudent.education} />
            <DetailRow label="City" value={viewStudent.city} />
            <DetailRow label="State" value={viewStudent.state} />
            <DetailRow label="Skills" value={viewStudent.skills.join(', ') || '—'} />
            <DetailRow label="Status" value={<AdminBadge tone={statusTone(viewStudent.status)}>{viewStudent.status}</AdminBadge>} />
            <DetailRow label="Email Verified" value={viewStudent.emailVerified ? 'Yes' : 'No'} />
            <DetailRow label="Created" value={new Date(viewStudent.createdAt).toLocaleString()} />
            <DetailRow label="Last Login" value={viewStudent.lastLogin ? new Date(viewStudent.lastLogin).toLocaleString() : 'Never'} />
          </div>
        )}
      </AdminModal>

      {/* Action Modal */}
      <AdminModal
        open={!!action}
        onClose={closeAction}
        title={cfg?.title || ''}
        size="sm"
        footer={
          <>
            <button onClick={closeAction} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <button
              onClick={runAction}
              disabled={busy}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors disabled:opacity-60 ${cfg?.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'}`}
            >
              {busy ? 'Processing...' : cfg?.label}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-ink-600">{cfg?.message}</p>
          {cfg?.needReason && (
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason (required)..." className="w-full rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-brand-400" rows={3} />
          )}
        </div>
      </AdminModal>
    </AdminLayout>
  );
}

function IconBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100">
      {children}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink-50 pb-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</span>
      <span className="text-right text-sm text-ink-700">{value}</span>
    </div>
  );
}
