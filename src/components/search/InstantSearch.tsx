"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductImage from '../ui/ProductImage';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { fetchJson } from '../../lib/api';

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

interface InstantSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function InstantSearch({ 
  placeholder = "Search products...", 
  className = "",
  onSearch 
}: InstantSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  
  
  
  const fetchSuggestions = React.useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions(null);
      return;
    }
    
    try {
      setLoading(true);
      const result = await fetchJson(`/catalog/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions(result);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions(null);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query, fetchSuggestions]);
  
  
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setShowSuggestions(false);
    setQuery('');
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
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
          if (item) {
            handleSearch(item.query);
          }
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
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
  
  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
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
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions(null);
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
            </div>
          )}
          
          
          
          {/* Product Suggestions */}
          {!loading && suggestions?.products && suggestions.products.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Products
              </div>
              {suggestions.products.slice(0, 4).map((product, index) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  onClick={() => {
                    setShowSuggestions(false);
                  }}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <ProductImage
                      src={product.images?.[0]}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {product.title}
                      </div>
                      <div className="text-xs text-gray-500">{product.brand}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.rating && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-yellow-400">★</span>
                            <span className="text-xs text-gray-500">
                              {product.rating.average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Brand Suggestions */}
          {!loading && suggestions?.brands && suggestions.brands.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Brands
              </div>
              {suggestions.brands.slice(0, 3).map((brand, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(brand)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <TagIcon className="w-4 h-4 mr-3 text-gray-400" />
                  {brand}
                </button>
              ))}
            </div>
          )}
          
          {/* Category Suggestions */}
          {!loading && suggestions?.categories && suggestions.categories.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Categories
              </div>
              {suggestions.categories.slice(0, 3).map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(category)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <TagIcon className="w-4 h-4 mr-3 text-gray-400" />
                  {category}
                </button>
              ))}
            </div>
          )}
          
          {/* View All Results */}
          {!loading && query.trim() && (
            <div className="border-t border-gray-100">
              <button
                onClick={() => handleSearch(query)}
                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
          
          {/* No Results */}
          {!loading && query.length >= 2 && !suggestions && (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No suggestions found</div>
              <button
                onClick={() => handleSearch(query)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Search for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
