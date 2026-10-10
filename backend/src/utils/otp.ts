import { randomInt } from 'node:crypto';
import { config } from '../config/env';

/**
 * Generate a numeric OTP of the configured length (default 6 digits).
 *
 * Uses crypto.randomInt rather than Math.random: this value is the sole
 * barrier to account takeover during registration and password reset, so it
 * must come from a CSPRNG. Math.random is a predictable PRNG and its output
 * can be reconstructed from a handful of observed values.
 */
export function generateOTP(): string {
  const length = config.otp.length;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1; // inclusive
  // randomInt's upper bound is exclusive, so widen by 1 to include `max`.
  return String(randomInt(min, max + 1));
}

/**
 * Check whether an OTP record is still valid (not expired, not consumed).
 */
export function isOTPValid(expiresAt: Date, consumed: boolean): boolean {
  return !consumed && new Date(expiresAt).getTime() > Date.now();
}
