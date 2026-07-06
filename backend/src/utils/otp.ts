import { config } from '../config/env';

/**
 * Generate a numeric OTP of the configured length (default 6 digits).
 */
export function generateOTP(): string {
  const length = config.otp.length;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

/**
 * Check whether an OTP record is still valid (not expired, not consumed).
 */
export function isOTPValid(expiresAt: Date, consumed: boolean): boolean {
  return !consumed && new Date(expiresAt).getTime() > Date.now();
}
