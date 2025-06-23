'use server';

import type { Analysis } from '@/@types/Analysis';
import { coreDB } from './db';
import { validateAnalysis } from '@/validations/analysis';

const DEFAULT_BATCH_SIZE = 20;

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
  const analysis = await collection.findOne(
    { companyId: id },
    { projection: { _id: 0 } }
  );

  return analysis;
}

export async function updateAnalysis(data: Analysis) {
  const db = await coreDB();
  const collection = db.collection<Analysis>('analysis');

  validateAnalysis(data);

  await collection.updateOne(
    { companyId: data.companyId },
    { $set: data },
    { upsert: true }
  );

  return data.companyId;
}
