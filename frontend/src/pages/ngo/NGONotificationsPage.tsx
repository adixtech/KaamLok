import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, AlertCircle, Calendar, FileText, Users,
  MessageSquare, Check, Trash2, ChevronDown, Clock,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { FullScreenLoader } from '../../components/ui/Loading';
import { ngoApi } from '../../services/ngoApi';
import type { NGONotification } from '../../types/ngo';
import toast from 'react-hot-toast';

type NotificationType = 'application' | 'interview' | 'course' | 'document' | 'system';
type NotificationFilters = { type: NotificationType | 'all'; read: 'all' | 'read' | 'unread' };

// Map backend notification types to UI categories
function categorizeType(type: string): NotificationType {
  if (type.includes('application')) return 'application';
  if (type.includes('interview')) return 'interview';
  if (type.includes('course')) return 'course';
  if (type.includes('document') || type.includes('ngo_')) return 'document';
  return 'system';
}

export function NGONotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NGONotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NotificationFilters>({ type: 'all', read: 'all' });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ngoApi.getNotifications({ limit: 100 });
      setNotifications(res.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filters.type !== 'all' && categorizeType(n.type) !== filters.type) return false;
    if (filters.read === 'read' && !n.isRead) return false;
    if (filters.read === 'unread' && n.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await ngoApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      toast.success('Marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await ngoApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await ngoApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const stats = {
    total: notifications.length,
    application: notifications.filter((n) => categorizeType(n.type) === 'application').length,
    interview: notifications.filter((n) => categorizeType(n.type) === 'interview').length,
    course: notifications.filter((n) => categorizeType(n.type) === 'course').length,
    document: notifications.filter((n) => categorizeType(n.type) === 'document').length,
    system: notifications.filter((n) => categorizeType(n.type) === 'system').length,
  };

  if (error) {
    return (
      <NGOLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{error}</p>
          <button onClick={fetchNotifications} className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
            Retry
          </button>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">
            Stay updated on platform activities
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              <Check className="h-4 w-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-6">
        <FilterStatButton icon={<Bell className="h-4 w-4 text-ink-500" />} label="All" value={stats.total} active={filters.type === 'all'} onClick={() => setFilters((f) => ({ ...f, type: 'all' }))} />
        <FilterStatButton icon={<Users className="h-4 w-4 text-brand-500" />} label="Applications" value={stats.application} active={filters.type === 'application'} onClick={() => setFilters((f) => ({ ...f, type: 'application' }))} />
        <FilterStatButton icon={<Calendar className="h-4 w-4 text-teal-500" />} label="Interviews" value={stats.interview} active={filters.type === 'interview'} onClick={() => setFilters((f) => ({ ...f, type: 'interview' }))} />
        <FilterStatButton icon={<MessageSquare className="h-4 w-4 text-amber-500" />} label="Courses" value={stats.course} active={filters.type === 'course'} onClick={() => setFilters((f) => ({ ...f, type: 'course' }))} />
        <FilterStatButton icon={<FileText className="h-4 w-4 text-emerald-500" />} label="Documents" value={stats.document} active={filters.type === 'document'} onClick={() => setFilters((f) => ({ ...f, type: 'document' }))} />
        <FilterStatButton icon={<AlertCircle className="h-4 w-4 text-ink-500" />} label="System" value={stats.system} active={filters.type === 'system'} onClick={() => setFilters((f) => ({ ...f, type: 'system' }))} />
      </div>

      {/* Read Status Filter */}
      <div className="mb-6 flex gap-2">
        <FilterDropdown
          value={filters.read}
          onChange={(v) => setFilters((f) => ({ ...f, read: v as NotificationFilters['read'] }))}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' },
          ]}
        />
      </div>

      {/* Notifications List */}
      {loading ? (
        <FullScreenLoader label="Loading notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <Bell className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-lg font-bold text-ink-900">No Notifications</h3>
          <p className="mt-1 text-sm text-ink-500">
            {filters.type !== 'all' || filters.read !== 'all'
              ? 'No notifications match your filters.'
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkRead={() => markAsRead(notification._id)}
              onDelete={() => deleteNotification(notification._id)}
              onNavigate={notification.actionUrl ? () => navigate(notification.actionUrl!) : undefined}
            />
          ))}
        </div>
      )}
    </NGOLayout>
  );
}

function FilterStatButton({
  icon, label, value, active, onClick,
}: { icon: React.ReactNode; label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
        active ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
      } shadow-card ring-1 ring-inset ring-ink-200/50`}
    >
      {icon}
      <div>
        <p className="text-lg font-bold text-ink-900">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </button>
  );
}

function FilterDropdown({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-ink-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-ink-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

function NotificationCard({
  notification, onMarkRead, onDelete, onNavigate,
}: {
  notification: NGONotification;
  onMarkRead: () => void;
  onDelete: () => void;
  onNavigate?: () => void;
}) {
  const category = categorizeType(notification.type);
  const typeConfig = {
    application: { icon: <Users className="h-5 w-5" />, color: 'text-brand-600', bg: 'bg-brand-50' },
    interview: { icon: <Calendar className="h-5 w-5" />, color: 'text-teal-600', bg: 'bg-teal-50' },
    course: { icon: <MessageSquare className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    document: { icon: <FileText className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    system: { icon: <AlertCircle className="h-5 w-5" />, color: 'text-ink-600', bg: 'bg-ink-100' },
  };
  const config = typeConfig[category];
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={`group flex gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all ${
        !notification.isRead ? 'bg-teal-50/30' : ''
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${config.bg} ${config.color}`}>
        {config.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-semibold ${notification.isRead ? 'text-ink-700' : 'text-ink-900'}`}>
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-ink-600">{notification.message}</p>
          </div>
          {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onNavigate && (
              <button
                onClick={onNavigate}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50"
              >
                View
              </button>
            )}
            {!notification.isRead && (
              <button
                onClick={onMarkRead}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50"
              >
                <Check className="h-3.5 w-3.5" />
                Mark read
              </button>
            )}
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default NGONotificationsPage;
