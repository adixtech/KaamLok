import { useEffect, useState, useCallback } from 'react';
import { useSearchParams  } from 'react-router-dom';
//link is remove in future if you want add it above
import { Search, SlidersHorizontal, X, BookOpen, AlertCircle, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../../components/student/StudentLayout';
import { CourseCard } from '../../components/public/CourseCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { publicApi } from '../../services/publicApi';
import { studentApi } from '../../services/studentApi';
import type { PublicCourse } from '../../types/public';
import type { CourseFilters } from '../../types/ngo';

export function DiscoverCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseFilters>({ categories: [], skills: [], states: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [savedCourses, setSavedCourses] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const mode = searchParams.get('mode') || '';
  const state = searchParams.get('state') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { courses: data, pagination } = await publicApi.getCourses({
        page, limit: 12,
        search: search || undefined,
        category: category || undefined,
        mode: mode || undefined,
        state: state || undefined,
      });
      setCourses(data);
      setTotalPages(pagination.pages);
      setTotal(pagination.total);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, mode, state]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    publicApi.getCourseFilters().then(setFilters).catch(() => {});
  }, []);

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const handleToggleSave = async (courseId: string) => {
    if (savingId === courseId) return;
    setSavingId(courseId);
    try {
      if (savedCourses.has(courseId)) {
        await studentApi.unsaveCourse(courseId);
        setSavedCourses((prev) => { const n = new Set(prev); n.delete(courseId); return n; });
        toast.success('Removed from saved');
      } else {
        await studentApi.saveCourse(courseId);
        setSavedCourses((prev) => new Set(prev).add(courseId));
        toast.success('Course saved!');
      }
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message || 'Failed to save course');
    } finally {
      setSavingId(null);
    }
  };

  const hasFilters = !!(search || category || mode || state);

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Discover Programs
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Browse {total > 0 ? `${total} ` : ''}published programs from verified NGOs — all free.
        </p>
      </div>

      {/* Search + Filters bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, category, or skill..."
            className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Button type="submit" variant="primary" size="md">Search</Button>
        <Button type="button" variant="secondary" size="md" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => setShowFilters(!showFilters)}>
          Filters
        </Button>
      </form>

      {/* Active filters */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[['search', search], ['category', category], ['mode', mode], ['state', state]].filter(([, v]) => v).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
              {k}: {v}
              <button onClick={() => { updateFilter(k, ''); if (k === 'search') setSearchInput(''); }}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button onClick={() => { setSearchParams(new URLSearchParams()); setSearchInput(''); setPage(1); }} className="text-xs font-semibold text-rose-600 hover:underline">
            Clear All
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-3 rounded-2xl bg-white p-4 ring-1 ring-ink-200">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-ink-700">Category</label>
              <select value={category} onChange={(e) => updateFilter('category', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                <option value="">All Categories</option>
                {filters.categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-ink-700">Mode</label>
              <select value={mode} onChange={(e) => updateFilter('mode', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-ink-700">State</label>
              <select value={state} onChange={(e) => updateFilter('state', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                <option value="">All States</option>
                {filters.states.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.count})</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Course grid */}
      <div className="mt-6">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-[28rem] rounded-3xl" />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-rose-50 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchCourses}>Try Again</Button>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
            <BookOpen className="h-12 w-12 text-ink-300" />
            <p className="text-lg font-semibold text-ink-600">No programs found</p>
            <p className="text-sm text-ink-400">
              {hasFilters ? 'Try different filters.' : 'No published programs available yet. Check back soon!'}
            </p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <div key={c._id} className="relative">
                  <CourseCard course={c} />
                  <button
                    onClick={() => handleToggleSave(c._id)}
                    className="absolute right-3 top-[180px] z-10 grid h-9 w-9 place-items-center rounded-xl bg-white/90 shadow-soft ring-1 ring-ink-200 transition-all hover:bg-brand-50 hover:ring-brand-300"
                    aria-label={savedCourses.has(c._id) ? 'Unsave course' : 'Save course'}
                  >
                    {savedCourses.has(c._id)
                      ? <BookmarkCheck className="h-4.5 w-4.5 text-brand-600" />
                      : <Bookmark className="h-4.5 w-4.5 text-ink-500" />
                    }
                  </button>
                </div>
              ))}
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
      </div>
    </StudentLayout>
  );
}
