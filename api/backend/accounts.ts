const { MongoClient, Db, Collection } = require('mongodb');

class BackendAccountService {
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
    this.collection = this.db.collection('accounts');
  }

  async readAccount(username: string) {
    await this.connect();

    return await this.collection.findOne(
      { accountId: username },
      { projection: { banned: 1, firstName: 1, _id: 0, username: 1 } }
    );
  }
}

const BackendApi = new BackendAccountService();
export default BackendApi;
