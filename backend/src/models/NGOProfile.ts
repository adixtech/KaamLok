import { Schema, model, type Document, type Model } from 'mongoose';
import type { VerificationStatus } from './User';

export interface INGOProfile extends Document {
  user: { type: import('mongoose').Types.ObjectId; ref: string };
  ngoName: string;
  registrationNumber: string;
  website?: string;
  description: string;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ngoProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    ngoName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true, unique: true },
    website: { type: String, trim: true },
    description: { type: String, required: true, minlength: 30 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const NGOProfile: Model<INGOProfile> = model<INGOProfile>('NGOProfile', ngoProfileSchema);
