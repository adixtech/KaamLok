import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import type { StudentNotification } from '../../types/student';

const TYPE_STYLE: Record<string, string> = {
  ngo_approval: 'bg-teal-50 text-teal-700',
  application_received: 'bg-brand-50 text-brand-700',
  student_registration: 'bg-emerald-50 text-emerald-700',
  system: 'bg-ink-100 text-ink-600',
  security: 'bg-rose-50 text-rose-700',
};

export function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { notifications: data, pagination, unreadCount: u } = await studentApi.getNotifications({ page, limit: 20 });
      setNotifications(data);
      setTotalPages(pagination.pages);
      setUnreadCount(u);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await studentApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await studentApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <StudentLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={<CheckCheck className="h-4 w-4" />} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {loading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <p className="font-semibold text-rose-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchNotifications}>Try Again</Button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <Bell className="h-12 w-12 text-ink-300" />
          <p className="text-lg font-semibold text-ink-600">No notifications yet</p>
          <p className="text-sm text-ink-400">Application updates, interview reminders, and announcements will appear here.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start gap-4 rounded-2xl p-4 ring-1 ring-inset transition-all ${n.isRead ? 'bg-white ring-ink-200/50' : 'bg-brand-50/50 ring-brand-200'}`}
              >
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${TYPE_STYLE[n.type] || TYPE_STYLE.system}`}>
                  <Bell className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-ink-700' : 'text-ink-900'}`}>{n.title}</p>
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n._id)} className="shrink-0 rounded-lg p-1 text-brand-600 hover:bg-brand-100">
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
                  {n.createdAt && (
                    <p className="mt-1 text-xs text-ink-400">
                      {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="px-4 text-sm font-semibold text-ink-700">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </StudentLayout>
  );
}
