import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search,  Building2, FileText,
  Bookmark, Calendar, GraduationCap, Award, MessageSquare,
  Bell, User, Settings, ChevronLeft, LogOut,
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
      { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    title: 'Discover',
    items: [
      { to: '/student/discover', icon: Search, label: 'Discover Courses' },
      { to: '/student/ngos', icon: Building2, label: 'Verified NGOs' },
    ],
  },
  {
    title: 'My Activity',
    items: [
      { to: '/student/applications', icon: FileText, label: 'My Applications' },
      { to: '/student/saved', icon: Bookmark, label: 'Saved Courses' },
      { to: '/student/interviews', icon: Calendar, label: 'Interviews' },
      { to: '/student/training', icon: GraduationCap, label: 'Training' },
      { to: '/student/certificates', icon: Award, label: 'Certificates' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { to: '/student/messages', icon: MessageSquare, label: 'Messages' },
      { to: '/student/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/student/profile', icon: User, label: 'Profile' },
      { to: '/student/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function StudentSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
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
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                {section.title}
              </p>
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
                          ? 'bg-brand-600 text-white shadow-soft'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            {user?.firstName && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-500 text-sm font-bold text-white">
                {user.firstName[0]}{user.lastName?.[0]}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-white/50">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
