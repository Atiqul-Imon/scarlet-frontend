'use client';

import React from 'react';
import type { AdminOrder } from '@/lib/admin-types';

interface InvoiceProps {
  order: AdminOrder;
}

export default function Invoice({ order }: InvoiceProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Company Information
  const companyInfo = {
    name: 'Scarlet Unlimited',
    address: '3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka',
    tradeLicense: 'TRAD/DNCC/050622/2023',
    email: 'nabilasultana0000@gmail.com',
    phone: '+880 1407 000543',
    website: 'www.scarletunlimited.net'
  };

  return (
    <div className="invoice-container bg-white p-8 max-w-4xl mx-auto print:p-0 print:max-w-full">
      {/* Invoice Header */}
      <div className="invoice-header mb-8 pb-6 border-b-2 border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-sm text-gray-600">Commercial Invoice</p>
          </div>
          <div className="text-right flex items-start gap-4">
            <div>
              <img 
                src="/logo/scarletlogo.png" 
                alt="Scarlet Unlimited Logo" 
                className="h-16 w-auto object-contain print:h-14"
              />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 mb-1">SCARLET UNLIMITED</div>
              <div className="text-xs text-gray-600">
                <div>{companyInfo.address}</div>
                <div className="mt-1">Trade License: {companyInfo.tradeLicense}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="invoice-details mb-8 grid grid-cols-2 gap-8">
        {/* Bill To Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Bill To:</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div className="font-semibold text-gray-900">{order.shippingAddress.name}</div>
            <div>{order.shippingAddress.address}</div>
            <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
            <div>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</div>
            <div className="mt-2">
              <div>Phone: {order.shippingAddress.phone}</div>
              {order.customer.email && <div>Email: {order.customer.email}</div>}
            </div>
          </div>
        </div>

        {/* Invoice Info Section */}
        <div className="text-right">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Invoice Number:</span>
              <span className="text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Invoice Date:</span>
              <span className="text-gray-900">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Order Date:</span>
              <span className="text-gray-900">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Payment Method:</span>
              <span className="text-gray-900 capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Payment Status:</span>
              <span className={`font-semibold ${
                order.paymentStatus === 'completed' ? 'text-green-600' :
                order.paymentStatus === 'pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            {(order as any).trackingNumber && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Tracking Number:</span>
                <span className="text-gray-900 font-mono text-xs">{(order as any).trackingNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="invoice-items mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-800">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">Item</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-900 uppercase">SKU</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-900 uppercase">Variant</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-900 uppercase">Qty</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-900 uppercase">Unit Price</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-900 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item._id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900">{item.productName}</div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{item.sku}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600">
                  {item.size || item.color ? (
                    <div>
                      {item.size && <div>Size: {item.size}</div>}
                      {item.color && <div>Color: {item.color}</div>}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center text-sm text-gray-900 font-medium">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-sm text-gray-900">৳{item.price.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">৳{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="invoice-totals mb-8">
        <div className="flex justify-end">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900 font-medium">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Discount:</span>
                  <span className="text-green-600 font-medium">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Shipping & Handling:</span>
                  <span className="text-gray-900 font-medium">৳{order.shippingCost.toLocaleString()}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Tax:</span>
                  <span className="text-gray-900 font-medium">৳{order.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-800 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                  <span className="text-lg font-bold text-gray-900">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="invoice-payment mb-8 p-4 bg-gray-50 border border-gray-200 rounded">
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">Payment Information</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <div><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</div>
          <div><strong>Payment Status:</strong> <span className={`font-semibold ${
            order.paymentStatus === 'completed' ? 'text-green-600' :
            order.paymentStatus === 'pending' ? 'text-yellow-600' :
            'text-red-600'
          }`}>{order.paymentStatus.toUpperCase()}</span></div>
          <div><strong>Amount Paid:</strong> ৳{order.total.toLocaleString()}</div>
          {order.paymentStatus === 'pending' && order.paymentMethod === 'cod' && (
            <div className="text-yellow-700 font-medium mt-2">⚠️ Payment will be collected upon delivery</div>
          )}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="invoice-terms mb-6 pt-6 border-t border-gray-300">
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Terms & Conditions</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>1. Goods once sold will not be taken back or exchanged unless there is a manufacturing defect.</p>
          <p>2. Please check the product thoroughly at the time of delivery. No complaints will be accepted after the delivery person leaves.</p>
          <p>3. For skincare products, we guarantee 100% original products. However, we cannot guarantee that the product will suit your skin.</p>
          <p>4. All prices are in Bangladeshi Taka (BDT).</p>
          <p>5. This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer pt-6 border-t-2 border-gray-800">
        <div className="grid grid-cols-2 gap-8 text-xs text-gray-600">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="/logo/scarletlogo.png" 
                alt="Scarlet Unlimited Logo" 
                className="h-8 w-auto object-contain print:h-6"
              />
              <div className="font-bold text-gray-900">SCARLET UNLIMITED</div>
            </div>
            <div>{companyInfo.address}</div>
            <div className="mt-1">Trade License: {companyInfo.tradeLicense}</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 mb-1">Contact Information</div>
            <div>Email: {companyInfo.email}</div>
            <div>Phone: {companyInfo.phone}</div>
            <div>Website: {companyInfo.website}</div>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
          <p className="mt-1">This invoice was generated on {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
}

