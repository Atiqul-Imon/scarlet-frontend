'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/orders"
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Order</h1>
          </div>
        </div>

        {/* Feature Notice */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Order Editing Not Available
            </h2>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Direct order editing is currently disabled. You can update order status, add notes, 
              and process refunds from the order details page.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href={`/admin/orders/${params.id}`}
                className="inline-flex items-center px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                View Order Details
              </Link>
              <Link
                href="/admin/orders"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                What you can do instead
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Update order status (pending, confirmed, processing, delivered, refunded)</li>
                <li>Add internal notes for order tracking</li>
                <li>Process refunds for delivered or cancelled orders</li>
                <li>Print invoices for customer records</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
