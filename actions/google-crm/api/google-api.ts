import { google, Auth } from 'googleapis';
import { withRetry } from '../utils/retry';
import { BatchUpdateRequest } from '../@types/google-crm';

class GoogleAPI {
  private sheets: ReturnType<typeof google.sheets>;
  private drive: ReturnType<typeof google.drive>;

  constructor(auth: Auth.OAuth2Client) {
    this.sheets = google.sheets({ version: 'v4', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async createSpreadsheet(title: string) {
    const response = await withRetry(async () => {
      return await this.sheets.spreadsheets.create({
        requestBody: { properties: { title } },
      });
    });
    const { spreadsheetId } = response.data;

    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID__NOT_FOUND');
    }

    return spreadsheetId;
  }

  async getSpreadsheet(spreadsheetId: string) {
    return await withRetry(async () => {
      return await this.sheets.spreadsheets.get({ spreadsheetId });
    });
  }

  async getValues(spreadsheetId: string, range: string = 'A:Z') {
    const values = await withRetry(async () => {
      return await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
    });
    return values.data.values || [];
  }

  async createPermission(
    fileId: string,
    role: string = 'reader',
    type: string = 'anyone'
  ) {
    return await withRetry(async () => {
      return await this.drive.permissions.create({
        fileId,
        requestBody: { role, type },
      });
    });
  }

  async batchUpdate(spreadsheetId: string, requests: BatchUpdateRequest) {
    return await withRetry(async () => {
      return await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
    });
  }

  async updateValues(
    spreadsheetId: string,
    range: string,
    values: (string | number)[][]
  ) {
    return await withRetry(async () => {
      return await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    });
  }
}

export default GoogleAPI;
