import axios from 'axios';

import { Account } from '../../@types/Account';
import { Dialogue } from '../../@types/Dialogue';
import { FullFroupIdType } from '../../widgets/startup-widget/startup-widget.types';
import { urls } from '../urls';

class FrontendService {
  async get<T>(url: string, params?: any) {
    return (await axios(url, { params }))?.data as T;
  }

  getDialogueInfo(id: string) {
    return this.get<Dialogue | null>(urls.dialogueInfo, { id });
  }

  getDialogueIds(
    groupId: string,
    activeTab:
      | 'Все'
      | 'Диалоги'
      | 'Лиды'
      | 'Ручное управление'
      | 'Заблокированные',
    viewed: boolean,
    search: string,
    minStage: number = 3
  ) {
    return this.get<Array<string> | null>(urls.dialogueIds, {
      groupId,
      activeTab,
      viewed,
      search,
      minStage,
    });
  }

  getDialogues(groupId: string) {
    return this.get<Array<{ dateCreated: Date; messages: number }> | null>(
      urls.dialogues,
      {
        groupId,
      }
    );
  }

  getAccountData(username: string) {
    return this.get<Account | null>(urls.accountData, {
      username,
    });
  }

  postDialogueInfo(
    id: string,
    data: { blocked?: boolean; viewed?: boolean },
    incognito: boolean
  ) {
    if (incognito) {
      delete data['viewed'];
    }

    return axios.post<void>(urls.dialogueInfo, { id, data });
  }

  updateGroupIDInfo(data: FullFroupIdType) {
    return axios.post<void>(urls.groupIdUpdate, data);
  }

  getDocumentCountsByGroupId(groupId: string, search: string) {
    return this.get<{ [key: string]: number }>(urls.dialogueCounts, {
      groupId,
      search,
    });
  }

  gptGenerate(
    messages: {
      role: string;
      content: string;
    }[]
  ): Promise<{
    data: { message: { content: { type: string; text: string }[] } };
  }> {
    const result = axios.post(urls.gptGenerate, {
      messages,
    });

    return result;
  }

  gptLiteGenerate(
    messages: {
      role: string;
      content: string;
    }[],
    tools: any
  ): Promise<{
    data: { message: { content: { type: string; text: string }[] } };
  }> {
    const result = axios.post(urls.gptLiteGenerate, {
      messages,
      tools,
    });

    return result;
  }

  getAllGroupId() {
    return this.get<
      Array<{
        _id: string;
        groupId: string;
        name: string;
        target: number;
        currentCount: number;
        stopped?: boolean;
      }>
    >(urls.groupId, {});
  }

  getGroupId(groupId: string) {
    return this.get<FullFroupIdType>(`${urls.groupId}/${groupId}`, {});
  }

  async getDialoguesData(
    type: 'leads' | 'sent' | 'unsent' | 'blocked' | 'dialogs',
    groupId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ) {
    const params: any = {
      type,
      groupId,
    };

    if (dateRange) {
      params.startDate = dateRange.startDate.toISOString();
      params.endDate = dateRange.endDate.toISOString();
    }

    const response = await axios.get(urls.export, { params });
    return response.data;
  }
}

const FrontendApi = new FrontendService();
export default FrontendApi;
