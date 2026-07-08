import { Schema, model, type Document, type Model } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: Record<string, unknown>;
  updatedBy: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    value: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> = model<ISetting>('Setting', settingSchema);
