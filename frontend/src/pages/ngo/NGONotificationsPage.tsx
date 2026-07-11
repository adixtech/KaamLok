import { useEffect, useState } from 'react';
import {
  Bell, AlertCircle,  Calendar, FileText, Users,
  MessageSquare,  Check, Trash2,  ChevronDown, Clock,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { FullScreenLoader } from '../../components/ui/Loading';
import toast from 'react-hot-toast';

type NotificationType = 'application' | 'interview' | 'course' | 'document' | 'system';
type NotificationPriority = 'low' | 'medium' | 'high';

interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationFilters {
  type: NotificationType | 'all';
  read: 'all' | 'read' | 'unread';
}

// Mock data for now - will be replaced with API when backend implements notification model
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: '1',
    type: 'application',
    title: 'New Application Received',
    message: 'Amit Kumar applied for Data Entry Operator course',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actionUrl: '/ngo/applications',
    metadata: { applicationId: 'app123' },
  },
  {
    _id: '2',
    type: 'interview',
    title: 'Interview Tomorrow',
    message: 'Interview with Priya Sharma for Healthcare Assistant is scheduled for tomorrow at 10:00 AM',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    actionUrl: '/ngo/interviews',
    metadata: { interviewId: 'int123' },
  },
  {
    _id: '3',
    type: 'course',
    title: 'Course Closing Soon',
    message: 'Web Development course applications close in 3 days. 5 seats remaining.',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    actionUrl: '/ngo/courses',
    metadata: { courseId: 'course123' },
  },
  {
    _id: '4',
    type: 'document',
    title: 'Document Verified',
    message: 'Your registration certificate has been verified by admin',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: '5',
    type: 'application',
    title: 'Application Withdrawn',
    message: 'Rahul Verma withdrew their application for Electrician course',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    _id: '6',
    type: 'system',
    title: 'Weekly Report Ready',
    message: 'Your weekly analytics report is ready for download',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    actionUrl: '/ngo/analytics',
  },
  {
    _id: '7',
    type: 'document',
    title: 'Document Expiring Soon',
    message: 'Your 80G certificate expires in 30 days. Please renew it.',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    actionUrl: '/ngo/documents',
  },
  {
    _id: '8',
    type: 'interview',
    title: 'Interview Completed',
    message: 'Interview with Vikash Singh completed. Add feedback now.',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    actionUrl: '/ngo/interviews',
  },
];

export function NGONotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    read: 'all',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }, 500);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filters.type !== 'all' && n.type !== filters.type) return false;
    if (filters.read === 'read' && !n.read) return false;
    if (filters.read === 'unread' && n.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    toast.success('Marked as read');
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    toast.success('Notification deleted');
  };

  const clearAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    toast.success('Cleared all read notifications');
  };

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    application: notifications.filter((n) => n.type === 'application').length,
    interview: notifications.filter((n) => n.type === 'interview').length,
    course: notifications.filter((n) => n.type === 'course').length,
    document: notifications.filter((n) => n.type === 'document').length,
    system: notifications.filter((n) => n.type === 'system').length,
  };

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
          {notifications.some((n) => n.read) && (
            <button
              onClick={clearAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear Read
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-6">
        <button
          onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
          className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
            filters.type === 'all' ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
          } shadow-card ring-1 ring-inset ring-ink-200/50`}
        >
          <Bell className="h-4 w-4 text-ink-500" />
          <div>
            <p className="text-lg font-bold text-ink-900">{stats.total}</p>
            <p className="text-xs text-ink-500">All</p>
          </div>
        </button>
        <button
          onClick={() => setFilters((f) => ({ ...f, type: 'application' }))}
          className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
            filters.type === 'application' ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
          } shadow-card ring-1 ring-inset ring-ink-200/50`}
        >
          <Users className="h-4 w-4 text-brand-500" />
          <div>
            <p className="text-lg font-bold text-ink-900">{stats.application}</p>
            <p className="text-xs text-ink-500">Applications</p>
          </div>
        </button>
        <button
          onClick={() => setFilters((f) => ({ ...f, type: 'interview' }))}
          className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
            filters.type === 'interview' ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
          } shadow-card ring-1 ring-inset ring-ink-200/50`}
        >
          <Calendar className="h-4 w-4 text-teal-500" />
          <div>
            <p className="text-lg font-bold text-ink-900">{stats.interview}</p>
            <p className="text-xs text-ink-500">Interviews</p>
          </div>
        </button>
        <button
          onClick={() => setFilters((f) => ({ ...f, type: 'course' }))}
          className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
            filters.type === 'course' ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
          } shadow-card ring-1 ring-inset ring-ink-200/50`}
        >
          <MessageSquare className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-lg font-bold text-ink-900">{stats.course}</p>
            <p className="text-xs text-ink-500">Courses</p>
          </div>
        </button>
        <button
          onClick={() => setFilters((f) => ({ ...f, type: 'document' }))}
          className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
            filters.type === 'document' ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
          } shadow-card ring-1 ring-inset ring-ink-200/50`}
        >
          <FileText className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-lg font-bold text-ink-900">{stats.document}</p>
            <p className="text-xs text-ink-500">Documents</p>
          </div>
        </button>
        <button
          onClick={() => setFilters((f) => ({ ...f, type: 'system' }))}
          className={`flex items-center gap-2 rounded-xl p-3 text-left transition-colors ${
            filters.type === 'system' ? 'bg-teal-50 ring-2 ring-teal-500' : 'bg-white hover:bg-ink-50'
          } shadow-card ring-1 ring-inset ring-ink-200/50`}
        >
          <AlertCircle className="h-4 w-4 text-ink-500" />
          <div>
            <p className="text-lg font-bold text-ink-900">{stats.system}</p>
            <p className="text-xs text-ink-500">System</p>
          </div>
        </button>
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
            />
          ))}
        </div>
      )}
    </NGOLayout>
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

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const typeConfig = {
    application: { icon: <Users className="h-5 w-5" />, color: 'text-brand-600', bg: 'bg-brand-50' },
    interview: { icon: <Calendar className="h-5 w-5" />, color: 'text-teal-600', bg: 'bg-teal-50' },
    course: { icon: <MessageSquare className="h-5 w-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    document: { icon: <FileText className="h-5 w-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    system: { icon: <AlertCircle className="h-5 w-5" />, color: 'text-ink-600', bg: 'bg-ink-100' },
  };

  const priorityConfig = {
    high: 'border-l-rose-500',
    medium: 'border-l-amber-500',
    low: 'border-l-ink-200',
  };

  const config = typeConfig[notification.type];
  const timeAgo = getTimeAgo(notification.createdAt);

  return (
    <div
      className={`group flex gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all ${
        !notification.read ? 'border-l-4' : ''
      } ${!notification.read ? priorityConfig[notification.priority] : ''} ${
        !notification.read ? 'bg-teal-50/30' : ''
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${config.bg} ${config.color}`}>
        {config.icon}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`font-semibold text-ink-900 ${!notification.read ? 'text-ink-900' : 'text-ink-700'}`}>
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-ink-600">{notification.message}</p>
          </div>
          {!notification.read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50"
              >
                View
              </a>
            )}
            {!notification.read && (
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
