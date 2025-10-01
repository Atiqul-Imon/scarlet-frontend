'use client';

import React, { useState, useEffect } from 'react';
import { sslCommerzApi } from '@/lib/api';
import { CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon } from '@heroicons/react/24/outline';

interface SSLCommerzPaymentProps {
  orderId: string;
  amount: number;
  currency: string;
  onPaymentInitiated: (gatewayUrl: string) => void;
  onError: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'mobile' | 'card' | 'banking';
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bkash',
    name: 'bKash',
    icon: DevicePhoneMobileIcon,
    description: 'Pay with bKash mobile wallet',
    category: 'mobile'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    icon: DevicePhoneMobileIcon,
    description: 'Pay with Nagad mobile wallet',
    category: 'mobile'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    icon: DevicePhoneMobileIcon,
    description: 'Pay with Rocket mobile wallet',
    category: 'mobile'
  },
  {
    id: 'visa',
    name: 'Visa Card',
    icon: CreditCardIcon,
    description: 'Pay with Visa credit/debit card',
    category: 'card'
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: CreditCardIcon,
    description: 'Pay with Mastercard',
    category: 'card'
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: CreditCardIcon,
    description: 'Pay with American Express',
    category: 'card'
  },
  {
    id: 'mobilebanking',
    name: 'Mobile Banking',
    icon: BanknotesIcon,
    description: 'Pay with mobile banking',
    category: 'banking'
  },
  {
    id: 'internetbanking',
    name: 'Internet Banking',
    icon: BanknotesIcon,
    description: 'Pay with internet banking',
    category: 'banking'
  }
];

export default function SSLCommerzPayment({ 
  orderId, 
  amount, 
  currency, 
  onPaymentInitiated, 
  onError 
}: SSLCommerzPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    configured: boolean;
    sandbox: boolean;
  } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  useEffect(() => {
    checkConfigStatus();
  }, []);

  const checkConfigStatus = async () => {
    try {
      const status = await sslCommerzApi.getConfigStatus();
      setConfigStatus(status);
    } catch (error) {
      console.error('Failed to check SSL Commerz config status:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      onError('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      const response = await sslCommerzApi.createPaymentSession(orderId);
      
      // Redirect to SSL Commerz gateway
      onPaymentInitiated(response.gatewayUrl);
    } catch (error: any) {
      console.error('SSL Commerz payment initiation failed:', error);
      onError(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!configStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-2 text-gray-600">Loading payment options...</span>
      </div>
    );
  }

  if (!configStatus.configured) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 font-medium mb-2">Payment Gateway Not Configured</div>
        <p className="text-red-500 text-sm">
          SSL Commerz payment gateway is not properly configured. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount Display */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-900">
          {amount.toLocaleString()} {currency}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {configStatus.sandbox && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Sandbox Mode
            </span>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Select Payment Method</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-pink-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isSelected ? 'text-pink-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isSelected ? 'text-pink-900' : 'text-gray-900'
                    }`}>
                      {method.name}
                    </div>
                    <div className={`text-sm ${
                      isSelected ? 'text-pink-600' : 'text-gray-500'
                    }`}>
                      {method.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Button */}
      <div className="pt-4">
        <button
          onClick={handlePayment}
          disabled={loading || !selectedMethod}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            loading || !selectedMethod
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-4 focus:ring-pink-200'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay ${amount.toLocaleString()} ${currency} with ${selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.name : 'Selected Method'}`
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium">Secure Payment</p>
            <p className="mt-1">
              Your payment is processed securely through SSL Commerz. 
              {configStatus.sandbox && ' This is a test environment.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
