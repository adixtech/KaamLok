import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '../../components/sections/Navbar';
import { Footer } from '../../components/sections/Footer';
import { CourseCard } from '../../components/public/CourseCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { publicApi } from '../../services/publicApi';
import type { PublicCourse } from '../../types/public';
import type { CourseFilters } from '../../types/ngo';

export function AllProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseFilters>({ categories: [], skills: [], states: [] });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const mode = searchParams.get('mode') || '';
  const state = searchParams.get('state') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const { courses: data, pagination } = await publicApi.getCourses({
        page,
        limit: 12,
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    (async () => {
      try {
        const data = await publicApi.getCourseFilters();
        setFilters(data);
      } catch {
        // Filters are optional
      }
    })();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || category || mode || state);

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        {/* Header */}
        <div className="border-b border-ink-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
              All <span className="gradient-text">Programs</span>
            </h1>
            <p className="mt-2 text-ink-500">
              Browse all published, active programs from verified NGOs. {total > 0 && `${total} programs found.`}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title, category, or keyword..."
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 py-3.5 pl-12 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Search
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                icon={<SlidersHorizontal className="h-4 w-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </form>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {search && (
                  <FilterChip label={`Search: ${search}`} onRemove={() => { updateFilter('search', ''); setSearchInput(''); }} />
                )}
                {category && (
                  <FilterChip label={`Category: ${category}`} onRemove={() => updateFilter('category', '')} />
                )}
                {mode && (
                  <FilterChip label={`Mode: ${mode}`} onRemove={() => updateFilter('mode', '')} />
                )}
                {state && (
                  <FilterChip label={`State: ${state}`} onRemove={() => updateFilter('state', '')} />
                )}
                <button onClick={clearFilters} className="text-xs font-semibold text-rose-600 hover:underline">
                  Clear All
                </button>
              </div>
            )}

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 rounded-2xl bg-ink-50 p-5 ring-1 ring-ink-200">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Category */}
                  <div>
                    <label className="text-sm font-semibold text-ink-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">All Categories</option>
                      {filters.categories.map((c) => (
                        <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
                      ))}
                    </select>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="text-sm font-semibold text-ink-700">Training Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => updateFilter('mode', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">All Modes</option>
                      <option value="online">Online</option>
                      <option value="offline">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-sm font-semibold text-ink-700">State</label>
                    <select
                      value={state}
                      onChange={(e) => updateFilter('state', e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">All States</option>
                      {filters.states.map((s) => (
                        <option key={s.name} value={s.name}>{s.name} ({s.count})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course grid */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-[28rem] rounded-3xl" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-rose-50 p-12 text-center">
              <AlertCircle className="h-10 w-10 text-rose-400" />
              <p className="text-base font-semibold text-rose-700">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => fetchCourses()}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
              <BookOpen className="h-12 w-12 text-ink-300" />
              <p className="text-lg font-semibold text-ink-600">No programs found</p>
              <p className="text-sm text-ink-400">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search terms.'
                  : 'No programs have been published yet. Check back soon!'}
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c, i) => (
                  <CourseCard key={c._id} course={c} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <span className="px-4 text-sm font-semibold text-ink-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
      {label}
      <button onClick={onRemove} className="text-brand-400 hover:text-brand-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
