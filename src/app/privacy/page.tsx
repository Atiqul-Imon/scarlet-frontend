import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon className="w-10 h-10 text-red-700" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Privacy <span className="text-red-700">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your privacy is important to us. This policy explains how Scarlet collects, uses, and protects your personal information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="container-herlan">
          <div className="max-w-4xl mx-auto">
            
            {/* Company Information */}
            <div className="mb-12 bg-gradient-to-br from-red-50 to-purple-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Name: <span className="text-red-700">Scarlet</span></h2>
              <p className="text-gray-700">
                Your privacy is important to us. This Privacy Policy explains how Scarlet collects, uses, and protects your personal information.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">📝</span>
                  <span><strong>Personal Information:</strong> Name, address, mobile number, and email address.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">💳</span>
                  <span><strong>Payment Details:</strong> Payment and transaction details (secured via SSL).</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">🍪</span>
                  <span><strong>Browsing Data:</strong> Cookies to improve user experience.</span>
                </li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-green-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>To <strong>process orders and deliveries</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>To <strong>contact you</strong> regarding your purchase or support inquiries.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>To <strong>improve our website, products, and services</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>To <strong>prevent fraudulent activities</strong> and ensure security.</span>
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <LockClosedIcon className="w-6 h-6 text-purple-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Data Security</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-purple-600 mt-1">🔒</span>
                  <span><strong>SSL Encryption:</strong> All online transactions are secured via SSL encryption.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600 mt-1">🛡️</span>
                  <span><strong>Secure Storage:</strong> Your data is stored securely on protected servers.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-600 mt-1">🔐</span>
                  <span><strong>Access Control:</strong> Limited access to authorized personnel only.</span>
                </li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-orange-700" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We <strong>do not sell, trade, or rent</strong> your personal information to third parties.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We may share your information only with:
              </p>
              <ul className="mt-4 space-y-3 text-gray-700 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span><strong>Service Providers:</strong> For order processing and delivery</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span><strong>Payment Processors:</strong> For secure transaction processing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span><strong>Legal Authorities:</strong> When required by law</span>
                </li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="mb-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Access your personal information</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Request correction of inaccurate data</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Request deletion of your data</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Opt-out of marketing communications</span>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@scarletunlimited.net</p>
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
