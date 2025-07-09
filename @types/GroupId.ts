export type GroupId = {
  groupId: string;

  name: string;
  target: number;
  currentCount: number;
  messagesCount: number;

  aiRole: string;
  companyDescription: string;
  goal: string;

  firstMessagePrompt: string;
  secondMessagePrompt: string;

  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';

  leadDefinition: string;
  leadGoal: string;

  part: string | null;
  flowHandling: string | null;
  addedInformation: string | null;
  addedQuestion: string | null;
};
