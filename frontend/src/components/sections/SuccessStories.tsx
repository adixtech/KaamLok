import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Briefcase, GraduationCap, Award, AlertCircle } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Loading';
import { publicApi } from '../../services/publicApi';
import type { SuccessStory } from '../../types/public';

const AVATAR_FALLBACK = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200';

export function SuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { stories: data } = await publicApi.getFeaturedStories();
        if (active) setStories(data);
      } catch (err) {
        const e = err as { message?: string };
        if (active) setError(e?.message || 'Failed to load stories');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <section id="stories" className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Success Stories"
          title={
            <>
              Real students. <span className="gradient-text">Real careers.</span>
            </>
          }
          description="From first-generation learners to career changers — these are the journeys that make KaamLok worth building."
        />

        {/* Loading */}
        {loading && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl" />
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
        {!loading && !error && stories.length === 0 && (
          <div className="mt-14 flex flex-col items-center justify-center gap-3 rounded-3xl bg-ink-50 p-10 text-center ring-1 ring-ink-200">
            <Award className="h-10 w-10 text-ink-300" />
            <p className="text-base font-semibold text-ink-600">Success stories coming soon!</p>
            <p className="text-sm text-ink-400">As students complete programs and land jobs, their stories will appear here.</p>
          </div>
        )}

        {/* Stories grid */}
        {!loading && !error && stories.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.slice(0, 3).map((s, i) => (
              <Reveal key={s._id} delay={i * 80}>
                <article className="group relative flex h-full flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
                  <Quote className="absolute right-5 top-5 h-8 w-8 text-ink-100 transition-colors group-hover:text-brand-100" />

                  <p className="flex-1 text-sm leading-relaxed text-ink-600 text-pretty">
                    "{s.quote}"
                  </p>

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
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {/* View All */}
        {!loading && !error && stories.length > 0 && (
          <Reveal className="mt-12 flex justify-center">
            <Link to="/success-stories">
              <Button variant="secondary" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                View All Success Stories
              </Button>
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
