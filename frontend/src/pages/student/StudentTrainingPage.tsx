import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, AlertCircle, Clock, MapPin, Video, Calendar } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import type { ApplicationWithCourse } from '../../types/student';

export function StudentTrainingPage() {
  const [trainingApps, setTrainingApps] = useState<ApplicationWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTraining = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { applications } = await studentApi.getMyApplications({ status: 'selected', limit: 50 });
      setTrainingApps(applications);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load training');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTraining(); }, [fetchTraining]);

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">My Training</h1>
        <p className="mt-1 text-sm text-ink-500">Courses you've been selected for and your training schedule.</p>
      </div>

      {loading && <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}</div>}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <p className="font-semibold text-rose-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchTraining}>Try Again</Button>
        </div>
      )}

      {!loading && !error && trainingApps.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <GraduationCap className="h-12 w-12 text-ink-300" />
          <p className="text-lg font-semibold text-ink-600">No active training yet</p>
          <p className="text-sm text-ink-400">Once you're selected for a program, your training details will appear here.</p>
          <Link to="/student/discover"><Button variant="primary" size="sm">Browse Programs</Button></Link>
        </div>
      )}

      {!loading && !error && trainingApps.length > 0 && (
        <div className="space-y-5">
          {trainingApps.map((app) => {
            const c = app.course;
            return (
              <div key={app._id} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
                <div className="flex items-start gap-4">
                  {c?.thumbnail && <img src={c.thumbnail} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link to={c?.slug ? `/courses/${c.slug}` : '#'} className="text-lg font-bold text-ink-900 hover:text-brand-700">
                          {c?.title}
                        </Link>
                        <p className="text-sm text-ink-500">{c?.ngoName}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        Selected
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {c?.schedule?.trainingStart && (
                        <div className="flex items-center gap-2 rounded-xl bg-brand-50 p-3">
                          <Calendar className="h-4 w-4 text-brand-600" />
                          <div>
                            <p className="text-xs font-semibold text-brand-800">Training Start</p>
                            <p className="text-sm text-brand-700">
                              {new Date(c.schedule.trainingStart).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                            </p>
                          </div>
                        </div>
                      )}
                      {c?.schedule?.trainingEnd && (
                        <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-3">
                          <Clock className="h-4 w-4 text-ink-500" />
                          <div>
                            <p className="text-xs font-semibold text-ink-700">Training End</p>
                            <p className="text-sm text-ink-600">
                              {new Date(c.schedule.trainingEnd).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                            </p>
                          </div>
                        </div>
                      )}
                      {c?.schedule?.duration && (
                        <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-3">
                          <GraduationCap className="h-4 w-4 text-ink-500" />
                          <div>
                            <p className="text-xs font-semibold text-ink-700">Duration</p>
                            <p className="text-sm text-ink-600">{c.schedule.duration}</p>
                          </div>
                        </div>
                      )}
                      {c?.mode && (
                        <div className="flex items-center gap-2 rounded-xl bg-ink-50 p-3">
                          {c.mode === 'online' ? <Video className="h-4 w-4 text-ink-500" /> : <MapPin className="h-4 w-4 text-ink-500" />}
                          <div>
                            <p className="text-xs font-semibold text-ink-700">Mode</p>
                            <p className="text-sm text-ink-600 capitalize">{c.mode}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {c?.schedule?.trainingDays && c.schedule.trainingDays.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-ink-700 mb-2">Training Days</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.schedule.trainingDays.map((d) => (
                            <span key={d} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.course?.contact && (
                      <div className="mt-3 border-t border-ink-100 pt-3">
                        <p className="text-xs font-semibold text-ink-700">Coordinator: {app.course.contact.coordinatorName}</p>
                        <p className="text-xs text-ink-500">{app.course.contact.coordinatorEmail} · {app.course.contact.coordinatorPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}
