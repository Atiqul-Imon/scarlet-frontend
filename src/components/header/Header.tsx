"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopStrip from './TopStrip';
import TopBar from './TopBar';
import { MegaMenu } from './MegaMenu';
import MobileHeader from './mobile/MobileHeader';
import MobileNavigation from './mobile/MobileNavigation';
import type { MegaItem } from './MegaMenu';
import { categoryApi } from '../../lib/api';
import type { Category } from '../../lib/types';

// Transform API categories to MegaMenu format
const transformCategoriesToMegaItems = (categories: Category[]): MegaItem[] => {
  return categories
    .filter(category => category.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((category, index) => ({
      label: category.name,
      href: `/products?category=${category.slug}`,
      icon: category.icon || undefined,
      id: category._id || `category-${index}`, // Add unique ID for React keys
    }));
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<MegaItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Check for cached categories first
  useEffect(() => {
    const cachedCategories = sessionStorage.getItem('cachedHeaderCategories');
    if (cachedCategories) {
      try {
        const parsedCategories = JSON.parse(cachedCategories);
        setCategoryItems(parsedCategories);
        setIsLoadingCategories(false);
        // Fetch fresh data in background
        fetchCategoriesInBackground();
        return;
      } catch (error) {
        // Invalid cached data, continue with normal fetch
        sessionStorage.removeItem('cachedHeaderCategories');
      }
    }
    
    fetchCategories();
  }, []);

  const fetchCategoriesInBackground = async () => {
    try {
      const categories = await categoryApi.getCategories();
      const transformedCategories = transformCategoriesToMegaItems(categories);
      
      // Update cache and state
      sessionStorage.setItem('cachedHeaderCategories', JSON.stringify(transformedCategories));
      setCategoryItems(transformedCategories);
    } catch (error) {
      console.error('Background category fetch failed:', error);
    }
  };

  // Fetch categories from API with retry logic
  const fetchCategories = async (retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      
      console.log(`🔄 Fetching categories from API... (attempt ${retryCount + 1})`);
      const categories = await categoryApi.getCategories();
      console.log('✅ Categories fetched successfully:', categories);
      
      const transformedCategories = transformCategoriesToMegaItems(categories);
      
      // Cache the results
      sessionStorage.setItem('cachedHeaderCategories', JSON.stringify(transformedCategories));
      setCategoryItems(transformedCategories);
    } catch (error) {
      console.error(`❌ Failed to fetch categories (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && error instanceof Error && error.message.includes('Network error')) {
        console.log(`🔄 Retrying in 1 second... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => fetchCategories(retryCount + 1), 1000);
        return;
      }
      
      setCategoriesError('Failed to load categories');
      
      // Fallback to mock categories for development
      const mockCategories = [
        { label: 'Skincare', href: '/products?category=skincare', icon: '🧴' },
        { label: 'Makeup', href: '/products?category=makeup', icon: '💄' },
        { label: 'Hair Care', href: '/products?category=hair', icon: '💇‍♀️' },
        { label: 'Body Care', href: '/products?category=body-care', icon: '🧴' },
      ];
      
      console.log('🔄 Using mock categories as fallback:', mockCategories);
      setCategoryItems(mockCategories);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleMobileMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader onMenuOpen={handleMobileMenuOpen} />
      
      {/* Desktop Header */}
      <div className="hidden lg:block sticky top-0 z-[9999] bg-white border-b border-gray-200 w-full">
        {/* Top Strip */}
        <TopStrip />
        
        {/* Top Bar */}
        <div className="w-full">
          <TopBar />
        </div>
        
        {/* Header with Navigation */}
        <header className="bg-white border-b border-gray-200">
          {/* Navigation Menu */}
          <div className="bg-white border-t border-gray-100">
            <div className="container-herlan">
              <div className="flex items-center justify-between">
                {/* Categories Menu */}
                <div className="flex-1">
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2 text-gray-600">Loading categories...</span>
                    </div>
                  ) : categoriesError ? (
                    <div className="flex items-center justify-center py-4">
                      <span className="text-red-600">Failed to load categories</span>
                    </div>
                  ) : (
                    <MegaMenu items={categoryItems} />
                  )}
                </div>
                
                {/* Blog Link */}
                <div className="ml-6">
                  <Link
                    href="/blog"
                    className="text-sm font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        categories={categoryItems}
      />
    </>
  );
}
