export type DialogMessage = {
  role: 'assistant' | 'user';
  content: string;
};

export type Analysis = {
  companyId: string;
  aiRole: string;
  companyDescription: string;
  companyName: string;
  goal: string;
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';
  meName: string;
  messagesCount: number;
  meGender: string;
  userName: string;
  userGender: string;
  firstQuestion: string;

  part: string | null;
  flowHandling: string | null;
  addedInformation: string | null;
  addedQuestion: string | null;
  leadDefinition: string;
  leadTargetAction: string;

  dialogs: DialogMessage[][];
};
