import localFont from 'next/font/local';

export const ysText = localFont({
  src: [
    {
      path: './fonts/text-light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/text-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/text-medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/text-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
  variable: '--font-ys-text',
});
