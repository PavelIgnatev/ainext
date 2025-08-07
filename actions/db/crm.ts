'use server';
import { Crm } from '@/@types/Crm';
import { coreDB } from './db';
import { Collection } from 'mongodb';
import { validateCrm } from '@/schemas/crm';

export async function getCrmByGroupId(groupId: string): Promise<Crm | null> {
  try {
    const db = await coreDB();
    const collection = db.collection('crm');

    const crm = await collection.findOne<Crm>(
      {
        groupId,
      },
      { projection: { _id: 0 } }
    );

    return crm;
  } catch {
    throw new Error('GET_CRM_BY_GROUP_ID_ERROR');
  }
}

export async function updateCrmByGroupId(crmData: Crm) {
  try {
    validateCrm(crmData);

    const db = await coreDB();
    const collection = db.collection('crm') as Collection<Crm>;

    const { groupId, ...changes } = crmData;

    await collection.updateOne(
      {
        groupId,
      },
      {
        $set: {
          ...changes,
          dateUpdated: new Date(),
        },
        $setOnInsert: { dateCreated: new Date() },
      },
      { upsert: true }
    );
  } catch {
    throw new Error('UPDATE_CRM_BY_GROUP_ID_ERROR');
  }
}

export async function changeCRMGroupId(
  prevGroupId: string,
  newGroupId: string
) {
  try {
    const db = await coreDB();
    const collection = db.collection('crm');

    await collection.updateMany(
      {
        groupId: prevGroupId,
      },
      {
        $set: {
          groupId: newGroupId,
        },
      }
    );
  } catch {
    throw new Error('CRM_CHANGE_GROUP_ID_ERROR');
  }
}

export async function deleteCrmByGroupId(groupId: string) {
  try {
    const db = await coreDB();
    const collection = db.collection('crm');

    await collection.deleteOne({ groupId });
  } catch {
    throw new Error('DELETE_CRM_BY_GROUP_ID_ERROR');
  }
}
