import { useEffect, useState, useCallback } from 'react';
import { Search, Quote, Briefcase, GraduationCap, Award, AlertCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Navbar } from '../../components/sections/Navbar';
import { Footer } from '../../components/sections/Footer';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { publicApi } from '../../services/publicApi';
import type { SuccessStory } from '../../types/public';

const AVATAR_FALLBACK = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200';

export function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const { stories: data, pagination } = await publicApi.getAllStories({
        page,
        limit: 12,
        search: search || undefined,
      });
      setStories(data);
      setTotalPages(pagination.pages);
      setTotal(pagination.total);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        {/* Header */}
        <div className="border-b border-ink-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
              Success <span className="gradient-text">Stories</span>
            </h1>
            <p className="mt-2 text-ink-500">
              Real journeys from students who transformed their lives through KaamLok programs. {total > 0 && `${total} stories.`}
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex gap-3">
              <div className="relative flex-1 max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by student, course, NGO, or role..."
                  className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 py-3.5 pl-12 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <Button type="submit" variant="primary">Search</Button>
            </form>
          </div>
        </div>

        {/* Stories */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-rose-50 p-12 text-center">
              <AlertCircle className="h-10 w-10 text-rose-400" />
              <p className="text-base font-semibold text-rose-700">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => fetchStories()}>Try Again</Button>
            </div>
          )}

          {!loading && !error && stories.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
              <Award className="h-12 w-12 text-ink-300" />
              <p className="text-lg font-semibold text-ink-600">No stories found</p>
              <p className="text-sm text-ink-400">
                {search ? 'Try a different search term.' : 'Success stories will appear here as students complete their programs.'}
              </p>
            </div>
          )}

          {!loading && !error && stories.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((s) => (
                  <article
                    key={s._id}
                    className="group relative flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200"
                  >
                    <Quote className="absolute right-5 top-5 h-8 w-8 text-ink-100 transition-colors group-hover:text-brand-100" />

                    <p className="flex-1 text-sm leading-relaxed text-ink-600 text-pretty">
                      "{s.quote}"
                    </p>

                    {/* Before/After */}
                    <div className="mt-4 space-y-2">
                      {s.beforeStory && (
                        <div className="rounded-xl bg-ink-50 p-3">
                          <p className="text-xs font-semibold text-ink-400">Before</p>
                          <p className="mt-1 text-xs text-ink-500 line-clamp-2">{s.beforeStory}</p>
                        </div>
                      )}
                      {s.afterStory && (
                        <div className="rounded-xl bg-brand-50 p-3">
                          <p className="text-xs font-semibold text-brand-400">After</p>
                          <p className="mt-1 text-xs text-brand-600 line-clamp-2">{s.afterStory}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-4">
                      <img
                        src={s.studentPhoto || AVATAR_FALLBACK}
                        alt={s.studentName}
                        loading="lazy"
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-ink-100"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink-900">{s.studentName}</p>
                        {s.currentRole && (
                          <p className="text-xs font-medium text-brand-600">
                            {s.currentRole}{s.currentCompany ? ` at ${s.currentCompany}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                        <GraduationCap className="h-3 w-3" />
                        {s.courseTitle}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        <Briefcase className="h-3 w-3" />
                        {s.ngoName}
                      </span>
                      {s.studentCity && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
                          <MapPin className="h-3 w-3" />
                          {s.studentCity}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {s.skillsLearned?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {s.skillsLearned.slice(0, 4).map((sk) => (
                          <span key={sk} className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Completion date */}
                    <p className="mt-3 text-xs text-ink-400">
                      Completed: {new Date(s.completionDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  </article>
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
                  <span className="px-4 text-sm font-semibold text-ink-700">Page {page} of {totalPages}</span>
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
