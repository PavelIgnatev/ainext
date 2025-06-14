import { useRouter } from 'next/router';
import { QueryClient, useQuery } from 'react-query';
import { dehydrate } from 'react-query/hydration';

import FrontendAnalysisApi from '../../api/frontend/analysis';
import { AnalysisLast } from './analysis-last';

export const AnalysisLastContainer = () => {
  const router = useRouter();

  const { data: analysisData, isLoading: analysisLoading } = useQuery(
    'analysis',
    () => FrontendAnalysisApi.getAnalysis(),
    {
      staleTime: Infinity,
    }
  );

  const handleAnalysisClick = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  return (
    <AnalysisLast
      analysisData={analysisData}
      analysisLoading={analysisLoading}
      onAnalysisClick={handleAnalysisClick}
    />
  );
};

export const getServerSideProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery('analysis', () =>
    FrontendAnalysisApi.getAnalysis()
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
