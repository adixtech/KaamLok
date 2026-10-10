import { sendMail, type SendResult } from './emailTransport';
import { config } from '../config/env';

/**
 * Auth email templates + the two transactional messages the auth flow needs.
 * All delivery goes through emailTransport, so the transport is swappable.
 */

export type OTPPurpose = 'verification' | 'reset';

const BRAND = {
  name: 'KaamLok',
  tagline: 'Learn. Grow. Get Career Ready.',
  primary: '#2563EB',
  surface: '#F8FAFC',
  heading: '#0F172A',
  body: '#475569',
  muted: '#94A3B8',
  border: '#E2E8F0',
};

/** Plain-text alternative — required for deliverability and spam scoring. */
function otpText(otp: string, purpose: OTPPurpose, minutes: number): string {
  const action = purpose === 'reset' ? 'reset your password' : 'verify your email address';
  return [
    `${BRAND.name} — ${BRAND.tagline}`,
    '',
    `Your verification code: ${otp}`,
    '',
    `Use this code to ${action}. It expires in ${minutes} minutes.`,
    '',
    `If you didn't request this, you can safely ignore this email.`,
    `- ${BRAND.name}`,
  ].join('\n');
}

function otpHtml(otp: string, purpose: OTPPurpose, minutes: number): string {
  const heading = purpose === 'reset' ? 'Reset your password' : 'Verify your email';
  const action = purpose === 'reset' ? 'reset your password' : 'verify your email address';

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head>
<body style="margin:0;padding:0;background:#EEF2F7;font-family:'Plus Jakarta Sans',Segoe UI,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:${BRAND.primary};font-size:24px;margin:0;letter-spacing:-0.02em;">${BRAND.name}</h1>
      <p style="color:${BRAND.muted};font-size:14px;margin:4px 0 0;">${BRAND.tagline}</p>
    </div>
    <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;padding:24px;">
      <h2 style="color:${BRAND.heading};font-size:18px;margin:0 0 12px;">${heading}</h2>
      <p style="color:${BRAND.body};font-size:14px;line-height:1.6;margin:0;">
        Use the code below to ${action}. This code expires in ${minutes} minutes.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;background:${BRAND.primary};color:#fff;font-size:32px;font-weight:800;letter-spacing:8px;padding:16px 32px;border-radius:12px;font-family:'SFMono-Regular',Consolas,monospace;">${otp}</span>
      </div>
      <p style="color:${BRAND.muted};font-size:12px;line-height:1.6;margin:0;text-align:center;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <p style="color:${BRAND.muted};font-size:11px;text-align:center;margin:16px 0 0;">
      &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Email the one-time code for email verification or password reset.
 * Rejects when delivery is impossible so the caller can fail loudly instead of
 * leaving the user waiting for a code that will never arrive.
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: OTPPurpose
): Promise<SendResult> {
  const minutes = Math.round(config.otp.expiryMs / 60_000);
  const subject =
    purpose === 'reset'
      ? `${BRAND.name} — Password Reset Code`
      : `${BRAND.name} — Email Verification Code`;

  const result = await sendMail({
    to: email,
    subject,
    text: otpText(otp, purpose, minutes),
    html: otpHtml(otp, purpose, minutes),
  });

  // Never log the code once a real transport is configured.
  if (result.provider === 'console') {
    console.log(`[email] OTP for ${email} (${purpose}) delivered via console transport`);
  }

  return result;
}

/** Generic transactional email for non-auth flows (application updates, etc.). */
export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
}): Promise<SendResult> {
  const cta =
    input.actionUrl && input.actionLabel
      ? `<div style="text-align:center;margin:24px 0;">
           <a href="${input.actionUrl}" style="display:inline-block;background:${BRAND.primary};color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:12px;text-decoration:none;">${input.actionLabel}</a>
         </div>`
      : '';

  return sendMail({
    to: input.to,
    subject: input.subject,
    text: [input.heading, '', input.body, input.actionUrl || ''].filter(Boolean).join('\n'),
    html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${input.heading}</title></head>
<body style="margin:0;padding:0;background:#EEF2F7;font-family:'Plus Jakarta Sans',Segoe UI,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:${BRAND.primary};font-size:24px;margin:0;">${BRAND.name}</h1>
      <p style="color:${BRAND.muted};font-size:14px;margin:4px 0 0;">${BRAND.tagline}</p>
    </div>
    <div style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:16px;padding:24px;">
      <h2 style="color:${BRAND.heading};font-size:18px;margin:0 0 12px;">${input.heading}</h2>
      <p style="color:${BRAND.body};font-size:14px;line-height:1.6;margin:0;">${input.body}</p>
      ${cta}
    </div>
    <p style="color:${BRAND.muted};font-size:11px;text-align:center;margin:16px 0 0;">
      &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
    </p>
  </div>
</body>
</html>`,
  });
}
