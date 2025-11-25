import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "International Skills - Career Portal",
    template: "%s | International Skills",
  },
  description: "Connect with international job opportunities and take the next step in your professional journey.",
  keywords: ["jobs", "careers", "international", "recruitment", "Finland"],
  authors: [{ name: "International Skills Labor Company" }],
  openGraph: {
    title: "International Skills - Career Portal",
    description: "Your career journey starts here",
    type: "website",
    locale: "en_US",
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
      <body className={inter.className}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ClientProviders>
          <main id="main-content">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}

