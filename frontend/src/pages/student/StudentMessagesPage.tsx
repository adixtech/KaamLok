import { StudentLayout } from '../../components/student/StudentLayout';
import { MessageSquare } from 'lucide-react';

export function StudentMessagesPage() {
  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-ink-500">Conversations with NGOs about your applications.</p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
          <MessageSquare className="h-8 w-8 text-brand-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink-900">Messaging</h2>
          <p className="mt-2 text-sm text-ink-500 max-w-sm mx-auto">
            Direct messaging with NGOs will be available here. For now, use the contact information from your application details to reach your program coordinator.
          </p>
        </div>
        <div className="mt-2 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200 max-w-md text-left">
          <p className="text-xs font-semibold text-ink-700 mb-1">Coming Soon</p>
          <ul className="text-xs text-ink-500 space-y-1">
            <li>• Direct messaging with NGO coordinators</li>
            <li>• Message history &amp; search</li>
            <li>• File attachments</li>
            <li>• Real-time notifications (AWS SES ready)</li>
          </ul>
        </div>
      </div>
    </StudentLayout>
  );
}
