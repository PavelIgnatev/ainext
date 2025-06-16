import type { NextPage } from 'next';
import { HeaderContainer } from '@/widgets/header/header.container';
import { StartupWidgetContainer } from '@/widgets/startup-widget/startup-widget.container';
import { PasswordGate } from '@/components/PasswordGate';

import classes from './index.module.css';

const StartupPage: NextPage = () => (
  <main className={classes.main}>
    <PasswordGate>
      <HeaderContainer />
      <StartupWidgetContainer />
    </PasswordGate>
  </main>
);

export default StartupPage;
