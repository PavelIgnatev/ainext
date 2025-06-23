'use client';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { DialogMessage } from '../../@types/Analysis';
import { AnalysisId } from '../analysis-id/analysis-id';
import { getAnalysisById, updateAnalysis } from '@/actions/db/analysis';
import { useNotifications } from '@/hooks/useNotifications';
import { getAutoResponse } from '@/actions/llm/getAutoResponse';
import { getGreeting } from '@/utils/getGreeting';
import { checkAdmin } from '@/actions/admin/checkAdmin';
import { validateAnalysis } from '@/validations/analysis';

export const AnalysisIdContainer = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showError, contextHolder } = useNotifications();
  const [dialogs, setDialogs] = useState<DialogMessage[][] | null>(null);
  const [currentDialogId, setCurrentDialogId] = useState<number>(0);

  const analysisId = String(params.id);
  const queryDialogId = searchParams.get('dialogId');

  const { data: analysisData = null, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const result = await getAnalysisById(analysisId);
      if (!result) {
        throw new Error('разбор не найден');
      }

      return result;
    },
    enabled: !!analysisId,
    retry: false,
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ['admin'],
    queryFn: checkAdmin,
    retry: false,
  });

  const { mutate: autoResponseMutation, isPending: isAutoResponseLoading } =
    useMutation({
      mutationFn: async (dialogue: DialogMessage[]) => {
        if (!analysisData) {
          throw new Error('Данные разбора недоступны');
        }

        validateAnalysis(analysisData);

        const response = await getAutoResponse();

        const assistantMessage: DialogMessage = {
          role: 'assistant',
          content: response,
        };
        const finalDialog = [...dialogue, assistantMessage];

        if (!dialogs) {
          throw new Error('Диалоги не инициализированы');
        }

        const finalDialogs = dialogs.map((dialog, index) =>
          index === currentDialogId ? finalDialog : dialog
        );

        await updateAnalysis({
          ...analysisData,
          dialogs: finalDialogs,
        });

        return finalDialogs;
      },
      onSuccess: (dialogs) => setDialogs(dialogs),
      onError: (error) => showError(error.message),
    });

  const updateUrlDialogId = useCallback(
    (dialogId: number) => {
      const targetDialogId = String(dialogId + 1);

      if (searchParams.get('dialogId') === targetDialogId) return;

      const newParams = new URLSearchParams(searchParams);
      newParams.set('dialogId', targetDialogId);

      router.replace(`?${newParams.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleNewDialog = useCallback(async () => {
    if (!analysisData) {
      showError('Данные разбора недоступны');
      return;
    }

    if (!dialogs) {
      showError('Диалоги не инициализированы');
      return;
    }

    const updatedDialogs = [
      ...dialogs,
      [
        {
          role: 'assistant',
          content: getGreeting(analysisData.language, analysisData.userName),
        },
        {
          role: 'assistant',
          content: analysisData.firstQuestion,
        },
      ] as DialogMessage[],
    ];

    try {
      await updateAnalysis({
        ...analysisData,
        dialogs: updatedDialogs,
      });
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Ошибка при создании нового диалога'
      );
      return;
    }

    setDialogs(updatedDialogs);

    queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] });

    setCurrentDialogId(updatedDialogs.length - 1);
    updateUrlDialogId(updatedDialogs.length - 1);
  }, [
    dialogs,
    analysisData,
    showError,
    updateUrlDialogId,
    queryClient,
    analysisId,
  ]);

  const handleSaveMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      if (!dialogs) {
        showError('Диалоги не инициализированы');
        return;
      }

      const userMessage: DialogMessage = { role: 'user', content: message };
      const currentDialog = dialogs[currentDialogId];

      if (!currentDialog) {
        showError('Текущий диалог не найден');
        return;
      }

      const updatedDialogWithUser = [...currentDialog, userMessage];

      const dialogsWithUserMessage = dialogs.map((dialog, index) =>
        index === currentDialogId ? updatedDialogWithUser : dialog
      );

      setDialogs(dialogsWithUserMessage);
      autoResponseMutation(updatedDialogWithUser);
    },
    [dialogs, currentDialogId, autoResponseMutation, showError]
  );

  const handleDialogSelect = useCallback(
    (newDialogId: number) => {
      if (newDialogId === currentDialogId) return;

      setCurrentDialogId(newDialogId);
      updateUrlDialogId(newDialogId);
    },
    [currentDialogId, updateUrlDialogId]
  );

  const getMessages = useCallback(() => {
    if (!dialogs || !dialogs[currentDialogId]) {
      return [];
    }
    return dialogs[currentDialogId];
  }, [dialogs, currentDialogId]);

  useEffect(() => {
    if (!dialogs && analysisData?.dialogs) {
      setDialogs(analysisData.dialogs);

      const queryDialogIndex = queryDialogId
        ? parseInt(queryDialogId, 10) - 1
        : null;

      const targetDialogId =
        queryDialogIndex !== null &&
        queryDialogIndex >= 0 &&
        queryDialogIndex < analysisData.dialogs.length
          ? queryDialogIndex
          : analysisData.dialogs.length - 1;

      setCurrentDialogId(targetDialogId);
      updateUrlDialogId(targetDialogId);
    }
  }, [analysisData, queryDialogId, dialogs, updateUrlDialogId]);

  return (
    <>
      {contextHolder}
      <AnalysisId
        isAdmin={isAdmin}
        analysis={analysisData}
        analysisId={String(analysisId)}
        messages={getMessages()}
        isMessageLoading={isAutoResponseLoading}
        isAnalysisLoading={isAnalysisLoading}
        currentDialogId={currentDialogId}
        onNewDialog={handleNewDialog}
        onSaveMessage={handleSaveMessage}
        onDialogSelect={handleDialogSelect}
      />
    </>
  );
};
