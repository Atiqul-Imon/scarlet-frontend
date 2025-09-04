export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'cod';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

export interface PaymentTransaction {
  _id: string;
  orderId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  gateway: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gatewayTransactionId?: string;
  gatewayReferenceId?: string;
  gatewayResponse?: Record<string, any>;
  paymentDate?: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  refundedAmount?: number;
  errorCode?: string;
  errorMessage?: string;
  retryCount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  gatewayUrl?: string;
  gatewayData?: Record<string, any>;
  expiresAt?: string;
}

export interface PaymentVerificationRequest {
  paymentId: string;
  gatewayData?: Record<string, any>;
}

export interface PaymentVerificationResponse {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  gatewayResponse?: Record<string, any>;
}

export interface RefundTransaction {
  _id: string;
  paymentTransactionId: string;
  refundId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  gatewayRefundId?: string;
  gatewayResponse?: Record<string, any>;
  processedAt?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalAmount: number;
  successfulAmount: number;
  failedAmount: number;
  pendingAmount: number;
  averageTransactionAmount: number;
  successRate: number;
  methodBreakdown: Record<PaymentMethod, {
    count: number;
    amount: number;
    successRate: number;
  }>;
}

// Payment method configuration
export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  minAmount?: number;
  maxAmount?: number;
  fees?: number;
  processingTime?: string;
  instructions?: string[];
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'bkash',
    name: 'bKash',
    description: 'Pay securely with your bKash account',
    icon: '💳',
    enabled: true,
    minAmount: 1,
    maxAmount: 25000,
    fees: 0,
    processingTime: 'Instant',
    instructions: [
      'Enter your bKash mobile number',
      'Confirm the payment amount',
      'Enter your bKash PIN to complete payment'
    ]
  },
  {
    id: 'nagad',
    name: 'Nagad',
    description: 'Pay securely with your Nagad account',
    icon: '📱',
    enabled: true,
    minAmount: 1,
    maxAmount: 25000,
    fees: 0,
    processingTime: 'Instant',
    instructions: [
      'Enter your Nagad mobile number',
      'Confirm the payment amount',
      'Enter your Nagad PIN to complete payment'
    ]
  },
  {
    id: 'rocket',
    name: 'Rocket',
    description: 'Pay securely with your Rocket account',
    icon: '🚀',
    enabled: true,
    minAmount: 1,
    maxAmount: 25000,
    fees: 0,
    processingTime: 'Instant',
    instructions: [
      'Enter your Rocket mobile number',
      'Confirm the payment amount',
      'Enter your Rocket PIN to complete payment'
    ]
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay with your Visa, Mastercard, or other cards',
    icon: '💳',
    enabled: false, // Not implemented yet
    minAmount: 1,
    maxAmount: 100000,
    fees: 2.5,
    processingTime: '2-3 business days',
    instructions: [
      'Enter your card details',
      'Verify with your bank',
      'Complete the payment'
    ]
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order is delivered',
    icon: '💰',
    enabled: true,
    minAmount: 1,
    maxAmount: 5000,
    fees: 50,
    processingTime: 'On delivery',
    instructions: [
      'Place your order',
      'Pay when the delivery person arrives',
      'Cash payment only'
    ]
  }
];

// Payment validation
export interface PaymentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Payment form data
export interface PaymentFormData {
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  phoneNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  agreeToTerms: boolean;
}

// Payment callback data
export interface PaymentCallbackData {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  errorMessage?: string;
}
