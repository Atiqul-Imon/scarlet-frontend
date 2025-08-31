"use client";
import * as React from 'react';
import Link from 'next/link';
import { productApi } from '../../lib/api';
import type { Product } from '../../lib/types';
import EnhancedProductCard from './EnhancedProductCard';

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
        
        let queryParams: any = { limit };
        
        // Handle special categories and filtering
        if (category === 'new' || category === 'new-arrivals') {
          queryParams.sort = 'newest';
          queryParams.isNewArrival = true;
        } else if (category === 'bestselling' || category === 'best-sellers') {
          queryParams.sort = 'popularity';
          queryParams.isBestSeller = true;
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
      <section className="py-16 bg-gray-50">
        <div className="container-herlan">
          <div className="text-center">
            <p className="text-gray-600">Unable to load products at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-herlan">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600">
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
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductShowcaseSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <EnhancedProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
