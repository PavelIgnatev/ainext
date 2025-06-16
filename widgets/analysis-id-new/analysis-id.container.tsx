import { notification } from 'antd';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import FrontendAnalysisApi from '../../api/frontend/analysis';
import { extractLastQuestion } from '../../utils/extractLastQuestion';
import { getDateNow } from '../../utils/getDateNow';
import { makeRequestAnalysis } from '../../utils/makeRequestAnalysis';
import { makeRequestGptMessages } from '../../utils/makeRequestGptMessages';
import { AnalysisId } from '../analysis-id/analysis-id';

export const AnalysisIdNewContainer = () => {
  const router = useRouter();
  const { id: companyId, dialogId: queryDialogId } = router.query;
  const [api, contextHolder] = notification.useNotification();
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant' | 'system'; content: string }>[]
  >([]);
  const [dialogId, setDialogId] = useState(0);
  const initialDialogId = queryDialogId
    ? parseInt(queryDialogId as string, 10) - 1
    : -1;

  const toastError = useCallback((description: string) => {
    api['error']({
      message: 'Произошла ошибка.',
      description,
      duration: 5,
    });
  }, []);
  const {
    data: analysisData,
    isLoading: analysisLoading,
    refetch: refetchAnalysisData,
  } = useQuery(
    'analysisById',
    () =>
      companyId
        ? FrontendAnalysisApi.getAnalysisByCompanyId(String(companyId))
        : Promise.resolve(null),
    {
      enabled: !!companyId,
      staleTime: Infinity,
      onError: () => router.push('/'),
    }
  );

  const defaultDialogues = [
    {
      role: 'assistant' as const,
      content: `Здравствуйте, ${analysisData?.userName}!`,
    },
    {
      role: 'assistant' as const,
      content:
        analysisData?.firstQuestion ||
        `Я заметил, что вы явялетесь представителем XXX, это так?`,
    },
  ];

  const defaultDialoguesEnglish = [
    {
      role: 'assistant' as const,
      content: `Hello, ${analysisData?.userName}!`,
    },
    {
      role: 'assistant' as const,
      content:
        analysisData?.firstQuestion ||
        `I notice that you are a representative of XXX, is that correct?`,
    },
  ];
  const defaultDialoguesUkrainian = [
    {
      role: 'assistant' as const,
      content: `Вiтаю, ${analysisData?.userName}!`,
    },
    {
      role: 'assistant' as const,
      content:
        analysisData?.firstQuestion ||
        `Я помітив, що ви є представником XXX, це так?`,
    },
  ];

  const { mutate: postAnalysisByCompanyId } = useMutation(
    ({
      companyId,
      messages,
    }: {
      companyId: string;
      messages: Array<{
        role: 'assistant' | 'system' | 'user';
        content: string;
      }>[];
    }) => FrontendAnalysisApi.postAnalysisByCompanyId(companyId, messages),
    { onSuccess: () => refetchAnalysisData() }
  );

  const { mutate: getResponse, isLoading: isResponseLoading } = useMutation(
    async (
      dialogue: Array<{
        role: 'assistant' | 'system' | 'user';
        content: string;
      }>
    ) => {
      return postGenerateLLM({ dialogue, reason: '' });
    }
  );

  const { mutate: postGenerateLLM, isLoading: postGenerateLLMLoading } =
    useMutation(
      async ({
        dialogue,
        reason,
      }: {
        dialogue: Array<{
          role: 'assistant' | 'system' | 'user';
          content: string;
        }>;
        reason: string;
      }) => {
        const part =
          analysisData &&
          analysisData.part &&
          dialogue.filter((e) => e.role === 'user').length === 2
            ? analysisData.part.trim()
            : null;

        const {
          meName = '',
          userName = '',
          meGender = '',
          userGender = '',
          aiRole = '',
          goal = '',
          companyDescription = '',
          flowHandling = '',
          addedInformation = '',
          language = 'RUSSIAN',
          messagesCount = 4,
        } = analysisData || {};
        const isGoaled =
          goal && dialogue.filter((e) => e.role === 'user').length >= 2;
        const is1 = dialogue.filter((e) => e.role === 'user').length === 1;
        const is2Only = dialogue.filter((e) => e.role === 'user').length == 2;
        const is2 = dialogue.filter((e) => e.role === 'user').length <= 2;

        if (!analysisData?.firstQuestion) {
          throw new Error('Сначала добавьте "Первый вопрос"');
        }

        if (
          analysisData.part &&
          !goal
            .toLowerCase()
            .trim()
            .includes(analysisData.part.toLowerCase().trim())
        ) {
          throw new Error(
            'Значение секции *Уникальная часть* не найдено внутри секции *Целевое действие*'
          );
        }

        const datas: Record<string, string> = {
          'Роль AI менеджера': aiRole,
          'Целевое действие': goal,
          'Описание компании': companyDescription,
          'Обработка сценариев': flowHandling,
          'Дополнительная информация': addedInformation,
        };
        Object.keys(datas).forEach((str) => {
          const value = datas[str];

          if (/[?!]/.test(value)) {
            throw new Error(
              `Поле "${str}" содержит недопустимые символы: ? или !`
            );
          }
        });

        const datas2: Record<string, string> = {
          'Дополнительный вопрос': analysisData.addedQuestion || '',
        };
        Object.keys(datas2).forEach((str) => {
          const value = datas2[str];

          if (/[!.:]/.test(value)) {
            throw new Error(
              `Поле "${str}" содержит недопустимые символы: !, : или .`
            );
          }
        });

        const datas3: Record<string, string> = {
          'Первый вопрос': analysisData.firstQuestion,
        };
        Object.keys(datas3).forEach((str) => {
          const value = datas3[str];

          if (/[!:]/.test(value)) {
            throw new Error(
              `Поле "${str}" содержит недопустимые символы: ! или :`
            );
          }
        });

        const generatedMessage = await makeRequestGptMessages(
          [
            {
              role: 'system',
              content: `<ASSISTANT_IDENTITY>
  [NAME]${meName}[/NAME]
  [GENDER] ${meGender}[/GENDER]
  [ROLE] ${aiRole}[/ROLE]
  [IMPORTANT_GOAL] ** generate response, according to the format: main part (**${Math.round(
    messagesCount - 1
  )} sentences**) + mandatory question (targeted, not complex) on the end **. Minimal length of response: **${
    messagesCount * 55
  } characters**, consisting of around **${
    messagesCount * 8
  } words** and approximately **${messagesCount} sentences**. **It is imperative that you meet these requirements exactly in terms of length and response format**. [/IMPORTANT_GOAL]
  ${isGoaled ? `[MISSION] ${goal}[/MISSION]` : ''}
  [COMPANY_OFFERING] ${companyDescription}[/COMPANY_OFFERING]
  ${
    !is1 && flowHandling
      ? `[DIALOGUE_FLOW] ${flowHandling}[/DIALOGUE_FLOW]`
      : ''
  }
  [CONTEXTUAL_DATA] You work with cold traffic, conducting unsolicited communications to potential clients via Telegram messenger. Your interaction is “cold”, meaning you initiate contact with a user who has not interacted with you before. Communication and possible communication with the user takes place via text messages only. It is important to note that neither you nor the user know each other or have met in real life. The user doesn't know you or the context of your message. You offer various services and solutions in an effort to convert these cold potential customers into interested ones. Never under any circumstances apologize in your reply;\n${
    !is1 && addedInformation ? addedInformation : ''
  }[/CONTEXTUAL_DATA]
  [CURRENT_DATE_TIME]${getDateNow()}[/CURRENT_DATE_TIME]
</ASSISTANT_IDENTITY>

<USER_PROFILE>
  [NAME]${userName}[/NAME]
  [GENDER]${userGender}[/GENDER]
  [STATUS]First-time contact[/STATUS]
  [KNOWLEDGE]Zero prior interaction[/KNOWLEDGE]
</USER_PROFILE>

<ASSISTANT_RESPONSE_STYLE_GUIDE> 
  [RESPONSE_LENGTH]
    ** strictly ** be approximately **${
      messagesCount * 55
    } characters** in length, consisting of around **${
      messagesCount * 8
    } words** and approximately **${messagesCount} sentences**. **It is imperative that you meet these length requirements exactly**
  [/RESPONSE_LENGTH]

  [LANGUAGE]
    ** ONLY ${language.toUpperCase()}**
  [/LANGUAGE]

  ${
    part
      ? `[IMPORTANT_RESPONSE_PART] Ensure the phrase "${part}" is **meaningfully integrated** into the reply, not just randomly added. Adjust your reply so that it flows naturally with this phrase. [/IMPORTANT_RESPONSE_PART]`
      : ''
  }

  ${
    analysisData?.addedQuestion
      ? `[IMPORTANT_RESPONSE_QUESTION] ${analysisData?.addedQuestion}[/IMPORTANT_RESPONSE_QUESTION]`
      : ''
  }

  [IMPORTANT_RULES]
    - **Don't forget to ask a leading question to further engage the user**. End your response with a simple, easy-to-answer question that flows naturally from the conversation and further engages the user. It should be a question that helps to better understand the user.
    - ** mandatory question should be targeted, not complex **
    - Never apologize in your reply, under any circumstances. **don't apologize**
    - Do not use generic greetings like "Hello" or "Hi".
    - Never use the name of the interlocutor, any form of personal address, or title such as “client,” “interlocutor,” “respected,” and so on
    - Use the company description to craft your reply, highlighting relevant points for the user.
    - Focus on providing value based on the company's offerings.
    - Avoid making assumptions about the user's profession or activities.
    - ** Minimum reply length 200 characters **
  [/IMPORTANT_RULES]
</ASSISTANT_RESPONSE_STYLE_GUIDE>`,
            },
            ...dialogue,
          ],
          part || '',
          language,
          is1,
          is2,
          is2 ? 3 : 2,
          true
        );

        return generatedMessage;
      },

      {
        onSuccess: (content) => {
          setMessages((p) => {
            const lastQuestion = extractLastQuestion(content);

            if (lastQuestion) {
              p[dialogId] = [
                ...p[dialogId],
                {
                  role: 'assistant' as const,
                  content: content.replace(lastQuestion, ''),
                },
                { role: 'assistant' as const, content: lastQuestion },
              ];
            } else {
              p[dialogId] = [
                ...p[dialogId],
                {
                  role: 'assistant' as const,
                  content,
                },
              ];
            }

            postAnalysisByCompanyId({
              messages: p,
              companyId: String(companyId),
            });

            return p;
          });
        },
        onError: (error: any) => {
          toastError(
            error?.message ||
              'Произошла неизвестная ошибка при попытки ответа, пожалуйста, обновите страницу и попробуйте еще раз'
          );
        },
      }
    );

  useEffect(() => {
    if (
      analysisData &&
      analysisData.dialogs &&
      dialogId !== analysisData.dialogs.length
    ) {
      if (initialDialogId >= 0 && analysisData.dialogs[initialDialogId]) {
        if (initialDialogId !== dialogId || !dialogId) {
          setDialogId(initialDialogId);

          setMessages(analysisData.dialogs);
        }
      } else {
        setDialogId(analysisData.dialogs.length - 1);

        setMessages(analysisData.dialogs);
        router.replace(
          {
            query: {
              ...router.query,
              dialogId: analysisData.dialogs.length,
            },
          },
          undefined,
          {
            shallow: true,
          }
        );
      }
    }
  }, [analysisData, dialogId]);

  const handleNewDialog = () => {
    if (messages?.[dialogId]?.length <= 2) {
      toastError(
        `Не получилось начать новый диалог.
        Пожалуйста, ответьте на сообщения Ai Менеджера, после чего попробуйте снова.`
      );
    } else if (messages && messages[dialogId]) {
      setMessages((p) => {
        const newMessages = [
          ...p,
          analysisData?.language === 'ENGLISH'
            ? defaultDialoguesEnglish
            : analysisData?.language === 'UKRAINIAN'
              ? defaultDialoguesUkrainian
              : defaultDialogues,
        ];

        postAnalysisByCompanyId({
          messages: newMessages,
          companyId: String(companyId),
        });

        return newMessages;
      });

      setDialogId(messages.length);
      router.replace(
        { query: { ...router.query, dialogId: messages.length + 1 } },
        undefined,
        {
          shallow: true,
        }
      );
    }
  };
  const handleSaveMessage = (message: string) => {
    if (message) {
      setMessages((p) => {
        p[dialogId] = [...p[dialogId], { role: 'user', content: message }];

        try {
          getResponse(p[dialogId]);
        } catch {}

        return p;
      });
    }
  };
  const handleHistoryDialogClick = (dialogId: number) => {
    setDialogId(dialogId);
    router.replace(
      { query: { ...router.query, dialogId: dialogId + 1 } },
      undefined,
      {
        shallow: true,
      }
    );
  };
  return (
    <>
      {contextHolder}

      <AnalysisId
        analysisData={analysisData}
        companyId={String(companyId)}
        analysisLoading={analysisLoading}
        messages={messages?.[dialogId] || []}
        onNewDialog={handleNewDialog}
        onSaveMessage={handleSaveMessage}
        onHistoryDialogClick={handleHistoryDialogClick}
        messageLoading={postGenerateLLMLoading || isResponseLoading}
      />
    </>
  );
};
