import { SITE_URL } from './layout';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The editor and the API are not content. Uploaded images are: they
        // are the photos on the stories and the preview image when a story is
        // shared, so blocking them would stop previews rendering.
        disallow: ['/admin', '/api/']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
