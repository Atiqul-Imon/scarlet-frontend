/**
 * Payment API for SSLCommerz integration
 */

import { fetchJsonAuth, fetchJson } from '../api';

export interface PaymentRequest {
  orderId: string;
  amount: string;
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postcode: string;
  };
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    price: string;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    sessionKey: string;
    gatewayUrl: string;
    orderId: string;
  };
  error?: string;
}

export interface PaymentVerification {
  status: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  bankTransactionId?: string;
}

class PaymentAPI {
  /**
   * Create a payment session with SSLCommerz
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      return await fetchJsonAuth<PaymentResponse>('/payments/create', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment session',
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(sessionKey: string, orderId: string): Promise<PaymentVerification> {
    try {
      const result = await fetchJsonAuth<{ data: PaymentVerification }>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ sessionKey, orderId }),
      });
      return result.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Test SSLCommerz integration
   */
  async testIntegration(): Promise<PaymentResponse> {
    try {
      return await fetchJsonAuth<PaymentResponse>('/payments/test', {
        method: 'GET',
      });
    } catch (error) {
      console.error('Integration test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Integration test failed',
      };
    }
  }
}

export const paymentApi = new PaymentAPI();
