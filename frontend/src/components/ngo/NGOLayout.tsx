import { useState, type ReactNode } from 'react';
import { NGOSidebar } from './NGOSidebar';
import { NGONavbar } from './NGONavbar';

/**
 * NGO layout shell — sidebar + navbar + content area.
 * All NGO pages render inside this shell via nested routes.
 */
export function NGOLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50">
      <NGOSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <NGONavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
