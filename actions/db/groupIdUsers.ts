'use server';

import { coreDB } from './db';
import { GroupIdUsers } from '@/@types/GroupIdUsers';
import { validateGroupIdUsers } from '@/schemas/groupIdUsers';

const filterDatabase = (database: string[]): string[] => {
  return [
    ...new Set(
      database
        .map((u: string) => u.trim().toLowerCase())
        .filter((u: string) => u.length >= 3)
    ),
  ];
};

export async function getGroupIdUsers(groupId: string) {
  try {
    const db = await coreDB();
    const collection = db.collection('groupIdUsers');

    const users = await collection
      .find<GroupIdUsers>(
        {
          g: groupId,
          s: { $ne: true },
          f: { $ne: true },
          $or: [{ p: { $exists: false } }, { p: null }],
        },
        {
          projection: {
            _id: 0,
            u: 1,
          },
        }
      )
      .toArray();

    const workingUsers = await collection
      .find<GroupIdUsers>(
        {
          g: groupId,
          s: { $ne: true },
          f: { $ne: true },
          p: { $ne: null },
        },
        {
          projection: {
            _id: 0,
            u: 1,
          },
        }
      )
      .toArray();

    return {
      users: filterDatabase(users.map(({ u }) => u)),
      workingDatabase: filterDatabase(workingUsers.map(({ u }) => u)),
    };
  } catch {
    throw new Error('GET_GROUP_ID_USERS_ERROR');
  }
}

export const updateGroupIdUsers = async (
  groupId: string,
  database: string[]
) => {
  try {
    validateGroupIdUsers(database, groupId);

    const db = await coreDB();
    const collection = db.collection('groupIdUsers');

    await collection.deleteMany({
      g: groupId,
      s: { $ne: true },
      f: { $ne: true },
      $or: [{ p: { $exists: false } }, { p: null }],
    });

    const existingUsernames = await collection.distinct('u', {
      g: groupId,
      $or: [{ s: true }, { f: true }, { p: { $ne: null } }],
    });

    const existingUsernamesSet = new Set(
      existingUsernames.map((username: string) => username.toLowerCase())
    );

    const newUsers = filterDatabase(database)
      .filter((username: string) => !existingUsernamesSet.has(username))
      .map((username: string) => ({
        g: groupId,
        u: username,
      }));

    if (newUsers.length > 0) {
      await collection.insertMany(newUsers);
    }
  } catch {
    throw new Error('UPDATE_GROUP_ID_USERS_ERROR');
  }
};

export async function changeGroupIdUsersGroupId(
  prevGroupId: string,
  newGroupId: string
) {
  try {
    const db = await coreDB();
    const collection = db.collection('groupIdUsers');

    await collection.updateMany(
      {
        g: prevGroupId,
      },
      {
        $set: {
          g: newGroupId,
        },
      }
    );
  } catch {
    throw new Error('USERS_CHANGE_GROUP_ID_ERROR');
  }
}
