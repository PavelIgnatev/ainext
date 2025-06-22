import type { NextPage } from 'next';

import { AnalysisIdContainer } from '@/widgets/analysis-id/analysis-id.container';

import classes from './index.module.css';
import { Header } from '@/components/header/header';

const AnalysisIdPage: NextPage = () => {
  return (
    <main className={classes.main}>
      <Header href="https://t.me/aisendercases" target="_blank" />

      <div className={classes.content}>
        <AnalysisIdContainer />
      </div>
    </main>
  );
};

export default AnalysisIdPage;
