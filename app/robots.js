import { SITE_URL } from './layout';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The editor and the API are not content; search results for either
        // would be noise at best.
        disallow: ['/admin', '/api/', '/media/']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
