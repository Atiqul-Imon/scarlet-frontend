"use client";
import * as React from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  itemCount: number;
  onCheckout: () => void;
  isLoading?: boolean;
}

export default function CartSummary({
  subtotal,
  shipping,
  tax,
  total,
  currency,
  itemCount,
  onCheckout,
  isLoading = false
}: CartSummaryProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const freeShippingThreshold = 50;
  const isEligibleForFreeShipping = subtotal >= freeShippingThreshold;
  const amountForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
      
      {/* Order Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-semibold text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Banner */}
      {!isEligibleForFreeShipping && amountForFreeShipping > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ShippingIcon />
            <span className="text-sm font-medium text-pink-800">
              Add {formatPrice(amountForFreeShipping)} more for free shipping!
            </span>
          </div>
          <div className="w-full bg-pink-200 rounded-full h-2">
            <div 
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {isEligibleForFreeShipping && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-sm font-medium text-green-800">
              You qualify for free shipping!
            </span>
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0}
        className="w-full mb-4"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner />
            Processing...
          </div>
        ) : (
          'Proceed to Checkout'
        )}
      </Button>

      {/* Continue Shopping */}
      <Link 
        href="/products"
        className="block text-center text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
      >
        Continue Shopping
      </Link>

      {/* Security & Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <SecurityIcon />
            <span>Secure SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <ReturnIcon />
            <span>30-day return policy</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <SupportIcon />
            <span>24/7 customer support</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">We accept</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
            VISA
          </div>
          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
            MC
          </div>
          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
            AMEX
          </div>
          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">
            PP
          </div>
        </div>
      </div>
    </div>
  );
}

function ShippingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-600">
      <path d="M16 3h5v5"/>
      <path d="M8 3H3v5"/>
      <path d="M12 22V8"/>
      <path d="M8 18h8"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
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
