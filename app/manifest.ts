import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'BarberApp — Panel',
    short_name:       'BarberApp',
    description:      'Panel de gestión para barberos',
    start_url:        '/admin',
    display:          'standalone',
    background_color: '#09090b',  // zinc-950
    theme_color:      '#09090b',
    orientation:      'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}