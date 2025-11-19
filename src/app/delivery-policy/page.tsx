"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, TruckIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, EnvelopeIcon, ExclamationTriangleIcon, PhoneIcon } from '@heroicons/react/24/outline';

export default function DeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-herlan py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Policy</h1>
              <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Thank you for choosing Scarlet as your trusted online product provider. This Delivery Policy outlines the terms and conditions regarding the delivery of products purchased through our platform. By placing an order with us, you agree to comply with and be bound by the following policies:
              </p>
            </section>

            {/* Order Processing Time */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Order Processing Time</h2>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Orders are typically processed within <strong>1-2 business days</strong> from the date of purchase.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Processing times may vary depending on product availability and order volume.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Delivery Methods */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <TruckIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Delivery Methods</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer standard shipping services across Bangladesh. Delivery timelines vary based on your location:
              </p>
              
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <div>
                      <strong>Inside Dhaka:</strong> Standard delivery within <strong>5 working days</strong> from order processing.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <div>
                      <strong>Outside Dhaka:</strong> Standard delivery within <strong>10 working days</strong> from order processing.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <div>
                      <strong>Express Delivery:</strong> Available for urgent orders (additional charges may apply).
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Shipping Addresses */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <MapPinIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Shipping Addresses</h2>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>It is the responsibility of the customer to provide accurate and complete shipping information.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>We are not responsible for items delivered to incorrect addresses provided by the customer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-1">•</span>
                    <span>Please double-check your shipping address before confirming your order.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Shipping Restrictions */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Shipping Restrictions</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Some products may have shipping restrictions based on geographic location or local regulations. Customers are responsible for checking and complying with these restrictions before placing an order. We currently deliver to all areas within Bangladesh.
              </p>
            </section>

            {/* Delivery Confirmation */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <EnvelopeIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Delivery Confirmation</h2>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-1">•</span>
                    <span>Upon successful delivery, customers will receive a confirmation email with relevant details, including tracking information (if applicable).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-1">•</span>
                    <span>You can track your order status through your account dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-1">•</span>
                    <span>For digital products or services, delivery will be made via email or through your account on our platform.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Shipping Delays */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Shipping Delays</h2>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-2">
                  While we strive to meet all delivery timelines, unforeseen circumstances such as weather conditions, customs delays, courier service disruptions, or other external factors may cause delays. We appreciate your understanding in such situations.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In case of significant delays, we will notify you via email or phone and keep you updated on the status of your order.
                </p>
              </div>
            </section>

            {/* Returns Due to Non-Delivery */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <TruckIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Returns Due to Non-Delivery</h2>
              </div>
              
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  If a product is returned to us due to non-delivery (e.g., incorrect address provided, recipient unavailable, or refusal to accept delivery), the customer will be responsible for any additional shipping charges for re-delivery or return processing.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <PhoneIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions or concerns regarding your order or our delivery policy, please contact our customer service team:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-red-600" />
                    <strong>Email:</strong> info@scarletunlimited.net
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <strong>Address:</strong> 3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka
                    </div>
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Our customer service team is available to assist you with any delivery-related inquiries or concerns.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

