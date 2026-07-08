import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Eye, CheckCircle2, XCircle, Ban, RotateCcw, Trash2, FileText,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { NGOListItem, Pagination } from '../../types/admin';

type Action =
  | { type: 'approve'; ngo: NGOListItem }
  | { type: 'reject'; ngo: NGOListItem }
  | { type: 'suspend'; ngo: NGOListItem }
  | { type: 'reactivate'; ngo: NGOListItem }
  | { type: 'delete'; ngo: NGOListItem }
  | { type: 'requestDocs'; ngo: NGOListItem }
  | null;

const STATUSES = ['', 'pending', 'approved', 'rejected', 'suspended'];

export function NGOManagementPage() {
  const [ngos, setNgos] = useState<NGOListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [viewNgo, setViewNgo] = useState<NGOListItem | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState('');
  const [docMessage, setDocMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listNGOs({ page, limit: 10, search, status });
      setNgos(data.ngos);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchNgos(); }, [fetchNgos]);

  const applySearch = () => { setPage(1); fetchNgos(); };
  const closeAction = () => { setAction(null); setReason(''); setDocMessage(''); };

  const runAction = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const { id } = action.ngo;
      switch (action.type) {
        case 'approve': await adminApi.approveNGO(id); break;
        case 'reject': await adminApi.rejectNGO(id, reason); break;
        case 'suspend': await adminApi.suspendNGO(id, reason); break;
        case 'reactivate': await adminApi.reactivateNGO(id); break;
        case 'delete': await adminApi.deleteNGO(id, reason); break;
        case 'requestDocs': await adminApi.requestNGODocs(id, docMessage); break;
      }
      toast.success(`${action.type} succeeded`);
      closeAction();
      fetchNgos();
    } catch (err) {
      toast.error((err as Error)?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const actionConfig: Record<string, { title: string; message: string; label: string; danger: boolean; needReason: boolean; isDocs: boolean }> = {
    approve: { title: 'Approve NGO', message: 'Approve this NGO? They will be able to post courses.', label: 'Approve', danger: false, needReason: false, isDocs: false },
    reject: { title: 'Reject NGO', message: 'Reject this NGO? They will need to re-register.', label: 'Reject', danger: true, needReason: true, isDocs: false },
    suspend: { title: 'Suspend NGO', message: 'Suspend this NGO? They will lose access temporarily.', label: 'Suspend', danger: true, needReason: true, isDocs: false },
    reactivate: { title: 'Reactivate NGO', message: 'Reactivate this NGO? Access will be restored.', label: 'Reactivate', danger: false, needReason: false, isDocs: false },
    delete: { title: 'Delete NGO', message: 'Permanently delete this NGO? This cannot be undone.', label: 'Delete', danger: true, needReason: true, isDocs: false },
    requestDocs: { title: 'Request Documents', message: 'Request additional documents from this NGO.', label: 'Send Request', danger: false, needReason: false, isDocs: true },
  };

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchNgos} /></AdminLayout>;
  }

  const cfg = action ? actionConfig[action.type] : null;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">NGO Management</h1>
        <p className="mt-1 text-sm text-ink-500">Review, approve, and manage NGO partners</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder="Search by name, email, or registration number..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-brand-400"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
        </select>
        <AdminButton size="md" onClick={applySearch}>Search</AdminButton>
      </div>

      {/* Table */}
      <AdminTable
        loading={loading}
        data={ngos as unknown as Record<string, unknown>[]}
        rowKey={(n) => (n as unknown as NGOListItem).id}
        emptyMessage="No NGOs found"
        columns={[
          { key: 'ngoName', header: 'NGO Name', render: (n) => <span className="font-semibold text-ink-900">{(n as unknown as NGOListItem).ngoName}</span> },
          { key: 'email', header: 'Email', render: (n) => (n as unknown as NGOListItem).email },
          { key: 'registrationNumber', header: 'Reg. Number', render: (n) => (n as unknown as NGOListItem).registrationNumber },
          { key: 'verificationStatus', header: 'Verification', render: (n) => { const x = n as unknown as NGOListItem; return <AdminBadge tone={statusTone(x.verificationStatus)}>{x.verificationStatus}</AdminBadge>; } },
          { key: 'status', header: 'Status', render: (n) => { const x = n as unknown as NGOListItem; return <AdminBadge tone={statusTone(x.status)}>{x.status}</AdminBadge>; } },
          { key: 'createdAt', header: 'Created', render: (n) => new Date((n as unknown as NGOListItem).createdAt).toLocaleDateString() },
          {
            key: 'actions', header: 'Actions', className: 'text-right',
            render: (n) => { const x = n as unknown as NGOListItem; return (
              <div className="flex items-center justify-end gap-1">
                <IconBtn title="View" onClick={() => setViewNgo(x)}><Eye className="h-4 w-4" /></IconBtn>
                <IconBtn title="Approve" onClick={() => setAction({ type: 'approve', ngo: x })}><CheckCircle2 className="h-4 w-4 text-emerald-600" /></IconBtn>
                <IconBtn title="Reject" onClick={() => setAction({ type: 'reject', ngo: x })}><XCircle className="h-4 w-4 text-rose-500" /></IconBtn>
                <IconBtn title="Suspend" onClick={() => setAction({ type: 'suspend', ngo: x })}><Ban className="h-4 w-4 text-amber-600" /></IconBtn>
                <IconBtn title="Reactivate" onClick={() => setAction({ type: 'reactivate', ngo: x })}><RotateCcw className="h-4 w-4 text-teal-600" /></IconBtn>
                <IconBtn title="Request Docs" onClick={() => setAction({ type: 'requestDocs', ngo: x })}><FileText className="h-4 w-4 text-brand-600" /></IconBtn>
                <IconBtn title="Delete" onClick={() => setAction({ type: 'delete', ngo: x })}><Trash2 className="h-4 w-4 text-rose-500" /></IconBtn>
              </div>
            ); },
          },
        ]}
      />

      <div className="mt-4">
        <AdminPagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
      </div>

      {/* View Modal */}
      <AdminModal open={!!viewNgo} onClose={() => setViewNgo(null)} title="NGO Details" size="lg">
        {viewNgo && (
          <div className="space-y-3">
            <DetailRow label="NGO Name" value={viewNgo.ngoName} />
            <DetailRow label="Email" value={viewNgo.email} />
            <DetailRow label="Phone" value={viewNgo.phone} />
            <DetailRow label="Registration Number" value={viewNgo.registrationNumber} />
            <DetailRow label="Website" value={viewNgo.website} />
            <DetailRow label="Description" value={viewNgo.description} />
            <DetailRow label="Status" value={<AdminBadge tone={statusTone(viewNgo.status)}>{viewNgo.status}</AdminBadge>} />
            <DetailRow label="Verification" value={<AdminBadge tone={statusTone(viewNgo.verificationStatus)}>{viewNgo.verificationStatus}</AdminBadge>} />
            <DetailRow label="Email Verified" value={viewNgo.emailVerified ? 'Yes' : 'No'} />
            <DetailRow label="Created" value={new Date(viewNgo.createdAt).toLocaleString()} />
            <DetailRow label="Last Login" value={viewNgo.lastLogin ? new Date(viewNgo.lastLogin).toLocaleString() : 'Never'} />
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
          {cfg?.isDocs && (
            <textarea value={docMessage} onChange={(e) => setDocMessage(e.target.value)} placeholder="Message to NGO about required documents..." className="w-full rounded-xl border border-ink-200 p-3 text-sm outline-none focus:border-brand-400" rows={3} />
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
