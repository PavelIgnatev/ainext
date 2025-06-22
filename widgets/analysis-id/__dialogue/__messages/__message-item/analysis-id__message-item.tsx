import React from 'react';
import { BaseMessage } from '../../../analysis-id.types';
import classes from './analysis-id__message-item.module.css';

interface AnalysisIdMessageItemProps {
  message: BaseMessage;
}

export const AnalysisIdMessageItem: React.FC<AnalysisIdMessageItemProps> = ({
  message,
}) => {
  const messageStyle =
    message.fromId === 'клиент' ? classes.messageRight : classes.messageLeft;
  const positionClass = message.positionInGroup
    ? classes[message.positionInGroup]
    : '';

  return (
    <div className={`${classes.message} ${messageStyle} ${positionClass}`}>
      <div className={classes.messageContent}>{message.text}</div>
    </div>
  );
};
