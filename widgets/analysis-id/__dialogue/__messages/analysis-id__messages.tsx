import React from 'react';

import { BaseMessage } from '../../analysis-id.types';
import { useAnalysisMessages } from '../../analysis-id.hooks';
import { AnalysisIdMessageItem } from './__message-item/analysis-id__message-item';
import { AnalysisIdTypingIndicator } from './__typing-indicator/analysis-id__typing-indicator';
import classes from './analysis-id__messages.module.css';

interface AnalysisIdMessagesProps {
  messages: BaseMessage[];
  messageLoading: boolean;
}

export const AnalysisIdMessages: React.FC<AnalysisIdMessagesProps> = ({
  messages,
  messageLoading,
}) => {
  const { dialogRef, formattedMessages } = useAnalysisMessages(messages);

  return (
    <div className={classes.dialogContainer}>
      <div className={classes.dialog} ref={dialogRef}>
        {formattedMessages.map((message, index) => (
          <AnalysisIdMessageItem
            key={`${message.id}-${index}`}
            message={message}
          />
        ))}
        {messageLoading && <AnalysisIdTypingIndicator />}
      </div>
    </div>
  );
};
