"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ReturnPolicyPage() {
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
              <ArrowPathIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Return & Refund Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                At Scarlet, we always want our customers to be fully satisfied with their purchases.
                Please read our return and refund policy carefully before placing your order.
              </p>
            </div>

            {/* Return & Exchange Policy */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Return & Exchange Policy</h2>
              </div>
              
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Customers must check the product in front of the delivery man at the time of delivery.
                </p>
                
                <p className="leading-relaxed">
                  If there is any issue (wrong product, defective item, damaged or missing parts), it must be reported immediately to the delivery man.
                </p>
                
                <p className="leading-relaxed">
                  In such cases, the product must be returned instantly to the delivery man.
                </p>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-800 font-semibold">
                    After the delivery man leaves, no return, exchange, or complaint will be accepted.
                  </p>
                </div>
                
                <p className="leading-relaxed">
                  Returned items must be unused and in their original packaging and condition.
                </p>
                
                <p className="leading-relaxed">
                  Once the return is confirmed, the refund or replacement will be processed within <strong>7 to 10 working days</strong> after verification.
                </p>
              </div>
            </section>

            {/* Non-Returnable Items */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <XCircleIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Non-Returnable Items</h2>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>Products purchased under discounts, offers, or clearance sales.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>Products that have been used, washed, or damaged after delivery.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold mt-1">•</span>
                    <span>Personal care, hygiene, or intimate items (for safety reasons).</span>
                  </li>
                </ul>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}