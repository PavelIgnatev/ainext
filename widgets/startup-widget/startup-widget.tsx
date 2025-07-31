import { Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { StartupWidgetDrawer } from './__draver/startup-widget__drawer';
import { StartupWidgetTable } from './__table/startup-widget__table';
import { StartupWidgetLoading } from './__loading/startup-widget__loading';
import { Title } from '@/components/title/title';
import classes from './startup-widget.module.css';
import { GroupId } from '@/@types/GroupId';
import { Crm } from '@/@types/Crm';

interface StartupWidgetProps {
  search: string;

  groupId: string | null;
  groupIdData: GroupId | null;
  groupIdLoading: boolean;

  groupIdDatabase: {
    users: string[];
    workingDatabase: string[];
  };
  groupIdDatabaseLoading: boolean;

  crmData: Crm | null;
  crmLoading: boolean;

  isSubmitLoading: boolean;

  groupIds: Pick<GroupId, 'groupId' | 'name' | 'target' | 'currentCount'>[];
  groupIdsloading: boolean;

  onClickGroupId: (groupId: string) => void;
  onCloseDrawer: () => void;
  onSumbitDrawer: ({
    data,
    database,
    crm,
  }: {
    data: GroupId;
    database: Array<string>;
    crm: Crm | null;
  }) => void;
  onSearchGroupId: (search: string) => void;
}

export const StartupWidget = (props: StartupWidgetProps) => {
  const {
    search,

    groupId,
    groupIdData,
    groupIdLoading,

    groupIds,
    groupIdsloading,

    groupIdDatabase,
    groupIdDatabaseLoading,

    crmData,
    crmLoading,

    isSubmitLoading,

    onClickGroupId,
    onSumbitDrawer,
    onCloseDrawer,
    onSearchGroupId,
  } = props;

  if (groupIdsloading) {
    return <StartupWidgetLoading />;
  }

  return (
    <div className={classes.startupWidget}>
      <div className={classes.startupWidgetWrapper}>
        <Title className={classes.head}>Запуски 🚀</Title>

        <div className={classes.searchAndButtonWrapper}>
          <Input
            placeholder="Поиск по запускам..."
            value={search}
            onChange={(e) => onSearchGroupId(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            className={classes.searchInput}
          />
          <Button
            type="primary"
            size="middle"
            className={classes.createButton}
            onClick={() =>
              onClickGroupId(
                String(Math.floor(Math.random() * 10 ** 10) + 10 ** 10)
              )
            }
          >
            Создать запуск
          </Button>
        </div>
      </div>

      <StartupWidgetTable
        groupIds={groupIds}
        loading={false}
        onClickGroupId={onClickGroupId}
      />
      {groupId && (
        <StartupWidgetDrawer
          groupId={groupId}
          groupIdData={groupIdData}
          groupIdDatabase={groupIdDatabase}
          crmData={crmData}
          loading={
            groupIdLoading ||
            groupIdDatabaseLoading ||
            crmLoading ||
            isSubmitLoading
          }
          onCloseDrawer={onCloseDrawer}
          onSumbitDrawer={onSumbitDrawer}
        />
      )}
    </div>
  );
};
