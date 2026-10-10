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

const EMAIL_PROVIDERS = ['smtp', 'ses', 'sns', 'console'] as const;
type EmailProvider = (typeof EMAIL_PROVIDERS)[number];

function resolveEmailProvider(): EmailProvider {
  const raw = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase();
  if (EMAIL_PROVIDERS.includes(raw as EmailProvider)) return raw as EmailProvider;
  if (raw) {
    // Unknown provider is a typo, not a reason to silently fall back.
    throw new Error(
      `Invalid EMAIL_PROVIDER "${process.env.EMAIL_PROVIDER}". Expected one of: ${EMAIL_PROVIDERS.join(', ')}`
    );
  }
  // Implicit default: real SMTP when credentials exist, console otherwise.
  return process.env.SMTP_USER && process.env.SMTP_PASS ? 'smtp' : 'console';
}

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
    length: Number(process.env.OTP_LENGTH) || 6,
    // Overridable so login/OTP windows can be tuned per environment.
    // Default raised from 5 to 10 minutes: a 5-minute OTP expired while a
    // human was still reading the email, which made users think login was failing.
    expiryMs: ((n: string | undefined) => ((n && Number(n) > 0 ? Number(n) : 10) * 60_000))(
      process.env.OTP_EXPIRY_MINUTES,
    ),
  },

  email: {
    provider: resolveEmailProvider(),
    from: process.env.EMAIL_FROM || 'KaamLok <no-reply@kaamlok.in>',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    aws: {
      region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      snsTopicArn: process.env.AWS_SNS_EMAIL_TOPIC_ARN || '',
    },
  },

  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',

  rateLimit: {
    windowMs: ((n: string | undefined) => (n && Number(n) > 0 ? Number(n) : 15 * 60_000))(
      process.env.RATE_LIMIT_WINDOW_MS,
    ),
    max: ((n: string | undefined) => (n && Number(n) > 0 ? Number(n) : 100))(
      process.env.RATE_LIMIT_MAX,
    ),
    // auth endpoints: high enough that a developer never locks themselves out
    // during local testing, still bounded to stop credential-stuffing scripts.
    authMax: ((n: string | undefined) => (n && Number(n) > 0 ? Number(n) : 50))(
      process.env.RATE_LIMIT_AUTH_MAX,
    ),
  },
};
