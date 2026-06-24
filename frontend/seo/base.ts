import type { Metadata } from 'next'
// normalize the origin to remove trailing slashes
function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/+$/, '')
}
// site origin is the origin of the website without trailing slashes
export const siteOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL || 'https://filmy7.com')
// metadata base is the origin of the website with a trailing slash
const metadataBase = new URL(`${siteOrigin}/`)

export const siteDefaultTitle = 'Filmy7 — filmy i seriale online'

export const siteDefaultDescription =
  'Oglądaj filmy i seriale online w HD z polskimi napisami — bez rejestracji. Na Filmy7 znajdziesz najnowsze premiery i sprawdzone hity w jednym katalogu.'

/** Default share image; keep file in [`public/og-image.png`](../public/og-image.png) (replace with 1200×630 artwork when available). */
const defaultOgImage = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'Filmy7 — filmy i seriale online w HD',
  type: 'image/png',
} as const

export const seoBase = {
  metadataBase,
  title: {
    default: siteDefaultTitle,
    template: '%s | Filmy7',
  },
  description: siteDefaultDescription,
  keywords: [
    'filmy online',
    'seriale online',
    'oglądaj filmy',
    'filmy w HD',
    'polskie napisy',
    'kino online',
    'filmy7',
  ],
  authors: [{ name: 'Filmy7', url: siteOrigin }],
  creator: 'Filmy7',
  publisher: 'Filmy7',
  category: 'Entertainment',
  classification: 'Movies & TV Shows',
  // alternates is an object that contains the canonical URL of the website
  alternates: {
    canonical: '/',
  },

  applicationName: 'Filmy7',
  referrer: 'origin-when-cross-origin',

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  appleWebApp: {
    capable: true,
    title: 'Filmy7',
    statusBarStyle: 'black-translucent',
  },

  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: metadataBase,
    siteName: 'Filmy7',
    title: siteDefaultTitle,
    description: siteDefaultDescription,
    countryName: 'Poland',
    images: [
      defaultOgImage,
      {
        url: '/filmy7-logo.png',
        width: 512,
        height: 512,
        alt: 'Filmy7 — logo',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@filmy7',
    creator: '@filmy7',
    title: siteDefaultTitle,
    description: siteDefaultDescription,
    images: [
      {
        url: defaultOgImage.url,
        width: defaultOgImage.width,
        height: defaultOgImage.height,
        alt: defaultOgImage.alt,
        type: defaultOgImage.type,
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  manifest: '/manifest.webmanifest',

  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
  },

  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
} satisfies Metadata
