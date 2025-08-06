'use server';

import { coreDB } from './db';

export async function changeDialoguesGroupId(
  prevGroupId: string,
  newGroupId: string
) {
  try {
    const db = await coreDB();
    const collection = db.collection('dialogues');

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
    throw new Error('DI_CHANGE_GROUP_ID_ERROR');
  }
}
