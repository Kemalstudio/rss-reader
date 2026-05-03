import NextAuth from 'next-auth';
import { authConfig } from './lib/auth.config'; // Исправленный путь

export default NextAuth(authConfig).auth;

export const config = {
  // Защищаем все пути, кроме API, статики и картинок
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|preview.jpg).*)',
  ],
};