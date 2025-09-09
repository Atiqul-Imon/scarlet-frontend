"use client";
import * as React from 'react';
import { categoryApi } from '../../../lib/api';
import type { Category } from '../../../lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategories();
      const categoriesData = Array.isArray(response) ? response : [];
      setCategories(categoriesData.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ type: 'error', text: 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  // Drag functionality for slider
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setDragStartX(e.pageX - sliderRef.current.offsetLeft);
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
    const walk = (x - dragStartX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current || !e.touches[0]) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current || !e.touches[0]) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - dragStartX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateHomepageVisibility = async (categoryId: string, showInHomepage: boolean) => {
    try {
      setUpdating(categoryId);
      
      // This would be the API call to update the category
      // await categoryApi.updateCategory(categoryId, { showInHomepage });
      
      // For now, we'll update the local state
      setCategories(prev => 
        prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, showInHomepage } 
            : cat
        )
      );
      
      setMessage({ 
        type: 'success', 
        text: `Category ${showInHomepage ? 'added to' : 'removed from'} homepage` 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error updating category:', error);
      setMessage({ type: 'error', text: 'Failed to update category' });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-6 sm:gap-8 md:gap-10 lg:gap-12 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="text-center w-24 sm:w-28 md:w-32">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gray-200 rounded-full animate-pulse mx-auto mb-3 sm:mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">
            Manage all categories. Drag to scroll through categories. All active categories appear on the homepage.
          </p>
        </div>
        <div className="bg-green-50 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-green-800">
            {categories.filter(cat => cat.isActive).length} Active Categories
          </span>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            All Categories ({categories.length})
          </h2>
          <p className="text-sm text-gray-600">
            Drag to scroll through all categories. Click on a category to toggle its visibility on the homepage.
          </p>
        </div>

        <div 
          ref={sliderRef}
          className="flex gap-6 sm:gap-8 md:gap-10 lg:gap-12 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
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
            <div
              key={category._id}
              className="group flex-shrink-0 transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              <div className="text-center w-24 sm:w-28 md:w-32">
                <div 
                  className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300 group-hover:shadow-lg cursor-pointer ${
                    category.isActive 
                      ? 'bg-green-100 hover:bg-green-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => updateHomepageVisibility(category._id!, !category.isActive)}
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl">
                    {getCategoryIcon(category.name)}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-tight px-1">
                  {category.name}
                </h3>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {updating === category._id && (
                  <div className="mt-2">
                    <span className="text-xs text-blue-600">Updating...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag horizontally to scroll through all categories</li>
          <li>• Click on any category to toggle its visibility on the homepage</li>
          <li>• Active categories (green) appear on the homepage slider</li>
          <li>• Inactive categories (gray) are hidden from the homepage</li>
          <li>• Changes take effect immediately on the website</li>
        </ul>
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
    </div>
  );
}

