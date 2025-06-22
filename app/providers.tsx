'use client';

import '@ant-design/v5-patch-for-react-19';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notification } from 'antd';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [api, contextHolder] = notification.useNotification();

  return (
    <QueryClientProvider client={queryClient}>
      {contextHolder}
      {children}
    </QueryClientProvider>
  );
}
