import type { MetadataRoute } from 'next';
import { getAllDestinations } from '@/lib/db';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indianpassporttravel.com';
  const destinations = await getAllDestinations();
  const now = new Date();

  const pages: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
    ['', 'daily', 1.0],
    ['/visas', 'weekly', 0.9],
    ['/routes', 'weekly', 0.7],
    ['/transit-hubs', 'weekly', 0.7],
    ['/privacy', 'yearly', 0.2],
    ['/terms', 'yearly', 0.2],
  ];

  return [
    ...pages.map(([path, changeFrequency, priority]) => ({ url: `${baseUrl}${path}`, lastModified: now, changeFrequency, priority })),
    ...destinations.map((c) => ({
      url: `${baseUrl}/destination/${c.countryCode}`,
      lastModified: c.lastVerifiedAt ? new Date(c.lastVerifiedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
