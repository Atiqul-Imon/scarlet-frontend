import React from 'react';
import { DocumentTextIcon, ScaleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
              Terms of <span className="text-red-700">Service</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Please read these terms and conditions carefully before using our website 
              and services.
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
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            {/* Acceptance of Terms */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing and using the Scarlet website ("Website") and services ("Services"), 
                you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            {/* Description of Service */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Scarlet is an online beauty and skincare store that provides:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Beauty and skincare products for purchase</li>
                <li>Product information and recommendations</li>
                <li>Customer support and assistance</li>
                <li>Order processing and fulfillment</li>
                <li>Account management and order tracking</li>
                <li>Educational content and beauty tips</li>
              </ul>
            </div>

            {/* User Accounts */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To access certain features of our service, you may be required to create an account. 
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Keeping your account information up to date</li>
              </ul>
            </div>

            {/* Orders and Payment */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Orders and Payment</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Processing</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>All orders are subject to acceptance and availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Order confirmation does not guarantee product availability</li>
                <li>Prices are subject to change without notice</li>
                <li>All prices are in Bangladeshi Taka (BDT) unless otherwise stated</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Terms</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Payment is required at the time of order placement</li>
                <li>We accept major credit cards and local payment methods</li>
                <li>All payments are processed securely through encrypted channels</li>
                <li>Refunds will be processed according to our return policy</li>
                <li>Additional fees may apply for certain payment methods</li>
              </ul>
            </div>

            {/* Shipping and Delivery */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Shipping and Delivery</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Risk of loss transfers to you upon delivery</li>
                <li>We are not responsible for delays caused by shipping carriers</li>
                <li>Additional charges may apply for remote locations</li>
                <li>Signature may be required for delivery confirmation</li>
                <li>International shipping may be subject to customs duties</li>
              </ul>
            </div>

            {/* Returns and Exchanges */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Returns and Exchanges</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We offer a 30-day return policy for most items. Returns must be:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>In original packaging and condition</li>
                <li>Unused and unopened for hygiene products</li>
                <li>Returned within 30 days of delivery</li>
                <li>Accompanied by original receipt or order confirmation</li>
                <li>Subject to our approval and inspection</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                Some items are non-returnable for hygiene reasons. Please check product 
                descriptions for specific return policies.
              </p>
            </div>

            {/* Prohibited Uses */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Prohibited Uses</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may not use our service:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Intellectual Property Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The service and its original content, features, and functionality are and will 
                remain the exclusive property of Scarlet and its licensors. The service is 
                protected by copyright, trademark, and other laws. Our trademarks and trade 
                dress may not be used in connection with any product or service without our 
                prior written consent.
              </p>
            </div>

            {/* Disclaimer of Warranties */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Disclaimer of Warranties</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The information on this website is provided on an "as is" basis. To the fullest 
                extent permitted by law, Scarlet:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Excludes all representations and warranties relating to this website and its contents</li>
                <li>Does not warrant that the website will be constantly available or available at all</li>
                <li>Does not warrant that the information on this website is complete, true, accurate, or non-misleading</li>
                <li>Does not warrant that the products will meet your specific requirements</li>
              </ul>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In no event shall Scarlet, nor its directors, employees, partners, agents, 
                suppliers, or affiliates, be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including without limitation, loss of 
                profits, data, use, goodwill, or other intangible losses, resulting from 
                your use of the service.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                These Terms shall be interpreted and governed by the laws of Bangladesh, 
                without regard to its conflict of law provisions. Our failure to enforce 
                any right or provision of these Terms will not be considered a waiver of 
                those rights.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these 
                Terms at any time. If a revision is material, we will try to provide at 
                least 30 days notice prior to any new terms taking effect.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-2">
                  <strong>Email:</strong> legal@scarlet.com
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Phone:</strong> +880 1234 567 890
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Address:</strong> 123 Beauty Street, Dhaka 1205, Bangladesh
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
