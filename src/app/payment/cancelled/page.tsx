'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowRightIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface PaymentCancelledData {
  tran_id?: string;
  amount?: string;
  currency?: string;
  status?: string;
}

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentCancelledData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment data from URL parameters
    const data: PaymentCancelledData = {};
    
    // SSLCommerz cancelled parameters
    const tranId = searchParams.get('tran_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');

    if (tranId) {
      data.tran_id = tranId;
      data.amount = amount || '';
      data.currency = currency || '';
      data.status = status || '';
      
      setPaymentData(data);
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-scarlet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancelled Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled ⏸️
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Your payment has been cancelled. No charges have been made to your account.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-yellow-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {paymentData.tran_id && (
                  <div>
                    <span className="font-medium text-gray-700">Transaction ID:</span>
                    <p className="text-gray-900">{paymentData.tran_id}</p>
                  </div>
                )}
                {paymentData.amount && (
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <p className="text-gray-900">৳{paymentData.amount}</p>
                  </div>
                )}
                {paymentData.status && (
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-yellow-600 font-medium">{paymentData.status}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happened?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• You chose to cancel the payment process</li>
              <li>• No money has been deducted from your account</li>
              <li>• Your items are still in your cart</li>
              <li>• You can complete the purchase anytime</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-scarlet-600 hover:bg-scarlet-700 transition-colors"
            >
              <ShoppingCartIcon className="mr-2 h-5 w-5" />
              View Cart
            </Link>
            
            <Link
              href="/checkout"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowRightIcon className="mr-2 h-5 w-5" />
              Continue Checkout
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Need help? Contact our customer support team for assistance with your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-scarlet-600"></div>
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}