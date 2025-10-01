'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { XMarkIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    status: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment data from URL parameters
    const valId = searchParams.get('val_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const tranId = searchParams.get('tran_id');
    const status = searchParams.get('status');

    if (tranId) {
      setPaymentData({
        orderId: tranId,
        status: status || 'cancelled',
        amount: amount ? parseFloat(amount) : 0,
        currency: currency || 'BDT'
      });
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-pink-600 font-medium">Processing payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Cancellation Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
              <XMarkIcon className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-lg text-gray-600">
              Your payment was cancelled. No charges have been made to your account.
            </p>
          </div>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium text-gray-900">{paymentData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">
                    {paymentData.amount.toLocaleString()} {paymentData.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {paymentData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What happened?</h3>
            <p className="text-blue-800 mb-3">
              You cancelled the payment process before it was completed. This could happen if you:
            </p>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></span>
                Clicked the "Cancel" button during payment
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></span>
                Closed the payment window before completing the transaction
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></span>
                Navigated away from the payment page
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center flex items-center justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Try Again
            </button>
            <Link
              href="/checkout"
              className="flex-1 bg-white text-pink-600 px-6 py-3 rounded-lg font-medium border border-pink-600 hover:bg-pink-50 transition-colors text-center flex items-center justify-center"
            >
              <ArrowRightIcon className="w-5 h-5 mr-2" />
              Go to Checkout
            </Link>
          </div>

          {/* Cart Information */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Cart is Still Available</h3>
            <p className="text-gray-600 mb-4">
              Your items are still in your cart and ready for checkout. You can complete your purchase at any time.
            </p>
            <Link
              href="/cart"
              className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
            >
              View Cart
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">
              Need assistance with your order?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Contact Support
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link
                href="/help"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-pink-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
