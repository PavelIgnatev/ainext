import type { NextPage } from 'next';

import { AnalysisIdContainer } from '@/widgets/analysis-id/analysis-id.container';
import { HeaderContainer } from '@/widgets/header/header.container';

import classes from './index.module.css';

const AnalysisIdPage: NextPage = () => {
  return (
    <main className={classes.main}>
      <HeaderContainer />

      <AnalysisIdContainer />
    </main>
  );
};

export default AnalysisIdPage;
