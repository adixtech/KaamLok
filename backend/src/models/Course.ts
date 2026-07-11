import { Schema, model, type Document, type Model } from 'mongoose';

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

export interface ITrainingSchedule {
  applicationStart: Date;
  applicationEnd: Date;
  trainingStart: Date;
  trainingEnd: Date;
  duration: string;
  trainingDays: string[];
  trainingTime: {
    start: string;
    end: string;
  };
}

export interface IOnlineTraining {
  meetingPlatform: string;
  meetingLink: string;
}

export interface IOfflineTraining {
  trainingCenter: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  googleMapLink?: string;
  landmark?: string;
}

export interface IEligibility {
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

export interface IPlacement {
  placementAssistance: boolean;
  placementPercentage?: number;
  averageSalary?: string;
  hiringPartners: string[];
}

export interface IContact {
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  alternativePhone?: string;
  officeHours?: string;
}

export interface ICourse extends Document {
  // Basic Information
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

  // Training Mode
  mode: CourseMode;
  onlineDetails?: IOnlineTraining;
  offlineDetails?: IOfflineTraining;

  // Schedule
  schedule: ITrainingSchedule;

  // Eligibility
  eligibility: IEligibility;

  // Benefits
  benefits: Benefit[];

  // Recognition
  recognition: Recognition[];

  // Placement
  placement: IPlacement;

  // Seats
  totalSeats: number;
  waitingListEnabled: boolean;
  maxWaitingStudents: number;
  filledSeats: number;

  // Contact
  contact: IContact;

  // Organization
  ngoId: Schema.Types.ObjectId;
  ngoName: string;
  ngoVerificationStatus: string;
  ngoLogo?: string;

  // Status & Visibility
  status: CourseStatus;
  isPublished: boolean;
  publishedAt?: Date;

  // Stats
  viewsCount: number;
  applicationsCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  availableSeats: number;
  displayStatus: string;
}

const courseSchema = new Schema<ICourse>(
  {
    // Basic Information
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, minlength: 100 },
    category: { type: String, required: true, trim: true, index: true },
    industry: { type: String, trim: true },
    tags: { type: [String], default: [] },
    language: { type: String, default: 'English' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    thumbnail: { type: String },
    banner: { type: String },

    // Training Mode
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true, default: 'online' },
    onlineDetails: {
      meetingPlatform: { type: String },
      meetingLink: { type: String },
    },
    offlineDetails: {
      trainingCenter: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pin: { type: String },
      googleMapLink: { type: String },
      landmark: { type: String },
    },

    // Schedule
    schedule: {
      applicationStart: { type: Date, required: true },
      applicationEnd: { type: Date, required: true },
      trainingStart: { type: Date, required: true },
      trainingEnd: { type: Date, required: true },
      duration: { type: String, required: true },
      trainingDays: { type: [String], default: [] },
      trainingTime: {
        start: { type: String },
        end: { type: String },
      },
    },

    // Eligibility
    eligibility: {
      ageMin: { type: Number },
      ageMax: { type: Number },
      gender: { type: String, enum: ['any', 'male', 'female', 'other'], default: 'any' },
      education: { type: String },
      requiredSkills: { type: [String], default: [] },
      preferredSkills: { type: [String], default: [] },
      experience: { type: String },
      incomeCriteria: { type: String },
      locationRestriction: { type: String },
      requiredDocuments: { type: [String], default: [] },
      customDocuments: { type: [String], default: [] },
    },

    // Benefits
    benefits: {
      type: [String],
      enum: [
        'free_training', 'certification', 'placement_assistance', 'internship',
        'food', 'accommodation', 'travel', 'laptop', 'learning_material',
        'career_guidance', 'hands_on_projects',
      ],
      default: [],
    },

    // Recognition
    recognition: {
      type: [String],
      enum: ['government_recognized', 'nsdc', 'skill_india', 'csr_sponsored', 'iso', 'industry_certificate'],
      default: [],
    },

    // Placement
    placement: {
      placementAssistance: { type: Boolean, default: false },
      placementPercentage: { type: Number },
      averageSalary: { type: String },
      hiringPartners: { type: [String], default: [] },
    },

    // Seats
    totalSeats: { type: Number, required: true, default: 30, min: 1 },
    waitingListEnabled: { type: Boolean, default: false },
    maxWaitingStudents: { type: Number, default: 10 },
    filledSeats: { type: Number, default: 0, min: 0 },

    // Contact
    contact: {
      coordinatorName: { type: String, required: true },
      coordinatorEmail: { type: String, required: true },
      coordinatorPhone: { type: String, required: true },
      alternativePhone: { type: String },
      officeHours: { type: String },
    },

    // Organization
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ngoName: { type: String, required: true },
    ngoVerificationStatus: { type: String, default: 'pending' },
    ngoLogo: { type: String },

    // Status & Visibility
    status: { type: String, enum: ['draft', 'published', 'paused', 'closed', 'archived'], default: 'draft', index: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },

    // Stats
    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
courseSchema.index({ status: 1, isPublished: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ ngoId: 1, status: 1 });
courseSchema.index({ 'schedule.applicationEnd': 1 });
courseSchema.index({ createdAt: -1 });

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function (this: ICourse) {
  return Math.max(0, this.totalSeats - this.filledSeats);
});

// Virtual for status display (auto-calculated)
courseSchema.virtual('displayStatus').get(function (this: ICourse) {
  const now = new Date();
  if (this.status === 'draft' || this.status === 'archived') return this.status;
  if (this.status === 'paused' || this.status === 'closed') return this.status;
  if (!this.isPublished) return 'draft';
  if (now < this.schedule.applicationStart) return 'opening_soon';
  if (now > this.schedule.applicationEnd) return 'applications_closed';
  const available = this.totalSeats - this.filledSeats;
  if (available <= 0) return this.waitingListEnabled ? 'waitlist_open' : 'applications_closed';
  if (available <= 5) return 'last_few_seats';
  const daysLeft = Math.ceil((this.schedule.applicationEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 3) return 'closing_soon';
  return 'applications_open';
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

export const Course: Model<ICourse> = model<ICourse>('Course', courseSchema);
