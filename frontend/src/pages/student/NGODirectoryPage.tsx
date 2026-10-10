import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Building2, AlertCircle, ChevronLeft, ChevronRight, Users, BookOpen, BadgeCheck, MapPin, RefreshCw } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import { publicApi } from '../../services/publicApi';
import type { DirectoryNGO } from '../../types/student';

const COVER_PLACEHOLDER = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600';

export function NGODirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ngos, setNgos] = useState<DirectoryNGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [states, setStates] = useState<string[]>([]);

  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const [searchInput, setSearchInput] = useState(search);

  // Fetch available states from the verified NGO count endpoint
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await publicApi.getVerifiedNGOCount();
        if (active) setStates(data.states);
      } catch {
        // States filter just won't be available
      }
    })();
    return () => { active = false; };
  }, []);

  const fetchNGOs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { ngos: data, pagination } = await studentApi.getNGODirectory({
        page, limit: 12,
        search: search || undefined,
        state: state || undefined,
      });
      setNgos(data);
      setTotalPages(pagination.pages);
      setTotal(pagination.total);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  }, [page, search, state]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNGOs();
  }, [fetchNGOs]);

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput);
  };

  const hasFilters = search || state;

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Verified NGOs
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Explore {total > 0 ? `${total} ` : ''}verified NGOs offering free skill development programs.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by NGO name, sector..."
            aria-label="Search verified NGOs"
            className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {states.length > 0 && (
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <select
              value={state}
              onChange={(e) => updateFilter('state', e.target.value)}
              aria-label="Filter by state"
              className="w-full appearance-none rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-10 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-auto"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        <Button type="submit" variant="primary" size="md">Search</Button>
        {hasFilters && (
          <Button type="button" variant="secondary" size="md" onClick={() => { setSearchInput(''); updateFilter('search', ''); updateFilter('state', ''); }}>
            Clear
          </Button>
        )}
      </form>

      <div className="mt-6">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-3xl" />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-rose-50 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <div>
              <p className="text-base font-bold text-rose-700">We couldn't load verified NGOs right now.</p>
              <p className="mt-1 text-sm text-rose-600">Please try again in a moment.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchNGOs}>
              <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Retry</span>
            </Button>
          </div>
        )}

        {!loading && !error && ngos.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
            <Building2 className="h-12 w-12 text-ink-300" />
            <p className="text-lg font-semibold text-ink-600">
              {hasFilters ? 'No verified NGOs match your search.' : 'No verified NGOs are currently available.'}
            </p>
            <p className="text-sm text-ink-400">
              {hasFilters ? 'Try adjusting your search or filters.' : 'Verified NGOs will appear here once they are approved.'}
            </p>
            {hasFilters && (
              <Button variant="secondary" size="sm" onClick={() => { setSearchInput(''); updateFilter('search', ''); updateFilter('state', ''); }}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && ngos.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ngos.map((n) => (
                <Link key={n._id} to={n.slug ? `/ngos/${n.slug}` : `/ngos/${n._id}`} className="group block">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={n.coverImage || COVER_PLACEHOLDER}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
                      {n.verificationStatus === 'approved' && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-teal-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-3">
                        {n.logo ? (
                          <img src={n.logo} alt={n.ngoName} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-soft -mt-8" />
                        ) : (
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 text-lg font-extrabold text-white shadow-soft -mt-8 ring-2 ring-white">
                            {n.ngoName.charAt(0)}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-ink-900 group-hover:text-brand-700 transition-colors">
                          {n.ngoName}
                        </h3>
                      </div>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500 line-clamp-3">
                        {n.description}
                      </p>

                      {n.sectorsFocused?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {n.sectorsFocused.slice(0, 3).map((s) => (
                            <span key={s} className="rounded-lg bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">{s}</span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-ink-500">
                          <BookOpen className="h-3.5 w-3.5 text-brand-400" />
                          <span><strong className="text-ink-800">{n.activeCourses}</strong> programs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-500">
                          <Users className="h-3.5 w-3.5 text-teal-400" />
                          <span><strong className="text-ink-800">{n.studentsTrained}</strong> trained</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
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
