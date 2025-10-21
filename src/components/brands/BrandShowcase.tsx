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

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryApi.getCategories();
        const categoriesData = Array.isArray(response) ? response : [];
        
        // Filter only TOP-LEVEL (root/mother) categories
        // These are categories with NO parent (parentId is null, undefined, or empty string)
        const topLevelCategories = categoriesData.filter(cat => 
          cat.isActive && 
          (!cat.parentId || cat.parentId === '' || cat.parentId === null)
        );
        
        console.log('Total categories:', categoriesData.length);
        console.log('Top-level categories:', topLevelCategories.length);
        console.log('Top-level category names:', topLevelCategories.map(c => c.name));
        
        setCategories(topLevelCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
    <section className="py-16 bg-gray-50">
      <div className="container-herlan">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shop By Category
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border-2 border-gray-200 group-hover:border-red-300 transition-all duration-300">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">
                      {getCategoryIcon(category.name)}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-red-700 transition-colors duration-300">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
