'use server';

import type { Account } from '@/@types/Account';
import { coreDB } from './db';

export async function getGroupedAccounts() {
  const db = await coreDB();
  const collection = db.collection<Account>('accounts');

  const accounts = await collection
    .find({ banned: { $ne: true } }, { projection: { accountId: 1, _id: 0 } })
    .toArray();

  const groups: { [key: string]: typeof accounts } = {
    no_prefix: [],
  };

  for (const account of accounts) {
    const { accountId } = account;

    const parts = accountId.split('-');

    if (parts.length === 1) {
      groups['no_prefix'].push(account);
      continue;
    }

    const prefix = parts.slice(2).join('-');
    if (!groups[prefix]) {
      groups[prefix] = [];
    }

    groups[prefix].push(account);
  }

  return Object.entries(groups).map(([groupName, accounts]) => ({
    groupName,
    count: accounts.length,
    accounts,
  }));
}
