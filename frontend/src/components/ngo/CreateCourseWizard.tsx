import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Save, Send, AlertCircle,
  Info, Calendar, Users, Phone,
} from 'lucide-react';
import { NGOLayout } from '../../components/ngo/NGOLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ngoApi } from '../../services/ngoApi';
import type {  CourseMode, Difficulty, Benefit, Recognition, GenderRequirement } from '../../types/ngo';
import { BENEFIT_LABELS, RECOGNITION_LABELS, DIFFICULTY_LEVELS, TRAINING_DAYS } from '../../types/ngo';

const STEPS = [
  { id: 'details', label: 'Course Details', icon: Info },
  { id: 'schedule', label: 'Schedule & Seats', icon: Calendar },
  { id: 'eligibility', label: 'Eligibility & Benefits', icon: Users },
  { id: 'contact', label: 'Contact & Visibility', icon: Phone },
  { id: 'review', label: 'Review & Publish', icon: Send },
];

type CourseFormData = Partial<{
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  industry: string;
  tags: string[];
  language: string;
  difficulty: Difficulty;
  thumbnail: string;
  banner: string;
  mode: CourseMode;
  onlineDetails: { meetingPlatform: string; meetingLink: string };
  offlineDetails: {
    trainingCenter: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    googleMapLink?: string;
    landmark: string;
  };
  schedule: {
    applicationStart: string;
    applicationEnd: string;
    trainingStart: string;
    trainingEnd: string;
    duration: string;
    trainingDays: string[];
    trainingTime: { start: string; end: string };
  };
  eligibility: {
    ageMin: number;
    ageMax: number;
    gender: GenderRequirement;
    education: string;
    requiredSkills: string[];
    preferredSkills: string[];
    experience: string;
    incomeCriteria: string;
    locationRestriction: string;
    requiredDocuments: string[];
    customDocuments: string[];
  };
  benefits: Benefit[];
  recognition: Recognition[];
  placement: {
    placementAssistance: boolean;
    placementPercentage: number;
    averageSalary: string;
    hiringPartners: string[];
  };
  totalSeats: number;
  waitingListEnabled: boolean;
  maxWaitingStudents: number;
  contact: {
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorPhone: string;
    alternativePhone: string;
    officeHours: string;
  };
  status: 'draft' | 'published' | 'paused' | 'closed' | 'archived';
}>;

const defaultFormData: CourseFormData = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  industry: '',
  tags: [],
  language: 'English',
  difficulty: 'beginner',
  mode: 'online',
  onlineDetails: { meetingPlatform: '', meetingLink: '' },
  offlineDetails: { trainingCenter: '', address: '', city: '', state: '', pin: '', googleMapLink: '', landmark: '' },
  schedule: {
    applicationStart: '',
    applicationEnd: '',
    trainingStart: '',
    trainingEnd: '',
    duration: '',
    trainingDays: [],
    trainingTime: { start: '09:00', end: '17:00' },
  },
  eligibility: {
    ageMin: 18,
    ageMax: 35,
    gender: 'any',
    education: '',
    requiredSkills: [],
    preferredSkills: [],
    experience: '',
    incomeCriteria: '',
    locationRestriction: '',
    requiredDocuments: ['Aadhar Card', 'Educational Certificates', 'Resume'],
    customDocuments: [],
  },
  benefits: [],
  recognition: [],
  placement: {
    placementAssistance: false,
    placementPercentage: 0,
    averageSalary: '',
    hiringPartners: [],
  },
  totalSeats: 30,
  waitingListEnabled: false,
  maxWaitingStudents: 10,
  contact: {
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    alternativePhone: '',
    officeHours: '',
  },
  status: 'draft',
};

export function CreateCoursePage() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CourseFormData>(defaultFormData);
  const [draftSaving, setDraftSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseId, setCourseId] = useState<string | null>(editId || null);
  const [loading, setLoading] = useState(!!editId);

  // useEffect(() => {
  //   if (!editId) return;
  //   ngoApi.getCourse(editId)
  //     .then(({ course }) => { 
  //       setFormData({ ...course } as CourseFormData);
  //     })
  //     .catch(() => {
  //       toast.error('Failed to load course');
  //       navigate('/ngo/courses');
  //     })
  //     .finally(() => setLoading(false));
  // }, [editId, navigate]);

  //chnage because to draft problem when publish and date format diffrence in
  //in backend and fronted
  //This provides a pure yyyy-MM-dd layout value, satisfying the strict requirements of your <input type="date"> on line 639.

    useEffect(() => {
    if (!editId) return;

    // Helper to safely transform full ISO timestamps to 'yyyy-MM-dd' format
    const formatDate = (isoString?: string) => {
      if (!isoString) return '';
      return isoString.split('T')[0];
    };

    ngoApi.getCourse(editId)
      .then(({ course }) => { 
        // Deeply clean all date fields inside the schedule object before setting state
        const cleanedCourse = {
          ...course,
          schedule: course.schedule ? {
            ...course.schedule,
            applicationStart: formatDate(course.schedule.applicationStart),
            applicationEnd: formatDate(course.schedule.applicationEnd),
            trainingStart: formatDate(course.schedule.trainingStart),
            trainingEnd: formatDate(course.schedule.trainingEnd),
          } : undefined
        };

        setFormData(cleanedCourse as CourseFormData);
      })
      .catch(() => {
        toast.error('Failed to load course');
        navigate('/ngo/courses');
      })
      .finally(() => setLoading(false));
  }, [editId, navigate]);


  // const saveDraft = useCallback(async () => {
  //   if (!formData.title) return;
  //   setDraftSaving(true);
  //   try {
  //     if (courseId) {
  //       await ngoApi.updateCourse(courseId, formData);
  //     } else {
  //       const result = await ngoApi.createCourse(formData);
  //       setCourseId(result.course._id);
  //     }
  //     toast.success('Draft saved');
  //   } catch {
  //     toast.error('Failed to save draft');
  //   } finally {
  //     setDraftSaving(false);
  //   }
  // }, [formData, courseId]);

  // add by aditya for (Change it to destructure and strip out fields that should not be edited on a live, published course before sending it over the network.)
    const saveDraft = useCallback(async () => {
    if (!formData.title) return;
    setDraftSaving(true);
    try {
      if (courseId) {
        // 1. Destructure out the system keys that trigger COURSE_PUBLISHED errors
        const { 
          status, 
          _id, 
          __v, 
          createdAt, 
          updatedAt, 
          enrolledStudents, 
          enrolledCount, 
          ...cleanPayload 
        } = formData as any;

        // 2. Submit only the cleaned payload of editable properties
        await ngoApi.updateCourse(courseId, cleanPayload);
      } else {
        await ngoApi.createCourse(formData);
        const result = await ngoApi.createCourse(formData);
        setCourseId(result.course._id);
      }
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setDraftSaving(false);
    }
  }, [formData, courseId]);


  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const updateNested = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof CourseFormData] as Record<string, unknown>), [field]: value },
    }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (STEPS[currentStep].id) {
      case 'details':
        if (!formData.title?.trim()) newErrors.title = 'Course title is required';
        if (!formData.shortDescription?.trim()) newErrors.shortDescription = 'Short description is required';
        if (!formData.description?.trim() || formData.description.length < 100) {
          newErrors.description = 'Description must be at least 100 characters';
        }
        if (!formData.category?.trim()) newErrors.category = 'Category is required';
        if (!formData.mode) newErrors.mode = 'Training mode is required';
        if (formData.mode === 'online' && !formData.onlineDetails?.meetingPlatform) {
          newErrors.meetingPlatform = 'Meeting platform is required for online mode';
        }
        if (formData.mode === 'offline' && !formData.offlineDetails?.city) {
          newErrors.city = 'City is required for offline mode';
        }
        break;
      case 'schedule':
        if (!formData.schedule?.applicationStart) newErrors.applicationStart = 'Application start date is required';
        if (!formData.schedule?.applicationEnd) newErrors.applicationEnd = 'Application end date is required';
        if (!formData.schedule?.trainingStart) newErrors.trainingStart = 'Training start date is required';
        if (!formData.schedule?.trainingEnd) newErrors.trainingEnd = 'Training end date is required';
        if (formData.schedule?.applicationEnd && formData.schedule?.trainingStart) {
          if (new Date(formData.schedule.applicationEnd) >= new Date(formData.schedule.trainingStart)) {
            newErrors.applicationEnd = 'Application end must be before training start';
          }
        }
        if (!formData.totalSeats || formData.totalSeats < 1) {
          newErrors.totalSeats = 'At least 1 seat is required';
        }
        break;
      case 'contact':
        if (!formData.contact?.coordinatorName) newErrors.coordinatorName = 'Coordinator name is required';
        if (!formData.contact?.coordinatorEmail) newErrors.coordinatorEmail = 'Coordinator email is required';
        if (!formData.contact?.coordinatorPhone) newErrors.coordinatorPhone = 'Coordinator phone is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handlePublish = async () => {
    if (!validateStep()) return;
    setPublishing(true);
    try {
      let id = courseId;
      if (!id) {
        const result = await ngoApi.createCourse(formData);
        id = result.course._id;
      } else {
        await ngoApi.updateCourse(id, formData);
      }
      await ngoApi.publishCourse(id);
      toast.success('Course published successfully!');
      navigate('/ngo/courses');
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.title && !courseId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData.title, courseId]);

  if (loading) {
    return (
      <NGOLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-teal-600" />
        </div>
      </NGOLayout>
    );
  }

  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <NGOLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{editId ? 'Edit Course' : 'Create New Course'}</h1>
        <p className="mt-1 text-sm text-ink-500">{editId ? 'Update your training program details.' : 'Fill in the details to publish a new training program.'}</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-1">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-soft'
                    : isCompleted
                      ? 'bg-teal-50 text-teal-700'
                      : 'bg-ink-100 text-ink-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-inset ring-ink-200/50">
        <StepComponent
          data={formData}
          errors={errors}
          updateField={updateField}
          updateNested={updateNested}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={saveDraft}
            loading={draftSaving}
            icon={<Save className="h-4 w-4" />}
          >
            Save Draft
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              iconRight={<ChevronRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handlePublish}
              loading={publishing}
              className="bg-teal-600 hover:bg-teal-700"
              icon={<Send className="h-4 w-4" />}
            >
              Publish Course
            </Button>
          )}
        </div>
      </div>
    </NGOLayout>
  );
}

type StepProps = {
  data: CourseFormData;
  errors: Record<string, string>;
  updateField: (field: string, value: unknown) => void;
  updateNested: (parent: string, field: string, value: unknown) => void;
};

// ─── Step 1: Course Details (Basic Info + Training Mode) ─────────────────
function CourseDetailsStep({ data, errors, updateField, updateNested }: StepProps) {
  const mode = data.mode || 'online';

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">Basic Information</h3>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Course Title *"
          value={data.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          error={errors.title}
          placeholder="e.g., Web Development Bootcamp"
        />
        <Input
          label="Category *"
          value={data.category || ''}
          onChange={(e) => updateField('category', e.target.value)}
          error={errors.category}
          placeholder="e.g., Information Technology, Healthcare, Retail"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink-700">Short Description * (max 200 chars)</label>
        <input
          value={data.shortDescription || ''}
          onChange={(e) => updateField('shortDescription', e.target.value)}
          placeholder="Brief overview for course cards"
          maxLength={200}
          className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
        <p className="mt-1 text-xs text-ink-400">{(data.shortDescription?.length || 0)}/200</p>
        {errors.shortDescription && <p className="text-xs text-rose-600">{errors.shortDescription}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink-700">Full Description * (min 100 chars)</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Detailed course description including objectives, learning outcomes, and curriculum..."
          rows={5}
          className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
        {errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Input
          label="Industry"
          value={data.industry || ''}
          onChange={(e) => updateField('industry', e.target.value)}
          placeholder="e.g., IT, Healthcare"
        />
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Difficulty Level</label>
          <select
            value={data.difficulty || 'beginner'}
            onChange={(e) => updateField('difficulty', e.target.value)}
            className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3.5 text-sm text-ink-700 outline-none focus:border-teal-400"
          >
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>
        </div>
        <Input
          label="Language"
          value={data.language || 'English'}
          onChange={(e) => updateField('language', e.target.value)}
          placeholder="e.g., English, Hindi"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink-700">Tags (comma separated)</label>
        <input
          value={data.tags?.join(', ') || ''}
          onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="e.g., Python, Data Science, Web Development"
          className="w-full rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Thumbnail URL"
          value={data.thumbnail || ''}
          onChange={(e) => updateField('thumbnail', e.target.value)}
          placeholder="https://..."
        />
        <Input
          label="Banner URL"
          value={data.banner || ''}
          onChange={(e) => updateField('banner', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="border-t border-ink-100 pt-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-400">Training Mode</h3>
        <div>
          <label className="mb-3 block text-sm font-semibold text-ink-700">Training Mode *</label>
          <div className="grid grid-cols-3 gap-3">
            {(['online', 'offline', 'hybrid'] as CourseMode[]).map(m => (
              <button
                key={m}
                onClick={() => updateField('mode', m)}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  mode === m
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className="text-sm font-semibold capitalize">{m}</span>
              </button>
            ))}
          </div>
          {errors.mode && <p className="mt-2 text-xs text-rose-600">{errors.mode}</p>}
        </div>

        {(mode === 'online' || mode === 'hybrid') && (
          <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/60 p-4">
            <h4 className="mb-4 text-sm font-bold text-ink-900">Online Training Details</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-700">Meeting Platform</label>
                <select
                  value={data.onlineDetails?.meetingPlatform || ''}
                  onChange={(e) => updateNested('onlineDetails', 'meetingPlatform', e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
                >
                  <option value="">Select platform</option>
                  <option value="zoom">Zoom</option>
                  <option value="google-meet">Google Meet</option>
                  <option value="ms-teams">Microsoft Teams</option>
                  <option value="webex">Cisco Webex</option>
                </select>
                {errors.meetingPlatform && <p className="text-xs text-rose-600">{errors.meetingPlatform}</p>}
              </div>
              <Input
                label="Default Meeting Link"
                value={data.onlineDetails?.meetingLink || ''}
                onChange={(e) => updateNested('onlineDetails', 'meetingLink', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {(mode === 'offline' || mode === 'hybrid') && (
          <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/60 p-4">
            <h4 className="mb-4 text-sm font-bold text-ink-900">Offline Training Details</h4>
            <div className="space-y-4">
              <Input
                label="Training Center Name"
                value={data.offlineDetails?.trainingCenter || ''}
                onChange={(e) => updateNested('offlineDetails', 'trainingCenter', e.target.value)}
                placeholder="e.g., ABC Training Center"
              />
              <Input
                label="Full Address"
                value={data.offlineDetails?.address || ''}
                onChange={(e) => updateNested('offlineDetails', 'address', e.target.value)}
                placeholder="Street address with building/room number"
              />
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  label="City *"
                  value={data.offlineDetails?.city || ''}
                  onChange={(e) => updateNested('offlineDetails', 'city', e.target.value)}
                  error={errors.city}
                />
                <Input
                  label="State"
                  value={data.offlineDetails?.state || ''}
                  onChange={(e) => updateNested('offlineDetails', 'state', e.target.value)}
                />
                <Input
                  label="PIN Code"
                  value={data.offlineDetails?.pin || ''}
                  onChange={(e) => updateNested('offlineDetails', 'pin', e.target.value)}
                />
              </div>
              <Input
                label="Google Map Link"
                value={data.offlineDetails?.googleMapLink || ''}
                onChange={(e) => updateNested('offlineDetails', 'googleMapLink', e.target.value)}
                placeholder="https://maps.google.com/..."
              />
              <Input
                label="Landmark"
                value={data.offlineDetails?.landmark || ''}
                onChange={(e) => updateNested('offlineDetails', 'landmark', e.target.value)}
                placeholder="Near..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Schedule & Seats ──────────────────────────────────────────────
function ScheduleSeatsStep({ data, errors, updateNested, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">Schedule</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Application Start Date *</label>
          <input
            type="date"
            value={data.schedule?.applicationStart || ''}
            onChange={(e) => updateNested('schedule', 'applicationStart', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
          />
          {errors.applicationStart && <p className="text-xs text-rose-600">{errors.applicationStart}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Application End Date *</label>
          <input
            type="date"
            value={data.schedule?.applicationEnd || ''}
            onChange={(e) => updateNested('schedule', 'applicationEnd', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
          />
          {errors.applicationEnd && <p className="text-xs text-rose-600">{errors.applicationEnd}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Training Start Date *</label>
          <input
            type="date"
            value={data.schedule?.trainingStart || ''}
            onChange={(e) => updateNested('schedule', 'trainingStart', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
          />
          {errors.trainingStart && <p className="text-xs text-rose-600">{errors.trainingStart}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Training End Date *</label>
          <input
            type="date"
            value={data.schedule?.trainingEnd || ''}
            onChange={(e) => updateNested('schedule', 'trainingEnd', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
          />
          {errors.trainingEnd && <p className="text-xs text-rose-600">{errors.trainingEnd}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Duration"
          value={data.schedule?.duration || ''}
          onChange={(e) => updateNested('schedule', 'duration', e.target.value)}
          placeholder="e.g., 3 months, 12 weeks"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Start Time</label>
            <input
              type="time"
              value={data.schedule?.trainingTime?.start || '09:00'}
              onChange={(e) => updateNested('schedule', 'trainingTime', { ...(data.schedule?.trainingTime || {}), start: e.target.value })}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">End Time</label>
            <input
              type="time"
              value={data.schedule?.trainingTime?.end || '17:00'}
              onChange={(e) => updateNested('schedule', 'trainingTime', { ...(data.schedule?.trainingTime || {}), end: e.target.value })}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-2.5 text-sm text-ink-700 outline-none focus:border-teal-400"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-700">Training Days</label>
        <div className="flex flex-wrap gap-2">
          {TRAINING_DAYS.map(day => {
            const selected = data.schedule?.trainingDays?.includes(day);
            return (
              <button
                key={day}
                onClick={() => {
                  const days = data.schedule?.trainingDays || [];
                  const newDays = selected
                    ? days.filter(d => d !== day)
                    : [...days, day];
                  updateNested('schedule', 'trainingDays', newDays);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected ? 'bg-teal-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-ink-100 pt-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-400">Seats</h3>
        <Input
          label="Total Seats *"
          type="number"
          value={data.totalSeats?.toString() || '30'}
          onChange={(e) => updateField('totalSeats', Number(e.target.value))}
          error={errors.totalSeats}
          hint="Total number of seats available for this course"
        />

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="waitingList"
            checked={data.waitingListEnabled || false}
            onChange={(e) => updateField('waitingListEnabled', e.target.checked)}
            className="h-5 w-5 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="waitingList" className="text-sm font-semibold text-ink-900">
            Enable Waiting List
          </label>
        </div>

        {data.waitingListEnabled && (
          <Input
            label="Maximum Waiting Students"
            type="number"
            value={data.maxWaitingStudents?.toString() || '10'}
            onChange={(e) => updateField('maxWaitingStudents', Number(e.target.value))}
            hint="Maximum number of students that can join the waiting list"
          />
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Eligibility, Benefits & Recognition ───────────────────────────
function EligibilityBenefitsStep({ data, updateNested, updateField }: StepProps) {
  const benefits = Object.keys(BENEFIT_LABELS) as Benefit[];
  const recognitions = Object.keys(RECOGNITION_LABELS) as Recognition[];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">Eligibility Criteria</h3>

      <div className="grid gap-4 md:grid-cols-4">
        <Input
          label="Minimum Age"
          type="number"
          value={data.eligibility?.ageMin?.toString() || '18'}
          onChange={(e) => updateNested('eligibility', 'ageMin', Number(e.target.value))}
        />
        <Input
          label="Maximum Age"
          type="number"
          value={data.eligibility?.ageMax?.toString() || '35'}
          onChange={(e) => updateNested('eligibility', 'ageMax', Number(e.target.value))}
        />
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Gender</label>
          <select
            value={data.eligibility?.gender || 'any'}
            onChange={(e) => updateNested('eligibility', 'gender', e.target.value)}
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3.5 text-sm text-ink-700 outline-none focus:border-teal-400"
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Input
          label="Education Level"
          value={data.eligibility?.education || ''}
          onChange={(e) => updateNested('eligibility', 'education', e.target.value)}
          placeholder="e.g., 12th Pass, Graduate"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Required Skills (comma separated)</label>
          <input
            value={data.eligibility?.requiredSkills?.join(', ') || ''}
            onChange={(e) => updateNested('eligibility', 'requiredSkills', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="e.g., Basic Computer, MS Office"
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Preferred Skills (comma separated)</label>
          <input
            value={data.eligibility?.preferredSkills?.join(', ') || ''}
            onChange={(e) => updateNested('eligibility', 'preferredSkills', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="e.g., Python, JavaScript"
            className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Experience Required"
          value={data.eligibility?.experience || ''}
          onChange={(e) => updateNested('eligibility', 'experience', e.target.value)}
          placeholder="e.g., 0-2 years, Freshers welcome"
        />
        <Input
          label="Income Criteria"
          value={data.eligibility?.incomeCriteria || ''}
          onChange={(e) => updateNested('eligibility', 'incomeCriteria', e.target.value)}
          placeholder="e.g., Family income below 5 LPA"
        />
      </div>

      <Input
        label="Location Restriction"
        value={data.eligibility?.locationRestriction || ''}
        onChange={(e) => updateNested('eligibility', 'locationRestriction', e.target.value)}
        placeholder="e.g., Only for Maharashtra residents"
      />

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-700">Required Documents</label>
        <div className="flex flex-wrap gap-2">
          {['Aadhar Card', 'PAN Card', 'Educational Certificates', 'Resume', 'Photograph', 'Income Certificate'].map(doc => {
            const selected = data.eligibility?.requiredDocuments?.includes(doc);
            return (
              <button
                key={doc}
                onClick={() => {
                  const docs = data.eligibility?.requiredDocuments || [];
                  const newDocs = selected
                    ? docs.filter(d => d !== doc)
                    : [...docs, doc];
                  updateNested('eligibility', 'requiredDocuments', newDocs);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selected ? 'bg-teal-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {doc}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-ink-100 pt-6">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-400">Benefits</h3>
        <p className="mb-4 text-sm text-ink-500">Select benefits that students will receive.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(benefit => {
            const selected = data.benefits?.includes(benefit);
            return (
              <button
                key={benefit}
                onClick={() => {
                  const current = data.benefits || [];
                  updateField('benefits', selected
                    ? current.filter(b => b !== benefit)
                    : [...current, benefit]
                  );
                }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-lg ${
                  selected ? 'bg-teal-600 text-white' : 'bg-ink-100 text-ink-400'
                }`}>
                  {selected ? '✓' : ''}
                </span>
                <span className="text-sm font-medium text-ink-900">{BENEFIT_LABELS[benefit]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-ink-100 pt-6">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-ink-400">Recognition & Certification</h3>
        <p className="mb-4 text-sm text-ink-500">Select certifications and recognitions.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recognitions.map(recognition => {
            const selected = data.recognition?.includes(recognition);
            return (
              <button
                key={recognition}
                onClick={() => {
                  const current = data.recognition || [];
                  updateField('recognition', selected
                    ? current.filter(r => r !== recognition)
                    : [...current, recognition]
                  );
                }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-lg ${
                  selected ? 'bg-teal-600 text-white' : 'bg-ink-100 text-ink-400'
                }`}>
                  {selected ? '✓' : ''}
                </span>
                <span className="text-sm font-medium text-ink-900">{RECOGNITION_LABELS[recognition]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-ink-100 pt-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-400">Placement</h3>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="placementAssistance"
            checked={data.placement?.placementAssistance || false}
            onChange={(e) => updateNested('placement', 'placementAssistance', e.target.checked)}
            className="h-5 w-5 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="placementAssistance" className="text-sm font-semibold text-ink-900">
            Provide Placement Assistance
          </label>
        </div>

        {data.placement?.placementAssistance && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Placement Percentage"
              type="number"
              value={data.placement?.placementPercentage?.toString() || ''}
              onChange={(e) => updateNested('placement', 'placementPercentage', Number(e.target.value))}
              placeholder="e.g., 85"
            />
            <Input
              label="Average Salary"
              value={data.placement?.averageSalary || ''}
              onChange={(e) => updateNested('placement', 'averageSalary', e.target.value)}
              placeholder="e.g., ₹3.5 LPA"
            />
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-ink-700">Hiring Partners (comma separated)</label>
              <input
                value={data.placement?.hiringPartners?.join(', ') || ''}
                onChange={(e) => updateNested('placement', 'hiringPartners', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                placeholder="e.g., TCS, Infosys, Wipro"
                className="w-full rounded-xl border border-ink-200 bg-ink-50/60 px-4 py-3 text-sm text-ink-700 outline-none focus:border-teal-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Contact & Visibility ──────────────────────────────────────────
function ContactVisibilityStep({ data, errors, updateNested, updateField }: StepProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-ink-400">Contact Information</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Coordinator Name *"
          value={data.contact?.coordinatorName || ''}
          onChange={(e) => updateNested('contact', 'coordinatorName', e.target.value)}
          error={errors.coordinatorName}
        />
        <Input
          label="Coordinator Email *"
          type="email"
          value={data.contact?.coordinatorEmail || ''}
          onChange={(e) => updateNested('contact', 'coordinatorEmail', e.target.value)}
          error={errors.coordinatorEmail}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Coordinator Phone *"
          type="tel"
          value={data.contact?.coordinatorPhone || ''}
          onChange={(e) => updateNested('contact', 'coordinatorPhone', e.target.value)}
          error={errors.coordinatorPhone}
        />
        <Input
          label="Alternative Phone"
          type="tel"
          value={data.contact?.alternativePhone || ''}
          onChange={(e) => updateNested('contact', 'alternativePhone', e.target.value)}
        />
      </div>
      <Input
        label="Office Hours"
        value={data.contact?.officeHours || ''}
        onChange={(e) => updateNested('contact', 'officeHours', e.target.value)}
        placeholder="e.g., Mon-Fri, 9 AM - 5 PM"
      />

      <div className="border-t border-ink-100 pt-6">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-400">Visibility</h3>
        <div>
          <label className="mb-3 block text-sm font-semibold text-ink-700">Course Status</label>
          <div className="grid gap-3">
            {[
              { value: 'draft', label: 'Draft', desc: 'Only visible to you. You can continue editing.' },
              { value: 'published', label: 'Published', desc: 'Visible publicly on KaamLok. Students can apply.' },
              { value: 'paused', label: 'Paused', desc: 'Temporarily hidden from public. No new applications.' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => updateField('status', opt.value)}
                className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  data.status === opt.value
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full ${
                  data.status === opt.value ? 'bg-teal-600 text-white' : 'bg-ink-100'
                }`}>
                  {data.status === opt.value ? '✓' : ''}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{opt.label}</p>
                  <p className="text-xs text-ink-500">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Review & Publish ─────────────────────────────────────────────
function ReviewPublishStep({ data }: StepProps) {
  const missingFields: string[] = [];
  if (!data.title) missingFields.push('Course Title');
  if (!data.description) missingFields.push('Description');
  if (!data.category) missingFields.push('Category');
  if (!data.schedule?.applicationStart) missingFields.push('Application Start Date');
  if (!data.schedule?.applicationEnd) missingFields.push('Application End Date');
  if (!data.totalSeats) missingFields.push('Total Seats');
  if (!data.contact?.coordinatorName) missingFields.push('Coordinator Name');
  if (!data.contact?.coordinatorEmail) missingFields.push('Coordinator Email');
  if (!data.contact?.coordinatorPhone) missingFields.push('Coordinator Phone');

  return (
    <div className="space-y-6">
      {missingFields.length > 0 ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <p className="text-lg font-semibold text-rose-800">Missing Required Fields</p>
          </div>
          <p className="mt-2 text-sm text-rose-700">
            Please complete the following fields before publishing:
          </p>
          <ul className="mt-3 space-y-1">
            {missingFields.map(field => (
              <li key={field} className="flex items-center gap-2 text-sm text-rose-600">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
            <Send className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 text-lg font-semibold text-emerald-800">Ready to Publish!</p>
          <p className="mt-2 text-sm text-emerald-700">
            Your course will be visible on KaamLok and students can start applying.
          </p>
        </div>
      )}

      <div className="rounded-xl bg-ink-50 p-6">
        <h3 className="text-xl font-bold text-ink-900">{data.title || 'Course Title'}</h3>
        <p className="mt-2 text-sm text-ink-500">{data.shortDescription || 'Short description'}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 capitalize">
            {data.mode} Training
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 capitalize">
            {data.difficulty}
          </span>
          {data.category && (
            <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
              {data.category}
            </span>
          )}
        </div>

        {data.benefits && data.benefits.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase text-ink-400">Benefits</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.benefits.map(b => (
                <span key={b} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {BENEFIT_LABELS[b]}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.recognition && data.recognition.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold uppercase text-ink-400">Recognition</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.recognition.map(r => (
                <span key={r} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  {RECOGNITION_LABELS[r]}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.schedule && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-ink-400">Application Period</p>
              <p className="font-medium text-ink-900">
                {data.schedule.applicationStart ? new Date(data.schedule.applicationStart).toLocaleDateString() : '-'} to {' '}
                {data.schedule.applicationEnd ? new Date(data.schedule.applicationEnd).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-ink-400">Training Period</p>
              <p className="font-medium text-ink-900">
                {data.schedule.trainingStart ? new Date(data.schedule.trainingStart).toLocaleDateString() : '-'} to {' '}
                {data.schedule.trainingEnd ? new Date(data.schedule.trainingEnd).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        )}

        {data.totalSeats && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase text-ink-400">Seats</p>
            <p className="mt-2 text-2xl font-extrabold text-ink-900">{data.totalSeats}</p>
            {data.waitingListEnabled && (
              <p className="text-xs text-ink-500">Waitlist enabled for {data.maxWaitingStudents} students</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-ink-50 p-4">
        <p className="text-xs font-bold uppercase text-ink-400">Course Summary</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-500">Title</span>
            <span className="font-medium text-ink-900">{data.title || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Category</span>
            <span className="font-medium text-ink-900">{data.category || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Mode</span>
            <span className="font-medium text-ink-900 capitalize">{data.mode || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Total Seats</span>
            <span className="font-medium text-ink-900">{data.totalSeats || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Benefits</span>
            <span className="font-medium text-ink-900">{data.benefits?.length || 0} selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEP_COMPONENTS = [
  CourseDetailsStep,
  ScheduleSeatsStep,
  EligibilityBenefitsStep,
  ContactVisibilityStep,
  ReviewPublishStep,
];
