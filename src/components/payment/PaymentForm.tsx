'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCardIcon, 
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { paymentApi, paymentUtils } from '@/lib/payment-api';
import type { PaymentFormData, PaymentMethod } from '@/lib/payment-types';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

export default function PaymentForm({
  orderId,
  amount,
  currency = 'BDT',
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: PaymentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'bkash',
    amount,
    currency,
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Update amount when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, amount }));
  }, [amount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    // Phone number validation for mobile payments
    if (['bkash', 'nagad', 'rocket'].includes(formData.paymentMethod)) {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number is required';
      } else if (!paymentUtils.validatePhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid Bangladesh mobile number (01XXXXXXXXX)';
      }
    }

    // Card validation
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!paymentUtils.validateCardNumber(formData.cardNumber)) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }

      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
      }

      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }

      if (!formData.cardholderName) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    // Format phone number as user types
    const formatted = paymentUtils.formatPhoneNumber(value);
    handleInputChange('phoneNumber', formatted);
  };

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces
    const digits = value.replace(/\D/g, '');
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    handleInputChange('cardNumber', formatted);
  };

  const handleExpiryDateChange = (value: string) => {
    // Format expiry date as MM/YY
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    
    if (digits.length >= 2) {
      formatted = digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    
    handleInputChange('expiryDate', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || disabled || isLoading) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Create payment
      const paymentResponse = await paymentApi.createPayment({
        orderId,
        paymentMethod: formData.paymentMethod,
        amount: formData.amount,
        currency: formData.currency,
        returnUrl: `${window.location.origin}/payment/success?orderId=${orderId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?orderId=${orderId}`,
        metadata: {
          phoneNumber: formData.phoneNumber,
          cardNumber: formData.cardNumber ? paymentUtils.maskCardNumber(formData.cardNumber) : undefined,
          cardholderName: formData.cardholderName
        }
      });

      // Handle different payment methods
      if (formData.paymentMethod === 'cod') {
        // Cash on Delivery - no redirect needed
        setPaymentStatus('success');
        onPaymentSuccess?.(paymentResponse.paymentId);
      } else if (paymentResponse.gatewayUrl) {
        // Redirect to payment gateway
        window.location.href = paymentResponse.gatewayUrl;
      } else {
        // Verify payment immediately (for some gateways)
        const verificationResponse = await paymentApi.verifyPayment({
          paymentId: paymentResponse.paymentId
        });

        if (verificationResponse.status === 'completed') {
          setPaymentStatus('success');
          onPaymentSuccess?.(paymentResponse.paymentId);
        } else {
          throw new Error('Payment verification failed');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      onPaymentError?.(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = paymentUtils.getTotalAmount(amount, formData.paymentMethod);
  const fees = paymentUtils.calculateFees(amount, formData.paymentMethod);

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600">
          Your payment has been processed successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid gap-3">
          {['bkash', 'nagad', 'rocket', 'cod'].map((method) => {
            const isSelected = formData.paymentMethod === method;
            const methodInfo = {
              bkash: { name: 'bKash', icon: '💳', description: 'Pay with bKash' },
              nagad: { name: 'Nagad', icon: '📱', description: 'Pay with Nagad' },
              rocket: { name: 'Rocket', icon: '🚀', description: 'Pay with Rocket' },
              cod: { name: 'Cash on Delivery', icon: '💰', description: 'Pay when delivered' }
            }[method];

            return (
              <label
                key={method}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                  ${isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={isSelected}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="text-xl mr-3">{methodInfo.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{methodInfo.name}</div>
                  <div className="text-sm text-gray-500">{methodInfo.description}</div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            );
          })}
        </div>
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
        )}
      </div>

      {/* Phone Number for Mobile Payments */}
      {['bkash', 'nagad', 'rocket'].includes(formData.paymentMethod) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder="01XXXXXXXXX"
              disabled={disabled}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>
      )}

      {/* Card Details */}
      {formData.paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={disabled}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={formData.expiryDate}
                onChange={(e) => handleExpiryDateChange(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength={4}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              placeholder="John Doe"
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.cardholderName && (
              <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Amount:</span>
            <span className="font-medium">{paymentUtils.formatAmount(amount)}</span>
          </div>
          {fees > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="font-medium">{paymentUtils.formatAmount(fees)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-medium text-gray-900">Total Amount:</span>
            <span className="font-bold text-lg">{paymentUtils.formatAmount(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div>
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            disabled={disabled}
            className="mt-1 mr-3 w-4 h-4 text-red-700 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-red-700 hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" className="text-red-700 hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
        )}
      </div>

      {/* Error Message */}
      {paymentStatus === 'error' && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">
            Payment failed. Please try again or contact support.
          </span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || isLoading || !formData.agreeToTerms}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-colors
          ${disabled || isLoading || !formData.agreeToTerms
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-700 text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay ${paymentUtils.formatAmount(totalAmount)}`
        )}
      </button>
    </form>
  );
}
