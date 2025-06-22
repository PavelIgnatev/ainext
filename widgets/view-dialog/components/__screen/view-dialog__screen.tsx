import { useEffect, useMemo, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { Tooltip } from 'react-tooltip';

import { Account } from '../../../../@types/Account';
import { Dialogue } from '../../../../@types/Dialogue';
import { converterName } from '../../../../utils/converterName';
import { ViewDialogButtons } from '../__buttons/view-dialog__buttons';
import { ViewDialogMessages } from '../__messages/view-dialog__messages';
import classes from './view-dialog__screen.module.css';

function pluralize(number: number, one: string, few: string, many: string) {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

function getLastOnlineString(lastOnline: number): string {
  const currentTime = Date.now();
  const lastOnlineTime = lastOnline * 1000;
  const diff = currentTime - lastOnlineTime;

  if (diff <= 0) {
    return 'сейчас в сети';
  }

  const minutesTotal = Math.floor(diff / (1000 * 60));
  const minutes = minutesTotal % 60;
  const hoursTotal = Math.floor(minutesTotal / 60);
  const hours = hoursTotal % 24;
  const days = Math.floor(hoursTotal / 24);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${pluralize(days, 'день', 'дня', 'дней')}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`);
  }

  if (minutes > 0 || parts.length === 0) {
    // Включаем минуты, если они больше 0 или нет других частей
    parts.push(`${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')}`);
  }

  return `${parts.join(' ')} назад`;
}

export interface ViewDialogScreenProps {
  dialogIndex: number;
  managerMessageValue?: string;
  messagesDialogCount: number;
  secondsToRefresh: number;
  viewAccountData?: Account | null;

  dialogIds?: Array<string> | null;
  dialog?: Dialogue | null;

  visibleSendMessage: boolean;

  isLoading: boolean;
  dialogIdsLoading: boolean;
  dialogLoading: boolean;
  viewAccountDataLoading: boolean;
  postDialogueInfoLoading: boolean;
  accountStatus: 'Не определен' | 'Ожидание...' | 'Активен' | 'Заблокирован';

  postDialogueInfo: (data: {
    blocked?: boolean;
    viewed?: boolean;
    stopped?: boolean;
  }) => void;
  onNextButtonClick: () => void;
  onPrevButtonClick: () => void;
  onManagerMessageChange: (value: string) => void;
  onManagerMessageSend: () => void;
}
function convertSecondsToMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  let remainingSeconds: number | string = seconds % 60;

  // Добавляем ведущий ноль, если секунды меньше 10
  if (remainingSeconds < 10) {
    remainingSeconds = '0' + remainingSeconds;
  }

  return minutes + ':' + remainingSeconds;
}

export const ViewDialogScreen = (props: ViewDialogScreenProps) => {
  const {
    postDialogueInfo,
    dialogIndex,
    managerMessageValue,
    messagesDialogCount,
    visibleSendMessage,
    accountStatus,
    dialog,
    dialogIds,
    dialogIdsLoading,
    isLoading,
    secondsToRefresh,
    onNextButtonClick,
    onPrevButtonClick,
    viewAccountData,
    onManagerMessageChange,
    onManagerMessageSend,
  } = props;

  const renderDefaultContent = useMemo(() => {
    return (
      <div className={classes.viewDialogScreenDefaultMessage}>
        <div className={classes.viewDialogScreenDefaultMessageTitle}>
          Введите ваш уникальный идентификатор, чтобы получить статистику по
          рассылке.
        </div>
        <div className={classes.viewDialogScreenDefaultMessageSubTitle}>
          Уникальный идентификатор - это специальный код, который позволяет
          системе отслеживать и разборировать конкретную рассылку.
        </div>
      </div>
    );
  }, []);

  const renderNothingFoundContent = useMemo(() => {
    return (
      <div className={classes.viewDialogScreenNothingFoundMessage}>
        <div className={classes.viewDialogScreenNothingFoundMessageTitle}>
          По вашему запросу ничего не найдено.
        </div>
        <div className={classes.viewDialogScreenNothingFoundMessageSubTitle}>
          К сожалению, не удалось найти результаты, соответствующие вашему
          запросу. <br /> Попробуйте изменить параметры поиска или обратитесь за
          помощью.
        </div>
      </div>
    );
  }, []);

  const renderLoadingContent = useMemo(() => {
    return (
      <div className={classes.viewDialogScreenLoading}>
        <TailSpin height={66} width={66} color="black" />
      </div>
    );
  }, []);

  const mainTitleMessage = useMemo(() => {
    if (messagesDialogCount > 2) {
      return 'Диалог';
    }

    return 'Сообщение';
  }, [messagesDialogCount]);

  const renderMainContent = useMemo(() => {
    return (
      <div className={classes.viewDialogScreenMain}>
        <div className={classes.wr}>
          <div className={classes.wrap}>
            <div className={classes.viewDialogScreenMainCount}>
              <strong>{mainTitleMessage}</strong> {dialogIndex + 1}/
              {dialogIds?.length || 0}
            </div>
            <div
              className={classes.viewDialogScreenMainCount}
              id={dialog?.viewed ? 'prosm' : 'neprosm'}
              style={{ display: 'inline-block' }}
            >
              <strong>Статус: </strong>
              {dialog?.viewed ? (
                <span style={{ color: 'green' }}>Просмотрено</span>
              ) : (
                <span style={{ color: 'red' }}>Не просмотрено</span>
              )}
              <Tooltip anchorSelect="#prosm" style={{ zIndex: 100000000 }}>
                Статус, показывающий, что ранее вы уже просмотрели актуальную
                версию диалога.
              </Tooltip>
              <Tooltip anchorSelect="#neprosm" style={{ zIndex: 100000000 }}>
                Статус, показывающий, что вы еще не просматривали актуальную
                версию диалога.
              </Tooltip>
            </div>
            {dialog?.recipientUsername && (
              <div className={classes.viewDialogScreenMainHref}>
                <strong>Ссылка на аккаунт: </strong>
                {dialog?.recipientUsername ? (
                  <a
                    href={`https://t.me/${dialog?.recipientUsername}`}
                    target="_blank"
                    className={classes.viewDialogScreenMainA}
                  >
                    {dialog?.recipientTitle?.replace('undefined', '')?.trim()}
                  </a>
                ) : (
                  'Отсутствует'
                )}
              </div>
            )}

            {dialog?.recipientPhone && (
              <div className={classes.viewDialogScreenMainPhone}>
                <strong>Телефон: </strong>
                {dialog?.recipientPhone ? dialog.recipientPhone : 'Отсутствует'}
              </div>
            )}
            {dialog?.recipientBio && (
              <div
                className={classes.viewDialogScreenMainSubTitle}
                id="not-clickable"
              >
                <strong>Описаниe: </strong>
                {dialog?.recipientBio ? dialog.recipientBio : 'Отсутствует'}
              </div>
            )}
            {
              <div className={classes.viewDialogScreenMainHref}>
                <strong>Последний онлайн: </strong>
                {dialog?.lastOnline
                  ? getLastOnlineString(dialog.lastOnline)
                  : 'Неизвестно'}
              </div>
            }

            <div className={classes.viewDialogScreenMainHref} id="statmess">
              <strong>Прочитал ли? </strong>
              {dialog?.read ? (
                <span style={{ color: 'green' }}>ДА</span>
              ) : (
                <span style={{ color: 'red' }}>НЕТ</span>
              )}
            </div>

            <Tooltip anchorSelect="#statmess" style={{ zIndex: 100000000 }}>
              Статус, показывающий, прочитал ли собеседник последнее актуальное
              сообщение.
            </Tooltip>

            <Tooltip
              anchorSelect="#not-clickable"
              style={{ zIndex: 100000000 }}
            >
              {dialog?.recipientBio}
            </Tooltip>
          </div>
          <div className={classes.wrap}>
            <div className={classes.viewDialogAccountStatus}>
              <div id="name">
                <strong>Имя бота: </strong>

                {viewAccountData?.username && viewAccountData?.firstName ? (
                  <a
                    href={`https://t.me/${viewAccountData.username}`}
                    target="_blank"
                    className={classes.viewDialogScreenMainA}
                  >
                    {converterName(viewAccountData.firstName)}
                  </a>
                ) : viewAccountData?.firstName ? (
                  converterName(viewAccountData.firstName)
                ) : (
                  'Неизвестно'
                )}
              </div>
              <div
                id={accountStatus === 'Активен' ? 'active' : 'neactive'}
                style={{ textAlign: 'end' }}
              >
                <strong>Статус бота: &nbsp;</strong>
                <span
                  style={{
                    color:
                      accountStatus === 'Активен' ||
                      accountStatus === 'Ожидание...'
                        ? 'green'
                        : 'red',
                  }}
                >
                  {accountStatus}
                </span>
              </div>
              <Tooltip anchorSelect="#name" style={{ zIndex: 100000000 }}>
                Текущее имя, используемое ботом с AI
              </Tooltip>
              <Tooltip anchorSelect="#active" style={{ zIndex: 100000000 }}>
                Статус, показывающий, что аккунт, инициировавший <br /> общение
                свободен от бана и может продолжать диалог.
              </Tooltip>
              <Tooltip anchorSelect="#neactive" style={{ zIndex: 100000000 }}>
                Статус, показывающий, что аккунт, инициировавший <br /> общение
                заблокирован, продолжения диалога не будет.
              </Tooltip>
              <div id="updater" style={{ textAlign: 'end' }}>
                {secondsToRefresh !== 300 &&
                  secondsToRefresh !== 299 &&
                  secondsToRefresh !== 298 &&
                  secondsToRefresh !== 297 &&
                  secondsToRefresh !== 296 && (
                    <div>
                      <strong>Обновление через: &nbsp;</strong>
                      <span
                        style={{
                          color: secondsToRefresh < 10 ? 'red' : 'green',
                        }}
                      >
                        {convertSecondsToMinutes(secondsToRefresh)}
                      </span>
                    </div>
                  )}
              </div>
              <Tooltip anchorSelect="#updater" style={{ zIndex: 100000000 }}>
                Автоматическое обновление, актуализирующее информацию о диалоге.
                <br />
                Перед обновлением все данные сохраняются.
              </Tooltip>
            </div>
          </div>
        </div>
        <ViewDialogMessages
          recipientId={dialog?.recipientId}
          messages={dialog?.messages}
          managerMessage={dialog?.managerMessage}
        />
        <ViewDialogButtons
          visibleSendMessage={visibleSendMessage}
          dialog={dialog}
          postDialogueInfo={postDialogueInfo}
          managerMessageValue={managerMessageValue}
          onManagerMessageChange={onManagerMessageChange}
          onManagerMessageSend={onManagerMessageSend}
          onNextButtonClick={onNextButtonClick}
          onPrevButtonClick={onPrevButtonClick}
          accountStatus={accountStatus}
        />
      </div>
    );
  }, [
    dialog,
    postDialogueInfo,
    mainTitleMessage,
    convertSecondsToMinutes,
    dialogIndex,
    dialogIds?.length,
    onNextButtonClick,
    onPrevButtonClick,
    accountStatus,
    secondsToRefresh,
    managerMessageValue,
    visibleSendMessage,
  ]);

  const renderContent = useMemo(() => {
    if (!dialogIds && !dialogIdsLoading) {
      return renderDefaultContent;
    }

    if (isLoading) {
      return renderLoadingContent;
    }

    if ((dialogIds && dialogIds.length === 0) || !dialog) {
      return renderNothingFoundContent;
    }

    return renderMainContent;
  }, [
    dialogIds,
    dialog,
    isLoading,
    renderDefaultContent,
    renderLoadingContent,
    renderNothingFoundContent,
    renderMainContent,
  ]);

  return <div className={classes.viewDialogScreen}>{renderContent}</div>;
};
