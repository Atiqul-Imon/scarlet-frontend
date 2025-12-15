"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const SOCIAL_LINKS = [
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/@scarlet.unlimited6',
      bg: 'bg-black hover:bg-neutral-800',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-white"
          aria-hidden="true"
        >
          <path d="M23.5 7.3a6.6 6.6 0 0 1-4.8-2.1v7.5c0 4.1-3.3 7.4-7.4 7.4S3.9 16.8 3.9 12.7c0-3.9 3-7 6.9-7.3v3.9a3.4 3.4 0 0 0-3 3.4c0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.4V1h3.3c.3 1.8 1.6 3.4 3.3 3.8v2.5Z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/scarletunlimited.n',
      bg: 'bg-[#E1306C] hover:bg-[#c02657]',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-white"
          aria-hidden="true"
        >
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25ZM12 7a5 5 0 1 1-5 5 5 5 0 0 1 5-5Zm0 2a3 3 0 1 0 3 3 3 3 0 0 0-3-3Z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/@scarlet.unlimited',
      bg: 'bg-[#FF0000] hover:bg-[#cc0000]',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-white"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a2.974 2.974 0 0 0-2.1-2.1C19.675 3.5 12 3.5 12 3.5s-7.675 0-9.398.586a2.974 2.974 0 0 0-2.1 2.1A31.412 31.412 0 0 0 0 12a31.412 31.412 0 0 0 .502 5.814 2.974 2.974 0 0 0 2.1 2.1C4.325 20.5 12 20.5 12 20.5s7.675 0 9.398-.586a2.974 2.974 0 0 0 2.1-2.1A31.412 31.412 0 0 0 24 12a31.412 31.412 0 0 0-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/ScarletUnlimited',
      bg: 'bg-[#1877F2] hover:bg-[#0f5cbd]',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-white"
          aria-hidden="true"
        >
          <path d="M22.675 0H1.326A1.326 1.326 0 0 0 0 1.326v21.348A1.326 1.326 0 0 0 1.326 24h11.494v-9.294H9.692V11.09h3.128V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.764v2.315h3.59l-.467 3.616h-3.123V24h6.125A1.326 1.326 0 0 0 24 22.674V1.326A1.326 1.326 0 0 0 22.675 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-herlan py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="mb-3">
                <Image
                  src="https://res.cloudinary.com/db5yniogx/image/upload/v1760152223/scarletlogopng001_tebeai_10b44a.png"
                  alt="Scarlet"
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
              <p className="text-gray-300 leading-relaxed mb-4 text-sm">
                Discover the finest collection of beauty and skincare products. 
                From K-beauty essentials to premium international brands, 
                we bring beauty to your doorstep.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${link.bg}`}
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            {/* Easy Returns + Secure Payment badges above Quick Links */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowPathIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-white text-sm">Easy Returns</h5>
                  <p className="text-gray-400 text-xs">7-10 working days refund</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h5 className="font-semibold text-white text-sm">Secure Payment</h5>
                  <p className="text-gray-400 text-xs">SSL Commerce certified</p>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-4 text-red-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Beauty Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-red-400">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-red-400">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    3 No. West Tejturi Bazar<br />
                    Lt.-3, Block-B, Do.-55<br />
                    Bashundhara City, Dhaka
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    Shop No: 341, Khulshi Town Center<br />
                    Khulshi, Chittagong
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <a 
                  href="mailto:info@scarletunlimited.net" 
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  info@scarletunlimited.net
                </a>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                    Sat - Sun: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>

              {/* Legal Information */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-400 text-xs mb-2">
                  <strong>Trade License:</strong> TRAD/DNCC/050622/2023
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm">Fast Delivery</h5>
                <p className="text-gray-400 text-xs">Dhaka: 5 days, Outside: 10 days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white text-sm">24/7 Support</h5>
                <p className="text-gray-400 text-xs">Always here to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Banner - SSLCommerz */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-red-400 mb-2">Secure Payment Methods</h4>
            <p className="text-gray-400 text-sm mb-4">SSL Commerce Certified - Your payments are 100% secure</p>
            
            {/* SSLCommerz Payment Banner */}
            <div className="flex justify-center">
              <a 
                href="https://www.sslcommerz.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Image
                  src="/images/payment/payment-banner-jul24-v1-03.webp"
                  alt="SSLCommerz - Secure Payment Gateway"
                  width={800}
                  height={200}
                  className="h-auto w-full max-w-4xl"
                  priority
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-herlan py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-gray-400 text-xs whitespace-nowrap">
                © {currentYear} Scarlet Unlimited. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                <Link href="/about" className="hover:text-red-400 transition-colors whitespace-nowrap">
                  About Us
                </Link>
                <Link href="/privacy" className="hover:text-red-400 transition-colors whitespace-nowrap">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-red-400 transition-colors whitespace-nowrap">
                  Terms & Conditions
                </Link>
                <Link href="/return-policy" className="hover:text-red-400 transition-colors whitespace-nowrap">
                  Return & Refund Policy
                </Link>
                <Link href="/delivery-policy" className="hover:text-red-400 transition-colors whitespace-nowrap">
                  Delivery Policy
                </Link>
                <span className="whitespace-nowrap">Trade License: TRAD/DNCC/050622/2023</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-xs whitespace-nowrap">Payment Methods:</span>
              <div className="flex space-x-1.5">
                <div className="w-7 h-5 bg-gray-700 rounded flex items-center justify-center">
                  <CreditCardIcon className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="w-7 h-5 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">bK</span>
                </div>
                <div className="w-7 h-5 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">NG</span>
                </div>
                <div className="w-7 h-5 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">RM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
