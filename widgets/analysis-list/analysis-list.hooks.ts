import { useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import type { Analysis } from '@/@types/Analysis';
import { getAnalysis } from '@/db/analysis';

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_DELAY = 300;

type SmallAnalysis = Pick<
  Analysis,
  'aiRole' | 'companyId' | 'companyName' | 'companyDescription' | 'goal'
>;

interface UseAnalysisListResult {
  hasMore: boolean;
  isLoading: boolean;
  items: SmallAnalysis[];

  loadMore: () => void;
  onSearch: (value: string) => void;
}

export const useAnalysisList = (): UseAnalysisListResult => {
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, DEBOUNCE_DELAY);
  const [accumulatedItems, setAccumulatedItems] = useState<SmallAnalysis[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['analysis-list', offset, debouncedSearchQuery],
    queryFn: () =>
      getAnalysis({
        offset,
        batchSize: ITEMS_PER_PAGE,
        searchQuery: debouncedSearchQuery,
      }),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    setAccumulatedItems([]);
    setOffset(0);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (data?.items) {
      setAccumulatedItems((prev) => {
        const newItems = [...prev];
        data.items.forEach((item) => {
          if (
            !newItems.some((existing) => existing.companyId === item.companyId)
          ) {
            newItems.push(item);
          }
        });
        return newItems;
      });
    }
  }, [data?.items]);

  const loadMore = useCallback(() => {
    if (data?.hasMore) {
      setOffset((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [data?.hasMore]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return {
    items: accumulatedItems,
    isLoading,
    hasMore: data?.hasMore ?? false,
    loadMore,
    onSearch: handleSearch,
  };
};
