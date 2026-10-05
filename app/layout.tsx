import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CookieConsent } from '@/components/kokonut/cookie-consent';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const interTight = Inter_Tight({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap', variable: '--font-inter-tight' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://jugo.travel'),
  title: {
    default: 'jugo — cheaper flights abroad, visas sorted',
    template: '%s · jugo',
  },
  description:
    'Plan international trips on an Indian passport. Compare direct flights with cheaper routes through Istanbul, Dubai, Addis Ababa and more — with visa fees, baggage and processing times included.',
  keywords: [
    'Indian passport visa free countries',
    'cheap flights from India',
    'self transfer route India',
    'transit visa for Indians',
    'visa on arrival for Indians',
  ],
  applicationName: 'jugo',
  openGraph: {
    title: 'jugo — cheaper flights abroad, visas sorted',
    description: 'Compare direct and via-hub routes with visa fees, baggage and processing times included.',
    siteName: 'jugo',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
