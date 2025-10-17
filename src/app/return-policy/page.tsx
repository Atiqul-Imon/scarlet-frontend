import React from 'react';
import { ArrowPathIcon, XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowPathIcon className="w-10 h-10 text-red-700" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Return & <span className="text-red-700">Refund Policy</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              At Scarlet, we always want our customers to be fully satisfied with their purchases.
            </p>
            <p className="text-lg text-gray-600 mt-2">
              Please read our return and refund policy carefully before placing your order.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto">
            
            {/* Return & Exchange Policy */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Return & Exchange Policy</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Customers must check the product <strong>in front of the delivery man</strong> at the time of delivery.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>If there is any issue (wrong product, defective item, damaged or missing parts), it must be <strong>reported immediately</strong> to the delivery man.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>In such cases, the product must be <strong>returned instantly</strong> to the delivery man.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">⚠️</span>
                  <span className="font-semibold">After the delivery man leaves, no return, exchange, or complaint will be accepted.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Returned items must be <strong>unused and in their original packaging and condition</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Once the return is confirmed, the <strong>refund or replacement will be processed within 7 to 10 working days</strong> after verification.</span>
                </li>
              </ul>
            </div>

            {/* Non-Returnable Items */}
            <div className="mb-12 bg-white border border-red-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-6 h-6 text-red-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Non-Returnable Items</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Products purchased under <strong>discounts, offers, or clearance sales</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Products that have been <strong>used, washed, or damaged after delivery</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 mt-1">✗</span>
                  <span><strong>Personal care, hygiene, or intimate items</strong> (for safety reasons).</span>
                </li>
              </ul>
            </div>

            {/* Important Notice */}
            <div className="mb-12 bg-yellow-50 border border-yellow-300 rounded-xl p-8">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-8 h-8 text-yellow-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Important Notice</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Please inspect your order carefully upon delivery. Any issues must be raised <strong>immediately with the delivery person</strong>.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Once you accept the delivery and the delivery person leaves, we cannot process returns, exchanges, or refunds for the following reasons:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Product not as expected</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Changed mind after delivery</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Damage or defects discovered after acceptance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Returns?</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about our return and refund policy, please contact us:
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

