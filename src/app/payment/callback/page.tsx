'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { paymentApi, paymentUtils } from '@/lib/payment-api';
import type { PaymentTransaction } from '@/lib/payment-types';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  const paymentId = searchParams.get('paymentID') || searchParams.get('paymentRefId');
  const orderId = searchParams.get('orderId') || searchParams.get('merchantInvoiceNumber');
  const status = searchParams.get('status') || searchParams.get('transactionStatus');
  const trxId = searchParams.get('trxID') || searchParams.get('issuerPaymentRefNo');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'BDT';

  useEffect(() => {
    const processCallback = async () => {
      try {
        if (!paymentId) {
          setError('Payment ID not found in callback');
          setLoading(false);
          return;
        }

        // Try to get payment details
        let paymentData: PaymentTransaction;
        try {
          paymentData = await paymentApi.getPaymentStatus(paymentId);
        } catch (fetchError) {
          // If payment not found by ID, try to find by order ID
          if (orderId) {
            const payments = await paymentApi.getPaymentsByOrder(orderId);
            paymentData = payments[0];
          } else {
            throw fetchError;
          }
        }

        if (!paymentData) {
          setError('Payment not found');
          setLoading(false);
          return;
        }

        // Verify payment with gateway data
        try {
          const verificationResult = await paymentApi.verifyPayment({
            paymentId: paymentData._id,
            gatewayData: {
              paymentID: paymentId,
              orderId,
              status,
              trxID: trxId,
              amount,
              currency
            }
          });

          setPayment(verificationResult as any);
        } catch (verifyError) {
          console.error('Payment verification error:', verifyError);
          // Still show the payment data even if verification fails
          setPayment(paymentData);
        }
      } catch (err: any) {
        console.error('Callback processing error:', err);
        setError(err.message || 'Failed to process payment callback');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [paymentId, orderId, status, trxId, amount, currency]);

  const handleContinue = () => {
    if (payment?.orderId) {
      router.push(`/payment/success?paymentId=${payment._id}&orderId=${payment.orderId}`);
    } else {
      router.push('/payment/success');
    }
  };

  const handleRetry = () => {
    if (payment?.orderId) {
      router.push(`/checkout?orderId=${payment.orderId}`);
    } else {
      router.push('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Processing Error
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'We encountered an error while processing your payment. Please try again.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Try Again
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
  const isFailed = payment.status === 'failed';
  const isCancelled = payment.status === 'cancelled';

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
        ) : isFailed ? (
          <>
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment could not be processed. Please try again or use a different payment method.
            </p>
          </>
        ) : isCancelled ? (
          <>
            <XCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-gray-600 mb-6">
              You cancelled the payment process. No charges have been made to your account.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Processing
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please wait for confirmation.
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
            {payment.orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs">{payment.orderId}</span>
              </div>
            )}
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
            {trxId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{trxId}</span>
              </div>
            )}
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
          {isSuccessful ? (
            <button
              onClick={handleContinue}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Continue to Order Details
            </button>
          ) : isFailed || isCancelled ? (
            <button
              onClick={handleRetry}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Try Again
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check Status
            </button>
          )}
          
          <button
            onClick={() => router.push('/products')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
          
          {(isFailed || isCancelled) && (
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
            {isSuccessful 
              ? 'You will receive an email confirmation shortly.'
              : isFailed
                ? 'If you were charged, the amount will be refunded within 3-5 business days.'
                : isCancelled
                  ? 'No charges have been made to your account.'
                  : 'Please wait for payment confirmation.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
