import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, BookOpen, Users, Calendar, MessageSquare,
  BarChart3, Building2, FileText, Bell, Settings, ChevronLeft,
} from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth } from '../../context/AuthContext';

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { to: '/ngo/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/ngo/analytics', icon: BarChart3, label: 'Reports & Analytics' },
    ],
  },
  {
    title: 'Courses',
    items: [
      { to: '/ngo/courses/create', icon: PlusCircle, label: 'Create Course' },
      { to: '/ngo/courses', icon: BookOpen, label: 'My Courses' },
    ],
  },
  {
    title: 'Applications',
    items: [
      { to: '/ngo/applications', icon: Users, label: 'Student Applications' },
      { to: '/ngo/interviews', icon: Calendar, label: 'Interviews' },
    ],
  },
  {
    title: 'Organization',
    items: [
      { to: '/ngo/profile', icon: Building2, label: 'Organization Profile' },
      { to: '/ngo/documents', icon: FileText, label: 'Documents' },
      { to: '/ngo/notifications', icon: Bell, label: 'Notifications' },
      { to: '/ngo/settings', icon: Settings, label: 'Settings' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { to: '/ngo/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
];

export function NGOSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-900 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo dark />
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/30">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-soft'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-brand-600 text-sm font-bold text-white">
              {user?.ngoName?.[0] || user?.firstName?.[0] || 'N'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user?.ngoName || `${user?.firstName} ${user?.lastName}`}</p>
              <p className="truncate text-xs text-white/50">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
