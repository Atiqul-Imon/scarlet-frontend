"use client";
import * as React from 'react';
import Link from 'next/link';
import { categoryApi } from '../../lib/api';
import type { Category } from '../../lib/types';

export default function BrandShowcase() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const categoryIcons: Record<string, string> = {
    'hair care': '💇‍♀️',
    'hair-care': '💇‍♀️',
    'serum': '🧪',
    'serums': '🧪',
    'essences': '💧',
    'cleansers': '🧼',
    'toner': '🌊',
    'moisturizers': '💧',
    'exfoliators': '✨',
    'sun protection': '☀️',
    'sun-protection': '☀️',
    'makeup': '💄',
    'make up': '💄',
    'skincare': '🌿',
    'skin care': '🌿',
    'body care': '🧴',
    'bath & body care': '🛁',
    'bath body': '🛁',
    'accessories': '✨',
    'fragrance': '🌸',
    'tools': '🔧',
    'foundation': '🎨',
    'lipstick': '💋',
    'eye makeup': '👁️',
    'shampoo': '🧴',
    'sunscreen': '☀️'
  };

  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName.toLowerCase()] || '🌟';
  };

  // Optimized: Use homepage-specific cache key + show loading first to prevent flash
  React.useEffect(() => {
    // Always show loading state first to prevent flash of cached data
    setLoading(true);
    
    // Check for homepage-specific cache (prevents cross-contamination with category page)
    const cachedHomepageCategories = sessionStorage.getItem('cachedHomepageCategories');
    
    if (cachedHomepageCategories) {
      try {
        const parsedCategories = JSON.parse(cachedHomepageCategories);
        // Use cached data after brief delay to prevent flash, but still use cache for optimization
        // This ensures loading state is shown first, then cached data appears smoothly
        const showCachedData = () => {
          setCategories(parsedCategories);
          setLoading(false);
        };
        
        // Small delay to ensure loading state is visible first (prevents flash)
        // But still fast enough for good UX
        const timeoutId = setTimeout(showCachedData, 50);
        
        // Fetch fresh data in background (doesn't block UI)
        fetchCategoriesInBackground();
        
        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutId);
      } catch (error) {
        // Invalid cached data, remove it and fetch fresh
        sessionStorage.removeItem('cachedHomepageCategories');
        fetchCategories();
        return undefined;
      }
    } else {
      // No cache available, fetch fresh data
      fetchCategories();
      return undefined;
    }
  }, []);

  const fetchCategoriesInBackground = async () => {
    try {
      const response = await categoryApi.getCategories();
      const categoriesData = Array.isArray(response) ? response : [];
      
      // Filter only TOP-LEVEL (root/mother) categories
      const topLevelCategories = categoriesData.filter(cat => 
        cat.isActive && 
        (!cat.parentId || cat.parentId === '' || cat.parentId === null)
      );
      
      // Limit to maximum 8 categories for homepage display
      const limitedCategories = topLevelCategories.slice(0, 8);
      
      // Update homepage-specific cache and state
      sessionStorage.setItem('cachedHomepageCategories', JSON.stringify(limitedCategories));
      setCategories(limitedCategories);
      setLoading(false);
    } catch (error) {
      console.error('Background category fetch failed:', error);
      // Don't update state on error - keep cached data if available
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getCategories();
      const categoriesData = Array.isArray(response) ? response : [];
      
      // Filter only TOP-LEVEL (root/mother) categories
      // These are categories with NO parent (parentId is null, undefined, or empty string)
      const topLevelCategories = categoriesData.filter(cat => 
        cat.isActive && 
        (!cat.parentId || cat.parentId === '' || cat.parentId === null)
      );
      
      // Limit to maximum 8 categories for homepage display
      const limitedCategories = topLevelCategories.slice(0, 8);
      
      console.log('Total categories:', categoriesData.length);
      console.log('Top-level categories:', topLevelCategories.length);
      console.log('Showing categories:', limitedCategories.length);
      console.log('Category names:', limitedCategories.map(c => c.name));
      
      // Cache the results with homepage-specific key
      sessionStorage.setItem('cachedHomepageCategories', JSON.stringify(limitedCategories));
      setCategories(limitedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-rose-50 to-rose-100">
        <div className="container-herlan">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Shop By Category
            </h2>
            <p className="text-gray-600">
              Explore our wide range of beauty categories
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-rose-50 to-rose-100">
        <div className="container-herlan">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Shop By Category
            </h2>
            <p className="text-gray-600">
              Explore our wide range of beauty categories
            </p>
          </div>
          <div className="text-center text-gray-500">
            <p>No categories available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="container-herlan">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            Shop By Category
          </h2>
        </div>
        
        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group block"
              prefetch={true}
            >
              <div className="bg-stone-50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 ease-out border border-rose-200 hover:border-red-300">
                {/* Image Container - Full Width */}
                <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                  ) : category.icon ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl sm:text-7xl md:text-8xl group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl sm:text-7xl md:text-8xl group-hover:scale-110 transition-transform duration-300">
                        {getCategoryIcon(category.name)}
                      </span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                
                {/* Category Name - Below Image */}
                <div className="p-4 sm:p-5 text-center">
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700 text-sm sm:text-base md:text-lg leading-tight transition-colors duration-300">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
