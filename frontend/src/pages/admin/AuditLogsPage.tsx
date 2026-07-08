import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge } from '../../components/admin/AdminBadge';
import { ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { AuditLogItem, Pagination } from '../../types/admin';

const ACTIONS = ['', 'login', 'logout', 'create', 'update', 'delete', 'suspend', 'reactivate', 'approve', 'reject', 'block'];

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs({ page, limit: 20, action: action || undefined });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchLogs} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-ink-500">Track all admin actions on the platform</p>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none focus:border-brand-400">
            {ACTIONS.map((a) => <option key={a} value={a}>{a ? a.charAt(0).toUpperCase() + a.slice(1) : 'All Actions'}</option>)}
          </select>
        </div>
      </div>

      <AdminTable
        loading={loading}
        data={logs as unknown as Record<string, unknown>[]}
        rowKey={(l) => (l as unknown as AuditLogItem)._id}
        emptyMessage="No audit logs found"
        columns={[
          { key: 'adminName', header: 'Admin', render: (l) => { const x = l as unknown as AuditLogItem; return (
            <div>
              <p className="font-semibold text-ink-900">{x.adminName}</p>
              <p className="text-xs text-ink-400">{x.adminEmail}</p>
            </div>
          ); } },
          { key: 'action', header: 'Action', render: (l) => <AdminBadge tone="brand">{(l as unknown as AuditLogItem).action}</AdminBadge> },
          { key: 'targetType', header: 'Target Type', render: (l) => (l as unknown as AuditLogItem).targetType },
          { key: 'targetName', header: 'Target', render: (l) => (l as unknown as AuditLogItem).targetName },
          { key: 'reason', header: 'Reason', render: (l) => { const x = l as unknown as AuditLogItem; return <span className="text-ink-500">{x.reason || '—'}</span>; } },
          { key: 'ip', header: 'IP', render: (l) => <span className="font-mono text-xs text-ink-500">{(l as unknown as AuditLogItem).ip}</span> },
          { key: 'timestamp', header: 'Timestamp', render: (l) => new Date((l as unknown as AuditLogItem).timestamp).toLocaleString() },
        ]}
      />

      <div className="mt-4">
        <AdminPagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
      </div>
    </AdminLayout>
  );
}
