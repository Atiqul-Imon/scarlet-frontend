'use client';

import { Button } from '@/components/ui/button';

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Check your order status and delivery information
          </p>
        </div>
        
        {/* Order Tracking Info */}
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>
          <p className="text-gray-600 mb-6">
            To check your order status, please visit your account orders page where you can see all your orders and their current status.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => (window.location.href = '/account/orders')}
              className="bg-red-600 hover:bg-red-700"
            >
              View My Orders
            </Button>
            <Button 
              variant="outline"
              onClick={() => (window.location.href = '/contact')}
            >
              Contact Support
            </Button>
          </div>
        </div>
        
        {/* Order Status Info */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Order Status Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Pending</p>
              <p className="text-gray-600">Order received</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Processing</p>
              <p className="text-gray-600">Being prepared</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Delivered</p>
              <p className="text-gray-600">Order completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

