'use client';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import type { Analysis } from '@/@types/Analysis';
import { useNotifications } from '@/hooks/useNotifications';

import { AnalysisUpdate } from './analysis-update';
import { updateAnalysis } from '@/actions/db/analysis';
import { getGreeting } from '@/utils/getGreeting';

interface AnalysisUpdateContainerProps {
  analysis: Analysis | null;

  className?: string;
}

export const AnalysisUpdateContainer = (
  props: AnalysisUpdateContainerProps
) => {
  const { analysis = null, className } = props;
  const router = useRouter();
  const { showError, showSuccess, contextHolder } = useNotifications();

  const { mutate: handleUpdate, isPending: isCreateLoading } = useMutation({
    mutationFn: (data: Omit<Analysis, 'dialogs' | 'companyId'>) => {
      const randomCompanyId = String(Math.random()).substring(2, 12);
      const analysisData: Analysis = {
        ...data,
        companyId: analysis?.companyId || randomCompanyId,
        dialogs: analysis?.dialogs || [
          [
            {
              role: 'assistant',
              content: getGreeting(data.language, data.userName),
            },
            {
              role: 'assistant',
              content: data.firstQuestion,
            },
          ],
        ],
      };

      return updateAnalysis(analysisData);
    },
    onSuccess: (id) => {
      if (!analysis?.companyId) {
        router.push(`/analysis/${id}`);
      } else {
        showSuccess('Разбор успешно обновлен. Перезагружаем страницу...');
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
    },
    onError: (error) => showError(error.message),
  });

  return (
    <>
      {contextHolder}
      <AnalysisUpdate
        loading={isCreateLoading}
        analysis={analysis}
        onFinish={handleUpdate}
        onFinishFailed={() =>
          showError(
            'Ошибка валидации. Проверьте, пожалуйста, заполненные поля.'
          )
        }
        className={className}
      />
    </>
  );
};
