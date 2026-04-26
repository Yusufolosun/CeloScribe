import type { Metadata } from 'next';

import { Web3Provider } from '@/providers/Web3Provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'CeloScribe',
  description:
    'Pay-per-use AI access on Celo. Request transcription, translation, writing, or image generation—pay only for what you use with cUSD.',
  authors: [{ name: 'CeloScribe Contributors' }],
  keywords: ['Celo', 'MiniPay', 'AI', 'Web3', 'pay-per-use', 'blockchain', 'stablecoin', 'cUSD'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://celoscribe.com',
    title: 'CeloScribe',
    description:
      'Pay-per-use AI access on Celo. Request transcription, translation, writing, or image generation—pay only for what you use with cUSD.',
    images: [
      {
        url: 'https://celoscribe.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CeloScribe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CeloScribe',
    description:
      'Pay-per-use AI access on Celo. Request transcription, translation, writing, or image generation—pay only for what you use with cUSD.',
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
