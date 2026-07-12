import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { Reveal } from '../Reveal';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Loading';
import { CourseCard } from '../public/CourseCard';
import { publicApi } from '../../services/publicApi';
import type { PublicCourse } from '../../types/public';

export function FeaturedPrograms() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { courses: data } = await publicApi.getCourses({ page: 1, limit: 6 });
        if (active) setCourses(data);
      } catch (err) {
        if (active) {
          const e = err as { message?: string };
          setError(e?.message || 'Failed to load programs');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <section id="programs" className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured Programs"
          title={
            <>
              Handpicked programs to{' '}
              <span className="gradient-text">launch your career</span>
            </>
          }
          description="Every program is run by a verified NGO and fully funded through CSR — so you learn career-ready skills at zero cost."
        />

        {/* Loading state */}
        {loading && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[28rem] rounded-3xl" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-3xl bg-rose-50 p-12 text-center ring-1 ring-rose-100">
            <AlertCircle className="h-10 w-10 text-rose-400" />
            <p className="text-base font-semibold text-rose-700">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="mt-14 flex flex-col items-center justify-center gap-4 rounded-3xl bg-ink-50 p-12 text-center ring-1 ring-ink-200">
            <BookOpen className="h-10 w-10 text-ink-300" />
            <p className="text-base font-semibold text-ink-600">No programs published yet</p>
            <p className="text-sm text-ink-400">
              NGOs are preparing their programs. Check back soon for exciting opportunities!
            </p>
          </div>
        )}

        {/* Course grid */}
        {!loading && !error && courses.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, i) => (
              <Reveal key={c._id} delay={i * 80}>
                <CourseCard course={c} index={i} />
              </Reveal>
            ))}
          </div>
        )}

        {/* View All */}
        {!loading && !error && courses.length > 0 && (
          <Reveal className="mt-12 flex justify-center">
            <Link to="/programs">
              <Button variant="secondary" size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
                View All Programs
              </Button>
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
