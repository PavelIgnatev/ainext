import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Принудительно устанавливаем development заголовки
  const response = NextResponse.next();

  // Отключаем production санитизацию ошибок
  response.headers.set('x-vercel-functions-config-dev', 'true');
  response.headers.set('x-nextjs-debug', 'true');

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
