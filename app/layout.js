import './globals.css';
import { readSite } from '../lib/store';

// Absolute URLs are required for Open Graph and canonical tags; the domain is a
// deployment fact rather than content, so it comes from the environment.
export const SITE_URL = process.env.SITE_URL || 'https://thehelfreview.com';

// Title, description and the sharing image all come from the site document, so
// SEO copy is editable in the admin like everything else.
export async function generateMetadata() {
  const site = await readSite().catch(() => ({}));
  const seo = site.seo || {};
  const title = seo.title || '';
  const description = seo.description || '';
  // Left unset, app/opengraph-image.js renders the branded card. Setting a
  // Sharing image in the admin overrides it with a real photograph.
  const image = seo.ogImage || null;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: seo.siteName || title,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: seo.siteName || title,
      title,
      description,
      url: '/',
      locale: 'en_US',
      ...(image ? { images: [{ url: image, alt: title }] } : {})
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image ? { images: [image] } : {})
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
    }
  };
}

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
