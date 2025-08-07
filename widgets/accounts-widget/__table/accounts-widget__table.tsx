'use client';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { useMediaQuery } from 'react-responsive';
import { useEffect, useState, useRef, useCallback } from 'react';
import classes from './accounts-widget__table.module.css';
import { Account } from '../accounts-widget.types';

interface AccountsWidgetTableProps {
  loading: boolean;
  accounts: Account[];
  onAccountClick: (accountId: string) => void;
}

const columnHelper = createColumnHelper<Account>();

export const AccountsWidgetTable = (props: AccountsWidgetTableProps) => {
  const { accounts, onAccountClick } = props;

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

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => (
        <div className={classes.idCell}>
          <span className={classes.idText} title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
      size: isMobile ? 100 : 140,
    }),
    columnHelper.accessor('username', {
      header: 'Username',
      cell: (info) => (
        <div className={classes.usernameCell}>
          <span title={info.getValue()}>{info.getValue()}</span>
        </div>
      ),
      size: isMobile ? 120 : 180,
    }),
    columnHelper.accessor('platform', {
      header: 'Platform',
      cell: (info) => (
        <div className={classes.platformCell}>
          <span
            className={`${classes.platformBadge} ${
              info.getValue() === 'Telegram'
                ? classes.platformTelegram
                : classes.platformWhatsapp
            }`}
          >
            {info.getValue()}
          </span>
        </div>
      ),
      size: isMobile ? 80 : 120,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <div className={classes.statusCell}>
          <span
            className={`${classes.statusBadge} ${
              info.getValue() === 'active'
                ? classes.statusActive
                : info.getValue() === 'inactive'
                  ? classes.statusInactive
                  : classes.statusBanned
            }`}
          >
            {info.getValue() === 'active'
              ? 'Активен'
              : info.getValue() === 'inactive'
                ? 'Неактивен'
                : 'Заблокирован'}
          </span>
        </div>
      ),
      size: isMobile ? 100 : 130,
    }),
    columnHelper.accessor('launchCount', {
      header: 'Запуски',
      cell: (info) => (
        <div className={classes.launchCountCell}>{info.getValue()}</div>
      ),
      size: isMobile ? 80 : 100,
    }),
    columnHelper.accessor('lastActivity', {
      header: 'Последняя активность',
      cell: (info) => (
        <div className={classes.lastActivityCell}>
          {new Date(info.getValue()).toLocaleDateString('ru-RU')}
        </div>
      ),
      size: isMobile ? 120 : 160,
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
    data: accounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

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
                onClick={() => onAccountClick(row.original.id)}
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

      <div className={classes.pagination}>
        <div className={classes.paginationInfo}>
          Показано{' '}
          {accounts.length > 0
            ? pagination.pageIndex * pagination.pageSize + 1
            : 0}
          -
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            accounts.length
          )}{' '}
          из {accounts.length} записей
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
