import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, RotateCw, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OTPInput } from '../../components/ui/OTPInput';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';
import { useCountdown } from '../../hooks/useCountdown';

export function VerifyOTP() {
  const location = useLocation();
  const email = location.state?.email || '';
  const role = location.state?.role || 'student';
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(false);
  const { seconds, active, start } = useCountdown(300); // 5 minutes

  if (!email) {
    return (
      <AuthLayout side="otp" title="No email provided" showBack backTo="/get-started">
        <p className="text-sm text-ink-500">
          We couldn't find an email to verify. Please go back and register again.
        </p>
        <Button full className="mt-4" onClick={() => navigate('/get-started')}>
          Back to Get Started
        </Button>
      </AuthLayout>
    );
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError(true);
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const user = await verifyOTP(email, otp);
      toast.success('Email verified successfully!');
      const home =
        user.role === 'ngo' && user.verificationStatus !== 'approved'
          ? '/ngo/pending'
          : `/${user.role}/dashboard`;
      navigate(home);
    } catch (err) {
      const e = err as { message: string };
      setError(true);
      toast.error(e.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP(email);
      toast.success('A new OTP has been sent to your email');
      start(300);
    } catch (err) {
      const e = err as { message: string };
      toast.error(e.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <AuthLayout
      side="otp"
      title="Verify your email"
      subtitle={
        <>
          Enter the 6-digit code we sent to{' '}
          <span className="font-semibold text-ink-700">{email}</span>
        </>
      }
      showBack
      backTo={role === 'ngo' ? '/register/ngo' : '/register/student'}
      backLabel="Back"
    >
      <div className="space-y-6">
        {/* Email badge */}
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 ring-1 ring-inset ring-brand-100">
          <Mail className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-medium text-brand-700">{email}</span>
        </div>

        {/* OTP boxes */}
        <OTPInput value={otp} onChange={setOtp} error={error} disabled={loading} />

        {/* Timer */}
        <div className="text-center">
          {active ? (
            <p className="text-sm font-medium text-ink-500">
              Code expires in{' '}
              <span className="font-bold text-ink-700 tabular-nums">
                {mm}:{ss}
              </span>
            </p>
          ) : (
            <p className="text-sm font-medium text-rose-600">Your code has expired</p>
          )}
        </div>

        {/* Verify */}
        <Button full size="lg" onClick={handleVerify} disabled={loading || otp.length !== 6}>
          {loading ? (
            <>
              <Spinner /> Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              Verify Email
            </>
          )}
        </Button>

        {/* Resend */}
        <div className="text-center text-sm font-medium text-ink-500">
          Didn't receive the code?{' '}
          {active ? (
            <span className="text-ink-400">Resend available in {ss}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 disabled:opacity-60"
            >
              {resending ? <Spinner className="h-3.5 w-3.5" /> : <RotateCw className="h-3.5 w-3.5" />}
              Resend OTP
            </button>
          )}
        </div>

        <p className="text-center text-xs text-ink-400">
          Wrong email?{' '}
          <Link to={role === 'ngo' ? '/register/ngo' : '/register/student'} className="font-semibold text-brand-600 hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
