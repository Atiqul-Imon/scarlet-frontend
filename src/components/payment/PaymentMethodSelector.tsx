'use client';

import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { PAYMENT_METHODS, paymentUtils } from '@/lib/payment-types';
import type { PaymentMethod } from '@/lib/payment-types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
  amount: number;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  amount,
  disabled = false
}: PaymentMethodSelectorProps) {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null);

  const availableMethods = PAYMENT_METHODS.filter(method => 
    method.enabled && paymentUtils.isPaymentMethodAvailable(method.id, amount)
  );

  const getMethodFees = (method: PaymentMethod) => {
    return paymentUtils.calculateFees(amount, method);
  };

  const getTotalAmount = (method: PaymentMethod) => {
    return paymentUtils.getTotalAmount(amount, method);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Payment Method</h3>
      
      <div className="grid gap-3">
        {availableMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isHovered = hoveredMethod === method.id;
          const fees = getMethodFees(method.id);
          const total = getTotalAmount(method.id);
          const hasFees = fees > 0;

          return (
            <div
              key={method.id}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-pink-500 bg-pink-50' 
                  : isHovered 
                    ? 'border-pink-300 bg-pink-25' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !disabled && onMethodSelect(method.id)}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                {/* Method icon */}
                <div className="text-2xl">{method.icon}</div>
                
                {/* Method details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {method.name}
                    </h4>
                    <div className="text-right">
                      {hasFees ? (
                        <div className="text-xs text-gray-500">
                          <div>+{paymentUtils.formatAmount(fees)} fee</div>
                          <div className="font-medium text-gray-900">
                            {paymentUtils.formatAmount(total)} total
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-green-600 font-medium">
                          No fees
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {method.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      Processing: {method.processingTime}
                    </div>
                    
                    {method.id === 'cod' && (
                      <div className="text-xs text-orange-600 font-medium">
                        Cash only
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Method limits */}
              {method.minAmount && method.maxAmount && (
                <div className="mt-2 text-xs text-gray-400">
                  Limit: {paymentUtils.formatAmount(method.minAmount)} - {paymentUtils.formatAmount(method.maxAmount)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No available methods */}
      {availableMethods.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">💳</div>
          <p className="text-gray-500">
            No payment methods available for this amount
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Amount: {paymentUtils.formatAmount(amount)}
          </p>
        </div>
      )}

      {/* Payment method instructions */}
      {selectedMethod && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            How to pay with {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.instructions?.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="text-pink-500 mr-2">{index + 1}.</span>
                {instruction}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
