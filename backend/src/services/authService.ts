import { User, type IUser } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { NGOProfile } from '../models/NGOProfile';
import { OTP } from '../models/OTP';
import { signAccessToken, type JwtPayload } from '../utils/jwt';
import { generateOTP, isOTPValid } from '../utils/otp';
import { ApiError } from '../utils/errors';
import { sendOTPEmail } from './emailService';
import { config } from '../config/env';

/**
 * Auth service — all business logic for registration, OTP, login, and password reset.
 * Controllers stay thin; this is where the real work happens.
 */

function publicUser(user: IUser) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    isEmailVerified: user.emailVerified,
    isActive: user.isActive,
    isBlocked: user.isBlocked,
    profileCompleted: user.profileCompleted,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
  };
}

function tokenFor(user: IUser) {
  const payload: JwtPayload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  return signAccessToken(payload);
}

export const authService = {
  async registerStudent(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    education: string;
    city: string;
    state: string;
  }) {
    // Duplicate checks
    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) throw new ApiError(409, 'Email already registered', 'DUPLICATE_EMAIL', 'email');
    const existingPhone = await User.findOne({ phone: input.phone });
    if (existingPhone) throw new ApiError(409, 'Mobile number already registered', 'DUPLICATE_PHONE', 'phone');

    const user = await User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      password: input.password,
      role: 'student',
      status: 'active',
      emailVerified: false,
      isEmailVerified: false,
      isActive: true,
      isBlocked: false,
      profileCompleted: true, // student profile is filled during registration
      lastLogin: null,
    });

    await StudentProfile.create({
      user: user._id,
      education: input.education,
      city: input.city,
      state: input.state,
      skills: [],
    });

    await this.sendOTP(input.email, 'email_verification');

    return { message: 'Student registered. Verify your email with the OTP sent.', email: user.email };
  },

  async registerNGO(input: {
    ngoName: string;
    registrationNumber: string;
    email: string;
    phone: string;
    website?: string;
    state: string;
    city: string;
    description: string;
    password: string;
  }) {
    const existingEmail = await User.findOne({ email: input.email });
    if (existingEmail) throw new ApiError(409, 'Email already registered', 'DUPLICATE_EMAIL', 'email');
    const existingPhone = await User.findOne({ phone: input.phone });
    if (existingPhone) throw new ApiError(409, 'Mobile number already registered', 'DUPLICATE_PHONE', 'phone');
    const existingReg = await NGOProfile.findOne({ registrationNumber: input.registrationNumber });
    if (existingReg) throw new ApiError(409, 'Registration number already exists', 'DUPLICATE_REG', 'registrationNumber');

    // NGO name goes into firstName/lastName fields on the User for simplicity;
    // the full name lives on the NGOProfile.
    const user = await User.create({
      firstName: input.ngoName,
      lastName: '-',
      email: input.email,
      phone: input.phone,
      password: input.password,
      role: 'ngo',
      status: 'pending', // NGOs start pending until verified
      emailVerified: false,
      isEmailVerified: false,
      isActive: true,
      isBlocked: false,
      profileCompleted: true, // NGO profile is filled during registration
      lastLogin: null,
      verificationStatus: 'pending',
    });

    await NGOProfile.create({
      user: user._id,
      ngoName: input.ngoName,
      registrationNumber: input.registrationNumber,
      website: input.website,
      description: input.description,
      verificationStatus: 'pending',
    });

    await this.sendOTP(input.email, 'email_verification');

    return { message: 'NGO registered. Our team will verify your organization before granting access.', email: user.email };
  },

  async sendOTP(email: string, purpose: 'email_verification' | 'password_reset') {
    // Invalidate previous unused OTPs for this email/purpose
    await OTP.updateMany({ email, purpose, consumed: false }, { consumed: true });

    const code = generateOTP();
    await OTP.create({
      email,
      code,
      purpose,
      expiresAt: new Date(Date.now() + config.otp.expiryMs),
      consumed: false,
    });

    await sendOTPEmail(email, code, purpose === 'password_reset' ? 'reset' : 'verification');
  },

  async verifyOTP(email: string, otp: string) {
    const record = await OTP.findOne({ email, code: otp, purpose: 'email_verification' }).sort({ createdAt: -1 });
    if (!record || !isOTPValid(record.expiresAt, record.consumed)) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP');
    }
    record.consumed = true;
    await record.save();

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    user.emailVerified = true;
    user.isEmailVerified = true;
    await user.save();

    const token = tokenFor(user);
    return { user: publicUser(user), token };
  },

  async resendOTP(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    if (user.emailVerified) throw new ApiError(400, 'Email already verified', 'ALREADY_VERIFIED');
    await this.sendOTP(email, 'email_verification');
    return { message: 'A new OTP has been sent to your email' };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

    const ok = await user.comparePassword(password);
    if (!ok) throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

    if (!user.emailVerified) throw new ApiError(403, 'Please verify your email first', 'EMAIL_NOT_VERIFIED');
    if (user.isBlocked || user.status === 'blocked') throw new ApiError(403, 'Your account has been blocked', 'BLOCKED');
    if (user.role === 'ngo' && user.verificationStatus !== 'approved') {
      throw new ApiError(403, 'Your NGO is pending verification', 'NGO_PENDING');
    }

    // Record login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = tokenFor(user);
    return { user: publicUser(user), token };
  },

  async getMe(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    return { user: publicUser(user) };
  },

  async logout() {
    // Stateless JWT — the client just clears the cookie.
    return { message: 'Logged out successfully' };
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    // Don't reveal whether the email exists — but still send the OTP if it does.
    if (user) {
      await this.sendOTP(email, 'password_reset');
    }
    return { message: 'If the email exists, a reset code has been sent' };
  },

  async verifyResetOTP(email: string, otp: string) {
    const record = await OTP.findOne({ email, code: otp, purpose: 'password_reset' }).sort({ createdAt: -1 });
    if (!record || !isOTPValid(record.expiresAt, record.consumed)) {
      throw new ApiError(400, 'Invalid or expired OTP', 'INVALID_OTP');
    }
    record.consumed = true;
    await record.save();

    // Issue a short-lived reset token (reuse JWT with short expiry)
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    const token = signAccessToken({ sub: user._id.toString(), role: user.role, email: user.email });
    return { message: 'OTP verified', token };
  },

  async resetPassword(token: string, password: string) {
    // Verify the reset token
    const { verifyToken } = await import('../utils/jwt');
    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new ApiError(400, 'Invalid or expired reset token', 'INVALID_TOKEN');
    }
    const user = await User.findById(decoded.sub);
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    user.password = password;
    await user.save();
    return { message: 'Password reset successfully' };
  },
};
