export interface Crm {
  _id?: string;
  type: 'amo' | 'bitrix' | 'api';
  groupId: string;
  webhook: string;
}
