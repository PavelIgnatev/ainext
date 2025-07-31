import { z } from 'zod';

export const LeadSchema = z.object({
  groupId: z.string().min(1),
  recipientId: z.string().min(1),
  recipientTitle: z.string().min(1),
  recipientUsername: z.string().min(1),
  recipientPhone: z.string().nullable(),
  aiReason: z.string().min(1),
  dateUpdated: z.date(),
});

export type Lead = z.infer<typeof LeadSchema>;
