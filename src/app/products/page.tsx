"use client";
import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSort from '../../components/products/ProductSort';
import { fetchJson } from '../../lib/api';
import { Product, Category } from '../../lib/types';
import { useCart, useToast, useAuth } from '../../lib/context';

// Category icon mapping
const categoryIcons: Record<string, string> = {
  'hair care': '💇‍♀️',
  'hair-care': '💇‍♀️',
  'serum': '🧪',
  'serums': '🧪',
  'essences': '💧',
  'cleansers': '🧼',
  'toner': '🌊',
  'moisturizers': '💧',
  'exfoliators': '✨',
  'sun protection': '☀️',
  'sun-protection': '☀️',
  'makeup': '💄',
  'make up': '💄',
  'skincare': '🌿',
  'skin care': '🌿',
  'body care': '🧴',
  'bath & body care': '🛁',
  'bath body': '🛁',
  'accessories': '✨',
  'fragrance': '🌸',
  'tools': '🔧',
  'foundation': '🎨',
  'lipstick': '💋',
  'eye makeup': '👁️',
  'shampoo': '🧴',
  'sunscreen': '☀️'
};

const getCategoryIcon = (categoryName: string) => {
  return categoryIcons[categoryName.toLowerCase()] || '🌟';
};

interface FilterState {
  category?: string;
  brand?: string;
  priceRange?: string;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  
  // Filter and sort state
  const [filters, setFilters] = React.useState<FilterState>({});
  const [sortBy, setSortBy] = React.useState('featured');
  
  // Ref for infinite scroll trigger
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  
  // Lazy load child categories (show 6 initially)
  const [showAllChildCategories, setShowAllChildCategories] = React.useState(false);
  
  // Get current category and its children
  const currentCategory = React.useMemo(() => {
    if (!filters.category) return null;
    return categories.find(cat => 
      cat.slug === filters.category || cat.name.toLowerCase() === filters.category?.toLowerCase()
    );
  }, [categories, filters.category]);

  const childCategories = React.useMemo(() => {
    if (!currentCategory) return [];
    return categories.filter(cat => 
      cat.parentId === currentCategory._id && cat.isActive
    );
  }, [categories, currentCategory]);
  
  // Build query parameters for API call - use function instead of useCallback to avoid dependency issues
  const buildQueryParams = React.useCallback((page: number = 1, categorySlug?: string, sort?: string) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20'); // Load 20 products per page
    params.set('isActive', 'true');
    
    // Add category filter - use current categories state
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => 
        cat.slug === categorySlug || cat.name.toLowerCase() === categorySlug?.toLowerCase()
      );
      if (category?._id) {
        params.set('category', category._id);
      }
    }
    
    // Add sort
    if (sort) {
      params.set('sort', sort);
    }
    
    return params.toString();
  }, [categories]); // Only depend on categories array

  // Fetch products with pagination
  const fetchProducts = React.useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }
    
    try {
      // Pass current filter/sort values directly instead of relying on closure
      const queryParams = buildQueryParams(page, filters.category, sortBy);
      const productsData = await fetchJson<Product[]>(`/catalog/products?${queryParams}`);
      
      if (append) {
        // Append new products to existing list
        setProducts(prev => [...prev, ...productsData]);
      } else {
        // Replace products (new search/filter)
        setProducts(productsData);
      }
      
      // Check if there are more products to load
      setHasMore(productsData.length === 20); // If we got 20, there might be more
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildQueryParams, filters.category, sortBy]); // Include filters/sort in deps but use refs to prevent loops

  // Fetch categories
  const fetchCategories = React.useCallback(async () => {
    try {
      const categoriesData = await fetchJson<Category[]>('/catalog/categories');
      sessionStorage.setItem('cachedCategories', JSON.stringify(categoriesData));
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch categories in background (for cache refresh)
  const fetchCategoriesInBackground = React.useCallback(async () => {
    try {
      const categoriesData = await fetchJson<Category[]>('/catalog/categories');
      
      // Update cache and state
      sessionStorage.setItem('cachedCategories', JSON.stringify(categoriesData));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Background category fetch failed:', error);
    }
  }, []);

  // Track if initial load is done to prevent recursion
  const isInitialLoad = React.useRef(true);
  const prevCategoryFilter = React.useRef<string | undefined>(undefined);
  const prevSortBy = React.useRef<string>('featured');
  const categoriesLoaded = React.useRef(false);

  // Get initial category from URL params
  const categoryParam = searchParams.get('category');

  React.useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [categoryParam]);

  // Check for cached categories first and initial data load
  React.useEffect(() => {
    const loadInitialData = async () => {
      const cachedCategories = sessionStorage.getItem('cachedCategories');
      if (cachedCategories) {
        try {
          const parsedCategories = JSON.parse(cachedCategories);
          setCategories(parsedCategories);
          categoriesLoaded.current = true;
          // Fetch fresh categories in background
          fetchCategoriesInBackground();
        } catch (error) {
          // Invalid cached data, continue with normal fetch
          sessionStorage.removeItem('cachedCategories');
        }
      }
      
      // Load categories if not cached
      if (!categoriesLoaded.current) {
        await fetchCategories();
        categoriesLoaded.current = true;
      }
      
      // Load initial products - use inline to avoid dependency issues
      setLoading(true);
      setCurrentPage(1);
      setHasMore(true);
      try {
        const queryParams = buildQueryParams(1, filters.category, sortBy);
        const productsData = await fetchJson<Product[]>(`/catalog/products?${queryParams}`);
        setProducts(productsData);
        setHasMore(productsData.length === 20);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching products:', err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
      
      isInitialLoad.current = false;
      // Set initial ref values
      prevCategoryFilter.current = filters.category;
      prevSortBy.current = sortBy;
    };
    
    loadInitialData();
  }, []); // Only run once on mount

  // Reset and refetch when filters or sort change (but not on initial load)
  React.useEffect(() => {
    // Skip if initial load or if categories aren't loaded yet
    if (isInitialLoad.current || !categoriesLoaded.current) {
      // Update refs to current values for next check
      prevCategoryFilter.current = filters.category;
      prevSortBy.current = sortBy;
      return;
    }

    // Only refetch if filter or sort actually changed
    const categoryChanged = prevCategoryFilter.current !== filters.category;
    const sortChanged = prevSortBy.current !== sortBy;

    if (categoryChanged || sortChanged) {
      // Update refs
      prevCategoryFilter.current = filters.category;
      prevSortBy.current = sortBy;
      
      // Reset pagination when filters change
      setCurrentPage(1);
      setHasMore(true);
      // Use inline function to avoid dependency on fetchProducts
      const queryParams = buildQueryParams(1, filters.category, sortBy);
      fetchJson<Product[]>(`/catalog/products?${queryParams}`)
        .then(productsData => {
          setProducts(productsData);
          setHasMore(productsData.length === 20);
          setCurrentPage(1);
        })
        .catch(err => {
          setError('Failed to load products. Please try again.');
          console.error('Error fetching products:', err);
          setHasMore(false);
        });
    }
  }, [filters.category, sortBy, buildQueryParams]); // Removed fetchProducts from deps

  // Infinite scroll: Load more products when scroll reaches bottom
  React.useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = currentPage + 1;
          fetchProducts(nextPage, true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Start loading 100px before reaching the element
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, loadingMore, currentPage, fetchProducts]);

  // Helper function to get all descendant category IDs (including the category itself)
  const getAllDescendantCategoryIds = React.useCallback((categoryId: string): string[] => {
    const allCategoryIds = new Set<string>([categoryId]);
    const categoriesToProcess = [categoryId];
    
    while (categoriesToProcess.length > 0) {
      const currentCategoryId = categoriesToProcess.shift()!;
      
      // Find all direct children of the current category
      const children = categories.filter(cat => 
        cat.parentId === currentCategoryId && cat.isActive
      );
      
      // Add children to the set and queue them for processing
      for (const child of children) {
        if (child._id && !allCategoryIds.has(child._id)) {
          allCategoryIds.add(child._id);
          categoriesToProcess.push(child._id);
        }
      }
    }
    
    return Array.from(allCategoryIds);
  }, [categories]);

  // Filter products client-side (for brand and price filters that aren't server-side yet)
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Category filtering is done server-side, but we keep this for brand/price
    // Brand filter (client-side)
    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.brand?.toLowerCase() === filters.brand?.toLowerCase()
      );
    }

    // Price range filter (client-side)
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        const price = product.price.amount;
        if (max && min !== undefined) {
          return price >= min && price <= max;
        }
        if (min !== undefined) {
          return price >= min;
        }
        return true;
      });
    }

    // Sorting is done server-side, but we keep this as fallback
    // Most sorting is handled by the backend now

    return filtered;
  }, [products, filters.brand, filters.priceRange]);

  // Get unique brands for filter
  const brands = React.useMemo(() => {
    // Use Map to deduplicate brands by lowercase value while preserving original casing
    const brandMap = new Map<string, { original: string; count: number }>();
    
    products.forEach(product => {
      if (product.brand) {
        const normalized = product.brand.toLowerCase().trim();
        if (normalized) {
          if (brandMap.has(normalized)) {
            // Increment count for existing brand
            const existing = brandMap.get(normalized)!;
            existing.count += 1;
          } else {
            // Add new brand with original casing
            brandMap.set(normalized, {
              original: product.brand.trim(),
              count: 1
            });
          }
        }
      }
    });
    
    // Convert map to array, sorted by count (most popular first)
    return Array.from(brandMap.entries())
      .map(([normalized, data]) => ({
        value: normalized, // Use normalized lowercase as value for filtering
        label: data.original, // Use original casing for display
        count: data.count
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0)); // Sort by count descending
  }, [products]);

  // Get all descendant categories recursively
  const getAllDescendantCategories = React.useCallback((categoryId: string): Category[] => {
    const result: Category[] = [];
    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return result;
    
    // Add the category itself
    result.push(category);
    
    // Find all direct children
    const children = categories.filter(cat => 
      cat.parentId === categoryId && cat.isActive
    );
    
    // Recursively add all descendants
    for (const child of children) {
      if (child._id) {
        result.push(...getAllDescendantCategories(child._id));
      }
    }
    
    return result;
  }, [categories]);

  // Memoize category counts to avoid recalculating on every render
  const categoryCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach(product => {
      product.categoryIds?.forEach(categoryId => {
        counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
      });
    });
    return counts;
  }, [products]);

  // Get categories for filter - filtered based on current category
  const categoryOptions = React.useMemo(() => {
    // If no category is selected, show all categories
    if (!filters.category) {
      return categories
        .filter(cat => cat.isActive)
        .map(category => {
          const allCategoryIds = getAllDescendantCategoryIds(category._id!);
          // Optimize: Use pre-calculated counts instead of filtering products
          const count = allCategoryIds.reduce((sum, catId) => sum + (categoryCounts.get(catId) || 0), 0);
          
          return {
            value: category.slug,
            label: category.name,
            count
          };
        });
    }

    // Find the current category
    const selectedCategory = categories.find(cat => 
      cat.slug === filters.category || cat.name.toLowerCase() === filters.category?.toLowerCase()
    );

    if (!selectedCategory) {
      // Category not found, show all
      return categories
        .filter(cat => cat.isActive)
        .map(category => {
          const allCategoryIds = getAllDescendantCategoryIds(category._id!);
          // Optimize: Use pre-calculated counts
          const count = allCategoryIds.reduce((sum, catId) => sum + (categoryCounts.get(catId) || 0), 0);
          
          return {
            value: category.slug,
            label: category.name,
            count
          };
        });
    }

    // Determine which categories to show
    let categoriesToShow: Category[] = [];

    if (!selectedCategory._id) {
      // No category ID, show all
      return categories
        .filter(cat => cat.isActive)
        .map(category => {
          const allCategoryIds = getAllDescendantCategoryIds(category._id!);
          // Optimize: Use pre-calculated counts
          const count = allCategoryIds.reduce((sum, catId) => sum + (categoryCounts.get(catId) || 0), 0);
          
          return {
            value: category.slug,
            label: category.name,
            count
          };
        });
    }

    if (!selectedCategory.parentId) {
      // Main category (no parent) - show it and all its descendants
      categoriesToShow = getAllDescendantCategories(selectedCategory._id);
    } else {
      // Subcategory (has parent) - show parent, siblings, and children
      const parent = categories.find(cat => cat._id === selectedCategory.parentId);
      
      // Add parent if exists
      if (parent && parent.isActive) {
        categoriesToShow.push(parent);
      }
      
      // Add siblings (categories with same parent)
      const siblings = categories.filter(cat => 
        cat.parentId === selectedCategory.parentId && 
        cat.isActive && 
        cat._id !== selectedCategory._id
      );
      categoriesToShow.push(...siblings);
      
      // Add current category
      categoriesToShow.push(selectedCategory);
      
      // Add all descendants of current category
      const descendants = getAllDescendantCategories(selectedCategory._id);
      // Remove the current category (already added) and add only descendants
      categoriesToShow.push(...descendants.filter(cat => cat._id !== selectedCategory._id));
    }

    // Remove duplicates and map to filter options
    const uniqueCategories = Array.from(
      new Map(categoriesToShow.map(cat => [cat._id, cat])).values()
    );

    return uniqueCategories.map(category => {
      const allCategoryIds = getAllDescendantCategoryIds(category._id!);
      // Optimize: Use pre-calculated counts
      const count = allCategoryIds.reduce((sum, catId) => sum + (categoryCounts.get(catId) || 0), 0);
      
      return {
        value: category.slug,
        label: category.name,
        count
      };
    });
  }, [categories, categoryCounts, filters.category, getAllDescendantCategoryIds, getAllDescendantCategories]);

  // Price ranges for BDT currency
  const priceRanges = [
    { value: '0-1000', label: 'Under ৳1,000' },
    { value: '1000-2000', label: '৳1,000 - ৳2,000' },
    { value: '2000-3000', label: '৳2,000 - ৳3,000' },
    { value: '3000-5000', label: '৳3,000 - ৳5,000' },
    { value: '5000', label: 'Over ৳5,000' },
  ];

  const handleFilterChange = (filterType: string, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const product = products.find(p => p._id === productId);
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

  const handleAddToWishlist = async (productId: string) => {
    try {
      // Check if user is authenticated
      if (!user) {
        addToast({
          type: 'error',
          title: 'Login Required',
          message: 'Please login or register to add items to your wishlist'
        });
        router.push('/login');
        return;
      }
      
      const product = products.find(p => p._id === productId);
      if (!product) return;
      
      const isOutOfStock = product.stock === 0 || product.stock === undefined;
      
      if (isOutOfStock) {
        // For out-of-stock products, show info message about wishlist modal
        addToast({
          type: 'info',
          title: 'Wishlist Available',
          message: 'Click the heart icon on the product card to add to wishlist'
        });
      } else {
        // For in-stock products, show message that wishlist is only for out-of-stock items
        addToast({
          type: 'info',
          title: 'Wishlist Information',
          message: 'Wishlist is only available for out-of-stock products'
        });
      }
    } catch (error) {
      console.error('Error with wishlist:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to process wishlist request'
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-4 sm:py-6 lg:py-8">
        {/* Mobile-First Page Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          {/* Breadcrumbs for category pages */}
          {filters.category && (
            <nav className="mb-3 sm:mb-4">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link href="/" className="hover:text-red-700 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link href="/products" className="hover:text-red-700 transition-colors">
                    Products
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900 font-medium">
                    {categories.find(cat => cat.slug === filters.category)?.name || 'Category'}
                  </span>
                </li>
              </ol>
            </nav>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {filters.category ? 
              categories.find(cat => cat.slug === filters.category)?.name || 'Products' 
              : 'All Products'
            }
          </h1>
          <p className="text-sm sm:text-base text-gray-700 font-medium">
            Discover our carefully curated collection of premium beauty and skincare products
          </p>
        </div>

        {/* Child Categories Section - Only show when viewing a main category */}
        {currentCategory && childCategories.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Explore {currentCategory.name} Categories
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {(showAllChildCategories ? childCategories : childCategories.slice(0, 6)).map((childCategory) => (
                  <Link
                    key={childCategory._id}
                    href={`/products?category=${childCategory.slug}`}
                    className="group flex flex-col items-center text-center hover:scale-105 transition-transform duration-200"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 sm:mb-3 overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-2 border-gray-200 group-hover:border-red-300 transition-all duration-300 group-hover:shadow-lg">
                      {childCategory.image ? (
                        <img 
                          src={childCategory.image} 
                          alt={childCategory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl md:text-4xl">
                          {getCategoryIcon(childCategory.name)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-red-700 transition-colors duration-300 leading-tight px-1">
                      {childCategory.name}
                    </h3>
                  </Link>
                ))}
              </div>
              {/* Show More button if there are more than 6 child categories */}
              {childCategories.length > 6 && !showAllChildCategories && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllChildCategories(true)}
                    className="text-red-700 hover:text-red-800 font-medium text-sm underline"
                  >
                    Show {childCategories.length - 6} More Categories
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile-First Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <ProductFilters
              categories={categoryOptions}
              brands={brands}
              priceRanges={priceRanges}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Sort and Results - Sticky on mobile */}
            <div className="sticky top-0 bg-gray-50 z-10 pb-4 mb-4 lg:pb-0 lg:mb-6">
              <ProductSort
                sortOptions={[
                  { value: 'featured', label: 'Featured' },
                  { value: 'newest', label: 'Newest First' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'name-asc', label: 'Name: A to Z' },
                  { value: 'name-desc', label: 'Name: Z to A' },
                ]}
                currentSort={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            {/* Mobile Filters - Show on mobile */}
            <div className="lg:hidden mb-6">
              <ProductFilters
                categories={categoryOptions}
                brands={brands}
                priceRanges={priceRanges}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={filteredAndSortedProducts}
              loading={loading}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />

            {/* Infinite Scroll Trigger */}
            {!loading && (
              <div ref={loadMoreRef} className="py-8">
                {loadingMore && (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                    <span className="ml-3 text-gray-600">Loading more products...</span>
                  </div>
                )}
                {!hasMore && filteredAndSortedProducts.length > 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <p>No more products to load</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      className="text-red-500"
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
