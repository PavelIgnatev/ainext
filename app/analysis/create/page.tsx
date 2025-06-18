import type { NextPage } from 'next';

import { PasswordGate } from '@/components/PasswordGate';
import { HeaderContainer } from '@/widgets/header/header.container';
import { AnalysisCreateContainer } from '@/widgets/analysis-create/analysis-create.container';
import { AnalysisListContainer } from '@/widgets/analysis-list/analysis-list.container';

import classes from './index.module.css';

const CreateAnalysisPage: NextPage = () => (
  <main className={classes.main}>
    <PasswordGate>
      <HeaderContainer />
      <div className={classes.content}>
        <AnalysisCreateContainer />
        <AnalysisListContainer />
      </div>
    </PasswordGate>
  </main>
);

export default CreateAnalysisPage;
