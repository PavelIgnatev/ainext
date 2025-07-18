'use client';

import { useState } from 'react';

import { Analysis, DialogMessage } from '../../@types/Analysis';
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
  isAnalysisLoading: boolean;
  isMessageLoading: boolean;
  isAdmin: boolean;
  currentDialogId: number;

  onNewDialog: () => void;
  onSaveMessage: (message: string) => void;
  onDialogSelect: (dialogId: number) => void;
}

export const AnalysisId = (props: AnalysisIdProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    analysis,
    analysisId,
    isAnalysisLoading,
    messages,
    isMessageLoading,
    isAdmin,
    onNewDialog,
    onSaveMessage,
    onDialogSelect,
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
        messageLoading={isMessageLoading}
        dialogsLength={analysis.dialogs.length}
        onNewDialog={onNewDialog}
        onSaveMessage={onSaveMessage}
        onDialogSelect={onDialogSelect}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
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
