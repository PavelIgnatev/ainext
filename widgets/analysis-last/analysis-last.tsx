import { List, Skeleton, Typography } from 'antd';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import classes from './analysis-last.module.css';

interface AnalysisLastProps {
  analysisData?:
    | {
        aiRole: string;
        companyId: string;
        companyName: string;
        companyDescription: string;
        goal: string;
      }[]
    | null;
  analysisLoading: boolean;

  onAnalysisClick: (id: string) => void;
}

export const AnalysisLast = (props: AnalysisLastProps) => {
  const { analysisData, analysisLoading, onAnalysisClick } = props;
  const data = (analysisData || []).reverse();

  return (
    <div className={classes.analysisLast}>
      <Typography.Title
        level={4}
        style={{ margin: '1em 0', textAlign: 'center' }}
      >
        Ранее добавленные разборы
      </Typography.Title>
      <div id="scrollableDiv" className={classes.analysisLastScrollable}>
        <InfiniteScroll
          dataLength={data.length}
          next={() => {}}
          hasMore={analysisLoading}
          loader={
            <>
              <Skeleton paragraph={{ rows: 1 }} active />
              <Skeleton paragraph={{ rows: 1 }} active />
              <Skeleton paragraph={{ rows: 1 }} active />
              <Skeleton paragraph={{ rows: 1 }} active />
            </>
          }
          scrollableTarget="scrollableDiv"
        >
          <List
            dataSource={data}
            renderItem={(item) => (
              <List.Item
                key={String(item.companyId)}
                onClick={() => onAnalysisClick(item.companyId)}
              >
                <List.Item.Meta
                  title={item.companyName}
                  description={item.companyDescription}
                  className={classes.meta}
                />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      </div>
    </div>
  );
};
