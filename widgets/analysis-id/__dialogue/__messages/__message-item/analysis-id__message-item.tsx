import React from 'react';
import { BaseMessage } from '../../../analysis-id.types';
import { DialogMessage } from '../../../../../@types/Analysis';
import classes from './analysis-id__message-item.module.css';

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
  const messageStyle =
    message.fromId === 'клиент' ? classes.messageRight : classes.messageLeft;
  const positionClass = message.positionInGroup
    ? classes[message.positionInGroup]
    : '';

  const formattedText = message.text.replace(/\\n/g, '\n');

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
      <div className={classes.messageContent}>
        {renderReplyPreview()}
        {formattedText}
      </div>
    </div>
  );
};
