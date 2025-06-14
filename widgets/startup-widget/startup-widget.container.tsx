import { notification } from 'antd';
import { useCallback, useState } from 'react';
import { QueryClient, useMutation, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';

import FrontendApi from '../../api/frontend/frontend';
import { StartupWidget } from './startup-widget';
import { FullFroupIdType } from './startup-widget.types';

function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
}

export const StartupWidgetContainer = () => {
  const [api, context] = notification.useNotification();
  const [startupId, setStartupId] = useState<string | null>(null);

  const toastError = useCallback((description: string) => {
    api['error']({
      message: 'Произошла ошибка.',
      description,
      duration: 5,
    });
  }, []);

  const { data: groupIds = [], isLoading: groupIdLoading } = useQuery(
    'groupIds',
    () => FrontendApi.getAllGroupId(),
    {
      onError: () =>
        toastError('Произошла ошибка. Обновите страницу и попробуйте снова.'),
      refetchInterval: 60000,
    }
  );

  const { data: startupIdData = null, isFetching: startupIdLoading } = useQuery(
    ['groupId', startupId],
    () =>
      startupId
        ? FrontendApi.getGroupId(String(startupId))
        : Promise.resolve(null),
    {
      onError: () =>
        toastError('Произошла ошибка. Обновите страницу и попробуйте снова.'),
      enabled: !!startupId,
      keepPreviousData: false,
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const { mutate: startupUpdateMutation, isLoading: startupUpdateLoading } =
    useMutation(
      (data: FullFroupIdType) => FrontendApi.updateGroupIDInfo(data),
      {
        onError: () =>
          toastError('Произошла ошибка. Обновите страницу и попробуйте снова.'),
      }
    );

  const { mutate: exportData } = useMutation(
    async ({
      type,
      startupId,
    }: {
      type: 'leads' | 'sent' | 'unsent';
      startupId: string;
    }) => {
      const response = await fetch(
        `/api/export?type=${type}&groupId=${startupId}`
      );
      if (!response.ok) {
        toastError(
          'Произошла ошибка при скачивании файла. Обновите страницу и попробуйте снова.'
        );
        throw new Error('Failed to export data');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${startupId}_${type}_${getFormattedDate()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  );

  const handleDataExport = useCallback(
    (type: 'leads' | 'sent' | 'unsent') => {
      if (!startupId) return;

      exportData({ type, startupId });
    },
    [exportData, startupId]
  );

  return (
    <>
      {context}
      <StartupWidget
        startupId={startupId}
        startupIdData={startupIdData}
        startupIdLoading={startupIdLoading || startupUpdateLoading}
        groupId={groupIds}
        loading={groupIdLoading}
        onClickStartupId={(startupId: string) => {
          setStartupId(startupId);
        }}
        onCloseStartupWidgetDrawer={() => setStartupId(null)}
        onSubmitStartupWidget={(e) => startupUpdateMutation(e)}
        onExportLeads={() => handleDataExport('leads')}
        onExportSent={() => handleDataExport('sent')}
        onExportUnsent={() => handleDataExport('unsent')}
      />
      ;
    </>
  );
};

export const getServerSideProps = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery('groupId', () => FrontendApi.getAllGroupId());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
