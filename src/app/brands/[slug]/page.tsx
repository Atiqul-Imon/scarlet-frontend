"use client";
import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, StarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { brandApi } from '../../../lib/api';
import type { Brand } from '../../../lib/types';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  category: string;
}


// Mock products data - in a real app, this would come from an API
const mockProducts: Record<string, Product[]> = {
  'skin-care': [
    {
      _id: '1',
      name: 'Hydrating Facial Cleanser',
      price: 24.99,
      originalPrice: 29.99,
      image: '/images/products/cleanser.jpg',
      inStock: true,
      category: 'Cleansers'
    },
    {
      _id: '2',
      name: 'Anti-Aging Night Cream',
      price: 49.99,
      image: '/images/products/night-cream.jpg',
      inStock: true,
      category: 'Moisturizers'
    }
  ],
  'hair-band': [
    {
      _id: '3',
      name: 'Color Protection Shampoo',
      price: 18.99,
      image: '/images/products/shampoo.jpg',
      inStock: true,
      category: 'Shampoo'
    }
  ],
  'make-up': [
    {
      _id: '4',
      name: 'Matte Foundation',
      price: 32.99,
      image: '/images/products/foundation.jpg',
      inStock: true,
      category: 'Foundation'
    }
  ]
};

export default function BrandPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [brandInfo, setBrandInfo] = React.useState<Brand | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBrandData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const brand = await brandApi.getBrandBySlug(slug);
        setBrandInfo(brand);
        
        // For now, use mock products - in a real app, this would be an API call
        setProducts(mockProducts[slug] || []);
      } catch (err) {
        console.error('Error fetching brand:', err);
        setError('Failed to load brand information');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (error || !brandInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Brand' : 'Brand Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The brand you're looking for doesn't exist."}
          </p>
          <Link
            href="/brands"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Browse All Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-herlan py-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-pink-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-pink-600 transition-colors">Brands</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{brandInfo.name}</span>
          </nav>

          {/* Back Button */}
          <Link
            href="/brands"
            className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Brands
          </Link>

          {/* Brand Header */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Brand Logo/Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-pink-600">
                {brandInfo.name.charAt(0)}
              </span>
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {brandInfo.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{brandInfo.description}</p>
              
              {/* Brand Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  {brandInfo.category}
                </span>
                {brandInfo.establishedYear && (
                  <span>Est. {brandInfo.establishedYear}</span>
                )}
                {brandInfo.origin && (
                  <span>From {brandInfo.origin}</span>
                )}
                <span>{brandInfo.productCount} Products</span>
              </div>

              {/* Specialties */}
              {brandInfo.specialties && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Specialties:</h3>
                  <div className="flex flex-wrap gap-2">
                    {brandInfo.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {brandInfo.about && (
        <div className="bg-white border-b border-gray-200">
          <div className="container-herlan py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About {brandInfo.name}</h2>
            <p className="text-gray-600 leading-relaxed">{brandInfo.about}</p>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container-herlan py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products by {brandInfo.name}
          </h2>
          <span className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${products.length} products`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600 mb-6">
              This brand doesn't have any products available at the moment.
            </p>
            <Link
              href="/products"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🛍️</span>
                </div>

                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    product.inStock
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-white border-t border-gray-200">
        <div className="container-herlan py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Explore More Brands
            </h2>
            <p className="text-gray-600 mb-6">
              Discover other amazing beauty brands in our collection.
            </p>
            <Link
              href="/brands"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              View All Brands
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
