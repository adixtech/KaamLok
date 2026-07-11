import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Building2, MapPin, Globe, Phone, Calendar, Users, Award, AlertCircle, Save, BookOpen } from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ngoApi } from '../../services/ngoApi';
import type { NGOProfile } from '../../types/ngo';
import { FullScreenLoader } from '../../components/ui/Loading';

export function OrganizationProfilePage() {
  const [profile, setProfile] = useState<NGOProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<NGOProfile>>({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    ngoApi.getProfile()
      .then((data) => {
        setProfile(data.profile);
        setFormData(data.profile);
      })
      .catch((err) => setError(err?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await ngoApi.updateProfile(formData);
      setProfile(result.profile);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof NGOProfile] as Record<string, unknown> || {}), [field]: value },
    }));
  };

  if (loading) return <FullScreenLoader label="Loading profile..." />;
  if (error || !profile) {
    return (
      <NGOLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{error || 'Failed to load profile'}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      </NGOLayout>
    );
  }

  const completion = profile.profileCompletion || 0;

  return (
    <NGOLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Organization Profile</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your NGO's public presence on KaamLok</p>
        </div>
        {!editMode ? (
          <Button variant="primary" onClick={() => setEditMode(true)} className="bg-teal-600 hover:bg-teal-700">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setFormData(profile); setEditMode(false); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving} className="bg-teal-600 hover:bg-teal-700">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Completion Bar */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-700">Profile Completion</p>
            <p className="text-2xl font-extrabold text-ink-900">{completion}%</p>
          </div>
          <div className="flex-1 px-8">
            <div className="h-3 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-brand-600 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          {profile.verificationStatus === 'approved' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Award className="h-3.5 w-3.5" /> Verified NGO
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
              <Building2 className="h-4 w-4 text-teal-600" /> Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Organization Name"
                value={formData.ngoName || ''}
                onChange={(e) => updateField('ngoName', e.target.value)}
                disabled={!editMode}
              />
              <Input
                label="Registration Number"
                value={formData.registrationNumber || ''}
                disabled
              />
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  disabled={!editMode}
                  rows={4}
                  className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 text-sm font-bold text-ink-900">Mission & Vision</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Mission</label>
                <textarea
                  value={formData.mission || ''}
                  onChange={(e) => updateField('mission', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Vision</label>
                <textarea
                  value={formData.vision || ''}
                  onChange={(e) => updateField('vision', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
              <Phone className="h-4 w-4 text-teal-600" /> Contact Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={!editMode}
              />
              <Input
                label="Phone"
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                disabled={!editMode}
              />
              <Input
                label="Alternative Phone"
                value={formData.alternativePhone || ''}
                onChange={(e) => updateField('alternativePhone', e.target.value)}
                disabled={!editMode}
              />
              <Input
                label="Website"
                value={formData.socialLinks?.website || ''}
                onChange={(e) => updateNested('socialLinks', 'website', e.target.value)}
                disabled={!editMode}
              />
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
              <MapPin className="h-4 w-4 text-teal-600" /> Address
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Full Address"
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <Input
                label="City"
                value={formData.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
                disabled={!editMode}
              />
              <Input
                label="State"
                value={formData.state || ''}
                onChange={(e) => updateField('state', e.target.value)}
                disabled={!editMode}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo & Cover */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 text-sm font-bold text-ink-900">Media</h3>
            {profile.coverImage && (
              <img src={profile.coverImage} alt="" className="h-32 w-full rounded-xl object-cover" />
            )}
            <div className="mt-4 flex justify-center">
              {profile.logo ? (
                <img src={profile.logo} alt={profile.ngoName} className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-brand-600 text-2xl font-bold text-white">
                  {profile.ngoName?.[0] || 'N'}
                </div>
              )}
            </div>
            {editMode && (
              <div className="mt-4 space-y-3">
                <Input
                  label="Logo URL"
                  value={formData.logo || ''}
                  onChange={(e) => updateField('logo', e.target.value)}
                  placeholder="https://..."
                />
                <Input
                  label="Cover Image URL"
                  value={formData.coverImage || ''}
                  onChange={(e) => updateField('coverImage', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 text-sm font-bold text-ink-900">Statistics</h3>
            <div className="space-y-4">
              <StatRow icon={<BookOpen className="h-4 w-4" />} label="Total Courses" value={profile.totalCourses || 0} />
              <StatRow icon={<Users className="h-4 w-4" />} label="Students Selected" value={profile.studentsSelected || 0} />
              <StatRow icon={<Calendar className="h-4 w-4" />} label="Year Founded" value={profile.establishedYear || '-'} />
              <StatRow icon={<Award className="h-4 w-4" />} label="Years Active" value={profile.yearsOfExperience || '-'} />
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-900">
              <Globe className="h-4 w-4 text-teal-600" /> Social Links
            </h3>
            <div className="space-y-3">
              {editMode ? (
                <>
                  <Input label="Website" value={formData.socialLinks?.website || ''} onChange={(e) => updateNested('socialLinks', 'website', e.target.value)} placeholder="https://example.org" />
                  <Input label="LinkedIn" value={formData.socialLinks?.linkedin || ''} onChange={(e) => updateNested('socialLinks', 'linkedin', e.target.value)} placeholder="https://linkedin.com/company/..." />
                  <Input label="Twitter" value={formData.socialLinks?.twitter || ''} onChange={(e) => updateNested('socialLinks', 'twitter', e.target.value)} placeholder="https://twitter.com/..." />
                  <Input label="Facebook" value={formData.socialLinks?.facebook || ''} onChange={(e) => updateNested('socialLinks', 'facebook', e.target.value)} placeholder="https://facebook.com/..." />
                  <Input label="Instagram" value={formData.socialLinks?.instagram || ''} onChange={(e) => updateNested('socialLinks', 'instagram', e.target.value)} placeholder="https://instagram.com/..." />
                  <Input label="YouTube" value={formData.socialLinks?.youtube || ''} onChange={(e) => updateNested('socialLinks', 'youtube', e.target.value)} placeholder="https://youtube.com/..." />
                </>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {formData.socialLinks?.website && <SocialLink href={formData.socialLinks.website} label="Website" />}
                  {formData.socialLinks?.linkedin && <SocialLink href={formData.socialLinks.linkedin} label="LinkedIn" />}
                  {formData.socialLinks?.twitter && <SocialLink href={formData.socialLinks.twitter} label="Twitter" />}
                  {formData.socialLinks?.facebook && <SocialLink href={formData.socialLinks.facebook} label="Facebook" />}
                  {formData.socialLinks?.instagram && <SocialLink href={formData.socialLinks.instagram} label="Instagram" />}
                  {formData.socialLinks?.youtube && <SocialLink href={formData.socialLinks.youtube} label="YouTube" />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </NGOLayout>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-ink-600">
        <span className="text-ink-400">{icon}</span>
        {label}
      </div>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5 text-xs font-semibold text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
    >
      <Globe className="h-3 w-3" />
      {label}
    </a>
  );
}

