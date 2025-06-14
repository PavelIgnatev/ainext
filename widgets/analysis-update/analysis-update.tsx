import { Typography } from 'antd';

import { AnalysisUpdateForm } from './__form/analysis-update__form';

interface AnalysisUpdateProps {
  initialValues: {
    companyName: string;
    aiRole: string;
    companyDescription: string;
    goal: string;
    language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';

    styleGuide?: string;
    addedQuestion?: string;
    flowHandling?: string;
    part?: string;
    firstQuestion?: string;
  };
  loading?: boolean;

  onFinish: (data: {
    aiRole: string;
    companyName: string;
    companyDescription: string;
    goal: string;
    messagesCount: number;
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

export const AnalysisUpdate = (props: AnalysisUpdateProps) => {
  const { loading = false, onFinish, onFinishFailed, initialValues } = props;

  return (
    <div>
      <Typography.Title
        level={1}
        style={{ margin: '1em 0', textAlign: 'center' }}
      >
        Изменение разбора под компанию
      </Typography.Title>
      <AnalysisUpdateForm
        initialValues={initialValues}
        loading={loading}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      />
    </div>
  );
};
