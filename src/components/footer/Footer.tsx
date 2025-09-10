"use client";

import React from 'react';
import Link from 'next/link';
import { 
  HeartIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-herlan py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-pink-400 mb-4">Scarlet</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Discover the finest collection of beauty and skincare products. 
                From K-beauty essentials to premium international brands, 
                we bring beauty to your doorstep.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  aria-label="Facebook"
                >
                  <span className="text-white font-bold">f</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  aria-label="Instagram"
                >
                  <span className="text-white font-bold">ig</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  aria-label="YouTube"
                >
                  <span className="text-white font-bold">yt</span>
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  aria-label="TikTok"
                >
                  <span className="text-white font-bold">tt</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-400">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-pink-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Beauty Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-400">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-pink-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-pink-400">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    123 Beauty Street<br />
                    Dhaka 1205, Bangladesh
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <a 
                  href="tel:+8801234567890" 
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  +880 1234 567 890
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <a 
                  href="mailto:hello@scarlet.com" 
                  className="text-gray-300 hover:text-pink-400 transition-colors text-sm"
                >
                  hello@scarlet.com
                </a>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                    Sat - Sun: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Free Shipping</h5>
                <p className="text-gray-400 text-sm">On orders over ৳2,000</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Easy Returns</h5>
                <p className="text-gray-400 text-sm">30-day return policy</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">Secure Payment</h5>
                <p className="text-gray-400 text-sm">100% secure checkout</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-white">24/7 Support</h5>
                <p className="text-gray-400 text-sm">Always here to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-4 text-pink-400">Stay Beautiful with Scarlet</h4>
            <p className="text-gray-300 mb-6">
              Get the latest beauty tips, exclusive offers, and new product announcements delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium">
                Subscribe
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-herlan py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} Scarlet. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Payment Methods:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                  <CreditCardIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">bK</span>
                </div>
                <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">NG</span>
                </div>
                <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
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
