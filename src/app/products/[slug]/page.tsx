"use client";
import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '../../../components/products/ProductGallery';
import { Button } from '../../../components/ui/button';
import { fetchJson } from '../../../lib/api';
import { Product } from '../../../lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  // Fetch product data
  React.useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual product by slug endpoint
        const products = await fetchJson<Product[]>('/catalog/products');
        const foundProduct = products.find(p => p.slug === slug);
        
        if (!foundProduct) {
          setError('Product not found');
          return;
        }
        
        setProduct(foundProduct);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      // TODO: Implement add to cart API call
      console.log('Adding to cart:', { productId: product._id, quantity });
      // await fetchJson('/cart/items', {
      //   method: 'POST',
      //   body: JSON.stringify({ productId: product._id, quantity })
      // });
      
      // Show success message or update cart count
      alert('Product added to cart!'); // Replace with proper toast notification
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart'); // Replace with proper error handling
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
    console.log('Wishlist toggled:', { productId: product?._id, wishlisted: !isWishlisted });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <ErrorIcon />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-pink-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-pink-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <ProductGallery images={product.images} productTitle={product.title} />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <div className="text-sm text-gray-600">
                <Link href={`/brands/${product.brand.toLowerCase()}`} className="hover:text-pink-600">
                  {product.brand}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price.amount, product.price.currency)}
              </span>
              {/* TODO: Add sale price logic */}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                {product.stock && product.stock <= 10 && product.stock > 0 && (
                  <span className="text-orange-600"> - Only {product.stock} left!</span>
                )}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock || 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                    disabled={quantity >= (product.stock || 999)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1"
                size="lg"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    Adding to Cart...
                  </div>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </Button>

              <button
                onClick={handleWishlistToggle}
                className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-colors"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <HeartIcon filled={isWishlisted} />
              </button>
            </div>

            {/* Product Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <dl className="space-y-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex">
                      <dt className="text-sm font-medium text-gray-500 w-1/3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </dt>
                      <dd className="text-sm text-gray-900 w-2/3">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Shipping & Returns Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <ShippingIcon />
                <span className="text-sm text-gray-700">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3">
                <ReturnIcon />
                <span className="text-sm text-gray-700">30-day return policy</span>
              </div>
              <div className="flex items-center gap-3">
                <SecurityIcon />
                <span className="text-sm text-gray-700">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-1" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-1" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200 rounded-lg" />
            
            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
      className={filled ? "text-pink-500" : "text-gray-600"}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
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

function ShippingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
      <path d="M16 3h5v5"/>
      <path d="M8 3H3v5"/>
      <path d="M12 22V8"/>
      <path d="M8 18h8"/>
      <path d="M8 14h8"/>
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
      <path d="M8 21l4-4 4 4"/>
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}
