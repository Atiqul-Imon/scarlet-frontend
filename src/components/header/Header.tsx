"use client";
import React, { useState, useEffect } from 'react';
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
    .map(category => ({
      label: category.name,
      href: `/products?category=${category.slug}`,
      icon: category.icon,
    }));
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<MegaItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoriesError(null);
        
        const categories = await categoryApi.getCategories();
        const transformedCategories = transformCategoriesToMegaItems(categories);
        setCategoryItems(transformedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategoriesError('Failed to load categories');
        // Fallback to empty array or show error state
        setCategoryItems([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
        {/* Top Bar */}
        <div className="w-full">
          <TopBar />
        </div>
        
        {/* Header with Navigation */}
        <header className="bg-white border-b border-gray-200">
          {/* Navigation Menu */}
          <div className="bg-white border-t border-gray-100">
            <div className="container-herlan">
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
