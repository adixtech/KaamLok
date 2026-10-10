import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, ArrowRight, Users, BookOpen, AlertCircle,
  Search, MapPin, Building2, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Loading';
import { publicApi } from '../../services/publicApi';
import type { FeaturedNGO } from '../../types/public';

export function NGOPartners() {
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);
  const [states, setStates] = useState<string[]>([]);

  const [ngos, setNgos] = useState<FeaturedNGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  // Fetch verified NGO count + available states once
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setCountLoading(true);
        const data = await publicApi.getVerifiedNGOCount();
        if (active) {
          setCount(data.total);
          setStates(data.states);
        }
      } catch {
        if (active) setCount(null);
      } finally {
        if (active) setCountLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const fetchNGOs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicApi.getVerifiedNGOs({
        page, limit: 8,
        search: search || undefined,
        state: stateFilter || undefined,
      });
      setNgos(data.ngos);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to load verified NGOs');
    } finally {
      setLoading(false);
    }
  }, [page, search, stateFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNGOs();
  }, [fetchNGOs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStateChange = (value: string) => {
    setStateFilter(value);
    setPage(1);
  };

  const showDirectory = count !== null && count > 0;

  return (
    <section id="ngos" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/40 to-ink-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Trust banner — real verified count */}
        <Reveal>
          <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-bold text-teal-700 ring-1 ring-inset ring-teal-200">
              <BadgeCheck className="h-4 w-4" />
              Verified by KaamLok
            </span>
            {countLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : count !== null && count > 0 ? (
              <>
                <p className="text-4xl font-extrabold text-ink-900 sm:text-5xl">
                  {count}
                </p>
                <p className="text-sm font-semibold text-ink-600 sm:text-base">
                  Verified NGO{count === 1 ? '' : 's'} currently on KaamLok
                </p>
                <p className="mt-1 max-w-md text-sm text-ink-400">
                  Every organization has passed KaamLok's admin verification process before appearing here.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-ink-700">Verified NGOs are joining KaamLok</p>
                <p className="max-w-md text-sm text-ink-400">
                  We're currently onboarding verified training organizations. Check back soon.
                </p>
              </>
            )}
          </div>
        </Reveal>

        {/* Section heading */}
        <SectionHeading
          eyebrow="Explore Verified NGOs"
          title={
            <>
              Discover organizations you can <span className="gradient-text">trust</span>
            </>
          }
          description="Browse verified organizations providing placement training, career preparation and employment-focused programs through KaamLok."
        />

        {/* Search + filter bar — only show if there are verified NGOs */}
        {showDirectory && (
          <div className="mx-auto mt-10 max-w-3xl">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search NGOs by name, sector, or city..."
                  aria-label="Search verified NGOs"
                  className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {states.length > 0 && (
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
                  <select
                    value={stateFilter}
                    onChange={(e) => handleStateChange(e.target.value)}
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
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-3xl bg-rose-50 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <div>
              <p className="text-base font-bold text-rose-700">We couldn't load verified NGOs right now.</p>
              <p className="mt-1 text-sm text-rose-600">Please try again in a moment.</p>
            </div>
            <Button variant="secondary" size="md" onClick={fetchNGOs}>
              <span className="inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Retry</span>
            </Button>
          </div>
        )}

        {/* Empty: no verified NGOs at all */}
        {!loading && !error && !showDirectory && (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-12 text-center ring-1 ring-ink-200">
            <Building2 className="h-12 w-12 text-ink-300" />
            <p className="text-base font-semibold text-ink-600">No verified NGOs are currently available</p>
            <p className="text-sm text-ink-400">Verified training organizations will appear here as they are approved.</p>
          </div>
        )}

        {/* Empty: search/filter returned nothing */}
        {!loading && !error && showDirectory && ngos.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-12 text-center ring-1 ring-ink-200">
            <Search className="h-10 w-10 text-ink-300" />
            <p className="text-base font-semibold text-ink-600">
              {search || stateFilter ? 'No verified NGOs match your search.' : 'No verified NGOs are currently available.'}
            </p>
            {(search || stateFilter) && (
              <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setStateFilter(''); setPage(1); }}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* NGO cards */}
        {!loading && !error && ngos.length > 0 && (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {ngos.map((n, i) => (
                <Reveal key={n._id} delay={i * 80}>
                  <Link
                    to={n.slug ? `/ngos/${n.slug}` : `/ngos/${n._id}`}
                    className="group block h-full"
                    aria-label={`View profile for ${n.ngoName}`}
                  >
                    <article className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
                      <div className="flex items-center justify-between">
                        {n.logo ? (
                          <img
                            src={n.logo}
                            alt={`${n.ngoName} logo`}
                            className="h-14 w-14 rounded-2xl object-cover shadow-soft ring-1 ring-ink-200"
                          />
                        ) : (
                          <span
                            className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-lg font-extrabold text-white shadow-soft"
                            aria-hidden
                          >
                            {n.ngoName.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-bold text-ink-900 transition-colors group-hover:text-brand-700">
                        {n.ngoName}
                      </h3>

                      {(n.city || n.state) && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ink-400">
                          <MapPin className="h-3 w-3" />
                          {[n.city, n.state].filter(Boolean).join(', ')}
                        </p>
                      )}

                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500 line-clamp-3">
                        {n.description || 'Empowering youth through skill development and placement programs.'}
                      </p>

                      {n.sectorsFocused && n.sectorsFocused.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {n.sectorsFocused.slice(0, 3).map((t) => (
                            <span key={t} className="rounded-lg bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-600">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-ink-400">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">Programs</span>
                          </div>
                          <p className="mt-0.5 text-lg font-bold text-ink-900">{n.activeCourses}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-ink-400">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-medium">Trained</span>
                          </div>
                          <p className="mt-0.5 text-lg font-bold text-ink-900">{n.studentsTrained || 0}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand-600 transition-colors group-hover:text-brand-700">
                        View Profile
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <span className="px-4 text-sm font-semibold text-ink-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:pointer-events-none disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* CTAs */}
        <Reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register/ngo">
            <Button variant="primary" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
              Partner as NGO
            </Button>
          </Link>
          <Link to="/programs">
            <Button variant="white" size="lg">
              View All Programs
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
