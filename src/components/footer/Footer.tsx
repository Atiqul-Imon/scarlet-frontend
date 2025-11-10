"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
                <a 
                  href="#" 
                  className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                  aria-label="Facebook"
                >
                  <span className="text-white font-bold text-xs">f</span>
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                  aria-label="Instagram"
                >
                  <span className="text-white font-bold text-xs">ig</span>
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                  aria-label="YouTube"
                >
                  <span className="text-white font-bold text-xs">yt</span>
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors"
                  aria-label="TikTok"
                >
                  <span className="text-white font-bold text-xs">tt</span>
                </a>
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
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <a 
                  href="tel:+8801407000543" 
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  +880 1407 000543
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <a 
                  href="mailto:nabilasultana0000@gmail.com" 
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  nabilasultana0000@gmail.com
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
                <p className="text-gray-400 text-xs">
                  <strong>License Valid Until:</strong> June 30, 2026
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
            <p className="text-gray-400 text-sm">SSL Commerce Certified - Your payments are 100% secure</p>
          </div>
          
          {/* Additional Payment Info */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5">
              <CreditCardIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 text-xs font-medium">Credit/Debit Cards</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5">
              <span className="text-green-600 text-xs font-bold">bKash</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5">
              <span className="text-blue-600 text-xs font-bold">Nagad</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5">
              <span className="text-purple-600 text-xs font-bold">Rocket</span>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1.5">
              <span className="text-gray-600 text-xs font-medium">Cash on Delivery</span>
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
