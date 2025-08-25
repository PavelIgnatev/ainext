import React, { useEffect, useState } from 'react';
import { BaseMessage } from '../../../analysis-id.types';
import { DialogMessage } from '../../../../../@types/Analysis';
import classes from './analysis-id__message-item.module.css';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface AnalysisIdMessageItemProps {
  message: BaseMessage;
  originalMessages: DialogMessage[];
  messageIndex: number;
}

export const AnalysisIdMessageItem: React.FC<AnalysisIdMessageItemProps> = ({
  message,
  originalMessages,
  messageIndex,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  const messageStyle =
    message.fromId === 'клиент' ? classes.messageRight : classes.messageLeft;
  const positionClass = message.positionInGroup
    ? classes[message.positionInGroup]
    : '';

  const formattedText = message.text.replace(/\\n/g, '\n');
  const think = originalMessages[messageIndex]?.think;

  const renderReplyPreview = () => {
    if (message.fromId === 'клиент' || messageIndex === 0) return null;

    const originalMessage = originalMessages[messageIndex];
    if (!originalMessage || originalMessage.role !== 'assistant') return null;

    const previousMessage = originalMessages[messageIndex - 1];
    if (!previousMessage || previousMessage.role !== 'user') return null;

    const shortText =
      previousMessage.content.length > 50
        ? previousMessage.content.substring(0, 50) + '...'
        : previousMessage.content;

    return (
      <div className={classes.replyPreview}>
        <div className={classes.replyLine}></div>
        <div className={classes.replyContent}>
          <div className={classes.replyAuthor}>Клиент</div>
          <div className={classes.replyText}>
            {shortText.replace(/\\n/g, '\n').slice(0, 1).toUpperCase() +
              shortText.replace(/\\n/g, '\n').slice(1)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${classes.message} ${messageStyle} ${positionClass}`}>
      {think ? (
        <Tooltip
          title={think ? `Рассуждение ИИ:\n\n${think}` : null}
          placement="topLeft"
          trigger={think ? 'hover' : []}
          classNames={{ root: classes.tooltipOverlay }}
          styles={{
            root: {
              maxWidth: isMobile ? '90vw' : '600px',
              maxHeight: isMobile ? '50vh' : '400px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            },
          }}
        >
          <div className={classes.messageContent}>
            {renderReplyPreview()}
            {formattedText}
            <span
              style={{
                position: 'absolute',
                top: '5px',
                right: '4px',
                fontSize: '14px',
                color: '#2563eb',
                userSelect: 'none',
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
          </div>
        </Tooltip>
      ) : (
        <div className={classes.messageContent}>
          {renderReplyPreview()}
          {formattedText}
        </div>
      )}
    </div>
  );
};
