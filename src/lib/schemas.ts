import { z } from 'zod';

export const leadFormSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  email: z.string().optional(),
  phone: z.string().optional(),
  sendTranscript: z.boolean().default(false),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;