'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { paymentApi, paymentUtils } from '@/lib/payment-api';
import type { PaymentTransaction } from '@/lib/payment-types';

function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const status = searchParams.get('status');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        setError('Payment ID not found');
        setLoading(false);
        return;
      }

      try {
        // Get payment details
        const paymentData = await paymentApi.getPaymentStatus(paymentId);
        setPayment(paymentData);

        // If payment is not completed, try to verify it
        if (paymentData.status === 'pending' || paymentData.status === 'processing') {
          try {
            const verificationResult = await paymentApi.verifyPayment({
              paymentId: paymentId
            });
            
            if (verificationResult.status === 'completed') {
              setPayment(verificationResult as any);
            } else {
              setError('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            setError('Payment verification failed');
          }
        }
      } catch (err: any) {
        console.error('Payment fetch error:', err);
        setError(err.message || 'Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId]);

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleViewOrder = () => {
    if (orderId) {
      router.push(`/account/orders/${orderId}`);
    } else {
      router.push('/account/orders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'We could not verify your payment. Please contact support if you have been charged.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleContinueShopping}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuccessful = payment.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {isSuccessful ? (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
          </>
        ) : (
          <>
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment is currently {payment.status}. Please wait for confirmation or contact support if needed.
            </p>
          </>
        )}

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-mono text-xs">{payment._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs">{payment.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{paymentUtils.formatAmount(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium">{paymentUtils.getPaymentMethodName(payment.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${paymentUtils.getPaymentStatusColor(payment.status)} px-2 py-1 rounded-full text-xs`}>
                {paymentUtils.getPaymentStatusName(payment.status)}
              </span>
            </div>
            {payment.paymentDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(payment.paymentDate).toLocaleDateString('en-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isSuccessful && (
            <button
              onClick={handleViewOrder}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              View Order Details
            </button>
          )}
          <button
            onClick={handleContinueShopping}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
          {!isSuccessful && (
            <button
              onClick={() => router.push('/contact')}
              className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Contact Support
            </button>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            If you have any questions about your payment, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}
