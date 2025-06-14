import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Button, DatePicker, Space, Spin, Tooltip as AntTooltip } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useResizeObserver from 'use-resize-observer';

import classes from './view-dialog__statistics.module.css';

dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

export interface ViewDialogStatisticsProps {
  averageDialogDuration: number;
  averageDialogDurationIfResponse: number;
  messagesToDialog: number;
  statisticsByDay: { [key: string]: { dateCreated: Date; messages: number }[] };
  onExportLeads?: (dateRange?: [Date, Date]) => void;
  onExportSent?: (dateRange?: [Date, Date]) => void;
  onExportUnsent?: (dateRange?: [Date, Date]) => void;
  onExportBlocked?: (dateRange?: [Date, Date]) => void;
  onExportDialogs?: (dateRange?: [Date, Date]) => void;
  onBack: () => void;
  exportLoading: {
    leads: boolean;
    sent: boolean;
    unsent: boolean;
    blocked: boolean;
    dialogs: boolean;
  };
  groupId?: string | null;
}

export const ViewDialogStatistics = (props: ViewDialogStatisticsProps) => {
  const {
    averageDialogDuration,
    averageDialogDurationIfResponse,
    messagesToDialog,
    statisticsByDay,
    onExportLeads,
    onExportSent,
    onExportUnsent,
    onExportBlocked,
    onExportDialogs,
    onBack,
    exportLoading,
    groupId,
  } = props;

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const { ref, width = 1 } = useResizeObserver();

  const getChartData = useMemo(() => {
    const data = [];

    for (const [date, dialogues] of Object.entries(statisticsByDay)) {
      const messagesLength = dialogues.length;
      const dialoguesLength = dialogues.filter(
        (dialogue) => dialogue.messages && dialogue.messages > 2
      ).length;

      data.push({
        name: new Date(Number(date)).toLocaleDateString(),
        Сообщения: messagesLength,
        Диалоги: dialoguesLength,
        'Конверсия (%)': Number(
          (dialoguesLength / messagesLength) * 100
        ).toFixed(1),
      });
    }

    return data.sort(
      (a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()
    );
  }, [statisticsByDay]);

  const handleExport = async (
    exportFn?: (dateRange?: [Date, Date]) => void,
    type?: string
  ) => {
    if (!exportFn) return;

    if (dateRange) {
      const [start, end] = dateRange;
      await exportFn([start.toDate(), end.toDate()]);
    } else {
      await exportFn();
    }
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current > dayjs().endOf('day');
  };

  const getDateRangeText = () => {
    if (!dateRange) return 'За все время';
    const [start, end] = dateRange;
    return `${start.format('DD.MM.YYYY')} - ${end.format('DD.MM.YYYY')}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={classes.customTooltip}>
          <p className={classes.tooltipLabel}>{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'Конверсия (%)' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={classes.viewDialogStatistics} ref={ref}>
      <div className={classes.viewDialogScreenMain}>
        <div className={classes.statsHeader}>
          <button onClick={onBack} className={classes.backButton}>
            <ArrowLeftOutlined />
          </button>
          <h2>Статистика</h2>
          <div className={classes.statsInfo}>
            <CalendarOutlined /> {getDateRangeText()}
          </div>
        </div>
        <div className={classes.statsCards}>
          <div className={classes.statsCard}>
            <div className={classes.statsCardTitle}>
              Средняя продолжительность диалога
            </div>
            <div className={classes.statsCardValue}>
              {averageDialogDuration.toFixed(2)}
            </div>
            <div className={classes.statsCardSubtitle}>глобально</div>
          </div>
          <div className={classes.statsCard}>
            <div className={classes.statsCardTitle}>
              Средняя продолжительность диалога
            </div>
            <div className={classes.statsCardValue}>
              {averageDialogDurationIfResponse.toFixed(2)}
            </div>
            <div className={classes.statsCardSubtitle}>в случае ответа</div>
          </div>
          <div className={classes.statsCard}>
            <div className={classes.statsCardTitle}>
              Процент диалогов из отправок
            </div>
            <div className={classes.statsCardValue}>
              {messagesToDialog.toFixed(2)}%
            </div>
            <div className={classes.statsCardSubtitle}>глобально</div>
          </div>
        </div>
        {groupId && (
          <div className={classes.exportSection}>
            <h3 className={classes.sectionTitle}>Экспорт данных</h3>
            <div className={classes.dateFilterSection}>
              <div className={classes.dateFilterHeader}>
                <div className={classes.dateFilterTitle}>
                  <CalendarOutlined /> Фильтр по дате создания
                </div>
                <div className={classes.dateFilterInfo}>
                  {getDateRangeText()}
                </div>
              </div>
              <RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    const [start, end] = dates;
                    setDateRange([start.startOf('day'), end.endOf('day')]);
                  } else {
                    setDateRange(null);
                  }
                }}
                value={dateRange}
                disabledDate={disabledDate}
                format="DD.MM.YYYY"
                placeholder={['Начальная дата', 'Конечная дата']}
                className={classes.datePicker}
                allowClear={true}
                ranges={{
                  Сегодня: [dayjs().startOf('day'), dayjs().endOf('day')],
                  Вчера: [
                    dayjs().subtract(1, 'day').startOf('day'),
                    dayjs().subtract(1, 'day').endOf('day'),
                  ],
                  'Последние 7 дней': [
                    dayjs().subtract(6, 'day').startOf('day'),
                    dayjs().endOf('day'),
                  ],
                  'Последние 30 дней': [
                    dayjs().subtract(29, 'day').startOf('day'),
                    dayjs().endOf('day'),
                  ],
                  'Этот месяц': [
                    dayjs().startOf('month'),
                    dayjs().endOf('month'),
                  ],
                  'Прошлый месяц': [
                    dayjs().subtract(1, 'month').startOf('month'),
                    dayjs().subtract(1, 'month').endOf('month'),
                  ],
                }}
              />
              {dateRange && (
                <Button
                  type="link"
                  onClick={() => setDateRange(null)}
                  className={classes.clearDateButton}
                >
                  Сбросить фильтр
                </Button>
              )}
            </div>
            <div className={classes.exportButtons}>
              <div className={classes.exportButtonsRow}>
                <Button
                  icon={<DownloadOutlined />}
                  loading={exportLoading.leads}
                  disabled={
                    Object.values(exportLoading).some(Boolean) &&
                    !exportLoading.leads
                  }
                  onClick={() => handleExport(onExportLeads, 'leads')}
                >
                  Экспорт лидов
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  loading={exportLoading.sent}
                  disabled={
                    Object.values(exportLoading).some(Boolean) &&
                    !exportLoading.sent
                  }
                  onClick={() => handleExport(onExportSent, 'sent')}
                >
                  Экспорт отправленных
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  loading={exportLoading.dialogs}
                  disabled={
                    Object.values(exportLoading).some(Boolean) &&
                    !exportLoading.dialogs
                  }
                  onClick={() => handleExport(onExportDialogs, 'dialogs')}
                >
                  Экспорт диалогов
                </Button>
              </div>
              <div className={classes.exportButtonsRow}>
                <Button
                  icon={<DownloadOutlined />}
                  loading={exportLoading.unsent}
                  disabled={
                    Object.values(exportLoading).some(Boolean) &&
                    !exportLoading.unsent
                  }
                  onClick={() => handleExport(onExportUnsent, 'unsent')}
                >
                  Экспорт неотправленных
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  loading={exportLoading.blocked}
                  disabled={
                    Object.values(exportLoading).some(Boolean) &&
                    !exportLoading.blocked
                  }
                  onClick={() => handleExport(onExportBlocked, 'blocked')}
                >
                  Экспорт заблокированных
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className={classes.chartSection}>
          <h3 className={classes.sectionTitle}>Динамика диалогов</h3>
          <div className={classes.chartContainer}>
            <ResponsiveContainer width="100%" height={300} minWidth={600}>
              <BarChart
                data={getChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#8884d8"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#82ca9d"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  yAxisId="left"
                  dataKey="Сообщения"
                  fill="#8884d8"
                  name="Количество сообщений"
                />
                <Bar
                  yAxisId="left"
                  dataKey="Диалоги"
                  fill="#82ca9d"
                  name="Количество диалогов"
                />
                <Bar
                  yAxisId="right"
                  dataKey="Конверсия (%)"
                  fill="#ffc658"
                  name="Конверсия"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
