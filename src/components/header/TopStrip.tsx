"use client";
import Link from 'next/link';
import { GiftIcon, QuestionMarkCircleIcon, StarIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function TopStrip() {
  return (
    <div className="w-full bg-gradient-to-r from-red-800/90 via-red-700/85 to-red-600/80 text-white py-2 relative">
      <div className="container-herlan relative z-10">
        <div className="flex items-center justify-between text-sm">
          {/* Left side - Main navigation */}
          <div className="flex items-center space-x-6">
            <Link
              href="/blog"
              className="flex items-center space-x-2 hover:text-red-100 transition-colors duration-200 group"
            >
              <BookOpenIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-semibold">Scarlet Blog</span>
            </Link>
            
            <Link
              href="/skincare-consultation"
              className="flex items-center space-x-2 hover:text-red-100 transition-colors duration-200 group"
            >
              <SparklesIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-semibold">Skincare Consultation</span>
            </Link>
            
            <Link
              href="/points"
              className="flex items-center space-x-2 hover:text-red-100 transition-colors duration-200 group"
            >
              <StarIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Points</span>
            </Link>
            
            <Link
              href="/help"
              className="flex items-center space-x-2 hover:text-red-100 transition-colors duration-200 group"
            >
              <QuestionMarkCircleIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Help</span>
            </Link>
            
            <Link
              href="/offers"
              className="flex items-center space-x-2 hover:text-red-100 transition-colors duration-200 group"
            >
              <GiftIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Offers</span>
            </Link>
          </div>

          {/* Right side - Additional info */}
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <span className="text-red-100">
              Free shipping on orders over ৳2,000
            </span>
            <span className="text-red-200">|</span>
            <span className="text-red-100">
              Same day delivery in Dhaka
            </span>
          </div>
        </div>

        {/* Mobile responsive layout */}
        <div className="md:hidden mt-2 pt-2 border-t border-red-400/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-100">
              Free shipping on orders over ৳2,000
            </span>
            <span className="text-red-200">•</span>
            <span className="text-red-100">
              Same day delivery in Dhaka
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
