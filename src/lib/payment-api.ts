import { api } from './api';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentTransaction,
  RefundTransaction,
  PaymentStats
} from './payment-types';

export const paymentApi = {
  // Create payment
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await api.post('/payments/create', data);
    return response.data;
  },

  // Verify payment
  async verifyPayment(data: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentTransaction> {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  },

  // Get payments by order
  async getPaymentsByOrder(orderId: string): Promise<PaymentTransaction[]> {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  // Get user payments
  async getUserPayments(limit = 50, skip = 0): Promise<PaymentTransaction[]> {
    const response = await api.get(`/payments/user?limit=${limit}&skip=${skip}`);
    return response.data;
  },

  // Refund payment (Admin only)
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<RefundTransaction> {
    const response = await api.post(`/payments/refund/${paymentId}`, {
      amount,
      reason: reason || 'Customer request'
    });
    return response.data;
  },

  // Get payment statistics (Admin only)
  async getPaymentStats(startDate?: string, endDate?: string): Promise<PaymentStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/payments/stats?${params.toString()}`);
    return response.data;
  }
};

// Payment utility functions
export const paymentUtils = {
  // Format amount for display
  formatAmount(amount: number, currency = 'BDT'): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Get payment method display name
  getPaymentMethodName(method: string): string {
    const methodNames: Record<string, string> = {
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      card: 'Credit/Debit Card',
      cod: 'Cash on Delivery'
    };
    return methodNames[method] || method;
  },

  // Get payment status display name
  getPaymentStatusName(status: string): string {
    const statusNames: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      partially_refunded: 'Partially Refunded'
    };
    return statusNames[status] || status;
  },

  // Get payment status color
  getPaymentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      refunded: 'text-purple-600 bg-purple-100',
      partially_refunded: 'text-orange-600 bg-orange-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  },

  // Validate phone number for mobile payments
  validatePhoneNumber(phone: string): boolean {
    // Bangladesh mobile number validation
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  },

  // Format phone number
  formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add +88 prefix if not present
    if (digits.length === 11 && digits.startsWith('01')) {
      return `+88${digits}`;
    } else if (digits.length === 13 && digits.startsWith('8801')) {
      return `+${digits}`;
    }
    
    return phone;
  },

  // Validate card number
  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and non-digits
    const digits = cardNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (13-19 digits)
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Get card type from number
  getCardType(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.startsWith('4')) {
      return 'Visa';
    } else if (digits.startsWith('5') || digits.startsWith('2')) {
      return 'Mastercard';
    } else if (digits.startsWith('3')) {
      return 'American Express';
    } else if (digits.startsWith('6')) {
      return 'Discover';
    }
    
    return 'Unknown';
  },

  // Mask card number
  maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) return cardNumber;
    
    const lastFour = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 4);
    return `${masked}${lastFour}`;
  },

  // Calculate payment fees
  calculateFees(amount: number, method: string): number {
    const feeRates: Record<string, number> = {
      bkash: 0,
      nagad: 0,
      rocket: 0,
      card: 0.025, // 2.5%
      cod: 50 // Fixed fee
    };
    
    const rate = feeRates[method] || 0;
    return method === 'cod' ? rate : amount * rate;
  },

  // Get total amount including fees
  getTotalAmount(amount: number, method: string): number {
    const fees = this.calculateFees(amount, method);
    return amount + fees;
  },

  // Check if payment method is available for amount
  isPaymentMethodAvailable(method: string, amount: number): boolean {
    const limits: Record<string, { min: number; max: number }> = {
      bkash: { min: 1, max: 25000 },
      nagad: { min: 1, max: 25000 },
      rocket: { min: 1, max: 25000 },
      card: { min: 1, max: 100000 },
      cod: { min: 1, max: 5000 }
    };
    
    const limit = limits[method];
    if (!limit) return false;
    
    return amount >= limit.min && amount <= limit.max;
  }
};
