import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'jugo — cheaper flights abroad, visas sorted',
    short_name: 'jugo',
    description: 'Cheaper ways to fly abroad on an Indian passport, with every visa on the route sorted.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
