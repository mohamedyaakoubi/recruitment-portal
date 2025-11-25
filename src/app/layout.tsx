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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

