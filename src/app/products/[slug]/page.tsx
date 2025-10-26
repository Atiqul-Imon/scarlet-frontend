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



export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { isInWishlist } = useWishlist();
  const slug = params['slug'] as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [showWishlistModal, setShowWishlistModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('description');
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);

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
        setProduct(product);
        setLoading(false);
        
        // Fetch related products asynchronously after main product loads
        if (product.categoryIds && product.categoryIds.length > 0) {
          // Don't await this - let it load in background
          fetch(`/api/proxy/catalog/products/category/${product.categoryIds[0]}`)
            .then(categoryResponse => {
              if (categoryResponse.ok) {
                return categoryResponse.json();
              }
              return null;
            })
            .then(categoryData => {
              if (categoryData?.success && categoryData.data) {
                const related: Product[] = categoryData.data
                  .filter((p: Product) => p.slug !== slug && p._id !== product._id)
                  .slice(0, 3);
                setRelatedProducts(related);
              }
            })
            .catch(() => {
              // Silently fail for related products
            });
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
    
    console.log('Adding to cart - Product ID:', product._id, 'Quantity:', quantity);
    setIsAddingToCart(true);
    try {
      await addItem(product._id!, quantity);
      console.log('Successfully added to cart:', product._id);
      
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
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
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

  const formatPrice = (amount: number, currency: string = 'BDT') => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateDiscountPercentage = (originalPrice: number, salePrice: number) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    return product.price.amount;
  };

  const isInStock = () => {
    if (!product) return false;
    
    // Check main stock
    if (product.stock !== undefined && product.stock <= 0) return false;
    
    return true;
  };


  console.log('Loading state:', loading, 'Product:', product, 'Error:', error);
  
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

  const currentPrice = getCurrentPrice();
  const stockStatus = isInStock();
  const hasDiscount = product.price.originalAmount && product.price.originalAmount > product.price.amount;

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
          <Link href="/" className="hover:text-red-700 transition-colors">Home</Link>
          <ChevronRightIcon />
          <Link href="/products" className="hover:text-red-700 transition-colors">Products</Link>
          <ChevronRightIcon />
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Images */}
          <div>
            <ProductGallery images={product.images} productTitle={product.title} />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Brand & Availability */}
            <div className="flex items-center justify-between">
              {product.brand && (
                <Link 
                  href={`/brands/${product.brand.toLowerCase()}`} 
                  className="text-sm text-red-700 hover:text-red-800 font-medium transition-colors"
                >
                  {product.brand}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stockStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={`text-sm font-medium ${stockStatus ? 'text-green-600' : 'text-red-600'}`}>
                  {stockStatus ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>


            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice, product.price.currency)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price.originalAmount!, product.price.currency)}
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    {calculateDiscountPercentage(product.price.originalAmount!, product.price.amount)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Quick Description */}
            {product.description && (
              <p className="text-gray-700 leading-relaxed">
                {product.description.substring(0, 200)}
                {product.description.length > 200 && '...'}
              </p>
            )}



            {/* Stock Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stockStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${stockStatus ? 'text-green-600' : 'text-red-600'}`}>
                    {stockStatus ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Stock Quantity:</span> {product.stock || 0} units available
                </div>
              </div>
              {product.stock && product.stock <= 10 && product.stock > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-orange-700 font-semibold bg-orange-100 px-3 py-1 rounded-full">
                    Only {product.stock} left in stock!
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {stockStatus && (
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-base font-semibold text-gray-900">
                  Quantity:
                </label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock || 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-0 focus:ring-0 py-3 text-base font-semibold text-gray-900 bg-white"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                    disabled={quantity >= (product.stock || 999)}
                    aria-label="Increase quantity"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!stockStatus || isAddingToCart}
                className="w-full h-12 px-6 text-base font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  minHeight: '48px'
                }}
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    Adding...
                  </div>
                ) : !stockStatus ? (
                  'Out of Stock'
                ) : (
                  <>
                    <CartIcon />
                    Add to Cart
                  </>
                )}
              </button>

              <Button
                onClick={handleBuyNow}
                disabled={!stockStatus || isAddingToCart}
                className="w-full"
                size="lg"
              >
                {!stockStatus ? 'Out of Stock' : 'Buy Now'}
              </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-3 px-6 py-3 border-2 rounded-lg transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                  product && (product.stock === 0 || product.stock === undefined)
                    ? (isInWishlist(product._id!) 
                        ? 'border-red-300 hover:border-red-400 bg-red-50' 
                        : 'border-gray-300 hover:border-red-400 hover:bg-red-50')
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-not-allowed opacity-60'
                }`}
                disabled={product && product.stock !== 0 && product.stock !== undefined}
                title={product && (product.stock === 0 || product.stock === undefined) 
                  ? (isInWishlist(product._id!) ? 'In Wishlist' : 'Add to Wishlist') 
                  : 'Wishlist only for out-of-stock items'}
              >
                <HeartIcon filled={product && isInWishlist(product._id!)} />
                <span className={`text-sm font-semibold ${
                  product && (product.stock === 0 || product.stock === undefined)
                    ? (isInWishlist(product._id!) 
                        ? 'text-red-700' 
                        : 'text-gray-800 hover:text-red-700')
                    : 'text-gray-500'
                }`}>
                  {product && (product.stock === 0 || product.stock === undefined)
                    ? (isInWishlist(product._id!) ? 'In Wishlist' : 'Add to Wishlist')
                    : 'Wishlist (Out of Stock Only)'
                  }
                </span>
              </button>
              
              <button className="flex items-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                <ShareIcon />
                <span className="text-sm font-semibold text-gray-800 hover:text-gray-700">Share</span>
              </button>
            </div>

          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'ingredients', label: 'Ingredients' },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="prose prose-sm max-w-none">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Product Specifications</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand */}
                    {product.brand && (
                      <div className="border-b border-gray-100 pb-2">
                        <dt className="text-sm font-medium text-gray-500">Brand</dt>
                        <dd className="text-sm text-gray-900 mt-1">{product.brand}</dd>
                      </div>
                    )}
                    
                    {/* SKU */}
                    {product.sku && (
                      <div className="border-b border-gray-100 pb-2">
                        <dt className="text-sm font-medium text-gray-500">SKU</dt>
                        <dd className="text-sm text-gray-900 mt-1">{product.sku}</dd>
                      </div>
                    )}
                    
                    {/* Stock */}
                    {product.stock !== undefined && (
                      <div className="border-b border-gray-100 pb-2">
                        <dt className="text-sm font-medium text-gray-500">Stock</dt>
                        <dd className="text-sm text-gray-900 mt-1">{product.stock} units</dd>
                      </div>
                    )}
                    
                    {/* Other attributes (excluding cost and categoryIds) */}
                    {product.attributes && Object.entries(product.attributes)
                      .filter(([key, value]) => {
                        return key !== 'cost' && key !== 'categoryIds' && key !== 'category' && key !== 'subcategory' && value !== undefined && value !== null && String(value) !== '';
                      })
                      .map(([key, value]) => (
                        <div key={key} className="border-b border-gray-100 pb-2">
                          <dt className="text-sm font-medium text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm text-gray-900 mt-1">{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Key Ingredients</h4>
                <p className="text-gray-700">
                  Detailed ingredient information will be displayed here. This section typically includes 
                  active ingredients, full INCI list, and any allergen information.
                </p>
              </div>
            )}


            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Shipping Information</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Free delivery on orders above ৳500 within Dhaka</li>
                    <li>• Standard delivery: 2-3 business days in Dhaka</li>
                    <li>• Outside Dhaka: 3-5 business days</li>
                    <li>• Express delivery available for urgent orders</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Return Policy</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 7-day return policy for unopened products</li>
                    <li>• Products must be in original packaging</li>
                    <li>• Return shipping costs may apply</li>
                    <li>• Refunds processed within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {relatedProduct.images[0] && (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.title}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.title}
                    </h4>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(relatedProduct.price.amount, relatedProduct.price.currency)}
                    </p>
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