import { z } from 'zod';
import { CohereAIParamsSchema } from './llmCohereAi';

export const AutoResponseSchema = z.object({
  aiRole: z.string().min(1),
  companyDescription: z.string().min(1),
  companyName: z.string().min(1),
  goal: z.string().min(1),
  language: z.enum(['ENGLISH', 'RUSSIAN', 'UKRAINIAN']),
  meName: z.string().min(1),
  messagesCount: z.number(),
  meGender: z.string().min(1),
  userName: z.string().min(1),
  userGender: z.string().min(1),
  firstQuestion: z.string().min(1),
  leadGoal: z.string().min(1),
  part: z.string().nullable(),
  flowHandling: z.string().nullable(),
  addedInformation: z.string().nullable(),
  addedQuestion: z.string().nullable(),
  personalChannel: z.string().optional(),
});

export const AutoResponseConfigSchema = z.object({
  isLead: z.boolean(),
});

export const AutoResponseOptionsSchema = z.object({
  llmParams: CohereAIParamsSchema,
  options: AutoResponseConfigSchema,
  onRequest: z.function().returns(z.void()).optional(),
  onTry: z.function().args(z.string()).returns(z.void()).optional(),
  onThrow: z.function().args(z.string()).returns(z.void()).optional(),
  onLogger: z.function().args(z.string(), z.any()).returns(z.void()).optional(),
});

export type AutoResponse = z.infer<typeof AutoResponseSchema>;
export type AutoResponseConfig = z.infer<typeof AutoResponseConfigSchema>;
export type AutoResponseOptions = z.infer<typeof AutoResponseOptionsSchema>;
