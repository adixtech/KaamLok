import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertCircle, Clock, Video, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import type { ApplicationWithCourse } from '../../types/student';

type Tab = 'upcoming' | 'completed' | 'all';

export function StudentInterviewsPage() {
  const [applications, setApplications] = useState<ApplicationWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { applications: data } = await studentApi.getMyApplications({ status: 'interview_scheduled', limit: 50 });
      setApplications(data);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const now = new Date();
  const filtered = applications.filter((a) => {
    if (!a.interview?.scheduledAt) return tab === 'all';
    const d = new Date(a.interview.scheduledAt);
    if (tab === 'upcoming') return d >= now && !a.interview.completed;
    if (tab === 'completed') return a.interview.completed || d < now;
    return true;
  });

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Interviews</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your upcoming and past interviews.</p>
      </div>

      <div className="mb-5 flex gap-2">
        {(['upcoming', 'completed', 'all'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-brand-600 text-white' : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading && <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <p className="font-semibold text-rose-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchInterviews}>Try Again</Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <Calendar className="h-12 w-12 text-ink-300" />
          <p className="text-lg font-semibold text-ink-600">No {tab} interviews</p>
          <Link to="/student/discover"><Button variant="primary" size="sm">Browse Programs</Button></Link>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((app) => {
            const iv = app.interview!;
            const isCompleted = iv.completed || (iv.scheduledAt && new Date(iv.scheduledAt) < now);
            return (
              <div key={app._id} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${isCompleted ? 'bg-emerald-50' : 'bg-brand-50'}`}>
                      {isCompleted ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Calendar className="h-6 w-6 text-brand-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-ink-900">{app.course?.title}</p>
                      <p className="text-sm text-ink-400">{app.course?.ngoName}</p>
                      {iv.scheduledAt && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                          <span className="flex items-center gap-1.5 text-ink-600">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(iv.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                          </span>
                          <span className="flex items-center gap-1.5 capitalize text-ink-500">
                            {iv.mode === 'online' ? <Video className="h-3.5 w-3.5" /> : iv.mode === 'phone' ? <Phone className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                            {iv.mode} interview
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'}`}>
                    {isCompleted ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 rounded-xl bg-ink-50 p-4 sm:grid-cols-2">
                  {iv.location && <p className="text-sm text-ink-600"><span className="font-semibold">Location:</span> {iv.location}</p>}
                  {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-600 underline">Join Meeting</a>}
                  {iv.notes && <p className="text-sm text-ink-600 sm:col-span-2"><span className="font-semibold">Notes:</span> {iv.notes}</p>}
                  {iv.feedback && <p className="text-sm text-ink-600 sm:col-span-2"><span className="font-semibold">Feedback:</span> {iv.feedback}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
