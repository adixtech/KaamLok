import { Schema, model, type Document, type Model } from 'mongoose';

export interface ICertificate extends Document {
  studentId: Schema.Types.ObjectId;
  studentName: string;
  ngoId: Schema.Types.ObjectId;
  ngoName: string;
  courseId: Schema.Types.ObjectId;
  courseTitle: string;
  issueDate: Date;
  certificateNumber: string;
  grade?: string;
  skillsAcquired: string[];
  status: 'issued' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentName: { type: String, required: true, trim: true },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ngoName: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    courseTitle: { type: String, required: true, trim: true },
    issueDate: { type: Date, default: Date.now },
    certificateNumber: { type: String, required: true, unique: true, index: true },
    grade: { type: String, trim: true },
    skillsAcquired: { type: [String], default: [] },
    status: { type: String, enum: ['issued', 'revoked'], default: 'issued', index: true },
  },
  { timestamps: true }
);

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Certificate: Model<ICertificate> = model<ICertificate>('Certificate', certificateSchema);
