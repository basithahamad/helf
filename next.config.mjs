/** @type {import('next').NextConfig} */
const nextConfig = {
  // mysql2 loads parts of itself dynamically; keep it out of the server bundle.
  serverExternalPackages: ['mysql2'],

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
