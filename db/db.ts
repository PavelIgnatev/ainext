'use server';
import { Db, MongoClient } from 'mongodb';

import { delay } from '@/helpers/sleep';

let client: MongoClient | null = null;
let coreDatabase: Db | null = null;
let isInitializing = false;

async function tryConnect(attempt: number = 1): Promise<void> {
  const maxDelay = 30000;
  const baseDelay = 1000;

  try {
    client = new MongoClient(String(process.env.DATABASE_URL), {
      heartbeatFrequencyMS: 10000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
    });

    client.on('serverHeartbeatSucceeded', () => {
      console.log('MONGO_HEARTBEAT_OK');
    });

    client.on('serverHeartbeatFailed', (error) => {
      console.error('MONGO_HEARTBEAT_FAILED:', error);
    });

    client.on('connectionPoolCleared', () => {
      console.warn('MONGO_CONNECTION_POOL_CLEARED');
    });

    await client.connect();

    coreDatabase = client.db('core');
    await coreDatabase.command({ ping: 1 });
  } catch (error) {
    console.error(`CONNECTION_ATTEMPT_${attempt}_FAILED:`, error);

    if (client) {
      await client.close().catch(() => {});
      client = null;
      coreDatabase = null;
    }

    const waitTime = Math.min(Math.pow(2, attempt) * baseDelay, maxDelay);
    console.log(`DB_RETRYING_${waitTime / 1000}_SECONDS...`);
    await delay(waitTime);

    await tryConnect(attempt + 1);
  }
}

async function initializeConnection(): Promise<void> {
  if (isInitializing) {
    while (isInitializing) {
      await delay(100);
    }
    return;
  }

  if (!client || !coreDatabase) {
    try {
      isInitializing = true;
      await tryConnect();
    } finally {
      isInitializing = false;
    }
  }
}

async function ensureConnection(dbName: 'core'): Promise<Db> {
  while (true) {
    try {
      if (!client || !coreDatabase) {
        await initializeConnection();
      }

      if (!client) {
        throw new Error('CLIENT_INIT_FAILED');
      }

      if (!coreDatabase) {
        throw new Error('DATABASE_INIT_FAILED');
      }

      await client.db(dbName).command({ ping: 1 });

      return coreDatabase;
    } catch (error) {
      console.error(`LOST_CONNECTION_TO_${dbName}_DATABASE:`, error);

      if (client) {
        await client.close().catch(() => {});
        client = null;
        coreDatabase = null;
      }

      await delay(1000);
    }
  }
}

export const coreDB = async (): Promise<Db> => {
  return ensureConnection('core');
};
