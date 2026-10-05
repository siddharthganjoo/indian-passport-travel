import type { MetadataRoute } from 'next';
import { getAllDestinations } from '@/lib/db';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE.url;
  const destinations = await getAllDestinations();
  const now = new Date();

  const pages: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
    ['', 'daily', 1.0],
    ['/visas', 'weekly', 0.9],
    ['/routes', 'weekly', 0.7],
    ['/transit-hubs', 'weekly', 0.7],
    ['/about', 'monthly', 0.4],
    ['/how-we-verify', 'monthly', 0.4],
    ['/help', 'monthly', 0.5],
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
