/**
 * NGO Dashboard Types
 * Mirrors backend models and API responses
 */

// ─── Course Types ──────────────────────────────────────────────────
export type CourseStatus = 'draft' | 'published' | 'paused' | 'closed' | 'archived';
export type CourseMode = 'online' | 'offline' | 'hybrid';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type GenderRequirement = 'any' | 'male' | 'female' | 'other';

export type Benefit =
  | 'free_training'
  | 'certification'
  | 'placement_assistance'
  | 'internship'
  | 'food'
  | 'accommodation'
  | 'travel'
  | 'laptop'
  | 'learning_material'
  | 'career_guidance'
  | 'hands_on_projects';

export type Recognition =
  | 'government_recognized'
  | 'nsdc'
  | 'skill_india'
  | 'csr_sponsored'
  | 'iso'
  | 'industry_certificate';

export type DisplayStatus =
  | 'draft'
  | 'archived'
  | 'opening_soon'
  | 'applications_open'
  | 'closing_soon'
  | 'last_few_seats'
  | 'waitlist_open'
  | 'applications_closed'
  | 'published'
  | 'paused'
  | 'closed';

export interface OnlineTraining {
  meetingPlatform: string;
  meetingLink: string;
}

export interface OfflineTraining {
  trainingCenter: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  googleMapLink?: string;
  landmark?: string;
}

export interface TrainingSchedule {
  applicationStart: string;
  applicationEnd: string;
  trainingStart: string;
  trainingEnd: string;
  duration: string;
  trainingDays: string[];
  trainingTime: {
    start: string;
    end: string;
  };
}

export interface Eligibility {
  ageMin?: number;
  ageMax?: number;
  gender: GenderRequirement;
  education?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experience?: string;
  incomeCriteria?: string;
  locationRestriction?: string;
  requiredDocuments: string[];
  customDocuments: string[];
}

export interface Placement {
  placementAssistance: boolean;
  placementPercentage?: number;
  averageSalary?: string;
  hiringPartners: string[];
}

export interface NGOCourseContact {
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  alternativePhone?: string;
  officeHours?: string;
}
//diffrence between type and interface
//type for defining a union or intersection of types, while interface is for defining the shape of an object. Interfaces can be extended and implemented, while types cannot. Interfaces are generally preferred for defining object shapes, while types are used for more complex type definitions.
//flexible for complex data nd follow rule types for unino and interface for object shapes.
export interface Course  {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  industry?: string;
  tags: string[];
  language: string;
  difficulty: Difficulty;
  thumbnail?: string;
  banner?: string;
  mode: CourseMode;
  onlineDetails?: OnlineTraining;
  offlineDetails?: OfflineTraining;
  schedule: TrainingSchedule;
  eligibility: Eligibility;
  benefits: Benefit[];
  recognition: Recognition[];
  placement: Placement;
  totalSeats: number;
  waitingListEnabled: boolean;
  maxWaitingStudents: number;
  filledSeats: number;
  availableSeats: number;
  contact: NGOCourseContact;
  ngoId: string;
  ngoName: string;
  ngoVerificationStatus: string;
  ngoLogo?: string;
  status: CourseStatus;
  isPublished: boolean;
  publishedAt?: string;
  displayStatus: DisplayStatus;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Application Types ───────────────────────────────────────────────
export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'selected'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export type InterviewMode = 'online' | 'offline' | 'phone';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';
export interface Interview {
  scheduledAt?: string;
  mode?: InterviewMode;
  location?: string;
  meetingLink?: string;
  notes?: string;
  completed?: boolean;
  feedback?: string;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface StudentProfile {
  education: string;
  city: string;
  state: string;
  skills: string[];
}

export interface Application {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | string;
  courseId: {
    _id: string;
    title: string;
  } | string;
  ngoId: string;
  message?: string;
  documents: string[];
  resume?: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  score?: number;
  interview?: Interview;
  ngoNotes?: string;
  studentProfile?: StudentProfile | null;
  createdAt: string;
  updatedAt: string;
}

// ─── NGO Profile Types ───────────────────────────────────────────────
export type DocumentType = 'registration' | '80g' | '12a' | 'csr' | 'government_approval' | 'other';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface NGODocument {
  _id?: string;
  type: DocumentType;
  name: string;
  url: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
  note?: string;
}

export interface NGOProfile {
  _id: string;
  user: string;
  ngoName: string;
  slug?: string;
  registrationNumber: string;
  logo?: string;
  coverImage?: string;
  description: string;
  mission?: string;
  vision?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  establishedYear?: number;
  yearsOfExperience?: number;
  studentsTrained?: number;
  sectorsFocused?: string[];
  socialLinks: SocialLinks;
  documents: NGODocument[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNote?: string;
  totalCourses?: number;
  activeCourses?: number;
  totalApplications?: number;
  studentsSelected?: number;
  profileCompletion?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────
export interface NGODashboardStats {
  courses: {
    total: number;
    active: number;
    closed: number;
    draft: number;
  };
  applications: {
    received: number;
    pending: number;
    shortlisted: number;
    selected: number;
    rejected: number;
    waitlisted: number;
  };
  seats: {
    total: number;
    filled: number;
    available: number;
  };
  applicationsTrend: { _id: string; count: number }[];
  recentApplications: Application[];
  upcomingDeadlines: {
    _id: string;
    title: string;
    applicationEnd: string;
    daysLeft: number;
    seatsAvailable: number;
  }[];
}

// ─── Analytics Types ─────────────────────────────────────────────────
export interface NGOAnalytics {
  period: string;
  applicationsGrowth: { _id: Record<string, number>; count: number }[];
  courseStats: { _id: string; count: number; totalSeats: number; filled: number }[];
  statusDistribution: { _id: string; count: number }[];
}

// ─── Filter Types ─────────────────────────────────────────────────────
export interface CourseFilterItem {
  name: string;
  count: number;
}

export interface CourseFilters {
  categories: CourseFilterItem[];
  skills: CourseFilterItem[];
  states: CourseFilterItem[];
}

// ─── Pagination ──────────────────────────────────────────────────────
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── API Response Types ──────────────────────────────────────────────
export interface APIResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

// ─── Constants ───────────────────────────────────────────────────────
export const BENEFIT_LABELS: Record<Benefit, string> = {
  free_training: 'Free Training',
  certification: 'Certification',
  placement_assistance: 'Placement Assistance',
  internship: 'Internship',
  food: 'Food',
  accommodation: 'Accommodation',
  travel: 'Travel Support',
  laptop: 'Laptop Provided',
  learning_material: 'Learning Material',
  career_guidance: 'Career Guidance',
  hands_on_projects: 'Hands-on Projects',
};

export const RECOGNITION_LABELS: Record<Recognition, string> = {
  government_recognized: 'Government Recognized',
  nsdc: 'NSDC Certified',
  skill_india: 'Skill India',
  csr_sponsored: 'CSR Sponsored',
  iso: 'ISO Certified',
  industry_certificate: 'Industry Certificate',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'New',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  selected: 'Selected',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  withdrawn: 'Withdrawn',
};

export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  draft: 'Draft',
  archived: 'Archived',
  opening_soon: 'Opening Soon',
  applications_open: 'Applications Open',
  closing_soon: 'Closing Soon',
  last_few_seats: 'Last Few Seats',
  waitlist_open: 'Waitlist Open',
  applications_closed: 'Applications Closed',
  published: 'Published',
  paused: 'Paused',
  closed: 'Closed',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  registration: 'Registration Certificate',
  '80g': '80G Certificate',
  '12a': '12A Certificate',
  csr: 'CSR Document',
  government_approval: 'Government Approval',
  other: 'Other Document',
};

export const DIFFICULTY_LEVELS: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export const TRAINING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_REQUIRED_DOCUMENTS = [
  'Aadhar Card',
  'PAN Card',
  'Educational Certificates',
  'Resume',
  'Photograph',
];
