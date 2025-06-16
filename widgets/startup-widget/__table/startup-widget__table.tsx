'use client';
import { GroupId } from '@/@types/GroupId';
import { Progress, Table, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

type SmallGroupId = Pick<
  GroupId,
  'groupId' | 'name' | 'target' | 'currentCount'
>;

interface StartupWidgetProps {
  loading: boolean;

  groupIds: SmallGroupId[];

  onClickGroupId: (startupId: string) => void;
}

export const StartupWidgetTable = (props: StartupWidgetProps) => {
  const { loading, groupIds, onClickGroupId } = props;

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const columns: TableProps<SmallGroupId>['columns'] = [
    {
      title: 'GroupId',
      dataIndex: 'groupId',
      render: (_, { groupId }) => {
        return (
          <a key={groupId} onClick={() => onClickGroupId(groupId)}>
            {groupId}
          </a>
        );
      },
      width: 200,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 250,
      ellipsis: true,
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
      width: 150,
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
            {...(v.target === 0 && { status: 'exception' })}
          />
        );
      },
      width: 150,
    },
  ];

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
    <div style={{ overflowX: 'auto' }}>
      <Table
        rowKey="groupId"
        size={isMobile ? 'small' : 'middle'}
        columns={columns}
        loading={loading}
        dataSource={groupIds}
        bordered={true}
        scroll={{
          y: windowHeight - (isMobile ? 305 : 250),
          x: isMobile ? 500 : '100%',
        }}
        pagination={{
          size: isMobile ? 'small' : 'default',
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </div>
  );
};
