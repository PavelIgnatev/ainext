'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAnalysisList } from './analysis-list.hooks';
import { AnalysisList } from './analysis-list';

export const AnalysisListContainer = () => {
  const router = useRouter();
  const { items, isLoading, hasMore, loadMore, onSearch } = useAnalysisList();

  const handleAnalysisClick = useCallback(
    (id: string) => {
      router.push(`/analysis/${id}`);
    },
    [router]
  );

  return (
    <AnalysisList
      hasMore={hasMore}
      analysisData={items}
      analysisLoading={isLoading}
      onSearch={onSearch}
      onLoadMore={loadMore}
      onAnalysisClick={handleAnalysisClick}
    />
  );
};
