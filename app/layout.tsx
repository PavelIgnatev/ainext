import { config as dotenvConfig } from 'dotenv';
import type { Metadata, Viewport } from 'next';

import { ysText } from '@/assets/fonts';

import Providers from './providers';

import '@/assets/normalize.css';
import '@/assets/antd-overrides.css';

dotenvConfig();

export const metadata: Metadata = {
  title: 'AiSender - Лидогенерация с AI',
  description:
    'AISender - инструмент ИИ, который способен самостоятельно найти лидов и вести диалог с клиентом. Присоединяйтесь к нашему Telegram каналу для последних обновлений.',
  keywords:
    'AISender, лидогенерация, AI, искусственный интеллект, лиды, автоматизация продаж, маркетинг, телеграм канал',
  openGraph: {
    type: 'website',
    url: 'https://aisender.ru/',
    title: 'AiSender - Лидогенерация с AI',
    description:
      'AISender - инструмент ИИ для лидогенерации и автоматизации диалогов с клиентами',
  },
  other: {
    'telegram:channel': '@aisendercases',
  },
  alternates: {
    canonical: 'https://aisender.ru/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={ysText.variable}>
      <body className={ysText.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
