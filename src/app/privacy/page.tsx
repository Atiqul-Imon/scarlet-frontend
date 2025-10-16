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
              Your privacy is important to us. This policy explains how we collect, 
              use, and protect your personal information.
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
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Scarlet ("we," "our," or "us"), we are committed to protecting your privacy and 
                ensuring the security of your personal information. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our 
                website or use our services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using our website or services, you consent to the data practices described in 
                this Privacy Policy. If you do not agree with the terms of this Privacy Policy, 
                please do not use our website or services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Name and contact information (email address, phone number, mailing address)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Order history and purchase preferences</li>
                <li>Communication preferences and marketing consent</li>
                <li>Customer service interactions and feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Automatically Collected Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We automatically collect certain information when you visit our website:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referring website and search terms</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>Processing and fulfilling your orders</li>
                <li>Providing customer service and support</li>
                <li>Personalizing your shopping experience</li>
                <li>Sending order confirmations and shipping updates</li>
                <li>Marketing communications (with your consent)</li>
                <li>Improving our website and services</li>
                <li>Preventing fraud and ensuring security</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Information Sharing and Disclosure</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in our operations</li>
                <li><strong>Payment Processing:</strong> With payment processors to complete transactions</li>
                <li><strong>Shipping Partners:</strong> With shipping companies to deliver your orders</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> When you have given explicit consent to share your information</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or 
                destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li>SSL encryption for data transmission</li>
                <li>Secure servers and databases</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your browsing 
                experience and analyze website traffic. You can control cookie settings 
                through your browser preferences.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Types of cookies we use:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand website usage</li>
                <li><strong>Marketing Cookies:</strong> Used for targeted advertising</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Rights and Choices</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
              </ul>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to fulfill the 
                purposes outlined in this Privacy Policy, unless a longer retention period 
                is required or permitted by law. When we no longer need your information, 
                we will securely delete or anonymize it.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our services are not intended for children under 13 years of age. We do not 
                knowingly collect personal information from children under 13. If you are a 
                parent or guardian and believe your child has provided us with personal 
                information, please contact us immediately.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of 
                any changes by posting the new Privacy Policy on this page and updating the 
                "Last updated" date. We encourage you to review this Privacy Policy periodically 
                for any changes.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 mb-2">
                  <strong>Email:</strong> privacy@scarlet.com
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
