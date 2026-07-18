import { useEffect, useState } from 'react';
import {
  User, Camera, Save, Plus, Trash2, GraduationCap,
  Briefcase, Globe,  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Loading';
import { studentApi } from '../../services/studentApi';
import type { StudentProfileData, StudentUser } from '../../types/student';

const SKILLS_SUGGESTIONS = [
  'Microsoft Excel', 'Communication', 'Data Entry', 'Customer Service',
  'Basic Accounting', 'Computer Basics', 'English Speaking', 'Tailoring',
  'Driving', 'Cooking', 'Photography', 'Graphic Design',
];

const EDUCATION_OPTIONS = ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Diploma', 'ITI', 'Other'];
const GENDER_OPTIONS = ['male', 'female', 'other', 'prefer_not_to_say'];

export function StudentProfilePage() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [completionScore, setCompletionScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'experience' | 'links'>('personal');

  // Form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    education: '', city: '', state: '', bio: '',
    dateOfBirth: '', gender: '',
    address: '', pin: '',
    skills: [] as string[],
    languages: [] as string[],
    resume: '', portfolio: '',
    socialLinks: { linkedin: '', github: '', website: '', twitter: '' },
    educationDetails: [] as { degree: string; institution: string; yearOfCompletion: number; percentage: number }[],
    experience: [] as { title: string; company: string; startDate: string; endDate: string; current: boolean; description: string }[],
    emergencyContact: { name: '', relation: '', phone: '' },
  });

  useEffect(() => {
    studentApi.getProfile()
      .then(({ user: u, profile: p, profileCompletionScore }) => {
        setUser(u);
        setProfile(p);
        setCompletionScore(profileCompletionScore);
        setForm((prev) => ({
          ...prev,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          phone: u.phone || '',
          education: p?.education || '',
          city: p?.city || '',
          state: p?.state || '',
          bio: p?.bio || '',
          dateOfBirth: p?.dateOfBirth?.split('T')[0] || '',
          gender: p?.gender || '',
          address: p?.address || '',
          pin: p?.pin || '',
          skills: p?.skills || [],
          languages: p?.languages || [],
          resume: p?.resume || '',
          portfolio: p?.portfolio || '',
          socialLinks: {
            linkedin: p?.socialLinks?.linkedin || '',
            github: p?.socialLinks?.github || '',
            website: p?.socialLinks?.website || '',
            twitter: p?.socialLinks?.twitter || '',
          },
          educationDetails: (p?.educationDetails || []).map((e) => ({
            degree: e.degree || '',
            institution: e.institution || '',
            yearOfCompletion: e.yearOfCompletion || 0,
            percentage: e.percentage || 0,
          })),
          experience: (p?.experience || []).map((ex) => ({
            title: ex.title || '',
            company: ex.company || '',
            startDate: ex.startDate || '',
            endDate: ex.endDate || '',
            current: ex.current || false,
            description: ex.description || '',
          })),
          emergencyContact: {
            name: p?.emergencyContact?.name || '',
            relation: p?.emergencyContact?.relation || '',
            phone: p?.emergencyContact?.phone || '',
          },
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await studentApi.updateProfile({
        firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        education: form.education, city: form.city, state: form.state,
        bio: form.bio, dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined, address: form.address, pin: form.pin,
        skills: form.skills, languages: form.languages,
        resume: form.resume, portfolio: form.portfolio,
        socialLinks: form.socialLinks,
        educationDetails: form.educationDetails,
        experience: form.experience,
        emergencyContact: form.emergencyContact,
      });
      setCompletionScore(result.profileCompletionScore);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const tabs = [
    { key: 'personal', label: 'Personal', icon: User },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'skills', label: 'Skills', icon: BookOpen },
    { key: 'experience', label: 'Experience', icon: Briefcase },
    { key: 'links', label: 'Links', icon: Globe },
  ] as const;

  if (loading) {
    return (
      <StudentLayout>
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="mt-4 h-96 rounded-3xl" />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">Profile</h1>
          <p className="mt-1 text-sm text-ink-500">Keep your profile complete to improve selection chances.</p>
        </div>
        <Button variant="primary" size="md" icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Profile completion */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-ink-900">Profile Completion</span>
          <span className={`text-sm font-bold ${completionScore >= 80 ? 'text-emerald-600' : completionScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
            {completionScore}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-ink-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completionScore >= 80 ? 'bg-emerald-500' : completionScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${completionScore}%` }}
          />
        </div>
        {completionScore < 100 && (
          <p className="mt-2 text-xs text-ink-400">Add your skills, education details, and resume to reach 100%.</p>
        )}
      </div>

      {/* Profile avatar + basic */}
      <div className="mb-6 flex items-center gap-5 rounded-2xl bg-white p-5 shadow-card ring-1 ring-inset ring-ink-200/50">
        <div className="relative">
          {form.socialLinks.website || profile?.photo ? (
            <img src={profile?.photo || ''} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500 text-2xl font-bold text-white">
              {form.firstName?.[0]}{form.lastName?.[0]}
            </div>
          )}
          <button className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white shadow-soft">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="text-lg font-bold text-ink-900">{form.firstName} {form.lastName}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
          <p className="text-xs text-ink-400">{form.city && form.state ? `${form.city}, ${form.state}` : 'Location not set'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50'}`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
        {/* Personal Info */}
        {activeTab === 'personal' && (
          <div className="space-y-5">
            <h2 className="font-bold text-ink-900">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
              <Input label="Phone Number" type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Gender</label>
                <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 py-3.5 px-4 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <Input label="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
              <Input label="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
              <Input label="PIN Code" value={form.pin} onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="A short introduction about yourself..."
                className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 p-4 text-sm font-medium text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="border-t border-ink-100 pt-4">
              <h3 className="mb-3 font-semibold text-ink-800">Emergency Contact</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Name" value={form.emergencyContact.name} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, name: e.target.value } }))} />
                <Input label="Relation" value={form.emergencyContact.relation} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, relation: e.target.value } }))} />
                <Input label="Phone" type="tel" value={form.emergencyContact.phone} onChange={(e) => setForm((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, phone: e.target.value } }))} />
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {activeTab === 'education' && (
          <div className="space-y-5">
            <h2 className="font-bold text-ink-900">Education</h2>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Highest Education</label>
              <select value={form.education} onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))} className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 py-3.5 px-4 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                <option value="">Select education level</option>
                {EDUCATION_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink-800">Education History</h3>
                <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setForm((p) => ({ ...p, educationDetails: [...p.educationDetails, { degree: '', institution: '', yearOfCompletion: 0, percentage: 0 }] }))}>
                  Add
                </Button>
              </div>
              {form.educationDetails.map((ed, i) => (
                <div key={i} className="mb-4 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-700">Education {i + 1}</p>
                    <button onClick={() => setForm((p) => ({ ...p, educationDetails: p.educationDetails.filter((_, idx) => idx !== i) }))} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Degree/Course" value={ed.degree} onChange={(e) => { const updated = [...form.educationDetails]; updated[i] = { ...updated[i], degree: e.target.value }; setForm((p) => ({ ...p, educationDetails: updated })); }} />
                    <Input label="Institution" value={ed.institution} onChange={(e) => { const updated = [...form.educationDetails]; updated[i] = { ...updated[i], institution: e.target.value }; setForm((p) => ({ ...p, educationDetails: updated })); }} />
                    <Input label="Year of Completion" type="number" value={ed.yearOfCompletion || ''} onChange={(e) => { const updated = [...form.educationDetails]; updated[i] = { ...updated[i], yearOfCompletion: Number(e.target.value) }; setForm((p) => ({ ...p, educationDetails: updated })); }} />
                    <Input label="Percentage / CGPA" type="number" value={ed.percentage || ''} onChange={(e) => { const updated = [...form.educationDetails]; updated[i] = { ...updated[i], percentage: Number(e.target.value) }; setForm((p) => ({ ...p, educationDetails: updated })); }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {activeTab === 'skills' && (
          <div className="space-y-5">
            <h2 className="font-bold text-ink-900">Skills & Languages</h2>
            <div>
              <p className="mb-3 text-sm font-semibold text-ink-700">Your Skills</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => toggleSkill(s)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${form.skills.includes(s) ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
                    {form.skills.includes(s) && <span className="mr-1">✓</span>}
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Input
                  label="Add Custom Skill"
                  placeholder="Type a skill and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const v = e.currentTarget.value.trim();
                      if (!form.skills.includes(v)) setForm((p) => ({ ...p, skills: [...p.skills, v] }));
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              {form.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                      {s}
                      <button onClick={() => setForm((p) => ({ ...p, skills: p.skills.filter((sk) => sk !== s) }))} className="text-brand-400 hover:text-brand-700">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-ink-100 pt-4">
              <p className="mb-3 text-sm font-semibold text-ink-700">Languages Known</p>
              <Input
                label="Add Language"
                placeholder="e.g., English, Hindi, Tamil... press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const v = e.currentTarget.value.trim();
                    if (!form.languages.includes(v)) setForm((p) => ({ ...p, languages: [...p.languages, v] }));
                    e.currentTarget.value = '';
                  }
                }}
              />
              {form.languages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.languages.map((l) => (
                    <span key={l} className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700">
                      {l}
                      <button onClick={() => setForm((p) => ({ ...p, languages: p.languages.filter((lg) => lg !== l) }))} className="text-teal-400 hover:text-teal-700">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-ink-900">Work Experience</h2>
              <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setForm((p) => ({ ...p, experience: [...p.experience, { title: '', company: '', startDate: '', endDate: '', current: false, description: '' }] }))}>
                Add
              </Button>
            </div>

            {form.experience.length === 0 && (
              <div className="rounded-2xl bg-ink-50 p-8 text-center ring-1 ring-ink-200">
                <Briefcase className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-2 text-sm text-ink-500">No work experience added yet.</p>
              </div>
            )}

            {form.experience.map((ex, i) => (
              <div key={i} className="rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-700">Experience {i + 1}</p>
                  <button onClick={() => setForm((p) => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }))} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Job Title" value={ex.title} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], title: e.target.value }; setForm((p) => ({ ...p, experience: u })); }} />
                  <Input label="Company" value={ex.company} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], company: e.target.value }; setForm((p) => ({ ...p, experience: u })); }} />
                  <Input label="Start Date" type="month" value={ex.startDate} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], startDate: e.target.value }; setForm((p) => ({ ...p, experience: u })); }} />
                  {!ex.current && (
                    <Input label="End Date" type="month" value={ex.endDate} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], endDate: e.target.value }; setForm((p) => ({ ...p, experience: u })); }} />
                  )}
                </div>
                <label className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-700">
                  <input type="checkbox" checked={ex.current} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], current: e.target.checked }; setForm((p) => ({ ...p, experience: u })); }} className="rounded" />
                  Currently working here
                </label>
                <textarea rows={2} className="mt-3 w-full rounded-xl border border-ink-200 bg-white p-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="Brief description of your role..." value={ex.description} onChange={(e) => { const u = [...form.experience]; u[i] = { ...u[i], description: e.target.value }; setForm((p) => ({ ...p, experience: u })); }} />
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <h2 className="font-bold text-ink-900">Links & Resume</h2>
            <Input label="Resume URL" placeholder="https://drive.google.com/your-resume" value={form.resume} onChange={(e) => setForm((p) => ({ ...p, resume: e.target.value }))} icon={<GraduationCap className="h-4 w-4" />} />
            <Input label="Portfolio URL" placeholder="https://yourportfolio.com" value={form.portfolio} onChange={(e) => setForm((p) => ({ ...p, portfolio: e.target.value }))} icon={<Globe className="h-4 w-4" />} />
            <div className="border-t border-ink-100 pt-4">
              <h3 className="mb-3 font-semibold text-ink-800">Social Links</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="LinkedIn" placeholder="linkedin.com/in/yourname" value={form.socialLinks.linkedin} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, linkedin: e.target.value } }))} />
                <Input label="GitHub" placeholder="github.com/yourname" value={form.socialLinks.github} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, github: e.target.value } }))}  />
                <Input label="Website" placeholder="yourwebsite.com" value={form.socialLinks.website} onChange={(e) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, website: e.target.value } }))} icon={<Globe className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="lg" icon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
          Save Profile
        </Button>
      </div>
    </StudentLayout>
  );
}
