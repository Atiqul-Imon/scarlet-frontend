"use client";
import * as React from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SearchFiltersProps {
  filters: {
    brand?: string[];
    category?: string[];
    priceMin?: number | undefined;
    priceMax?: number | undefined;
    inStock?: boolean | undefined;
    rating?: number | undefined;
  };
  availableFilters?: {
    brands: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  };
  onFilterChange: (filters: any) => void;
}

export default function SearchFilters({ 
  filters, 
  availableFilters, 
  onFilterChange 
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = React.useState({
    price: true,
    brand: true,
    category: true,
    availability: true,
    rating: true
  });
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleBrandChange = (brand: string, checked: boolean) => {
    const currentBrands = filters.brand || [];
    const newBrands = checked 
      ? [...currentBrands, brand]
      : currentBrands.filter(b => b !== brand);
    
    onFilterChange({
      ...filters,
      brand: newBrands.length > 0 ? newBrands : undefined
    });
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked 
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    onFilterChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    });
  };
  
  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    onFilterChange({
      ...filters,
      [`price${type.charAt(0).toUpperCase() + type.slice(1)}`]: value
    });
  };
  
  const handleStockChange = (inStock: boolean) => {
    onFilterChange({
      ...filters,
      inStock: inStock
    });
  };
  
  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      rating: rating
    });
  };
  
  const clearFilter = (filterType: string) => {
    const newFilters = { ...filters };
    delete newFilters[filterType as keyof typeof filters];
    onFilterChange(newFilters);
  };
  
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;
  
  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters</span>
            <span className="text-xs text-gray-500">{activeFiltersCount}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.brand && filters.brand.length > 0 && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span>Brand: {filters.brand.join(', ')}</span>
                <button
                  onClick={() => clearFilter('brand')}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.category && filters.category.length > 0 && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span>Category: {filters.category.join(', ')}</span>
                <button
                  onClick={() => clearFilter('category')}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )}
            {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span>
                  Price: ৳{filters.priceMin || 0} - ৳{filters.priceMax || '∞'}
                </span>
                <button
                  onClick={() => {
                    clearFilter('priceMin');
                    clearFilter('priceMax');
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.inStock !== undefined && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span>Stock: {filters.inStock ? 'In Stock' : 'Out of Stock'}</span>
                <button
                  onClick={() => clearFilter('inStock')}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.rating !== undefined && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                <span>Rating: {filters.rating}+ stars</span>
                <button
                  onClick={() => clearFilter('rating')}
                  className="ml-1 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.priceMin || ''}
                  onChange={(e) => handlePriceChange('min', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.priceMax || ''}
                  onChange={(e) => handlePriceChange('max', parseFloat(e.target.value) || 0)}
                  placeholder="∞"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            {availableFilters?.priceRange && (
              <div className="text-xs text-gray-500">
                Range: ৳{availableFilters.priceRange.min} - ৳{availableFilters.priceRange.max}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Brand Filter */}
      {availableFilters?.brands && availableFilters.brands.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            Brand ({availableFilters.brands.length})
            {expandedSections.brand ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.brand && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.brands.map((brand, index) => (
                <label key={`brand-${brand}-${index}`} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.brand?.includes(brand) || false}
                    onChange={(e) => handleBrandChange(brand, e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Category Filter */}
      {availableFilters?.categories && availableFilters.categories.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            Category ({availableFilters.categories.length})
            {expandedSections.category ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          {expandedSections.category && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFilters.categories.map((category, index) => (
                <label key={`category-${category}-${index}`} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(category) || false}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Availability Filter */}
      <div>
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Availability
          {expandedSections.availability ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.availability && (
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === true}
                onChange={() => handleStockChange(true)}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">In Stock Only</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === false}
                onChange={() => handleStockChange(false)}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">Out of Stock</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === undefined}
                onChange={() => onFilterChange({ ...filters, inStock: undefined })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">All Products</span>
            </label>
          </div>
        )}
      </div>
      
      {/* Rating Filter */}
      <div>
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Customer Rating
          {expandedSections.rating ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
        
        {expandedSections.rating && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700">{rating}+ stars</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === undefined}
                onChange={() => onFilterChange({ ...filters, rating: undefined })}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="text-gray-700">All Ratings</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
