import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import { ThemeInit } from '@/components/theme-init';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Frontpage - RSS Reader',
  description: 'Your personalized front page for tech content',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider session={session}>
          <ThemeInit />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}