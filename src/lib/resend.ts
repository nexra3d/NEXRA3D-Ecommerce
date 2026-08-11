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
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[SMTP Email] Dispatch failed to ${targetTo}:`, err?.message || err);
      // Fallback to Resend if SMTP failed
    }
  }

  // 2. Use Resend API if configured
  if (isResendConfigured && resendInstance) {
    const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || 'NEXRA 3D <onboarding@resend.dev>';
    try {
      const data = await resendInstance.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (data.error) {
        console.error(`[Resend Error] Failed to send email to ${targetTo}:`, data.error);
        if (data.error.message?.includes('testing emails') || data.error.name === 'validation_error') {
          console.warn(`[Resend Domain Notice] Resend sandbox mode limits outgoing emails to the account owner (nexra3d@gmail.com). To send to customer emails (${targetTo}), add a custom domain in Resend (RESEND_FROM_EMAIL) or add SMTP credentials (GMAIL_USER & GMAIL_APP_PASSWORD) in .env`);
        }
        return { success: false, error: data.error.message };
      }

      console.log(`[Resend] Email sent successfully to ${targetTo}:`, data.data?.id);
      return { success: true, id: data.data?.id };
    } catch (error: any) {
      console.error(`[Resend Exception] Email dispatch failed to ${targetTo}:`, error?.message || error);
      return { success: false, error: error?.message || 'Failed to send email' };
    }
  }

  // 3. Fallback log if no email credentials configured
  console.log(`[Email Simulated Mode] Dispatch to ${targetTo}: "${options.subject}"`);
  return { success: true, simulated: true };
}

