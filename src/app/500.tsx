"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { HomeIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Custom500() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 500 Illustration */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            {/* Server error themed design */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <div className="text-8xl font-bold text-red-300">5</div>
            </div>
            <div className="absolute top-8 right-8 w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <div className="text-xl">⚠️</div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="text-3xl font-bold text-red-500">0</div>
            </div>
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
              <div className="text-2xl font-bold text-red-400">0</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Server Error
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Oops! Something went wrong on our end. Our beauty experts are working to fix this issue. 
          Please try again in a moment.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="lg"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" className="flex items-center gap-2">
              <HomeIcon className="w-5 h-5" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happened?
          </h3>
          <div className="text-left space-y-3 text-gray-600">
            <p>
              • Our servers encountered an unexpected error
            </p>
            <p>
              • This is usually temporary and resolves quickly
            </p>
            <p>
              • Your data and account are safe
            </p>
            <p>
              • No action is required from your end
            </p>
          </div>
        </div>

        {/* Helpful Actions */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            What you can do
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-pink-100 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Refresh</h4>
              <p className="text-sm text-gray-600">
                Try refreshing the page
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Go Home</h4>
              <p className="text-sm text-gray-600">
                Return to our homepage
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="text-xl">💬</div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Us</h4>
              <p className="text-sm text-gray-600">
                Report the issue to support
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            If this problem persists, please contact our support team.
          </p>
          <Link 
            href="/contact" 
            className="text-pink-600 hover:text-pink-700 font-medium underline"
          >
            Get Help
          </Link>
        </div>
      </div>
    </div>
  );
}
