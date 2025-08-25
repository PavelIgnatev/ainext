import { z } from 'zod';
import { CohereAIParamsSchema } from './llmCohereAi';

export const PingSchema = z.object({
  aiName: z.string().min(1),
  aiGender: z.string().min(1),
  language: z.enum(['ENGLISH', 'RUSSIAN', 'UKRAINIAN']),
});

export const PingConfigSchema = z.object({});

export const PingOptionsSchema = z.object({
  llmParams: CohereAIParamsSchema,
  options: PingConfigSchema,
  onRequest: z.function().returns(z.void()).optional(),
  onTry: z.function().args(z.string()).returns(z.void()).optional(),
  onThrow: z.function().args(z.string()).returns(z.void()).optional(),
  onLogger: z.function().args(z.string(), z.any()).returns(z.void()).optional(),
});

export type Ping = z.infer<typeof PingSchema>;
export type PingConfig = z.infer<typeof PingConfigSchema>;
export type PingOptions = z.infer<typeof PingOptionsSchema>;
