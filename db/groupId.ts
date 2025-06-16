'use server';
import { GroupId } from '@/@types/GroupId';
import { headers } from 'next/headers';
import { getClientIp } from 'request-ip';
import { coreDB } from './db';
import { Collection } from 'mongodb';

export async function getGroupIds(search?: string) {
  try {
    const db = await coreDB();
    const collection = db.collection('groupId');

    const query: Record<string, unknown> = {};
    if (search) {
      query.$text = { $search: search };
    }

    const groupIds = await collection
      .find<Pick<GroupId, 'groupId' | 'name' | 'target' | 'currentCount'>>(
        query,
        {
          projection: {
            _id: 0,
            groupId: 1,
            name: 1,
            target: 1,
            currentCount: 1,
          },
        }
      )
      .sort({ dateUpdated: -1 })
      .toArray();

    return groupIds;
  } catch {
    throw new Error('GET_GROUP_IDS_ERROR');
  }
}

export async function getGroupId(gId: string): Promise<GroupId | null> {
  try {
    const db = await coreDB();
    const collection = db.collection('groupId');

    const groupId = await collection.findOne<GroupId>(
      {
        groupId: gId,
      },
      { projection: { _id: 0, history: 0 } }
    );

    return groupId;
  } catch {
    throw new Error('GET_GROUP_ID_ERROR');
  }
}

export async function updateGroupId(groupIdData: GroupId) {
  try {
    const headersList = headers() as unknown as Headers;
    const headersObj = Object.fromEntries(headersList.entries());

    const db = await coreDB();
    const collection = db.collection('groupId') as Collection<GroupId>;

    const { groupId, ...changes } = groupIdData;

    await collection.updateOne(
      {
        groupId,
      },
      {
        $set: {
          ...changes,
          dateUpdated: new Date(),
        },
        $push: {
          history: {
            changes,
            metadata: {
              ip: getClientIp({ headers: headersObj }) || 'unknown',
              userAgent: headersList.get('user-agent') || 'unknown',
              language: headersList.get('accept-language') || 'unknown',
              referer: headersList.get('referer') || 'unknown',
              host: headersList.get('host') || 'unknown',
            },
            date: new Date(),
          },
        },
        $setOnInsert: { dateCreated: new Date() },
      },
      { upsert: true }
    );
  } catch {
    throw new Error('UPDATE_GROUP_ID_ERROR');
  }
}
