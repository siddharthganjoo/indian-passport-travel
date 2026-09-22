import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CookieConsent } from '@/components/kokonut/cookie-consent';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://indianpassporttravel.com'),
  title: {
    default: 'DesiVisa - Indian Passport Travel & Visa Metasearch',
    template: '%s | DesiVisa',
  },
  description:
    'Dynamic visa intelligence and flight metasearch platform tailored for Indian passport holders. Explore visa-free countries, eVisa portals, and conditional US/Schengen/UK visa waiver relaxations.',
  keywords: [
    'Indian passport visa free countries',
    'Indian passport visa on arrival',
    'US visa waiver for Indians',
    'Schengen visa relaxation Indian passport',
    'cheap flights from India',
    'Amadeus flight aggregator India',
  ],
  authors: [{ name: 'DesiVisa Metasearch Team' }],
  creator: 'DesiVisa',
  publisher: 'DesiVisa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'DesiVisa - Indian Passport Travel & Visa Metasearch',
    description:
      'Where can your Indian passport take you? Real-time visa rules, conditional waivers, and low-fare flight search from DEL, BOM, BLR, and beyond.',
    url: 'https://indianpassporttravel.com',
    siteName: 'DesiVisa',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DesiVisa - Indian Passport Travel & Visa Metasearch',
    description:
      'Where can your Indian passport take you? Real-time visa rules, conditional waivers, and low-fare flight search.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 font-sans">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
