'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createShipment,
  getDeliveryRates,
  type CreateShipmentRequest,
  type CourierService,
  type CourierRate,
  getCourierBadgeColor,
  formatCourierName,
} from '@/lib/shipping-api';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateShipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [loading, setLoading] = useState(false);
  const [fetchingRates, setFetchingRates] = useState(false);
  const [rates, setRates] = useState<CourierRate[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<CourierService | ''>('');
  
  // Form data
  const [formData, setFormData] = useState<CreateShipmentRequest>({
    orderId: orderId || '',
    courier: 'pathao',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    recipientAddress: '',
    recipientCity: 'Dhaka',
    recipientArea: '',
    recipientPostalCode: '',
    itemType: 'Cosmetics',
    itemQuantity: 1,
    itemWeight: 0.5,
    itemValue: 0,
    deliveryFee: 0,
    codAmount: 0,
    isCOD: false,
    specialInstructions: '',
    deliveryType: 'normal',
  });
  
  // Load order data if orderId is provided
  useEffect(() => {
    if (orderId) {
      loadOrderData(orderId);
    }
  }, [orderId]);
  
  const loadOrderData = async (id: string) => {
    try {
      const order = await adminApi.admin.getOrderById(id);
      setFormData((prev) => ({
        ...prev,
        orderId: order._id || id,
        recipientName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`.trim(),
        recipientPhone: order.shippingAddress.phone,
        recipientEmail: order.shippingAddress.email || '',
        recipientAddress: order.shippingAddress.address,
        recipientCity: order.shippingAddress.city,
        recipientArea: order.shippingAddress.area,
        recipientPostalCode: order.shippingAddress.postalCode,
        itemQuantity: order.items.length,
        itemValue: order.total,
        codAmount: order.paymentInfo.method === 'cod' ? order.total : 0,
        isCOD: order.paymentInfo.method === 'cod',
      }));
    } catch (error) {
      console.error('Failed to load order:', error);
      alert('Failed to load order data');
    }
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleGetRates = async () => {
    if (!formData.recipientCity || !formData.recipientArea) {
      alert('Please enter city and area to get rates');
      return;
    }
    
    try {
      setFetchingRates(true);
      const ratesData = await getDeliveryRates({
        city: formData.recipientCity,
        area: formData.recipientArea,
        weight: formData.itemWeight,
        codAmount: formData.isCOD ? formData.codAmount : undefined,
        deliveryType: formData.deliveryType,
      });
      setRates(ratesData.filter((r) => r.available));
    } catch (error) {
      console.error('Failed to get rates:', error);
      alert('Failed to get delivery rates');
    } finally {
      setFetchingRates(false);
    }
  };
  
  const handleSelectRate = (rate: CourierRate) => {
    setSelectedCourier(rate.courier);
    setFormData((prev) => ({
      ...prev,
      courier: rate.courier,
      deliveryFee: rate.deliveryFee,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courier) {
      alert('Please select a courier service');
      return;
    }
    
    try {
      setLoading(true);
      const shipment = await createShipment(formData);
      alert(`Shipment created successfully! Tracking: ${shipment.trackingNumber}`);
      router.push(`/admin/shipments/${shipment._id}`);
    } catch (error: any) {
      console.error('Failed to create shipment:', error);
      alert(error?.response?.data?.error?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="outline">
          ← Back
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Create Shipment</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order ID *</label>
              <Input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                required
                placeholder="Enter order ID"
              />
            </div>
          </div>
        </div>
        
        {/* Recipient Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recipient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <Input
                type="tel"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address *</label>
              <Input
                type="text"
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <Input
                type="text"
                name="recipientCity"
                value={formData.recipientCity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area *</label>
              <Input
                type="text"
                name="recipientArea"
                value={formData.recipientArea}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <Input
                type="text"
                name="recipientPostalCode"
                value={formData.recipientPostalCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Package Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Package Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Item Type *</label>
              <Input
                type="text"
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
                placeholder="e.g., Cosmetics, Clothing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <Input
                type="number"
                name="itemQuantity"
                value={formData.itemQuantity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <Input
                type="number"
                name="itemWeight"
                value={formData.itemWeight}
                onChange={handleChange}
                step="0.1"
                min="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Item Value (৳) *</label>
              <Input
                type="number"
                name="itemValue"
                value={formData.itemValue}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Type</label>
              <select
                name="deliveryType"
                value={formData.deliveryType}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="normal">Normal (2-3 days)</option>
                <option value="express">Express (1 day)</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isCOD"
                checked={formData.isCOD}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Cash on Delivery (COD)</label>
            </div>
            {formData.isCOD && (
              <div>
                <label className="block text-sm font-medium mb-1">COD Amount (৳) *</label>
                <Input
                  type="number"
                  name="codAmount"
                  value={formData.codAmount}
                  onChange={handleChange}
                  required={formData.isCOD}
                  min="0"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
                rows={3}
              />
            </div>
          </div>
        </div>
        
        {/* Delivery Rates */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Courier Service</h2>
            <Button
              type="button"
              onClick={handleGetRates}
              disabled={fetchingRates}
              variant="outline"
            >
              {fetchingRates ? 'Loading...' : 'Get Rates'}
            </Button>
          </div>
          
          {rates.length > 0 ? (
            <div className="space-y-3">
              {rates.map((rate) => (
                <div
                  key={rate.courier}
                  onClick={() => handleSelectRate(rate)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedCourier === rate.courier
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getCourierBadgeColor(
                          rate.courier
                        )}`}
                      >
                        {formatCourierName(rate.courier)}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        Estimated: {rate.estimatedDays} {rate.estimatedDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">৳{rate.deliveryFee}</div>
                      {rate.codCharge && (
                        <div className="text-sm text-gray-500">+ ৳{rate.codCharge} COD</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Total: ৳{rate.totalCharge}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Click "Get Rates" to see available courier services
            </p>
          )}
        </div>
        
        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" onClick={() => router.back()} variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !selectedCourier}>
            {loading ? 'Creating...' : 'Create Shipment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

