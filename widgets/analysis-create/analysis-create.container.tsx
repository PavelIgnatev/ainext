'use client';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import type { Analysis } from '@/@types/Analysis';
import { useNotifications } from '@/hooks/useNotifications';

import { AnalysisCreate } from './analysis-create';
import { updateAnalysis } from '@/db/analysis';

export const AnalysisCreateContainer = () => {
  const router = useRouter();
  const { contextHolder, showError } = useNotifications();

  const { mutate: handleCreate, isPending: isCreateLoading } = useMutation({
    mutationFn: (data: Omit<Analysis, 'dialogs' | 'companyId'>) => {
      const getGreeting = (
        language: Analysis['language'],
        userName: string
      ) => {
        switch (language) {
          case 'UKRAINIAN':
            return `Вiтаю, ${userName}.`;
          case 'ENGLISH':
            return `Hello, ${userName}.`;
          default:
            return `Здравствуйте, ${userName}.`;
        }
      };

      const analysisData: Analysis = {
        ...data,
        companyId: String(Math.random()).substring(2, 12),
        dialogs: [
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
    onSuccess: (data) => router.push(`/analysis/${data}`),
    onError: (error) =>
      showError(error.message || 'Неизвестная ошибка, попробуйте еще раз.'),
  });

  return (
    <>
      {contextHolder}
      <AnalysisCreate
        loading={isCreateLoading}
        onFinish={handleCreate}
        onFinishFailed={() =>
          showError(
            'Ошибка валидации. Проверьте, пожалуйста, заполненные поля.'
          )
        }
      />
    </>
  );
};
