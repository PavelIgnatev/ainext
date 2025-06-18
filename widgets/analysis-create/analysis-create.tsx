import { Typography } from 'antd';
import React from 'react';

import type { Analysis } from '@/@types/Analysis';
import { AnalysisCreateForm } from './__form/analysis-create__form';

import classes from './analysis-create.module.css';

interface AnalysisCreateProps {
  loading?: boolean;
  onFinish: (data: Omit<Analysis, 'dialogs' | 'companyId'>) => void;
  onFinishFailed: () => void;
}

export const AnalysisCreate = (props: AnalysisCreateProps) => {
  const { loading = false, onFinish, onFinishFailed } = props;

  return (
    <div className={classes.analysisCreate}>
      <Typography.Title
        level={1}
        className={classes.head}
        style={{ margin: 0 }}
      >
        Разборы 🤖
      </Typography.Title>
      <AnalysisCreateForm
        loading={loading}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      />
    </div>
  );
};
