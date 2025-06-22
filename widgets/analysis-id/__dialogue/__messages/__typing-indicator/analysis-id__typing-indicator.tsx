import React from 'react';
import classes from './analysis-id__typing-indicator.module.css';

interface AnalysisIdTypingIndicatorProps {
  authorName?: string;
  message?: string;
  className?: string;
}

export const AnalysisIdTypingIndicator: React.FC<
  AnalysisIdTypingIndicatorProps
> = ({
  authorName = 'Менеджер',
  message = 'Печатает сообщение...',
  className,
}) => {
  return (
    <div
      className={`${classes.message} ${classes.messageLeft} ${classes.loadingMessage} ${className || ''}`}
    >
      <div className={classes.messageHeader}>
        <span className={classes.messageAuthor}>{authorName}</span>
      </div>
      <div className={classes.messageContent}>
        <div className={classes.typingIndicator}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        {message}
      </div>
    </div>
  );
};
