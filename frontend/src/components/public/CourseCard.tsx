import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  BadgeCheck,
  CalendarClock,
  Sparkles,
  Flame,
  Zap,
} from 'lucide-react';
import type { PublicCourse } from '../../types/public';
import { BENEFIT_LABELS } from '../../types/ngo';

type Props = {
  course: PublicCourse;
  index?: number;
};

const PLACEHOLDER_THUMBNAIL = 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800';

function getDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getLocation(c: PublicCourse): string {
  if (c.mode === 'online') return 'Online';
  const city = (c as unknown as { offlineDetails?: { city?: string } }).offlineDetails?.city;
  return city ? `${city} · ${c.mode}` : c.mode;
}

export function CourseCard({ course: c }: Props) {
  const pct = c.totalSeats > 0 ? Math.round((c.filledSeats / c.totalSeats) * 100) : 100;
  const left = c.availableSeats;
  const daysLeft = getDaysLeft(c.schedule.applicationEnd);
  const isFull = left <= 0;
  const isClosingSoon = daysLeft >= 0 && daysLeft <= 3;
  const isNew = c.applicationsCount < 5;
  const isFree = c.benefits?.includes('free_training') ?? true;
  const isVerified = c.ngoVerificationStatus === 'approved';

  return (
    <Link to={`/courses/${c.slug}`} className="group block h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-inset ring-ink-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float hover:ring-brand-200">
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={c.thumbnail || PLACEHOLDER_THUMBNAIL}
            alt={c.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />

          {/* Category badge */}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 backdrop-blur">
            {c.category}
          </span>

          {/* Status badges */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 backdrop-blur">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
            {isFree && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                Free
              </span>
            )}
            {!isFull && isClosingSoon && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                <Flame className="h-3 w-3" />
                Closing Soon
              </span>
            )}
            {!isFull && !isClosingSoon && isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-xs font-semibold text-amber-900 backdrop-blur">
                <Sparkles className="h-3 w-3" />
                New
              </span>
            )}
            {!isFull && !isClosingSoon && !isNew && left <= 5 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-400/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                <Zap className="h-3 w-3" />
                Limited Seats
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-700">
            {c.title}
          </h3>

          {/* NGO info */}
          <div className="mt-2 flex items-center gap-2">
            {c.ngoLogo ? (
              <img
                src={c.ngoLogo}
                alt={c.ngoName}
                className="h-6 w-6 rounded-lg object-cover ring-1 ring-ink-200"
              />
            ) : (
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
                {c.ngoName.charAt(0)}
              </span>
            )}
            <span className="text-sm font-medium text-ink-500">{c.ngoName}</span>
          </div>

          {/* Meta */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Meta icon={MapPin} label={getLocation(c)} />
            <Meta icon={Clock} label={c.schedule.duration || 'Flexible'} />
            <Meta icon={GraduationCap} label={c.difficulty} />
            <Meta
              icon={Users}
              label={isFull ? 'Batch Full' : `${left} seats left`}
            />
          </div>

          {/* Deadline */}
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <CalendarClock className="h-3.5 w-3.5 text-ink-400" />
            <span className="font-medium text-ink-500">
              {daysLeft > 0
                ? `${daysLeft} days left to apply`
                : daysLeft === 0
                  ? 'Last day to apply!'
                  : 'Applications closed'}
            </span>
          </div>

          {/* Seats progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-ink-500">
              <span>Seats filled</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull
                    ? 'bg-rose-400'
                    : left <= 5
                      ? 'bg-gradient-to-r from-orange-400 to-rose-400'
                      : 'bg-gradient-to-r from-brand-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
            <span className="text-xs font-semibold text-ink-400">
              {isFree ? '100% Free · CSR Funded' : 'Paid Program'}
            </span>
            {isFull ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-500">
                Batch Full
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all group-hover:bg-brand-700 group-hover:shadow-soft">
                Apply
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function Meta({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-500">
      <Icon className="h-3.5 w-3.5 text-ink-400" />
      {label}
    </span>
  );
}

export { BENEFIT_LABELS };
