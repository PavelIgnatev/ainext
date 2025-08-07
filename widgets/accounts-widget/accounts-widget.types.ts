export interface Account {
  accountId: string;
}

export interface AccountGroup {
  groupName: string;
  count: number;
  accounts: Account[];
}
