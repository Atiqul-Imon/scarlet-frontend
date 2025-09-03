'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600 mt-1">
                Add a new product to your store
              </p>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
