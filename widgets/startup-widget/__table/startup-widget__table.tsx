import { Progress, Table, TableProps } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { GroupIdType } from '../startup-widget.types';

interface StartupWidgetProps {
  loading: boolean;

  groupId: GroupIdType[];

  onClickStartupId: (startupId: string) => void;
}

export const StartupWidgetTable = (props: StartupWidgetProps) => {
  const { groupId, loading, onClickStartupId } = props;

  const columns: TableProps<GroupIdType>['columns'] = [
    {
      title: 'GroupId',
      dataIndex: 'groupId',
      render: (_, { groupId }) => {
        return (
          <a key={groupId} onClick={() => onClickStartupId(groupId)}>
            {groupId}
          </a>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Current / Target',
      dataIndex: 'currentCount',
      render: (_, v) => {
        return (
          <p key={v.groupId}>
            {v.currentCount} / {v.target}
          </p>
        );
      },
    },
    {
      title: 'Progress',
      render: (_, v) => {
        return (
          <Progress
            key={v.groupId}
            size="small"
            type="dashboard"
            steps={8}
            percent={Math.round((v.currentCount / v.target) * 100)}
            trailColor="rgba(0, 0, 0, 0.06)"
            strokeWidth={10}
            {...(v.stopped && { status: 'exception' })}
          />
        );
      },
    },
  ];
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Table
      size="middle"
      scroll={{ y: windowHeight - 70 - 76 - 104 }}
      columns={columns as any}
      loading={loading}
      dataSource={groupId}
      bordered={true}
      rowKey="groupId"
    />
  );
};
