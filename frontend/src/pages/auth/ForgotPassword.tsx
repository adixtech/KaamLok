import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Loading';
import { authService } from '../../services/authService';

type Form = { email: string };

export function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ mode: 'onTouched' });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      toast.success('Reset OTP sent to your email');
      navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const e = err as { message: string };
      toast.error(e.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout
      side="forgot"
      title="Forgot your password?"
      subtitle="Enter your registered email and we'll send you a one-time code to reset it."
      showBack
      backTo="/login"
      backLabel="Back to login"
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-100">
          <p className="text-sm leading-relaxed text-amber-800 text-pretty">
            We'll send a 6-digit verification code to your email. The code expires in 5 minutes.
          </p>
        </div>

        <Input
          label="Registered Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
          })}
        />

        <Button type="submit" full size="lg" disabled={loading} iconRight={<ArrowRight className="h-5 w-5" />}>
          {loading ? (
            <>
              <Spinner /> Sending OTP...
            </>
          ) : (
            'Send Reset Code'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
