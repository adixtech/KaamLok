/**
 * Public-facing types for landing page, course details, NGO profiles,
 * success stories, newsletter, and contact support.
 */

// ─── Public Course (from /public/courses) ───────────────────────────
export interface PublicCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  difficulty: string;
  mode: string;
  thumbnail?: string;
  banner?: string;
  ngoId: string;
  ngoName: string;
  ngoVerificationStatus: string;
  ngoLogo?: string;
  displayStatus: string;
  totalSeats: number;
  filledSeats: number;
  availableSeats: number;
  schedule: {
    applicationEnd: string;
    trainingStart: string;
    duration: string;
  };
  benefits: string[];
  recognition: string[];
  applicationsCount: number;
}

// ─── Full Course (from /public/courses/:slug) ───────────────────────
export interface FullCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  industry?: string;
  tags: string[];
  language: string;
  difficulty: string;
  thumbnail?: string;
  banner?: string;
  mode: string;
  onlineDetails?: { meetingPlatform: string; meetingLink: string };
  offlineDetails?: {
    trainingCenter: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    googleMapLink?: string;
    landmark?: string;
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
    ageMin?: number;
    ageMax?: number;
    gender: string;
    education?: string;
    requiredSkills: string[];
    preferredSkills: string[];
    experience?: string;
    incomeCriteria?: string;
    locationRestriction?: string;
    requiredDocuments: string[];
    customDocuments: string[];
  };
  benefits: string[];
  recognition: string[];
  placement: {
    placementAssistance: boolean;
    placementPercentage?: number;
    averageSalary?: string;
    hiringPartners: string[];
  };
  totalSeats: number;
  waitingListEnabled: boolean;
  maxWaitingStudents: number;
  filledSeats: number;
  availableSeats: number;
  contact: {
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorPhone: string;
    alternativePhone?: string;
    officeHours?: string;
  };
  ngoId: string;
  ngoName: string;
  ngoVerificationStatus: string;
  ngoLogo?: string;
  status: string;
  isPublished: boolean;
  publishedAt?: string;
  displayStatus: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Success Story ──────────────────────────────────────────────────
export interface SuccessStory {
  _id: string;
  studentName: string;
  studentPhoto?: string;
  studentAge?: number;
  studentCity?: string;
  ngoId: string;
  ngoName: string;
  ngoLogo?: string;
  courseId: string;
  courseTitle: string;
  skillsLearned: string[];
  currentRole?: string;
  currentCompany?: string;
  currentSalary?: string;
  beforeStory: string;
  afterStory: string;
  quote: string;
  completionDate: string;
  isFeatured: boolean;
  createdAt: string;
}

// ─── NGO Public Profile ─────────────────────────────────────────────
export interface NGOPublicProfile {
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
  socialLinks: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  verificationStatus: string;
  totalCourses: number;
  activeCourses: number;
  createdAt: string;
}

export interface NGOPublicCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  mode: string;
  thumbnail?: string;
  displayStatus: string;
  totalSeats: number;
  filledSeats: number;
  availableSeats: number;
  schedule: {
    applicationEnd: string;
    duration: string;
  };
}

export interface FeaturedNGO {
  _id: string;
  ngoName: string;
  slug?: string;
  logo?: string;
  description: string;
  city?: string;
  state?: string;
  studentsTrained?: number;
  sectorsFocused?: string[];
  establishedYear?: number;
  activeCourses: number;
}

// ─── Application Status ─────────────────────────────────────────────
export interface StudentApplication {
  _id: string;
  studentId: string;
  courseId: string | { _id: string; title: string; slug: string; thumbnail?: string; category?: string; mode?: string };
  ngoId: string | { _id: string; firstName: string; ngoName: string; logo?: string };
  message?: string;
  documents: string[];
  resume?: string;
  status: string;
  statusHistory: {
    status: string;
    changedAt: string;
    changedBy?: string;
    note?: string;
  }[];
  interview?: {
    scheduledAt?: string;
    mode?: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
    completed?: boolean;
    feedback?: string;
  };
  ngoNotes?: string;
  createdAt: string;
  updatedAt: string;
}
