import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config/env';

/**
 * Email delivery.
 *
 * Transport-agnostic on purpose: `EMAIL_PROVIDER` selects the implementation and
 * every caller goes through `sendMail`. Swapping providers is an env change plus
 * (for the AWS options) one `npm install` — no call site changes.
 *
 *   smtp    — any SMTP relay via Nodemailer (Gmail, SendGrid, SES SMTP, Zoho).
 *             Default for real delivery; works today with no new dependency.
 *   ses     — Amazon SES v2 API. Chosen over SNS because SES is purpose-built for
 *             transactional mail: per-message HTML, attachments, custom headers,
 *             and a dedicated reputation/bounce dashboard. SNS email is a thin
 *             wrapper over the same mail path and gives you none of that.
 *   sns     — Amazon SNS email channel. Available if you want SNS fan-out for
 *             broadcasts later; keep transactional OTP on `ses`.
 *   console — no network. Builds the real MIME message and prints it, so local
 *             development and tests exercise the same template code as production.
 *
 * AWS access keys are read from the standard SDK chain (env, profile, IMDS, ECS
 * task role). No credential is ever stored in this codebase.
 */

export type EmailProvider = 'smtp' | 'ses' | 'sns' | 'console';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface SendResult {
  provider: EmailProvider;
  messageId: string;
  /** Present only for the console provider, so dev tooling can surface the OTP. */
  preview?: string;
}

let smtpTransporter: Transporter | null = null;
let smtpReady: Promise<Transporter> | null = null;

/* ──────────────────────────  SMTP  ────────────────────────── */

function createSmtpTransporter(): Transporter {
  const { host, port, user, pass } = config.email.smtp;
  return nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 expects STARTTLS.
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

async function getSmtpTransporter(): Promise<Transporter> {
  if (smtpTransporter) return smtpTransporter;
  if (!smtpReady) {
    const transporter = createSmtpTransporter();
    // Fail fast with a clear cause instead of a timeout on the first send.
    smtpReady = transporter
      .verify()
      .then(() => transporter)
      .catch((err) => {
        smtpReady = null;
        throw err;
      });
  }
  smtpTransporter = await smtpReady;
  return smtpTransporter;
}

/* ────────────────────  AWS SES / SNS (lazy)  ──────────────────── */

type AwsModule = Record<string, unknown>;

/** Minimal structural shape shared by AWS SDK v3 clients. */
interface AwsClient {
  send(command: unknown): Promise<unknown>;
}

type AwsClientCtor = new (config: Record<string, unknown>) => AwsClient;
type AwsCommandCtor = new (input: Record<string, unknown>) => unknown;

/**
 * The AWS SDK is an optional dependency so the project installs and builds
 * without it. It is resolved lazily and only when an AWS provider is selected.
 */
async function loadAws(packageName: string, exportName: string): Promise<unknown> {
  let mod: AwsModule;
  try {
    mod = (await import(/* @vite-ignore */ packageName)) as unknown as AwsModule;
  } catch {
    throw new Error(
      `EMAIL_PROVIDER requires the AWS SDK. Install it with: npm install ${packageName}`
    );
  }
  const ctor = mod[exportName] ?? mod.default;
  if (typeof ctor !== 'function') {
    throw new Error(`${packageName} did not export ${exportName}.`);
  }
  return ctor;
}

async function loadAwsClient(packageName: string, exportName: string): Promise<AwsClientCtor> {
  return (await loadAws(packageName, exportName)) as AwsClientCtor;
}

async function loadAwsCommand(packageName: string, exportName: string): Promise<AwsCommandCtor> {
  return (await loadAws(packageName, exportName)) as AwsCommandCtor;
}

interface AwsConfig extends Record<string, unknown> {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

function awsConfig(): AwsConfig {
  const { region, accessKeyId, secretAccessKey } = config.email.aws;
  const conf: AwsConfig = {};
  if (region) conf.region = region;
  // When omitted, the SDK falls back to its default credential chain.
  if (accessKeyId && secretAccessKey) {
    conf.accessKeyId = accessKeyId;
    conf.secretAccessKey = secretAccessKey;
  }
  return conf;
}

async function sendViaSes(message: EmailMessage): Promise<SendResult> {
  const SESv2Client = await loadAwsClient('@aws-sdk/client-sesv2', 'SESv2Client');
  const SendEmailCommand = await loadAwsCommand('@aws-sdk/client-sesv2', 'SendEmailCommand');

  const client = new SESv2Client(awsConfig());
  const command = new SendEmailCommand({
    FromEmailAddress: config.email.from,
    Destination: { ToAddresses: [message.to] },
    ReplyToAddresses: message.replyTo ? [message.replyTo] : undefined,
    Content: {
      Simple: {
        Subject: { Data: message.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: message.html, Charset: 'UTF-8' },
          Text: { Data: message.text, Charset: 'UTF-8' },
        },
      },
    },
  });

  const result = (await client.send(command)) as { MessageId?: string };
  return { provider: 'ses', messageId: result.MessageId || `ses-${Date.now()}` };
}

async function sendViaSns(message: EmailMessage): Promise<SendResult> {
  if (!config.email.aws.snsTopicArn) {
    throw new Error('EMAIL_PROVIDER=sns requires AWS_SNS_EMAIL_TOPIC_ARN to be set.');
  }

  const SNSClient = await loadAwsClient('@aws-sdk/client-sns', 'SNSClient');
  const PublishCommand = await loadAwsCommand('@aws-sdk/client-sns', 'PublishCommand');

  const client = new SNSClient(awsConfig());
  const command = new PublishCommand({
    TopicArn: config.email.aws.snsTopicArn,
    Subject: message.subject,
    Message: message.text,
    MessageAttributes: {
      // Subscribe to this topic with the "Email" protocol to deliver.
      Email: { DataType: 'String', StringValue: message.to },
      HTMLBody: { DataType: 'String', StringValue: message.html },
    },
  });

  const result = (await client.send(command)) as { MessageId?: string };
  return { provider: 'sns', messageId: result.MessageId || `sns-${Date.now()}` };
}

/* ──────────────────────────  Console  ────────────────────────── */

async function sendViaConsole(message: EmailMessage): Promise<SendResult> {
  const info = await nodemailer.createTransport({ jsonTransport: true }).sendMail({
    from: config.email.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  const preview = [
    '',
    '='.repeat(64),
    '  EMAIL NOT SENT — EMAIL_PROVIDER=console (development only)',
    '='.repeat(64),
    `  To:      ${message.to}`,
    `  From:    ${config.email.from}`,
    `  Subject: ${message.subject}`,
    '-'.repeat(64),
  ];
  for (const line of message.text.split('\n')) preview.push(`  ${line}`);
  preview.push('='.repeat(64), '');
  console.log(preview.join('\n'));

  return {
    provider: 'console',
    messageId: String(info.messageId),
    preview: message.text,
  };
}

/* ──────────────────────────  Dispatch  ────────────────────────── */

async function dispatch(message: EmailMessage): Promise<SendResult> {
  switch (config.email.provider) {
    case 'smtp': {
      const transporter = await getSmtpTransporter();
      const info = await transporter.sendMail({
        from: config.email.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        replyTo: message.replyTo,
      });
      return { provider: 'smtp', messageId: info.messageId };
    }
    case 'ses':
      return sendViaSes(message);
    case 'sns':
      return sendViaSns(message);
    case 'console':
      return sendViaConsole(message);
  }
}

/**
 * Send one email. Never throws for a missing/invalid provider — that is a
 * deployment error surfaced once at startup by `assertEmailConfigured`.
 * Delivery failures propagate so callers can decide whether to fail the request.
 */
export async function sendMail(message: EmailMessage): Promise<SendResult> {
  return dispatch(message);
}

/**
 * Startup self-check. Logs how email will be delivered so a misconfigured
 * deployment is obvious immediately rather than at the first login attempt.
 */
export async function assertEmailConfigured(): Promise<void> {
  const { provider, from } = config.email;

  if (provider === 'console') {
    if (config.isProd) {
      // Failing closed: in production an OTP printed to stdout is worse than a
      // failed boot, because it silently ships a login flow nobody can complete
      // (and leaks the code into log aggregators).
      throw new Error(
        '[email] EMAIL_PROVIDER=console is not allowed when NODE_ENV=production. ' +
          'Set EMAIL_PROVIDER=smtp|ses|sns with real credentials so OTPs are delivered.'
      );
    }
    console.warn('[email] provider=console (emails are logged, not delivered)');
    return;
  }

  if (!from) {
    throw new Error('[email] EMAIL_FROM is not set.');
  }

  try {
    if (provider === 'smtp') {
      await getSmtpTransporter();
    } else {
      await loadAws(
        provider === 'ses' ? '@aws-sdk/client-sesv2' : '@aws-sdk/client-sns',
        provider === 'ses' ? 'SESv2Client' : 'SNSClient'
      );
    }
    console.log(`[email] provider=${provider} from=${from} — delivery enabled`);
  } catch (err) {
    // Log and continue: the app must still boot so a mail outage does not take
    // down login entirely. sendMail() will surface the real error per attempt.
    console.error(`[email] provider=${provider} is not ready: ${(err as Error).message}`);
  }
}
