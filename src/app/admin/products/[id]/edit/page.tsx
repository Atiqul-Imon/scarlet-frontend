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
import type { AdminProduct } from '@/lib/admin-types';

// Import the form component from the new product page
// In a real app, you'd extract this into a shared component
import NewProductPage from '../../new/page';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="p-6">
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
                href={`/admin/products/${product.id}`}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-1">
                  Update "{product.name}"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Product Information</h2>
            <p className="text-gray-600 text-sm">
              Update your product details, pricing, inventory, and more.
            </p>
          </div>

          {/* Quick Edit Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                defaultValue={product.name}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (৳)
              </label>
              <input
                type="number"
                defaultValue={product.price}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                defaultValue={product.stock}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                defaultValue={product.sku}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                defaultValue={product.status}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                defaultValue={product.category}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="Makeup">Makeup</option>
                <option value="Skincare">Skincare</option>
                <option value="Bath & Body">Bath & Body</option>
                <option value="Fragrance">Fragrance</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              defaultValue={product.shortDescription}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Description
            </label>
            <textarea
              rows={6}
              defaultValue={product.description}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/admin/products/${product.id}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  // Save as draft
                  addToast({
                    type: 'success',
                    title: 'Draft saved',
                    message: 'Your changes have been saved as draft.',
                  });
                }}
              >
                Save Draft
              </Button>
              
              <Button
                variant="primary"
                onClick={() => {
                  // Save and publish
                  addToast({
                    type: 'success',
                    title: 'Product updated',
                    message: 'The product has been updated successfully.',
                  });
                  router.push(`/admin/products/${product.id}`);
                }}
              >
                Update Product
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Edit Options */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={`/admin/products/${product.id}/images`}
              className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-center"
            >
              <div className="text-pink-600 font-medium">Manage Images</div>
              <div className="text-sm text-gray-500 mt-1">Upload and organize product photos</div>
            </Link>
            
            <Link
              href={`/admin/products/${product.id}/variants`}
              className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-center"
            >
              <div className="text-pink-600 font-medium">Manage Variants</div>
              <div className="text-sm text-gray-500 mt-1">Add colors, sizes, and other options</div>
            </Link>
            
            <Link
              href={`/admin/products/${product.id}/seo`}
              className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-center"
            >
              <div className="text-pink-600 font-medium">SEO Settings</div>
              <div className="text-sm text-gray-500 mt-1">Optimize for search engines</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
