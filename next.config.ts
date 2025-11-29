import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
  // Externalize packages that use jsdom to prevent build issues
  // jsdom tries to load default-stylesheet.css which doesn't exist during build
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  // Enforce request body size limits via experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For file uploads
    },
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Content Security Policy - stricter in production
    const scriptSrc = isDevelopment
      ? "'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseio.com https://accounts.google.com"
      : "'self' 'unsafe-inline' https://apis.google.com https://*.firebaseio.com https://accounts.google.com";

    const cspHeader = `
      default-src 'self';
      script-src ${scriptSrc};
      style-src 'self' 'unsafe-inline' https://accounts.google.com;
      img-src 'self' blob: data: https://*.googleapis.com https://*.googleusercontent.com https://firebasestorage.googleapis.com;
      font-src 'self' data: https://accounts.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src https://accounts.google.com https://*.firebaseapp.com;
      connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://accounts.google.com;
      upgrade-insecure-requests;
    `
      .replace(/\n/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
