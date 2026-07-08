import { Schema, model, type Document, type Model } from 'mongoose';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'shortlisted' | 'waitlist';

export interface IApplication extends Document {
  studentId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  ngoId: Schema.Types.ObjectId | null;
  status: ApplicationStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'shortlisted', 'waitlist'],
      default: 'pending',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

export const Application: Model<IApplication> = model<IApplication>('Application', applicationSchema);
