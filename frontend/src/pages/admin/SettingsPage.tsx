import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, Save, Server } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminButton } from '../../components/admin/AdminButton';
import { AdminSkeleton, ErrorState } from '../../components/admin/AdminLoading';
import { adminApi } from '../../services/adminApi';

type SettingsMap = Record<string, Record<string, boolean>>;

const SECTIONS = [
  { key: 'platform', title: 'Platform Settings', icon: Server, fields: [
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Take the platform offline for maintenance' },
  ]},
  { key: 'email', title: 'Email Settings', icon: Mail, fields: [
    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications to users' },
    { key: 'emailDigest', label: 'Daily Digest', desc: 'Send a daily digest of activities' },
  ]},
  { key: 'security', title: 'Security Settings', icon: ShieldCheck, fields: [
    { key: 'otpRequired', label: 'OTP Required', desc: 'Require OTP for all registrations' },
    { key: 'twoFactorAuth', label: 'Two-Factor Auth', desc: 'Enable 2FA for admin accounts' },
    { key: 'sessionTimeout', label: 'Session Timeout', desc: 'Auto-logout after inactivity' },
  ]},
] as const;

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getSettings()
      .then((data) => setSettings(data.settings as SettingsMap))
      .catch((err) => setError((err as Error)?.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (section: string, field: string) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: !prev[section]?.[field] },
    }));
  };

  const saveSection = async (section: string) => {
    setSaving(section);
    try {
      await adminApi.updateSetting(section, settings[section] as unknown as Record<string, unknown>);
      toast.success('Settings saved');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  if (error) {
    return <AdminLayout><ErrorState message={error} onRetry={() => window.location.reload()} /></AdminLayout>;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
          <p className="mt-1 text-sm text-ink-500">Manage platform configuration</p>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <AdminSkeleton key={i} className="h-48" />)}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage platform configuration</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.key} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">{section.title}</h2>
                </div>
              </div>

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between border-b border-ink-50 pb-4 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{field.label}</p>
                      <p className="text-xs text-ink-500">{field.desc}</p>
                    </div>
                    <ToggleSwitch
                      checked={!!settings[section.key]?.[field.key]}
                      onChange={() => toggle(section.key, field.key)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<Save className="h-4 w-4" />}
                  onClick={() => saveSection(section.key)}
                  disabled={saving === section.key}
                >
                  {saving === section.key ? 'Saving...' : 'Save Changes'}
                </AdminButton>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}
