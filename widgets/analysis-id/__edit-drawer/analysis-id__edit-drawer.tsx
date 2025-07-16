import { Drawer } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { Analysis } from '../../../@types/Analysis';
import { AnalysisUpdateContainer } from '../../analysis-update/analysis-update.container';
import classes from './analysis-id__edit-drawer.module.css';

interface AnalysisIdEditDrawerProps {
  isOpen: boolean;
  analysis: Analysis;
  onClose: () => void;
}

export const AnalysisIdEditDrawer = ({
  isOpen,
  analysis,
  onClose,
}: AnalysisIdEditDrawerProps) => {
  return (
    <Drawer
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EditOutlined />
            <span>Редактирование разбора</span>
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '500',
              opacity: 0.7,
              color: 'red',
            }}
          >
            Технически доступно только менеджерам
          </div>
        </div>
      }
      placement="right"
      width={820}
      onClose={onClose}
      open={isOpen}
      className={classes.editDrawer}
      classNames={{
        body: classes.drawerBody,
      }}
      destroyOnClose
      maskClosable={true}
    >
      <AnalysisUpdateContainer
        analysis={analysis}
        className={classes.drawerForm}
      />
    </Drawer>
  );
};
