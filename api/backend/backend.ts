import axios from 'axios';

import { Dialogue } from '../../@types/Dialogue';

const { MongoClient, Db, Collection, ObjectId } = require('mongodb');

class BackendService {
  private client: typeof MongoClient | null;
  private db: typeof Db | null;
  private collection: typeof Collection | null;

  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;

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
    this.collection = this.db.collection(process.env.MONGODB_COLLECTION);
  }

  async getDialogue(id: string): Promise<Dialogue | null> {
    await this.connect();

    const dialogue = await this.collection?.findOne({ _id: new ObjectId(id) });

    return dialogue || null;
  }

  async getDialoguesData(
    type: 'leads' | 'sent' | 'dialogs',
    groupId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<Dialogue[]> {
    await this.connect();

    const query: any = { groupId };
    if (type === 'leads') {
      query['lead'] = true;
    }

    if (type === 'dialogs') {
      query['messages.2'] = { $exists: true };
    }

    if (dateRange) {
      query['dateCreated'] = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      };
    }

    const dialogues = await this.collection
      ?.find(
        { ...query },
        {
          projection: {
            _id: 0,
            recipientPhone: 1,
            recipientUsername: 1,
            blocked: 1,
            reason: 1,
            automaticReason: 1,
            dateCreated: 1,
            dateUpdated: 1,
            step: 1,
          },
        }
      )
      .toArray();

    return (dialogues || []).map((d: any) => ({
      phone: d.recipientPhone
        ? d.recipientPhone
        : d.recipientUsername?.includes('+')
          ? d.recipientUsername
          : null,
      username: d.recipientUsername,
      step: d.step,
      blocked: d.blocked || d.automaticReason || d.reason ? 1 : 0,
      dateCreated: d.dateFound || d.dateCreated,
      dateUpdated: d.dateUpdated,
    }));
  }

  async postDialogue(id: string, data: { blocked?: boolean }): Promise<void> {
    await this.connect();

    await this.collection?.updateOne(
      { _id: new ObjectId(id) },
      { $set: data },
      { upsert: true }
    );
  }

  async getDocumentCountsByGroupId(
    groupId: string,
    search: string = ''
  ): Promise<{ [key: string]: number }> {
    await this.connect();

    const baseQuery: {
      groupId: string;
      $text?: { $search: string };
      viewed?: { $ne: true };
    } = {
      groupId,
      viewed: { $ne: true },
    };

    if (search) {
      baseQuery['$text'] = { $search: search };
    }

    const queries = [
      { ...baseQuery },
      {
        ...baseQuery,
        'messages.2': { $exists: true },
        blocked: { $ne: true },
        stopped: { $ne: true },
      },
      { ...baseQuery, lead: true },
      { ...baseQuery, stopped: true, blocked: { $ne: true } },
      { ...baseQuery, blocked: true },
    ];

    const counts = await Promise.all(
      queries.map(async (query, index) => {
        const count = await this.collection?.countDocuments(query);
        return { [`condition${index + 1}`]: count || 0 };
      })
    );

    return Object.assign({}, ...counts);
  }

  async getIdsByGroupId(
    groupId: string,
    activeTabe:
      | 'Все'
      | 'Диалоги'
      | 'Лиды'
      | 'Ручное управление'
      | 'Заблокированные',
    viewed: boolean,
    search: string = '',
    minStage: number = 3
  ): Promise<string[]> {
    await this.connect();

    const query: {
      groupId: string;
      $text?: { $search: string };
      viewed?: boolean | { $ne: true };
      lead?: boolean;
      stopped?: { $ne: true } | boolean;
      blocked?: { $ne: true } | boolean;
      $or?: Array<{
        dateCreated?: { $gte: Date; $lte: Date };
        dateUpdated?: { $gte?: Date; $lte?: Date };
      }>;
      [key: string]: any;
    } = { groupId };

    const dateMatch = search.match(/d:(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

      query['$or'] = [
        { dateCreated: { $gte: startOfDay, $lte: endOfDay } },
        { dateUpdated: { $gte: startOfDay, $lte: endOfDay } },
      ];
    } else if (search) {
      query['$text'] = { $search: search };
    }

    if (activeTabe === 'Диалоги') {
      query['blocked'] = { $ne: true };
      query['stopped'] = { $ne: true };
      query[`messages.${minStage - 1}`] = { $exists: true };
    }

    if (activeTabe === 'Лиды') {
      query['lead'] = true;
    }

    if (activeTabe === 'Ручное управление') {
      query['stopped'] = true;
      query['blocked'] = { $ne: true };
    }

    if (activeTabe === 'Заблокированные') {
      query['blocked'] = true;
    }

    const priorityQuery = { ...query, viewed: { $ne: true } };
    const nonPriorityQuery = { ...query, viewed: true } as any;

    const priorityIds = await this.collection?.distinct('_id', priorityQuery);
    const nonPriorityIds = await this.collection?.distinct(
      '_id',
      nonPriorityQuery
    );

    return (priorityIds || []).concat(viewed ? nonPriorityIds || [] : []);
  }

  async getDialoguesByGroupId(groupId: string): Promise<Dialogue[]> {
    await this.connect();

    const result = await this.collection
      ?.find(
        { groupId },
        {
          projection: {
            dateCreated: 1,
            messages: { $size: '$messages' },
            _id: 0,
          },
        }
      )
      .toArray();

    return result || [];
  }

  async gptGenerate(
    messages: {
      role: string;
      content: string;
    }[]
  ): Promise<string> {
    const gptData: Record<string, unknown> = {
      k: 30,
      temperature: 1,
      presence_penalty: 0.8,
      p: 0.95,
      model: 'command-a-03-2025',
      messages,
    };

    const { data } = await axios.post('http://91.198.220.234/chatv2', gptData);

    return data;
  }

  async gptLiteGenerate(
    messages: {
      role: string;
      content: string;
    }[],
    tools: any
  ): Promise<string> {
    const gptData: Record<string, unknown> = {
      temperature: 1,
      model: 'command-a-03-2025',
      messages,
      response_format: tools,
    };

    const { data } = await axios.post('http://91.198.220.234/chatv2', gptData);

    return data;
  }

  async gptMiniGenerate(
    messages: {
      role: string;
      content: string;
    }[]
  ): Promise<string> {
    const { data } = await axios.post('http://91.198.220.234/chatv2', {
      k: 30,
      temperature: 0.4,
      presence_penalty: 0.5,
      p: 0.7,
      model: 'command-a-03-2025',
      messages,
    });

    return data;
  }

  async getBlockedDialogues(
    groupId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<Dialogue[]> {
    await this.connect();

    const query: any = {
      groupId,
      blocked: true,
    };

    if (dateRange) {
      query['dateCreated'] = {
        $gte: dateRange.startDate,
        $lte: dateRange.endDate,
      };
    }

    const dialogues = await this.collection
      ?.find(
        { ...query },
        {
          projection: {
            _id: 0,
            recipientPhone: 1,
            recipientUsername: 1,
            blocked: 1,
            reason: 1,
            automaticReason: 1,
            dateCreated: 1,
            dateUpdated: 1,
          },
        }
      )
      .toArray();

    return (dialogues || []).map((d: any) => ({
      phone: d.recipientPhone
        ? d.recipientPhone
        : d.recipientUsername?.includes('+')
          ? d.recipientUsername
          : null,
      username: d.recipientUsername,
      blocked: 1,
      reason: d.reason || d.automaticReason || 'Заблокирован',
      dateCreated: d.dateCreated,
      dateUpdated: d.dateUpdated,
    }));
  }
}

const BackendApi = new BackendService();
export default BackendApi;
