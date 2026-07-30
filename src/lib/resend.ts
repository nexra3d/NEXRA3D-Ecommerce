import { Resend } from 'resend';

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

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const fromEmail = options.from || process.env.RESEND_FROM_EMAIL || '3D Forge <onboarding@resend.dev>';

  if (isResendConfigured && resendInstance) {
    try {
      const data = await resendInstance.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log('[Resend] Email sent successfully:', data);
      return { success: true, id: data.data?.id };
    } catch (error: any) {
      console.error('[Resend] Email dispatch failed:', error);
      return { success: false, error: error?.message || 'Failed to send email' };
    }
  } else {
    console.log(`[Resend Simulated Mode] Email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}: "${options.subject}"`);
    return { success: true, simulated: true };
  }
}
