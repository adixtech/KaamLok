import { Schema, model, type Document, type Model } from 'mongoose';

export interface ISavedCourse extends Document {
  studentId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  savedAt: Date;
  createdAt: Date;
}

const savedCourseSchema = new Schema<ISavedCourse>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

savedCourseSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
savedCourseSchema.index({ studentId: 1, savedAt: -1 });

export const SavedCourse: Model<ISavedCourse> = model<ISavedCourse>('SavedCourse', savedCourseSchema);
