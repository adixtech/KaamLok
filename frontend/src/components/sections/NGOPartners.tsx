import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowRight, Users, BookOpen, AlertCircle } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Loading';
import { publicApi } from '../../services/publicApi';
import type { FeaturedNGO } from '../../types/public';

export function NGOPartners() {
  const [ngos, setNgos] = useState<FeaturedNGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { ngos: data } = await publicApi.getFeaturedNGOs();
        if (active) setNgos(data);
      } catch (err) {
        const e = err as { message?: string };
        if (active) setError(e?.message || 'Failed to load NGOs');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <section id="ngos" className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/40 to-ink-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured NGO Partners"
          title={
            <>
              Trusted NGOs, <span className="gradient-text">verified impact</span>
            </>
          }
          description="We partner with India's most respected NGOs — each one vetted for quality, transparency, and real placement outcomes."
        />

        {/* Loading */}
        {loading && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-3xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-14 flex flex-col items-center justify-center gap-3 rounded-3xl bg-rose-50 p-10 text-center">
            <AlertCircle className="h-8 w-8 text-rose-400" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && ngos.length === 0 && (
          <div className="mt-14 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-10 text-center ring-1 ring-ink-200">
            <Users className="h-10 w-10 text-ink-300" />
            <p className="text-base font-semibold text-ink-600">No NGO partners listed yet</p>
            <p className="text-sm text-ink-400">Verified NGOs will appear here as they join KaamLok.</p>
          </div>
        )}

        {/* NGO cards */}
        {!loading && !error && ngos.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ngos.slice(0, 4).map((n, i) => (
              <Reveal key={n._id} delay={i * 80}>
                <Link to={n.slug ? `/ngos/${n.slug}` : '/'} className="group block h-full">
                  <article className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
                    <div className="flex items-center justify-between">
                      {n.logo ? (
                        <img
                          src={n.logo}
                          alt={n.ngoName}
                          className="h-14 w-14 rounded-2xl object-cover shadow-soft ring-1 ring-ink-200"
                        />
                      ) : (
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-lg font-extrabold text-white shadow-soft">
                          {n.ngoName.charAt(0)}
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
                        <p className="mt-0.5 text-lg font-bold text-ink-900">{n.studentsTrained || 0}+</p>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
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
