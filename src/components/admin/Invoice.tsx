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
    email: 'info@scarletunlimited.net',
    phone: '+880 1407 000543',
    website: 'www.scarletunlimited.net'
  };

  return (
    <div className="invoice-container bg-white p-6 max-w-4xl mx-auto print:p-4 print:max-w-full">
      {/* Invoice Header */}
      <div className="invoice-header mb-4 pb-3 border-b-2 border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 print:text-xl">INVOICE</h1>
            <p className="text-xs text-gray-600 print:text-xs">Commercial Invoice</p>
          </div>
          <div className="text-right flex items-start gap-3">
            <div>
              <img 
                src="/logo/scarletlogo.png" 
                alt="Scarlet Unlimited Logo" 
                className="h-12 w-auto object-contain print:h-10"
              />
            </div>
            <div className="text-xs text-gray-600">
              <div>{companyInfo.address}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="invoice-details mb-4 grid grid-cols-2 gap-6 print:mb-3 print:gap-4">
        {/* Bill To Section */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase mb-2 print:text-xs">Bill To:</h3>
          <div className="text-xs text-gray-700 space-y-0.5 print:text-xs">
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
          <div className="text-xs space-y-1 print:text-xs">
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
      <div className="invoice-items mb-4 print:mb-3">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-800">
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-900 uppercase print:py-1 print:px-1">Item</th>
              <th className="text-left py-2 px-2 text-xs font-bold text-gray-900 uppercase print:py-1 print:px-1">SKU</th>
              <th className="text-center py-2 px-2 text-xs font-bold text-gray-900 uppercase print:py-1 print:px-1">Variant</th>
              <th className="text-center py-2 px-2 text-xs font-bold text-gray-900 uppercase print:py-1 print:px-1">Qty</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-900 uppercase print:py-1 print:px-1">Unit Price</th>
              <th className="text-right py-2 px-2 text-xs font-bold text-gray-900 uppercase print:py-1 print:px-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item._id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-2 px-2 print:py-1 print:px-1">
                  <div className="font-medium text-gray-900 text-xs">{item.productName}</div>
                </td>
                <td className="py-2 px-2 text-xs text-gray-600 print:py-1 print:px-1">{item.sku}</td>
                <td className="py-2 px-2 text-center text-xs text-gray-600 print:py-1 print:px-1">
                  {item.size || item.color ? (
                    <div>
                      {item.size && <div>Size: {item.size}</div>}
                      {item.color && <div>Color: {item.color}</div>}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-2 px-2 text-center text-xs text-gray-900 font-medium print:py-1 print:px-1">{item.quantity}</td>
                <td className="py-2 px-2 text-right text-xs text-gray-900 print:py-1 print:px-1">৳{item.price.toLocaleString()}</td>
                <td className="py-2 px-2 text-right text-xs font-semibold text-gray-900 print:py-1 print:px-1">৳{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="invoice-totals mb-4 print:mb-3">
        <div className="flex justify-end">
          <div className="w-72 print:w-64">
            <div className="space-y-1 print:space-y-0.5">
              <div className="flex justify-between text-xs print:text-xs">
                <span className="text-gray-700">Subtotal:</span>
                <span className="text-gray-900 font-medium">৳{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs print:text-xs">
                  <span className="text-gray-700">Discount:</span>
                  <span className="text-green-600 font-medium">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="flex justify-between text-xs print:text-xs">
                  <span className="text-gray-700">Shipping & Handling:</span>
                  <span className="text-gray-900 font-medium">৳{order.shippingCost.toLocaleString()}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-xs print:text-xs">
                  <span className="text-gray-700">Tax:</span>
                  <span className="text-gray-900 font-medium">৳{order.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-800 pt-1 mt-1 print:pt-0.5 print:mt-0.5">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900 print:text-sm">TOTAL:</span>
                  <span className="text-base font-bold text-gray-900 print:text-sm">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="invoice-payment mb-4 p-3 bg-gray-50 border border-gray-200 rounded print:mb-3 print:p-2">
        <h3 className="text-xs font-bold text-gray-900 uppercase mb-1 print:text-xs">Payment Information</h3>
        <div className="text-xs text-gray-700 space-y-0.5 print:text-xs">
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
      <div className="invoice-terms mb-4 pt-3 border-t border-gray-300 print:mb-3 print:pt-2">
        <h3 className="text-xs font-bold text-gray-900 uppercase mb-2 print:text-xs">Terms & Conditions</h3>
        <div className="text-xs text-gray-600 space-y-0.5 print:text-xs leading-tight">
          <p>1. Goods once sold will not be taken back or exchanged unless there is a manufacturing defect.</p>
          <p>2. Please check the product thoroughly at the time of delivery. No complaints will be accepted after the delivery person leaves.</p>
          <p>3. For skincare products, we guarantee 100% original products. However, we cannot guarantee that the product will suit your skin.</p>
          <p>4. All prices are in Bangladeshi Taka (BDT).</p>
          <p>5. This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer pt-3 border-t-2 border-gray-800 print:pt-2">
        <div className="grid grid-cols-2 gap-6 text-xs text-gray-600 print:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 print:mb-0.5">
              <img 
                src="/logo/scarletlogo.png" 
                alt="Scarlet Unlimited Logo" 
                className="h-6 w-auto object-contain print:h-5"
              />
              <div className="font-bold text-gray-900 text-xs">SCARLET UNLIMITED</div>
            </div>
            <div className="text-xs">{companyInfo.address}</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 mb-0.5 text-xs print:mb-0">Contact Information</div>
            <div className="text-xs">Email: {companyInfo.email}</div>
            <div className="text-xs">Phone: {companyInfo.phone}</div>
            <div className="text-xs">Website: {companyInfo.website}</div>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500 print:mt-1">
          <p>Thank you for your business!</p>
          <p className="mt-0.5 print:mt-0">This invoice was generated on {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
}

