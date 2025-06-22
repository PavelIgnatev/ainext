import type { NextPage } from 'next';

import { PasswordGate } from '@/components/password-gate';
import { AnalysisUpdateContainer } from '@/widgets/analysis-update/analysis-update.container';
import { AnalysisListContainer } from '@/widgets/analysis-list/analysis-list.container';

import classes from './index.module.css';
import { Header } from '@/components/header/header';
import { Title } from '@/components/title/title';

const CreateAnalysisPage: NextPage = () => (
  <main className={classes.main}>
    <PasswordGate>
      <Header href="https://t.me/aisendercases" target="_blank" />
      <div className={classes.content}>
        <Title className={classes.head}>Разборы 🤖</Title>
        <div className={classes.createContent}>
          <AnalysisUpdateContainer analysis={null} />
          <AnalysisListContainer />
        </div>
      </div>
    </PasswordGate>
  </main>
);

export default CreateAnalysisPage;
