import { MetadataRoute } from 'next';
import { Product } from '@/lib/types';

// ISR Configuration: Revalidate sitemap every 6 hours
// This ensures product pages are included while minimizing API calls
export const revalidate = 21600; // 6 hours

const BACKEND_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';

// Fetch all products for sitemap
async function getAllProducts(): Promise<Product[]> {
  try {
    const allProducts: Product[] = [];
    let page = 1;
    const limit = 100; // Fetch 100 products per page
    let hasMore = true;

    while (hasMore) {
      // Use Next.js fetch with revalidation for ISR caching
      const response = await fetch(
        `${BACKEND_URL}/api/catalog/products?page=${page}&limit=${limit}`,
        {
          next: { revalidate: 21600 }, // Cache for 6 hours
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // If API fails, return empty array (will fallback to static pages only)
        console.error(`Failed to fetch products for sitemap: ${response.status}`);
        break;
      }

      const data = await response.json();
      
      // Handle different response structures
      let products: Product[] = [];
      if (data.success && data.data) {
        products = Array.isArray(data.data) ? data.data : [];
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data.products && Array.isArray(data.products)) {
        products = data.products;
      }

      // Filter only active products with slugs
      const validProducts = products.filter(
        (product: Product) => product.slug && product.isActive !== false
      );

      allProducts.push(...validProducts);

      // Check if there are more pages
      if (products.length < limit) {
        hasMore = false;
      } else {
        page++;
        // Safety limit: don't fetch more than 50 pages (5000 products)
        if (page > 50) {
          hasMore = false;
        }
      }
    }

    return allProducts;
  } catch (error) {
    // Log error but don't throw - allow sitemap to work with static pages only
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.scarletunlimited.net';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/products', priority: 0.9, changefreq: 'daily' },
    { url: '/skincare', priority: 0.8, changefreq: 'weekly' },
    { url: '/makeup', priority: 0.8, changefreq: 'weekly' },
    { url: '/bath-body', priority: 0.8, changefreq: 'weekly' },
    { url: '/blog', priority: 0.7, changefreq: 'daily' },
    { url: '/about', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/help', priority: 0.5, changefreq: 'monthly' },
    { url: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { url: '/terms', priority: 0.3, changefreq: 'yearly' },
  ];

  // Fetch dynamic product pages
  const products = await getAllProducts();

  // Build sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = [
    // Static pages
    ...staticPages.map(page => ({
      url: `${baseUrl}${page.url}`,
      lastModified: currentDate,
      changeFrequency: page.changefreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
      priority: page.priority,
    })),
    // Dynamic product pages
    ...products.map(product => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || product.createdAt || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8, // High priority for product pages
    })),
  ];

  return sitemapEntries;
}
