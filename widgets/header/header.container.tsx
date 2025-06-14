import { useRouter } from 'next/router';

import { Header } from './header';

export const HeaderContainer = () => {
  const router = useRouter();

  const isAnalysis = router.asPath.includes('/analysis/');

  const getHref = () => {
    if (isAnalysis) {
      const url = new URL(router.asPath, 'https://aisender.ru');
      const params = new URLSearchParams(url.search);

      if (!params.has('debug')) {
        params.append('debug', 'true');
      }

      return `${url.pathname}?${params.toString()}`;
    } else {
      return 'https://t.me/aisendercases';
    }
  };

  return <Header href={getHref()} target={isAnalysis ? '_self' : '_blank'} />;
};
