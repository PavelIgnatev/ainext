'use server';

import type { Analysis, DialogMessage } from '@/@types/Analysis';
import { coreDB } from './db';
import { z } from 'zod';

const DEFAULT_BATCH_SIZE = 20;

const DialogMessageSchema = z.object({
  role: z.enum(['assistant', 'user']),
  content: z.string().min(1),
});

const AnalysisSchema = z.object({
  companyId: z.string().optional(),
  aiRole: z.string().min(1),
  companyDescription: z.string().min(1),
  companyName: z.string().min(1),
  goal: z.string().min(1),
  language: z.enum(['ENGLISH', 'RUSSIAN', 'UKRAINIAN']),
  meName: z.string().min(1),
  messagesCount: z.number().int().min(0),
  meGender: z.string().min(1),
  userName: z.string().min(1),
  userGender: z.string().min(1),
  firstQuestion: z.string().min(1),
  dialogs: z.array(z.array(DialogMessageSchema)),
  addedInformation: z.string().nullable(),
  addedQuestion: z.string().nullable(),
  flowHandling: z.string().nullable(),
  part: z.string().nullable(),
});

export async function getAnalysis({
  offset = 0,
  batchSize = DEFAULT_BATCH_SIZE,
  searchQuery = '',
}: {
  offset?: number;
  batchSize?: number;
  searchQuery?: string;
} = {}) {
  const db = await coreDB();
  const collection = db.collection<Analysis>('analysis');

  const query = searchQuery ? { $text: { $search: searchQuery } } : {};

  const [total, items] = await Promise.all([
    collection.countDocuments(query),
    collection
      .find(query, {
        projection: {
          _id: 0,
          companyId: 1,
          aiRole: 1,
          companyName: 1,
          companyDescription: 1,
          goal: 1,
        },
        sort: { _id: -1 },
        skip: offset,
        limit: batchSize,
      })
      .toArray(),
  ]);

  return {
    items,
    total,
    hasMore: offset + batchSize < total,
  };
}

export async function getAnalysisById(id: string) {
  const db = await coreDB();
  const collection = db.collection<Analysis>('analysis');
  const analysis = await collection.findOne({ companyId: id });

  return analysis;
}

export async function updateAnalysis(data: Analysis) {
  const db = await coreDB();
  const collection = db.collection<Analysis>('analysis');

  try {
    AnalysisSchema.parse(data);

    await collection.updateOne(
      { companyId: data.companyId },
      { $set: data },
      { upsert: true }
    );

    return data.companyId;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`VALIDATION_ERROR: ${errorMessages}`);
    }

    throw error;
  }
}
