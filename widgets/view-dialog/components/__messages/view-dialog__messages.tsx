import cx from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from 'antd';

import classes from './view-dialog__messages.module.css';

interface ViewDialogMessagesProps {
  recipientId: string | undefined;
  messages?: Array<{
    id: number;
    text: string;
    fromId: string;
    date: number | null;
  }>;
  managerMessage?: string;
  messageLoading?: boolean;
  className?: string;
}

function reduceSpaces(string: string) {
  return string.replace(/\s+/g, ' ').trim();
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);

  return `${date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })}, ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })}`;
}

export const ViewDialogMessages: React.FC<ViewDialogMessagesProps> = ({
  recipientId = '0',
  messages,
  managerMessage,
  messageLoading,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.scrollTop = dialogRef.current.scrollHeight;
    }
  }, [messages, managerMessage]);

  const renderDialog = useMemo(() => {
    if (messages) {
      return managerMessage
        ? [
            ...messages,
            {
              id: Infinity,
              text: managerMessage,
              fromId: Infinity,
              date: null,
            },
          ]
        : messages;
    }
  }, [messages, managerMessage]);

  return (
    <div className={cx(classes.dialogContainer, className)}>
      <div className={classes.dialog} ref={dialogRef}>
        {renderDialog?.map((dialog, index) => {
          const messageStyle =
            recipientId === dialog.fromId
              ? classes.messageLeft
              : classes.messageRight;

          const messageContent = (
            <div
              className={`${classes.message} ${messageStyle} ${
                managerMessage === dialog.text ? classes.aiMessage : ''
              }`}
            >
              <p style={{ display: 'inline' }}>
                {reduceSpaces(capitalizeFirstLetter(dialog.text))}
              </p>
              {dialog?.date && (
                <div className={classes.messageTime}>
                  {formatDate(dialog?.date * 1000)}
                </div>
              )}
            </div>
          );

          return dialog.id === Infinity ? (
            <Tooltip
              key={index}
              title={
                <>
                  Сообщение на данный момент находится в очереди отправок.{' '}
                  <br />В ближайшее время мы отправим его собеседнику.
                </>
              }
              placement="top"
              zIndex={100000000}
            >
              {messageContent}
            </Tooltip>
          ) : (
            <div key={index}>{messageContent}</div>
          );
        })}
        {messageLoading && (
          <div className={`${classes.message} ${classes.messageLeft}`}>
            Печатает сообщение...
          </div>
        )}
      </div>
    </div>
  );
};
