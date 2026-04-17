import type { NextConfig } from "next";

const nextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.100.34:3000'],
    },
  },
  webpackDevMiddleware: (config: any) => {
    return config;
  },
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;