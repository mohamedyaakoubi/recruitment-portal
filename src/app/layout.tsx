import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from './ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Career Portal',
    template: '%s | Career Portal',
  },
  description:
    'Connect with international job opportunities and take the next step in your professional journey.',
  keywords: ['jobs', 'careers', 'international', 'recruitment'],
  authors: [{ name: 'The Organization' }],
  openGraph: {
    title: 'Career Portal',
    description: 'Your career journey starts here',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ClientProviders>
          <main id="main-content">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}
