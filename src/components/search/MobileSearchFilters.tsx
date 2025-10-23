"use client";
import * as React from 'react';
import { XMarkIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Category } from '../../lib/types';
import { categoryApi } from '../../lib/api';

interface MobileSearchFiltersProps {
  filters: {
    brand?: string[];
    category?: string[];
    priceMin?: number | undefined;
    priceMax?: number | undefined;
    inStock?: boolean | undefined;
    rating?: number | undefined;
  };
  availableFilters: {
    brands: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  } | null;
  onFilterChange: (newFilters: MobileSearchFiltersProps['filters']) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export default function MobileSearchFilters({
  filters,
  availableFilters,
  onFilterChange,
  onClearFilters,
  onClose,
}: MobileSearchFiltersProps) {
  const [allCategories, setAllCategories] = React.useState<Category[]>([]);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['brand', 'category', 'price']));

  React.useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const fetchedCategories = await categoryApi.getCategories();
        setAllCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching all categories for filters:', error);
      }
    };
    fetchAllCategories();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleBrandChange = (brand: string, isChecked: boolean) => {
    const newBrands = isChecked
      ? [...(filters.brand || []), brand]
      : (filters.brand || []).filter(b => b !== brand);
    onFilterChange({ ...filters, brand: newBrands });
  };

  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    const newCategories = isChecked
      ? [...(filters.category || []), categoryId]
      : (filters.category || []).filter(c => c !== categoryId);
    onFilterChange({ ...filters, category: newCategories });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value);
    if (type === 'min') {
      onFilterChange({ ...filters, priceMin: isNaN(numValue) ? undefined : numValue });
    } else {
      onFilterChange({ ...filters, priceMax: isNaN(numValue) ? undefined : numValue });
    }
  };

  const handleInStockChange = (isChecked: boolean) => {
    onFilterChange({ ...filters, inStock: isChecked ? true : undefined });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, rating: filters.rating === rating ? undefined : rating });
  };

  const getCategoryName = (id: string) => {
    const category = allCategories.find(cat => cat._id === id);
    return category ? category.name : 'Unknown Category';
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    (Array.isArray(value) && value.length > 0) ||
    (typeof value === 'boolean' && value === true) ||
    (typeof value === 'number' && value !== undefined)
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-4 space-y-6 w-full">
          {/* Clear All Filters */}
          {hasActiveFilters && (
            <div className="pb-4 border-b border-gray-200">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Brand Filter */}
          <div className="border-b border-gray-200 pb-4">
            <button 
              onClick={() => toggleSection('brand')} 
              className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 mb-3"
            >
              Brands
              {expandedSections.has('brand') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.has('brand') && (
              <div className="space-y-3">
                {availableFilters?.brands.map((brand, index) => (
                  <div key={`mobile-brand-${brand}-${index}`} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`mobile-brand-${brand}`}
                      checked={filters.brand?.includes(brand) || false}
                      onChange={(e) => handleBrandChange(brand, e.target.checked)}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`mobile-brand-${brand}`} className="ml-3 text-gray-700">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="border-b border-gray-200 pb-4">
            <button 
              onClick={() => toggleSection('category')} 
              className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 mb-3"
            >
              Categories
              {expandedSections.has('category') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.has('category') && (
              <div className="space-y-3">
                {availableFilters?.categories.map((categoryId, index) => (
                  <div key={`mobile-category-${categoryId}-${index}`} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`mobile-category-${categoryId}`}
                      checked={filters.category?.includes(categoryId) || false}
                      onChange={(e) => handleCategoryChange(categoryId, e.target.checked)}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`mobile-category-${categoryId}`} className="ml-3 text-gray-700">
                      {getCategoryName(categoryId)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="border-b border-gray-200 pb-4">
            <button 
              onClick={() => toggleSection('price')} 
              className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 mb-3"
            >
              Price Range
              {expandedSections.has('price') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.has('price') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder={`${availableFilters?.priceRange.min || 0}`}
                      value={filters.priceMin || ''}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder={`${availableFilters?.priceRange.max || 10000}`}
                      value={filters.priceMax || ''}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* In Stock Filter */}
          <div className="border-b border-gray-200 pb-4">
            <button 
              onClick={() => toggleSection('stock')} 
              className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 mb-3"
            >
              Availability
              {expandedSections.has('stock') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.has('stock') && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mobile-in-stock"
                  checked={filters.inStock || false}
                  onChange={(e) => handleInStockChange(e.target.checked)}
                  className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="mobile-in-stock" className="ml-3 text-gray-700">
                  In Stock Only
                </label>
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div className="pb-4">
            <button 
              onClick={() => toggleSection('rating')} 
              className="flex justify-between items-center w-full text-lg font-semibold text-gray-800 mb-3"
            >
              Customer Rating
              {expandedSections.has('rating') ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            {expandedSections.has('rating') && (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center">
                    <input
                      type="radio"
                      id={`mobile-rating-${star}`}
                      name="mobile-rating"
                      checked={filters.rating === star}
                      onChange={() => handleRatingChange(star)}
                      className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor={`mobile-rating-${star}`} className="ml-3 text-gray-700">
                      {star} Stars & Up
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-base"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
