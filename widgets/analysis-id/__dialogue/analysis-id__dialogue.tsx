'use client';

import { Button, Drawer, Input, List, Popconfirm } from 'antd';
import React, { useState } from 'react';

import { ViewDialogMessages } from '../../view-dialog/components/__messages/view-dialog__messages';
import classes from './analysis-id__dialogue.module.css';

interface AnalysisIdDialogueProps {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  dialogs?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>[];
  messageLoading: boolean;

  onNewDialog: () => void;
  onSaveMessage: (message: string) => void;
  onHistoryDialogClick: (dialogName: number) => void;
}

export const AnalysisIdDialogue = (props: AnalysisIdDialogueProps) => {
  const {
    messages,
    dialogs,
    messageLoading,
    onNewDialog,
    onSaveMessage,
    onHistoryDialogClick,
  } = props;
  const [value, setValue] = useState('');

  const [visibleSavedDialog, setVisibleSavedDialog] = useState(false);

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
            История всех диалогов
          </Button>

          <Popconfirm
            title="Начать новый диалог?"
            description="История данного диалога будет сохранена."
            onConfirm={() => onNewDialog()}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="dashed"
              className={classes.button}
              disabled={messageLoading}
            >
              Начать новый диалог
            </Button>
          </Popconfirm>
        </div>

        <ViewDialogMessages
          messages={messages.map((message, id) => ({
            id,
            text: message.content,
            date: null,
            fromId: message.role === 'user' ? 'клиент' : 'менеджер',
          }))}
          recipientId="менеджер"
          className={classes.viewDialogMessages}
          messageLoading={messageLoading}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveMessage(value);
            setValue('');
          }}
          className={classes.viewDialogInputWrapper}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder="Введите сообщение..."
            className={classes.viewDialogInput}
            size="large"
          />
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={messageLoading}
          >
            Отправить
          </Button>
        </form>
      </div>

      <Drawer
        title="История диалогов"
        placement="right"
        closable={true}
        onClose={() => setVisibleSavedDialog(false)}
        open={visibleSavedDialog}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <List
          dataSource={Array.from(
            { length: Object.keys(dialogs || {}).length },
            (_, index) => index
          ).reverse()}
          renderItem={(dialogueId) => (
            <List.Item
              key={dialogueId}
              onClick={() => {
                setVisibleSavedDialog(false);
                onHistoryDialogClick(dialogueId);
              }}
              className={classes.dialogueListItem}
            >
              <List.Item.Meta
                title={`Диалог ${dialogueId + 1}`}
                className={classes.meta}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};
