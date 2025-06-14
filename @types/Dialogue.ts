export interface Dialogue {
  accountId: string;
  groupId: string;

  messages?: Array<{ id: number; text: string; fromId: string; date: number }>;
  recipientId: string;
  recipientTitle: string;
  recipientBio: string | null;
  recipientPhone: string | null;
  recipientUsername: string;

  lead?: boolean;
  viewed?: boolean;
  stopped?: boolean;
  blocked?: boolean;
  managerMessage?: string;
  lastOnline?: number;
  read?: boolean;

  dateCreated: Date;
  dateUpdated: Date;
}
