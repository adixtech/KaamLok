import { Schema, model, type Document, type Model } from 'mongoose';

export interface IStudentProfile extends Document {
  user: Schema.Types.ObjectId;
  // Basic info (from registration)
  education: string;
  city: string;
  state: string;
  skills: string[];
  // Extended profile fields
  dateOfBirth?: Date;
  gender?: string;
  phone?: string;
  alternativePhone?: string;
  address?: string;
  pin?: string;
  photo?: string;
  bio?: string;
  // Education details
  educationDetails?: {
    degree?: string;
    institution?: string;
    yearOfCompletion?: number;
    percentage?: number;
  }[];
  // Experience
  experience?: {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }[];
  // Languages
  languages?: string[];
  // Emergency contact
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  // Resume & documents
  resume?: string;
  portfolio?: string;
  // Social links
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  // Profile completion
  profileCompletionScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    education: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    skills: { type: [String], default: [] },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    phone: { type: String },
    alternativePhone: { type: String },
    address: { type: String },
    pin: { type: String },
    photo: { type: String },
    bio: { type: String, maxlength: 500 },
    educationDetails: [{
      degree: { type: String },
      institution: { type: String },
      yearOfCompletion: { type: Number },
      percentage: { type: Number },
    }],
    experience: [{
      title: { type: String, required: true },
      company: { type: String, required: true },
      startDate: { type: String },
      endDate: { type: String },
      current: { type: Boolean, default: false },
      description: { type: String },
    }],
    languages: { type: [String], default: [] },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    resume: { type: String },
    portfolio: { type: String },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
      twitter: { type: String },
    },
    profileCompletionScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const StudentProfile: Model<IStudentProfile> = model<IStudentProfile>(
  'StudentProfile',
  studentProfileSchema
);
