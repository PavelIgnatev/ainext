'use client';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { DialogMessage, SystemMessage } from '../../@types/Analysis';
import { AnalysisId } from '../analysis-id/analysis-id';
import { getAnalysisById, updateAnalysis } from '@/actions/db/analysis';
import { useNotifications } from '@/hooks/useNotifications';
import { getAutoResponse } from '@/actions/llm/getAutoResponse';
import { getDialogueAnalysis } from '@/actions/llm/getDialogueAnalysis';
import { type DialogueAnalysisResult as LLMDialogueAnalysisResult } from '@/actions/llm/schemas/llmDialogueAnalysis';
import { getGreeting } from '@/utils/getGreeting';
import { checkAdmin } from '@/actions/admin/checkAdmin';
import { validateAnalysis } from '@/schemas/analysis';
import { llmRestoreLinks } from '@/actions/llm/utils/llmLink';
import { calculateAnalysisStage } from '@/utils/analysisHelpers';

const extractLastQuestion = (
  text: string
): { mainText: string; question: string | null } => {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [];

  if (sentences.length === 0) {
    return { mainText: text, question: null };
  }

  const lastSentence = sentences[sentences.length - 1].trim();

  if (lastSentence.endsWith('?')) {
    const mainText = sentences.slice(0, -1).join('').trim();
    return {
      mainText,
      question: lastSentence.charAt(0).toUpperCase() + lastSentence.slice(1),
    };
  }

  return { mainText: text, question: null };
};

export const AnalysisIdContainer = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { showError, contextHolder } = useNotifications();
  const [dialogs, setDialogs] = useState<
    (DialogMessage | SystemMessage)[][] | null
  >(null);
  const [currentDialogId, setCurrentDialogId] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('Печатает');

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
      mutationFn: async (dialogue: (DialogMessage | SystemMessage)[]) => {
        if (!analysisData) {
          throw new Error('Данные разбора недоступны');
        }

        validateAnalysis(analysisData);

        const isCurrentDialogLead = analysisData.leadDialogs?.[currentDialogId];
        const isCurrentDialogNegative =
          analysisData.dialogs?.[currentDialogId]?.find(
            (msg): msg is SystemMessage =>
              msg.role === 'system' && msg.content.status === 'negative'
          ) || false;
        let analysisResult: LLMDialogueAnalysisResult | null = null;
        let responseThink: string | null = null;

        const messages = dialogue.filter(
          (msg): msg is DialogMessage => msg.role !== 'system'
        );

        if (!isCurrentDialogLead && !isCurrentDialogNegative) {
          let currentTry = 0;
          const maxRetries = 5;

          if (messages.length <= 3) {
            analysisResult = {
              status: 'continue',
              reason:
                'Недостаточно данных для анализа. Оценка будет проведена на следующем этапе.',
            };
          } else {
            setLoadingMessage('Анализируем диалог');
            const {
              analysisResult: tempAnalysisResult,
              responseThink: tempResponseThink,
            } = await getDialogueAnalysis(
              {
                companyName: analysisData.companyName,
                leadDefinition: analysisData.leadDefinition,
                language: analysisData.language,
              },
              {
                llmParams: {
                  model: 'command-a-reasoning-08-2025',
                  temperature: 0.1,
                  k: 1,
                  messages,
                },
                onTry: (error) => {
                  currentTry++;
                  setLoadingMessage(
                    `Анализируем диалог (повторная попытка ${currentTry}/${maxRetries})`
                  );
                  if (isAdmin) {
                    console.log(`[DIALOGUE_ANALYSIS_ERROR]`, error);
                  }
                },
                onLogger: (logName, data) => {
                  if (isAdmin) {
                    console.log(`[${logName}]`, data);
                  }
                },
              }
            );

            analysisResult = tempAnalysisResult;
            responseThink = tempResponseThink;
          }

          if (dialogs) {
            const currentSystemMessage = dialogs[currentDialogId]?.find(
              (msg): msg is SystemMessage => msg.role === 'system'
            );

            const stage = analysisResult?.status
              ? calculateAnalysisStage(messages)
              : currentSystemMessage?.content?.stage ||
                calculateAnalysisStage(messages);

            const tempSystemMessage: SystemMessage = {
              role: 'system',
              content: {
                status:
                  analysisResult?.status ||
                  currentSystemMessage?.content?.status ||
                  null,
                reason:
                  analysisResult?.reason ||
                  currentSystemMessage?.content?.reason ||
                  null,
                think:
                  responseThink || currentSystemMessage?.content?.think || null,
                stage,
              },
            };

            const tempDialog = dialogue.filter(
              (msg): msg is DialogMessage => msg.role !== 'system'
            );
            const tempDialogWithSystem = [tempSystemMessage, ...tempDialog];

            const tempDialogs = dialogs.map((dialog, index) =>
              index === currentDialogId ? tempDialogWithSystem : dialog
            );

            setDialogs(tempDialogs);
          }
        }

        const isLead = isCurrentDialogLead || analysisResult?.status === 'lead';

        let autoResponseTry = 0;
        const autoResponseMaxRetries = 5;

        setLoadingMessage('Генерируем ответ');

        const response = await getAutoResponse(
          {
            aiRole: analysisData.aiRole,
            aiAnalysis:
              isLead || messages.length <= 3
                ? ''
                : analysisResult?.reason || '',
            companyDescription: analysisData.companyDescription,
            companyName: analysisData.companyName,
            goal: analysisData.goal,
            language: analysisData.language,
            meName: analysisData.meName,
            messagesCount: analysisData.messagesCount,
            meGender: analysisData.meGender,
            userName: analysisData.userName,
            userGender: analysisData.userGender,
            firstQuestion: analysisData.firstQuestion,
            leadGoal: analysisData.leadGoal,
            part: analysisData.part,
            flowHandling: analysisData.flowHandling,
            addedInformation: analysisData.addedInformation,
            addedQuestion: analysisData.addedQuestion,
          },
          {
            options: { isLead },
            llmParams: {
              model: 'command-a-03-2025',
              k: 30,
              temperature: 1,
              presence_penalty: 0.8,
              p: 0.95,
              messages,
            },
            onTry: () => {
              autoResponseTry++;
              setLoadingMessage(
                `Генерируем ответ (повторная попытка ${autoResponseTry}/${autoResponseMaxRetries})`
              );
            },
            onLogger: (logName, data) => {
              if (isAdmin) {
                console.log(`[${logName}]`, data);
              }
            },
          }
        );

        const { mainText, question } = extractLastQuestion(response.text);

        const processedMainText = llmRestoreLinks({
          ...response,
          text: mainText,
        });
        const finalDialog = [
          ...dialogue,
          {
            role: 'assistant' as const,
            content: processedMainText.replace(/\n/g, '\\n'),
          },
        ];

        if (question) {
          const processedQuestion = llmRestoreLinks({
            ...response,
            text: question,
          });

          finalDialog.push({
            role: 'assistant' as const,
            content: processedQuestion.replace(/\n/g, '\\n'),
          });
        }

        if (!dialogs) {
          throw new Error('Диалоги не инициализированы');
        }

        const finalDialogs = dialogs.map((dialog, index) => {
          if (index === currentDialogId) {
            const dialogWithoutSystem = finalDialog.filter(
              (msg): msg is DialogMessage => msg.role !== 'system'
            );

            const currentSystemMessage = dialog.find(
              (msg): msg is SystemMessage => msg.role === 'system'
            );

            const stage = analysisResult?.status
              ? calculateAnalysisStage(dialogWithoutSystem)
              : currentSystemMessage?.content?.stage ||
                calculateAnalysisStage(dialogWithoutSystem);

            const systemMessage: SystemMessage = {
              role: 'system',
              content: {
                status:
                  analysisResult?.status ||
                  currentSystemMessage?.content?.status ||
                  null,
                reason:
                  analysisResult?.reason ||
                  currentSystemMessage?.content?.reason ||
                  null,
                think:
                  responseThink || currentSystemMessage?.content?.think || null,
                stage,
              },
            };
            return [systemMessage, ...dialogWithoutSystem];
          }
          return dialog;
        });

        const updatedLeadDialogs = { ...analysisData.leadDialogs };
        if (isLead && !isCurrentDialogLead) {
          updatedLeadDialogs[currentDialogId] = true;
        }

        await updateAnalysis({
          ...analysisData,
          dialogs: finalDialogs,
          leadDialogs: updatedLeadDialogs,
        });

        return finalDialogs;
      },
      onSuccess: (dialogs) => {
        setDialogs(dialogs);
        queryClient.invalidateQueries({ queryKey: ['analysis', analysisId] });
      },
      onError: (error) => {
        showError(error.message);
      },
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
        { role: 'system', content: { status: null, reason: null, stage: 0 } },
        {
          role: 'assistant',
          content: getGreeting(analysisData.language, analysisData.userName),
        },
        {
          role: 'assistant',
          content: analysisData.firstQuestion,
        },
      ] as (DialogMessage | SystemMessage)[],
    ];

    try {
      validateAnalysis({
        ...analysisData,
        dialogs: updatedDialogs,
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Ошибка валидации');
      return null;
    }

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
    return dialogs[currentDialogId].filter(
      (msg): msg is DialogMessage => msg.role !== 'system'
    );
  }, [dialogs, currentDialogId]);

  const getSystemMessage = useCallback(() => {
    if (!dialogs || !dialogs[currentDialogId]) {
      return null;
    }
    const systemMessage = dialogs[currentDialogId].find(
      (msg): msg is SystemMessage => msg.role === 'system'
    );
    return systemMessage || null;
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
        systemMessage={getSystemMessage()}
        loadingMessage={loadingMessage}
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
