'use client';
import { GroupId } from '@/@types/GroupId';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { useMediaQuery } from 'react-responsive';
import { useEffect, useState, useRef, useCallback } from 'react';
import classes from './startup-widget__table.module.css';

type SmallGroupId = Pick<
  GroupId,
  'groupId' | 'name' | 'target' | 'currentCount'
>;

interface StartupWidgetProps {
  loading: boolean;
  groupIds: SmallGroupId[];
  onClickGroupId: (startupId: string) => void;
}

const columnHelper = createColumnHelper<SmallGroupId>();

export const StartupWidgetTable = (props: StartupWidgetProps) => {
  const { groupIds, onClickGroupId } = props;

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(10);

  const calculatePageSize = useCallback(() => {
    if (!tableContainerRef.current) return 10;

    const container = tableContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const availableHeight = window.innerHeight - containerRect.top - 120;
    const rowHeight = isMobile ? 60 : 72;
    const calculatedPageSize = Math.floor(availableHeight / rowHeight) - 1;

    return Math.max(5, Math.min(50, calculatedPageSize));
  }, [isMobile]);

  useEffect(() => {
    const updatePageSize = () => {
      const newPageSize = calculatePageSize();
      setPageSize(newPageSize);
    };

    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    window.addEventListener('orientationchange', updatePageSize);

    return () => {
      window.removeEventListener('resize', updatePageSize);
      window.removeEventListener('orientationchange', updatePageSize);
    };
  }, [calculatePageSize]);

  useEffect(() => {
    const newPageSize = calculatePageSize();
    setPageSize(newPageSize);
  }, [isMobile, calculatePageSize]);

  const ProgressCircle = ({
    percent,
    target,
  }: {
    percent: number;
    target: number;
  }) => {
    const size = isMobile ? 36 : 48;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    const getColor = () => {
      if (target === 0) return '#ef4444'; // красный для ошибки
      if (percent >= 100) return '#22c55e'; // зеленый для 100%
      return '#3b82f6'; // синий для всех остальных случаев
    };

    return (
      <div
        className={`${classes.progressContainer} ${target === 0 ? classes.errorProgress : ''}`}
      >
        <svg width={size} height={size} className={classes.progressSvg}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={target === 0 ? '#ef4444' : '#e0e0e0'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className={classes.progressCircle}
          />
        </svg>
        <div className={classes.progressText}>
          {target === 0 ? '✕' : `${percent}%`}
        </div>
      </div>
    );
  };

  const columns = [
    columnHelper.accessor('groupId', {
      header: 'Group ID',
      cell: (info) => (
        <div className={classes.groupIdCell}>
          <span className={classes.groupIdText} title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
      size: isMobile ? 120 : 200,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <div className={classes.nameCell}>
          <span title={info.getValue()}>{info.getValue()}</span>
        </div>
      ),
      size: isMobile ? 150 : 250,
    }),
    columnHelper.display({
      id: 'count',
      header: 'Current / Target',
      cell: (info) => (
        <div className={classes.countCell}>
          <span className={classes.currentCount}>
            {info.row.original.currentCount}
          </span>
          <span className={classes.divider}>/</span>
          <span className={classes.targetCount}>
            {info.row.original.target}
          </span>
        </div>
      ),
      size: isMobile ? 100 : 130,
    }),
    columnHelper.display({
      id: 'progress',
      header: 'Progress',
      cell: (info) => {
        const { currentCount, target } = info.row.original;
        const percent =
          target > 0
            ? currentCount >= target
              ? 100
              : Math.floor((currentCount / target) * 100)
            : 0;

        return <ProgressCircle percent={percent} target={target} />;
      },
      size: isMobile ? 80 : 100,
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageSize: pageSize,
      pageIndex: 0,
    }));
  }, [pageSize]);

  const table = useReactTable({
    data: groupIds,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  // Лоадер теперь обрабатывается на уровне StartupWidget

  return (
    <div className={classes.tableContainer} ref={tableContainerRef}>
      <div className={classes.tableWrapper}>
        <table className={classes.modernTable}>
          <thead className={classes.tableHead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={classes.headerRow}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={classes.headerCell}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className={classes.tableBody}>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={classes.tableRow}
                onClick={() => onClickGroupId(row.original.groupId)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={classes.tableCell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className={classes.pagination}>
        <div className={classes.paginationInfo}>
          Показано{' '}
          {groupIds.length > 0
            ? pagination.pageIndex * pagination.pageSize + 1
            : 0}
          -
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            groupIds.length
          )}{' '}
          из {groupIds.length} записей
        </div>
        <div className={classes.paginationControls}>
          <div className={classes.pageNumbers}>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
              .filter((page) => {
                const current = pagination.pageIndex + 1;
                return (
                  Math.abs(page - current) <= 2 ||
                  page === 1 ||
                  page === table.getPageCount()
                );
              })
              .map((page, index, array) => {
                if (index > 0 && array[index - 1] !== page - 1) {
                  return [
                    <span key={`dots-${page}`} className={classes.dots}>
                      ...
                    </span>,
                    <button
                      key={page}
                      className={`${classes.pageNumber} ${
                        table.getState().pagination.pageIndex === page - 1
                          ? classes.pageNumberActive
                          : ''
                      }`}
                      onClick={() => table.setPageIndex(page - 1)}
                    >
                      {page}
                    </button>,
                  ];
                }
                return (
                  <button
                    key={page}
                    className={`${classes.pageNumber} ${
                      table.getState().pagination.pageIndex === page - 1
                        ? classes.pageNumberActive
                        : ''
                    }`}
                    onClick={() => table.setPageIndex(page - 1)}
                  >
                    {page}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
