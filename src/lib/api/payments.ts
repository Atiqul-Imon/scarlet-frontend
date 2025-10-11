/**
 * Payment API for SSLCommerz integration
 */

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
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-url.onrender.com' 
      : 'http://localhost:4000';
  }

  /**
   * Create a payment session with SSLCommerz
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create payment session');
      }

      return result;
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
      const response = await fetch(`${this.baseUrl}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ sessionKey, orderId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify payment');
      }

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
      const response = await fetch(`${this.baseUrl}/api/payments/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Integration test failed');
      }

      return result;
    } catch (error) {
      console.error('Integration test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Integration test failed',
      };
    }
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }
}

export const paymentApi = new PaymentAPI();
