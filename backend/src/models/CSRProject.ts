import { Schema, model, type Document, type Model } from 'mongoose';

/**
 * CSR Project model — future-ready.
 * Linked to Company; tracks funded initiatives.
 */
export type CSRProjectStatus = 'planning' | 'active' | 'completed' | 'on_hold';

export interface ICSRProject extends Document {
  title: string;
  description: string;
  companyId: Schema.Types.ObjectId;
  fundingAmount: number;
  status: CSRProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const csrProjectSchema = new Schema<ICSRProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    fundingAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['planning', 'active', 'completed', 'on_hold'], default: 'planning' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

csrProjectSchema.index({ companyId: 1, status: 1 });

export const CSRProject: Model<ICSRProject> = model<ICSRProject>('CSRProject', csrProjectSchema);
