"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, BuildingOfficeIcon, UserGroupIcon, HeartIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
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
              <BuildingOfficeIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">About Scarlet Unlimited</h1>
              <p className="text-gray-600">Your trusted beauty and skincare destination</p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-8 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bringing Beauty to Your Doorstep
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Scarlet Unlimited is Bangladesh's premier destination for authentic beauty and skincare products. 
              We curate the finest collection of K-beauty essentials, premium international brands, 
              and local favorites to help you look and feel your best.
            </p>
          </div>
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <BuildingOfficeIcon className="w-6 h-6 text-red-700" />
              Company Information
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Registered Business Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Company Name:</strong> Scarlet Unlimited</p>
                  <p className="text-gray-700 mb-2"><strong>Trade License No:</strong> TRAD/DNCC/050622/2023</p>
                  <p className="text-gray-700 mb-2"><strong>TIN Certificate No:</strong> (To be updated)</p>
                  <p className="text-gray-700 mb-2"><strong>Registered Address:</strong> 3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka</p>
                  <p className="text-gray-700 mb-2"><strong>Business Owner:</strong> Nabila Sultana</p>
                  <p className="text-gray-700 mb-2"><strong>Business Start Date:</strong> November 15, 2021</p>
                  <p className="text-gray-700"><strong>License Valid Until:</strong> June 30, 2026</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> nabilasultana0000@gmail.com</p>
                  <p><strong>Phone:</strong> +880 1407 000543</p>
                  <p><strong>Business Hours:</strong> Mon-Fri: 9:00 AM - 6:00 PM, Sat-Sun: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-red-700" />
              Management Team
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-200 pl-4">
                <h4 className="font-semibold text-gray-900">Business Owner</h4>
                <p className="text-gray-700">Nabila Sultana - Leading the company's strategic vision and growth initiatives</p>
              </div>
              <div className="border-l-4 border-red-200 pl-4">
                <h4 className="font-semibold text-gray-900">Operations Manager</h4>
                <p className="text-gray-700">Overseeing daily operations and customer experience excellence</p>
              </div>
              <div className="border-l-4 border-red-200 pl-4">
                <h4 className="font-semibold text-gray-900">Product Curation Specialist</h4>
                <p className="text-gray-700">Ensuring authentic and high-quality product selection</p>
              </div>
              <div className="border-l-4 border-red-200 pl-4">
                <h4 className="font-semibold text-gray-900">Customer Success Team</h4>
                <p className="text-gray-700">Dedicated to providing exceptional customer support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-8 h-8 text-red-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              To democratize beauty by making premium skincare and cosmetics accessible to everyone in Bangladesh, 
              while maintaining the highest standards of authenticity and quality.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-red-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Every product is carefully vetted for authenticity. We work directly with authorized distributors 
              and brands to ensure you receive genuine, high-quality products.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon className="w-8 h-8 text-red-700" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer First</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your satisfaction is our priority. From secure payment processing to reliable delivery, 
              we ensure a seamless shopping experience every time.
            </p>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Delivery Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-3">Inside Dhaka</h4>
              <ul className="text-green-800 text-sm space-y-2">
                <li>• Delivery Time: 5 working days</li>
                
                <li>• Real-time tracking available</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Outside Dhaka</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Delivery Time: 10 working days</li>
                <li>• Nationwide coverage</li>
                <li>• Secure packaging guaranteed</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Our Story</h3>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded with a passion for beauty and a commitment to authenticity, Scarlet Unlimited began as a small 
              venture to bring Korean beauty products to Bangladesh. What started as a personal mission to find genuine 
              skincare products has grown into Bangladesh's most trusted beauty destination.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our journey began when our founders struggled to find authentic K-beauty products in Bangladesh. 
              Frustrated by counterfeit products and unreliable sources, we decided to create a platform that 
              guarantees authenticity and quality.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Today, Scarlet Unlimited partners with over 50 international brands and serves thousands of customers 
              across Bangladesh. We've expanded our product range to include not just K-beauty, but also premium 
              international brands, local favorites, and exclusive collections.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our commitment remains the same: to provide authentic, high-quality beauty products with exceptional 
              customer service, making beauty accessible to everyone.
            </p>
          </div>
        </div>

        {/* Certifications & Compliance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Certifications & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal Compliance</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Registered with Dhaka North City Corporation (DNCC)</li>
                <li>• Compliant with Bangladesh E-commerce Guidelines</li>
                <li>• SSL Commerce Payment Gateway Certified</li>
                <li>• Data Protection and Privacy Compliant</li>
                <li>• Trade License Valid Until: June 30, 2026</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quality Certifications</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Authorized Distributor for Major Beauty Brands</li>
                <li>• ISO 9001:2015 Quality Management System</li>
                <li>• Authentic Product Guarantee</li>
                <li>• Secure Payment Processing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-red-700 to-pink-700 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
          <p className="text-red-100 mb-6">
            Have questions about our products or services? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-red-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <Link 
              href="/products" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-red-700 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}