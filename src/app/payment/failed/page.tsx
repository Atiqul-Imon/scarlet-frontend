'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircleIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PaymentFailedData {
  tran_id?: string;
  amount?: string;
  currency?: string;
  status?: string;
  error?: string;
  fail_reason?: string;
}

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentFailedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment data from URL parameters
    const data: PaymentFailedData = {};
    
    // SSLCommerz failed parameters
    const tranId = searchParams.get('tran_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');
    const error = searchParams.get('error');
    const failReason = searchParams.get('fail_reason');

    if (tranId) {
      data.tran_id = tranId;
      data.amount = amount || '';
      data.currency = currency || '';
      data.status = status || '';
      data.error = error || '';
      data.fail_reason = failReason || '';
      
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
        {/* Failed Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Failed 😞
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            We're sorry, but your payment could not be processed at this time.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-red-50 rounded-lg p-6 mb-8 text-left">
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
                    <p className="text-red-600 font-medium">{paymentData.status}</p>
                  </div>
                )}
                {paymentData.fail_reason && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Reason:</span>
                    <p className="text-red-600">{paymentData.fail_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Reasons & Solutions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Reasons for Payment Failure</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Insufficient funds:</strong> Please check your account balance</li>
              <li>• <strong>Card expired:</strong> Verify your card expiry date</li>
              <li>• <strong>Incorrect details:</strong> Double-check card number, CVV, and expiry</li>
              <li>• <strong>Network issues:</strong> Try again with a stable internet connection</li>
              <li>• <strong>Bank restrictions:</strong> Contact your bank if payment is blocked</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-scarlet-600 hover:bg-scarlet-700 transition-colors"
            >
              <ArrowPathIcon className="mr-2 h-5 w-5" />
              Try Again
            </Link>
            
            <Link
              href="/checkout"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowRightIcon className="mr-2 h-5 w-5" />
              Back to Checkout
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              If you continue to experience issues, please contact our customer support 
              with your transaction ID for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-scarlet-600"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}