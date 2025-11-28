"use client";
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import SearchFilters from '../../components/search/SearchFilters';
import MobileSearchFilters from '../../components/search/MobileSearchFilters';
import SearchResults from '../../components/search/SearchResults';
import { fetchJson } from '../../lib/api';
import { Product } from '../../lib/types';
import { useCart, useToast } from '../../lib/context';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon
} from '@heroicons/react/24/outline';

interface SearchFilters {
  brand?: string[];
  category?: string[];
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  inStock?: boolean | undefined;
  rating?: number | undefined;
}

interface SearchResult {
  products: Product[];
  total: number;
  suggestions?: string[];
  filters?: {
    brands: string[];
    categories: string[];
    priceRange: { min: number; max: number };
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addToast } = useToast();
  
  const [searchResult, setSearchResult] = React.useState<SearchResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showFilters] = React.useState(false);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  
  // Get search query from URL
  const query = searchParams.get('q') || '';
  
  // Filter state
  const [filters, setFilters] = React.useState<SearchFilters>({});
  const [sortBy, setSortBy] = React.useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('relevance');
  const [page, setPage] = React.useState(1);
  
  // Parse filters from URL
  React.useEffect(() => {
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const inStock = searchParams.get('inStock');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort');
    
    setFilters({
      brand: brand ? brand.split(',') : [],
      category: category ? category.split(',') : [],
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      inStock: inStock ? inStock === 'true' : undefined,
      rating: rating ? parseFloat(rating) : undefined
    });
    
    if (sort) {
      setSortBy(sort as any);
    }
  }, [searchParams]);
  
  // Fetch search results
  const fetchSearchResults = React.useCallback(async () => {
    if (!query.trim()) {
      setSearchResult(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        sortBy
      });
      
      // Add filters to params
      if (filters.brand && filters.brand.length > 0) {
        params.append('brand', filters.brand.join(','));
      }
      if (filters.category && filters.category.length > 0) {
        params.append('category', filters.category.join(','));
      }
      if (filters.priceMin !== undefined) {
        params.append('priceMin', filters.priceMin.toString());
      }
      if (filters.priceMax !== undefined) {
        params.append('priceMax', filters.priceMax.toString());
      }
      if (filters.inStock !== undefined) {
        params.append('inStock', filters.inStock.toString());
      }
      if (filters.rating !== undefined) {
        params.append('rating', filters.rating.toString());
      }
      
      const result = await fetchJson<SearchResult>(`/catalog/search?${params.toString()}`);
      setSearchResult(result);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to load search results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, page, sortBy, filters]);
  
  React.useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);
  
  // Update URL when filters change
  const updateURL = React.useCallback((newFilters: SearchFilters, newSortBy?: string) => {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (newSortBy) {
      params.set('sort', newSortBy);
    }
    
    if (newFilters.brand && newFilters.brand.length > 0) {
      params.set('brand', newFilters.brand.join(','));
    }
    if (newFilters.category && newFilters.category.length > 0) {
      params.set('category', newFilters.category.join(','));
    }
    if (newFilters.priceMin !== undefined) {
      params.set('priceMin', newFilters.priceMin.toString());
    }
    if (newFilters.priceMax !== undefined) {
      params.set('priceMax', newFilters.priceMax.toString());
    }
    if (newFilters.inStock !== undefined) {
      params.set('inStock', newFilters.inStock.toString());
    }
    if (newFilters.rating !== undefined) {
      params.set('rating', newFilters.rating.toString());
    }
    
    router.push(`/search?${params.toString()}`);
  }, [query, router]);
  
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1);
    updateURL(newFilters);
  };
  
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy as any);
    setPage(1);
    updateURL(filters, newSortBy);
  };
  
  const clearFilters = () => {
    setFilters({});
    setPage(1);
    updateURL({});
  };
  
  const handleAddToCart = async (productId: string) => {
    try {
      const product = searchResult?.products.find(p => p._id === productId);
      if (!product) return;
      
      await addItem(productId, 1);
      
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.title} added to cart successfully!`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add product to cart'
      });
    }
  };
  
  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Products</h1>
            <p className="text-gray-600 mb-8">Enter a search term to find products</p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100">
      <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                Search Results for "{query}"
              </h1>
              {searchResult && (
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  {searchResult.total} product{searchResult.total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base font-semibold text-gray-900 flex-shrink-0"
            >
              <FunnelIcon className="w-5 h-5 text-gray-700" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Sort Options - Mobile Optimized */}
          <div className="w-full">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <span className="text-base font-semibold text-gray-900 whitespace-nowrap">Sort by:</span>
              <div className="w-full sm:w-auto sm:min-w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base bg-white font-medium text-gray-900"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <SearchFilters
                filters={filters}
                availableFilters={searchResult?.filters || { brands: [], categories: [], priceRange: { min: 0, max: 10000 } }}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
          
          {/* Results */}
          <div className="flex-1 min-w-0 w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 animate-pulse">
                    <div className="w-full h-40 md:h-48 bg-gray-200 rounded-lg mb-3 md:mb-4"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 md:py-16 px-4">
                <div className="text-red-600 mb-4 text-base md:text-lg font-medium">{error}</div>
                <button
                  onClick={fetchSearchResults}
                  className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-base font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : searchResult && searchResult.products.length > 0 ? (
              <SearchResults
                products={searchResult.products}
                total={searchResult.total}
                onAddToCart={handleAddToCart}
                suggestions={searchResult.suggestions || []}
              />
            ) : (
              <div className="text-center py-8 md:py-16 px-4">
                <MagnifyingGlassIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  Try adjusting your search terms or filters
                </p>
                {searchResult?.suggestions && searchResult.suggestions.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Did you mean:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {searchResult.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => router.push(`/search?q=${encodeURIComponent(suggestion)}`)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-base font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Search Filters Overlay */}
      {showMobileFilters && (
        <MobileSearchFilters
          filters={filters}
          availableFilters={searchResult?.filters || null}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onClose={() => setShowMobileFilters(false)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
