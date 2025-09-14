"use client";
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductGallery from '../../../components/products/ProductGallery';
import { Button } from '../../../components/ui/button';
import { Product } from '../../../lib/types';
import { useAuth, useCart, useToast } from '../../../lib/context';

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
}

interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const slug = params['slug'] as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariants, setSelectedVariants] = React.useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('description');
  const [reviews, setReviews] = React.useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);

  // Mock data for demonstration - Replace with real API calls
  const mockVariants: Record<string, ProductVariant[]> = {
    size: [
      { id: '1', name: 'size', value: '30ml', stock: 10 },
      { id: '2', name: 'size', value: '50ml', price: 50, stock: 5 },
      { id: '3', name: 'size', value: '100ml', price: 100, stock: 8 }
    ],
    shade: [
      { id: '4', name: 'shade', value: 'Fair', stock: 15 },
      { id: '5', name: 'shade', value: 'Medium', stock: 12 },
      { id: '6', name: 'shade', value: 'Dark', stock: 7 }
    ]
  };

  const mockReviews: ProductReview[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Fatima Rahman',
      rating: 5,
      comment: 'অসাধারণ প্রোডাক্ট! আমার ত্বকে খুবই ভালো কাজ করেছে। দাম অনুযায়ী কোয়ালিটি চমৎকার।',
      date: '2024-01-15',
      verified: true
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Nusrat Jahan',
      rating: 4,
      comment: 'Very good product quality. Fast delivery and authentic product. Highly recommended!',
      date: '2024-01-10',
      verified: true
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Sadia Akter',
      rating: 5,
      comment: 'Perfect for sensitive skin. No irritation at all. Will definitely repurchase.',
      date: '2024-01-05',
      verified: false
    }
  ];

  // Fetch product data
  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching product from API for slug:', slug);
        
        // Fetch product from the real API
        const response = await fetch(`/api/proxy/catalog/products/${slug}`);
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
        console.log('Product loaded from API:', product);
        setProduct(product);
        setReviews(mockReviews); // Keep mock reviews for now
        
        // Fetch related products from the same category
        if (product.categoryIds && product.categoryIds.length > 0) {
          try {
            const categoryResponse = await fetch(`/api/proxy/catalog/products/category/${product.categoryIds[0]}`);
            if (categoryResponse.ok) {
              const categoryData = await categoryResponse.json();
              if (categoryData.success && categoryData.data) {
                const related: Product[] = categoryData.data
                  .filter((p: Product) => p.slug !== slug && p._id !== product._id)
                  .slice(0, 3);
                setRelatedProducts(related);
              }
            }
          } catch (err) {
            console.warn('Failed to fetch related products:', err);
            // Continue without related products
          }
        }
        
        setLoading(false);
        
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
        message: 'Please login to add items to wishlist'
      });
      router.push('/login');
      return;
    }
    
    try {
      setIsWishlisted(!isWishlisted);
      // TODO: Implement wishlist API call
      addToast({
        type: 'success',
        title: isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
        message: isWishlisted ? 'Item removed from wishlist' : 'Item added to wishlist'
      });
    } catch (error) {
      console.error('Error updating wishlist:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update wishlist'
      });
    }
  };

  const formatPrice = (amount: number, currency: string = 'BDT') => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('bn-BD')}`;
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
    let basePrice = product.price.amount;
    
    // Add variant price modifications
    Object.entries(selectedVariants).forEach(([variantType, variantValue]) => {
      const variant = mockVariants[variantType]?.find(v => v.value === variantValue);
      if (variant?.price) {
        basePrice += variant.price;
      }
    });
    
    return basePrice;
  };

  const isInStock = () => {
    if (!product) return false;
    
    // Check main stock
    if (product.stock !== undefined && product.stock <= 0) return false;
    
    // Check variant stock
    for (const [variantType, variantValue] of Object.entries(selectedVariants)) {
      const variant = mockVariants[variantType]?.find(v => v.value === variantValue);
      if (variant && variant.stock !== undefined && variant.stock <= 0) {
        return false;
      }
    }
    
    return true;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  console.log('Loading state:', loading, 'Product:', product, 'Error:', error);
  
  // Show loading skeleton while fetching data
  if (loading) {
    return <ProductDetailSkeleton />;
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
  const averageRating = getAverageRating();
  const hasDiscount = product.price.originalAmount && product.price.originalAmount > product.price.amount;

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container-herlan py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
          <ChevronRightIcon />
          <Link href="/products" className="hover:text-pink-600 transition-colors">Products</Link>
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
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
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

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      filled={i < Math.floor(averageRating)} 
                      halfFilled={i === Math.floor(averageRating) && averageRating % 1 >= 0.5}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}

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

            {/* Variants */}
            {Object.entries(mockVariants).map(([variantType, variants]) => (
              <div key={variantType} className="space-y-3">
                <label className="block text-base font-semibold text-gray-900 capitalize">
                  {variantType}:
                </label>
                <div className="flex flex-wrap gap-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variantType]: variant.value }))}
                      className={`px-4 py-3 border-2 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[80px] ${
                        selectedVariants[variantType] === variant.value
                          ? 'border-pink-500 bg-pink-500 text-white shadow-md'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-pink-400 hover:bg-pink-50 hover:text-pink-700'
                      } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : ''}`}
                      disabled={variant.stock === 0}
                    >
                      <span className="block">{variant.value}</span>
                      {variant.stock === 0 && <span className="text-xs">(Out of Stock)</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}


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
                {product.stock && product.stock <= 10 && (
                  <span className="text-sm text-orange-700 font-semibold bg-orange-100 px-3 py-1 rounded-full">
                    Only {product.stock} left!
                  </span>
                )}
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
                className="flex items-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              >
                <HeartIcon filled={isWishlisted} />
                <span className="text-sm font-semibold text-gray-800 hover:text-pink-700">
                  {isWishlisted ? 'Saved' : 'Save for Later'}
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
                { id: 'reviews', label: `Reviews (${reviews.length})` },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
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
                {product.attributes && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Product Specifications</h4>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.attributes).map(([key, value]) => (
                        <div key={key} className="border-b border-gray-100 pb-2">
                          <dt className="text-sm font-medium text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </dt>
                          <dd className="text-sm text-gray-900 mt-1">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
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

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Customer Reviews</h4>
                  {user && (
                    <Button size="sm" variant="ghost">
                      Write a Review
                    </Button>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} filled={i < review.rating} />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">{review.userName}</span>
                          {review.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
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

function StarIcon({ filled = false, halfFilled = false }: { filled?: boolean; halfFilled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-yellow-400">
      <defs>
        <linearGradient id="half-fill">
          <stop offset="50%" stopColor="currentColor"/>
          <stop offset="50%" stopColor="transparent"/>
        </linearGradient>
      </defs>
      <path
        fill={filled ? "currentColor" : halfFilled ? "url(#half-fill)" : "none"}
        stroke="currentColor"
        strokeWidth="1"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
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
      className={filled ? "text-pink-600" : "text-gray-700"}
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