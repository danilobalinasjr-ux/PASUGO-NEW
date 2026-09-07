import { Resend } from 'resend';

import { env } from '../config/env.js';

export async function sendRegistrationCode(email: string, fullName: string, code: string): Promise<void> {
  if (!env.resend.apiKey || !env.resend.fromEmail) {
    throw new Error('Resend email configuration is incomplete.');
  }

  const resend = new Resend(env.resend.apiKey);
  const { error } = await resend.emails.send({
    from: env.resend.fromEmail,
    to: email,
    subject: 'Verify your PASUGO account',
    text: `Hi ${fullName},\n\nYour PASUGO verification code is ${code}. It expires in 15 minutes.\n\nIf you did not request this, you can ignore this email.`,
  });

  if (error) {
    throw new Error('Registration email could not be sent.');
  }
}