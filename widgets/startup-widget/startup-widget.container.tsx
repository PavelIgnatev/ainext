'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import { StartupWidget } from './startup-widget';
import { GroupId } from '@/@types/GroupId';
import { Crm } from '@/@types/Crm';
import { getGroupId, getGroupIds, updateGroupId } from '@/actions/db/groupId';
import { useNotifications } from '@/hooks/useNotifications';
import { getGroupIdUsers, updateGroupIdUsers } from '@/actions/db/groupIdUsers';
import {
  getCrmByGroupId,
  updateCrmByGroupId,
  deleteCrmByGroupId,
} from '@/actions/db/crm';
import { validateGroupId } from '@/schemas/groupId';
import { validateGroupIdUsers } from '@/schemas/groupIdUsers';
import { createGoogleTable } from '@/actions/google-crm/oauth-sheets';
import { validateCrm } from '@/schemas/crm';

const DEBOUNCE_DELAY = 300;

const compareGroupIdData = (
  current: GroupId | null,
  initial: GroupId | null
): boolean => {
  if (!current && !initial) return false;
  if (!current || !initial) return true;

  const fieldsToCompare: (keyof GroupId)[] = [
    'name',
    'target',
    'messagesCount',
    'language',
    'aiRole',
    'companyDescription',
    'goal',
    'leadDefinition',
    'leadGoal',
    'firstMessagePrompt',
    'secondMessagePrompt',
    'part',
    'flowHandling',
    'addedInformation',
    'addedQuestion',
  ];

  return fieldsToCompare.some((field) => current[field] !== initial[field]);
};

const compareDatabaseData = (current: string[], initial: string[]): boolean => {
  if (current.length !== initial.length) return true;
  return current.some((item, index) => item !== initial[index]);
};

const compareCrmData = (current: Crm | null, initial: Crm | null): boolean => {
  if (!current && !initial) return false;
  if (!current || !initial) return true;

  const currentWebhook = current.webhook?.trim() || '';
  const initialWebhook = initial.webhook?.trim() || '';

  return current.type !== initial.type || currentWebhook !== initialWebhook;
};

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

  const {
    data: groupIdDatabase = { users: [], workingDatabase: [] },
    isLoading: isGroupIdDatabaseLoading,
  } = useQuery({
    queryKey: ['groupIdDatabse', groupId],
    queryFn: async () => {
      try {
        if (!groupId) return { users: [], workingDatabase: [] };

        const result = await getGroupIdUsers(groupId);

        if (!result) {
          showError(
            'Произошла ошибка при загрузке базы данных конкретного запуска'
          );
          return { users: [], workingDatabase: [] };
        }

        return result;
      } catch (error) {
        showError('Произошла ошибка. Обновите страницу и попробуйте снова.');
        return { users: [], workingDatabase: [] };
      }
    },
    enabled: !!groupIdData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: crmData = null, isLoading: isCrmLoading } = useQuery({
    queryKey: ['crm', groupId],
    queryFn: async () => {
      try {
        if (!groupId) return null;

        const result = await getCrmByGroupId(groupId);
        return result;
      } catch (error) {
        showError('Произошла ошибка при загрузке CRM данных');
        return null;
      }
    },
    enabled: !!groupId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    gcTime: 0,
  });

  const { mutate: handleSubmit, isPending: isSubmitLoading } = useMutation({
    mutationFn: async ({
      data,
      database,
      crm,
    }: {
      data: GroupId;
      database: Array<string>;
      crm: Crm | null;
    }) => {
      validateGroupId(data);
      validateGroupIdUsers(database);

      if (crm) {
        validateCrm(crm);
      }

      const isGroupIdChanged = compareGroupIdData(data, groupIdData);
      const isDatabaseChanged = compareDatabaseData(
        database,
        groupIdDatabase.users
      );
      const isCrmChanged = compareCrmData(crm, crmData);

      if (!groupIdData?.googleTableCrmId) {
        const googleCrmLink = await createGoogleTable(data.groupId);
        data.googleTableCrmId = googleCrmLink;
      } else {
        data.googleTableCrmId = groupIdData.googleTableCrmId;
      }

      if (isGroupIdChanged) {
        await updateGroupId(data);
      }

      if (isDatabaseChanged) {
        await updateGroupIdUsers(data.groupId, database);
      }

      if (isCrmChanged) {
        if (crm) {
          await updateCrmByGroupId(crm);
        } else {
          await deleteCrmByGroupId(data.groupId);
        }
      }
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
        crmData={crmData}
        crmLoading={isCrmLoading}
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
