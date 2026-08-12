import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;

export const isResendConfigured = Boolean(
  resendApiKey && 
  resendApiKey !== 're_sample_resend_api_key' && 
  resendApiKey.startsWith('re_')
);

let resendInstance: Resend | null = null;

if (isResendConfigured) {
  resendInstance = new Resend(resendApiKey);
}

const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 465);

const isSmtpConfigured = Boolean(smtpUser && smtpPass);

let smtpTransporter: nodemailer.Transporter | null = null;
if (isSmtpConfigured) {
  smtpTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const targetTo = Array.isArray(options.to) ? options.to.join(', ') : options.to;

  // 1. Prefer SMTP if configured (allows sending to ANY email address directly)
  if (isSmtpConfigured && smtpTransporter) {
    try {
      const fromAddress = options.from || process.env.SMTP_FROM || `NEXRA 3D <${smtpUser}>`;
      const info = await smtpTransporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html
      });
      console.log(`[SMTP Email] Sent successfully to ${targetTo}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'SMTP' };
    } catch (err: any) {
      console.error(`[SMTP Email] Dispatch failed to ${targetTo}:`, err?.message || err);
      // Fallback to Resend if SMTP failed
    }
  }

  // 2. Use Resend API if configured
  if (isResendConfigured && resendInstance) {
    // Candidates for "from" email in order of preference
    const fromCandidates: string[] = [];
    if (options.from) fromCandidates.push(options.from);
    if (process.env.RESEND_FROM_EMAIL) fromCandidates.push(process.env.RESEND_FROM_EMAIL);
    fromCandidates.push('NEXRA 3D <orders@orders.nexra3d.in>');
    fromCandidates.push('NEXRA 3D <orders@nexra3d.in>');
    fromCandidates.push('NEXRA 3D <onboarding@resend.dev>');

    // Deduplicate candidates
    const uniqueCandidates = Array.from(new Set(fromCandidates));

    let lastError: string | null = null;

    for (const fromCandidate of uniqueCandidates) {
      try {
        const data = await resendInstance.emails.send({
          from: fromCandidate,
          to: options.to,
          subject: options.subject,
          html: options.html,
        });

        if (data.error) {
          const errMsg = data.error.message || JSON.stringify(data.error);
          console.warn(`[Resend Candidate Failure] Candidate "${fromCandidate}" failed for ${targetTo}: ${errMsg}`);
          lastError = errMsg;
          // If error is domain verification related, try next candidate
          if (errMsg.toLowerCase().includes('domain') || errMsg.toLowerCase().includes('verify') || errMsg.toLowerCase().includes('not found')) {
            continue;
          }
          // If testing email restriction
          if (errMsg.toLowerCase().includes('testing emails') || errMsg.toLowerCase().includes('validation_error')) {
            continue;
          }
        } else if (data.data?.id) {
          console.log(`[Resend Success] Email successfully dispatched to ${targetTo} via "${fromCandidate}". Message ID: ${data.data.id}`);
          return { success: true, id: data.data.id, fromUsed: fromCandidate, provider: 'Resend' };
        }
      } catch (error: any) {
        const catchErr = error?.message || String(error);
        console.error(`[Resend Exception] Attempt with "${fromCandidate}" failed: ${catchErr}`);
        lastError = catchErr;
      }
    }

    console.error(`[Resend Error] All sender candidates failed for ${targetTo}. Last error: ${lastError}`);
    return { 
      success: false, 
      error: lastError || 'Failed to dispatch email via Resend',
      provider: 'Resend' 
    };
  }

  // 3. Fallback log if no email credentials configured in environment variables
  console.warn(`[Email Simulated Mode] RESEND_API_KEY is not set in environment variables. Simulated dispatch to ${targetTo}: "${options.subject}"`);
  return { 
    success: false, 
    simulated: true, 
    error: 'RESEND_API_KEY environment variable is missing on the server. Please add RESEND_API_KEY in app Settings.' 
  };
}

