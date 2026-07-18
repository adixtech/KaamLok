/**
 * Student dashboard types for the student portal.
 */

export interface StudentDashboardStats {
  totalApplications: number;
  activeApplications: number;
  selectedApplications: number;
  upcomingInterviews: number;
  trainingCourses: number;
  completedCourses: number;
  savedCourses: number;
  certificates: number;
}

export interface StudentProfileData {
  _id: string;
  education: string;
  city: string;
  state: string;
  skills: string[];
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  alternativePhone?: string;
  address?: string;
  pin?: string;
  photo?: string;
  bio?: string;
  educationDetails?: {
    degree?: string;
    institution?: string;
    yearOfCompletion?: number;
    percentage?: number;
  }[];
  experience?: {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }[];
  languages?: string[];
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  resume?: string;
  portfolio?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  profileCompletionScore: number;
}

export interface StudentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface StudentProfileResponse {
  user: StudentUser;
  profile: StudentProfileData | null;
  profileCompletionScore: number;
}

export interface ApplicationWithCourse {
  _id: string;
  studentId: string;
  courseId: string;
  ngoId: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category?: string;
    mode?: string;
    ngoName?: string;
    ngoLogo?: string;
    schedule?: {
      applicationEnd?: string;
      trainingStart?: string;
      trainingEnd?: string;
      duration?: string;
      trainingDays?: string[];
      trainingTime?: { start: string; end: string };
    };
    contact?: {
      coordinatorName?: string;
      coordinatorEmail?: string;
      coordinatorPhone?: string;
    };
  } | null;
  ngo: {
    _id: string;
    firstName?: string;
    ngoName?: string;
    email?: string;
    logo?: string;
  } | null;
  message?: string;
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
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedCourseItem {
  savedId: string;
  savedAt: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    shortDescription?: string;
    thumbnail?: string;
    category?: string;
    mode?: string;
    ngoName?: string;
    ngoLogo?: string;
    ngoVerificationStatus?: string;
    status?: string;
    isPublished?: boolean;
    totalSeats?: number;
    filledSeats?: number;
    availableSeats?: number;
    applicationsCount?: number;
    schedule?: {
      applicationEnd?: string;
      duration?: string;
    };
  } | null;
}

export interface DirectoryNGO {
  _id: string;
  ngoName: string;
  slug?: string;
  logo?: string;
  coverImage?: string;
  description: string;
  city?: string;
  state?: string;
  studentsTrained: number;
  sectorsFocused: string[];
  establishedYear?: number;
  activeCourses: number;
}

export interface StudentNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}
