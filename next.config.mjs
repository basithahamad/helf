/** @type {import('next').NextConfig} */
const nextConfig = {
  // mysql2 loads parts of itself dynamically; keep it out of the server bundle.
  serverExternalPackages: ['mysql2'],

  // The flagship story used to be a standalone HTML file; it now lives in the
  // database. Anything linking to the old address still lands on it.
  async redirects() {
    return [
      {
        source: '/article-lightning-in-a-bottle.html',
        destination: '/article/lightning-in-a-bottle',
        permanent: true
      }
    ];
  },

  async headers() {
    return [
      {
        // Keep the editor out of search results.
        source: '/admin',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' }
        ]
      }
    ];
  }
};

export default nextConfig;
