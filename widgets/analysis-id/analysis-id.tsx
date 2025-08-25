'use client';

import { useState } from 'react';

import { Analysis, DialogMessage, SystemMessage } from '../../@types/Analysis';
import { AnalysisIdDialogue } from './__dialogue/analysis-id__dialogue';
import { AnalysisIdLoadingPage } from './__loading-page/analysis-id__loading-page';
import { AnalysisIdEmptyPage } from './__empty-page/analysis-id__empty-page';
import { AnalysisIdEditDrawer } from './__edit-drawer/analysis-id__edit-drawer';
import { Title } from '@/components/title/title';
import classes from './analysis-id.module.css';

interface AnalysisIdProps {
  analysisId: string;
  analysis: Analysis | null;
  messages: DialogMessage[];
  systemMessage: SystemMessage | null;
  loadingMessage: string;
  isAnalysisLoading: boolean;
  isMessageLoading: boolean;
  isAdmin: boolean;
  currentDialogId: number;

  onNewDialog: () => void;
  onSaveMessage: (message: string) => void;
  onDialogSelect: (dialogId: number) => void;
  onPingDialog: (dialogId: number) => void;
  isPingLoading: boolean;
  pingLoadingMessage: string;
}

export const AnalysisId = (props: AnalysisIdProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    analysis,
    analysisId,
    isAnalysisLoading,
    messages,
    systemMessage,
    loadingMessage,
    isMessageLoading,
    isAdmin,
    currentDialogId,
    onNewDialog,
    onSaveMessage,
    onDialogSelect,
    onPingDialog,
    isPingLoading,
    pingLoadingMessage,
  } = props;

  if (isAnalysisLoading) {
    return <AnalysisIdLoadingPage />;
  }

  if (!analysis) {
    return <AnalysisIdEmptyPage analysisId={analysisId} />;
  }

  return (
    <div className={classes.analysisId}>
      <Title className={classes.head}>{analysis.companyName}</Title>
      <AnalysisIdDialogue
        isAdmin={isAdmin}
        messages={messages}
        systemMessage={systemMessage}
        loadingMessage={loadingMessage}
        messageLoading={isMessageLoading}
        dialogsLength={analysis.dialogs.length}
        currentDialogId={currentDialogId}
        onNewDialog={onNewDialog}
        onSaveMessage={onSaveMessage}
        onDialogSelect={onDialogSelect}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onPingDialog={onPingDialog}
        isPingLoading={isPingLoading}
        pingLoadingMessage={pingLoadingMessage}
      />

      {analysis && (
        <AnalysisIdEditDrawer
          isOpen={isEditMode}
          analysis={analysis}
          onClose={() => setIsEditMode(false)}
        />
      )}
    </div>
  );
};
