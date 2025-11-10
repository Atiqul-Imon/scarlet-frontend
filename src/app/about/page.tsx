"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, BuildingOfficeIcon, RocketLaunchIcon, GiftIcon, ShieldCheckIcon, TruckIcon, HeartIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

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
              <h1 className="text-3xl font-bold text-gray-900">About Scarlet</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            
            {/* About Scarlet */}
            <section className="mb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                Scarlet is an online destination committed to providing high-quality products and an exceptional shopping experience for our customers. Established 2021, we have been dedicated to offering a wide range of beauty and skincare products to meet various needs and preferences.
              </p>
            </section>

            {/* Our Mission */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <RocketLaunchIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                At Scarlet, our mission is to democratize beauty by making premium skincare and cosmetics accessible to everyone in Bangladesh, while maintaining the highest standards of authenticity and quality. We strive to provide authentic, high-quality beauty products with exceptional customer service. Through our commitment to excellence and customer satisfaction, we aim to help you look and feel your best.
              </p>
            </section>

            {/* What We Offer */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <GiftIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">What We Offer</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                We specialize in offering a diverse selection of beauty and skincare products, carefully curated to ensure quality, style, and functionality. Our product range includes K-beauty essentials, premium international brands, and local favorites. Each item is selected with attention to detail and designed to meet the evolving needs of our customers.
              </p>
            </section>

            {/* Why Choose Us */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <HeartIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Why Choose Us</h2>
              </div>
              
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-green-900">Quality Assurance:</strong> We source our products from reputable suppliers and brands, ensuring high-quality standards. Every product is carefully vetted for authenticity.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <HeartIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-green-900">Exceptional Customer Service:</strong> Our dedicated customer support team is here to assist you and ensure a smooth shopping experience.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-green-900">Secure Shopping:</strong> We prioritize the security of your transactions and personal information through secure payment methods and data encryption.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <TruckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-green-900">Fast and Reliable Shipping:</strong> We aim for prompt order processing and reliable shipping to get your purchases to you swiftly.
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Our Commitment */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <HeartIcon className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Our Commitment</h2>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                We are committed to fostering lasting relationships with our customers by delivering excellence in product quality, service, and reliability. Scarlet strives to evolve continually, exploring new trends, and expanding our product range to meet your ever-changing needs.
              </p>
            </section>

            {/* Connect With Us */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <EnvelopeIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Connect With Us</h2>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Follow us on social media platforms to stay updated on our latest products, promotions, and exciting offers. Feel free to contact us for any inquiries or assistance.
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> nabilasultana0000@gmail.com</p>
                  <p><strong>Phone:</strong> +880 1407 000543</p>
                  <p><strong>Address:</strong> 3 No. West Tejturi Bazar, Lt.-3, Block-B, Do.-55, Bashundhara City, Dhaka</p>
                </div>
              </div>
            </section>

            {/* Thank You */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 rounded-lg text-center">
                <p className="text-gray-700 text-lg font-medium">
                  Thank you for choosing Scarlet. We appreciate your trust and support in our journey to provide you with exceptional products and service.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
