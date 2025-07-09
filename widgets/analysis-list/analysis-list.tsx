import { List, Skeleton, Typography, Input } from 'antd';
import React, { useEffect, useRef } from 'react';
import { SearchOutlined } from '@ant-design/icons';

import type { Analysis } from '@/@types/Analysis';
import classes from './analysis-list.module.css';

interface AnalysisListProps {
  analysisData: Pick<
    Analysis,
    'aiRole' | 'companyId' | 'companyName' | 'companyDescription' | 'goal'
  >[];
  analysisLoading: boolean;
  hasMore: boolean;
  loadingItemId?: string;

  onLoadMore: () => void;
  onSearch: (value: string) => void;
  onAnalysisClick: (id: string) => void;
}

export const AnalysisList = (props: AnalysisListProps) => {
  const {
    analysisData,
    analysisLoading,
    hasMore,
    onLoadMore,
    onAnalysisClick,
    onSearch,
    loadingItemId,
  } = props;
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !analysisLoading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, analysisLoading, onLoadMore]);

  const renderLoadingState = () => {
    if (!analysisLoading) return null;

    return (
      <div className={classes.loadingContainer}>
        <Skeleton paragraph={{ rows: 1 }} active />
        <Skeleton paragraph={{ rows: 1 }} active />
        <p className={classes.message}>Загрузка...</p>
      </div>
    );
  };

  const renderEmptyState = () => {
    if (analysisLoading || analysisData.length > 0 || !analysisData)
      return null;

    return <p className={classes.message}>Разборов не найдено</p>;
  };

  return (
    <div className={classes.analysisList}>
      <div className={classes.titleWrapper}>
        <Typography.Title level={4} className={classes.title}>
          Ранее добавленные разборы
        </Typography.Title>
        <div className={classes.searchWrapper}>
          <Input
            placeholder="Поиск по разборам..."
            onChange={(e) => onSearch(e.target.value)}
            prefix={<SearchOutlined />}
            className={classes.search}
            allowClear
          />
        </div>
      </div>
      <div className={classes.analysisListScrollable}>
        <List
          size="small"
          dataSource={analysisData}
          locale={{ emptyText: ' ' }}
          renderItem={(item) => (
            <List.Item
              key={String(item.companyId)}
              onClick={() => onAnalysisClick(item.companyId)}
              className={`${classes.listItem} ${loadingItemId === item.companyId ? classes.loading : ''}`}
            >
              <List.Item.Meta
                title={item.companyName}
                description={item.companyDescription}
                className={classes.meta}
              />
              {loadingItemId === item.companyId && (
                <div className={classes.itemLoadingOverlay}>
                  <Skeleton.Input active size="small" />
                </div>
              )}
            </List.Item>
          )}
        />
        {renderLoadingState()}
        {renderEmptyState()}
        {hasMore && (
          <div ref={observerTarget} className={classes.loadingTrigger} />
        )}
      </div>
    </div>
  );
};
