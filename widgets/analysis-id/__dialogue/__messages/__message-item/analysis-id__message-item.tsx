import React from 'react';
import { BaseMessage } from '../../../analysis-id.types';
import classes from './analysis-id__message-item.module.css';

interface AnalysisIdMessageItemProps {
  message: BaseMessage;
}

const getAuthorName = (fromId: string): string => {
  const authorMap: Record<string, string> = {
    клиент: 'Клиент',
    менеджер: 'Менеджер',
  };
  return authorMap[fromId] || 'Менеджер';
};

export const AnalysisIdMessageItem: React.FC<AnalysisIdMessageItemProps> = ({
  message,
}) => {
  const messageStyle =
    message.fromId === 'клиент' ? classes.messageRight : classes.messageLeft;

  return (
    <div className={`${classes.message} ${messageStyle}`}>
      <div className={classes.messageHeader}>
        <span className={classes.messageAuthor}>
          {getAuthorName(message.fromId)}
        </span>
      </div>
      <div className={classes.messageContent}>{message.text}</div>
    </div>
  );
};
