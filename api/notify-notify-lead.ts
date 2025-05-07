import { z } from 'zod';
import { Resend } from 'resend';

// Updated schema as per requirements
const LeadDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Valid phone number is required"),
});

export const BodySchema = z.object({
  lead: LeadDataSchema,
  transcript: z.string().optional(), // Transcript is now optional
  sendTranscript: z.boolean().default(false), // Default to false, client must explicitly set to true
});

// Use environment variables for email configuration, with sensible fallbacks for local dev if needed.
// TODO: Ensure these environment variables are set in Vercel.
const FROM_EMAIL_CONTACT = process.env.LEAD_FROM_EMAIL || 'concierge@skypearls.com'; // For emails sent to visitor
const FROM_EMAIL_INTERNAL = process.env.INTERNAL_FROM_EMAIL || 'noreply@skypearls.com'; // For emails sent to business
const BUSINESS_EMAIL_TO = process.env.LEAD_EMAIL_TO || 'ivanxdigital@gmail.com';
const REPLY_TO_EMAIL = process.env.LEAD_REPLY_TO || 'concierge@skypearls.com';

// Basic HTML escaping function
function escapeHtml(unsafe: string | undefined): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('[API/NOTIFY-LEAD] Invalid JSON:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parseResult = BodySchema.safeParse(body);
  if (!parseResult.success) {
    console.error('[API/NOTIFY-LEAD] Invalid request body:', parseResult.error.flatten());
    return new Response(JSON.stringify({ error: 'Invalid request', details: parseResult.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // lead, transcript, and sendTranscript are guaranteed by successful parsing
  const { lead, transcript, sendTranscript } = parseResult.data;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error('[API/NOTIFY-LEAD] Missing Resend API key');
    return new Response(JSON.stringify({ error: 'Server email configuration error (API Key)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!BUSINESS_EMAIL_TO) {
    console.error('[API/NOTIFY-LEAD] Missing business target email address (LEAD_EMAIL_TO)');
    return new Response(JSON.stringify({ error: 'Server email configuration error (Business Email)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(resendApiKey);

  // --- Email to Business ---
  const escapedFirstName = escapeHtml(lead.firstName);
  const escapedEmail = escapeHtml(lead.email);
  const escapedPhone = escapeHtml(lead.phone);
  const escapedTranscriptForHtml = transcript ? escapeHtml(transcript) : 'No transcript provided.';
  const transcriptHtmlSection = transcript 
    ? `<pre style="white-space: pre-wrap; word-wrap: break-word; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">${escapedTranscriptForHtml}</pre>`
    : '<p>Transcript was not included or not requested to be sent to the visitor.</p>';

  const businessEmailSubject = `New Skypearls Lead: ${escapedFirstName}`;
  const businessEmailHtml = `
    <h2>New Lead Captured via Chatbot</h2>
    <p><strong>Name:</strong> ${escapedFirstName}</p>
    <p><strong>Email:</strong> ${escapedEmail}</p>
    <p><strong>Phone:</strong> ${escapedPhone}</p>
    <p><strong>Visitor requested transcript:</strong> ${sendTranscript ? 'Yes' : 'No'}</p>
    <h3>Chat Transcript</h3>
    ${transcriptHtmlSection}
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL_INTERNAL, // Internal notifications can come from a noreply-type address
      to: BUSINESS_EMAIL_TO,
      reply_to: REPLY_TO_EMAIL, // Use reply_to (snake_case) for Resend API
      subject: businessEmailSubject,
      html: businessEmailHtml,
    });
    console.log('[API/NOTIFY-LEAD] Lead notification email sent to business:', BUSINESS_EMAIL_TO);
  } catch (err) {
    console.error('[API/NOTIFY-LEAD] Failed to send lead email to business:', err);
    // Log and potentially alert, but still try to send to visitor if applicable
  }

  // --- Email to Visitor (if opted-in AND transcript exists) ---
  if (sendTranscript && lead.email && transcript) { // Ensure transcript exists before sending
    const visitorEmailSubject = `Your Skypearls Villas Chat Transcript`;
    // Re-escape transcript for visitor email, though it should be the same
    const visitorTranscriptHtml = `<pre style="white-space: pre-wrap; word-wrap: break-word; background-color: #f4f4f4; padding: 10px; border-radius: 5px;">${escapeHtml(transcript)}</pre>`;
    
    const visitorEmailHtml = `
      <h2>Your Skypearls Villas Chat Transcript</h2>
      <p>Hi ${escapedFirstName},</p>
      <p>Thank you for chatting with us! Here is a copy of your conversation:</p>
      ${visitorTranscriptHtml}
      <p>We will be in touch shortly regarding your interest in Skypearls Villas.</p>
      <p>Sincerely,<br>The Skypearls Team</p>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL_CONTACT, // Use a more user-friendly from address for visitor
        to: lead.email, 
        reply_to: REPLY_TO_EMAIL, // Use reply_to (snake_case) for Resend API
        subject: visitorEmailSubject,
        html: visitorEmailHtml,
      });
      console.log('[API/NOTIFY-LEAD] Transcript email sent to visitor:', lead.email);
    } catch (err) {
      console.error('[API/NOTIFY-LEAD] Failed to send transcript email to visitor:', err);
      // Consider the overall success. If business email failed, this is also a problem.
      // If only visitor email failed, it's less critical but still an issue.
    }
  }

  // Determine overall success. For now, if business email sending was attempted (even if visitor failed),
  // consider it a success from the client's perspective of submitting the lead.
  // More granular error reporting could be added if needed.
  return new Response(JSON.stringify({ success: true, message: 'Lead processed.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
} 