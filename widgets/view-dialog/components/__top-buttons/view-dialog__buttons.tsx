import { Tooltip } from 'react-tooltip';

import classes from './view-dialog__buttons.module.css';

export interface ViewDialogTopButtonsProps {
  activeTab:
    | 'Все'
    | 'Диалоги'
    | 'Лиды'
    | 'Ручное управление'
    | 'Заблокированные';
  viewDialogCounts?: { [key: string]: number } | null;

  onChangeActiveTab: (
    activeTab:
      | 'Все'
      | 'Диалоги'
      | 'Лиды'
      | 'Ручное управление'
      | 'Заблокированные'
  ) => void;
}

export const ViewDialogTopButtons = (props: ViewDialogTopButtonsProps) => {
  const { activeTab, viewDialogCounts, onChangeActiveTab } = props;

  return (
    <div className={classes.viewDialogTopButtons}>
      <div className={classes.desktopNavigation}>
        <div className={classes.viewDialogTopButtonsWrapper}>
          <button
            onClick={() => onChangeActiveTab('Все')}
            className={`${classes.viewDialogButton} ${
              activeTab === 'Все' && classes.all
            }`}
          >
            Все
          </button>
          <button
            onClick={() => onChangeActiveTab('Диалоги')}
            className={`${classes.viewDialogButton} ${
              activeTab === 'Диалоги' && classes.dialog
            }`}
          >
            Диалоги&nbsp;
            <br />
            {viewDialogCounts?.['condition2'] ? (
              <span id={viewDialogCounts?.['condition2'] ? 'id1' : ''}>
                ({viewDialogCounts?.['condition2'] || 0}🔔)
              </span>
            ) : (
              ''
            )}
            <Tooltip
              variant="info"
              anchorSelect="#id1"
              style={{ zIndex: 100000000 }}
            >
              Количество непросмотренных диалогов
            </Tooltip>
          </button>
          <button
            onClick={() => onChangeActiveTab('Лиды')}
            className={`${classes.viewDialogButton} ${
              activeTab === 'Лиды' && classes.lead
            }`}
          >
            Лиды&nbsp;
            <br />
            {viewDialogCounts?.['condition3'] ? (
              <span id={viewDialogCounts?.['condition3'] ? 'id2' : ''}>
                ({viewDialogCounts?.['condition3'] || 0}🔔)
              </span>
            ) : (
              ''
            )}
            <Tooltip
              variant="info"
              anchorSelect="#id2"
              style={{ zIndex: 100000000 }}
            >
              Количество непросмотренных диалогов
            </Tooltip>
          </button>
          <button
            onClick={() => onChangeActiveTab('Ручное управление')}
            className={`${classes.viewDialogButton} ${
              activeTab === 'Ручное управление' && classes.managment
            }`}
          >
            Ручное управление&nbsp;
            <br />
            {viewDialogCounts?.['condition4'] ? (
              <span id={viewDialogCounts?.['condition4'] ? 'id3' : ''}>
                ({viewDialogCounts?.['condition4'] || 0}🔔)
              </span>
            ) : (
              ''
            )}
            <Tooltip
              variant="info"
              anchorSelect="#id3"
              style={{ zIndex: 100000000 }}
            >
              Количество непросмотренных диалогов
            </Tooltip>
          </button>
          <button
            onClick={() => onChangeActiveTab('Заблокированные')}
            className={`${classes.viewDialogButton} ${
              activeTab === 'Заблокированные' && classes.blocked
            }`}
          >
            Заблокированные&nbsp; <br />
            {viewDialogCounts?.['condition5'] ? (
              <span id={viewDialogCounts?.['condition5'] ? 'id4' : ''}>
                ({viewDialogCounts?.['condition5'] || 0}🔔)
              </span>
            ) : (
              ''
            )}
            <Tooltip
              variant="info"
              anchorSelect="#id4"
              style={{ zIndex: 100000000 }}
            >
              Количество непросмотренных диалогов
            </Tooltip>
          </button>
        </div>
      </div>
    </div>
  );
};
