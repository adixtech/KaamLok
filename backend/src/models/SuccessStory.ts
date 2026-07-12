import { Schema, model, type Document, type Model } from 'mongoose';

export interface ISuccessStory extends Document {
  studentName: string;
  studentPhoto?: string;
  studentAge?: number;
  studentCity?: string;

  ngoId: Schema.Types.ObjectId;
  ngoName: string;
  ngoLogo?: string;

  courseId: Schema.Types.ObjectId;
  courseTitle: string;

  skillsLearned: string[];
  currentRole?: string;
  currentCompany?: string;
  currentSalary?: string;

  beforeStory: string;
  afterStory: string;
  quote: string;

  completionDate: Date;
  isFeatured: boolean;
  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const successStorySchema = new Schema<ISuccessStory>(
  {
    studentName: { type: String, required: true, trim: true },
    studentPhoto: { type: String },
    studentAge: { type: Number },
    studentCity: { type: String, trim: true },

    ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ngoName: { type: String, required: true, trim: true },
    ngoLogo: { type: String },

    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    courseTitle: { type: String, required: true, trim: true },

    skillsLearned: { type: [String], default: [] },
    currentRole: { type: String, trim: true },
    currentCompany: { type: String, trim: true },
    currentSalary: { type: String, trim: true },

    beforeStory: { type: String, required: true },
    afterStory: { type: String, required: true },
    quote: { type: String, required: true, maxlength: 500 },

    completionDate: { type: Date, required: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

successStorySchema.index({ isPublished: 1, isFeatured: -1, createdAt: -1 });

export const SuccessStory: Model<ISuccessStory> = model<ISuccessStory>('SuccessStory', successStorySchema);
