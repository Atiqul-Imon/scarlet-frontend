"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { HomeIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const handleRefresh = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Illustration */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            {/* Error themed design */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-32 h-32 text-red-300" />
            </div>
            <div className="absolute top-8 right-8 w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
              <div className="text-2xl">⚠️</div>
            </div>
            <div className="absolute bottom-8 left-8 w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <div className="text-xl">💥</div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="text-3xl">❌</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Oops! An unexpected error occurred. Don't worry, our beauty experts are on it! 
          Please try again or contact support if the problem persists.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-sm text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

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

        {/* Error Information */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happened?
          </h3>
          <div className="text-left space-y-3 text-gray-600">
            <p>
              • An unexpected error occurred while loading the page
            </p>
            <p>
              • This might be due to a temporary network issue
            </p>
            <p>
              • Your data and account information are safe
            </p>
            <p>
              • Try refreshing the page or going back to the homepage
            </p>
          </div>
        </div>

        {/* Helpful Actions */}
        <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            What you can do
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowPathIcon className="w-6 h-6 text-red-700" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Try Again</h4>
              <p className="text-sm text-gray-600">
                Refresh the page to retry
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
            If this problem continues, please contact our support team.
          </p>
          <Link 
            href="/contact" 
            className="text-red-700 hover:text-red-800 font-medium underline"
          >
            Get Help
          </Link>
        </div>
      </div>
    </div>
  );
}
