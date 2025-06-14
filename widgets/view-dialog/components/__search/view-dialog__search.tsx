import { MenuOutlined, SettingOutlined } from '@ant-design/icons';
import { Drawer, Popover } from 'antd';
import { FC, useMemo, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { Tooltip } from 'react-tooltip';
import { Checkbox } from 'semantic-ui-react';

import { Dialogue } from '../../../../@types/Dialogue';
import { ViewDialogStatisticsSvg } from '../__statistics-svg/view-dialog__svg';
import { ViewDialogSvg } from '../__svg/view-dialog__svg';
import classes from './view-dialog__search.module.css';

export interface ViewDialogSearchProps {
  loading: boolean;
  visibleStatistics: boolean;
  visibleStatisticsInfo: boolean;
  visibleSettingsInfo: boolean;
  search: string;
  dialog?: Dialogue | null;
  dialogIds?: Array<string> | null;
  activeTab:
    | 'Все'
    | 'Диалоги'
    | 'Лиды'
    | 'Ручное управление'
    | 'Заблокированные';
  viewDialogCounts?: { [key: string]: number } | null;
  isMenuOpen: boolean;
  delayedIsLoading: boolean;
  setIsMenuOpen: (value: boolean) => void;

  onSearch: (groupId: string) => void;
  onStatistics: () => void;
  onSettings: () => void;
  onChangeSearch: (search: string) => void;
  onChangeActiveTab: (
    activeTab:
      | 'Все'
      | 'Диалоги'
      | 'Лиды'
      | 'Ручное управление'
      | 'Заблокированные'
  ) => void;
}

export const ViewDialogSearch: FC<ViewDialogSearchProps> = (props) => {
  const {
    loading,
    visibleStatistics,
    visibleStatisticsInfo,
    visibleSettingsInfo,
    dialog,
    dialogIds,
    onStatistics,
    onSettings,
    search,
    onSearch,
    onChangeSearch,
    activeTab,
    viewDialogCounts,
    onChangeActiveTab,
    isMenuOpen,
    setIsMenuOpen,
    delayedIsLoading,
  } = props;
  const [currentGroupId, setCurrentGroupId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCurrentGroupId(input);
  };

  const handleSearch = () => {
    if (currentGroupId) {
      onSearch(currentGroupId);
    }
  };

  const renderNavigationButtons = () => (
    <div className={classes.viewDialogTopButtonsWrapper}>
      <div className={classes.mainNavigation}>
        <button
          onClick={() => {
            onChangeActiveTab('Все');
            setIsMenuOpen(false);
          }}
          className={`${classes.viewDialogButton} ${
            activeTab === 'Все' && classes.all
          }`}
        >
          <span>Все</span>
        </button>
        <button
          onClick={() => {
            onChangeActiveTab('Диалоги');
            setIsMenuOpen(false);
          }}
          className={`${classes.viewDialogButton} ${
            activeTab === 'Диалоги' && classes.dialog
          }`}
        >
          <span>Диалоги</span>
          {viewDialogCounts?.['condition2'] ? (
            <span>({viewDialogCounts?.['condition2']}🔔)</span>
          ) : (
            ''
          )}
        </button>
        <button
          onClick={() => {
            onChangeActiveTab('Лиды');
            setIsMenuOpen(false);
          }}
          className={`${classes.viewDialogButton} ${
            activeTab === 'Лиды' && classes.lead
          }`}
        >
          <span>Лиды</span>
          {viewDialogCounts?.['condition3'] ? (
            <span>({viewDialogCounts?.['condition3']}🔔)</span>
          ) : (
            ''
          )}
        </button>
        <button
          onClick={() => {
            onChangeActiveTab('Ручное управление');
            setIsMenuOpen(false);
          }}
          className={`${classes.viewDialogButton} ${
            activeTab === 'Ручное управление' && classes.managment
          }`}
        >
          <span>Ручное управление</span>
          {viewDialogCounts?.['condition4'] ? (
            <span>({viewDialogCounts?.['condition4']}🔔)</span>
          ) : (
            ''
          )}
        </button>
        <button
          onClick={() => {
            onChangeActiveTab('Заблокированные');
            setIsMenuOpen(false);
          }}
          className={`${classes.viewDialogButton} ${
            activeTab === 'Заблокированные' && classes.blocked
          }`}
        >
          <span>Заблокированные</span>
          {viewDialogCounts?.['condition5'] ? (
            <span>({viewDialogCounts?.['condition5']}🔔)</span>
          ) : (
            ''
          )}
        </button>
      </div>

      <div className={classes.serviceNavigation}>
        <button
          onClick={() => {
            onStatistics();
            setIsMenuOpen(false);
          }}
          className={classes.viewDialogButton}
          id="statistics-mobile"
          type="button"
        >
          <span>Статистика</span>
          <ViewDialogStatisticsSvg className={classes.viewDialogIconStats} />
        </button>
        <button
          onClick={() => {
            onSettings();
            setIsMenuOpen(false);
          }}
          className={classes.viewDialogButton}
          id="settings-mobile"
          type="button"
        >
          <span>Настройки</span>
          <SettingOutlined className={classes.viewDialogIconSettings} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={classes.viewDialogSearch}>
      {dialog && dialogIds && dialogIds.length > 0 && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className={classes.menuButton}
        >
          <MenuOutlined />
        </button>
      )}

      <div className={classes.searchInputsWrapper}>
        {dialog && dialogIds && dialogIds.length > 0 && (
          <input
            value={search}
            disabled={loading}
            onChange={(e) => onChangeSearch(e.currentTarget.value)}
            className={classes.viewDialogInputSearch}
            type="text"
            id="search2"
            placeholder="Поиск"
          />
        )}
        <input
          value={currentGroupId}
          disabled={loading}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className={classes.viewDialogInput}
          type="text"
          id="search"
          placeholder="Ваш идентификатор"
        />
      </div>

      <div className={classes.searchButtonsWrapper}>
        {dialog && dialogIds && dialogIds.length > 0 && (
          <>
            <button
              disabled={!visibleStatistics || loading}
              onClick={onStatistics}
              className={`${classes.viewDialogStatisticsButton} ${
                visibleStatisticsInfo &&
                classes.viewDialogStatisticsButtonVisible
              }`}
              id="statistics"
              type="button"
            >
              {visibleStatistics ? (
                <ViewDialogStatisticsSvg
                  className={classes.viewDialogSearchStatisticsSvg}
                />
              ) : (
                <TailSpin height={30} width={30} radius={0.5} color="black" />
              )}
            </button>
            <button
              onClick={onSettings}
              className={`${classes.viewDialogIncognitoButton} ${
                visibleSettingsInfo && classes.viewDialogIncognitoButtonInc
              }`}
              id="settings"
              type="button"
            >
              <SettingOutlined className={classes.viewDialogIcon} />
            </button>
          </>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={handleSearch}
          className={classes.viewDialogButton}
        >
          {loading ? (
            <TailSpin height={30} width={30} radius={0.5} color="black" />
          ) : (
            <ViewDialogSvg className={classes.viewDialogSearchSvg} />
          )}
        </button>
      </div>

      <div className={classes.tooltipsWrapper}>
        <Tooltip
          variant="info"
          anchorSelect="#search2"
          style={{ zIndex: 100000000 }}
        >
          Поиск по всем параметрам: имя, фамилия, описание, телефон, текст
          переписки и прочее.
        </Tooltip>
        <Tooltip
          variant="info"
          anchorSelect="#settings"
          style={{ zIndex: 100000000 }}
        >
          Просмотреть специальные настройки
        </Tooltip>
        <Tooltip
          variant="info"
          anchorSelect="#searchS"
          style={{ zIndex: 100000000 }}
        >
          Поиск диалогов по идентификатору
        </Tooltip>
        <Tooltip
          variant="info"
          anchorSelect="#statistics"
          style={{ zIndex: 100000000 }}
        >
          Просмотреть статистику эффективности
        </Tooltip>
      </div>

      {!delayedIsLoading && (
        <Drawer
          title="Навигация"
          placement="left"
          onClose={() => setIsMenuOpen(false)}
          open={isMenuOpen}
          className="top-drawer"
          rootClassName={classes.navigationDrawer}
        >
          {renderNavigationButtons()}
        </Drawer>
      )}
    </div>
  );
};
