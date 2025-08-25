'use client';

import { Button, Drawer, Input, List, Popconfirm } from 'antd';
import React, { useState } from 'react';

import { DialogMessage, SystemMessage } from '../../../@types/Analysis';
import { AnalysisIdMessages } from './__messages/analysis-id__messages';
import { useAnalysisMessageInput } from '../analysis-id.hooks';

import classes from './analysis-id__dialogue.module.css';

interface AnalysisIdDialogueProps {
  isAdmin: boolean;
  messageLoading: boolean;
  dialogsLength: number;
  messages: DialogMessage[];
  systemMessage: SystemMessage | null;
  loadingMessage: string;
  currentDialogId: number;
  isPingLoading: boolean;
  pingLoadingMessage: string;

  onNewDialog: () => void;
  onSaveMessage: (message: string) => void;
  onDialogSelect: (dialogId: number) => void;
  onToggleEditMode: () => void;
  onPingDialog: (dialogId: number) => void;
}

export const AnalysisIdDialogue = ({
  messages,
  systemMessage,
  loadingMessage,
  dialogsLength,
  messageLoading,
  isAdmin,
  currentDialogId,
  onNewDialog,
  onSaveMessage,
  onDialogSelect,
  onToggleEditMode,
  onPingDialog,
  isPingLoading,
  pingLoadingMessage,
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
    think: message.think,
  }));

  return (
    <div className={classes.analysisIdDialogue}>
      <div className={classes.viewDialog}>
        <div className={classes.viewDialogButtons}>
          <Button
            type="dashed"
            onClick={() => setVisibleSavedDialog(true)}
            className={classes.button}
            disabled={messageLoading || isPingLoading}
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
              disabled={messageLoading || isPingLoading}
            >
              Начать новый диалог
            </Button>
          </Popconfirm>

          <Button
            type="dashed"
            onClick={() => onPingDialog(currentDialogId)}
            className={classes.button}
            disabled={messageLoading || isPingLoading}
            loading={isPingLoading}
          >
            Протестировать пинг
          </Button>

          {isAdmin && (
            <Button
              type="dashed"
              onClick={onToggleEditMode}
              className={classes.button}
              disabled={messageLoading || isPingLoading}
            >
              Изменить разбор
            </Button>
          )}
        </div>

        <AnalysisIdMessages
          messages={formattedMessages}
          systemMessage={systemMessage}
          messageLoading={messageLoading}
          loadingMessage={loadingMessage}
          originalMessages={messages}
          pingLoadingMessage={pingLoadingMessage}
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
            disabled={messageLoading || isPingLoading}
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
        size="default"
        onClose={() => setVisibleSavedDialog(false)}
        open={visibleSavedDialog}
        styles={{
          body: { padding: 0 },
          wrapper: { maxWidth: '420px' },
          header: { padding: '16px 24px 16px 6px' },
        }}
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
