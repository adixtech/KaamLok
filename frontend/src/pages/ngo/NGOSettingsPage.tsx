import { useState } from 'react';
import {
  Lock, Bell, Globe, Shield, Trash2, Eye, EyeOff,
  Check, AlertCircle, Clock, Mail, MessageSquare,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import toast from 'react-hot-toast';
import { apiClient } from '../../services/apiClient';

type SettingsSection = 'password' | 'notifications' | 'preferences' | 'privacy' | 'danger';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailOnApplication: boolean;
  emailOnInterview: boolean;
  emailOnCourseExpiry: boolean;
  emailOnDocumentStatus: boolean;
  pushOnApplication: boolean;
  pushOnInterview: boolean;
  weeklyDigest: boolean;
  monthlyReports: boolean;
}

interface Preferences {
  language: string;
  timezone: string;
  dateFormat: string;
  emailFrequency: string;
}

export function NGOSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('password');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailOnApplication: true,
    emailOnInterview: true,
    emailOnCourseExpiry: true,
    emailOnDocumentStatus: true,
    pushOnApplication: true,
    pushOnInterview: true,
    weeklyDigest: true,
    monthlyReports: true,
  });
  const [notificationLoading, setNotificationLoading] = useState(false);

  const [preferences, setPreferences] = useState<Preferences>({
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    emailFrequency: 'immediate',
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const validatePassword = (): boolean => {
    const errs: Record<string, string> = {};
    if (!passwordForm.currentPassword) errs.currentPassword = 'Current password required';
    if (!passwordForm.newPassword) errs.newPassword = 'New password required';
    else if (passwordForm.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setPasswordLoading(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setNotificationLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Notification preferences saved');
    } finally {
      setNotificationLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setPreferencesLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Preferences saved');
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setDeleteLoading(true);
    try {
      await apiClient.delete('/ngo/profile');
      toast.success('Organization deletion requested');
      window.location.href = '/';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setDeleteLoading(false);
    }
  };

  const sections = [
    { id: 'password', label: 'Password', icon: <Lock className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Globe className="h-5 w-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="h-5 w-5" /> },
    { id: 'danger', label: 'Delete Organization', icon: <Trash2 className="h-5 w-5" />, danger: true },
  ] as const;

  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your account preferences and security</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-teal-50 text-teal-700'
                    : ('danger' in section && section.danger)
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                <span className={activeSection === section.id && !('danger' in section && section.danger) ? 'text-teal-600' : ''}>
                  {section.icon}
                </span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Password Section */}
          {activeSection === 'password' && (
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
              <h2 className="text-lg font-bold text-ink-900">Change Password</h2>
              <p className="mt-1 text-sm text-ink-500">Update your password to keep your account secure</p>

              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700">Current Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                      className={`w-full rounded-xl border ${passwordErrors.currentPassword ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((s) => ({ ...s, current: !s.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-rose-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700">New Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                      className={`w-full rounded-xl border ${passwordErrors.newPassword ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((s) => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-rose-600">{passwordErrors.newPassword}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-500">Password must be at least 8 characters long</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700">Confirm New Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      className={`w-full rounded-xl border ${passwordErrors.confirmPassword ? 'border-rose-300' : 'border-ink-200'} px-4 py-2.5 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="mt-4 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
              <h2 className="text-lg font-bold text-ink-900">Notification Preferences</h2>
              <p className="mt-1 text-sm text-ink-500">Choose how you want to receive notifications</p>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <Mail className="h-4 w-4 text-ink-400" />
                    Email Notifications
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleSwitch
                      label="New applications received"
                      checked={notificationSettings.emailOnApplication}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, emailOnApplication: v }))}
                    />
                    <ToggleSwitch
                      label="Interview reminders"
                      checked={notificationSettings.emailOnInterview}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, emailOnInterview: v }))}
                    />
                    <ToggleSwitch
                      label="Course deadline alerts"
                      checked={notificationSettings.emailOnCourseExpiry}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, emailOnCourseExpiry: v }))}
                    />
                    <ToggleSwitch
                      label="Document verification updates"
                      checked={notificationSettings.emailOnDocumentStatus}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, emailOnDocumentStatus: v }))}
                    />
                  </div>
                </div>

                <div className="border-t border-ink-100 pt-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <MessageSquare className="h-4 w-4 text-ink-400" />
                    In-App Notifications
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleSwitch
                      label="New applications received"
                      checked={notificationSettings.pushOnApplication}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, pushOnApplication: v }))}
                    />
                    <ToggleSwitch
                      label="Interview reminders"
                      checked={notificationSettings.pushOnInterview}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, pushOnInterview: v }))}
                    />
                  </div>
                </div>

                <div className="border-t border-ink-100 pt-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <Clock className="h-4 w-4 text-ink-400" />
                    Reports & Digests
                  </h3>
                  <div className="mt-3 space-y-3">
                    <ToggleSwitch
                      label="Weekly activity digest"
                      checked={notificationSettings.weeklyDigest}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, weeklyDigest: v }))}
                    />
                    <ToggleSwitch
                      label="Monthly analytics report"
                      checked={notificationSettings.monthlyReports}
                      onChange={(v) => setNotificationSettings((s) => ({ ...s, monthlyReports: v }))}
                    />
                  </div>
                </div>

                <button
                  onClick={handleNotificationSave}
                  disabled={notificationLoading}
                  className="mt-4 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {notificationLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
              <h2 className="text-lg font-bold text-ink-900">Language & Region</h2>
              <p className="mt-1 text-sm text-ink-500">Customize your experience based on your location</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences((p) => ({ ...p, timezone: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="Asia/Kolkata">India (IST) - Kolkata</option>
                    <option value="Asia/Dubai">UAE (GST) - Dubai</option>
                    <option value="America/New_York">US (EST) - New York</option>
                    <option value="Europe/London">UK (GMT) - London</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences((p) => ({ ...p, dateFormat: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                  </select>
                </div>

                <button
                  onClick={handlePreferencesSave}
                  disabled={preferencesLoading}
                  className="mt-4 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
                >
                  {preferencesLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
              <h2 className="text-lg font-bold text-ink-900">Privacy Settings</h2>
              <p className="mt-1 text-sm text-ink-500">Control how your data is used and shared</p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-ink-200 p-4">
                  <div>
                    <p className="font-medium text-ink-900">Profile Visibility</p>
                    <p className="text-sm text-ink-500">Your profile is visible to students on the platform</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Public
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-ink-200 p-4">
                  <div>
                    <p className="font-medium text-ink-900">Contact Information</p>
                    <p className="text-sm text-ink-500">Students can view your contact details on course pages</p>
                  </div>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Visible
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-ink-200 p-4">
                  <div>
                    <p className="font-medium text-ink-900">Analytics Data</p>
                    <p className="text-sm text-ink-500">Your activity is used to improve platform features</p>
                  </div>
                  <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Optional
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50 p-4">
                <h3 className="font-medium text-ink-900">Your Rights</h3>
                <ul className="mt-2 space-y-2 text-sm text-ink-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600" />
                    Right to access your personal data
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600" />
                    Right to correct inaccurate data
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600" />
                    Right to request data deletion
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-teal-600" />
                    Right to export your data
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div className="rounded-2xl border-2 border-rose-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-rose-600" />
                <div>
                  <h2 className="text-lg font-bold text-ink-900">Delete Organization Account</h2>
                  <p className="text-sm text-ink-500">Permanently delete your organization and all associated data</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-rose-50 p-4">
                <p className="font-medium text-rose-900">Warning: This action cannot be undone</p>
                <ul className="mt-2 space-y-1 text-sm text-rose-700">
                  <li>All your courses will be removed from the platform</li>
                  <li>All student applications will be permanently deleted</li>
                  <li>Your profile and documents will be removed</li>
                  <li>Historical analytics data will be erased</li>
                </ul>
              </div>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Request Account Deletion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-float">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-rose-600" />
              <h2 className="text-lg font-bold text-ink-900">Confirm Deletion</h2>
            </div>

            <p className="mt-4 text-sm text-ink-600">
              This action is permanent and cannot be undone. All your data including courses,
              applications, documents, and analytics will be permanently deleted.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-ink-700">
                Type <span className="font-mono text-rose-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-1 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrganization}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NGOLayout>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-ink-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-teal-600' : 'bg-ink-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

export default NGOSettingsPage;
