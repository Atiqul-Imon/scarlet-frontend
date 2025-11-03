"use client";
import React, { useState, useEffect } from 'react';
import TopStrip from './TopStrip';
import TopBar from './TopBar';
import { MegaMenu } from './MegaMenu';
import MobileHeader from './mobile/MobileHeader';
import MobileNavigation from './mobile/MobileNavigation';
import type { MegaItem } from './MegaMenu';
import { categoryApi } from '../../lib/api';
import type { Category, CategoryTree } from '../../lib/types';

// Transform API categories to MegaMenu format - Only parent and child categories (no grandchildren)
const transformCategoriesToMegaItems = (categories: Category[]): MegaItem[] => {
  // Filter only active categories
  const activeCategories = categories.filter(category => category.isActive !== false);
  
  // Get top-level categories (parentId is null or undefined)
  const topLevelCategories = activeCategories
    .filter(cat => !cat.parentId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  
  // Get child categories (parentId matches a top-level category ID)
  const topLevelIds = new Set(topLevelCategories.map(cat => cat._id).filter(Boolean));
  const childCategories = activeCategories
    .filter(cat => cat.parentId && topLevelIds.has(cat.parentId))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  
  // Combine parent and child categories only (exclude grandchildren)
  const parentAndChildCategories = [...topLevelCategories, ...childCategories];
  
  return parentAndChildCategories.map((category, index) => ({
    label: category.name,
    href: `/products?category=${category.slug}`,
    icon: category.icon || undefined,
    id: category._id || `category-${index}`, // Add unique ID for React keys
  }));
};

// Build category tree - only top-level categories (parentId is null)
const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
  // Filter only active categories
  const activeCategories = categories.filter(cat => cat.isActive !== false);
  
  // Get top-level categories (parentId is null or undefined)
  const topLevelCategories = activeCategories
    .filter(cat => !cat.parentId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map(cat => ({ ...cat } as CategoryTree));
  
  // Build children recursively
  const buildChildren = (parentId: string | null): CategoryTree[] => {
    return activeCategories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(cat => ({
        ...cat,
        children: buildChildren(cat._id || '') // Recursively build grandchildren
      } as CategoryTree));
  };
  
  // Attach children to top-level categories
  return topLevelCategories.map(cat => ({
    ...cat,
    children: buildChildren(cat._id || null)
  }));
};

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState<MegaItem[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
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
      const tree = buildCategoryTree(categories);
      
      // Update cache and state
      sessionStorage.setItem('cachedHeaderCategories', JSON.stringify(transformedCategories));
      setCategoryItems(transformedCategories);
      setCategoryTree(tree);
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
      const tree = buildCategoryTree(categories);
      
      // Cache the results
      sessionStorage.setItem('cachedHeaderCategories', JSON.stringify(transformedCategories));
      setCategoryItems(transformedCategories);
      setCategoryTree(tree);
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

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader 
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
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
            <div className="w-full max-w-full overflow-hidden">
              <div className="container-herlan">
                <div className="flex items-center justify-between">
                  {/* Categories Menu */}
                  <div className="flex-1 min-w-0">
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
        categoryTree={categoryTree}
      />
    </>
  );
}
