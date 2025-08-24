import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { BaseMessage } from '../../analysis-id.types';
import { SystemMessage, DialogMessage } from '../../../../@types/Analysis';
import { useAnalysisMessages } from '../../analysis-id.hooks';
import { getCombinedMessages } from '@/utils/analysisHelpers';
import { AnalysisIdMessageItem } from './__message-item/analysis-id__message-item';
import { AnalysisIdTypingIndicator } from './__typing-indicator/analysis-id__typing-indicator';
import classes from './analysis-id__messages.module.css';

interface AnalysisIdMessagesProps {
  messages: BaseMessage[];
  systemMessage: SystemMessage | null;
  messageLoading: boolean;
  loadingMessage: string;
  originalMessages: DialogMessage[];
}

export const AnalysisIdMessages: React.FC<AnalysisIdMessagesProps> = ({
  messages,
  systemMessage,
  messageLoading,
  loadingMessage,
  originalMessages,
}) => {
  const { dialogRef, formattedMessages } = useAnalysisMessages(messages);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const getAnalysisLine = () => {
    if (!systemMessage?.content?.status) return null;

    const { status, reason, think } = systemMessage.content;
    const statusText = {
      lead: '⭐ Выделен как "LEAD"',
      negative: '⛔ Выявлен негатив в диалоге',
      continue: '🔍 Промежуточный анализ диалога',
    }[status as 'lead' | 'negative' | 'continue'];

    return (
      <div
        style={{
          position: 'relative',
          marginBottom: '2px',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'inline-block',
            padding: '6px 8px',
            backgroundColor: 'rgb(245, 245, 245)',
            border: '1px solid #000',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottom: 0,
            fontSize: '12px',
            fontWeight: '700',
            color: '#000',
            borderTop: '1px solid #2b2b2b',
          }}
        >
          {statusText}
        </div>
        {reason && (
          <Tooltip
            title={think ? `Рассуждение ИИ:\n\n${think}` : null}
            placement="topLeft"
            trigger={think ? 'hover' : []}
            styles={{
              root: {
                maxWidth: isMobile ? '90vw' : '600px',
                maxHeight: isMobile ? '50vh' : '400px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              },
            }}
          >
            <div
              style={{
                borderRadius: '4px',
                border: '1px solid #2b2b2b',

                borderTopLeftRadius: '0px',
                borderTopRightRadius: '6px',
                borderBottomLeftRadius: '6px',
                borderBottomRightRadius: '6px',
                padding: think ? '6px 26px 6px 8px' : '6px 8px',
                backgroundColor: '#f5f5f5',
                fontSize: '14px',
                color: 'black',
                fontStyle: 'italic',
                width: 'max-content',
                maxWidth: '70%',
                cursor: think ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              {reason}
              {think && (
                <span
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '4px',
                    fontSize: '14px',
                    color: '#2563eb',
                    userSelect: 'none',
                    fontStyle: 'normal',
                    lineHeight: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(37, 99, 235, 0.3)',
                  }}
                >
                  <InfoCircleOutlined />
                </span>
              )}
            </div>
          </Tooltip>
        )}
      </div>
    );
  };

  const getAnalysisLineIndex = () => {
    if (!systemMessage?.content?.stage) return -1;

    const messagesForCombining = formattedMessages.map((msg) => ({
      role:
        msg.fromId === 'клиент' ? ('user' as const) : ('assistant' as const),
      content: msg.text,
    }));

    const combinedMessages = getCombinedMessages(messagesForCombining);
    const targetStage = systemMessage.content.stage;
    const targetCombinedIndex = targetStage * 2 - 1;

    if (
      targetCombinedIndex < 0 ||
      targetCombinedIndex >= combinedMessages.length
    )
      return -1;

    let currentCombinedIndex = 0;
    let currentRole = messagesForCombining[0]?.role;

    for (let i = 0; i < messagesForCombining.length; i++) {
      if (messagesForCombining[i].role !== currentRole) {
        currentCombinedIndex++;
        currentRole = messagesForCombining[i].role;
      }

      if (currentCombinedIndex === targetCombinedIndex) {
        return i;
      }
    }

    return -1;
  };

  const analysisLineIndex = getAnalysisLineIndex();

  return (
    <div className={classes.dialogContainer}>
      <div className={classes.dialog} ref={dialogRef}>
        {formattedMessages.map((message, index) => (
          <React.Fragment key={`${message.id}-${index}`}>
            <AnalysisIdMessageItem
              message={message}
              originalMessages={originalMessages}
              messageIndex={index}
            />
            {index === analysisLineIndex && getAnalysisLine()}
          </React.Fragment>
        ))}
        {messageLoading && (
          <AnalysisIdTypingIndicator message={loadingMessage} />
        )}
      </div>
    </div>
  );
};
