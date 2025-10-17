import React from 'react';
import { ScaleIcon, ShoppingCartIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScaleIcon className="w-10 h-10 text-red-700" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Terms & <span className="text-red-700">Conditions</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Please read these terms and conditions carefully before placing your order.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto">
            
            {/* General Terms */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ScaleIcon className="w-6 h-6 text-red-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">General Terms</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✓</span>
                  <span>All products, prices, and offers on Scarlet are subject to availability and may change without prior notice.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✓</span>
                  <span>Orders are confirmed after successful payment or verification by our customer support team.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✓</span>
                  <span>Scarlet reserves the right to cancel or refuse any order due to product unavailability, payment issues, or suspected fraud.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✓</span>
                  <span>By purchasing, you agree to provide accurate and complete information.</span>
                </li>
              </ul>
            </div>

            {/* Delivery Policy */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Delivery Policy</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">🚚</span>
                  <span><strong>Inside Dhaka:</strong> Delivery within <strong>3 working days</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">🚚</span>
                  <span><strong>Outside Dhaka:</strong> Delivery within <strong>5 working days</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">⚠️</span>
                  <span><strong>Important:</strong> Customers must check the product in front of the delivery man. Once the delivery is completed, no claims will be accepted.</span>
                </li>
              </ul>
            </div>

            {/* Payment Policy */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Payment Policy</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">💳</span>
                  <span>We accept payments through <strong>bKash, Nagad, Rocket, Visa, Mastercard,</strong> and <strong>Cash on Delivery (COD)</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">🔒</span>
                  <span>All online transactions are processed securely through <strong>SSL encryption</strong>.</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about these terms and conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> support@scarletunlimited.net</p>
                <p><strong>Phone:</strong> +880 1234 567 890</p>
                <p><strong>Address:</strong> Dhaka, Bangladesh</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
