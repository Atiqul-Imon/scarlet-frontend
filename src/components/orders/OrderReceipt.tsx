"use client";

import * as React from 'react';
import { Button } from '../ui/button';

interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderReceiptProps {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail?: string | undefined;
  customerPhone?: string | undefined;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentMethod: string;
  status: string;
  estimatedDelivery?: string | undefined;
  trackingNumber?: string | undefined;
  onDownload?: () => void;
  showDownloadButton?: boolean;
  className?: string;
}

export default function OrderReceipt({
  orderId,
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  items,
  subtotal,
  shipping,
  total,
  currency,
  paymentMethod,
  status,
  estimatedDelivery,
  trackingNumber,
  onDownload,
  showDownloadButton = true,
  className = ''
}: OrderReceiptProps) {
  const formatPrice = (amount: number) => {
    if (currency === 'BDT') {
      return `৳${amount.toLocaleString('en-US')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      processing: 'text-purple-600',
      shipped: 'text-orange-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
      refunded: 'text-gray-600',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Receipt Header */}
      <div className="bg-gradient-to-r from-red-700 to-purple-600 text-white p-6" style={{background: 'linear-gradient(to right, #e91e63, #9c27b0)'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scarlet Beauty</h1>
            <p className="text-red-100 text-sm">Your Beauty Destination</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Order Receipt</p>
            <p className="text-lg font-semibold">#{orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="p-6 space-y-6" style={{color: '#000000'}}>
        {/* Order Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Order Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Order ID:</span>
                <span className="font-medium" style={{color: '#000000'}}>{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Order Number:</span>
                <span className="font-medium" style={{color: '#000000'}}>#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Order Date:</span>
                <span className="font-medium" style={{color: '#000000'}}>{formatDate(orderDate)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Status:</span>
                <span className={`font-medium ${getStatusColor(status)}`} style={{color: '#000000'}}>
                  {getStatusText(status)}
                </span>
              </div>
              {trackingNumber && (
                <div className="flex justify-between">
                  <span style={{color: '#6b7280'}}>Tracking:</span>
                  <span className="font-mono text-sm" style={{color: '#000000'}}>{trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Name:</span>
                <span className="font-medium" style={{color: '#000000'}}>{customerName}</span>
              </div>
              {customerEmail && (
                <div className="flex justify-between">
                  <span style={{color: '#6b7280'}}>Email:</span>
                  <span className="font-medium" style={{color: '#000000'}}>{customerEmail}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex justify-between">
                  <span style={{color: '#6b7280'}}>Phone:</span>
                  <span className="font-medium" style={{color: '#000000'}}>{customerPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Shipping Address</h3>
          <div className="rounded-lg p-4" style={{backgroundColor: '#f9fafb'}}>
            <div className="text-sm space-y-1">
              <p className="font-medium" style={{color: '#000000'}}>{shippingAddress.name}</p>
              <p style={{color: '#000000'}}>{shippingAddress.address}</p>
              <p style={{color: '#000000'}}>{shippingAddress.area}, {shippingAddress.city} - {shippingAddress.postalCode}</p>
              <p style={{color: '#000000'}}>Phone: {shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Order Items</h3>
          <div className="rounded-lg overflow-hidden" style={{border: '1px solid #e5e7eb'}}>
            <div className="px-4 py-3" style={{backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb'}}>
              <div className="grid grid-cols-12 gap-4 text-sm font-medium" style={{color: '#374151'}}>
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
            </div>
            <div style={{borderTop: '1px solid #e5e7eb'}}>
              {items.map((item, index) => (
                <div key={index} className="px-4 py-3" style={{borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none'}}>
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-6">
                      <p className="font-medium" style={{color: '#000000'}}>{item.title}</p>
                      <p className="text-xs" style={{color: '#6b7280'}}>SKU: {item.productId}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <span style={{color: '#000000'}}>{item.quantity}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span style={{color: '#000000'}}>{formatPrice(item.price)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="font-medium" style={{color: '#000000'}}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Order Summary</h3>
          <div className="rounded-lg p-4" style={{backgroundColor: '#f9fafb'}}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Subtotal:</span>
                <span className="font-medium" style={{color: '#000000'}}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Shipping:</span>
                <span className="font-medium" style={{color: '#000000'}}>{formatPrice(shipping)}</span>
              </div>
              <div className="pt-2 mt-3" style={{borderTop: '1px solid #d1d5db'}}>
                <div className="flex justify-between text-lg font-bold">
                  <span style={{color: '#000000'}}>Total:</span>
                  <span style={{color: '#000000'}}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Payment Information</h3>
          <div className="rounded-lg p-4" style={{backgroundColor: '#f9fafb'}}>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Payment Method:</span>
                <span className="font-medium capitalize" style={{color: '#000000'}}>{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span style={{color: '#6b7280'}}>Amount Paid:</span>
                <span className="font-medium" style={{color: '#000000'}}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        {estimatedDelivery && (
          <div>
            <h3 className="text-lg font-semibold mb-3" style={{color: '#1f2937'}}>Delivery Information</h3>
            <div className="rounded-lg p-4" style={{backgroundColor: '#eff6ff'}}>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span style={{color: '#6b7280'}}>Estimated Delivery:</span>
                  <span className="font-medium" style={{color: '#000000'}}>{formatDate(estimatedDelivery)}</span>
                </div>
                {trackingNumber && (
                  <div className="flex justify-between">
                    <span style={{color: '#6b7280'}}>Tracking Number:</span>
                    <span className="font-mono font-medium" style={{color: '#000000'}}>{trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6" style={{borderTop: '1px solid #e5e7eb'}}>
          <div className="text-center text-sm space-y-2" style={{color: '#6b7280'}}>
            <p style={{color: '#000000'}}>Thank you for shopping with Scarlet Beauty!</p>
            <p style={{color: '#6b7280'}}>For any questions or concerns, please contact our customer support.</p>
            <div className="flex justify-center space-x-4 text-xs">
              <span style={{color: '#6b7280'}}>Email: support@scarletbeauty.com</span>
              <span style={{color: '#6b7280'}}>Phone: +880 1234 567890</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {showDownloadButton && onDownload && (
        <div className="px-6 py-4" style={{backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb'}}>
          <Button
            onClick={onDownload}
            className="w-full"
            variant="primary"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      )}
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
