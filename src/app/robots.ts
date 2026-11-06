import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourapp.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/candidate-form', '/candidate-choices'],
        disallow: ['/admin-dashboard-secret', '/candidate-dashboard', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin-dashboard-secret', '/candidate-dashboard', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
