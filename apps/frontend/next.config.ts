import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/grafana',
        destination: `${process.env.GRAFANA_URL || 'http://grafana:3000'}/`,
      },
      {
        source: '/grafana/:path*',
        destination: `${process.env.GRAFANA_URL || 'http://grafana:3000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
