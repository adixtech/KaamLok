import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Navbar } from '../../components/sections/Navbar';
import { Footer } from '../../components/sections/Footer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { publicApi } from '../../services/publicApi';

const SUBJECTS = [
  'General Inquiry',
  'Course Application Help',
  'NGO Partnership',
  'Technical Issue',
  'CSR Partnership',
  'Report a Problem',
  'Other',
];

export function ContactSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    else if (form.message.trim().length < 20) newErrors.message = 'Message must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setServerError(null);
      await publicApi.submitContact(form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      const e = err as { message?: string };
      setServerError(e?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        {/* Header */}
        <div className="border-b border-ink-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">
              Contact <span className="gradient-text">Support</span>
            </h1>
            <p className="mt-2 text-ink-500">
              Have a question or need help? We typically respond within 48 hours.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-5 lg:col-span-1">
              <ContactInfoCard
                icon={Mail}
                title="Email"
                value="support@kaamlok.in"
                href="mailto:support@kaamlok.in"
              />
              <ContactInfoCard
                icon={Phone}
                title="Phone"
                value="+91 98765 43210"
                subtitle="Mon – Fri"
                href="tel:+919876543210"
              />
              <ContactInfoCard
                icon={Clock}
                title="Office Hours"
                value="10:00 AM – 6:00 PM IST"
                subtitle="Monday to Friday"
              />
              <ContactInfoCard
                icon={MapPin}
                title="Address"
                value="KaamLok Foundation"
                subtitle="Mumbai, Maharashtra, India"
              />

              {/* Map Placeholder */}
              <div className="overflow-hidden rounded-3xl ring-1 ring-ink-200">
                <div className="flex h-48 items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50">
                  <div className="text-center">
                    <MapPin className="mx-auto h-10 w-10 text-brand-400" />
                    <p className="mt-2 text-sm font-semibold text-ink-600">Mumbai, Maharashtra</p>
                    <p className="text-xs text-ink-400">Map coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50 sm:p-8">
                {success ? (
                  <div className="flex flex-col items-center gap-5 py-10 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-ink-900">Message Sent!</h2>
                      <p className="mt-2 text-sm text-ink-500">
                        Thank you for reaching out. We'll get back to you within 48 hours.
                      </p>
                    </div>
                    <Button variant="secondary" onClick={() => setSuccess(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-ink-900">Send Us a Message</h2>
                    <p className="mt-1 text-sm text-ink-400">Fill in the form below and we'll get back to you soon.</p>

                    {serverError && (
                      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-100">
                        <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                        <p className="text-sm font-medium text-rose-700">{serverError}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                          label="Your Name"
                          placeholder="Rahul Verma"
                          value={form.name}
                          onChange={handleChange('name')}
                          error={errors.name}
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange('email')}
                          error={errors.email}
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink-700">Subject</label>
                        <select
                          value={form.subject}
                          onChange={handleChange('subject')}
                          className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 py-3.5 px-4 text-sm font-medium text-ink-800 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                        >
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.subject && (
                          <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.subject}</p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-ink-700">Message</label>
                        <textarea
                          value={form.message}
                          onChange={handleChange('message')}
                          placeholder="Describe your question or issue in detail..."
                          rows={6}
                          className={`w-full rounded-2xl border bg-ink-50/60 p-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-2 ${
                            errors.message
                              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                              : 'border-ink-200 focus:border-brand-400 focus:ring-brand-100'
                          }`}
                        />
                        {errors.message ? (
                          <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.message}</p>
                        ) : (
                          <p className="mt-1.5 text-xs text-ink-400">
                            {form.message.length}/5000 characters
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={loading}
                        icon={!loading ? <Send className="h-4 w-4" /> : undefined}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ContactInfoCard({
  icon: Icon,
  title,
  value,
  subtitle,
  href,
}: {
  icon: typeof Mail;
  title: string;
  value: string;
  subtitle?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-200/50 transition-all hover:shadow-float">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</p>
        <p className="text-sm font-semibold text-ink-900">{value}</p>
        {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}
