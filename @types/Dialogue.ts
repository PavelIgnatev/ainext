export interface Dialogue {
  groupId: string;
  accountId: string;
  recipientId: string;
  recipientAccessHash: string;
  recipientUsername: string;
  recipientTitle: string;
  recipientBio: string | null;
  recipientPhone: string | null;
  messages: Array<{ id: number; text: string; fromId: string; date: number }>;

  aiName?: string;
  aiGender?: string;

  reason?: string;
  automaticReason?: string;
  managerMessage?: string;

  read?: boolean;

  viewed?: boolean;
  blocked?: boolean;
  stopped?: boolean;

  deletedAndBlocked?: boolean;

  aiStatus?: string;
  aiReason?: string;

  crmSent?: boolean;

  pings?: Array<{ title: string; date: Date }>;

  dateLastOnline?: Date;
  dateLastRead?: Date;
  dateAutoCheck?: Date;
  dateCreated?: Date;
  dateUpdated?: Date;
  crmSentDate?: Date;
}
