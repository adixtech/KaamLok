import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/ui/Input';
import { PasswordStrength } from '../../components/ui/PasswordStrength';
import { OTPInput } from '../../components/ui/OTPInput';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Loading';
import { authService } from '../../services/authService';
import { useCountdown } from '../../hooks/useCountdown';

type Step = 'otp' | 'password' | 'done';
type Form = { password: string; confirmPassword: string };

export function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const { seconds, active, start } = useCountdown(300);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({ mode: 'onTouched' });
  const pwd = watch('password', '');

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError(true);
      toast.error('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    setOtpError(false);
    try {
      const res = await authService.verifyResetOTP(email, otp);
      setResetToken(res.token);
      setStep('password');
      toast.success('OTP verified. Set a new password.');
    } catch (err) {
      const e = err as { message: string };
      setOtpError(true);
      toast.error(e.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = handleSubmit(async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, data.password);
      setStep('done');
      toast.success('Password reset successfully!');
    } catch (err) {
      const e = err as { message: string };
      toast.error(e.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  });

  if (step === 'done') {
    return (
      <AuthLayout side="reset" title="Password updated" showBack backTo="/login" backLabel="Back to login">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h3 className="mt-5 text-xl font-bold text-ink-900">All set!</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-500 text-pretty">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Button full className="mt-6" onClick={() => navigate('/login')}>
            Continue to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      side="reset"
      title={step === 'otp' ? 'Verify your identity' : 'Create new password'}
      subtitle={
        step === 'otp' ? (
          <>Enter the 6-digit code sent to <span className="font-semibold text-ink-700">{email}</span></>
        ) : (
          'Choose a strong password you haven\'t used before.'
        )
      }
      showBack
      backTo="/forgot-password"
      backLabel="Back"
    >
      {step === 'otp' && (
        <div className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} error={otpError} disabled={loading} />
          <div className="text-center">
            {active ? (
              <p className="text-sm font-medium text-ink-500">
                Code expires in{' '}
                <span className="font-bold text-ink-700 tabular-nums">
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
                </span>
              </p>
            ) : (
              <button
                onClick={() => {
                  authService.forgotPassword(email).then(() => start(300));
                }}
                className="text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                Resend code
              </button>
            )}
          </div>
          <Button full size="lg" onClick={verifyOtp} disabled={loading || otp.length !== 6}>
            {loading ? <><Spinner /> Verifying...</> : <><ShieldCheck className="h-5 w-5" /> Verify Code</>}
          </Button>
        </div>
      )}

      {step === 'password' && (
        <form onSubmit={submitPassword} className="space-y-4" noValidate>
          <PasswordInput
            label="New Password"
            placeholder="Create a strong password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
              validate: {
                upper: (v) => /[A-Z]/.test(v) || 'Add an uppercase letter',
                number: (v) => /\d/.test(v) || 'Add a number',
                special: (v) => /[^A-Za-z0-9]/.test(v) || 'Add a special character',
              },
            })}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrength password={password || pwd} />
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === pwd || 'Passwords do not match',
            })}
          />
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? <><Spinner /> Updating...</> : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
