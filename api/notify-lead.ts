import { config } from 'dotenv';
config();

import { z } from 'zod';
import { Resend } from 'resend';

// --- Types ---
interface Lead {
  name: string;
  email: string;
  phone: string;
}

const LeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
});
const BodySchema = z.object({
  lead: LeadSchema,
  transcript: z.string().min(1),
});

const FROM_EMAIL = 'ivanxdigital@gmail.com';
const TO_EMAIL = process.env.LEAD_EMAIL_TO;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request', details: parse.error.flatten() });
  }
  const { lead, transcript } = parse.data;

  if (!process.env.RESEND_API_KEY || !TO_EMAIL) {
    return res.status(500).json({ error: 'Missing email configuration' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = `New Lead: ${lead.name}`;
    const html = `
      <h2>New Lead Captured</h2>
      <ul>
        <li><strong>Name:</strong> ${lead.name}</li>
        <li><strong>Email:</strong> ${lead.email}</li>
        <li><strong>Phone:</strong> ${lead.phone}</li>
      </ul>
      <h3>Chat Transcript</h3>
      <pre>${transcript}</pre>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Notify lead error:', err);
    return res.status(500).json({ error: 'Failed to send lead email' });
  }
} 