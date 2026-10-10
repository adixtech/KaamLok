import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Button } from '../../components/ui/Button';
import { studentApi } from '../../services/studentApi';
import type { CertificateItem } from '../../types/student';

export function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentApi.getCertificates();
      setCertificates(data.certificates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Certificates</h1>
        <p className="mt-1 text-sm text-ink-500">Your earned certificates from completed programs.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-16 ring-1 ring-ink-200">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <p className="text-sm text-ink-500">Loading certificates...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm text-rose-600">{error}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={fetchCertificates}>Retry</Button>
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-50">
            <Award className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">No certificates yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
              Certificates you earn after completing training programs will appear here. Complete a program to earn your first certificate.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/student/discover">
              <Button variant="primary" size="sm">Browse Programs</Button>
            </Link>
            <Link to="/student/training">
              <Button variant="secondary" size="sm">My Training</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-600">
              {certificates.length} certificate{certificates.length === 1 ? '' : 's'} earned
            </p>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Print / Save as PDF
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="flex flex-col rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50">
                    <Award className="h-5 w-5 text-amber-500" />
                  </span>
                  {cert.grade && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {cert.grade}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-bold text-ink-900">{cert.courseTitle || 'Course Certificate'}</h3>
                <p className="mt-1 text-sm text-ink-500">{cert.ngoName}</p>
                <p className="mt-1 text-xs text-ink-400">
                  Issued {new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {cert.certificateNumber && (
                  <p className="mt-1 font-mono text-[11px] text-ink-400">{cert.certificateNumber}</p>
                )}

                {cert.skillsAcquired && cert.skillsAcquired.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cert.skillsAcquired.map((skill) => (
                      <span key={skill} className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {cert.course?.slug && (
                  <Link
                    to={`/courses/${cert.course.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    View course <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </StudentLayout>
  );
}
