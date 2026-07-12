import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Mail,
  Phone,
  Users,
  BookOpen,
  Calendar,
  Building2,
  Target,
  Eye,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
//remove Global,social media all icon name from import because ...
import { Navbar } from '../../components/sections/Navbar';
import { Footer } from '../../components/sections/Footer';
import { Skeleton } from '../../components/ui/Loading';
import { Button } from '../../components/ui/Button';
import { publicApi } from '../../services/publicApi';
import type { NGOPublicProfile, NGOPublicCourse } from '../../types/public';

const COVER_PLACEHOLDER = 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200';
const LOGO_PLACEHOLDER = 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=400';

export function NGOPublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<NGOPublicProfile | null>(null);
  const [courses, setCourses] = useState<NGOPublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await publicApi.getNGOProfile(slug);
        if (active) {
          setProfile(data.profile);
          setCourses(data.courses);
        }
      } catch (err) {
        const e = err as { message?: string };
        if (active) setError(e?.message || 'NGO not found');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-3xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
          <h1 className="mt-4 text-2xl font-bold text-ink-900">NGO Not Found</h1>
          <p className="mt-2 text-ink-500">{error || 'The organization you are looking for does not exist.'}</p>
          <Link to="/">
            <Button variant="primary" className="mt-6" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = profile.verificationStatus === 'approved';

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        {/* Cover */}
        <div className="relative h-56 overflow-hidden sm:h-72">
          <img
            src={profile.coverImage || COVER_PLACEHOLDER}
            alt={profile.ngoName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-ink-900/10" />
        </div>

        {/* Profile header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-16 flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:flex-row sm:items-end sm:p-8">
            {/* Logo */}
            <div className="shrink-0">
              {profile.logo ? (
                <img
                  src={profile.logo || LOGO_PLACEHOLDER}
                  alt={profile.ngoName}
                  className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-soft sm:h-28 sm:w-28"
                />
              ) : (
                <span className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 text-3xl font-extrabold text-white shadow-soft ring-4 ring-white sm:h-28 sm:w-28">
                  {profile.ngoName.charAt(0)}
                </span>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{profile.ngoName}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
                {profile.city && profile.state && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.city}, {profile.state}
                  </span>
                )}
                {profile.establishedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Est. {profile.establishedYear}
                  </span>
                )}
                {profile.registrationNumber && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    Reg: {profile.registrationNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-900">{profile.activeCourses}</p>
                <p className="text-xs font-medium text-ink-400">Active Programs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-900">{profile.studentsTrained || 0}</p>
                <p className="text-xs font-medium text-ink-400">Students Trained</p>
              </div>
            </div>
          </div>

          {/* Content grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-6 lg:col-span-2">
              {/* About */}
              {profile.description && (
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                  <h2 className="text-lg font-bold text-ink-900">About</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{profile.description}</p>
                </section>
              )}

              {/* Mission */}
              {profile.mission && (
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                    <Target className="h-5 w-5 text-brand-500" />
                    Our Mission
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{profile.mission}</p>
                </section>
              )}

              {/* Vision */}
              {profile.vision && (
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                    <Eye className="h-5 w-5 text-teal-500" />
                    Our Vision
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{profile.vision}</p>
                </section>
              )}

              {/* Published Courses */}
              <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                    <BookOpen className="h-5 w-5 text-brand-500" />
                    Published Programs
                  </h2>
                  <span className="text-sm font-semibold text-ink-400">{courses.length} programs</span>
                </div>

                {courses.length === 0 ? (
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl bg-ink-50 p-10 text-center">
                    <BookOpen className="h-8 w-8 text-ink-300" />
                    <p className="text-sm font-semibold text-ink-500">No active programs right now</p>
                    <p className="text-xs text-ink-400">Check back later for new opportunities from this NGO.</p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {courses.map((c) => {
                      const daysLeft = Math.ceil((new Date(c.schedule.applicationEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const isFull = c.availableSeats <= 0;
                      return (
                        <Link
                          key={c._id}
                          to={`/courses/${c.slug}`}
                          className="group flex flex-col rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-card hover:ring-brand-200"
                        >
                          {c.thumbnail ? (
                            <img src={c.thumbnail} alt={c.title} className="h-32 w-full rounded-xl object-cover" />
                          ) : (
                            <div className="grid h-32 w-full place-items-center rounded-xl bg-gradient-to-br from-brand-100 to-teal-100">
                              <BookOpen className="h-8 w-8 text-brand-300" />
                            </div>
                          )}
                          <h3 className="mt-3 text-sm font-bold text-ink-900 transition-colors group-hover:text-brand-700">
                            {c.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                              {c.category}
                            </span>
                            <span className="rounded-lg bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
                              {c.mode}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-ink-500">
                              {isFull ? 'Batch Full' : `${c.availableSeats} seats left`}
                            </span>
                            <span className={daysLeft <= 3 ? 'font-semibold text-rose-600' : 'text-ink-400'}>
                              {daysLeft > 0 ? `${daysLeft}d left` : 'Closed'}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Contact */}
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
                  <h2 className="text-sm font-bold text-ink-900">Contact Information</h2>
                  <div className="mt-4 space-y-3">
                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-sm text-ink-600 transition-colors hover:text-brand-600">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                          <Mail className="h-4 w-4" />
                        </span>
                        {profile.email}
                      </a>
                    )}
                    {profile.phone && (
                      <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-sm text-ink-600 transition-colors hover:text-brand-600">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                          <Phone className="h-4 w-4" />
                        </span>
                        {profile.phone}
                      </a>
                    )}
                    {profile.address && (
                      <div className="flex items-start gap-3 text-sm text-ink-600">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span>
                          {profile.address}
                          {profile.city && profile.state && <br />}
                          {profile.city && profile.state && `${profile.city}, ${profile.state}`}
                          {profile.pin && ` - ${profile.pin}`}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Sectors */}
                {profile.sectorsFocused && profile.sectorsFocused.length > 0 && (
                  <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
                    <h2 className="text-sm font-bold text-ink-900">Sectors</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.sectorsFocused.map((s) => (
                        <span key={s} className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Social Links
                {profile.socialLinks && Object.values(profile.socialLinks).some((v) => v) && (
                  <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
                    <h2 className="text-sm font-bold text-ink-900">Follow Us</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.socialLinks.website && (
                        <SocialLink href={profile.socialLinks.website} icon={Globe} label="Website" />
                      )}
                      {profile.socialLinks.linkedin && (
                        <SocialLink href={profile.socialLinks.linkedin} icon={Linkedin} label="LinkedIn" />
                      )}
                      {profile.socialLinks.twitter && (
                        <SocialLink href={profile.socialLinks.twitter} icon={Twitter} label="Twitter" />
                      )}
                      {profile.socialLinks.facebook && (
                        <SocialLink href={profile.socialLinks.facebook} icon={Facebook} label="Facebook" />
                      )}
                      {profile.socialLinks.instagram && (
                        <SocialLink href={profile.socialLinks.instagram} icon={Instagram} label="Instagram" />
                      )}
                      {profile.socialLinks.youtube && (
                        <SocialLink href={profile.socialLinks.youtube} icon={Youtube} label="YouTube" />
                      )}
                    </div>
                  </section>
                )}  */}

                {/* CTA */}
                <Link to="/programs">
                  <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-teal-500 p-6 text-center shadow-soft">
                    <Users className="mx-auto h-8 w-8 text-white/80" />
                    <p className="mt-2 text-sm font-semibold text-white">Want to join their programs?</p>
                    <p className="mt-1 text-xs text-brand-100">Browse all available programs and apply today.</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      Browse Programs
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// function SocialLink({ href, icon: Icon, label }: { href: string; icon: typeof Globe; label: string }) {
//   return (
//     <a
//       href={href}
//       target="_blank"
//       rel="noopener noreferrer"
//       aria-label={label}
//       className="grid h-10 w-10 place-items-center rounded-xl bg-ink-50 text-ink-500 ring-1 ring-ink-200 transition-all hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-200"
//     >
//       <Icon className="h-5 w-5" />
//     </a>
//   );
// }