"use client";
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import ProductSort from '../../components/products/ProductSort';
import { fetchJson } from '../../lib/api';
import { Product, Category } from '../../lib/types';
import { useCart, useToast } from '../../lib/context';

interface FilterState {
  category?: string;
  brand?: string;
  priceRange?: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Filter and sort state
  const [filters, setFilters] = React.useState<FilterState>({});
  const [sortBy, setSortBy] = React.useState('featured');
  
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

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Apply filters
    if (filters.category) {
      // Find category by slug or name
      const category = categories.find(cat => 
        cat.slug === filters.category || cat.name.toLowerCase() === filters.category.toLowerCase()
      );
      if (category) {
        filtered = filtered.filter(product => 
          product.categoryIds?.includes(category._id!)
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
        if (max) {
          return price >= min && price <= max;
        }
        return price >= min;
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
    return categories.map(category => ({
      value: category.slug,
      label: category.name,
      count: products.filter(p => p.categoryIds?.includes(category._id!)).length
    }));
  }, [categories, products]);

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
      showToast('Product added to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add product to cart', 'error');
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      // TODO: Implement wishlist API call
      console.log('Adding to wishlist:', productId);
      showToast('Product added to wishlist!', 'success');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add product to wishlist', 'error');
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
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filters.category ? 
              categories.find(cat => cat.slug === filters.category)?.name || 'Products' 
              : 'All Products'
            }
          </h1>
          <p className="text-gray-600">
            Discover our carefully curated collection of premium beauty and skincare products
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <ProductFilters
            categories={categoryOptions}
            brands={brands}
            priceRanges={priceRanges}
            selectedFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results */}
            <ProductSort
              currentSort={sortBy}
              onSortChange={setSortBy}
              totalResults={filteredAndSortedProducts.length}
            />

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
