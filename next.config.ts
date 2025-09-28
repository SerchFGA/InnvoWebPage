import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  publicRuntimeConfig: {
    N8N_AVAILABLE_TIMES_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_AVAILABLE_TIMES_WEBHOOK_URL,
    N8N_SCHEDULE_APPOINTMENT_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_SCHEDULE_APPOINTMENT_WEBHOOK_URL,
  },
};

export default nextConfig;
