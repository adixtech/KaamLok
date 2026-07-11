import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ngoApi } from '../../services/ngoApi';
import type { NGOProfile } from '../../types/ngo';

export function NGONavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    ngoApi.getProfile()
      .then((data) => setProfile(data.profile))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200/60 bg-white backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="grid h-10 w-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Org Info */}
          <div className="hidden items-center gap-3 md:flex">
            {profile?.logo ? (
              <img src={profile.logo} alt={profile.ngoName} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-brand-600 text-sm font-bold text-white">
                {profile?.ngoName?.[0] || user?.firstName?.[0] || 'N'}
              </span>
            )}
            <div>
              <p className="text-sm font-bold text-ink-900">{profile?.ngoName || user?.ngoName || 'My Organization'}</p>
              {user?.verificationStatus === 'approved' && (
                <span className="flex items-center gap-1 text-xs font-medium text-teal-600">
                  <Building2 className="h-3 w-3" /> Verified NGO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="hidden flex-1 justify-center px-8 lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search courses, applications..."
              className="w-full rounded-xl border border-ink-200 bg-ink-50 py-2.5 pl-10 pr-4 text-sm text-ink-700 outline-none transition-colors placeholder:text-ink-400 focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            to="/ngo/notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-500 transition-colors hover:bg-ink-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white" />
          </Link>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-ink-50"
            >
              {profile?.logo ? (
                <img src={profile.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-teal-500 to-brand-600 text-xs font-bold text-white">
                  {profile?.ngoName?.[0] || user?.firstName?.[0] || 'N'}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-2 w-56 origin-top-right animate-fade-up rounded-xl bg-white p-2 shadow-float ring-1 ring-ink-200/60">
                  <div className="border-b border-ink-100 px-3 py-2">
                    <p className="text-sm font-semibold text-ink-900">{profile?.ngoName || user?.firstName}</p>
                    <p className="text-xs text-ink-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/ngo/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50"
                  >
                    Organization Profile
                  </Link>
                  <Link
                    to="/ngo/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50"
                  >
                    Settings
                  </Link>
                  <hr className="my-1 border-ink-100" />
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
