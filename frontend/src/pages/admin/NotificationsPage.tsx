import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Trash2, Mail, MailOpen } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { AdminBadge, statusTone } from '../../components/admin/AdminBadge';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminModal } from '../../components/admin/AdminModal';
import { EmptyState, ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';
import type { NotificationItem, Pagination } from '../../types/admin';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getNotifications({ page, limit: 20, unread: unreadOnly || undefined });
      setNotifications(data.notifications);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError((err as Error)?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed');
    }
  };

  const markAllRead = async () => {
    setBusy(true);
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      await adminApi.deleteNotification(deleteId);
      toast.success('Notification deleted');
      setDeleteId(null);
      fetchNotifications();
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={fetchNotifications} /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setUnreadOnly(!unreadOnly); setPage(1); }}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${unreadOnly ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-100'}`}
          >
            Unread Only
          </button>
          <AdminButton variant="secondary" icon={<CheckCheck className="h-4 w-4" />} onClick={markAllRead} disabled={busy || unreadCount === 0}>
            Mark All Read
          </AdminButton>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-200/60" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-7 w-7" />} title="No Notifications" description={unreadOnly ? 'No unread notifications' : 'You have no notifications yet'} />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:shadow-float ${!n.isRead ? 'border-l-4 border-l-brand-500' : ''}`}
            >
              <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.isRead ? 'bg-ink-100 text-ink-400' : 'bg-brand-50 text-brand-600'}`}>
                {n.isRead ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-900">{n.title}</p>
                  <AdminBadge tone={statusTone(n.type)}>{n.type}</AdminBadge>
                </div>
                <p className="mt-1 text-sm text-ink-500">{n.message}</p>
                <p className="mt-1 text-xs text-ink-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                {!n.isRead && (
                  <button title="Mark as read" onClick={() => markRead(n._id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100">
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button title="Delete" onClick={() => setDeleteId(n._id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <AdminPagination page={pagination.page} pages={pagination.pages} total={pagination.total} limit={pagination.limit} onPageChange={setPage} />
      </div>

      <AdminModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Notification"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-100">Cancel</button>
            <button
              onClick={confirmDelete}
              disabled={busy}
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-rose-700 disabled:opacity-60"
            >
              {busy ? 'Processing...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink-600">Delete this notification? This cannot be undone.</p>
      </AdminModal>
    </AdminLayout>
  );
}
