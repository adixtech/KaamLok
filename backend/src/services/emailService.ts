import nodemailer from 'nodemailer';
import { config } from '../config/env';

/**
 * Email service using Nodemailer.
 * In development without SMTP credentials, it falls back to a console log
 * so the auth flow can be tested without a real mail server.
 */
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: config.email.user ? { user: config.email.user, pass: config.email.pass } : undefined,
});

export async function sendOTPEmail(email: string, otp: string, purpose: 'verification' | 'reset'): Promise<void> {
  const subject = purpose === 'reset'
    ? 'KaamLok — Password Reset Code'
    : 'KaamLok — Email Verification Code';

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563EB; font-size: 24px; margin: 0;">KaamLok</h1>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Learn. Grow. Get Career Ready.</p>
      </div>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 24px;">
        <h2 style="color: #0F172A; font-size: 18px; margin: 0 0 12px;">
          ${purpose === 'reset' ? 'Reset your password' : 'Verify your email'}
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Use the code below to ${purpose === 'reset' ? 'reset your password' : 'verify your email address'}.
          This code expires in 5 minutes.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; background: #2563EB; color: #fff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px;">
            ${otp}
          </span>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  if (!config.email.user) {
    // Dev fallback: log to console instead of sending
    console.log(`\n[EMAIL] To: ${email}\nSubject: ${subject}\nOTP: ${otp}\n`);
    return;
  }

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject,
    html,
  });
}
