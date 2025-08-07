import { Input, Card, Space, Spin } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

import { Title } from '@/components/title/title';
import classes from './accounts-widget.module.css';
import { AccountGroup } from './accounts-widget.types';

interface AccountsWidgetProps {
  search: string;
  accountGroups: AccountGroup[];
  selectedAccount: string | null;
  loading: boolean;
  onSearchChange: (search: string) => void;
  onAccountClick: (accountId: string) => void;
  onCloseDetails: () => void;
}

export const AccountsWidget = (props: AccountsWidgetProps) => {
  const {
    search,
    accountGroups,
    selectedAccount,
    loading,
    onSearchChange,
    onAccountClick,
    onCloseDetails,
  } = props;

  if (loading) {
    return (
      <div className={classes.accountsWidget}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>Загрузка аккаунтов...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.accountsWidget}>
      <div className={classes.accountsWidgetWrapper}>
        <Title className={classes.head}>Аккаунты по группам 👥</Title>

        <div className={classes.searchAndButtonWrapper}>
          <Input
            placeholder="Поиск по префиксам..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            className={classes.searchInput}
          />
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          {accountGroups.map((group) => (
            <Card
              key={group.groupName}
              hoverable
              style={{
                height: '120px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              bodyStyle={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  <UserOutlined
                    style={{ marginRight: '6px', color: '#1890ff' }}
                  />
                  {group.groupName === 'no_prefix'
                    ? 'Без префикса'
                    : group.groupName}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <code
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '2px 4px',
                      borderRadius: '3px',
                    }}
                  >
                    {group.groupName}
                  </code>
                </div>
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1890ff',
                }}
              >
                {group.count}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 'normal',
                    color: '#999',
                    marginLeft: '4px',
                  }}
                >
                  акк.
                </span>
              </div>
            </Card>
          ))}
        </div>

        {accountGroups.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999',
              fontSize: '16px',
            }}
          >
            <UserOutlined
              style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}
            />
            <div>Нет данных для отображения</div>
          </div>
        )}
      </div>
    </div>
  );
};
