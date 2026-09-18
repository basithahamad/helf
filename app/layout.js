import './globals.css';
import { readSite } from '../lib/store';

// Title and description come from the site document, so SEO copy is editable in
// the admin like everything else.
export async function generateMetadata() {
  const site = await readSite().catch(() => ({}));
  return {
    title: site.seo?.title || '',
    description: site.seo?.description || ''
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
