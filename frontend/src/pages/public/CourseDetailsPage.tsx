import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Award,
  Briefcase,
  Phone,
  Mail,
  AlertCircle,
  Send,
  FileText,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { publicApi } from '../../services/publicApi';
import type { FullCourse, StudentApplication } from '../../types/public';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { Navbar } from '../../components/sections/Navbar';
import { Footer, FinalCTA } from '../../components/sections/Footer';

const PLACEHOLDER_THUMBNAIL = 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1200';

const STATUS_FLOW: { status: string; label: string; icon: typeof CheckCircle2 }[] = [
  { status: 'pending', label: 'Application Submitted', icon: Send },
  { status: 'under_review', label: 'Under Review', icon: FileText },
  { status: 'shortlisted', label: 'Shortlisted', icon: CheckCircle2 },
  { status: 'interview_scheduled', label: 'Interview Scheduled', icon: CalendarClock },
  { status: 'selected', label: 'Selected', icon: Award },
  { status: 'rejected', label: 'Not Selected', icon: AlertCircle },
  { status: 'waitlisted', label: 'Waitlisted', icon: Users },
];

export function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const [course, setCourse] = useState<FullCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { course: data } = await publicApi.getCourseBySlug(slug);
        if (active) setCourse(data);
      } catch (err) {
        const e = err as { message?: string };
        if (active) setError(e?.message || 'Course not found');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug]);

  // Check application status for students
  useEffect(() => {
    if (!isStudent || !course?._id) return;
    let active = true;
    (async () => {
      try {
        const { application: app } = await publicApi.getApplicationStatus(course._id);
        if (active) setApplication(app);
      } catch {
        // Not applied yet — that's fine
      } finally {
      }
    })();
    return () => { active = false; };
  }, [isStudent, course?._id]);

  const handleApply = async () => {
    if (!course?._id) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { redirect: `/courses/${slug}` } });
      return;
    }
    if (!isStudent) {
      navigate('/get-started', { state: { redirect: `/courses/${slug}` } });
      return;
    }
    try {
      setSubmitting(true);
      const result = await publicApi.applyToCourse(course._id, { message: applyMessage.trim() || undefined });
      toast.success(result.message);
      setApplication(result.application);
      setApplyMessage('');
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="h-80 rounded-3xl" />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-3xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Course Not Found</h1>
          <p className="mt-2 text-ink-500">{error || 'The course you are looking for does not exist or has been removed.'}</p>
          <Link to="/programs">
            <Button variant="primary" className="mt-6" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Programs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(course.schedule.applicationEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isFull = course.availableSeats <= 0;
  const isClosed = daysLeft < 0;
  const isVerified = course.ngoVerificationStatus === 'approved';
  const isFree = course.benefits?.includes('free_training') ?? true;

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        {/* Banner */}
        <div className="relative h-72 overflow-hidden sm:h-80 lg:h-96">
          <img
            src={course.banner || course.thumbnail || PLACEHOLDER_THUMBNAIL}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-ink-900/10" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
              <Link to="/programs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Programs
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 backdrop-blur">
                  {course.category}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified NGO
                  </span>
                )}
                {isFree && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    Free
                  </span>
                )}
              </div>
              <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
                {course.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  By <span className="font-semibold text-white">{course.ngoName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {course.applicationsCount} applied
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Short description */}
              <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                <h2 className="text-xl font-bold text-ink-900">About this program</h2>
                <p className="mt-3 text-base leading-relaxed text-ink-600">
                  {course.shortDescription || course.description}
                </p>
                {course.description && course.description !== course.shortDescription && (
                  <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink-500">
                    {course.description.split('\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
              </section>

              {/* Key details */}
              <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                <h2 className="text-xl font-bold text-ink-900">Program Details</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Detail icon={GraduationCap} label="Difficulty" value={course.difficulty} />
                  <Detail icon={Globe} label="Language" value={course.language} />
                  <Detail icon={Clock} label="Duration" value={course.schedule.duration || 'Flexible'} />
                  <Detail icon={CalendarClock} label="Training Starts" value={new Date(course.schedule.trainingStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <Detail icon={MapPin} label="Mode" value={course.mode === 'online' ? 'Online' : course.mode === 'offline' ? 'In-Person' : 'Hybrid'} />
                  <Detail icon={Users} label="Seats" value={`${course.totalSeats} total · ${course.availableSeats} left`} />
                </div>

                {/* Training days */}
                {course.schedule.trainingDays?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-ink-700">Training Days</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {course.schedule.trainingDays.map((d) => (
                        <span key={d} className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location for offline/hybrid */}
                {course.mode !== 'online' && course.offlineDetails && (
                  <div className="mt-5 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                      <MapPin className="h-4 w-4 text-brand-500" />
                      Training Location
                    </p>
                    <p className="mt-1 text-sm text-ink-600">
                      {course.offlineDetails.trainingCenter}<br />
                      {course.offlineDetails.address}, {course.offlineDetails.city}, {course.offlineDetails.state} - {course.offlineDetails.pin}
                    </p>
                  </div>
                )}
              </section>

              {/* Eligibility */}
              {course.eligibility && (
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                  <h2 className="text-xl font-bold text-ink-900">Eligibility Criteria</h2>
                  <div className="mt-5 space-y-3">
                    {course.eligibility.ageMin != null && (
                      <EligibilityRow label="Age" value={`${course.eligibility.ageMin} - ${course.eligibility.ageMax || 99} years`} />
                    )}
                    {course.eligibility.gender && (
                      <EligibilityRow label="Gender" value={course.eligibility.gender} />
                    )}
                    {course.eligibility.education && (
                      <EligibilityRow label="Education" value={course.eligibility.education} />
                    )}
                    {course.eligibility.experience && (
                      <EligibilityRow label="Experience" value={course.eligibility.experience} />
                    )}
                    {course.eligibility.requiredSkills?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-ink-700">Required Skills</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {course.eligibility.requiredSkills.map((s) => (
                            <span key={s} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {course.eligibility.preferredSkills?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-ink-700">Preferred Skills</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {course.eligibility.preferredSkills.map((s) => (
                            <span key={s} className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {course.eligibility.requiredDocuments?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-ink-700">Required Documents</p>
                        <ul className="mt-2 space-y-1">
                          {course.eligibility.requiredDocuments.map((d) => (
                            <li key={d} className="flex items-center gap-2 text-sm text-ink-600">
                              <CheckCircle2 className="h-4 w-4 text-brand-500" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Benefits */}
              {course.benefits?.length > 0 && (
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                  <h2 className="text-xl font-bold text-ink-900">What You'll Get</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {course.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-ink-600">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <span className="capitalize">{b.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Placement */}
              {course.placement && (
                <section className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                  <h2 className="text-xl font-bold text-ink-900">Placement Support</h2>
                  <div className="mt-5 space-y-3">
                    {course.placement.placementAssistance && (
                      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                        <Briefcase className="h-6 w-6 text-emerald-600" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-700">Placement assistance included</p>
                          {course.placement.placementPercentage != null && (
                            <p className="text-xs text-emerald-600">{course.placement.placementPercentage}% placement rate</p>
                          )}
                          {course.placement.averageSalary && (
                            <p className="text-xs text-emerald-600">Average salary: {course.placement.averageSalary}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {course.placement.hiringPartners?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-ink-700">Hiring Partners</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {course.placement.hiringPartners.map((h) => (
                            <span key={h} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Apply card */}
                <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
                  {/* Already applied */}
                  {application && (
                    <div>
                      <div className="flex items-center gap-2 rounded-2xl bg-brand-50 p-3 ring-1 ring-brand-100">
                        <CheckCircle2 className="h-5 w-5 text-brand-600" />
                        <p className="text-sm font-semibold text-brand-700">Application Submitted</p>
                      </div>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Application Timeline</p>
                      <div className="mt-3 space-y-3">
                        {STATUS_FLOW.filter((s) =>
                          application.statusHistory.some((h) => h.status === s.status)
                        ).map((s) => {
                          const historyEntry = application.statusHistory.find((h) => h.status === s.status);
                          const isCurrent = application.status === s.status;
                          return (
                            <div key={s.status} className={`flex items-start gap-3 ${isCurrent ? '' : 'opacity-50'}`}>
                              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isCurrent ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'}`}>
                                <s.icon className="h-4 w-4" />
                              </span>
                              <div>
                                <p className={`text-sm font-semibold ${isCurrent ? 'text-ink-900' : 'text-ink-500'}`}>{s.label}</p>
                                {historyEntry?.changedAt && (
                                  <p className="text-xs text-ink-400">
                                    {new Date(historyEntry.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                                {historyEntry?.note && (
                                  <p className="text-xs text-ink-400">{historyEntry.note}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Not yet applied */}
                  {!application && (
                    <>
                      {isFull ? (
                        <div className="text-center">
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50">
                            <Users className="h-6 w-6 text-rose-500" />
                          </div>
                          <p className="mt-3 text-lg font-bold text-ink-900">Batch Full</p>
                          <p className="mt-1 text-sm text-ink-500">All seats have been filled for this batch.</p>
                          {course.waitingListEnabled && (
                            <p className="mt-2 text-sm font-semibold text-brand-600">Waitlist is available — apply to join!</p>
                          )}
                        </div>
                      ) : isClosed ? (
                        <div className="text-center">
                          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-100">
                            <CalendarClock className="h-6 w-6 text-ink-400" />
                          </div>
                          <p className="mt-3 text-lg font-bold text-ink-900">Applications Closed</p>
                          <p className="mt-1 text-sm text-ink-500">The application deadline has passed.</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Seats Remaining</p>
                              <p className="mt-1 text-2xl font-bold text-ink-900">{course.availableSeats}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Deadline</p>
                              <p className="mt-1 text-sm font-bold text-rose-600">
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Last day!'}
                              </p>
                            </div>
                          </div>

                          {/* Seats progress */}
                          <div className="mt-4">
                            <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400"
                                style={{ width: `${Math.min((course.filledSeats / course.totalSeats) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Apply message */}
                          {isStudent && (
                            <textarea
                              value={applyMessage}
                              onChange={(e) => setApplyMessage(e.target.value)}
                              placeholder="Add an optional message to the NGO..."
                              rows={3}
                              className="mt-4 w-full rounded-2xl border border-ink-200 bg-ink-50/60 p-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                            />
                          )}

                          <Button
                            variant="primary"
                            size="lg"
                            full
                            className="mt-4"
                            loading={submitting}
                            onClick={handleApply}
                            iconRight={!submitting ? <ArrowRight className="h-5 w-5" /> : undefined}
                          >
                            {!isAuthenticated
                              ? 'Login to Apply'
                              : !isStudent
                                ? 'Register as Student'
                                : 'Apply Now'}
                          </Button>

                          {!isAuthenticated && (
                            <p className="mt-3 text-center text-xs text-ink-400">
                              New to KaamLok?{' '}
                              <Link to="/get-started" className="font-semibold text-brand-600 hover:underline">
                                Create an account
                              </Link>
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* Coordinator contact */}
                  <div className="mt-5 border-t border-ink-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Program Coordinator</p>
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-2 text-sm text-ink-600">
                        <span className="font-semibold text-ink-700">{course.contact.coordinatorName}</span>
                      </p>
                      <a href={`mailto:${course.contact.coordinatorEmail}`} className="flex items-center gap-2 text-sm text-ink-600 transition-colors hover:text-brand-600">
                        <Mail className="h-4 w-4 text-ink-400" />
                        {course.contact.coordinatorEmail}
                      </a>
                      <a href={`tel:${course.contact.coordinatorPhone}`} className="flex items-center gap-2 text-sm text-ink-600 transition-colors hover:text-brand-600">
                        <Phone className="h-4 w-4 text-ink-400" />
                        {course.contact.coordinatorPhone}
                      </a>
                      {course.contact.officeHours && (
                        <p className="flex items-center gap-2 text-xs text-ink-400">
                          <Clock className="h-3.5 w-3.5" />
                          {course.contact.officeHours}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* NGO card */}
                <Link
                  to={course.ngoId ? `/ngos/${course.ngoId}` : '#'}
                  className="block rounded-3xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50 transition-all hover:-translate-y-0.5 hover:shadow-float hover:ring-brand-200"
                >
                  <div className="flex items-center gap-3">
                    {course.ngoLogo ? (
                      <img src={course.ngoLogo} alt={course.ngoName} className="h-12 w-12 rounded-xl object-cover ring-1 ring-ink-200" />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700 ring-1 ring-brand-200">
                        {course.ngoName.charAt(0)}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-bold text-ink-900">{course.ngoName}</p>
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified NGO
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-brand-600">View NGO Profile →</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-800">{value}</p>
      </div>
    </div>
  );
}

function EligibilityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 pb-2">
      <span className="text-sm font-medium text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-800 capitalize">{value.replace(/_/g, ' ')}</span>
    </div>
  );
}
