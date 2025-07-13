import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['assistant', 'system', 'user']),
  content: z.string().min(1),
});

export const MessagesSchema = z.array(MessageSchema).min(1);

export const CohereAIParamsSchema = z.object({
  messages: MessagesSchema,
  model: z.string(),
  temperature: z.number().min(0.1).max(1),
  k: z.number().int().min(1).max(500).optional(),
  p: z.number().min(0.01).max(0.99).optional(),
  frequency_penalty: z.number().min(0.1).max(1).optional(),
  presence_penalty: z.number().min(0.1).max(1).optional(),
  safety_mode: z.enum(['CONTEXTUAL', 'STRICT']).optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type Messages = z.infer<typeof MessagesSchema>;
export type CohereAIParams = z.infer<typeof CohereAIParamsSchema>;
