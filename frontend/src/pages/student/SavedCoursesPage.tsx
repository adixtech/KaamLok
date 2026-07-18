import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, AlertCircle, ChevronLeft, ChevronRight, Search, Trash2, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import type { SavedCourseItem } from '../../types/student';

export function SavedCoursesPage() {
  const [savedCourses, setSavedCourses] = useState<SavedCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchSaved = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { courses, pagination } = await studentApi.getSavedCourses({ page, limit: 12 });
      setSavedCourses(courses);
      setTotalPages(pagination.pages);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load saved courses');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const handleRemove = async (courseId: string) => {
    setRemovingId(courseId);
    try {
      await studentApi.unsaveCourse(courseId);
      toast.success('Course removed from saved');
      setSavedCourses((prev) => prev.filter((s) => s.course?._id !== courseId));
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message || 'Failed to remove');
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = search
    ? savedCourses.filter((s) =>
        s.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.course?.ngoName?.toLowerCase().includes(search.toLowerCase())
      )
    : savedCourses;

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Saved Courses</h1>
        <p className="mt-1 text-sm text-ink-500">Programs you've saved for later review.</p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved courses..."
          className="w-full rounded-2xl border border-ink-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-3xl" />)}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 p-10 text-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <p className="font-semibold text-rose-700">{error}</p>
          <Button variant="secondary" size="sm" onClick={fetchSaved}>Try Again</Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <Bookmark className="h-12 w-12 text-ink-300" />
          <p className="text-lg font-semibold text-ink-600">
            {search ? 'No matching saved courses' : 'No saved courses yet'}
          </p>
          <Link to="/student/discover">
            <Button variant="primary" size="sm">Browse Programs</Button>
          </Link>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const c = s.course;
              if (!c) return null;
              const daysLeft = c.schedule?.applicationEnd
                ? Math.ceil((new Date(c.schedule.applicationEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              const isFull = (c.availableSeats ?? 0) <= 0;
              const isClosed = daysLeft !== null && daysLeft < 0;

              return (
                <div key={s.savedId} className="rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative h-36">
                    <img
                      src={c.thumbnail || 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={c.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {c.category}
                    </span>
                    <button
                      onClick={() => handleRemove(c._id)}
                      disabled={removingId === c._id}
                      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-xl bg-white/90 text-rose-500 shadow-soft transition-all hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-ink-900 truncate">{c.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-400">{c.ngoName}</p>

                    {daysLeft !== null && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs">
                        <Clock className="h-3 w-3 text-ink-400" />
                        <span className={isClosed ? 'text-rose-500 font-semibold' : daysLeft <= 3 ? 'text-orange-600 font-semibold' : 'text-ink-500'}>
                          {isClosed ? 'Applications closed' : `${daysLeft} days left to apply`}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-400">
                        Saved {new Date(s.savedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                      {isFull || isClosed ? (
                        <span className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-500">
                          {isFull ? 'Batch Full' : 'Closed'}
                        </span>
                      ) : (
                        <Link to={`/courses/${c.slug}`}>
                          <button className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                            Apply <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="px-4 text-sm font-semibold text-ink-700">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </StudentLayout>
  );
}
