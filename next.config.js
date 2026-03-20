/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow Shopify admin to embed the app in an iframe
  async headers() {
    return [
      {
        // Admin pages must be embeddable in Shopify admin iframe
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors https://*.shopify.com https://admin.shopify.com 'self';",
          },
        ],
      },
    ];
  },

  // Transpile Polaris ESM
  transpilePackages: ['@shopify/polaris'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.shopify.com' },
      { protocol: 'https', hostname: '*.shopifycdn.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
};

module.exports = nextConfig;
