"use client";
import * as React from 'react';

interface SortOption {
  value: string;
  label: string;
}

interface ProductSortProps {
  sortOptions: SortOption[];
  currentSort: string;
  onSortChange: (sortValue: string) => void;
}

const defaultSortOptions: SortOption[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export default function ProductSort({
  sortOptions = defaultSortOptions,
  currentSort,
  onSortChange
}: ProductSortProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const currentSortLabel = sortOptions.find(option => option.value === currentSort)?.label || 'Featured';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full sm:w-auto gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:border-red-300 transition-colors bg-white shadow-sm"
        >
          <span className="text-sm font-semibold text-gray-900">
            <span className="hidden sm:inline">Sort by: </span>
            {currentSortLabel}
          </span>
          <ChevronIcon expanded={isOpen} />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu - Mobile optimized */}
            <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="py-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors ${
                      currentSort === option.value 
                        ? 'text-red-800 bg-red-50 font-semibold' 
                        : 'text-gray-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {currentSort === option.value && (
                        <CheckIcon />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
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

function CheckIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className="inline ml-2 text-red-700"
    >
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
