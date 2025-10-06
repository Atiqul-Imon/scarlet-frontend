"use client";
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { categoryApi } from '../../lib/api';
import type { Category } from '../../lib/types';

export default function CategorySection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await categoryApi.getCategories();
        const categoriesData = Array.isArray(response) ? response : [];
        
        // Filter only active categories
        const activeCategories = categoriesData.filter(cat => cat.isActive);
        
        setCategories(activeCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        
        // Fallback categories
        const fallbackCategories: Category[] = [
          {
            _id: 'hair-care',
            name: 'Hair Care',
            slug: 'hair-care',
            description: 'Professional hair care',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'serum',
            name: 'Serum',
            slug: 'serum',
            description: 'Powerful serums for skin',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'essences',
            name: 'Essences',
            slug: 'essences',
            description: 'Hydrating essences',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'cleansers',
            name: 'Cleansers',
            slug: 'cleansers',
            description: 'Gentle face cleansers',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'toner',
            name: 'Toner',
            slug: 'toner',
            description: 'Refreshing toners',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'moisturizers',
            name: 'Moisturizers',
            slug: 'moisturizers',
            description: 'Hydrating moisturizers',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'exfoliators',
            name: 'Exfoliators',
            slug: 'exfoliators',
            description: 'Gentle exfoliating products',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'sun-protection',
            name: 'Sun Protection',
            slug: 'sun-protection',
            description: 'UV protection products',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current || !e.touches[0]) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current || !e.touches[0]) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-amber-50">
      <div className="container-herlan">
        {loading ? (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="text-center w-20 sm:w-22 md:w-24">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-2 sm:mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div 
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group block transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex-shrink-0"
              >
                <div className="text-center w-20 sm:w-22 md:w-24">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-colors duration-300 group-hover:shadow-lg">
                    <span className="text-lg sm:text-xl md:text-2xl">{getCategoryIcon(category.name)}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-tight px-1">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
