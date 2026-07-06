import bcrypt from 'bcryptjs';
import { Schema, model, type Document, type Model } from 'mongoose';

export type Role = 'student' | 'ngo' | 'admin';
export type UserStatus = 'active' | 'pending' | 'blocked';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  isEmailVerified: boolean; // alias kept for backward compat
  isActive: boolean;
  isBlocked: boolean;
  profileCompleted: boolean;
  lastLogin: Date | null;
  verificationStatus?: VerificationStatus; // NGO only
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['student', 'ngo', 'admin'], required: true, default: 'student' },
    status: { type: String, enum: ['active', 'pending', 'blocked'], default: 'active' },
    emailVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false }, // alias, kept in sync via pre-save
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    //const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Keep the two email-verified aliases in sync
  if (this.isModified('emailVerified')) {
    this.isEmailVerified = this.emailVerified;
  }
  if (this.isModified('isEmailVerified')) {
    this.emailVerified = this.isEmailVerified;
  }
  // Keep status and isBlocked consistent
  if (this.isModified('isBlocked') && this.isBlocked) {
    this.status = 'blocked';
  }
  next();
});

// Compare candidate password
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  //const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidate, this.password);
};

// Never return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User: Model<IUser> = model<IUser>('User', userSchema);
