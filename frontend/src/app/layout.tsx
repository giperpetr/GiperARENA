import type { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { MegaHeader } from '@/components/layout/MegaHeader';
import { RichFooter } from '@/components/layout/RichFooter';

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
  openGraph: {
    type: 'website',
    url: 'https://giperarena.space',
    title: 'GiperARENA - Remote Gaming Platform',
    description: 'Control real robots and drones in physical arenas from anywhere in the world',
    images: ['/logo-quad.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GiperARENA - Remote Gaming Platform',
    description: 'Control real robots and drones in physical arenas from anywhere in the world',
    images: ['/logo-quad.png'],
  },
  icons: {
    icon: [
      { url: '/logo-quad.svg', type: 'image/svg+xml' },
      { url: '/logo-quad.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/logo-quad.png',
  },
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
        <MegaHeader />
        {children}
        <RichFooter />
      </body>
    </html>
  );
}
