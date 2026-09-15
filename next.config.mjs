/** @type {import('next').NextConfig} */
const nextConfig = {
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
