import { ArrowLeftOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import { FC, useState } from 'react';

import classes from './view-dialog__settings.module.css';

interface ViewDialogSettingsProps {
  incognito: boolean;
  viewed: boolean;
  minStage: number;
  onChangeIncognito: () => void;
  onChangeViewed: () => void;
  onChangeMinStage: (value: number) => void;
  onBack: () => void;
}

export const ViewDialogSettings: FC<ViewDialogSettingsProps> = ({
  incognito,
  viewed,
  minStage,
  onChangeIncognito,
  onChangeViewed,
  onChangeMinStage,
  onBack,
}) => {
  const [customMinStage, setCustomMinStage] = useState<boolean>(minStage > 3);
  const [inputValue, setInputValue] = useState<string>(minStage.toString());
  const [showReloadNotice, setShowReloadNotice] = useState<boolean>(false);

  const handleCustomMinStageChange = (checked: boolean) => {
    setCustomMinStage(checked);
    setShowReloadNotice(true);
    if (!checked) {
      onChangeMinStage(3);
      setInputValue('3');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowReloadNotice(true);

    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 3 && numValue <= 100) {
      onChangeMinStage(numValue);
    }
  };

  const handleIncognitoChange = () => {
    setShowReloadNotice(true);
    onChangeIncognito();
  };

  const handleViewedChange = () => {
    setShowReloadNotice(true);
    onChangeViewed();
  };

  return (
    <div className={classes.viewDialogSettings}>
      <div className={classes.settingGroup}>
        <div className={classes.statsHeader}>
          <button onClick={onBack} className={classes.backButton}>
            <ArrowLeftOutlined />
          </button>
          <h2>Специальные настройки</h2>
        </div>
        {showReloadNotice && (
          <div className={classes.reloadNotice}>
            ⚠️ Для применения изменений требуется перезагрузить страницу
          </div>
        )}
        <div className={classes.settingSubtitle}>
          Настройки применяются только к вашей локальной выдаче диалогов и не
          влияют на других пользователей
        </div>

        <div className={classes.settingItem}>
          <label className={classes.settingLabel}>
            <Switch
              checked={incognito}
              onChange={handleIncognitoChange}
              size="small"
            />
            <span className={classes.settingText}>Режим инкогнито</span>
          </label>
          <div className={classes.settingDescription}>
            Режим инкогнито управляет автоматической пометкой диалогов как
            "просмотренные". При включенном режиме система не будет
            автоматически помечать диалоги как просмотренные, они сохранят
            статус "не просмотрено" даже после просмотра. Это удобно для
            первичного ознакомления с диалогами без изменения их статуса в
            системе.
            <br />
            <br />
            <b>Текущий режим:</b>{' '}
            {incognito
              ? 'Включен — диалоги не помечаются как просмотренные при просмотре'
              : 'Выключен — диалоги автоматически получают статус "просмотрено" после просмотра'}
          </div>
        </div>

        <div className={classes.settingItem}>
          <label className={classes.settingLabel}>
            <Switch
              checked={viewed}
              onChange={handleViewedChange}
              size="small"
            />
            <span className={classes.settingText}>
              Показывать просмотренные диалоги
            </span>
          </label>
          <div className={classes.settingDescription}>
            Эта настройка фильтрует отображение диалогов на основе их статуса
            "просмотрено". Вы можете выбрать, показывать ли все диалоги, включая
            помеченные как просмотренные, или отображать только непросмотренные
            диалоги для концентрации на новых сообщениях.
            <br />
            <br />
            <b>Текущий статус:</b>{' '}
            {viewed
              ? 'Отображаются все диалоги, включая помеченные как просмотренные'
              : 'Показываются только непросмотренные диалоги'}
          </div>
        </div>

        <div className={classes.settingItem}>
          <label className={classes.settingLabel}>
            <Switch
              checked={customMinStage}
              onChange={handleCustomMinStageChange}
              size="small"
            />
            <span className={classes.settingText}>
              Настроить минимальное количество сообщений
            </span>
          </label>
          <div className={classes.settingDescription}>
            Эта настройка определяет минимальное количество сообщений в диалоге
            для его отображения. По умолчанию отображаются диалоги с 3 и более
            сообщениями. Учитываются все сообщения в диалоге: как от
            пользователя, так и наши автоматические ответы. <b>Важно:</b> фильтр
            работает только в разделе "Диалоги".
            <br />
            <br />
            <b>Рекомендация:</b> Если вы хотите видеть только диалоги, где уже
            отправлена ссылка, рекомендуется установить минимум 6 сообщений. Это
            связано с тем, что на первых этапах мы обычно отправляем по 2
            сообщения в ответ, затем ждем ответа пользователя, и только после
            этого отправляем ссылку. Таким образом, диалог с отправленной
            ссылкой обычно содержит 6 или более сообщений.
            {customMinStage && (
              <>
                <br />
                <br />
                <div className={classes.inputWrapper}>
                  <input
                    type="number"
                    min="3"
                    max="100"
                    value={inputValue}
                    onChange={handleInputChange}
                    className={classes.numberInput}
                    placeholder="Минимум 3"
                  />
                  <span className={classes.inputLabel}>сообщений</span>
                </div>
              </>
            )}
            <br />
            <br />
            <b>Текущий статус:</b>{' '}
            {customMinStage
              ? `Отображаются диалоги с ${minStage} и более сообщениями`
              : 'Отображаются диалоги с 3 и более сообщениями (по умолчанию)'}
          </div>
        </div>
      </div>
    </div>
  );
};
