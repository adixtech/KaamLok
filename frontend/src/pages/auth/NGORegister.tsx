import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Phone, Building2, Globe, MapPin, FileText, Lock } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Input, PasswordInput } from '../../components/ui/Input';
import { PasswordStrength } from '../../components/ui/PasswordStrength';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';
import type { NGORegisterPayload } from '../../types/auth';

type RegisterForm = NGORegisterPayload & { confirmPassword: string };

const indianStates = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Karnataka', 'Maharashtra', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Kerala',
];

export function NGORegister() {
  const { registerNGO } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [password, setPassword] = useState('');
  // const submitted = false;

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
      const result = await registerNGO(data);
      toast.success("OTP sent successfully!");
      navigate("/verify-otp", {state: {email: result.email,role: "ngo"},});
    } catch (err) {
      const e = err as { message: string };
      toast.error(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  });

/*   if (submitted) {
    return (
      <AuthLayout
        side="ngo"
        title="Registration received"
        showBack
        backTo="/get-started"
        backLabel="Back to Get Started"
      >
        <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-inset ring-ink-200/50">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200">
            <Clock className="h-8 w-8" />
          </span>
          <h3 className="mt-5 text-xl font-bold text-ink-900">Pending Verification</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-500 text-pretty">
            Our team will verify your NGO before granting dashboard access. This usually takes
            2–3 business days. You'll receive an email once your account is approved.
          </p>
          <div className="mt-6 space-y-2.5 text-left">
            {[
              'NGO registration number validated',
              'Official email verified',
              'CSR funding eligibility confirmed',
              'Dashboard access granted',
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl bg-ink-50 p-3">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                    i === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-ink-200 text-ink-400'
                  }`}
                >
                  {i === 0 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`text-sm font-medium ${i === 0 ? 'text-ink-700' : 'text-ink-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <Button
            full
            className="mt-6"
            onClick={() => navigate('/login')}
          >
            Proceed to Login
          </Button>
        </div>
      </AuthLayout>
    );
  } */

  return (
    <AuthLayout
      side="ngo"
      title="Register your NGO"
      subtitle="List your free programs and reach verified students across India."
      showBack
      backTo="/get-started"
      backLabel="Back to Get Started"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="NGO Name"
          placeholder="Pratham Education Foundation"
          icon={<Building2 className="h-4 w-4" />}
          error={errors.ngoName?.message}
          {...register('ngoName', { required: 'NGO name is required' })}
        />

        <Input
          label="Registration Number"
          placeholder="E/12345/RJ/2018"
          icon={<FileText className="h-4 w-4" />}
          error={errors.registrationNumber?.message}
          {...register('registrationNumber', { required: 'Registration number is required' })}
        />

        <Input
          label="Official Email"
          type="email"
          placeholder="contact@yourngo.org"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
          })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contact Number"
            type="tel"
            placeholder="98765 43210"
            icon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Contact number is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit number' },
            })}
          />
          <Input
            label="Website"
            placeholder="yourngo.org"
            icon={<Globe className="h-4 w-4" />}
            error={errors.website?.message}
            {...register('website', {
              pattern: { value: /^(https?:\/\/)?[\w-]+(\.[\w-]+)+.*$/, message: 'Enter a valid URL' },
            })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City"
            placeholder="Mumbai"
            icon={<MapPin className="h-4 w-4" />}
            error={errors.city?.message}
            {...register('city', { required: 'City is required' })}
          />
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
                <option value="">Select</option>
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
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Description</label>
          <textarea
            rows={3}
            placeholder="Briefly describe your NGO's mission and the programs you offer..."
            className={`w-full rounded-2xl border bg-ink-50/60 px-4 py-3.5 text-sm font-medium text-ink-800 transition-colors placeholder:text-ink-400 focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-rose-300 focus:ring-rose-100'
                : 'border-ink-200 focus:border-brand-400 focus:bg-white focus:ring-brand-100'
            }`}
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 30, message: 'At least 30 characters' },
            })}
          />
          {errors.description && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.description.message}</p>}
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

        <Checkbox
          id="ngo-terms"
          checked={acceptTerms}
          onChange={(c) => {
            setAcceptTerms(c);
            if (c) setTermsError(false);
          }}
          label={
            <>
              I confirm our NGO is legally registered and agree to KaamLok's{' '}
              <Link to="/" className="font-semibold text-brand-600 hover:underline">Terms</Link> and{' '}
              <Link to="/" className="font-semibold text-brand-600 hover:underline">Privacy Policy</Link>.
            </>
          }
          error={termsError ? 'Please accept the terms to continue' : undefined}
        />

        <Button type="submit" full size="lg" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Submitting registration...
            </>
          ) : (
            'Register NGO'
          )}
        </Button>

        <p className="text-center text-sm font-medium text-ink-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
