'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/context';
import { adminApi } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';
import type { AdminProduct } from '@/lib/admin-types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const productId = params.id as string;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const productData = await adminApi.products.getProduct(productId);
      setProduct(productData);
    } catch (error) {
      console.error('Failed to load product:', error);
      addToast({
        type: 'error',
        title: 'Failed to load product',
        message: 'Could not load product data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await adminApi.products.deleteProduct(productId);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
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
                href={`/admin/products/${productId}`}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-1">
                  Update "{product.title || product.name}"
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2 inline" />
                Delete Product
              </button>
            </div>
          </div>
        </div>

        {/* Product Edit Form */}
        <ProductForm
          productId={productId}
          mode="edit"
        />
      </div>
    </div>
  );
}
