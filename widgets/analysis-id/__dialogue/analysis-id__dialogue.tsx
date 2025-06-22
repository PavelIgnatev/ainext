'use client';

import { Button, Drawer, Input, List, Popconfirm } from 'antd';
import React, { useState } from 'react';

import { DialogMessage } from '../../../@types/Analysis';
import { AnalysisIdMessages } from './__messages/analysis-id__messages';
import { useAnalysisMessageInput } from '../analysis-id.hooks';
import classes from './analysis-id__dialogue.module.css';

interface AnalysisIdDialogueProps {
  isAdmin: boolean;
  messageLoading: boolean;
  dialogsLength: number;
  messages: DialogMessage[];

  onNewDialog: () => void;
  onSaveMessage: (message: string) => void;
  onDialogSelect: (dialogId: number) => void;
  onToggleEditMode: () => void;
}

export const AnalysisIdDialogue = ({
  messages,
  dialogsLength,
  messageLoading,
  isAdmin,
  onNewDialog,
  onSaveMessage,
  onDialogSelect,
  onToggleEditMode,
}: AnalysisIdDialogueProps) => {
  const [visibleSavedDialog, setVisibleSavedDialog] = useState(false);

  const messageInput = useAnalysisMessageInput({
    onSend: onSaveMessage,
    disabled: messageLoading,
  });

  const formattedMessages = messages.map((message, id) => ({
    id,
    text: message.content,
    fromId: message.role === 'user' ? 'клиент' : 'менеджер',
  }));

  return (
    <div className={classes.analysisIdDialogue}>
      <div className={classes.viewDialog}>
        <div className={classes.viewDialogButtons}>
          <Button
            type="dashed"
            onClick={() => setVisibleSavedDialog(true)}
            className={classes.button}
            disabled={messageLoading}
          >
            История диалогов
          </Button>

          <Popconfirm
            title="Начать новый диалог?"
            description="История данного диалога будет сохранена."
            onConfirm={onNewDialog}
            okText="Начать"
            cancelText="Отменить"
          >
            <Button
              type="dashed"
              className={classes.button}
              disabled={messageLoading}
            >
              Начать новый диалог
            </Button>
          </Popconfirm>

          {isAdmin && (
            <Button
              type="dashed"
              onClick={onToggleEditMode}
              className={classes.button}
              disabled={messageLoading}
            >
              Изменить разбор
            </Button>
          )}
        </div>

        <AnalysisIdMessages
          messages={formattedMessages}
          messageLoading={messageLoading}
        />

        <form
          onSubmit={messageInput.handleSubmit}
          className={classes.viewDialogInputWrapper}
        >
          <Input.TextArea
            value={messageInput.value}
            onChange={messageInput.handleChange}
            onPressEnter={messageInput.handleKeyPress}
            placeholder="Введите сообщение..."
            className={classes.viewDialogInput}
            size="large"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={messageLoading}
          />
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={!messageInput.canSend}
          >
            Отправить
          </Button>
        </form>
      </div>

      <Drawer
        title="История диалогов"
        placement="right"
        closable
        onClose={() => setVisibleSavedDialog(false)}
        open={visibleSavedDialog}
        styles={{ body: { padding: 0 } }}
      >
        <List
          dataSource={Array.from(
            { length: dialogsLength },
            (_, index) => index
          ).reverse()}
          renderItem={(dialogueId, listIndex) => {
            const actualDialogId = (dialogsLength || 0) - 1 - listIndex;
            return (
              <List.Item
                key={dialogueId}
                onClick={() => {
                  setVisibleSavedDialog(false);
                  onDialogSelect(actualDialogId);
                }}
                className={classes.dialogueListItem}
              >
                <List.Item.Meta
                  title={`Диалог ${actualDialogId + 1}`}
                  className={classes.meta}
                />
              </List.Item>
            );
          }}
        />
      </Drawer>
    </div>
  );
};
