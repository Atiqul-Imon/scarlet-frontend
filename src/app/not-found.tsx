"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { HomeIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            {/* Beauty-themed 404 design */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <div className="text-8xl font-bold text-pink-300">4</div>
            </div>
            <div className="absolute top-8 right-8 w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
              <div className="text-2xl">💄</div>
            </div>
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center">
              <div className="text-xl">✨</div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="text-3xl font-bold text-pink-500">0</div>
            </div>
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
              <div className="text-2xl font-bold text-pink-400">4</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          The page you're looking for seems to have vanished like a beauty routine! 
          Don't worry, we'll help you find what you need.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={() => window.history.back()}
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </Button>
          <Link href="/">
            <Button size="lg" className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5" />
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/skincare" 
              className="p-4 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🌿</div>
              <div className="text-sm font-medium text-gray-700">Skincare</div>
            </Link>
            <Link 
              href="/makeup" 
              className="p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💄</div>
              <div className="text-sm font-medium text-gray-700">Makeup</div>
            </Link>
            <Link 
              href="/bath-body" 
              className="p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🧴</div>
              <div className="text-sm font-medium text-gray-700">Bath & Body</div>
            </Link>
            <Link 
              href="/account" 
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium text-gray-700">My Account</div>
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Still can't find what you're looking for?
          </p>
          <Link 
            href="/contact" 
            className="text-pink-600 hover:text-pink-700 font-medium underline"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  );
}
