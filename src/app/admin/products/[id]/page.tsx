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
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/api';
import type { AdminProduct } from '@/lib/admin-types';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await adminApi.products.getProduct(params.id as string);
        console.log('Product data received:', {
          id: productData._id,
          title: productData.title,
          imagesCount: productData.images?.length || 0,
          images: productData.images,
          hasImages: productData.images && productData.images.length > 0
        });
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await adminApi.products.deleteProduct(product._id);
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
      // Create a copy of the product with a new title and slug
      const duplicateData = {
        ...product,
        title: `${product.title} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
      };
      
      await adminApi.products.createProduct(duplicateData);
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
    // Calculate effective stock: use variant stock if it exists and has values, otherwise use main stock
    let effectiveStock = product.stock || 0;
    
    // If product has variantStock, calculate total variant stock
    if (product.variantStock && typeof product.variantStock === 'object') {
      const totalVariantStock = Object.values(product.variantStock).reduce(
        (sum: number, stock: number) => sum + (stock || 0), 
        0
      );
      
      // Use variant stock if it has values (> 0), otherwise keep using main stock
      if (totalVariantStock > 0) {
        effectiveStock = totalVariantStock;
      }
    }
    
    if (effectiveStock === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Out of Stock
        </span>
      );
    }
    
    if (effectiveStock <= 10) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Error loading product</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
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
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
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
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  {getStockStatusBadge(product)}
                  <span className="text-sm text-gray-500">
                    ID: {product._id}
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
                href={`/admin/products/${product._id}/edit`}
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
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[activeImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === activeImageIndex
                            ? 'border-red-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
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
                    {product.price.currency} {product.price.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock</span>
                  <span className="font-medium text-gray-900">
                    {(() => {
                      // Calculate effective stock (considering variant stock)
                      let effectiveStock = product.stock || 0;
                      if (product.variantStock && typeof product.variantStock === 'object') {
                        const totalVariantStock = Object.values(product.variantStock).reduce(
                          (sum: number, stock: number) => sum + (stock || 0), 
                          0
                        );
                        if (totalVariantStock > 0) {
                          effectiveStock = totalVariantStock;
                        }
                      }
                      return effectiveStock;
                    })()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Brand</span>
                  <span className="font-medium text-gray-900">{product.brand || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categories</span>
                  <span className="font-medium text-gray-900">{product.categoryIds.length}</span>
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
              {product.description ? (
                product.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>
            
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Attributes</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-3 py-1 bg-red-100 text-red-900 text-sm rounded-full"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID</span>
                  <span className="text-gray-900 font-mono">{product._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slug</span>
                  <span className="text-gray-900">{product.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand</span>
                  <span className="text-gray-900">{product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories</span>
                  <span className="text-gray-900">{product.categoryIds.length} categories</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Images</span>
                  <span className="text-gray-900">{product.images.length} images</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock</span>
                  <span className="text-gray-900">
                    {(() => {
                      // Calculate effective stock (considering variant stock)
                      let effectiveStock = product.stock || 0;
                      if (product.variantStock && typeof product.variantStock === 'object') {
                        const totalVariantStock = Object.values(product.variantStock).reduce(
                          (sum: number, stock: number) => sum + (stock || 0), 
                          0
                        );
                        if (totalVariantStock > 0) {
                          effectiveStock = totalVariantStock;
                        }
                      }
                      return effectiveStock;
                    })()} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="text-gray-900">
                    {product.price.currency} {product.price.amount?.toLocaleString() || '0'}
                  </span>
                </div>
                {product.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {product.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
