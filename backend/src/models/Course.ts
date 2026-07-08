import { Schema, model, type Document, type Model } from 'mongoose';

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseMode = 'online' | 'offline' | 'hybrid';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  skills: string[];
  duration: string;
  mode: CourseMode;
  seats: number;
  enrolledCount: number;
  ngoId: Schema.Types.ObjectId | null;
  isFeatured: boolean;
  status: CourseStatus;
  createdBy: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true, index: true },
    skills: { type: [String], default: [] },
    duration: { type: String, required: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], required: true, default: 'online' },
    seats: { type: Number, required: true, default: 30 },
    enrolledCount: { type: Number, default: 0 },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

courseSchema.index({ status: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ ngoId: 1 });

export const Course: Model<ICourse> = model<ICourse>('Course', courseSchema);
