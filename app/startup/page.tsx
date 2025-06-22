import type { NextPage } from 'next';
import { StartupWidgetContainer } from '@/widgets/startup-widget/startup-widget.container';
import { PasswordGate } from '@/components/password-gate';

import classes from './index.module.css';
import { Header } from '@/components/header/header';

const StartupPage: NextPage = () => (
  <main className={classes.main}>
    <PasswordGate>
      <Header href="https://t.me/aisendercases" target="_blank" />
      <StartupWidgetContainer />
    </PasswordGate>
  </main>
);

export default StartupPage;
