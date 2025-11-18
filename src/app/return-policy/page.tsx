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
            
            {/* Bangla Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircleIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">রিটার্ন পলিসি</h2>
              </div>

              {/* Delivery Information */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">ডেলিভারি তথ্য</h3>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2 text-gray-700">
                  <p className="leading-relaxed">
                    <strong>ঢাকা শহরের ভিতরে:</strong> ৪ দিন
                  </p>
                  <p className="leading-relaxed">
                    <strong>ঢাকার বাইরে:</strong> ৫–৬ দিন
                  </p>
                </div>
              </div>

              {/* Important Instructions */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-red-600">ℹ️</span>
                  গুরুত্বপূর্ণ নির্দেশনা
                </h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1">1️⃣</span>
                    <p className="leading-relaxed">পার্সেল গ্রহণের সময় ভালোভাবে চেক করে নেবেন।</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1">2️⃣</span>
                    <p className="leading-relaxed">যদি প্রোডাক্ট ছবির মতো না হয় বা কোনো সমস্যা থাকে, তাহলে ডেলিভারি ম্যানকে কেবল ডেলিভারি চার্জ দিয়ে রিটার্ন করবেন।</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1">3️⃣</span>
                    <p className="leading-relaxed">ডেলিভারি ম্যান চলে যাওয়ার পরে কোনো অভিযোগ গ্রহণযোগ্য হবে না। এবং প্রোডাক্ট ফেরত নেয়া হবে না।</p>
                  </div>
                </div>
              </div>

              {/* Skincare Product Policy */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-pink-600">🌸</span>
                  স্কিন কেয়ার প্রোডাক্ট সম্পর্কে আমাদের নীতি
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p className="leading-relaxed">
                    আমরা ১০০% অরিজিনাল প্রোডাক্ট সরবরাহ করি। তবে কোনো প্রোডাক্ট আপনার স্কিনে স্যুট করবে কি না, সেটা আমরা গ্যারান্টি দিতে পারি না। (এটা বিশ্বের কেউই গ্যারান্টি দিতে পারে না।)
                  </p>
                  
                  <p className="leading-relaxed">
                    আমাদের থেকে কেনা স্কিন কেয়ার প্রোডাক্ট আপনার স্কিনে কাজ না করলে সেটি ফেরত দেওয়া সম্ভব নয়।
                  </p>
                  
                  <p className="leading-relaxed">
                    কসমেটিক্স ও স্কিন কেয়ার প্রোডাক্ট ব্যবহার করা হলে বা খোলা হলে কোনো অবস্থাতেই রিটার্ন বা এক্সচেঞ্জ করা হবে না।
                  </p>
                  
                  <p className="leading-relaxed">
                    আমরা শুধু এটুকু গ্যারান্টি দিচ্ছি যে প্রোডাক্ট ১০০% অরিজিনাল।
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      স্কিনে নতুন কোনো প্রোডাক্ট (যেমন ক্রিম, সিরাম, ময়েশ্চারাইজার, টোনার ইত্যাদি) ব্যবহার করার আগে প্যাচ টেস্ট (Patch Test) করা খুব জরুরি। patch টেস্ট করে নিলে আপনার স্ক্রিনের জন্য পারফেক্ট কিনা আপনি বুঝতে পারবেন।
                    </p>
                  </div>
                  
                  <p className="leading-relaxed">
                    আপনি চাইলে কেনার আগে প্রোডাক্টের গুগল/অনলাইন রিভিউ চেক করে নিতে পারেন।
                  </p>
                  
                  <p className="leading-relaxed text-red-600 font-medium">
                    আমাদের দায়িত্ব হলো আপনাকে শুধুমাত্র অরিজিনাল প্রোডাক্ট পৌঁছে দেওয়া ❤️
                  </p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-gray-300 my-12"></div>

            {/* English Section */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Return & Refund Policy</h2>
              </div>

              {/* Introduction */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  At Scarlet, we always want our customers to be fully satisfied with their purchases.
                  Please read our return and refund policy carefully before placing your order.
                </p>
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