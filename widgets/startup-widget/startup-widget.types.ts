export type GroupIdType = {
  name: string;
  currentCount: number;
  target: number;
  groupId: string;

  offer?: unknown;
  stopped?: boolean;
};

export type FullFroupIdType = {
  groupId: string;
  target: number;
  currentCount: number;

  addedQuestion: string;
  aiRole: string;
  companyDescription: string;
  firstQuestion: string;
  goal: string;
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';
  name: string;
  part: string;
  styleGuide: string;
  database: Array<string>;

  addedInformation?: string;

  flowHandling?: string;
};
