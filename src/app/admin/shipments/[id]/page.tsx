'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getShipmentById,
  updateShipmentStatus,
  cancelShipment,
  trackShipment,
  type Shipment,
  type ShipmentStatus,
  getCourierBadgeColor,
  getStatusBadgeColor,
  formatStatusLabel,
  formatCourierName,
} from '@/lib/shipping-api';
import { Button } from '@/components/ui/button';

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState(false);
  
  const loadShipment = async () => {
    try {
      setLoading(true);
      const data = await getShipmentById(id);
      setShipment(data);
    } catch (error) {
      console.error('Failed to load shipment:', error);
      alert('Failed to load shipment');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTrack = async () => {
    if (!shipment?.trackingNumber) return;
    
    try {
      setTracking(true);
      const updated = await trackShipment(shipment.trackingNumber);
      setShipment(updated);
      alert('Tracking information updated');
    } catch (error) {
      console.error('Failed to track shipment:', error);
      alert('Failed to update tracking');
    } finally {
      setTracking(false);
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!shipment) return;
    
    const newStatus = prompt('Enter new status (e.g., in_transit, delivered):');
    if (!newStatus) return;
    
    const message = prompt('Enter status message (optional):');
    
    try {
      setUpdating(true);
      const updated = await updateShipmentStatus(
        id,
        newStatus as ShipmentStatus,
        message || undefined
      );
      setShipment(updated);
      alert('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    
    try {
      setUpdating(true);
      await cancelShipment(id);
      await loadShipment();
      alert('Shipment cancelled');
    } catch (error) {
      console.error('Failed to cancel shipment:', error);
      alert('Failed to cancel shipment');
    } finally {
      setUpdating(false);
    }
  };
  
  useEffect(() => {
    loadShipment();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading shipment...</p>
      </div>
    );
  }
  
  if (!shipment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Shipment not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="outline">
          ← Back
        </Button>
      </div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shipment Details</h1>
          <p className="text-gray-500 mt-1">Order: {shipment.orderNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleTrack} disabled={tracking} variant="outline">
            {tracking ? 'Tracking...' : 'Update Tracking'}
          </Button>
          <Button onClick={handleUpdateStatus} disabled={updating} variant="outline">
            Update Status
          </Button>
          {!['delivered', 'cancelled', 'returned'].includes(shipment.status) && (
            <Button onClick={handleCancel} disabled={updating} variant="outline">
              Cancel Shipment
            </Button>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Courier</h3>
          <div className="mt-2">
            <span
              className={`px-3 py-1 text-sm rounded-full ${getCourierBadgeColor(
                shipment.courier
              )}`}
            >
              {formatCourierName(shipment.courier)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <div className="mt-2">
            <span
              className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeColor(
                shipment.status
              )}`}
            >
              {formatStatusLabel(shipment.status)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
          <p className="text-lg font-bold mt-1">{shipment.trackingNumber || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Delivery Fee</h3>
          <p className="text-lg font-bold mt-1">৳{shipment.deliveryFee}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Name:</span>
              <p className="font-medium">{shipment.recipientInfo.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Phone:</span>
              <p className="font-medium">{shipment.recipientInfo.phone}</p>
            </div>
            {shipment.recipientInfo.email && (
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <p className="font-medium">{shipment.recipientInfo.email}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Address:</span>
              <p className="font-medium">{shipment.recipientInfo.address}</p>
              <p className="text-sm text-gray-600">
                {shipment.recipientInfo.area}, {shipment.recipientInfo.city} -{' '}
                {shipment.recipientInfo.postalCode}
              </p>
            </div>
          </div>
        </div>
        
        {/* Package Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Package Information</h2>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-500">Item Type:</span>
              <p className="font-medium">{shipment.itemType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Quantity:</span>
              <p className="font-medium">{shipment.itemQuantity}</p>
            </div>
            {shipment.itemWeight && (
              <div>
                <span className="text-sm text-gray-500">Weight:</span>
                <p className="font-medium">{shipment.itemWeight} kg</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Item Value:</span>
              <p className="font-medium">৳{shipment.itemValue}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Delivery Type:</span>
              <p className="font-medium capitalize">{shipment.deliveryType}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Payment:</span>
              <p className="font-medium">
                {shipment.isCOD ? (
                  <span className="text-green-600">
                    COD - ৳{shipment.codAmount}
                  </span>
                ) : (
                  'Prepaid'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Special Instructions */}
      {shipment.specialInstructions && (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
          <p className="text-gray-700">{shipment.specialInstructions}</p>
        </div>
      )}
      
      {/* Tracking History */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Tracking History</h2>
        <div className="space-y-4">
          {shipment.trackingHistory.map((track, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    index === 0 ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                />
              </div>
              <div className="flex-1 pb-4 border-b border-gray-200 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                        track.status
                      )}`}
                    >
                      {formatStatusLabel(track.status)}
                    </span>
                    <p className="text-gray-700 mt-2">{track.message}</p>
                    {track.location && (
                      <p className="text-sm text-gray-500 mt-1">
                        Location: {track.location}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(track.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Metadata */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Created:</span>
            <p className="font-medium">
              {new Date(shipment.createdAt).toLocaleString()}
            </p>
          </div>
          {shipment.updatedAt && (
            <div>
              <span className="text-sm text-gray-500">Last Updated:</span>
              <p className="font-medium">
                {new Date(shipment.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
          {shipment.estimatedDelivery && (
            <div>
              <span className="text-sm text-gray-500">Estimated Delivery:</span>
              <p className="font-medium">
                {new Date(shipment.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          )}
          {shipment.actualDeliveryDate && (
            <div>
              <span className="text-sm text-gray-500">Actual Delivery:</span>
              <p className="font-medium">
                {new Date(shipment.actualDeliveryDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

