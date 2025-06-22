import { Button, Typography } from 'antd';
import { FileSearchOutlined, BulbOutlined } from '@ant-design/icons';
import classes from './analysis-id__empty-page.module.css';

interface AnalysisIdEmptyPageProps {
  analysisId: string;
}

export const AnalysisIdEmptyPage = ({
  analysisId,
}: AnalysisIdEmptyPageProps) => {
  return (
    <div className={classes.emptyContainer}>
      <div className={classes.backgroundPattern} />
      <div className={classes.emptyContent}>
        <div className={classes.iconContainer}>
          <FileSearchOutlined className={classes.emptyIcon} />
        </div>

        <Typography.Title level={2} className={classes.emptyTitle}>
          Разбор не найден
        </Typography.Title>

        <Typography.Text className={classes.emptyDescription}>
          разбор с ID <span className={classes.analysisId}>{analysisId}</span>{' '}
          не существует в системе. Возможно, вы перешли по устаревшей ссылке или
          ввели неверный идентификатор.
        </Typography.Text>

        <div className={classes.suggestion}>
          <BulbOutlined className={classes.suggestionIcon} />
          <strong>Совет:</strong> Убедитесь, что ID разбора введен корректно,
          или обратитесь к администратору, если считаете, что разбор должен
          существовать.
        </div>
      </div>
    </div>
  );
};
