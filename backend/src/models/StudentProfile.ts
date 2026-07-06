import { Schema, model, type Document, type Model } from 'mongoose';

export interface IStudentProfile extends Document {
  user: { type: import('mongoose').Types.ObjectId; ref: string };
  education: string;
  city: string;
  state: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    education: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const StudentProfile: Model<IStudentProfile> = model<IStudentProfile>(
  'StudentProfile',
  studentProfileSchema
);
