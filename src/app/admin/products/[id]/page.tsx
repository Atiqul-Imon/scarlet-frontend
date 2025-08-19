'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import type { AdminProduct } from '@/lib/admin-types';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    // Mock product data - in real app, fetch from API
    const mockProduct: AdminProduct = {
      id: params.id as string,
      name: 'Luxury Rose Gold Lipstick',
      slug: 'luxury-rose-gold-lipstick',
      description: 'Experience the ultimate in luxury with our Rose Gold Lipstick collection. This premium matte formula delivers intense color payoff with a comfortable, long-lasting finish that won\'t dry out your lips.\n\nKey Features:\n• Long-lasting matte formula\n• Highly pigmented colors\n• Comfortable wear for up to 8 hours\n• Enriched with vitamin E and jojoba oil\n• Cruelty-free and paraben-free\n• Available in 12 stunning shades',
      shortDescription: 'Premium matte lipstick with long-lasting formula and intense color payoff',
      price: 2500,
      comparePrice: 3000,
      cost: 1200,
      sku: 'LIP-RG-001',
      barcode: '1234567890123',
      category: 'Makeup',
      subcategory: 'Lipstick',
      brand: 'Scarlet Beauty',
      tags: ['lipstick', 'matte', 'luxury', 'rose gold', 'long-lasting', 'cruelty-free'],
      images: [
        '/api/placeholder/600/600',
        '/api/placeholder/600/600',
        '/api/placeholder/600/600',
        '/api/placeholder/600/600'
      ],
      variants: [
        { id: '1a', name: 'Crimson Rose', sku: 'LIP-RG-001-CR', stock: 45, price: 2500 },
        { id: '1b', name: 'Nude Pink', sku: 'LIP-RG-001-NP', stock: 23, price: 2500 },
        { id: '1c', name: 'Berry Blush', sku: 'LIP-RG-001-BB', stock: 67, price: 2500 },
        { id: '1d', name: 'Coral Dream', sku: 'LIP-RG-001-CD', stock: 12, price: 2500 },
      ],
      stock: 147,
      lowStockThreshold: 20,
      trackInventory: true,
      status: 'active',
      stockStatus: 'in_stock',
      weight: 0.05,
      dimensions: { length: 10, width: 2, height: 2 },
      seoTitle: 'Luxury Rose Gold Lipstick - Premium Matte Formula | Scarlet Beauty',
      seoDescription: 'Discover our premium matte lipstick collection with long-lasting formula and intense color payoff. Available in 12 stunning shades.',
      seoKeywords: ['lipstick', 'matte', 'luxury', 'cosmetics', 'rose gold', 'beauty'],
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-18T14:30:00Z',
      salesCount: 156,
      viewCount: 2340,
      rating: 4.8,
      reviewCount: 23,
    };

    setTimeout(() => {
      setProduct(mockProduct);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        // await adminApi.products.delete(product.id);
        addToast({
          type: 'success',
          title: 'Product deleted',
          message: 'The product has been deleted successfully.',
        });
        router.push('/admin/products');
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Delete failed',
          message: 'Failed to delete product. Please try again.',
        });
      }
    }
  };

  const handleDuplicate = async () => {
    if (!product) return;
    
    try {
      // await adminApi.products.duplicate(product.id);
      addToast({
        type: 'success',
        title: 'Product duplicated',
        message: 'The product has been duplicated successfully.',
      });
      router.push('/admin/products');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Duplication failed',
        message: 'Failed to duplicate product. Please try again.',
      });
    }
  };

  const getStockStatusBadge = (product: AdminProduct) => {
    const { stockStatus, stock, lowStockThreshold } = product;
    
    if (stockStatus === 'out_of_stock' || stock === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Out of Stock
        </span>
      );
    }
    
    if (stockStatus === 'low_stock' || stock <= lowStockThreshold) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Low Stock
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="w-4 h-4 mr-1" />
        In Stock
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      archived: { bg: 'bg-red-100', text: 'text-red-800', label: 'Archived' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/products"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  {getStatusBadge(product.status)}
                  {getStockStatusBadge(product)}
                  <span className="text-sm text-gray-500">
                    SKU: {product.sku}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Live
              </Link>
              <button
                onClick={handleDuplicate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Duplicate
              </button>
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === activeImageIndex
                            ? 'border-pink-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-medium text-gray-900">
                    ৳{product.price.toLocaleString()}
                  </span>
                </div>
                
                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Compare Price</span>
                    <span className="text-sm text-gray-500 line-through">
                      ৳{product.comparePrice.toLocaleString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock</span>
                  <span className="font-medium text-gray-900">{product.stock}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sales</span>
                  <span className="font-medium text-gray-900">{product.salesCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-medium text-gray-900">{product.viewCount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-medium text-gray-900">
                      {((product.salesCount / product.viewCount) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(product.salesCount / product.viewCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Profit Margin</span>
                    <span className="font-medium text-gray-900">
                      {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${((product.price - product.cost) / product.price) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                  <div className="text-lg font-bold text-green-600">
                    ৳{(product.price * product.salesCount).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Profit</div>
                  <div className="text-lg font-bold text-blue-600">
                    ৳{((product.price - product.cost) * product.salesCount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <ChartBarIcon className="w-4 h-4 mr-3 text-gray-400" />
                  View Analytics
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <ShoppingCartIcon className="w-4 h-4 mr-3 text-gray-400" />
                  View Orders
                </button>
                <button className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <HeartIcon className="w-4 h-4 mr-3 text-gray-400" />
                  View Reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Product Description</h3>
            <div className="prose prose-sm max-w-none">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {product.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variants & Stock */}
          <div className="space-y-6">
            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4">Product Variants</h3>
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{variant.name}</div>
                        <div className="text-sm text-gray-500">SKU: {variant.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          ৳{variant.price.toLocaleString()}
                        </div>
                        <div className={`text-sm ${
                          variant.stock > 20 ? 'text-green-600' : 
                          variant.stock > 0 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          Stock: {variant.stock}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subcategory</span>
                  <span className="text-gray-900">{product.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="text-gray-900">{product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span className="text-gray-900">{product.weight}kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dimensions</span>
                  <span className="text-gray-900">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Barcode</span>
                  <span className="text-gray-900 font-mono">{product.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
