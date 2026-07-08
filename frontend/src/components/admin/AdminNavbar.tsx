import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';
import type { NotificationItem } from '../../types/admin';
import { AdminBadge } from './AdminBadge';

export function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Build breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
    path: '/' + pathParts.slice(0, i + 1).join('/'),
  }));

  useEffect(() => {
    adminApi.getNotifications({ limit: 5 }).then((res) => {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await adminApi.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200 bg-white/80 px-4 backdrop-blur-lg sm:px-6">
      {/* Left: menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="hidden items-center gap-1.5 text-sm sm:flex">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
              <button
                onClick={() => navigate(crumb.path)}
                className={`font-medium transition-colors ${
                  i === breadcrumbs.length - 1 ? 'text-ink-900' : 'text-ink-400 hover:text-ink-600'
                }`}
              >
                {crumb.label}
              </button>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: search, notifications, profile */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Search..."
            className="w-48 rounded-xl border border-ink-200 bg-ink-50/60 py-2 pl-9 pr-3 text-sm font-medium text-ink-700 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 lg:w-64"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative grid h-9 w-9 place-items-center rounded-xl text-ink-600 transition-colors hover:bg-ink-100"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl bg-white shadow-float ring-1 ring-ink-200/50">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-bold text-ink-900">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-ink-400">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`flex gap-3 border-b border-ink-50 px-4 py-3 transition-colors hover:bg-ink-50 ${
                        !n.isRead ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-ink-200' : 'bg-brand-500'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                        <p className="truncate text-xs text-ink-500">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => { navigate('/admin/notifications'); setNotifOpen(false); }}
                className="w-full border-t border-ink-100 py-2.5 text-center text-xs font-semibold text-brand-600 hover:bg-ink-50"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-sm font-bold text-white">
            {user?.firstName?.[0] || 'A'}
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-ink-900">{user?.firstName} {user?.lastName}</p>
            <AdminBadge tone="neutral">Admin</AdminBadge>
          </div>
          <button
            onClick={() => logout()}
            className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
