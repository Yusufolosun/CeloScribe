import type { Metadata } from 'next';

import { Web3Provider } from '@/providers/Web3Provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'CeloScribe',
  description: 'Mobile-first MiniPay task selection and payment flow for CeloScribe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
