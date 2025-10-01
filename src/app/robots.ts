import { MetadataRoute } from 'next';
import { seoConfig } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/checkout/',
          '/cart/',
          '/account/',
          '/wishlist/',
          '/payment/',
          '/order-success/',
          '/offline/',
          '/debug/',
          '/test/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/checkout/',
          '/cart/',
          '/account/',
          '/wishlist/',
          '/payment/',
          '/order-success/',
          '/offline/',
          '/debug/',
          '/test/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/checkout/',
          '/cart/',
          '/account/',
          '/wishlist/',
          '/payment/',
          '/order-success/',
          '/offline/',
          '/debug/',
          '/test/',
        ],
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
    host: seoConfig.siteUrl,
  };
}
