import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // Импорт из этой же папки

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|preview.jpg).*)',
  ],
};