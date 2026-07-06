/**
 * Centralized environment configuration.
 * All secrets and tunable values are read here so the rest of the app
 * never touches process.env directly.
 */
import dotenv from 'dotenv';

dotenv.config();

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] || fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/kaamlok'),

  jwt: {
    secret: required('JWT_SECRET', 'dev-secret-change-in-production'),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cookie: {
    name: 'kaamlok_token',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    // In production use 'strict' to prevent CSRF; 'lax' allows top-level
    // navigations from external sites (needed during local dev).
    sameSite: (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none') ||
      (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // When sameSite='none', secure must be true (browsers reject it otherwise).
    // This is only relevant for cross-origin deployments behind HTTPS.
    domain: process.env.COOKIE_DOMAIN || undefined,
  },

  otp: {
    length: 6,
    expiryMs: 5 * 60 * 1000, // 5 minutes
  },

  email: {
    from: process.env.EMAIL_FROM || 'KaamLok <no-reply@kaamlok.in>',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },

  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5174',

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    authMax: 10, // stricter for login/register/otp
  },
};
