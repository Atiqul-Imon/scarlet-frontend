'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../lib/context';
import logger from '../../../lib/logger';

interface PaymentSuccessData {
  tran_id?: string;
  amount?: string;
  currency?: string;
  status?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  store_amount?: string;
  currency_type?: string;
  currency_amount?: string;
  currency_rate?: string;
  base_fair?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
  risk_title?: string;
  risk_level?: string;
  APIConnect?: string;
  validated_on?: string;
  gw_version?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCleared, setCartCleared] = useState(false);

  // Clear cart on successful payment (only once)
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const status = searchParams.get('status');
    
    // Clear cart if payment is successful and cart hasn't been cleared yet
    if ((paymentSuccess === 'true' || status === 'VALID') && !cartCleared) {
      const clearCartOnSuccess = async () => {
        try {
          await clearCart();
          logger.info('Cart cleared after successful payment');
          setCartCleared(true);
          
          // Also clear any pending order ID from session storage
          sessionStorage.removeItem('scarlet_pending_order_id');
        } catch (error) {
          console.error('❌ Error clearing cart after payment:', error);
          // Continue anyway - payment was successful
        }
      };
      
      clearCartOnSuccess();
    }
  }, [searchParams, clearCart, cartCleared]);

  useEffect(() => {
    // Extract payment data from URL parameters
    const data: PaymentSuccessData = {};
    
    // SSLCommerz success parameters
    const tranId = searchParams.get('tran_id');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');
    const bankTranId = searchParams.get('bank_tran_id');
    const cardType = searchParams.get('card_type');
    const cardNo = searchParams.get('card_no');
    const storeAmount = searchParams.get('store_amount');
    const currencyType = searchParams.get('currency_type');
    const currencyAmount = searchParams.get('currency_amount');
    const currencyRate = searchParams.get('currency_rate');
    const baseFair = searchParams.get('base_fair');
    const valueA = searchParams.get('value_a');
    const valueB = searchParams.get('value_b');
    const valueC = searchParams.get('value_c');
    const valueD = searchParams.get('value_d');
    const riskTitle = searchParams.get('risk_title');
    const riskLevel = searchParams.get('risk_level');
    const apiConnect = searchParams.get('APIConnect');
    const validatedOn = searchParams.get('validated_on');
    const gwVersion = searchParams.get('gw_version');

    if (tranId) {
      data.tran_id = tranId;
      data.amount = amount || '';
      data.currency = currency || '';
      data.status = status || '';
      data.bank_tran_id = bankTranId || '';
      data.card_type = cardType || '';
      data.card_no = cardNo || '';
      data.store_amount = storeAmount || '';
      data.currency_type = currencyType || '';
      data.currency_amount = currencyAmount || '';
      data.currency_rate = currencyRate || '';
      data.base_fair = baseFair || '';
      data.value_a = valueA || '';
      data.value_b = valueB || '';
      data.value_c = valueC || '';
      data.value_d = valueD || '';
      data.risk_title = riskTitle || '';
      data.risk_level = riskLevel || '';
      data.APIConnect = apiConnect || '';
      data.validated_on = validatedOn || '';
      data.gw_version = gwVersion || '';
      
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
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase! Your payment has been processed successfully.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
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
                    <p className="text-green-600 font-medium">{paymentData.status}</p>
                  </div>
                )}
                {paymentData.bank_tran_id && (
                  <div>
                    <span className="font-medium text-gray-700">Bank Transaction ID:</span>
                    <p className="text-gray-900">{paymentData.bank_tran_id}</p>
                  </div>
                )}
                {paymentData.card_type && (
                  <div>
                    <span className="font-medium text-gray-700">Payment Method:</span>
                    <p className="text-gray-900">{paymentData.card_type}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/account/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-scarlet-600 hover:bg-scarlet-700 transition-colors"
            >
              View Your Orders
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              You will receive an email confirmation shortly. If you have any questions, 
              please contact our customer support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-scarlet-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}