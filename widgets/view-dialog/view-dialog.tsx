import { useEffect, useState } from 'react';

import { Account } from '../../@types/Account';
import { Dialogue } from '../../@types/Dialogue';
import { HeaderContainer } from '../header/header.container';
import { ViewDialogScreen } from './components/__screen/view-dialog__screen';
import { ViewDialogSearch } from './components/__search/view-dialog__search';
import { ViewDialogSettings } from './components/__settings/view-dialog__settings';
import { ViewDialogStatistics } from './components/__statistics/view-dialog__statistics';
import { ViewDialogTopButtons } from './components/__top-buttons/view-dialog__buttons';
import classes from './view-dialog.module.css';

export interface ViewDialogProps {
  activeTab:
    | 'Все'
    | 'Диалоги'
    | 'Лиды'
    | 'Ручное управление'
    | 'Заблокированные';
  viewDialogCounts?: { [key: string]: number } | null;
  incognito: boolean;
  viewed: boolean;
  minStage: number;
  currentDialogIndex: number;
  averageDialogDuration: number;
  secondsToRefresh: number;
  averageDialogDurationIfResponse: number;
  messagesToDialog: number;
  managerMessageValue: string;
  messagesDialogCount: number;
  viewAccountData?: Account | null;
  viewDialogIdsData?: Array<string> | null;
  viewDialogInfoData?: Dialogue | null;
  statisticsByDay: { [key: string]: { dateCreated: Date; messages: number }[] };
  search: string;
  groupId: string | null;
  exportLoading: {
    leads: boolean;
    sent: boolean;
    unsent: boolean;
    blocked: boolean;
    dialogs: boolean;
  };

  visibleSendMessage: boolean;
  viewDialogIdsLoading: boolean;
  viewDialogInfoLoading: boolean;
  viewDialogIdsError: boolean;
  viewDialogInfoError: boolean;
  postDialogueInfoLoading: boolean;
  viewAccountDataLoading: boolean;
  visibleStatistics: boolean;
  visibleStatisticsInfo: boolean;
  visibleSettingsInfo: boolean;
  accountStatus: 'Не определен' | 'Ожидание...' | 'Активен' | 'Заблокирован';

  postDialogueInfo: (data: {
    blocked?: boolean;
    viewed?: boolean;
    stopped?: boolean;
    managerMessage?: string;
  }) => void;
  onChangeGroupId: (groupId: string) => void;
  onNextButtonClick: () => void;
  onPrevButtonClick: () => void;
  onManagerMessageChange: (value: string) => void;
  onManagerMessageSend: () => void;
  onStatistics: () => void;
  onSettings: () => void;
  onChangeActiveTab: (
    value: 'Все' | 'Диалоги' | 'Лиды' | 'Ручное управление' | 'Заблокированные'
  ) => void;
  onChangeIncognito: () => void;
  onChangeViewed: () => void;
  onChangeMinStage: (value: number) => void;
  onChangeSearch: (search: string) => void;
  onExportLeads: (dateRange?: [Date, Date]) => void;
  onExportSent: (dateRange?: [Date, Date]) => void;
  onExportUnsent: (dateRange?: [Date, Date]) => void;
  onExportBlocked: (dateRange?: [Date, Date]) => void;
  onExportDialogs: (dateRange?: [Date, Date]) => void;
}

export const ViewDialog = (props: ViewDialogProps) => {
  const {
    activeTab,
    incognito,
    viewed,
    minStage,
    search,
    currentDialogIndex,
    averageDialogDuration,
    averageDialogDurationIfResponse,
    messagesToDialog,
    managerMessageValue,
    viewDialogCounts,
    messagesDialogCount,
    secondsToRefresh,
    statisticsByDay,
    visibleSendMessage,
    accountStatus,
    viewAccountData,
    onChangeGroupId,
    viewAccountDataLoading,
    viewDialogIdsLoading,
    viewDialogIdsData,
    postDialogueInfoLoading,
    viewDialogInfoData,
    viewDialogInfoLoading,
    visibleStatisticsInfo,
    onNextButtonClick,
    onPrevButtonClick,
    postDialogueInfo,
    onChangeSearch,
    visibleStatistics,
    onManagerMessageChange,
    onManagerMessageSend,
    onStatistics,
    onChangeActiveTab,
    onChangeIncognito,
    onChangeViewed,
    onChangeMinStage,
    onExportLeads,
    onExportSent,
    onExportUnsent,
    onExportBlocked,
    onExportDialogs,
    exportLoading,
    groupId,
    visibleSettingsInfo,
    onSettings,
  } = props;

  const [delayedIsLoading, setDelayedIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoading =
    viewDialogIdsLoading ||
    viewDialogInfoLoading ||
    postDialogueInfoLoading ||
    viewAccountDataLoading;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setDelayedIsLoading(true);
    } else {
      timer = setTimeout(() => {
        setDelayedIsLoading(false);
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className={classes.viewDialog}>
      <HeaderContainer />
      <ViewDialogSearch
        onSearch={onChangeGroupId}
        search={search}
        loading={delayedIsLoading}
        visibleStatistics={visibleStatistics}
        visibleStatisticsInfo={visibleStatisticsInfo}
        visibleSettingsInfo={visibleSettingsInfo}
        onStatistics={onStatistics}
        onSettings={onSettings}
        dialog={viewDialogInfoData}
        dialogIds={viewDialogIdsData}
        onChangeSearch={onChangeSearch}
        activeTab={activeTab}
        viewDialogCounts={viewDialogCounts}
        onChangeActiveTab={onChangeActiveTab}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        delayedIsLoading={delayedIsLoading}
      />
      {viewDialogIdsData &&
        viewDialogIdsData.length > 0 &&
        viewDialogInfoData &&
        !visibleStatisticsInfo &&
        !visibleSettingsInfo &&
        !delayedIsLoading && (
          <ViewDialogTopButtons
            activeTab={activeTab}
            onChangeActiveTab={onChangeActiveTab}
            viewDialogCounts={viewDialogCounts}
          />
        )}
      {!visibleStatisticsInfo && !visibleSettingsInfo ? (
        <ViewDialogScreen
          accountStatus={accountStatus}
          messagesDialogCount={messagesDialogCount}
          managerMessageValue={managerMessageValue}
          dialogIds={viewDialogIdsData}
          dialog={viewDialogInfoData}
          dialogIdsLoading={viewDialogIdsLoading}
          dialogLoading={viewDialogInfoLoading}
          viewAccountDataLoading={viewAccountDataLoading}
          postDialogueInfoLoading={postDialogueInfoLoading}
          isLoading={delayedIsLoading}
          viewAccountData={viewAccountData}
          dialogIndex={currentDialogIndex}
          onNextButtonClick={onNextButtonClick}
          onPrevButtonClick={onPrevButtonClick}
          postDialogueInfo={postDialogueInfo}
          onManagerMessageChange={onManagerMessageChange}
          onManagerMessageSend={onManagerMessageSend}
          visibleSendMessage={visibleSendMessage}
          secondsToRefresh={secondsToRefresh}
        />
      ) : visibleStatisticsInfo ? (
        <ViewDialogStatistics
          averageDialogDuration={averageDialogDuration}
          averageDialogDurationIfResponse={averageDialogDurationIfResponse}
          statisticsByDay={statisticsByDay}
          messagesToDialog={messagesToDialog}
          onExportLeads={onExportLeads}
          onExportSent={onExportSent}
          onExportUnsent={onExportUnsent}
          onExportBlocked={onExportBlocked}
          onExportDialogs={onExportDialogs}
          exportLoading={exportLoading}
          groupId={groupId}
          onBack={onStatistics}
        />
      ) : (
        <ViewDialogSettings
          incognito={incognito}
          viewed={viewed}
          minStage={minStage}
          onChangeIncognito={onChangeIncognito}
          onChangeViewed={onChangeViewed}
          onChangeMinStage={onChangeMinStage}
          onBack={onSettings}
        />
      )}
    </div>
  );
};
