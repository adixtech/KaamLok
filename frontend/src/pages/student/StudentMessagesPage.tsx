import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { studentApi } from '../../services/studentApi';
import type { StudentNotification } from '../../types/student';

/** Messages sent by NGOs arrive as in-app notifications with this marker. */
const MESSAGE_CHANNEL = 'ngo_message';

function isNgoMessage(n: StudentNotification): boolean {
  return (n.metadata as { channel?: string } | undefined)?.channel === MESSAGE_CHANNEL;
}

export function StudentMessagesPage() {
  const [messages, setMessages] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApi.getNotifications({ limit: 100 });
      setMessages(data.notifications.filter(isNgoMessage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [messages]
  );

  const handleOpen = async (message: StudentNotification) => {
    const next = openId === message._id ? null : message._id;
    setOpenId(next);
    if (next && !message.isRead) {
      try {
        await studentApi.markNotificationRead(message._id);
        setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, isRead: true } : m)));
      } catch {
        // Non-critical: the message is already visible.
      }
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <StudentLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Messages</h1>
          <p className="mt-1 text-sm text-ink-500">Conversations with NGOs about your applications.</p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-16 ring-1 ring-ink-200">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <p className="text-sm text-ink-500">Loading messages...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm text-rose-600">{error}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={fetchMessages}>Retry</Button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <MessageSquare className="h-8 w-8 text-brand-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">No messages yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
              When an NGO contacts you about an application, the message will appear here. You can also reach a program coordinator using the contact details on your application.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/student/applications">
              <Button variant="primary" size="sm">My Applications</Button>
            </Link>
            <Link to="/student/notifications">
              <Button variant="secondary" size="sm">All Notifications</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((message) => {
            const sender = (message.metadata as { from?: string } | undefined)?.from;
            const isOpen = openId === message._id;
            return (
              <div
                key={message._id}
                className={`overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-inset transition-colors ${
                  message.isRead ? 'ring-ink-200/50' : 'ring-teal-200'
                }`}
              >
                <button
                  onClick={() => handleOpen(message)}
                  className="flex w-full items-start gap-3 p-5 text-left transition-colors hover:bg-ink-50/60"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50">
                    <Mail className="h-4 w-4 text-brand-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!message.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />}
                      <p className={`text-sm font-bold ${message.isRead ? 'text-ink-700' : 'text-ink-900'}`}>
                        {message.title}
                      </p>
                      {sender && (
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                          {sender}
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm text-ink-600 ${isOpen ? '' : 'line-clamp-2'}`}>
                      {message.message}
                    </p>
                    <p className="mt-1.5 text-xs text-ink-400">
                      {message.createdAt ? new Date(message.createdAt).toLocaleString('en-IN') : ''}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}

          <div className="flex items-center justify-center gap-2 rounded-2xl bg-ink-50 p-4 text-xs text-ink-500">
            <Inbox className="h-4 w-4" />
            Messages are also emailed to your registered address.
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
