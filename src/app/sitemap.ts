import { MetadataRoute } from 'next';
import { generateSitemapData } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapData = await generateSitemapData();
  
  return sitemapData;
}
