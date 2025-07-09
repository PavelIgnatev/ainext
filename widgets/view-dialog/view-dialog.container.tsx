/*
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';

import FrontendApi from '../../api/frontend/frontend';
import { ViewDialog } from './view-dialog';

dayjs.extend(utc);
dayjs.extend(timezone);

function avgMsgCount(arrays: number[], includeLenOne = true) {
  const result = arrays.reduce(
    (acc, array) => {
      if (array > 2 || includeLenOne) {
        acc.totalMsgCount += array;
        acc.totalArraysCount++;
      }
      return acc;
    },
    { totalMsgCount: 0, totalArraysCount: 0 }
  );

  if (result.totalArraysCount === 0) {
    return 0;
  }

  return result.totalMsgCount / result.totalArraysCount;
}

function getFormattedDate() {
  const now = new Date();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return dayjs(now).tz(userTimezone).format('DD-MM-YYYY_HH-mm-ss');
}
*/

export const ViewDialogContainer = () => {
  return <div>Компонент пока не работает</div>;
};

/*
export const ViewDialogContainer = () => {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentDialogIndex, setCurrentDialogIndex] = useState<number>(0);
  const [managerMessage, setManagerMessage] = useState('');
  const [secondsToRefresh, setSecondsToRefresh] = useState(300);
  const [incognito, setIncognito] = useState<boolean>(
    typeof window !== 'undefined' &&
      localStorage.getItem('incognito') === 'true'
  );
  const [viewed, setViewed] = useState<boolean>(
    typeof window !== 'undefined' &&
      (localStorage.getItem('viewed') === null
        ? true
        : localStorage.getItem('viewed') === 'true')
  );

  const [visibleStatisticsInfo, setVisibleStatisticsInfo] =
    useState<boolean>(false);
  const [visibleSettingsInfo, setVisibleSettingsInfo] =
    useState<boolean>(false);
  const [intervalId, setIntervalId] = useState(null);
  const [activeTab, setActiveTab] = useState<
    'Все' | 'Диалоги' | 'Лиды' | 'Ручное управление' | 'Заблокированные'
  >('Все');
  const [minStage, setMinStage] = useState<number>(
    typeof window !== 'undefined'
      ? Number(localStorage.getItem('minStage')) || 3
      : 3
  );

  const {
    mutate: postDialogueInfoWithoutSuccess,
    isError: postDialogueInfoErrorWithoutSuccess,
  } = useMutation(
    (data: {
      blocked?: boolean;
      viewed?: boolean;
      stopped?: boolean;
      managerMessage?: string;
    }) =>
      currentId
        ? FrontendApi.postDialogueInfo(currentId, data, incognito)
        : Promise.resolve(null)
  );

  const handleViewDialogIdsSuccess = useCallback((data: Array<string>) => {
    if (data && data.length > 0) {
      setCurrentId(data[0]);
      setCurrentDialogIndex(0);
      setManagerMessage('');
    } else {
      setCurrentId(null);
      setManagerMessage('');
    }
  }, []);
  const handleChangeGroupId = useCallback(
    (groupId: string) => {
      setVisibleStatisticsInfo(false);
      postDialogueInfoWithoutSuccess({ viewed: true });
      setGroupId(groupId);
      setManagerMessage('');
      setActiveTab('Все');
    },
    [postDialogueInfoWithoutSuccess]
  );

  const {
    data: viewDialogIdsData,
    isFetching: viewDialogIdsLoading,
    isError: viewDialogIdsError,
    refetch: refetchViewDialogIds,
  } = useQuery(
    'dialogueIds',
    () =>
      groupId
        ? FrontendApi.getDialogueIds(
            groupId,
            activeTab,
            viewed,
            search,
            minStage
          )
        : Promise.resolve([]),
    {
      enabled: !!(groupId && search),
      onSuccess: handleViewDialogIdsSuccess,
      staleTime: Infinity,
    }
  );
  const {
    data: viewDialogCounts,
    isFetching: viewDialogCountsLoading,
    isError: viewDialogCountsError,
    refetch: refetchViewDialogCounts,
  } = useQuery(
    'dialogueCounts',
    () =>
      groupId
        ? FrontendApi.getDocumentCountsByGroupId(groupId, search)
        : Promise.resolve(null),
    {
      enabled: !!(groupId && search),
      staleTime: Infinity,
    }
  );

  const {
    data: viewDialogs,
    isFetching: viewDialogsLoading,
    isError: viewDialogsError,
    refetch: refetchViewDialogs,
  } = useQuery(
    'dialogueMessages',
    () => (groupId ? FrontendApi.getDialogues(groupId) : Promise.resolve([])),
    {
      enabled: !!groupId,
      staleTime: Infinity,
    }
  );

  const {
    data: viewDialogInfoData,
    isFetching: viewDialogInfoLoading,
    isError: viewDialogInfoError,
    refetch: refetchViewDialogInfo,
  } = useQuery(
    'dialogueInfo',
    () =>
      currentId
        ? FrontendApi.getDialogueInfo(currentId)
        : Promise.resolve(null),
    {
      enabled: !!currentId,
      staleTime: Infinity,
      onSuccess: (e) => setAccountId(e?.accountId ?? ''),
    }
  );

  const {
    data: viewAccountData,
    isFetching: viewAccountDataLoading,
    isError: viewAccountDataError,
    refetch: refetchAccountData,
  } = useQuery(
    'accountData',
    () =>
      accountId ? FrontendApi.getAccountData(accountId) : Promise.resolve(null),
    {
      enabled: !!viewDialogInfoData,
      staleTime: Infinity,
    }
  );

  const {
    mutate: postDialogueInfo,
    isError: postDialogueInfoError,
    isLoading: postDialogueInfoLoading,
  } = useMutation(
    (data: { blocked?: boolean; viewed?: boolean; managerMessage?: string }) =>
      currentId
        ? FrontendApi.postDialogueInfo(currentId, data, incognito)
        : Promise.resolve(null),
    { onSuccess: () => refetchViewDialogInfo() }
  );

  const handleNextButtonClick = useCallback(() => {
    const totalDialogs = viewDialogIdsData?.length || 0;
    postDialogueInfoWithoutSuccess({ viewed: true });
    setCurrentDialogIndex((prev) => (prev + 1) % totalDialogs);
    setSecondsToRefresh(300);
  }, [viewDialogIdsData, postDialogueInfoWithoutSuccess, setSecondsToRefresh]);

  const handlePrevButtonClick = useCallback(() => {
    const totalDialogs = viewDialogIdsData?.length || 0;
    postDialogueInfoWithoutSuccess({ viewed: true });
    setCurrentDialogIndex((prev) => (prev - 1 + totalDialogs) % totalDialogs);
    setSecondsToRefresh(300);
  }, [viewDialogIdsData, postDialogueInfoWithoutSuccess, setSecondsToRefresh]);
  const handleManagerMessageChange = useCallback(
    (value: string) => {
      setManagerMessage(value);
    },
    [setManagerMessage]
  );

  const handleManagerMessageSend = useCallback(() => {
    if (viewDialogInfoData?.managerMessage !== managerMessage) {
      postDialogueInfo({ managerMessage });
      setManagerMessage('');
    }
  }, [postDialogueInfo, managerMessage, viewDialogInfoData]);

  const handleChangeIncognito = () => {
    localStorage.setItem('incognito', incognito ? 'false' : 'true');
    setIncognito((p) => !p);
  };
  const handleChangeViewed = () => {
    localStorage.setItem('viewed', viewed ? 'false' : 'true');
    setViewed((p) => !p);
  };
  const handleChangeSearch = (search: string) => {
    setGroupId('');
    setSearch(search);
  };

  const handleChangeMinStage = useCallback((value: number) => {
    localStorage.setItem('minStage', value.toString());
    setMinStage(value);
  }, []);

  const visibleStatistics = useMemo(
    () =>
      Boolean(
        !viewDialogsLoading &&
          viewDialogs &&
          viewDialogs.length > 0 &&
          !viewDialogsError
      ),
    [viewDialogsLoading, viewDialogs, viewDialogsError]
  );
  const statisticsByDay = useMemo(() => {
    if (!visibleStatistics || !viewDialogs) {
      return {};
    }

    return viewDialogs.reduce<{
      [key: string]: { dateCreated: Date; messages: number }[];
    }>((acc, cur) => {
      const { dateCreated } = cur;
      const dateUTC = new Date(dateCreated).toISOString(); // Convert to ISO string in UTC

      // Parse the ISO string and create a UTC date object
      const dateUTCObj = new Date(dateUTC);

      // Get the UTC date components
      const year = dateUTCObj.getUTCFullYear();
      const month = dateUTCObj.getUTCMonth();
      const day = dateUTCObj.getUTCDate();

      const utcDate = new Date(Date.UTC(year, month, day));

      const dayTimestamp = utcDate.getTime();

      if (!acc[dayTimestamp]) {
        acc[dayTimestamp] = [];
      }

      acc[dayTimestamp].push(cur);

      return acc;
    }, {});
  }, [visibleStatistics, viewDialogs]);
  const averageDialogDuration = useMemo(() => {
    if (!visibleStatistics || !viewDialogs) {
      return 0;
    }

    return avgMsgCount(
      viewDialogs.map((dialog) => dialog?.messages ?? 0),
      true
    );
  }, [visibleStatistics, viewDialogs]);

  const averageDialogDurationIfResponse = useMemo(() => {
    if (!visibleStatistics || !viewDialogs) {
      return 0;
    }

    return avgMsgCount(
      viewDialogs.map((dialog) => dialog?.messages ?? 0),
      false
    );
  }, [visibleStatistics, viewDialogs]);

  const messagesToDialog = useMemo(() => {
    if (!visibleStatistics || !viewDialogs) {
      return 0;
    }

    return (
      (viewDialogs.filter((dialog) => dialog.messages && dialog.messages > 2)
        .length /
        viewDialogs.length) *
      100
    );
  }, [visibleStatistics, viewDialogs]);

  const visibleSendMessage = useMemo(() => {
    if (managerMessage) {
      return true;
    }

    return true;
  }, [managerMessage]);

  const accountStatus = useMemo(() => {
    if (viewAccountDataLoading) {
      return 'Ожидание...';
    }

    if (viewAccountDataError || !viewAccountData) {
      return 'Заблокирован';
    }

    if (!viewAccountData.banned) {
      return 'Активен';
    }

    return 'Заблокирован';
  }, [viewAccountDataLoading, viewAccountData, viewAccountDataError]);

  const getExportFileName = (type: string, dateRange?: [Date, Date]) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const datePart = dateRange
      ? `_${dayjs(dateRange[0]).tz(userTimezone).format('DD-MM-YYYY')}_${dayjs(dateRange[1]).tz(userTimezone).format('DD-MM-YYYY')}`
      : '_all-time';
    const timestamp = dayjs().tz(userTimezone).format('DD-MM-YYYY_HH-mm');
    return `${groupId}_${type}${datePart}_${timestamp}.csv`;
  };

  const { mutate: exportData, isLoading: exportDataLoading } = useMutation(
    async ({
      type,
      startupId,
      dateRange,
    }: {
      type: 'leads' | 'sent' | 'unsent' | 'blocked' | 'dialogs';
      startupId: string;
      dateRange?: [Date, Date];
    }) => {
      const params = new URLSearchParams({
        type,
        groupId: startupId,
      });

      if (dateRange) {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const [start, end] = dateRange;
        params.append('startDate', dayjs(start).tz(userTimezone).toISOString());
        params.append('endDate', dayjs(end).tz(userTimezone).toISOString());
      }

      const response = await FrontendApi.getDialoguesData(
        type,
        startupId,
        dateRange
          ? {
              startDate: dateRange[0],
              endDate: dateRange[1],
            }
          : undefined
      );

      // Добавляем BOM для корректного отображения кириллицы в Excel
      const BOM = '\uFEFF';
      const csvContent = BOM + response;

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getExportFileName(type, dateRange);
      a.click();
      window.URL.revokeObjectURL(url);
      return response;
    },
    {
      onError: (error) => {
        toast.error('Ошибка при экспорте данных. Попробуйте еще раз.');
      },
    }
  );

  const [currentExportType, setCurrentExportType] = useState<
    'leads' | 'sent' | 'unsent' | 'blocked' | 'dialogs' | null
  >(null);

  const handleDataExport = useCallback(
    async (
      type: 'leads' | 'sent' | 'unsent' | 'blocked' | 'dialogs',
      dateRange?: [Date, Date]
    ) => {
      if (!groupId) return;
      setCurrentExportType(type);
      await exportData(
        { type, startupId: groupId, dateRange },
        {
          onSettled: () => {
            setCurrentExportType(null);
          },
        }
      );
    },
    [exportData, groupId]
  );

  useEffect(() => {
    if (groupId && activeTab) {
      refetchViewDialogIds();
    }
  }, [groupId, activeTab]);

  useEffect(() => {
    if (groupId) {
      refetchViewDialogs();
    }
  }, [groupId, refetchViewDialogs]);

  useEffect(() => {
    if (groupId) {
      setSecondsToRefresh(300);
      refetchViewDialogCounts();
    }
  }, [groupId, setSecondsToRefresh, refetchViewDialogCounts]);

  useEffect(() => {
    if (currentId) {
      refetchViewDialogInfo();
      setAccountId('');
    }
  }, [currentId, refetchViewDialogInfo, setAccountId]);

  useEffect(() => {
    if (viewDialogIdsData && viewDialogIdsData[currentDialogIndex]) {
      setCurrentId(viewDialogIdsData[currentDialogIndex]);
    }
  }, [currentDialogIndex, viewDialogIdsData]);

  useEffect(() => {
    if (viewDialogIdsError) {
      setCurrentId(null);

      toast.error('Произошла ошибка. Попробуйте еще раз.');
    }
  }, [viewDialogIdsError]);

  useEffect(() => {
    if (viewDialogInfoError) {
      toast.error('Произошла ошибка. Попробуйте еще раз.');
    }
  }, [viewDialogInfoError]);

  useEffect(() => {
    if (viewAccountDataError) {
      toast.error('Произошла ошибка. Попробуйте еще раз.');
    }
  }, [viewAccountDataError]);

  useEffect(() => {
    if (postDialogueInfoError || postDialogueInfoErrorWithoutSuccess) {
      toast.error('Произошла ошибка. Попробуйте еще раз.');
    }
  }, [postDialogueInfoError, postDialogueInfoErrorWithoutSuccess]);

  useEffect(() => {
    if (viewDialogCountsError) {
      toast.error('Произошла ошибка. Попробуйте еще раз.');
    }
  }, [viewDialogCountsError]);

  useEffect(() => {
    refetchAccountData();
  }, [accountId, refetchAccountData]);

  useEffect(() => {
    if (viewDialogIdsData?.length === 0) {
      setSearch('');
      setGroupId('');
    }
  }, [viewDialogIdsData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!viewAccountData || viewAccountData.banned) {
        return;
      }

      setSecondsToRefresh((prevSeconds) => {
        if (prevSeconds === 1) {
          refetchViewDialogInfo();
          refetchAccountData();
          return 300;
        } else {
          return prevSeconds - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    intervalId,
    setIntervalId,
    viewAccountData,
    refetchViewDialogInfo,
    refetchAccountData,
    secondsToRefresh,
  ]);

  const handleStatistics = useCallback(() => {
    setVisibleStatisticsInfo((prev) => !prev);
    setVisibleSettingsInfo(false);
  }, []);

  const handleSettings = useCallback(() => {
    setVisibleSettingsInfo((prev) => !prev);
    setVisibleStatisticsInfo(false);
  }, []);

  return (
    <ViewDialog
      activeTab={activeTab}
      search={search}
      viewDialogCounts={viewDialogCounts}
      secondsToRefresh={secondsToRefresh}
      onChangeActiveTab={(value: typeof activeTab) => {
        setActiveTab(value);
        setSecondsToRefresh(300);
        refetchViewDialogCounts();
      }}
      incognito={incognito}
      viewed={viewed}
      minStage={minStage}
      currentDialogIndex={currentDialogIndex}
      postDialogueInfo={postDialogueInfo}
      viewDialogInfoLoading={viewDialogInfoLoading || viewDialogCountsLoading}
      viewDialogIdsData={viewDialogIdsData}
      viewDialogInfoData={viewDialogInfoData}
      viewDialogIdsLoading={viewDialogIdsLoading}
      viewAccountData={viewAccountData}
      viewAccountDataLoading={viewAccountDataLoading}
      postDialogueInfoLoading={postDialogueInfoLoading}
      viewDialogIdsError={viewDialogIdsError}
      viewDialogInfoError={viewDialogInfoError}
      onChangeGroupId={handleChangeGroupId}
      onNextButtonClick={handleNextButtonClick}
      onPrevButtonClick={handlePrevButtonClick}
      visibleStatistics={visibleStatistics}
      statisticsByDay={statisticsByDay}
      visibleSendMessage={visibleSendMessage}
      visibleStatisticsInfo={visibleStatisticsInfo}
      visibleSettingsInfo={visibleSettingsInfo}
      onStatistics={handleStatistics}
      onSettings={handleSettings}
      accountStatus={accountStatus}
      averageDialogDuration={averageDialogDuration}
      averageDialogDurationIfResponse={averageDialogDurationIfResponse}
      messagesToDialog={messagesToDialog}
      onManagerMessageChange={handleManagerMessageChange}
      managerMessageValue={managerMessage}
      onManagerMessageSend={handleManagerMessageSend}
      messagesDialogCount={viewDialogInfoData?.messages?.length || 0}
      onChangeIncognito={handleChangeIncognito}
      onChangeViewed={handleChangeViewed}
      onChangeMinStage={handleChangeMinStage}
      onChangeSearch={handleChangeSearch}
      onExportLeads={(dateRange) => handleDataExport('leads', dateRange)}
      onExportSent={(dateRange) => handleDataExport('sent', dateRange)}
      onExportUnsent={(dateRange) => handleDataExport('unsent', dateRange)}
      onExportBlocked={(dateRange) => handleDataExport('blocked', dateRange)}
      onExportDialogs={(dateRange) => handleDataExport('dialogs', dateRange)}
      exportLoading={{
        leads: exportDataLoading && currentExportType === 'leads',
        sent: exportDataLoading && currentExportType === 'sent',
        unsent: exportDataLoading && currentExportType === 'unsent',
        blocked: exportDataLoading && currentExportType === 'blocked',
        dialogs: exportDataLoading && currentExportType === 'dialogs',
      }}
      groupId={groupId}
    />
  );
*/
