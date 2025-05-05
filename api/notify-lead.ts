// Use Vercel Edge runtime for lower latency
export const config = { runtime: 'edge' };

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

// TODO: Consider moving email addresses to environment variables
const FROM_EMAIL = 'ivanxdigital@gmail.com';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Validate input - using req.json() for Web API
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const parse = BodySchema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: 'Invalid request', details: parse.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { lead, transcript } = parse.data;

  // Ensure environment variables are available in Edge runtime
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_EMAIL_TO;

  if (!resendApiKey || !toEmail) {
    console.error('Missing Resend API key or target email address');
    return new Response(JSON.stringify({ error: 'Missing email configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resend = new Resend(resendApiKey);
    const subject = `New Lead: ${lead.name}`;
    // Minimal HTML escaping for user-provided content
    const escapedName = lead.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedEmail = lead.email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedPhone = lead.phone.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedTranscript = transcript.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `
      <h2>New Lead Captured</h2>
      <ul>
        <li><strong>Name:</strong> ${escapedName}</li>
        <li><strong>Email:</strong> ${escapedEmail}</li>
        <li><strong>Phone:</strong> ${escapedPhone}</li>
      </ul>
      <h3>Chat Transcript</h3>
      <pre>${escapedTranscript}</pre>
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject,
      html,
    });
    // Use Response object for success
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Notify lead error:', err);
    // Use Response object for internal error
    return new Response(JSON.stringify({ error: 'Failed to send lead email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 