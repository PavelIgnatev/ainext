import { z } from 'zod';
import { CohereAIParamsSchema, MessagesSchema } from './llmCohereAi';

export const DialogueAnalysisSchema = z.object({
  companyName: z.string().min(1),
  leadDefinition: z.string().min(1),
  language: z.enum(['ENGLISH', 'RUSSIAN', 'UKRAINIAN']),
});

export const DialogueAnalysisOptionsSchema = z.object({
  llmParams: CohereAIParamsSchema,
  onRequest: z.function().returns(z.void()).optional(),
  onTry: z.function().args(z.string()).returns(z.void()).optional(),
  onLogger: z.function().args(z.string(), z.any()).returns(z.void()).optional(),
});

export const DialogueAnalysisResultSchema = z.object({
  status: z.enum(['negative', 'lead', 'continue']),
  reason: z.string(),
});

export type DialogueAnalysis = z.infer<typeof DialogueAnalysisSchema>;
export type DialogueAnalysisOptions = z.infer<
  typeof DialogueAnalysisOptionsSchema
>;
export type DialogueAnalysisResult = z.infer<
  typeof DialogueAnalysisResultSchema
>;
