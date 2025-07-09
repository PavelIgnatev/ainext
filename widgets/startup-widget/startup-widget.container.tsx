'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import { StartupWidget } from './startup-widget';
import { GroupId } from '@/@types/GroupId';
import { getGroupId, getGroupIds, updateGroupId } from '@/actions/db/groupId';
import { useNotifications } from '@/hooks/useNotifications';
import { getGroupIdUsers, updateGroupIdUsers } from '@/actions/db/groupIdUsers';
import { validateGroupId } from '@/schemas/groupId';
import { validateGroupIdUsers } from '@/schemas/groupIdUsers';

const DEBOUNCE_DELAY = 300;

export const StartupWidgetContainer = () => {
  const { showError, showSuccess, contextHolder } = useNotifications();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, DEBOUNCE_DELAY);

  const { data: groupIds = [], isLoading: isGroupIdsLoading } = useQuery({
    queryKey: ['groupIds', debouncedSearch],
    queryFn: async () => {
      try {
        const result = await getGroupIds(debouncedSearch);

        if (!result) {
          showError('Произошла ошибка при загрузке всех запусков');
          return [];
        }

        return result;
      } catch (error) {
        showError('Произошла ошибка. Обновите страницу и попробуйте снова.');
        return [];
      }
    },
    refetchInterval: 60000,
  });

  const { data: groupIdData = null, isLoading: isGroupIdLoading } = useQuery({
    queryKey: ['groupId', groupId],
    queryFn: async () => {
      try {
        if (!groupId) return null;

        const result = await getGroupId(groupId);

        if (!result) {
          return null;
        }

        return result;
      } catch (error) {
        showError('Произошла ошибка. Обновите страницу и попробуйте снова.');
        return null;
      }
    },
    enabled: !!groupId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: groupIdDatabase = [], isLoading: isGroupIdDatabaseLoading } =
    useQuery({
      queryKey: ['groupIdDatabse', groupId],
      queryFn: async () => {
        try {
          if (!groupId) return [];

          const result = await getGroupIdUsers(groupId);

          if (!result) {
            showError(
              'Произошла ошибка при загрузке базы данных конкретного запуска'
            );
            return [];
          }

          return result;
        } catch (error) {
          showError('Произошла ошибка. Обновите страницу и попробуйте снова.');
          return [];
        }
      },
      enabled: !!groupIdData,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 0,
      gcTime: 0,
    });

  const { mutate: handleSubmit, isPending: isSubmitLoading } = useMutation({
    mutationFn: async ({
      data,
      database,
    }: {
      data: GroupId;
      database: Array<string>;
    }) => {
      validateGroupId(data);
      validateGroupIdUsers(database);

      await updateGroupIdUsers(data.groupId, database);
      await updateGroupId(data);
    },
    onSuccess: () => {
      showSuccess(
        `Запуск успешно ${groupIdData ? 'обновлен' : 'создан'}. Перезагружаем страницу...`
      );
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    },
    onError: (error) =>
      showError(error instanceof Error ? error.message : 'Неизвестная ошибка'),
  });

  return (
    <>
      {contextHolder}
      <StartupWidget
        search={search}
        groupId={groupId}
        groupIds={groupIds}
        groupIdData={groupIdData}
        groupIdDatabase={groupIdDatabase}
        groupIdDatabaseLoading={isGroupIdDatabaseLoading}
        groupIdLoading={isGroupIdLoading}
        groupIdsloading={isGroupIdsLoading}
        isSubmitLoading={isSubmitLoading}
        onSearchGroupId={setSearch}
        onCloseDrawer={() => setGroupId(null)}
        onSumbitDrawer={handleSubmit}
        onClickGroupId={(groupId: string) => {
          setGroupId(groupId);
        }}
      />
    </>
  );
};
