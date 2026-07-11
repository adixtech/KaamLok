import { Schema, model, type Document, type Model } from 'mongoose';
import type { VerificationStatus } from './User';

export interface ISocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface INGODocument {
  _id?: Schema.Types.ObjectId;
  type: 'registration' | '80g' | '12a' | 'csr' | 'government_approval' | 'other';
  name: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: Schema.Types.ObjectId;
  note?: string;
}

export interface INGOProfile extends Document {
  user: Schema.Types.ObjectId;

  // Basic Info
  ngoName: string;
  slug?: string;
  registrationNumber: string;
  logo?: string;
  coverImage?: string;

  // About
  description: string;
  mission?: string;
  vision?: string;

  // Contact
  email: string;
  phone: string;
  alternativePhone?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  pin?: string;

  // Organization Details
  establishedYear?: number;
  yearsOfExperience?: number;
  studentsTrained?: number;
  sectorsFocused?: string[];

  // Social Links
  socialLinks: ISocialLinks;

  // Documents
  documents: INGODocument[];

  // Verification
  verificationStatus: VerificationStatus;
  verificationNote?: string;

  // Stats
  totalCourses?: number;
  activeCourses?: number;
  totalApplications?: number;
  studentsSelected?: number;

  // Profile Completion
  profileCompletion?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateProfileCompletion(): number;
}

const ngoProfileSchema = new Schema<INGOProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic Info
    ngoName: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true, unique: true },
    logo: { type: String },
    coverImage: { type: String },

    // About
    description: { type: String, required: true, minlength: 30 },
    mission: { type: String, maxlength: 500 },
    vision: { type: String, maxlength: 500 },

    // Contact
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    alternativePhone: { type: String, trim: true },

    // Address
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true, index: true },
    pin: { type: String, trim: true },

    // Organization Details
    establishedYear: { type: Number },
    yearsOfExperience: { type: Number },
    studentsTrained: { type: Number, default: 0 },
    sectorsFocused: { type: [String], default: [] },

    // Social Links
    socialLinks: {
      website: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      youtube: { type: String, trim: true },
    },

    // Documents
    documents: [{
      type: { type: String, enum: ['registration', '80g', '12a', 'csr', 'government_approval', 'other'], required: true },
      name: { type: String, required: true },
      url: { type: String, required: true },
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date, default: Date.now },
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
      note: { type: String },
    }],

    // Verification
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    verificationNote: { type: String },

    // Stats (computed, can be cached)
    totalCourses: { type: Number, default: 0 },
    activeCourses: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    studentsSelected: { type: Number, default: 0 },

    // Profile Completion
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Indexes
ngoProfileSchema.index({ ngoName: 'text' });
ngoProfileSchema.index({ 'sectorsFocused': 1 });

// Virtual for profile completion calculation
ngoProfileSchema.methods.calculateProfileCompletion = function (): number {
  const fields = [
    { key: 'ngoName', weight: 10 },
    { key: 'logo', weight: 10 },
    { key: 'coverImage', weight: 5 },
    { key: 'description', weight: 10 },
    { key: 'mission', weight: 5 },
    { key: 'vision', weight: 5 },
    { key: 'email', weight: 10 },
    { key: 'phone', weight: 5 },
    { key: 'address', weight: 5 },
    { key: 'city', weight: 5 },
    { key: 'state', weight: 5 },
    { key: 'pin', weight: 5 },
    { key: 'establishedYear', weight: 5 },
    { key: 'yearsOfExperience', weight: 5 },
    { key: 'studentsTrained', weight: 5 },
    { key: 'socialLinks.website', weight: 5 },
  ];

  let score = 0;
  for (const field of fields) {
    const keys = field.key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = this;
    for (const key of keys) {
      value = value?.[key];
    }
    if (value && (typeof value === 'string' ? value.trim().length > 0 : true)) {
      score += field.weight;
    }
  }
  return Math.min(100, score);
};

export const NGOProfile: Model<INGOProfile> = model<INGOProfile>('NGOProfile', ngoProfileSchema);
