"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
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
              <DocumentTextIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using Scarlet Unlimited's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Company Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Scarlet Unlimited</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Registered Address:</strong> 3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka</p>
                  <p><strong>Trade License No:</strong> TRAD/DNCC/050622/2023</p>
                  <p><strong>TIN Certificate No:</strong> (To be updated)</p>
                  <p><strong>Email:</strong> info@scarletunlimited.net</p>
                  <p><strong>Business Start Date:</strong> November 15, 2021</p>
                  <p><strong>License Valid Until:</strong> June 30, 2026</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials on Scarlet Unlimited's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Information and Pricing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All product descriptions, images, and prices are subject to change without notice. We strive to provide accurate information, but we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
              </p>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Stock Information</h4>
                <p className="text-blue-800 text-sm">
                  Product stock quantities are displayed on each product page. We reserve the right to limit quantities and to discontinue products at any time.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Orders and Payment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By placing an order, you are offering to purchase a product subject to the following terms and conditions:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>All orders are subject to acceptance and availability</li>
                <li>Prices are displayed in Bangladeshi Taka (BDT) and include applicable taxes</li>
                <li>Payment must be received before order processing</li>
                <li>We accept various payment methods including bKash, Nagad, Rocket, and Credit/Debit Cards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Delivery Information</h2>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-green-900 mb-2">Delivery Timeline</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li><strong>Inside Dhaka:</strong> 5 working days</li>
                  <li><strong>Outside Dhaka:</strong> 10 working days</li>
                </ul>
                <p className="text-green-800 text-sm mt-2">
                  Delivery times are estimates and may vary due to circumstances beyond our control.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Returns and Refunds</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Return & Refund Policy</h4>
                <p className="text-yellow-800 text-sm">
                  We offer a 30-day return policy. Refunds are processed within <strong>7 to 10 working days</strong> after receiving the returned item. 
                  Please refer to our <Link href="/return-policy" className="text-red-700 hover:text-red-800 underline">Return & Refund Policy</Link> for detailed terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your privacy is important to us. Please review our <Link href="/privacy" className="text-red-700 hover:text-red-800 underline">Privacy Policy</Link>, which also governs your use of the website, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                In no event shall Scarlet Unlimited or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Scarlet Unlimited's website, even if Scarlet Unlimited or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of Bangladesh and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Scarlet Unlimited reserves the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> info@scarletunlimited.net</p>
                  <p><strong>Address:</strong> 3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}