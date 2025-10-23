import type { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

// GiperARENA Primary Font - Exo 2
const exo2 = Exo_2({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-exo-2',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GiperARENA - Remote Gaming Platform',
  description: 'Control real robots and drones in physical arenas from anywhere in the world',
  keywords: ['gaming', 'robots', 'drones', 'remote control', 'tournaments', 'blockchain'],
  authors: [{ name: 'GiperARENA Team' }],
  creator: 'GiperARENA',
  publisher: 'GiperARENA',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://giperarena.space',
    title: 'GiperARENA - Remote Gaming Platform',
    description: 'Control real robots and drones in physical arenas from anywhere in the world',
    siteName: 'GiperARENA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GiperARENA - Remote Gaming Platform',
    description: 'Control real robots and drones in physical arenas from anywhere in the world',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          exo2.variable,
          'font-sans antialiased min-h-screen bg-background text-foreground',
          'overflow-x-hidden'
        )}
      >
        {children}
      </body>
    </html>
  );
}
