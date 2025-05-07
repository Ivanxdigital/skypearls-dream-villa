import handler, { BodySchema } from './notify-lead.js'; // Added .js extension
import { Resend } from 'resend';
import { LeadInfo } from '../src/types.js'; // Added .js extension
import { ZodIssue } from 'zod'; // Import ZodIssue for typing

// Expected response types for casting
type ErrorResponse = { error: string; details?: any };
type SuccessResponse = { success: boolean; message: string };

// Mock Resend
const mockSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

// Helper to create a mock Request object
const createMockRequest = (method: string, body?: any): Request => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  return new Request('http://localhost/api/notify-lead', {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
};

const validLead: LeadInfo = {
  firstName: 'Test',
  email: 'test@example.com',
  phone: '1234567890',
  sendTranscript: false,
};

const validTranscript = "User: Hello\nAssistant: Hi Test!";

describe('/api/notify-lead handler', () => {
  beforeEach(() => {
    mockSend.mockClear();
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.LEAD_EMAIL_TO = 'business@example.com';
    process.env.LEAD_FROM_EMAIL = 'concierge@skypearls.com';
    process.env.INTERNAL_FROM_EMAIL = 'noreply@skypearls.com';
    process.env.LEAD_REPLY_TO = 'concierge@skypearls.com';
  });

  test('should return 405 for GET requests', async () => {
    const req = createMockRequest('GET');
    const res = await handler(req);
    expect(res.status).toBe(405);
  });

  test('should return 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/notify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{', // Corrected: Invalid JSON string, not unterminated
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json() as ErrorResponse;
    expect(json.error).toBe('Invalid JSON body');
  });

  test('should return 400 for missing required lead fields', async () => {
    const req = createMockRequest('POST', { lead: { email: 'test@example.com' } }); 
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json() as ErrorResponse;
    expect(json.error).toBe('Invalid request');
    // Accessing nested fieldErrors; ensure 'lead' itself is checked if it could be wholly missing or not an object
    expect(json.details.fieldErrors.lead?.firstName).toBeDefined(); 
    expect(json.details.fieldErrors.lead?.phone).toBeDefined();
  });

  test('should return 400 for invalid email format in lead', async () => {
    const req = createMockRequest('POST', { lead: { ...validLead, email: 'invalid' } });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const json = await res.json() as ErrorResponse;
    expect(json.error).toBe('Invalid request');
    expect(json.details.fieldErrors.lead?.email).toContain('Valid email is required');
  });
  
  // Test for ZodIssue typing (example usage, if needed for more complex checks)
  test('Zod error structure check for invalid lead email', async () => {
    const req = createMockRequest('POST', { lead: { ...validLead, email: 'invalid' } });
    const res = await handler(req);
    const json = await res.json() as ErrorResponse;
    if (json.details && json.details.issues) {
      const emailIssue = json.details.issues.find((issue: ZodIssue) => issue.path.join('.') === 'lead.email');
      expect(emailIssue).toBeDefined();
      if (emailIssue) {
        expect(emailIssue.message).toBe('Valid email is required');
      }
    }
  });

  test('should return 500 if RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const req = createMockRequest('POST', { lead: validLead, transcript: validTranscript, sendTranscript: false });
    const res = await handler(req);
    expect(res.status).toBe(500);
    const json = await res.json() as ErrorResponse;
    expect(json.error).toContain('Server email configuration error (API Key)');
  });

  test('should return 500 if LEAD_EMAIL_TO is missing', async () => {
    delete process.env.LEAD_EMAIL_TO;
    const req = createMockRequest('POST', { lead: validLead, transcript: validTranscript, sendTranscript: false });
    const res = await handler(req);
    expect(res.status).toBe(500);
    const json = await res.json() as ErrorResponse;
    expect(json.error).toContain('Server email configuration error (Business Email)');
  });

  test('should process valid request, send only business email if sendTranscript is false', async () => {
    const req = createMockRequest('POST', { lead: validLead, transcript: validTranscript, sendTranscript: false });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json() as SuccessResponse;
    expect(json.success).toBe(true);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'business@example.com',
      subject: expect.stringContaining(validLead.firstName),
      html: expect.stringContaining(validTranscript),
    }));
  });

  test('should process valid request, send both emails if sendTranscript is true and transcript exists', async () => {
    const leadWithTranscriptOptIn = { ...validLead, sendTranscript: true };
    const req = createMockRequest('POST', { lead: leadWithTranscriptOptIn, transcript: validTranscript, sendTranscript: true });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json() as SuccessResponse;
    expect(json.success).toBe(true);

    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'business@example.com',
      from: process.env.INTERNAL_FROM_EMAIL,
      subject: expect.stringContaining(leadWithTranscriptOptIn.firstName),
      html: expect.stringContaining(validTranscript),
    }));
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: leadWithTranscriptOptIn.email,
      from: process.env.LEAD_FROM_EMAIL,
      subject: 'Your Skypearls Villas Chat Transcript',
      html: expect.stringContaining(validTranscript),
    }));
  });

  test('should process valid request, send only business email if sendTranscript is true but transcript is missing', async () => {
    const leadWithTranscriptOptIn = { ...validLead, sendTranscript: true };
    const req = createMockRequest('POST', { lead: leadWithTranscriptOptIn, sendTranscript: true }); 
    const res = await handler(req);
    expect(res.status).toBe(200);
    const json = await res.json() as SuccessResponse;
    expect(json.success).toBe(true);

    expect(mockSend).toHaveBeenCalledTimes(1); 
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      to: 'business@example.com',
      subject: expect.stringContaining(leadWithTranscriptOptIn.firstName),
      html: expect.stringContaining('No transcript provided.'),
    }));
  });

  test('Zod BodySchema validation: transcript is optional', () => {
    const result = BodySchema.safeParse({ lead: validLead, sendTranscript: false });
    expect(result.success).toBe(true);
    if (result.success) {
        expect(result.data.transcript).toBeUndefined();
    }
  });

  test('Zod BodySchema validation: sendTranscript defaults to false', () => {
    const result = BodySchema.safeParse({ lead: validLead, transcript: validTranscript });
    expect(result.success).toBe(true);
    if (result.success) {
        expect(result.data.sendTranscript).toBe(false);
    }
  });
}); 