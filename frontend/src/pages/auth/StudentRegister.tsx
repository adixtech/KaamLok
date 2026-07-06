import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Phone, User, MapPin, GraduationCap, Lock } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Input, PasswordInput } from '../../components/ui/Input';
import { PasswordStrength } from '../../components/ui/PasswordStrength';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';
import type { StudentRegisterPayload } from '../../types/auth';

type RegisterForm = StudentRegisterPayload & { confirmPassword: string };

const educationOptions = ['10th Pass', '12th Pass', 'Graduate', 'Diploma'];
const indianStates = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Karnataka', 'Maharashtra', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Kerala',
];

export function StudentRegister() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({ mode: 'onTouched' });

  const pwd = watch('password', '');

  const onSubmit = handleSubmit(async (data) => {
    if (!acceptTerms) {
      setTermsError(true);
      return;
    }
    setLoading(true);
    try {
      const res = await registerStudent(data);
      toast.success('Account created! Check your email for the OTP.');
      navigate('/verify-otp', { state: { email: res.email, role: 'student' } });
    } catch (err) {
      const e = err as { message: string; field?: string };
      toast.error(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout
      side="student"
      title="Create your student account"
      subtitle="It's 100% free. Discover verified programs and start your career journey today."
      showBack
      backTo="/get-started"
      backLabel="Back to Get Started"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Priya"
            icon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />
          <Input
            label="Last Name"
            placeholder="Sharma"
            error={errors.lastName?.message}
            {...register('lastName', { required: 'Last name is required' })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="priya@example.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
          })}
        />

        <Input
          label="Mobile Number"
          type="tel"
          placeholder="98765 43210"
          icon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Mobile number is required',
            pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile' },
          })}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Education</label>
            <div className="relative">
              <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <select
                className={`w-full appearance-none rounded-2xl border bg-ink-50/60 py-3.5 pl-11 pr-8 text-sm font-medium text-ink-800 transition-colors focus:outline-none focus:ring-2 ${
                  errors.education
                    ? 'border-rose-300 focus:ring-rose-100'
                    : 'border-ink-200 focus:border-brand-400 focus:bg-white focus:ring-brand-100'
                }`}
                {...register('education', { required: 'Select your education' })}
              >
                <option value="">Select</option>
                {educationOptions.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="none">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {errors.education && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.education.message}</p>}
          </div>

          <Input
            label="City"
            placeholder="Jaipur"
            icon={<MapPin className="h-4 w-4" />}
            error={errors.city?.message}
            {...register('city', { required: 'City is required' })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">State</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <select
              className={`w-full appearance-none rounded-2xl border bg-ink-50/60 py-3.5 pl-11 pr-8 text-sm font-medium text-ink-800 transition-colors focus:outline-none focus:ring-2 ${
                errors.state
                  ? 'border-rose-300 focus:ring-rose-100'
                  : 'border-ink-200 focus:border-brand-400 focus:bg-white focus:ring-brand-100'
              }`}
              {...register('state', { required: 'Select your state' })}
            >
              <option value="">Select state</option>
              {indianStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 20 20" fill="none">
              <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {errors.state && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.state.message}</p>}
        </div>

        <PasswordInput
          label="Password"
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
          onChange={(e) => {
            setPassword(e.target.value);
          }}
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

        <Checkbox
          id="student-terms"
          checked={acceptTerms}
          onChange={(c) => {
            setAcceptTerms(c);
            if (c) setTermsError(false);
          }}
          label={
            <>
              I agree to KaamLok's{' '}
              <Link to="/" className="font-semibold text-brand-600 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/" className="font-semibold text-brand-600 hover:underline">Privacy Policy</Link>.
            </>
          }
          error={termsError ? 'Please accept the terms to continue' : undefined}
        />

        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Creating your account...
            </>
          ) : (
            'Create Student Account'
          )}
        </Button>

        <p className="text-center text-sm font-medium text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
