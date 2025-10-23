"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductImage from '../ui/ProductImage';
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { searchApi } from '../../lib/api';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchSuggestion {
  products: Array<{
    _id: string;
    title: string;
    slug: string;
    brand: string;
    price: { amount: number; currency: string };
    images: string[];
    rating?: { average: number; count: number };
  }>;
  brands: string[];
  categories: string[];
}

export default function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Focus input when overlay opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Fetch suggestions with debouncing
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions(null);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  const fetchSuggestions = async (searchQuery: string) => {
    try {
      setLoading(true);
      const result = await searchApi.suggestions(searchQuery);
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Load popular searches when component mounts
  
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    const totalItems = getTotalSuggestionItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const item = getSuggestionItem(selectedIndex);
          if (item && item.query) {
            handleSearch(item.query);
          }
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };
  
  const getTotalSuggestionItems = () => {
    let count = 0;
    if (suggestions) {
      count += suggestions.products.length;
      count += suggestions.brands.length;
      count += suggestions.categories.length;
    }
    return count;
  };
  
  const getSuggestionItem = (index: number) => {
    let currentIndex = 0;
    
    // Product suggestions
    if (suggestions?.products) {
      for (const product of suggestions.products) {
        if (index === currentIndex) return { type: 'product', query: product.title, text: product.title, product };
        currentIndex++;
      }
    }
    
    // Brand suggestions
    if (suggestions?.brands) {
      for (const brand of suggestions.brands) {
        if (index === currentIndex) return { type: 'brand', query: brand, text: brand };
        currentIndex++;
      }
    }
    
    // Category suggestions
    if (suggestions?.categories) {
      for (const category of suggestions.categories) {
        if (index === currentIndex) return { type: 'category', query: category, text: category };
        currentIndex++;
      }
    }
    
    return null;
  };
  
  const formatPrice = (price: any) => {
    if (!price) return '৳0';
    return `৳${price.amount?.toLocaleString('en-US') || 0}`;
  };
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-base min-h-[48px]"
          />
        </div>
        <button
          onClick={onClose}
          className="ml-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Searching...</p>
          </div>
        )}
        
        {!loading && (
          <div className="p-4 space-y-6">
            
            
            {/* Search Suggestions */}
            {query && suggestions && (
              <div className="space-y-4">
                {/* Product Suggestions */}
                {suggestions.products && suggestions.products.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Products</h3>
                    <div className="space-y-3">
                      {suggestions.products.slice(0, 4).map((product) => (
                        <Link
                          key={product._id}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            onClose();
                          }}
                          className="block p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <ProductImage
                              src={product.images?.[0] || ''}
                              alt={product.title}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {product.title}
                              </h4>
                              <p className="text-sm text-gray-500">{product.brand}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                {product.rating && (
                                  <div className="flex items-center space-x-1">
                                    <div className="flex">
                                      {renderStars(product.rating.average)}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      ({product.rating.count})
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Brand Suggestions */}
                {suggestions.brands && suggestions.brands.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Brands</h3>
                    <div className="space-y-2">
                      {suggestions.brands.slice(0, 5).map((brand, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(brand)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <TagIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{brand}</span>
                          </div>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Category Suggestions */}
                {suggestions.categories && suggestions.categories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-2">
                      {suggestions.categories.slice(0, 5).map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(category)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <TagIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{category}</span>
                          </div>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* View All Results */}
                {query.trim() && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full flex items-center justify-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      <span>View all results for "{query}"</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* No Results */}
            {query.length >= 2 && !suggestions && !loading && (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">Try a different search term</p>
                <button
                  onClick={() => handleSearch(query)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Search anyway
                </button>
              </div>
            )}
            
            {/* Empty State */}
            {!query && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
                <p className="text-gray-500">Type to find products, brands, and categories</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
