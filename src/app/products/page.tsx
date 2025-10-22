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
  const [error, setError] = React.useState<string | null>(null);
  
  // Filter and sort state
  const [filters, setFilters] = React.useState<FilterState>({});
  const [sortBy, setSortBy] = React.useState('featured');
  
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
  
  // Get initial category from URL params
  const categoryParam = searchParams.get('category');

  React.useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [categoryParam]);

  // Fetch products and categories
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchJson<Product[]>('/catalog/products'),
          fetchJson<Category[]>('/catalog/categories')
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply filters
    if (filters.category) {
      // Find category by slug or name
      const category = categories.find(cat => 
        cat.slug === filters.category || cat.name.toLowerCase() === filters.category?.toLowerCase()
      );
      if (category) {
        // Get all descendant category IDs (including the category itself)
        const allCategoryIds = getAllDescendantCategoryIds(category._id!);
        filtered = filtered.filter(product => 
          product.categoryIds?.some(categoryId => allCategoryIds.includes(categoryId))
        );
      }
    }

    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.brand?.toLowerCase() === filters.brand?.toLowerCase()
      );
    }

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

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      default: // featured
        // Keep original order or implement featured logic
        break;
    }

    return filtered;
  }, [products, categories, filters, sortBy]);

  // Get unique brands for filter
  const brands = React.useMemo(() => {
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return uniqueBrands.map(brand => ({
      value: brand!.toLowerCase(),
      label: brand!,
      count: products.filter(p => p.brand === brand).length
    }));
  }, [products]);

  // Get categories for filter
  const categoryOptions = React.useMemo(() => {
    return categories.map(category => {
      // Get all descendant category IDs for this category
      const allCategoryIds = getAllDescendantCategoryIds(category._id!);
      const count = products.filter(p => 
        p.categoryIds?.some(categoryId => allCategoryIds.includes(categoryId))
      ).length;
      
      return {
        value: category.slug,
        label: category.name,
        count
      };
    });
  }, [categories, products, getAllDescendantCategoryIds]);

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
                {childCategories.map((childCategory) => (
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
                totalResults={filteredAndSortedProducts.length}
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
