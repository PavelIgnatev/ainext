import { Button, Typography } from 'antd';

import { StartupWidgetDrawer } from './__draver/startup-widget__drawer';
import { StartupWidgetTable } from './__table/startup-widget__table';
import classes from './startup-widget.module.css';
import { FullFroupIdType, GroupIdType } from './startup-widget.types';

interface StartupWidgetProps {
  loading: boolean;
  startupId: string | null;
  startupIdData: FullFroupIdType | null;
  startupIdLoading: boolean;
  groupId: GroupIdType[];

  onClickStartupId: (startupId: string) => void;
  onCloseStartupWidgetDrawer: () => void;
  onSubmitStartupWidget: (data: FullFroupIdType) => void;

  onExportLeads: () => void;
  onExportSent: () => void;
  onExportUnsent: () => void;
}

export const StartupWidget = (props: StartupWidgetProps) => {
  const {
    groupId,
    loading,
    startupId,
    startupIdData,
    startupIdLoading,
    onClickStartupId,
    onSubmitStartupWidget,
    onCloseStartupWidgetDrawer,
    onExportLeads,
    onExportSent,
    onExportUnsent,
  } = props;

  return (
    <div className={classes.startupWidget}>
      <div className={classes.startupWidgetWrapper}>
        <Typography.Title
          level={1}
          style={{ margin: '10px 0', marginBottom: '20px' }}
          className={classes.head}
        >
          Запуски 🚀
        </Typography.Title>
        <Button
          type="primary"
          size="large"
          onClick={() =>
            onClickStartupId(
              String(Math.floor(Math.random() * 10 ** 10) + 10 ** 10)
            )
          }
        >
          Создать
        </Button>
      </div>

      <StartupWidgetTable
        onClickStartupId={onClickStartupId}
        groupId={groupId}
        loading={loading}
      />
      <StartupWidgetDrawer
        startupIdData={startupIdData}
        startupIdLoading={startupIdLoading}
        startupId={startupId}
        onCloseStartupWidgetDrawer={onCloseStartupWidgetDrawer}
        onSubmitStartupWidget={onSubmitStartupWidget}
        onExportLeads={onExportLeads}
        onExportSent={onExportSent}
        onExportUnsent={onExportUnsent}
      />
    </div>
  );
};
