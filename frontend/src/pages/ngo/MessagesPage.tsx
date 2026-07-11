import { useState, useEffect, type FormEvent, type ReactNode } from 'react';
import {
  MessageSquare, Send, Search, Plus, ChevronDown, X, Clock,
   CheckCheck, Star, Trash2, 
  User, FileText, Calendar, 
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { FullScreenLoader } from '../../components/ui/Loading';
import toast from 'react-hot-toast';

type MessageStatus = 'draft' | 'sent' | 'scheduled';
type MessageType = 'individual' | 'bulk' | 'template';

interface Message {
  _id: string;
  type: MessageType;
  subject: string;
  body: string;
  recipientName?: string;
  recipientEmail?: string;
  recipients?: string[];
  courseId?: string;
  courseName?: string;
  status: MessageStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  read: boolean;
  starred: boolean;
}

interface Template {
  _id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

// Mock data
const MOCK_MESSAGES: Message[] = [
  {
    _id: '1',
    type: 'individual',
    subject: 'Interview Schedule Confirmation',
    body: 'Dear Priya, Your interview for the Healthcare Assistant position has been scheduled for...',
    recipientName: 'Priya Sharma',
    recipientEmail: 'priya@example.com',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    starred: false,
  },
  {
    _id: '2',
    type: 'bulk',
    subject: 'Course Starting Soon - Web Development',
    body: 'Dear Students, We are excited to inform you that the Web Development course will commence on...',
    recipients: ['student1@example.com', 'student2@example.com'],
    courseName: 'Web Development',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false,
    starred: true,
  },
  {
    _id: '3',
    type: 'individual',
    subject: 'Application Status Update',
    body: 'Dear Amit, We are pleased to inform you that your application has been shortlisted...',
    recipientName: 'Amit Kumar',
    recipientEmail: 'amit@example.com',
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: true,
    starred: false,
  },
  {
    _id: '4',
    type: 'individual',
    subject: 'Document Required',
    body: 'Dear Rahul, We need your 10th marksheet for application verification...',
    recipientName: 'Rahul Verma',
    recipientEmail: 'rahul@example.com',
    status: 'draft',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: false,
    starred: false,
  },
];

const MOCK_TEMPLATES: Template[] = [
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setMessages(MOCK_MESSAGES);
      setTemplates(MOCK_TEMPLATES);
      setLoading(false);
    }, 500);
  }, []);

  const filteredMessages = messages.filter((m) => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.recipientName?.toLowerCase().includes(q) ||
        m.recipientEmail?.toLowerCase().includes(q) ||
        m.courseName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: messages.length,
    sent: messages.filter((m) => m.status === 'sent').length,
    scheduled: messages.filter((m) => m.status === 'scheduled').length,
    draft: messages.filter((m) => m.status === 'draft').length,
    unread: messages.filter((m) => !m.read).length,
  };

  const toggleStar = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, starred: !m.starred } : m))
    );
  };

  const deleteMessage = (id: string) => {
    if (!confirm('Delete this message?')) return;
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selectedMessage?._id === id) setSelectedMessage(null);
    toast.success('Message deleted');
  };

  const markAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === id ? { ...m, read: true } : m))
    );
  };

  if (loading) return <FullScreenLoader label="Loading messages..." />;

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
            onClick={() => {
              setSelectedTemplate(null);
              setShowCompose(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Compose
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Send className="h-5 w-5" />} label="Sent" value={stats.sent} tone="bg-teal-50 text-teal-600" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Scheduled" value={stats.scheduled} tone="bg-amber-50 text-amber-600" />
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
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="appearance-none rounded-xl border border-ink-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-ink-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Drafts</option>
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
                    markAsRead(msg._id);
                   }}
                  onToggleStar={() => toggleStar(msg._id)}
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
              templates={templates}
              selectedTemplate={selectedTemplate}
              onClose={() => {
                setSelectedTemplate(null);
                setShowCompose(false);
              }}
              onSend={(msg: Partial<Message>) => {
                const newMsg: Message = {
                  _id: Date.now().toString(),
                  type: msg.type || 'individual',
                  subject: msg.subject || '',
                  body: msg.body || '',
                  recipientName: msg.recipientName,
                  recipientEmail: msg.recipientEmail,
                  status: 'sent',
                  sentAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  read: true,
                  starred: false,
                };
                setMessages((prev) => [newMsg, ...prev]);
                setSelectedTemplate(null);
                setShowCompose(false);
                toast.success('Message sent successfully');
              }}
            />
          ) : selectedMessage ? (
            <MessageDetailPanel
              message={selectedMessage}
              onToggleStar={() => toggleStar(selectedMessage._id)}
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
          templates={templates}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setShowTemplates(false);
            setShowCompose(true);
          }}
        />
      )}
    </NGOLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
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
  message,
  selected,
  onClick,
  onToggleStar,
  onDelete,
}: {
  message: Message;
  selected: boolean;
  onClick: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
}) {
  const statusConfig = {
    sent: { color: 'text-teal-600', icon: <CheckCheck className="h-3.5 w-3.5" /> },
    scheduled: { color: 'text-amber-600', icon: <Clock className="h-3.5 w-3.5" /> },
    draft: { color: 'text-ink-400', icon: <FileText className="h-3.5 w-3.5" /> },
  };

  const status = statusConfig[message.status];

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl p-3 transition-colors ${
        selected ? 'bg-teal-50 ring-1 ring-teal-500' : 'hover:bg-ink-50'
      } ${!message.read ? 'bg-teal-50/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {!message.read && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
            <p className={`truncate text-sm font-medium ${!message.read ? 'text-ink-900' : 'text-ink-700'}`}>
              {message.subject}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-500">
            {message.recipientName || `${message.recipients?.length || 0} recipients`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className={`rounded-lg p-1 transition-colors ${
              message.starred ? 'text-amber-500' : 'text-ink-300 hover:text-amber-500'
            }`}
          >
            <Star className={`h-4 w-4 ${message.starred ? 'fill-current' : ''}`} />
          </button>
           <span className={`${status.color}`}>
            {status.icon}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-1 text-ink-300 opacity-0 transition-colors hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
        <span>{getTimeAgo(message.createdAt)}</span>
        {message.status === 'draft' && (
          <span className="rounded px-1.5 py-0.5 bg-ink-100 text-ink-500">Draft</span>
        )}
      </div>
    </div>
  );
}

function MessageDetailPanel({
  message,
  onToggleStar,
  onDelete,
  onClose,
}: {
  message: Message;
  onToggleStar: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-600"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleStar}
            className={`rounded-lg p-1.5 transition-colors ${
              message.starred ? 'text-amber-500' : 'text-ink-300 hover:text-amber-500'
            }`}
          >
            <Star className={`h-5 w-5 ${message.starred ? 'fill-current' : ''}`} />
          </button>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            message.status === 'sent' ? 'bg-teal-50 text-teal-700' :
            message.status === 'scheduled' ? 'bg-amber-50 text-amber-700' :
            'bg-ink-100 text-ink-600'
          }`}>
            {message.status === 'sent' && <CheckCheck className="h-3.5 w-3.5" />}
            {message.status === 'scheduled' && <Clock className="h-3.5 w-3.5" />}
            {message.status === 'draft' && <FileText className="h-3.5 w-3.5" />}
            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-ink-900">{message.subject}</h2>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {message.recipientName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-ink-400" />
              <span className="text-ink-700">{message.recipientName}</span>
              <span className="text-ink-400">({message.recipientEmail})</span>
            </div>
          )}
          {message.recipients && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-ink-400" />
              <span className="text-ink-700">{message.recipients.length} recipients</span>
            </div>
          )}
          {message.courseName && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ink-400" />
              <span className="text-ink-700">{message.courseName}</span>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-ink-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-ink-700">{message.body}</p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Created {getTimeAgo(message.createdAt)}
            {message.sentAt && ` · Sent ${getTimeAgo(message.sentAt)}`}
            {message.scheduledAt && ` · Scheduled for ${new Date(message.scheduledAt).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Future AWS SES Note */}
      <div className="border-t border-ink-100 px-6 py-4">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-700">
          <strong>Message Delivery:</strong> Emails are currently delivered via the platform notification system.
          Full email delivery via AWS SES will be available in the next update.
        </div>
      </div>
    </div>
  );
}

function ComposePanel({
  templates,
  selectedTemplate,
  onClose,
  onSend,
}: {
  templates: Template[];
  selectedTemplate: Template | null;
  onClose: () => void;
  onSend: (msg: Partial<Message>) => void;
}) {
  const [formData, setFormData] = useState({
    type: 'individual' as MessageType,
    recipientEmail: '',
    recipientName: '',
    subject: '',
    body: '',
    courseId: '',
  });
    const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!selectedTemplate) return;
    setFormData((f) => ({
      ...f,
      subject: selectedTemplate.subject,
      body: selectedTemplate.body,
    }));
  }, [selectedTemplate]);

  const applyTemplate = (template: Template) => {
    setFormData((f) => ({
      ...f,
      subject: template.subject,
      body: template.body,
    }));
    toast.success('Template applied');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.body) {
      toast.error('Please fill in subject and message');
      return;
    }
    if (formData.type === 'individual' && !formData.recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }
    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSend(formData);
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
        <div className="mb-4 flex gap-4">
          {(['individual', 'bulk'] as MessageType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData((f) => ({ ...f, type }))}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                formData.type === type
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-500'
                  : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
              }`}
            >
              {type === 'individual' ? 'Individual' : 'Bulk Message'}
            </button>
          ))}
        </div>

        {formData.type === 'individual' && (
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-ink-700">Recipient Email *</label>
              <input
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData((f) => ({ ...f, recipientEmail: e.target.value }))}
                placeholder="student@example.com"
                className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700">Recipient Name</label>
              <input
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData((f) => ({ ...f, recipientName: e.target.value }))}
                placeholder="John Doe"
                className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

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
  templates,
  onClose,
  onSelectTemplate,
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
