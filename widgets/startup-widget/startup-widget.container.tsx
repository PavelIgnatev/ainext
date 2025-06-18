'use client';
import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import { StartupWidget } from './startup-widget';
import { GroupId } from '@/@types/GroupId';
import { getGroupId, getGroupIds, updateGroupId } from '@/db/groupId';
import { useNotifications } from '@/hooks/useNotifications';
import { getGroupIdUsers, updateGroupIdUsers } from '@/db/groupIdUsers';

const DEBOUNCE_DELAY = 300;

export const StartupWidgetContainer = () => {
  const queryClient = useQueryClient();
  const { contextHolder, showError, showSuccess } = useNotifications();
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
      await updateGroupIdUsers(data.groupId, database);
      await updateGroupId(data);
    },
    onSuccess: () => {
      showSuccess('Информация успешно обновлена');
      queryClient.invalidateQueries({ queryKey: ['groupId', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupIdDatabse', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupIds'] });
    },
    onError: () => {
      showError('Произошла ошибка. Обновите страницу и попробуйте снова.');
    },
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
