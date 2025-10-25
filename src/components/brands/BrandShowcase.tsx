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

  // Check for cached categories first
  React.useEffect(() => {
    const cachedCategories = sessionStorage.getItem('cachedCategories');
    if (cachedCategories) {
      try {
        const parsedCategories = JSON.parse(cachedCategories);
        setCategories(parsedCategories);
        setLoading(false);
        // Fetch fresh data in background
        fetchCategoriesInBackground();
        return;
      } catch (error) {
        // Invalid cached data, continue with normal fetch
        sessionStorage.removeItem('cachedCategories');
      }
    }
    
    fetchCategories();
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
      
      // Update cache and state
      sessionStorage.setItem('cachedCategories', JSON.stringify(limitedCategories));
      setCategories(limitedCategories);
    } catch (error) {
      console.error('Background category fetch failed:', error);
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
      
      // Cache the results
      sessionStorage.setItem('cachedCategories', JSON.stringify(limitedCategories));
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
      <section className="py-16 bg-gray-50">
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
      <section className="py-16 bg-gray-50">
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
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
              <div className="bg-gradient-to-br from-red-100 via-pink-50 to-red-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out border border-red-200 hover:border-red-400 hover:from-red-200 hover:via-pink-100 hover:to-red-100">
                {/* Content Container */}
                <div className="p-4 sm:p-6 flex flex-col items-center justify-center h-[180px] sm:h-[200px] md:h-[220px]">
                  {/* Image/Icon Container - Rounded */}
                  <div className="mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg overflow-hidden border-2 border-red-100 hover:border-red-300 hover:scale-105 transition-all duration-300 ease-out group-hover:rotate-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : category.icon ? (
                        <span className="text-3xl sm:text-4xl md:text-5xl group-hover:animate-pulse">
                          {category.icon}
                        </span>
                      ) : (
                        <span className="text-3xl sm:text-4xl md:text-5xl group-hover:animate-pulse">
                          {getCategoryIcon(category.name)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <h3 className="font-semibold text-gray-900 group-hover:text-red-700 text-base sm:text-lg md:text-xl text-center leading-tight px-2 transition-colors duration-300 ease-out">
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
