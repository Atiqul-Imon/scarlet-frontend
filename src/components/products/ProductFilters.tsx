"use client";
import * as React from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProductFiltersProps {
  categories?: FilterOption[];
  brands?: FilterOption[];
  priceRanges?: FilterOption[];
  selectedFilters: {
    category?: string;
    brand?: string;
    priceRange?: string;
  };
  onFilterChange: (filterType: string, value: string | null) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  categories = [],
  brands = [],
  priceRanges = [],
  selectedFilters,
  onFilterChange,
  onClearFilters
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const hasActiveFilters = Object.values(selectedFilters).some(value => value);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between w-full px-4 py-3 border border-rose-300 rounded-lg hover:border-red-300 transition-colors bg-stone-50 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <FilterIcon />
            <span className="font-semibold text-gray-900">Filters</span>
            {hasActiveFilters && (
              <span className="bg-red-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {Object.values(selectedFilters).filter(v => v).length}
              </span>
            )}
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-stone-50 rounded-t-xl shadow-xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-rose-200">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-rose-100 rounded-lg transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              <div className="space-y-6">
                {/* Categories */}
                <FilterSection
                  title="Categories"
                  options={categories}
                  selectedValue={selectedFilters.category}
                  onSelect={(value) => onFilterChange('category', value)}
                />

                {/* Brands */}
                <FilterSection
                  title="Brands"
                  options={brands}
                  selectedValue={selectedFilters.brand}
                  onSelect={(value) => onFilterChange('brand', value)}
                />

                {/* Price Range */}
                <FilterSection
                  title="Price Range"
                  options={priceRanges}
                  selectedValue={selectedFilters.priceRange}
                  onSelect={(value) => onFilterChange('priceRange', value)}
                />
              </div>
            </div>

            <div className="p-4 border-t border-rose-200 bg-rose-50">
              <div className="flex gap-3">
                <button
                  onClick={onClearFilters}
                  className="flex-1 px-4 py-2 text-gray-700 border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-stone-50 rounded-lg border border-rose-200 p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-red-700 hover:text-red-800 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          <FilterSection
            title="Categories"
            options={categories}
            selectedValue={selectedFilters.category}
            onSelect={(value) => onFilterChange('category', value)}
          />

          <FilterSection
            title="Brands"
            options={brands}
            selectedValue={selectedFilters.brand}
            onSelect={(value) => onFilterChange('brand', value)}
          />

          <FilterSection
            title="Price Range"
            options={priceRanges}
            selectedValue={selectedFilters.priceRange}
            onSelect={(value) => onFilterChange('priceRange', value)}
          />
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-stone-50 rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon />
              </button>
            </div>

            <FilterSection
              title="Categories"
              options={categories}
              selectedValue={selectedFilters.category}
              onSelect={(value) => onFilterChange('category', value)}
            />

            <FilterSection
              title="Brands"
              options={brands}
              selectedValue={selectedFilters.brand}
              onSelect={(value) => onFilterChange('brand', value)}
            />

            <FilterSection
              title="Price Range"
              options={priceRanges}
              selectedValue={selectedFilters.priceRange}
              onSelect={(value) => onFilterChange('priceRange', value)}
            />

            <div className="flex gap-3 mt-6">
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="flex-1 px-4 py-3 border border-rose-300 text-gray-700 rounded-lg font-medium hover:bg-rose-50 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-3 bg-red-700 text-white rounded-lg font-medium hover:bg-red-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({
  title,
  options,
  selectedValue,
  onSelect
}: {
  title: string;
  options: FilterOption[];
  selectedValue?: string;
  onSelect: (value: string | null) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  if (options.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <ChevronIcon expanded={isExpanded} />
      </button>
      
      {isExpanded && (
        <div className="space-y-2">
          {options.map((option, index) => (
            <label
              key={`${title}-${option.value}-${index}`}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name={title}
                value={option.value}
                checked={selectedValue === option.value}
                onChange={(e) => onSelect(e.target.checked ? option.value : null)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border-2 rounded-full mr-3 transition-colors ${
                selectedValue === option.value 
                  ? 'border-red-500 bg-red-500' 
                  : 'border-rose-300 group-hover:border-red-300'
              }`}>
                {selectedValue === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 flex-1">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}
