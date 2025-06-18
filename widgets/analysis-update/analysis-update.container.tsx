import { notification } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useMutation } from 'react-query';

import FrontendAnalysisApi from '../../api/frontend/analysis';
import { AnalysisUpdate } from './analysis-update';

type analysisUpdateData = {
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
};

type analysisUpdateContainerProps = {
  initialValues: analysisUpdateData;
  companyId: string;
};

const errorText = 'Неизвестная ошибка, попробуйте еще раз.';
const validationErrorText =
  'Ошибка валидации. Проверьте, пожалуйста, заполненные поля.';

export const AnalysisUpdateContainer = (
  props: analysisUpdateContainerProps
) => {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const companyId = props.companyId;
  const toastError = useCallback((description: string) => {
    api['error']({
      message: 'Произошла ошибка.',
      description,
    });
  }, []);

  const {
    mutate: analysisUpdateMutation,
    isLoading: analysisUpdateMutationLoading,
  } = useMutation(
    (data: analysisUpdateData) =>
      FrontendAnalysisApi.updateAnalysis({ ...data, companyId }),
    {
      onSuccess: () => router.reload(),
      onError: () => toastError(errorText),
    }
  );

  return (
    <>
      {contextHolder}
      <AnalysisUpdate
        initialValues={props.initialValues}
        loading={analysisUpdateMutationLoading}
        onFinish={analysisUpdateMutation}
        onFinishFailed={() => toastError(validationErrorText)}
      />
    </>
  );
};
