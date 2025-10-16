'use client';

import { useState } from 'react';
import {
  trackShipment,
  type Shipment,
  getStatusBadgeColor,
  getCourierBadgeColor,
  formatStatusLabel,
  formatCourierName,
} from '@/lib/shipping-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const data = await trackShipment(trackingNumber);
      setShipment(data);
    } catch (err: any) {
      console.error('Failed to track shipment:', err);
      setError(err?.response?.data?.error?.message || 'Shipment not found. Please check your tracking number.');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your tracking number to see the latest delivery status
          </p>
        </div>
        
        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
        
        {/* Shipment Information */}
        {shipment && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Order #{shipment.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    Tracking: {shipment.trackingNumber}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span
                    className={`px-4 py-2 text-sm rounded-full ${getStatusBadgeColor(
                      shipment.status
                    )}`}
                  >
                    {formatStatusLabel(shipment.status)}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${getCourierBadgeColor(
                      shipment.courier
                    )}`}
                  >
                    {formatCourierName(shipment.courier)}
                  </span>
                </div>
              </div>
              
              {/* Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Delivering To
                  </h3>
                  <p className="font-medium">{shipment.recipientInfo.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {shipment.recipientInfo.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {shipment.recipientInfo.area}, {shipment.recipientInfo.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    {shipment.recipientInfo.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Package Details
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Type:</span>{' '}
                      <span className="font-medium">{shipment.itemType}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Quantity:</span>{' '}
                      <span className="font-medium">{shipment.itemQuantity}</span>
                    </p>
                    {shipment.itemWeight && (
                      <p className="text-sm">
                        <span className="text-gray-600">Weight:</span>{' '}
                        <span className="font-medium">{shipment.itemWeight} kg</span>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-gray-600">Delivery Type:</span>{' '}
                      <span className="font-medium capitalize">
                        {shipment.deliveryType}
                      </span>
                    </p>
                    {shipment.isCOD && (
                      <p className="text-sm">
                        <span className="text-gray-600">Payment:</span>{' '}
                        <span className="font-medium text-green-600">
                          Cash on Delivery - ৳{shipment.codAmount}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {shipment.estimatedDelivery && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Estimated Delivery:</span>{' '}
                    {new Date(shipment.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
            
            {/* Tracking Timeline */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-6">Tracking Timeline</h2>
              <div className="space-y-6">
                {shipment.trackingHistory
                  .slice()
                  .reverse()
                  .map((track, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full mt-1 ${
                            index === 0
                              ? 'bg-red-500 ring-4 ring-red-100'
                              : 'bg-gray-300'
                          }`}
                        />
                        {index !== shipment.trackingHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 ml-1.5 mt-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                          <div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                                track.status
                              )}`}
                            >
                              {formatStatusLabel(track.status)}
                            </span>
                            <p className="text-gray-800 mt-2">{track.message}</p>
                            {track.location && (
                              <p className="text-sm text-gray-500 mt-1">
                                📍 {track.location}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(track.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Help Section */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about your delivery, please contact our
                customer support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => (window.location.href = '/contact')}>
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/account/orders')}
                >
                  View All Orders
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!shipment && !loading && !error && (
          <div className="bg-white p-12 rounded-lg shadow-lg text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Track Your Delivery</h3>
            <p className="text-gray-600">
              Enter your tracking number above to see real-time updates about your
              order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

