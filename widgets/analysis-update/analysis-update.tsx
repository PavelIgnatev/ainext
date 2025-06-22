import React from 'react';

import type { Analysis } from '@/@types/Analysis';
import { AnalysisUpdateForm } from './__form/analysis-update__form';

import classes from './analysis-update.module.css';

interface AnalysisUpdateProps {
  loading: boolean;
  analysis: Analysis | null;

  className?: string;

  onFinish: (data: Omit<Analysis, 'dialogs' | 'companyId'>) => void;
  onFinishFailed: () => void;
}

export const AnalysisUpdate = (props: AnalysisUpdateProps) => {
  const {
    loading = false,
    analysis = null,
    onFinish,
    onFinishFailed,
    className,
  } = props;

  return (
    <div className={classes.AnalysisUpdate}>
      <AnalysisUpdateForm
        loading={loading}
        analysis={analysis}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className={className}
      />
    </div>
  );
};
