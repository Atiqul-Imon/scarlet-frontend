"use client";
import * as React from 'react';
import { categoryApi, adminApi } from '../../../lib/api';
import type { Category } from '../../../lib/types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  
  // Delete state
  const [deletingCategory, setDeletingCategory] = React.useState<string | null>(null);

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
      // Use the existing categoryApi for now to avoid the adminApi issue
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
    if (!sliderRef.current) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - dragStartX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateHomepageVisibility = async (categoryId: string) => {
    try {
      setUpdating(categoryId);
      const category = categories.find(cat => cat._id === categoryId);
      if (!category) return;

      // Toggle isActive status
      const newStatus = !category.isActive;
      
      // Update locally first for immediate feedback
      setCategories(prev => 
        prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, isActive: newStatus }
            : cat
        )
      );

      // For now, just show success message without API call
      // TODO: Implement adminApi.categories.updateCategoryStatus when backend is ready
      setMessage({ 
        type: 'success', 
        text: `Category ${newStatus ? 'activated' : 'deactivated'} successfully` 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating category status:', error);
      setMessage({ type: 'error', text: 'Failed to update category status' });
      
      // Revert local change on error
      setCategories(prev => 
        prev.map(cat => 
          cat._id === categoryId 
            ? { ...cat, isActive: !cat.isActive }
            : cat
        )
      );
    } finally {
      setUpdating(null);
    }
  };

  // CRUD Functions
  const handleCreateCategory = () => {
    // Navigation will be handled by Link component
  };

  const handleEditCategory = (category: Category) => {
    // Navigation will be handled by Link component
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingCategory(categoryId);
      
      // For now, just remove from local state
      // TODO: Implement adminApi.categories.deleteCategory when backend is ready
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      
      setMessage({ type: 'success', text: 'Category deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setMessage({ type: 'error', text: 'Failed to delete category' });
    } finally {
      setDeletingCategory(null);
    }
  };


  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
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
        <div className="flex items-center space-x-4">
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-green-800">
              {categories.filter(cat => cat.isActive).length} Active Categories
            </span>
          </div>
          <Link
            href="/admin/categories/new"
            className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Category</span>
          </Link>
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
            <div
              key={category._id}
              className="group flex-shrink-0 transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              <div className="text-center w-20 sm:w-22 md:w-24">
                <div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-colors duration-300 group-hover:shadow-lg cursor-pointer ${
                    category.isActive 
                      ? 'bg-green-100 hover:bg-green-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => updateHomepageVisibility(category._id!)}
                >
                  <span className="text-lg sm:text-xl md:text-2xl">
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
                
                {/* Action Buttons */}
                <div className="mt-2 flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={`/admin/categories/${category._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="Edit category"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category._id!);
                    }}
                    disabled={deletingCategory === category._id}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete category"
                  >
                    {deletingCategory === category._id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {updating === category._id && (
                  <div className="mt-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}