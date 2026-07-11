import { NGOLayout } from '../../components/ngo/NGOLayout';

export function InterviewsPage() {
  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Interviews</h1>
        <p className="mt-1 text-sm text-ink-500">Schedule and manage student interviews</p>
      </div>
      <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
        <Calendar className="mx-auto h-12 w-12 text-ink-300" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Interview Management</h3>
        <p className="mt-1 text-sm text-ink-500">Feature coming soon. Schedule interviews with shortlisted candidates.</p>
      </div>
    </NGOLayout>
  );
}

import { MessageSquare } from 'lucide-react';

export function MessagesPage() {
  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Messages</h1>
        <p className="mt-1 text-sm text-ink-500">Communicate with students and applicants</p>
      </div>
      <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
        <MessageSquare className="mx-auto h-12 w-12 text-ink-300" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Messages</h3>
        <p className="mt-1 text-sm text-ink-500">Feature coming soon. Send messages to students and track conversations.</p>
      </div>
    </NGOLayout>
  );
}

import { BarChart3 } from 'lucide-react';

export function NGOAnalyticsPage() {
  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-ink-500">Track performance and gain insights</p>
      </div>
      <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
        <BarChart3 className="mx-auto h-12 w-12 text-ink-300" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Analytics Dashboard</h3>
        <p className="mt-1 text-sm text-ink-500">Comprehensive reports and analytics for your organization.</p>
      </div>
    </NGOLayout>
  );
}

import { FileText } from 'lucide-react';

export function DocumentsPage() {
  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Documents</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your organization's documents</p>
      </div>
      <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
        <FileText className="mx-auto h-12 w-12 text-ink-300" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Document Management</h3>
        <p className="mt-1 text-sm text-ink-500">Upload and manage verification documents, certificates, and more.</p>
      </div>
    </NGOLayout>
  );
}

import { Bell } from 'lucide-react';

export function NGONotificationsPage() {
  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Notifications</h1>
        <p className="mt-1 text-sm text-ink-500">Stay updated on platform activities</p>
      </div>
      <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
        <Bell className="mx-auto h-12 w-12 text-ink-300" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Notifications</h3>
        <p className="mt-1 text-sm text-ink-500">View and manage all your notifications in one place.</p>
      </div>
    </NGOLayout>
  );
}

import { Settings } from 'lucide-react';

export function NGOSettingsPage() {
  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Configure your account preferences</p>
      </div>
      <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
        <Settings className="mx-auto h-12 w-12 text-ink-300" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Account Settings</h3>
        <p className="mt-1 text-sm text-ink-500">Manage password, notifications, and privacy settings.</p>
      </div>
    </NGOLayout>
  );
}

import { Calendar } from 'lucide-react';
