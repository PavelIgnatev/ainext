import { notification } from 'antd';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useMutation } from 'react-query';

import FrontendAnalysisApi from '../../api/frontend/analysis';
import { AnalysisCreate } from './analysis-create';

type analysisCreateData = {
  companyName: string;
  aiRole: string;
  companyDescription: string;
  goal: string;
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';

  styleGuide?: string;
  addedQuestion?: string;
  part?: string;
  firstQuestion?: string;
};

const errorText = 'Неизвестная ошибка, попробуйте еще раз.';
const validationErrorText =
  'Ошибка валидации. Проверьте, пожалуйста, заполненные поля.';

export const AnalysisCreateContainer = () => {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();

  const toastError = useCallback((description: string) => {
    api['error']({
      message: 'Произошла ошибка.',
      description,
    });
  }, []);

  const {
    mutate: analysisCreateMutation,
    isLoading: analysisCreateMutationLoading,
  } = useMutation(
    (data: analysisCreateData) => FrontendAnalysisApi.createAnalysis(data),
    {
      onSuccess: ({ data }) => router.push(`/analysis/${data}`),
      onError: () => toastError(errorText),
    }
  );

  return (
    <>
      {contextHolder}
      <AnalysisCreate
        loading={analysisCreateMutationLoading}
        onFinish={analysisCreateMutation}
        onFinishFailed={() => toastError(validationErrorText)}
      />
    </>
  );
};
