"use client";
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductGallery from '../../../components/products/ProductGallery';
import { Button } from '../../../components/ui/button';
import { Product } from '../../../lib/types';
import { useAuth, useCart, useToast, useWishlist } from '../../../lib/context';
import OutOfStockWishlistModal from '../../../components/wishlist/OutOfStockWishlistModal';
import StructuredData from '../../../components/seo/StructuredData';
import MultipleVariantSelector, { VariantSelection } from '../../../components/products/MultipleVariantSelector';



export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, refreshCart } = useCart();
  const { addToast } = useToast();
  const { isInWishlist } = useWishlist();
  const slug = params['slug'] as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedSize, setSelectedSize] = React.useState<string>('');
  const [selectedColor, setSelectedColor] = React.useState<string>('');
  const [variantSelections, setVariantSelections] = React.useState<VariantSelection[]>([]);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [showWishlistModal, setShowWishlistModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('description');
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = React.useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = React.useState(false);

  // Fetch product data with optimized loading
  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product from the real API
        const response = await fetch(`/api/proxy/catalog/products/${slug}`, {
          headers: {
            'Cache-Control': 'max-age=300', // 5 minutes cache
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
            setLoading(false);
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const productData = await response.json();
        if (!productData.success) {
          throw new Error(productData.error?.message || 'Failed to load product');
        }
        
        const product = productData.data;
        
        // Ensure sizes is always an array if it exists
        if (product.sizes && !Array.isArray(product.sizes)) {
          console.warn('Sizes is not an array, converting...', product.sizes);
          // If sizes is a string, try to parse it or split by comma
          if (typeof product.sizes === 'string') {
            product.sizes = product.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s);
          } else {
            product.sizes = [String(product.sizes)];
          }
        }
        
        setProduct(product);
        setSelectedSize(''); // Reset size selection when product changes
        setSelectedColor(''); // Reset color selection when product changes
        setLoading(false);
        
        // Fetch related products asynchronously after main product loads
        // Optimized: Use dedicated related products endpoint instead of fetching entire category
        if (product.categoryIds && product.categoryIds.length > 0) {
          // Check sessionStorage cache first to reduce server load
          const cacheKey = `related_products_${product._id}`;
          const cachedData = sessionStorage.getItem(cacheKey);
          const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_time`);
          const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
          const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache
          
          if (cachedData && cacheAge < CACHE_DURATION) {
            try {
              const cachedProducts = JSON.parse(cachedData);
              setRelatedProducts(cachedProducts);
            } catch (e) {
              // Invalid cache, continue to fetch
            }
          }
          
          // Fetch related products (limit 4 for better UX)
          fetch(`/api/proxy/catalog/products/${product._id}/related?limit=4`, {
            headers: {
              'Cache-Control': 'max-age=300', // 5 minutes cache
            },
          })
            .then(relatedResponse => {
              if (relatedResponse.ok) {
                return relatedResponse.json();
              }
              return null;
            })
            .then(relatedData => {
              if (relatedData?.success && relatedData.data) {
                setRelatedProducts(relatedData.data);
                // Cache in sessionStorage
                sessionStorage.setItem(cacheKey, JSON.stringify(relatedData.data));
                sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
              }
            })
            .catch(() => {
              // Silently fail for related products - not critical for page functionality
            });
          
          // Fetch recommended products (best sellers/featured from same category)
          // Optimized: Only fetch if not in cache and load in background
          const recommendedCacheKey = `recommended_products_${product.categoryIds[0]}`;
          const recommendedCached = sessionStorage.getItem(recommendedCacheKey);
          const recommendedCacheTime = sessionStorage.getItem(`${recommendedCacheKey}_time`);
          const recommendedCacheAge = recommendedCacheTime ? Date.now() - parseInt(recommendedCacheTime) : Infinity;
          
          if (!recommendedCached || recommendedCacheAge >= CACHE_DURATION) {
            setLoadingRecommended(true);
            // Fetch featured products from same category (limit 4)
            fetch(`/api/proxy/catalog/products?category=${product.categoryIds[0]}&isFeatured=true&limit=4&sort=popularity`, {
              headers: {
                'Cache-Control': 'max-age=300',
              },
            })
              .then(recResponse => {
                if (recResponse.ok) {
                  return recResponse.json();
                }
                return null;
              })
              .then(recData => {
                if (recData?.success && recData.data) {
                  // Filter out current product and limit to 4
                  const filtered = recData.data
                    .filter((p: Product) => p._id !== product._id)
                    .slice(0, 4);
                  setRecommendedProducts(filtered);
                  // Cache in sessionStorage
                  sessionStorage.setItem(recommendedCacheKey, JSON.stringify(filtered));
                  sessionStorage.setItem(`${recommendedCacheKey}_time`, Date.now().toString());
                }
              })
              .catch(() => {
                // Silently fail - not critical
              })
              .finally(() => {
                setLoadingRecommended(false);
              });
          } else {
            // Use cached recommended products
            try {
              const cachedRecommended = JSON.parse(recommendedCached);
              setRecommendedProducts(cachedRecommended);
            } catch (e) {
              // Invalid cache
            }
          }
        }
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    
    // Check if product has variants (sizes or colors)
    const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);
    
    // If product has NO variants, allow direct add to cart with just quantity
    if (!hasVariants) {
      setIsAddingToCart(true);
      try {
        await addItem(product._id!, quantity);
        addToast({
          type: 'success',
          title: 'Added to Cart',
          message: `${product.title} added to cart successfully!`
        });
        setQuantity(1);
      } catch (error) {
        console.error('Error adding to cart:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to add item to cart'
        });
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    // Product has variants - check if using variant selector or old single selection
    if (variantSelections.length === 0) {
      // Check if using old single selection method
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        addToast({
          type: 'error',
          title: 'Selection Required',
          message: 'Please select a size before adding to cart'
        });
        return;
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        addToast({
          type: 'error',
          title: 'Selection Required',
          message: 'Please select a color before adding to cart'
        });
        return;
      }
      
      // Use old single selection method (for backward compatibility)
      setIsAddingToCart(true);
      try {
        await addItem(product._id!, quantity, selectedSize || undefined, selectedColor || undefined);
        addToast({
          type: 'success',
          title: 'Added to Cart',
          message: `${product.title}${selectedSize ? ` (Size: ${selectedSize})` : ''}${selectedColor ? ` (Color: ${selectedColor})` : ''} added to cart successfully!`
        });
        // Reset selections
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
      } catch (error) {
        console.error('Error adding to cart:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to add item to cart'
        });
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }
    
    // Handle multiple variant selections (from variant selector)
    
    setIsAddingToCart(true);
    try {
      // Use batch endpoint for multiple variants (optimized - single API call)
      const itemsToAdd = variantSelections.map(selection => ({
        productId: product._id!,
        quantity: selection.quantity,
        selectedSize: selection.size || undefined,
        selectedColor: selection.color || undefined
      }));

      // Use batch API for multiple variants (optimized - single API call, 5x faster)
      if (itemsToAdd.length > 1) {
        // Batch add - industry standard, reduces API calls and database queries
        const { cartApi } = await import('../../../lib/api');
        const sessionId = localStorage.getItem('scarlet_session_id') || '';
        
        // Normalize items to ensure proper typing (remove undefined explicitly)
        const normalizedItems = itemsToAdd.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          ...(item.selectedSize && { selectedSize: item.selectedSize }),
          ...(item.selectedColor && { selectedColor: item.selectedColor })
        }));
        
        try {
          if (user) {
            await cartApi.addItemsBatch(normalizedItems);
          } else {
            await cartApi.addGuestItemsBatch(sessionId, normalizedItems);
          }
          // Refresh cart after batch add
          await refreshCart();
        } catch (batchError) {
          // Fallback to individual calls if batch fails
          console.warn('Batch add failed, falling back to individual calls:', batchError);
          const addPromises = itemsToAdd.map(item => 
            addItem(item.productId, item.quantity, item.selectedSize, item.selectedColor)
          );
          await Promise.all(addPromises);
        }
      } else {
        // Single item - use regular endpoint
        const singleItem = itemsToAdd[0];
        if (singleItem) {
          await addItem(
            singleItem.productId, 
            singleItem.quantity, 
            singleItem.selectedSize, 
            singleItem.selectedColor
          );
        }
      }
      
      const totalItems = variantSelections.reduce((sum, s) => sum + s.quantity, 0);
      addToast({
        type: 'success',
        title: 'Added to Cart',
        message: `Added ${totalItems} item${totalItems > 1 ? 's' : ''} to cart successfully!`
      });
      
      // Reset selections
      setVariantSelections([]);
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product to cart';
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const handlePreorder = async () => {
    // For preorder, add to cart and redirect to checkout with preorder flag
    await handleAddToCart();
    router.push('/cart?preorder=true');
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Login Required',
        message: 'Please login or register to add items to your wishlist'
      });
      router.push('/login');
      return;
    }
    
    if (!product) return;
    
    const isOutOfStock = product.stock === 0 || product.stock === undefined;
    
    if (isOutOfStock) {
      // For out-of-stock products, show the wishlist modal
      setShowWishlistModal(true);
    } else {
      // For in-stock products, show message that wishlist is only for out-of-stock items
      addToast({
        type: 'info',
        title: 'Wishlist Information',
        message: 'Wishlist is only available for out-of-stock products'
      });
    }
  };

  const formatPrice = React.useCallback((amount: number, currency: string = 'BDT') => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }, []);

  const calculateDiscountPercentage = React.useCallback((originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }, []);

  // Helper function to generate variant key
  const getVariantKey = React.useCallback((size?: string, color?: string): string => {
    const sizeKey = size || 'no-size';
    const colorKey = color || 'no-color';
    return `${sizeKey}_${colorKey}`;
  }, []);

  // Memoize expensive calculations to avoid recalculating on every render
  const totalVariantStock = React.useMemo(() => {
    if (!product?.variantStock) return 0;
    return Object.values(product.variantStock).reduce((sum: number, stock: number) => sum + (stock || 0), 0);
  }, [product?.variantStock]);

  const currentStock = React.useMemo(() => {
    if (!product) return 0;
    
    // If product has variants and size/color selected, check variant stock
    const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);
    if (hasVariants && product.variantStock && (selectedSize || selectedColor)) {
      const key = getVariantKey(selectedSize || undefined, selectedColor || undefined);
      return product.variantStock[key] || 0;
    }
    
    // If product has variants but no variant stock set, return 0
    if (hasVariants && product.variantStock) {
      // If using variant selector, check total variant stock
      if (variantSelections.length > 0) {
        return totalVariantStock;
      }
      // If single selection, check that variant
      if (selectedSize || selectedColor) {
        const key = getVariantKey(selectedSize || undefined, selectedColor || undefined);
        return product.variantStock[key] || 0;
      }
      return totalVariantStock;
    }
    
    // Fallback to single stock
    return product.stock || 0;
  }, [product, selectedSize, selectedColor, variantSelections.length, totalVariantStock, getVariantKey]);

  const isComingSoon = React.useMemo(() => {
    return product?.isComingSoon || product?.homepageSection === 'coming-soon';
  }, [product?.isComingSoon, product?.homepageSection]);

  const isInStock = React.useMemo(() => {
    return currentStock > 0;
  }, [currentStock]);

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Memoize calculations that depend on product (must be called unconditionally)
  const currentPrice = React.useMemo(() => product?.price.amount || 0, [product?.price.amount]);
  const hasDiscount = React.useMemo(() => 
    product?.price.originalAmount && product.price.originalAmount > (product.price.amount || 0),
    [product?.price.originalAmount, product?.price.amount]
  );

  // Memoize maxStock for variant selector
  const maxStockForSelector = React.useMemo(() => {
    if (!product) return 999;
    const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);
    if (hasVariants && product.variantStock) {
      return totalVariantStock || 999;
    }
    return product.stock || 999;
  }, [product, totalVariantStock]);

  // Memoize stock display JSX to avoid calling useMemo inside JSX (React Hooks violation)
  const stockDisplay = React.useMemo(() => {
    if (!product) return null;
    
    const hasVariants = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);
    
    if (hasVariants && product.variantStock) {
      // Show both total and per-variant stock
      return (
        <>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-semibold text-blue-800">
              Total Stock: <strong>{totalVariantStock}</strong> {totalVariantStock === 1 ? 'unit' : 'units'} across all variants
            </span>
          </div>
          {(selectedSize || selectedColor) && currentStock > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-semibold text-green-800">
                Selected Variant ({selectedSize || 'N/A'}, {selectedColor || 'N/A'}): <strong>{currentStock}</strong> {currentStock === 1 ? 'unit' : 'units'} available
              </span>
            </div>
          )}
          {(selectedSize || selectedColor) && currentStock === 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm font-semibold text-red-800">
                Selected Variant ({selectedSize || 'N/A'}, {selectedColor || 'N/A'}): <strong>Out of Stock</strong>
              </span>
            </div>
          )}
        </>
      );
    } else {
      // Single stock display
      return currentStock > 0 ? (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm font-semibold text-green-800">
            Stock Quantity: <strong>{currentStock}</strong> {currentStock === 1 ? 'unit' : 'units'} available
          </span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-semibold text-red-800">
            Stock Status: <strong>Out of Stock</strong> (0 units available)
          </span>
        </div>
      );
    }
  }, [product, product?.sizes, product?.colors, product?.variantStock, product?.stock, selectedSize, selectedColor, variantSelections.length, currentStock, totalVariantStock]);
  
  // NOW we can do early returns after all hooks are called
  // Show loading skeleton while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-herlan py-8">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  // Only show error state if we have an actual error AND we're not loading
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container-herlan text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // If no product and no error, still show loading (this shouldn't happen but safety check)
  if (!product) {
    return <ProductDetailSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <StructuredData type="product" data={product} />
      <StructuredData 
        type="breadcrumb" 
        data={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: product.title, url: `/products/${product.slug}` }
        ]} 
      />
      
      <div className="container-herlan py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-red-700 transition-colors duration-200">Home</Link>
          <ChevronRightIcon />
          <Link href="/products" className="hover:text-red-700 transition-colors duration-200">Products</Link>
          <ChevronRightIcon />
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          {/* Product Images */}
          <div className="relative">
            <div className="sticky top-8">
              <ProductGallery images={product.images} productTitle={product.title} />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-7">
            {/* Brand */}
            {product.brand && (
              <div>
                <Link 
                  href={`/brands/${product.brand.toLowerCase()}`} 
                  className="inline-flex items-center text-sm text-red-700 hover:text-red-800 font-semibold transition-all duration-200 hover:gap-2 gap-1.5 uppercase tracking-wide"
                >
                  <span>{product.brand}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Coming Soon Badge */}
            {isComingSoon && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg mb-4">
                <span className="text-sm font-semibold text-purple-800">
                  🎉 Coming Soon - Preorder Available
                </span>
              </div>
            )}
            {/* Out of Stock Badge - Only show when out of stock and not coming soon */}
            {!isComingSoon && !isInStock && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold text-red-700">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">{product.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 pb-2">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(currentPrice, product.price.currency)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through font-medium">
                    {formatPrice(product.price.originalAmount!, product.price.currency)}
                  </span>
                  <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {calculateDiscountPercentage(product.price.originalAmount!, product.price.amount)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Quantity Display - SSLCommerz Compliance */}
            <div className="mb-4 space-y-2">
              {stockDisplay}
            </div>

            {/* Quick Description */}
            {product.description && (
              <div className="bg-gray-50 rounded-r-xl py-5 pl-0 pr-5 border-l-0 border-t border-r border-b border-gray-100">
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description.substring(0, 200)}
                  {product.description.length > 200 && '...'}
                </p>
              </div>
            )}

            {/* Multiple Variant Selector */}
            <MultipleVariantSelector
              sizes={product.sizes || undefined}
              colors={product.colors || undefined}
              maxStock={maxStockForSelector}
              {...(product.variantStock && { variantStock: product.variantStock })}
              onSelectionsChange={setVariantSelections}
              initialSelections={variantSelections}
            />

            {/* Coming Soon Notice */}
            {isComingSoon && (
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-purple-800 mb-1">
                      Preorder Available
                    </h3>
                    <p className="text-sm text-purple-700">
                      This product is coming soon! Reserve yours now with a 50% advance payment. 
                      You'll pay the remaining 50% when the product arrives and is ready to ship.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Out of Stock Notice - Only show when out of stock and not coming soon */}
            {!isComingSoon && !isInStock && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-semibold text-red-700">
                    Out of Stock
                  </span>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">
                  This product is currently unavailable. Please check back later or add it to your wishlist to be notified when it's back in stock.
                </p>
              </div>
            )}

            {/* Quantity Selector - Only show if no variants at all (no sizes, no colors) */}
            {(isInStock || isComingSoon) && 
             variantSelections.length === 0 && 
             !product.sizes && 
             !product.colors && (
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-base font-semibold text-gray-900">
                  Quantity:
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-semibold border-r border-gray-200"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={isComingSoon ? 999 : (product.stock || 999)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 text-center border-0 focus:ring-0 py-3 text-lg font-bold text-gray-900 bg-white"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(isComingSoon ? 999 : (product.stock || 999), quantity + 1))}
                    className="px-5 py-3 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-semibold border-l border-gray-200"
                    disabled={!isComingSoon && quantity >= (product.stock || 999)}
                    aria-label="Increase quantity"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {isComingSoon ? (
                <button
                  onClick={handlePreorder}
                  disabled={
                    isAddingToCart || 
                    // Only disable if product has variants but none selected
                    (((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && 
                     variantSelections.length === 0 && 
                     !selectedSize && 
                     !selectedColor)
                  }
                  className="group w-full h-14 px-6 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 transform hover:-translate-y-0.5 disabled:transform-none md:col-span-2"
                >
                  {isAddingToCart ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Preorder Now (50% Advance Payment)</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      !isInStock || 
                      isAddingToCart || 
                      // Only disable if product has variants but none selected
                      (((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && 
                       variantSelections.length === 0 && 
                       !selectedSize && 
                       !selectedColor)
                    }
                    className="group w-full h-14 px-6 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:shadow-xl hover:from-red-700 hover:to-rose-700 transform hover:-translate-y-0.5 disabled:transform-none"
                  >
                    {isAddingToCart ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner />
                        <span>Adding...</span>
                      </div>
                    ) : !isInStock ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <CartIcon />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <Button
                    onClick={handleBuyNow}
                    disabled={
                      !isInStock || 
                      isAddingToCart || 
                      // Only disable if product has variants but none selected
                      (((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && 
                       variantSelections.length === 0 && 
                       !selectedSize && 
                       !selectedColor)
                    }
                    className="w-full h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none"
                    size="lg"
                  >
                    {!isInStock ? 'Out of Stock' : 'Buy Now'}
                  </Button>
                </>
              )}
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center gap-4 pt-8 border-t border-gray-200">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-3 px-6 py-3.5 border-2 rounded-xl transition-all duration-300 bg-white shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none ${
                  product && (product.stock === 0 || product.stock === undefined)
                    ? (isInWishlist(product._id!) 
                        ? 'border-red-300 bg-red-50 hover:border-red-400 hover:bg-red-100' 
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50')
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                disabled={product && product.stock !== 0 && product.stock !== undefined}
                title={product && (product.stock === 0 || product.stock === undefined) 
                  ? (isInWishlist(product._id!) ? 'In Wishlist' : 'Add to Wishlist') 
                  : 'Wishlist only for out-of-stock items'}
              >
                <HeartIcon filled={product && isInWishlist(product._id!)} />
                <span className={`text-sm font-semibold transition-colors ${
                  product && (product.stock === 0 || product.stock === undefined)
                    ? (isInWishlist(product._id!) 
                        ? 'text-red-700' 
                        : 'text-gray-800')
                    : 'text-gray-500'
                }`}>
                  {product && (product.stock === 0 || product.stock === undefined)
                    ? (isInWishlist(product._id!) ? 'In Wishlist' : 'Add to Wishlist')
                    : 'Wishlist (Out of Stock Only)'
                  }
                </span>
              </button>
              
              <button className="flex items-center gap-3 px-6 py-3.5 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 bg-white shadow-sm hover:shadow-lg transform hover:-translate-y-0.5">
                <ShareIcon />
                <span className="text-sm font-semibold text-gray-800">Share</span>
              </button>
            </div>

          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <nav className="flex space-x-1 px-6">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'ingredients', label: 'Ingredients' },
                  { id: 'shipping', label: 'Shipping & Returns' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-4 px-6 font-semibold text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'text-red-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-rose-600"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="prose prose-sm max-w-none p-8">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
                
                {/* Stock Quantity in Description - SSLCommerz Compliance */}
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Stock Information</h4>
                  {product.stock !== undefined && product.stock > 0 ? (
                    <p className="text-sm text-gray-700">
                      <strong>Available:</strong> {product.stock} {product.stock === 1 ? 'unit' : 'units'} in stock
                    </p>
                  ) : (
                    <p className="text-sm text-red-700">
                      <strong>Status:</strong> Out of Stock (0 units available)
                    </p>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-lg text-gray-900 mb-6">Product Specifications</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stock Quantity */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Stock Quantity</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {product.stock !== undefined && product.stock > 0 
                          ? `${product.stock} ${product.stock === 1 ? 'unit' : 'units'} available`
                          : 'Out of Stock (0 units available)'}
                      </dd>
                    </div>
                    
                    {/* Brand */}
                    {product.brand && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Brand</dt>
                        <dd className="text-sm font-semibold text-gray-900">{product.brand}</dd>
                      </div>
                    )}
                    
                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Available Sizes</dt>
                        <dd className="text-sm font-semibold text-gray-900">{product.sizes.join(', ')}</dd>
                      </div>
                    )}
                    
                    {/* SKU */}
                    {product.sku && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SKU</dt>
                        <dd className="text-sm font-semibold text-gray-900 font-mono">{product.sku}</dd>
                      </div>
                    )}
                    
                    {/* Other attributes (excluding cost and categoryIds) */}
                    {product.attributes && Object.entries(product.attributes)
                      .filter(([key, value]) => {
                        return key !== 'cost' && key !== 'categoryIds' && key !== 'category' && key !== 'subcategory' && value !== undefined && value !== null && String(value) !== '';
                      })
                      .map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm font-semibold text-gray-900">{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-6">
                <h4 className="font-bold text-lg text-gray-900">Key Ingredients</h4>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    Detailed ingredient information will be displayed here. This section typically includes 
                    active ingredients, full INCI list, and any allergen information.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Shipping Information
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Inside Dhaka:</strong> 3-4 day Delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span><strong>Outside Dhaka:</strong> 5 day Delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Express delivery available for urgent orders</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Return Policy
                  </h4>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span>7-day return policy for unopened products</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span>Products must be in original packaging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span>Return shipping costs may apply</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span>Refunds processed within 5-7 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Recommended Products - Optimized with caching */}
        {(recommendedProducts.length > 0 || loadingRecommended) && (
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Recommended for You</h3>
            {loadingRecommended ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((recProduct) => (
                  <Link
                    key={recProduct._id}
                    href={`/products/${recProduct.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                      <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                        {recProduct.images[0] && (
                          <Image
                            src={recProduct.images[0]}
                            alt={recProduct.title}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        {recProduct.isFeatured && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                            Featured
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors">
                        {recProduct.title}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(recProduct.price.amount, recProduct.price.currency)}
                        </p>
                        {recProduct.price.originalAmount && recProduct.price.originalAmount > recProduct.price.amount && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(recProduct.price.originalAmount, recProduct.price.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-4 overflow-hidden">
                      {relatedProduct.images[0] && (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.title}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {relatedProduct.title}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(relatedProduct.price.amount, relatedProduct.price.currency)}
                      </p>
                      {relatedProduct.price.originalAmount && relatedProduct.price.originalAmount > relatedProduct.price.amount && (
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(relatedProduct.price.originalAmount, relatedProduct.price.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Out of Stock Wishlist Modal */}
      {product && showWishlistModal && (
        <OutOfStockWishlistModal
          product={product}
          isOpen={showWishlistModal}
          onClose={() => setShowWishlistModal(false)}
          onSuccess={() => {
            setShowWishlistModal(false);
            // The wishlist context will automatically update
          }}
        />
      )}
    </div>
  );
}

// Icon Components
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}


function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2"
      className={filled ? "text-red-700" : "text-gray-700"}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}


function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
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

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-4 bg-gray-300 rounded w-12" />
            <div className="h-4 bg-gray-300 rounded w-1" />
            <div className="h-4 bg-gray-300 rounded w-16" />
            <div className="h-4 bg-gray-300 rounded w-1" />
            <div className="h-4 bg-gray-300 rounded w-24" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-300 rounded-lg" />
              <div className="flex space-x-2">
                <div className="w-20 h-20 bg-gray-300 rounded-lg" />
                <div className="w-20 h-20 bg-gray-300 rounded-lg" />
                <div className="w-20 h-20 bg-gray-300 rounded-lg" />
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
              {/* Brand & Stock status */}
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-300 rounded w-20" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <div className="h-4 bg-gray-300 rounded w-16" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 rounded w-4/5" />
                <div className="h-8 bg-gray-300 rounded w-3/5" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-300 rounded" />
                  ))}
                </div>
                <div className="h-4 bg-gray-300 rounded w-24" />
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <div className="h-8 bg-gray-300 rounded w-24" />
                <div className="h-6 bg-gray-300 rounded w-20" />
                <div className="h-6 bg-gray-300 rounded w-16" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-4 bg-gray-300 rounded w-full" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-16" />
                  <div className="flex flex-wrap gap-3">
                    <div className="h-12 bg-gray-300 rounded-lg w-20" />
                    <div className="h-12 bg-gray-300 rounded-lg w-20" />
                    <div className="h-12 bg-gray-300 rounded-lg w-20" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-20" />
                  <div className="flex flex-wrap gap-3">
                    <div className="h-12 bg-gray-300 rounded-lg w-20" />
                    <div className="h-12 bg-gray-300 rounded-lg w-20" />
                    <div className="h-12 bg-gray-300 rounded-lg w-20" />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <div className="h-5 bg-gray-300 rounded w-20" />
                <div className="h-12 bg-gray-300 rounded-lg w-32" />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-300 rounded-lg" />
                <div className="h-12 bg-gray-300 rounded-lg" />
              </div>

              {/* Wishlist & Share */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="h-12 bg-gray-300 rounded-lg w-32" />
                <div className="h-12 bg-gray-300 rounded-lg w-24" />
              </div>
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="mb-16">
            <div className="border-b border-gray-200 mb-8">
              <div className="-mb-px flex space-x-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-300 rounded w-20" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full" />
              <div className="h-4 bg-gray-300 rounded w-full" />
              <div className="h-4 bg-gray-300 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}