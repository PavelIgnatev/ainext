import { Typography } from 'antd';

import { Header } from '../header/header';
import { AnalysisCreateForm } from './__form/analysis-create__form';
import classes from './analysis-create.module.css';

interface AnalysisCreateProps {
  loading?: boolean;

  onFinish: (data: {
    aiRole: string;
    messagesCount: number;
    companyName: string;
    companyDescription: string;
    goal: string;
    language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';

    addedInformation?: string;
    styleGuide?: string;
    addedQuestion?: string;
    flowHandling?: string;
    part?: string;
    firstQuestion?: string;
  }) => void;
  onFinishFailed: () => void;
}

export const AnalysisCreate = (props: AnalysisCreateProps) => {
  const { loading = false, onFinish, onFinishFailed } = props;

  return (
    <div className={classes.analysisCreate}>
      <Typography.Title
        level={1}
        style={{ margin: '1em 0', textAlign: 'center' }}
      >
        Создание разбора под компанию
      </Typography.Title>
      <AnalysisCreateForm
        loading={loading}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      />
    </div>
  );
};
