import { Schema, model, type Document, type Model } from 'mongoose';

export type OTPPurpose = 'email_verification' | 'password_reset';

export interface IOTP extends Document {
  email: string;
  code: string;
  purpose: OTPPurpose;
  expiresAt: Date;
  consumed: boolean;
  createdAt: Date;
}

const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ['email_verification', 'password_reset'], required: true },
    expiresAt: { type: Date, required: true },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index: MongoDB auto-deletes expired OTPs after their expiry.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP: Model<IOTP> = model<IOTP>('OTP', otpSchema);
