import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Send, Search, Plus, ChevronDown, X, Clock,
  Check, CheckCheck, Star, Trash2, Reply, MoreVertical,
  User, FileText, Calendar, AlertCircle,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { FullScreenLoader } from '../../components/ui/Loading';
import { ngoApi } from '../../services/ngoApi';
import { apiClient } from '../../services/apiClient';
import type { NGONotification } from '../../types/ngo';
import toast from 'react-hot-toast';

type FilterStatus = 'all' | 'sent' | 'scheduled' | 'draft';

// Reusable message templates (UI convenience, not business data)
const MESSAGE_TEMPLATES = [
  {
    _id: 'interview_invite',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {course_name}',
    body: 'Dear {student_name},\n\nCongratulations! You have been shortlisted for an interview for the {course_name} course.\n\nInterview Details:\nDate: {interview_date}\nTime: {interview_time}\nMode: {interview_mode}\n\nPlease confirm your availability by replying to this message.\n\nBest regards,\n{ngo_name}',
    category: 'interview',
  },
  {
    _id: 'selection',
    name: 'Selection Notification',
    subject: 'Congratulations! You have been selected',
    body: 'Dear {student_name},\n\nWe are pleased to inform you that you have been selected for the {course_name} course.\n\nPlease complete the enrollment formalities by {enrollment_deadline}.\n\nBest regards,\n{ngo_name}',
    category: 'selection',
  },
  {
    _id: 'rejection',
    name: 'Application Status Update',
    subject: 'Update on your application',
    body: 'Dear {student_name},\n\nThank you for your interest in {course_name}. After careful review, we regret to inform you that we are unable to proceed with your application at this time.\n\nWe encourage you to apply for future opportunities.\n\nBest regards,\n{ngo_name}',
    category: 'rejection',
  },
  {
    _id: 'course_reminder',
    name: 'Course Starting Reminder',
    subject: '{course_name} - Course Starting Soon',
    body: 'Dear {student_name},\n\nThis is a reminder that the {course_name} course will begin on {start_date}.\n\nPlease ensure you have completed all prerequisites.\n\nBest regards,\n{ngo_name}',
    category: 'reminder',
  },
  {
    _id: 'waitlist',
    name: 'Waitlist Notification',
    subject: 'Waitlist Confirmation',
    body: 'Dear {student_name},\n\nYou have been added to the waitlist for {course_name}. We will notify you if a seat becomes available.\n\nYour current position: {waitlist_position}\n\nBest regards,\n{ngo_name}',
    category: 'waitlist',
  },
];

export function MessagesPage() {
  const [messages, setMessages] = useState<NGONotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<NGONotification | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Messages are represented as notifications sent to the NGO.
      // The platform's notification system is the current message transport.
      const res = await ngoApi.getNotifications({ limit: 100 });
      setMessages(res.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filteredMessages = messages.filter((m) => {
    if (filter === 'sent' && m.isRead) return false;
    if (filter === 'draft' && !m.isRead) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: messages.length,
    sent: messages.filter((m) => m.isRead).length,
    unread: messages.filter((m) => !m.isRead).length,
  };

  const markAsRead = async (id: string) => {
    try {
      await ngoApi.markNotificationRead(id);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, isRead: true } : m)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      await ngoApi.deleteNotification(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedMessage?._id === id) setSelectedMessage(null);
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  if (loading) return <FullScreenLoader label="Loading messages..." />;

  if (error) {
    return (
      <NGOLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{error}</p>
          <button onClick={fetchMessages} className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Messages</h1>
          <p className="mt-1 text-sm text-ink-500">Communicate with students and applicants</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            <FileText className="h-4 w-4" />
            Templates
          </button>
          <button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Compose
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Send className="h-5 w-5" />} label="Read" value={stats.sent} tone="bg-teal-50 text-teal-600" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Unread" value={stats.unread} tone="bg-amber-50 text-amber-600" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Drafts" value={stats.draft} tone="bg-ink-100 text-ink-600" />
        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Total" value={stats.total} tone="bg-brand-50 text-brand-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-ink-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterStatus)}
                className="appearance-none rounded-xl border border-ink-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-ink-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="sent">Read</option>
                <option value="draft">Unread</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          <div className="max-h-[600px] space-y-2 overflow-y-auto rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50">
            {filteredMessages.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-400">
                No messages found
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <MessageListItem
                  key={msg._id}
                  message={msg}
                  selected={selectedMessage?._id === msg._id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) markAsRead(msg._id);
                  }}
                  onDelete={() => deleteMessage(msg._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Message Detail / Compose */}
        <div className="lg:col-span-2">
          {showCompose ? (
            <ComposePanel
              templates={MESSAGE_TEMPLATES}
              onClose={() => setShowCompose(false)}
              onSend={async (msg) => {
                try {
                  // Messages are delivered via the platform notification system.
                  // Full email delivery via AWS SES will be available in a future update.
                  await apiClient.post('/notifications', msg);
                  toast.success('Message sent successfully');
                  setShowCompose(false);
                  fetchMessages();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to send message');
                }
              }}
            />
          ) : selectedMessage ? (
            <MessageDetailPanel
              message={selectedMessage}
              onDelete={() => deleteMessage(selectedMessage._id)}
              onClose={() => setSelectedMessage(null)}
            />
          ) : (
            <div className="flex h-96 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-ink-300" />
                <p className="mt-4 text-sm text-ink-500">Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <TemplatesModal
          templates={MESSAGE_TEMPLATES}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={() => {
            setShowTemplates(false);
            setShowCompose(true);
          }}
        />
      )}
    </NGOLayout>
  );
}

function StatCard({
  icon, label, value, tone,
}: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-inset ring-ink-200/50">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="text-xl font-bold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function MessageListItem({
  message, selected, onClick, onDelete,
}: {
  message: NGONotification;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl p-3 transition-colors ${
        selected ? 'bg-teal-50 ring-1 ring-teal-500' : 'hover:bg-ink-50'
      } ${!message.isRead ? 'bg-teal-50/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {!message.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
            <p className={`truncate text-sm font-medium ${!message.isRead ? 'text-ink-900' : 'text-ink-700'}`}>
              {message.title}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-500">{message.message}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className={message.isRead ? 'text-teal-600' : 'text-ink-400'}>
            {message.isRead ? <CheckCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
        <span>{getTimeAgo(message.createdAt)}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="rounded-lg p-1 text-ink-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MessageDetailPanel({
  message, onDelete, onClose,
}: {
  message: NGONotification;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50">
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          message.isRead ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {message.isRead ? <CheckCheck className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {message.isRead ? 'Read' : 'Unread'}
        </span>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold text-ink-900">{message.title}</h2>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-ink-400" />
            <span className="text-ink-700">{new Date(message.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-ink-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-ink-700">{message.message}</p>
        </div>
      </div>

      <div className="border-t border-ink-100 px-6 py-4">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-700">
          <strong>Message Delivery:</strong> Emails are currently delivered via the platform notification system.
          Full email delivery via AWS SES will be available in the next update.
        </div>
      </div>
    </div>
  );
}

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

function ComposePanel({
  templates, onClose, onSend,
}: {
  templates: Template[];
  onClose: () => void;
  onSend: (msg: { subject: string; body: string; recipientEmail?: string }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    subject: '',
    body: '',
  });
  const [sending, setSending] = useState(false);

  const applyTemplate = (template: Template) => {
    setFormData((f) => ({ ...f, subject: template.subject, body: template.body }));
    toast.success('Template applied');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.body) {
      toast.error('Please fill in subject and message');
      return;
    }
    if (!formData.recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }
    setSending(true);
    try {
      await onSend(formData);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50">
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
        <h3 className="font-bold text-ink-900">Compose Message</h3>
        <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-700">Recipient Email *</label>
          <input
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData((f) => ({ ...f, recipientEmail: e.target.value }))}
            placeholder="student@example.com"
            className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-700">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
            placeholder="Enter message subject..."
            className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-700">Message *</label>
            <select
              onChange={(e) => {
                const template = templates.find((t) => t._id === e.target.value);
                if (template) applyTemplate(template);
              }}
              className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs text-ink-600"
            >
              <option value="">Insert Template...</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData((f) => ({ ...f, body: e.target.value }))}
            rows={8}
            placeholder="Write your message here..."
            className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <p className="mt-2 text-xs text-ink-500">
            Use placeholders: {'{student_name}'}, {'{course_name}'}, {'{ngo_name}'}, etc.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TemplatesModal({
  templates, onClose, onSelectTemplate,
}: {
  templates: Template[];
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-float">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Message Templates</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {templates.map((template) => (
            <button
              key={template._id}
              onClick={() => onSelectTemplate(template)}
              className="w-full rounded-xl border border-ink-200 bg-white p-4 text-left transition-colors hover:border-teal-500 hover:bg-teal-50"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink-900">{template.name}</p>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-500">
                  {template.category}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-600">{template.subject}</p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-400">{template.body}</p>
            </button>
          ))}
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

export default MessagesPage;
