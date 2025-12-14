import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { generateProductMetadata } from '../../../lib/seo';
import { Product } from '../../../lib/types';
import { seoConfig } from '../../../lib/seo';

const BACKEND_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';

// ISR Configuration: Revalidate product pages every 5 minutes
// This balances freshness with performance and cost
export const revalidate = 300; // 5 minutes

// Fetch product server-side for metadata generation
// Uses React cache() to dedupe calls between generateMetadata and page component
// Uses ISR caching to minimize backend API calls
const getProduct = cache(async (slug: string): Promise<Product | null> => {
  try {
    // Use Next.js fetch with revalidation for ISR caching
    // This caches the response for 5 minutes, reducing backend API calls by ~95%
    // React cache() ensures this is only called once per request, even if called from
    // both generateMetadata and the page component
    const response = await fetch(`${BACKEND_URL}/api/catalog/products/${slug}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes (matches revalidate export)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      return null;
    }

    return data.data as Product;
  } catch (error) {
    // Log error but don't throw - allow client component to handle fallback
    console.error('Error fetching product for metadata:', error);
    return null;
  }
});

// Generate metadata for the product page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    };
  }

  // Ensure image URL is absolute for OG tags
  let ogImage = product.images?.[0] || '';
  
  // If image is relative, make it absolute
  if (ogImage && !ogImage.startsWith('http')) {
    // If it's already a full URL from ImageKit/Cloudinary, use as is
    if (ogImage.startsWith('//') || ogImage.startsWith('/')) {
      ogImage = ogImage.startsWith('//') 
        ? `https:${ogImage}` 
        : `${seoConfig.siteUrl}${ogImage}`;
    }
  }
  
  // Fallback to OG image API if no product image
  if (!ogImage) {
    ogImage = `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent(product.title)}&description=${encodeURIComponent(product.description?.substring(0, 120) || '')}&site=${encodeURIComponent(seoConfig.siteName)}`;
  }

  // Create product with absolute image URL for metadata
  const productWithAbsoluteImage: Product = {
    ...product,
    images: ogImage ? [ogImage] : product.images,
  };

  return generateProductMetadata(productWithAbsoluteImage);
}

// Main page component
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  // If product not found server-side, show 404
  // Client component has fallback to fetch client-side if needed
  if (!product) {
    notFound();
  }

  // Pass initial product data to client component to avoid double fetching
  // Client component will only fetch if initialProduct is null
  return <ProductDetailClient initialProduct={product} />;
}
