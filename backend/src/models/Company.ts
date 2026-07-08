import { Schema, model, type Document, type Model } from 'mongoose';

/**
 * Company model — future-ready CSR/Corporate module.
 * Architecture exists; data flows will be wired when CSR features are activated.
 */
export type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ICompany extends Document {
  companyName: string;
  email: string;
  phone: string;
  csrBudget: number;
  status: CompanyStatus;
  verificationStatus: CompanyStatus;
  projects: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    csrBudget: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
    projects: [{ type: Schema.Types.ObjectId, ref: 'CSRProject' }],
  },
  { timestamps: true }
);

companySchema.index({ status: 1 });

export const Company: Model<ICompany> = model<ICompany>('Company', companySchema);
