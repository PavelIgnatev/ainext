import type { NextPage } from 'next';
import { AccountsWidgetContainer } from '@/widgets/accounts-widget/accounts-widget.container';
import { PasswordGate } from '@/components/password-gate';

import classes from './index.module.css';
import { Header } from '@/components/header/header';

const AccountsPage: NextPage = () => (
  <main className={classes.main}>
    <PasswordGate>
      <Header href="https://t.me/aisendercases" target="_blank" />
      <AccountsWidgetContainer />
    </PasswordGate>
  </main>
);

export default AccountsPage;
