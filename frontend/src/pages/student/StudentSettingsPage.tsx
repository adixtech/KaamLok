import { useState } from 'react';
import {  Lock, Bell, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/apiClient';

export function StudentSettingsPage() {
  const [tab, setTab] = useState<'password' | 'notifications' | 'privacy' | 'account'>('password');

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwErrors, setPwErrors] = useState<Partial<typeof pwForm>>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    applicationUpdates: true,
    interviewReminders: true,
    trainingReminders: true,
    announcements: true,
    newsletter: false,
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<typeof pwForm> = {};
    if (!pwForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setPwSaving(true);
      await apiClient.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const tabs = [
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'account', label: 'Account', icon: Trash2 },
  ] as const;

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your account settings and preferences.</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${tab === t.key ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50'}`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
        {/* Password */}
        {tab === 'password' && (
          <div className="max-w-md">
            <h2 className="mb-4 font-bold text-ink-900">Change Password</h2>
            {pwSuccess && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">Password changed successfully!</p>
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} error={pwErrors.currentPassword} icon={<Lock className="h-4 w-4" />} />
              <Input label="New Password" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} error={pwErrors.newPassword} icon={<Lock className="h-4 w-4" />} hint="Minimum 8 characters" />
              <Input label="Confirm New Password" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} error={pwErrors.confirmPassword} icon={<Lock className="h-4 w-4" />} />
              <Button type="submit" variant="primary" size="md" loading={pwSaving}>Change Password</Button>
            </form>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <div>
            <h2 className="mb-4 font-bold text-ink-900">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => {
                const labels: Record<string, { label: string; description: string }> = {
                  applicationUpdates: { label: 'Application Updates', description: 'Status changes on your applications' },
                  interviewReminders: { label: 'Interview Reminders', description: 'Reminders before your scheduled interviews' },
                  trainingReminders: { label: 'Training Reminders', description: 'Upcoming training session reminders' },
                  announcements: { label: 'Announcements', description: 'Platform announcements and new features' },
                  newsletter: { label: 'Newsletter', description: 'Weekly newsletter with new programs' },
                };
                const info = labels[key];
                return (
                  <div key={key} className="flex items-center justify-between rounded-xl border border-ink-200 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{info.label}</p>
                      <p className="text-xs text-ink-400">{info.description}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-ink-200'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                );
              })}
              <Button variant="primary" size="md" onClick={() => toast.success('Notification preferences saved!')}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* Privacy */}
        {tab === 'privacy' && (
          <div>
            <h2 className="mb-4 font-bold text-ink-900">Privacy Settings</h2>
            <div className="space-y-4 text-sm text-ink-600">
              <div className="rounded-xl bg-ink-50 p-4">
                <p className="font-semibold text-ink-800 mb-1">Profile Visibility</p>
                <p className="text-ink-500">Your profile is visible to NGOs you apply to. Basic information is used for matching.</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-4">
                <p className="font-semibold text-ink-800 mb-1">Data Usage</p>
                <p className="text-ink-500">Your data is used only for program matching and improving your experience on KaamLok.</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-4">
                <p className="font-semibold text-ink-800 mb-1">Communication</p>
                <p className="text-ink-500">NGOs can contact you regarding your applications through the platform only.</p>
              </div>
            </div>
          </div>
        )}

        {/* Account */}
        {tab === 'account' && (
          <div>
            <h2 className="mb-4 font-bold text-ink-900">Account Management</h2>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <h3 className="flex items-center gap-2 font-bold text-rose-800">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </h3>
              <p className="mt-2 text-sm text-rose-600">
                Once you delete your account, all your data including applications, saved courses, and profile information will be permanently removed. This action cannot be undone.
              </p>
              <Button variant="primary" className="mt-4 !bg-rose-600 hover:!bg-rose-700" size="sm" onClick={() => toast.error('Please contact support at support@kaamlok.in to delete your account.')}>
                Request Account Deletion
              </Button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
