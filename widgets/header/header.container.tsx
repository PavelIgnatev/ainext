'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { Header } from './header';

export const HeaderContainer = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAnalysis = pathname.includes('/analysis/');

  const getHref = () => {
    if (isAnalysis) {
      const params = new URLSearchParams(searchParams);

      if (!params.has('debug')) {
        params.append('debug', 'true');
      }

      return `${pathname}?${params.toString()}`;
    } else {
      return 'https://t.me/aisendercases';
    }
  };

  return <Header href={getHref()} target={isAnalysis ? '_self' : '_blank'} />;
};
