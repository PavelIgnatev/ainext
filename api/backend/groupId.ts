import { FullFroupIdType } from '../../widgets/startup-widget/startup-widget.types';

const { MongoClient, Db, Collection } = require('mongodb');

const removeDuplicates = (arr: any) => {
  const result = [];
  const seen = {};
  for (const item of arr) {
    const lowerItem = item.toLowerCase();
    // @ts-ignore
    if (!seen[lowerItem]) {
      // @ts-ignore
      seen[lowerItem] = true;
      result.push(item);
    }
  }
  return result;
};

class BackendGroupIdService {
  private client: typeof MongoClient | null;
  private db: typeof Db | null;
  private collection: typeof Collection | null;
  private collectionUsers: typeof Collection | null;

  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.collectionUsers = null;

    this.connect = this.connect.bind(this);
  }

  async connect(): Promise<void> {
    if (this.client) {
      return;
    }

    this.client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.db = this.client.db(process.env.MONGODB_NAME);
    this.collection = this.db.collection('groupId');
    this.collectionUsers = this.db.collection('groupIdUsers');
  }

  async getGroupId() {
    await this.connect();

    const groupId =
      (await this.collection
        ?.find(
          {},
          {
            projection: {
              groupId: 1,
              target: 1,
              currentCount: 1,
              stopped: 1,
              name: 1,
            },
          }
        )
        ?.sort({ dateUpdated: -1 })
        ?.toArray()) || [];

    if (!groupId) {
      throw new Error('No groupId found');
    }

    return groupId;
  }

  async getGroupIdById(groupId: string) {
    await this.connect();

    const fullFroupId =
      (await this.collection?.findOne(
        { groupId },
        {
          projection: {
            history: 0,
            database: 0,
            dateUpdated: 0,
            _id: 0,
          },
        }
      )) || null;

    const currentTime = new Date(new Date().toISOString());
    const pastTime = new Date(currentTime.getTime() - 180 * 60000);

    const database = await this.collectionUsers
      .find(
        {
          g: groupId,
          s: { $ne: true },
          f: { $ne: true },
          $or: [
            { p: { $exists: false } },
            { p: null },
            { p: { $lt: pastTime } },
          ],
        },
        {
          projection: {
            u: 1,
            _id: 0,
          },
        }
      )
      .toArray();

    if (!fullFroupId) {
      return null;
    }

    return {
      ...fullFroupId,
      database: database.map(({ u }: { u: string }) => u),
    };
  }

  async updateGroupID(ip: string, data: FullFroupIdType) {
    await this.connect();

    const { groupId, database, ...rest } = data;

    const currentTime = new Date(new Date().toISOString());
    const pastTime = new Date(currentTime.getTime() - 180 * 60000);

    await this.collectionUsers?.deleteMany({
      g: data.groupId, // groupId
      s: { $ne: true }, // sender
      f: { $ne: true }, // failed
      $or: [{ p: { $exists: false } }, { p: null }, { p: { $lt: pastTime } }],
    });

    const us = await this.collectionUsers.distinct('u', {
      g: data.groupId,
      $or: [{ s: true }, { f: true }, { p: { $gte: pastTime } }],
    });
    const existingUsernames = new Set(
      us.map((username: string) => username.toLowerCase())
    );
    await this.collectionUsers?.insertMany(
      // @ts-ignore
      removeDuplicates(
        database.map((username: string) => username.toLowerCase())
      )
        .filter((username) => !existingUsernames.has(username))
        .map((username) => ({
          g: groupId,
          u: username.toLowerCase(),
        }))
    );

    await this.collection?.updateOne(
      { groupId },
      {
        $set: { groupId, ...rest, database: null, dateUpdated: new Date() },
        $push: {
          history: {
            ip,
            data: rest,
            dateUpdated: new Date(),
          },
        },
      },
      { upsert: true }
    );

    return data.groupId;
  }

  async getFailedDialogues(
    groupId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ) {
    await this.connect();

    const query: any = { g: groupId, f: true };

    if (dateRange) {
      query['p'] = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      };
    }

    const users = await this.collectionUsers
      .find(query, {
        projection: {
          _id: 0,
          u: 1,
          r: 1,
          p: 1,
        },
      })
      .toArray();

    return (users || []).map((u: any, index: number) => ({
      id: index,
      contact: u.u,
      reason:
        u.r === 'PHONE_NOT_OCCUPIED' ||
        u.r === 'USERNAME_NOT_OCCUPIED' ||
        u.r === 'USER_NOT_FOUND' ||
        u.r === 'CONTACT_NOT_RESOLVED' ||
        u.r === 'ACCESS_HASH_NOT_FOUND' ||
        u.r === 'CONTACT_USER_EMPTY' ||
        u.r === 'CONTACT_USERS_LENGTH'
          ? 'Не найден'
          : u.r === 'USER_SPECIAL_PARAMS'
            ? 'Не смогли написать'
            : u.r === 'DIALOG_DUPLICATE'
              ? 'Диалог уже существует'
              : 'Неизвестно',
      date: u.p,
    }));
  }
}

const BackendApi = new BackendGroupIdService();
export default BackendApi;
