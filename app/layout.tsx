import { AccessCodeGuard } from '@/components/access-code-guard';
import { ServerProvidersInit } from '@/components/server-providers-init';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from '@/lib/hooks/use-i18n';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import 'animate.css';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import 'katex/dist/katex.min.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  variable: '--font-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'AI Interactive Classroom',
  title: 'AI Interactive Classroom',
  description:
    'The open-source AI interactive classroom. Upload a PDF to instantly generate an immersive, multi-agent learning experience.',
  icons: {
    icon: '/assets/logo-csl-black.png',
    apple: '/assets/logo-csl-black.png',
  },
  icons: {
    icon: '/assets/logo-csl-black.png',
    apple: '/assets/logo-csl-black.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <I18nProvider>
            <ServerProvidersInit />
            <AccessCodeGuard>{children}</AccessCodeGuard>
            <Toaster position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
