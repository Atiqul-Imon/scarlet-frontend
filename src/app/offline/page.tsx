"use client";
import Link from 'next/link';
import { TouchButton } from '@/components/ui';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
          </div>
        </div>

        {/* Offline Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          It looks like you're not connected to the internet. Don't worry, you can still browse some of our content that's been saved for offline viewing.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <TouchButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => window.location.reload()}
          >
            Try Again
          </TouchButton>
          
          <Link href="/">
            <TouchButton
              variant="outline"
              size="lg"
              fullWidth
            >
              Go to Homepage
            </TouchButton>
          </Link>
        </div>

        {/* Offline Features */}
        <div className="mt-12 text-left">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Offline
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Browse saved products</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">View your cart</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Check your wishlist</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Add items to cart (syncs when online)</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">No internet connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
