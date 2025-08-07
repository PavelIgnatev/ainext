'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

import { AccountsWidget } from './accounts-widget';
import { AccountGroup } from './accounts-widget.types';
import { getGroupedAccounts } from '@/actions/db/accounts';

const DEBOUNCE_DELAY = 300;

export const AccountsWidgetContainer = () => {
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [debouncedSearch] = useDebounce(search, DEBOUNCE_DELAY);
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const groups = await getGroupedAccounts();
        setAccountGroups(groups);
      } catch (error) {
        console.error('Error loading account groups:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const filteredGroups = accountGroups.filter((group) =>
    group.groupName.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <AccountsWidget
      search={search}
      accountGroups={filteredGroups}
      selectedAccount={selectedAccount}
      loading={loading}
      onSearchChange={setSearch}
      onAccountClick={setSelectedAccount}
      onCloseDetails={() => setSelectedAccount(null)}
    />
  );
};
