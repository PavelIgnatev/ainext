import { Spin, Typography } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';

import { AnalysisUpdateContainer } from '../analysis-update/analysis-update.container';
import { AnalysisIdDialogue } from './__dialogue/analysis-id__dialogue';
import classes from './analysis-id.module.css';

type analysisCreateData = {
  language: 'ENGLISH' | 'RUSSIAN' | 'UKRAINIAN';
  styleGuide?: string;
  addedQuestion?: string;
  messagesCount: number;
  flowHandling?: string;
  part?: string;
  firstQuestion?: string;
  aiRole: string;
  companyName: string;
  companyDescription: string;
  goal: string;
  dialogs: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>[];
};

interface AnalysisIdProps {
  analysisData?: analysisCreateData | null;
  companyId: string;
  analysisLoading: boolean;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  messageLoading: boolean;

  onNewDialog: () => void;
  onSaveMessage: (message: string) => void;
  onHistoryDialogClick: (dialogName: number) => void;
}

export const AnalysisId = (props: AnalysisIdProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    analysisData,
    analysisLoading,
    messages,
    onNewDialog,
    onSaveMessage,
    onHistoryDialogClick,
    messageLoading,
    companyId,
  } = props;

  if (analysisLoading) {
    return (
      <div
        className={classes.analysisId}
        style={{ justifyContent: 'space-around' }}
      >
        <Spin tip="Loading" size="large"></Spin>
      </div>
    );
  }

  const debug = searchParams.get('debug');

  return (
    <div className={classes.analysisId}>
      <div className={classes.group}>
        {debug && analysisData && (
          <AnalysisUpdateContainer
            initialValues={analysisData}
            companyId={companyId}
          />
        )}
        <div>
          <Typography.Title
            level={2}
            style={{
              marginTop: '0.5em',
              marginBottom: 'calc(0.5em + 10px)',
              textAlign: 'center',
            }}
            className={classes.head}
          >
            Эмуляция диалогов для компании {analysisData?.companyName}
          </Typography.Title>
          <AnalysisIdDialogue
            messages={messages}
            dialogs={analysisData?.dialogs}
            messageLoading={messageLoading}
            onNewDialog={onNewDialog}
            onSaveMessage={onSaveMessage}
            onHistoryDialogClick={onHistoryDialogClick}
          />
        </div>
      </div>
    </div>
  );
};
