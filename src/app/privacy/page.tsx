"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldCheckIcon, DocumentTextIcon, LockClosedIcon, ShareIcon, KeyIcon, UserIcon, ExclamationCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
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
              <ShieldCheckIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 text-sm">This Privacy Policy was last updated on {lastUpdated}.</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                This Privacy Policy describes how Scarlet ("we," "us," or "our") collects, uses, shares, and protects the information obtained from users ("you" or "your") of our e-commerce website <a href="https://www.scarletunlimited.net" className="text-red-700 hover:text-red-800 underline">www.scarletunlimited.net</a>.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect personal information such as:
              </p>
              
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-4">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Contact information including email address, mailing address, and phone number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Payment details (secured via SSL)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>Browsing data (cookies) to improve user experience</span>
                  </li>
                </ul>
              </div>

              <p className="text-gray-700 leading-relaxed mb-2">
                We collect this information when you:
              </p>
              <ul className="text-gray-700 space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>Make a purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>Create an account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>Sign up for newsletters or promotions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>Contact our customer support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>Interact with our website through cookies and similar technologies</span>
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <LockClosedIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>To process your orders and payments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>To contact you regarding your purchase or support inquiries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>To improve our website, products, and services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">•</span>
                    <span>To prevent fraudulent activities and ensure security</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ShareIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Information Sharing</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information with:
              </p>
              
              <ol className="text-gray-700 space-y-2 ml-4 list-decimal">
                <li>Service providers who assist us in operating our website or conducting our business</li>
                <li>Third-party partners for marketing or promotional purposes</li>
                <li>Law enforcement or government agencies when required by law or to protect our rights</li>
              </ol>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <KeyIcon className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your information. However, please note that no method of transmission over the internet or electronic storage is entirely secure.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <UserIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              
              <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-1">•</span>
                    <span>Access, update, or delete your personal information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-1">•</span>
                    <span>Object to the processing of your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-1">•</span>
                    <span>Opt-out of receiving marketing communications</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Cookies</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Our website uses cookies and similar technologies to enhance your browsing experience. You can manage your cookie preferences through your browser settings.
              </p>
            </section>

            {/* Changes to This Privacy Policy */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ExclamationCircleIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Changes to This Privacy Policy</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to update or modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised policy on our website.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <EnvelopeIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us at:
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
