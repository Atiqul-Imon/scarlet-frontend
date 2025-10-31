"use client";
import * as React from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  itemCount: number;
  onCheckout: () => void;
  isLoading?: boolean;
  freeShippingThreshold?: number;
  needsAuth?: boolean;
  formatPrice?: (amount: number) => string;
}

export default function CartSummary({
  subtotal,
  shipping: _shipping, // Keep for interface compatibility but not used
  total,
  currency,
  itemCount,
  onCheckout,
  isLoading = false,
  freeShippingThreshold: _freeShippingThreshold, // Keep for interface compatibility but not used
  needsAuth: _needsAuth, // Keep for interface compatibility but not used
  formatPrice: customFormatPrice
}: CartSummaryProps) {
  const formatPrice = customFormatPrice || ((amount: number) => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
      
      {/* Order Details */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-gray-900 text-right">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="border-t pt-3 sm:pt-4">
          <div className="flex justify-between">
            <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
            <span className="text-base sm:text-lg font-semibold text-gray-900 text-right">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0}
        className="w-full mb-3 sm:mb-4"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            <span className="hidden sm:inline">Processing...</span>
            <span className="sm:hidden">...</span>
          </div>
        ) : (
          <>
            <span className="hidden sm:inline">Proceed to Checkout</span>
            <span className="sm:hidden">Checkout</span>
          </>
        )}
      </Button>
      
      {/* Guest checkout info */}

      {/* Continue Shopping */}
      <Link 
        href="/products"
        className="block text-center text-xs sm:text-sm text-red-700 hover:text-red-800 font-medium transition-colors"
      >
        Continue Shopping
      </Link>

      {/* Security & Trust Badges - Hidden on mobile to save space */}
      <div className="hidden sm:block mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <SecurityIcon />
            <span>Secure SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ReturnIcon />
            <span>7-day return policy</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <SupportIcon />
            <span>Customer support available</span>
          </div>
        </div>
      </div>

      {/* Payment Methods - Compact on mobile */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">We accept</p>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
            bKash
          </div>
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
            Nagad
          </div>
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
            Rocket
          </div>
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
            Card
          </div>
          <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
            COD
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"/>
      <path d="M8 21l4-4 4 4"/>
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
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
