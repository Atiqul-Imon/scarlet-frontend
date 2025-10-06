"use client";
import * as React from 'react';
import Link from 'next/link';
import { productApi, fetchJson } from '../../lib/api';
import type { Product } from '../../lib/types';
import EnhancedProductCard from './EnhancedProductCard';
import { SectionContainer, ResponsiveFlex, ProductGrid } from '../layout';
import { TouchCard } from '../ui';

interface ProductShowcaseProps {
  title: string;
  subtitle?: string;
  category?: string;
  viewAllLink: string;
  limit?: number;
}

export default function ProductShowcase({ 
  title, 
  subtitle, 
  category, 
  viewAllLink, 
  limit = 8 
}: ProductShowcaseProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let queryParams: {
          limit: number;
          sort?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'popularity';
          isNewArrival?: boolean;
          isBestSeller?: boolean;
          isFeatured?: boolean;
          category?: string;
          homepageSection?: string;
        } = { limit };
        
        // Handle special categories and filtering
        if (category === 'new' || category === 'new-arrivals') {
          queryParams.sort = 'newest';
          queryParams.isNewArrival = true;
        } else if (category === 'skincare-essentials') {
          // Use the new homepage section API
          const response = await fetchJson<Product[]>(`/catalog/products/homepage/skincare-essentials`);
          const productsData = Array.isArray(response) ? response : [];
          setProducts(productsData.slice(0, limit));
          return;
        } else if (category === 'makeup-collection') {
          // Use the new homepage section API
          const response = await fetchJson<Product[]>(`/catalog/products/homepage/makeup-collection`);
          const productsData = Array.isArray(response) ? response : [];
          setProducts(productsData.slice(0, limit));
          return;
        } else if (category === 'featured') {
          queryParams.isFeatured = true;
          queryParams.sort = 'featured';
        } else if (category) {
          queryParams.category = category;
        }
        
        const response = await productApi.getProducts(queryParams);
        
        // The API returns an array directly for this endpoint
        const productsData = Array.isArray(response) ? response : [];
        setProducts(productsData.slice(0, limit));
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, limit]);

  if (error) {
    return (
      <section className="bg-amber-50">
        <SectionContainer>
          <div className="text-center">
            <p className="responsive-text text-gray-600">Unable to load products at the moment.</p>
          </div>
        </SectionContainer>
      </section>
    );
  }

  return (
    <section className="bg-amber-50">
      <div className="container-herlan py-12 sm:py-16 lg:py-20">
        {/* Section Header */}
        <ResponsiveFlex
          direction={{ default: 'col', sm: 'row' }}
          align="center"
          justify="between"
          gap="md"
          className="mb-12"
        >
          <div>
            <h2 className="responsive-heading text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="responsive-text text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={viewAllLink}
            className="hidden sm:inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
          >
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </ResponsiveFlex>

        {/* Products Grid */}
        {loading ? (
          <ProductShowcaseSkeleton />
        ) : (
          <ProductGrid>
            {products.map((product) => (
              <EnhancedProductCard
                key={product._id}
                product={product}
              />
            ))}
          </ProductGrid>
        )}

        {/* Mobile View All Button */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href={viewAllLink}
            className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
          >
            View All {title}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductShowcaseSkeleton() {
  return (
    <ProductGrid>
      {Array.from({ length: 8 }).map((_, index) => (
        <TouchCard key={index} variant="default" interactive={false}>
          <div className="animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </TouchCard>
      ))}
    </ProductGrid>
  );
}
