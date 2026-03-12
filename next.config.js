/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',       value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type',        value: 'application/javascript' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
    ];
  },

  async rewrites() {
    return {
      // Serve install.html and any other .html files from public/
      // directly without Next.js intercepting them
      beforeFiles: [
        {
          source: '/install.html',
          destination: '/install.html',
        },
      ],
    };
  },
};

module.exports = nextConfig;
