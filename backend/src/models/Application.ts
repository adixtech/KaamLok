import { Schema, model, type Document, type Model } from 'mongoose';

export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'selected'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export type InterviewMode = 'online' | 'offline' | 'phone';

export interface IInterview {
  scheduledAt: Date;
  mode: InterviewMode;
  location?: string;
  meetingLink?: string;
  notes?: string;
  conductedBy?: Schema.Types.ObjectId;
  completed: boolean;
  feedback?: string;
}

export interface IApplication extends Document {
  studentId: Schema.Types.ObjectId;
  courseId: Schema.Types.ObjectId;
  ngoId: Schema.Types.ObjectId;

  // Application details
  message?: string;
  documents: string[];
  resume?: string;

  // Status
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: Date;
    changedBy: Schema.Types.ObjectId;
    note?: string;
  }[];

  // Score (optional, for ranking)
  score?: number;

  // Interview details
  interview?: IInterview;

  // Notes from NGO
  ngoNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Application details
    message: { type: String, maxlength: 1000 },
    documents: { type: [String], default: [] },
    resume: { type: String },

    // Status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'waitlisted', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    statusHistory: [{
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      note: { type: String },
    }],

    // Score
    score: { type: Number, min: 0, max: 100 },

    // Interview details
    interview: {
      scheduledAt: { type: Date },
      mode: { type: String, enum: ['online', 'offline', 'phone'] },
      location: { type: String },
      meetingLink: { type: String },
      notes: { type: String },
      conductedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      completed: { type: Boolean, default: false },
      feedback: { type: String },
    },

    // Notes from NGO
    ngoNotes: { type: String },
  },
  { timestamps: true }
);

// Compound indexes
applicationSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
applicationSchema.index({ ngoId: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ courseId: 1, status: 1 });
applicationSchema.index({ ngoId: 1, courseId: 1 });
applicationSchema.index({ 'interview.scheduledAt': 1 });

// Pre-save hook to track status history
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this.$locals.changedBy as Schema.Types.ObjectId,
      note: this.$locals.statusNote as string,
    });
  }
  next();
});

export const Application: Model<IApplication> = model<IApplication>('Application', applicationSchema);
