import type { Metadata } from 'next';

import { Web3Provider } from '@/providers/Web3Provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'CeloScribe',
  description: 'Mobile-first MiniPay task selection and payment flow for CeloScribe.',
  other: {
    'talentapp:project_verification':
      '05e003a6fe77a3dc4b0ea8748d6575213ef176039b241ea2fe3f1b9c7ee48cc64e41fb14a51b8e99fcfa9dd1bd52c37b631e8e04b8ae7b1c1c723fb2dea2a8d0',
  },
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
