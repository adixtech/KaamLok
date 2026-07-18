import { StudentLayout } from '../../components/student/StudentLayout';
import { Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function StudentCertificatesPage() {
  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Certificates</h1>
        <p className="mt-1 text-sm text-ink-500">Your earned certificates from completed programs.</p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-16 text-center ring-1 ring-ink-200">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-amber-50">
          <Award className="h-8 w-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink-900">Certificate Wallet</h2>
          <p className="mt-2 text-sm text-ink-500 max-w-sm mx-auto">
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
        <div className="mt-2 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200 max-w-md text-left">
          <p className="text-xs font-semibold text-ink-700 mb-1">Coming Soon</p>
          <ul className="text-xs text-ink-500 space-y-1">
            <li>• Download certificates as PDF</li>
            <li>• QR code verification</li>
            <li>• Share on LinkedIn</li>
            <li>• NSDC / Government recognized certificates</li>
          </ul>
        </div>
      </div>
    </StudentLayout>
  );
}
